"use server";

import { db } from "@/lib/db";
import { workflows, workflow_executions, tasks, workspaces, cards, board_columns, client_companies, conversations, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email";

/**
 * Trigger workflows based on an event
 * @param eventType - Type of event (invoice_paid, new_client, task_completed)
 * @param triggerData - Data from the event (invoice_id, client_id, etc.)
 */
export async function triggerWorkflows(
    eventType: string,
    triggerData: any
) {
    try {
        // Find all enabled workflows that match this trigger type
        const matchingWorkflows = await db.query.workflows.findMany({
            where: and(
                eq(workflows.enabled, true),
            )
        });

        // Filter by trigger type and config conditions
        const filtered = matchingWorkflows.filter((w: any) => {
            // Check trigger type match
            if (w.trigger.type !== eventType) return false;

            // Check trigger config conditions
            const triggerConfig = w.trigger.config || {};
            
            // Invoice Paid: check client_id and amount_threshold
            if (eventType === "invoice_paid") {
                if (triggerConfig.client_id && triggerData.client_id !== triggerConfig.client_id) {
                    return false;
                }
                if (triggerConfig.amount_threshold && triggerData.amount < triggerConfig.amount_threshold) {
                    return false;
                }
            }

            // Funnel Step Completed: check funnel_id and step_type
            if (eventType === "funnel_step_completed") {
                if (triggerConfig.funnel_id && triggerData.funnel_id !== triggerConfig.funnel_id) {
                    return false;
                }
                if (triggerConfig.step_type && triggerData.step_type !== triggerConfig.step_type) {
                    return false;
                }
            }

            // Task Completed: check task_id
            if (eventType === "task_completed") {
                if (triggerConfig.task_id && triggerData.task_id !== triggerConfig.task_id) {
                    return false;
                }
            }

            // Due Date Approaching: check days_before (handled by scheduler, not here)
            
            return true;
        });

        // Execute each matching workflow
        for (const workflow of filtered) {
            await executeWorkflow(workflow, triggerData);
        }
    } catch (error) {
        console.error("Failed to trigger workflows:", error);
    }
}

/**
 * Execute a single workflow
 */
async function executeWorkflow(workflow: any, triggerData: any) {
    const executionId = crypto.randomUUID();

    try {
        // Create execution record
        await db.insert(workflow_executions).values({
            id: executionId,
            workflow_id: workflow.id,
            trigger_data: triggerData,
            status: "running"
        });

        const actionResults = [];

        // Execute actions sequentially
        for (const action of workflow.actions) {
            try {
                let result;

                switch (action.type) {
                    case 'send_email':
                        result = await executeSendEmailAction(action.config, triggerData);
                        break;
                    case 'create_task':
                        result = await executeCreateTaskAction(action.config, triggerData);
                        break;
                    case 'move_card':
                        result = await executeMoveCardAction(action.config, triggerData);
                        break;
                    case 'send_chat_message':
                        result = await executeSendChatMessageAction(action.config, triggerData);
                        break;
                    default:
                        result = { success: false, error: `Unknown action type: ${action.type}` };
                }

                actionResults.push({
                    action_type: action.type,
                    ...result
                });
            } catch (actionError) {
                actionResults.push({
                    action_type: action.type,
                    success: false,
                    error: String(actionError)
                });
            }
        }

        // Update execution record with results
        await db.update(workflow_executions)
            .set({
                status: "completed",
                result: { action_results: actionResults }
            })
            .where(eq(workflow_executions.id, executionId));

    } catch (error) {
        // Update execution record with error
        await db.update(workflow_executions)
            .set({
                status: "failed",
                error_message: String(error)
            })
            .where(eq(workflow_executions.id, executionId));
    }
}

/**
 * Execute Send Email action
 */
async function executeSendEmailAction(config: any, triggerData: any) {
    try {
        const { recipient, message, subject, email } = config;

        // Determine recipient email
        let recipientEmail = email;
        
        if (recipient === "client" && triggerData.client_id) {
            const client = await db.query.client_companies.findFirst({
                where: eq(client_companies.id, triggerData.client_id)
            });
            recipientEmail = client?.email;
        } else if (recipient === "assigned_user" && triggerData.assigned_user_id) {
            // TODO: Get user email from user_id
            recipientEmail = null;
        } else if (recipient === "custom") {
            recipientEmail = email;
        }

        if (!recipientEmail) {
            return { success: false, error: "Recipient email not found" };
        }

        // Replace template variables with actual data
        let emailBody = message || "";
        let emailSubject = subject || "Notification";

        // Get client name if available
        if (triggerData.client_id) {
            const client = await db.query.client_companies.findFirst({
                where: eq(client_companies.id, triggerData.client_id)
            });
            if (client) {
                triggerData.client_name = client.name || client.company_name || "Client";
            }
        }

        // Simple template variable replacement
        Object.keys(triggerData).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = triggerData[key] || '';
            emailBody = emailBody.replace(new RegExp(placeholder, 'g'), String(value));
            emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), String(value));
        });

        // Send email
        await sendEmail({
            to: recipientEmail,
            subject: emailSubject,
            html: emailBody
        });

        return { success: true, message: `Email sent to ${recipientEmail}` };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Execute Create Task action
 */
