"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AutomationAction {
    id: string;
    type: string;
    config: Record<string, any>;
}

interface StepConfigAutomationProps {
    config: any;
    onUpdate: (config: any) => void;
}

const actionTypes = [
    { value: "create_client", label: "Create Client" },
    { value: "create_board_card", label: "Create Board Card" },
    { value: "send_email", label: "Send Email" },
    { value: "send_chat", label: "Send Chat Message" },
];

export function StepConfigAutomation({ config, onUpdate }: StepConfigAutomationProps) {
    const [actions, setActions] = useState<AutomationAction[]>(config.actions || []);

    useEffect(() => {
        onUpdate({ actions });
    }, [actions]);

    const addAction = () => {
        setActions([
            ...actions,
            {
                id: `action-${Date.now()}`,
                type: "create_client",
                config: {},
            },
        ]);
    };

    const updateAction = (id: string, updates: Partial<AutomationAction>) => {
        setActions(actions.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    };

    const removeAction = (id: string) => {
        setActions(actions.filter((a) => a.id !== id));
    };

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-slate-900 dark:text-white mb-2 block">
                    Automation Actions
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Configure actions that will run automatically when this step is completed.
                </p>
            </div>

            <div className="space-y-4">
                {actions.map((action, index) => (
                    <div
                        key={action.id}
                        className="p-4 border rounded-md space-y-3 bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                Action {index + 1}
                            </span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeAction(action.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-900 dark:text-white">Action Type</Label>
                            <Select
                                value={action.type}
                                onValueChange={(value) => updateAction(action.id, { type: value })}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    {actionTypes.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                            className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700"
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Action-specific configuration would go here */}
                    </div>
                ))}
            </div>

            <Button
                variant="outline"
                onClick={addAction}
                className="w-full bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Action
            </Button>
        </div>
    );
}