async function executeCreateTaskAction(config: any, triggerData: any) {
    try {
        const { title, description, due_date_offset } = config;

        // Replace template variables in title and description
        let taskTitle = title || "";
        let taskDescription = description || "";

        // Get client name if available
        if (triggerData.client_id) {
            const client = await db.query.client_companies.findFirst({
                where: eq(client_companies.id, triggerData.client_id)
            });
            if (client) {
                triggerData.client_name = client.name || client.company_name || "Client";
            }
        }

        Object.keys(triggerData).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = triggerData[key] || '';
            taskTitle = taskTitle.replace(new RegExp(placeholder, 'g'), String(value));
            taskDescription = taskDescription.replace(new RegExp(placeholder, 'g'), String(value));
        });

        // Calculate due date if offset is provided
        let dueDate = null;
        if (due_date_offset) {
            const offsetDays = parseInt(due_date_offset) || 0;
            dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + offsetDays);
        }

        // Create task
        const [newTask] = await db.insert(tasks).values({
            workspace_id: triggerData.workspace_id,
            title: taskTitle,
            description: taskDescription,
            priority: 'medium',
            client_id: triggerData.client_id || null,
            status: 'todo',
            due_date: dueDate,
            assignee_ids: null
        }).returning();

        return { success: true, message: `Task created: ${newTask.id}`, task_id: newTask.id };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Execute Move Card action
 */
async function executeMoveCardAction(config: any, triggerData: any) {
    try {
        const { board_id, column_id } = config;

        if (!board_id || !column_id) {
            return { success: false, error: "Board ID and Column ID are required" };
        }

        // Find card by client_id
        if (!triggerData.client_id) {
            return { success: false, error: "Client ID is required to move card" };
        }

        const card = await db.query.cards.findFirst({
            where: eq(cards.client_id, triggerData.client_id)
        });

        if (!card) {
            return { success: false, error: "Card not found for this client" };
        }

        // Update card column
        await db.update(cards)
            .set({ column_id: column_id })
            .where(eq(cards.id, card.id));

        return { success: true, message: `Card moved to column ${column_id}` };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Execute Send Chat Message action
 */
async function executeSendChatMessageAction(config: any, triggerData: any) {
    try {
        const { message, client_space_id } = config;

        if (!message) {
            return { success: false, error: "Message is required" };
        }

        // Get client name if available
        if (triggerData.client_id) {
            const client = await db.query.client_companies.findFirst({
                where: eq(client_companies.id, triggerData.client_id)
            });
            if (client) {
                triggerData.client_name = client.name || client.company_name || "Client";
            }
        }

        // Replace template variables
        let messageText = message;
        Object.keys(triggerData).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = triggerData[key] || '';
            messageText = messageText.replace(new RegExp(placeholder, 'g'), String(value));
        });

        // Find or create conversation
        let conversation;
        if (client_space_id) {
            conversation = await db.query.conversations.findFirst({
                where: eq(conversations.client_space_id, client_space_id)
            });

            if (!conversation) {
                const [newConversation] = await db.insert(conversations).values({
                    workspace_id: triggerData.workspace_id,
                    client_space_id: client_space_id,
                    title: "Workflow Message"
                }).returning();
                conversation = newConversation;
            }
        } else {
            // Send to all client spaces for this client
            // TODO: Implement sending to all client spaces
            return { success: false, error: "Sending to all client spaces not yet implemented" };
        }

        // Create message (using system user or workflow user)
        await db.insert(messages).values({
            conversation_id: conversation.id,
            user_id: triggerData.workspace_id, // Using workspace_id as placeholder, should be system user
            content: messageText
        });

        return { success: true, message: `Chat message sent to conversation ${conversation.id}` };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}
