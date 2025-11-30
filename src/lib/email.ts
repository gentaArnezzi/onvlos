import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Email service configuration
const emailProvider = process.env.EMAIL_PROVIDER || 'smtp'; // 'smtp' or 'resend'

// SMTP Configuration (only create if credentials are available)
const smtpTransporter = (process.env.SMTP_USER && process.env.SMTP_PASSWORD) 
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

// Resend Configuration
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email templates
export const emailTemplates = {
  welcome: (userName: string, loginUrl: string) => ({
    subject: 'Welcome to OnboardHub!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to OnboardHub!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for joining OnboardHub. We're excited to have you on board!</p>
              <p>OnboardHub is your all-in-one platform for client management, project tracking, and seamless collaboration.</p>
              <p>Get started by logging in to your account:</p>
              <center><a href="${loginUrl}" class="button">Login to Dashboard</a></center>
              <p>If you have any questions, feel free to reply to this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 OnboardHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  clientInvite: (clientName: string, portalUrl: string, password: string) => ({
    subject: 'You\'ve been invited to your client portal',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #0731c2; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .credentials { background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #0731c2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Your Client Portal</h1>
            </div>
            <div class="content">
              <h2>Hello ${clientName}!</h2>
              <p>You've been invited to access your personalized client portal where you can:</p>
              <ul>
                <li>View and manage your projects</li>
                <li>Access important files and documents</li>
                <li>Communicate with our team</li>
                <li>Track invoices and payments</li>
              </ul>
              <div class="credentials">
                <strong>Your Login Credentials:</strong><br/>
                Portal URL: ${portalUrl}<br/>
                Email: Your registered email<br/>
                Temporary Password: <code>${password}</code><br/>
                <small>Please change your password after first login</small>
              </div>
              <center><a href="${portalUrl}" class="button">Access Your Portal</a></center>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  invoiceCreated: (clientName: string, invoiceNumber: string, amount: string, dueDate: string, viewUrl: string) => ({
    subject: `New Invoice #${invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .invoice-details { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Invoice</h1>
            </div>
            <div class="content">
              <h2>Hello ${clientName},</h2>
              <p>A new invoice has been generated for your account:</p>
              <div class="invoice-details">
                <strong>Invoice Number:</strong> #${invoiceNumber}<br/>
                <strong>Amount:</strong> ${amount}<br/>
                <strong>Due Date:</strong> ${dueDate}
              </div>
              <center><a href="${viewUrl}" class="button">View Invoice</a></center>
              <p>Please review and process payment by the due date.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  taskAssigned: (userName: string, taskTitle: string, dueDate: string, viewUrl: string) => ({
    subject: `New Task Assigned: ${taskTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
            .header { background: #0731c2; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .task-box { background: #f3f4f6; padding: 15px; border-left: 4px solid #0731c2; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #0731c2; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Task Assignment</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>You have been assigned a new task:</p>
              <div class="task-box">
                <strong>${taskTitle}</strong><br/>
                Due Date: ${dueDate}
              </div>
              <center><a href="${viewUrl}" class="button">View Task</a></center>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  paymentReceived: (clientName: string, invoiceNumber: string, amount: string) => ({
    subject: `Payment Received for Invoice #${invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .success-box { background: #d1fae5; border: 1px solid #10b981; padding: 20px; border-radius: 5px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmation</h1>
            </div>
            <div class="content">
              <h2>Thank you, ${clientName}!</h2>
              <div class="success-box">
                <h3>✓ Payment Received</h3>
                <p>Invoice #${invoiceNumber}<br/>
                Amount: ${amount}</p>
              </div>
              <p>Your payment has been successfully processed. Thank you for your prompt payment!</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  funnelCompletion: (clientName: string, funnelName: string, portalUrl: string) => ({
    subject: `Funnel Completed: ${funnelName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Funnel Completed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${clientName},</h2>
              <p>Congratulations! You have successfully completed the funnel: <strong>${funnelName}</strong></p>
              <p>All required steps have been completed and your information has been processed.</p>
              <center><a href="${portalUrl}" class="button">View Your Portal</a></center>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  proposalSent: (clientName: string, proposalTitle: string, viewUrl: string) => ({
    subject: `New Proposal: ${proposalTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #0731c2; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .proposal-box { background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #0731c2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Proposal</h1>
            </div>
            <div class="content">
              <h2>Hello ${clientName},</h2>
              <p>A new proposal has been sent to you for review:</p>
              <div class="proposal-box">
                <strong>${proposalTitle}</strong>
              </div>
              <center><a href="${viewUrl}" class="button">View Proposal</a></center>
              <p>Please review the proposal and let us know if you have any questions.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  contractSigned: (clientName: string, contractTitle: string, viewUrl: string) => ({
    subject: `Contract Signed: ${contractTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .success-box { background: #d1fae5; border: 1px solid #10b981; padding: 20px; border-radius: 5px; text-align: center; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Contract Signed</h1>
            </div>
            <div class="content">
              <h2>Hello ${clientName},</h2>
              <div class="success-box">
                <h3>✓ Contract Successfully Signed</h3>
                <p><strong>${contractTitle}</strong></p>
              </div>
              <p>The contract has been fully signed by all parties and is now active.</p>
              <center><a href="${viewUrl}" class="button">View Contract</a></center>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  passwordReset: (userName: string, resetUrl: string) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .warning { background: #fef2f2; border: 1px solid #ef4444; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>You have requested to reset your password. Click the button below to create a new password:</p>
              <center><a href="${resetUrl}" class="button">Reset Password</a></center>
              <div class="warning">
                <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  emailVerification: (userName: string, verificationUrl: string) => ({
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #0731c2; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #0731c2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <center><a href="${verificationUrl}" class="button">Verify Email</a></center>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};

// Main email sending function
export async function sendEmail(
  to: string,
  template: keyof typeof emailTemplates,
  data: any
) {
  try {
    // Get the template function and call it with the data object
    let emailContent: { subject: string; html: string };
    
    switch(template) {
      case 'welcome':
        emailContent = emailTemplates.welcome(data.userName, data.loginUrl);
        break;
      case 'clientInvite':
        emailContent = emailTemplates.clientInvite(data.clientName, data.portalUrl, data.password);
        break;
      case 'invoiceCreated':
        emailContent = emailTemplates.invoiceCreated(data.clientName, data.invoiceNumber, data.amount, data.dueDate, data.viewUrl);
        break;
      case 'taskAssigned':
        emailContent = emailTemplates.taskAssigned(data.userName, data.taskTitle, data.dueDate, data.viewUrl);
        break;
      case 'paymentReceived':
        emailContent = emailTemplates.paymentReceived(data.clientName, data.invoiceNumber, data.amount);
        break;
      case 'funnelCompletion':
        emailContent = emailTemplates.funnelCompletion(data.clientName, data.funnelName, data.portalUrl);
        break;
      case 'proposalSent':
        emailContent = emailTemplates.proposalSent(data.clientName, data.proposalTitle, data.viewUrl);
        break;
      case 'contractSigned':
        emailContent = emailTemplates.contractSigned(data.clientName, data.contractTitle, data.viewUrl);
        break;
      case 'passwordReset':
        emailContent = emailTemplates.passwordReset(data.userName, data.resetUrl);
        break;
      case 'emailVerification':
        emailContent = emailTemplates.emailVerification(data.userName, data.verificationUrl);
        break;
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
    const from = process.env.EMAIL_FROM || 'noreply@onboardhub.com';

    // Prioritize Resend, fallback to SMTP
    if (resend) {
      try {
        // Use Resend as primary
        const result = await resend.emails.send({
          from,
          to,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        return { success: true, messageId: result.data?.id, provider: 'resend' };
      } catch (resendError) {
        console.warn('Resend failed, trying SMTP fallback:', resendError);
        // Fallback to SMTP if Resend fails
        if (smtpTransporter) {
          try {
            const result = await smtpTransporter.sendMail({
              from,
              to,
              subject: emailContent.subject,
              html: emailContent.html,
            });
            return { success: true, messageId: result.messageId, provider: 'smtp' };
          } catch (smtpError) {
            console.error('SMTP fallback also failed:', smtpError);
            return { success: false, error: 'Both email providers failed' };
          }
        }
        return { success: false, error: 'Resend failed and no SMTP fallback available' };
      }
    } else if (smtpTransporter) {
      // Use SMTP if Resend is not configured
      try {
        const result = await smtpTransporter.sendMail({
          from,
          to,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        return { success: true, messageId: result.messageId, provider: 'smtp' };
      } catch (smtpError) {
        console.error('SMTP failed:', smtpError);
        return { success: false, error: 'SMTP sending failed' };
      }
    } else {
      // No email provider configured
      console.warn('Email not sent: No email provider configured (missing SMTP credentials or RESEND_API_KEY)');
      return { success: false, error: 'No email provider configured' };
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Batch email sending
export async function sendBatchEmails(
  recipients: { email: string; template: keyof typeof emailTemplates; data: any }[]
) {
  const results = await Promise.allSettled(
    recipients.map(r => sendEmail(r.email, r.template, r.data))
  );
  
  return results.map((result, index) => ({
    email: recipients[index].email,
    status: result.status,
    result: result.status === 'fulfilled' ? result.value : { error: result.reason }
  }));
}

// Email queue for background processing
export const emailQueue: Array<{
  to: string;
  template: keyof typeof emailTemplates;
  data: any;
  retries?: number;
}> = [];

export function queueEmail(
  to: string,
  template: keyof typeof emailTemplates,
  data: any
) {
  emailQueue.push({ to, template, data, retries: 0 });
}

// Process email queue (should be called periodically)
export async function processEmailQueue() {
  while (emailQueue.length > 0) {
    const email = emailQueue.shift();
    if (!email) continue;
    
    const result = await sendEmail(email.to, email.template, email.data);
    
    if (!result.success && email.retries! < 3) {
      // Retry failed emails
      email.retries!++;
      emailQueue.push(email);
    }
  }
}

// Send custom email (for workflows and other custom content)
export async function sendCustomEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    const from = process.env.EMAIL_FROM || 'noreply@onboardhub.com';

    // Prioritize Resend, fallback to SMTP
    if (resend) {
      try {
        const result = await resend.emails.send({
          from,
          to,
          subject,
          html,
        });
        return { success: true, messageId: result.data?.id, provider: 'resend' };
      } catch (resendError) {
        console.warn('Resend failed, trying SMTP fallback:', resendError);
        if (smtpTransporter) {
          try {
            const result = await smtpTransporter.sendMail({
              from,
              to,
              subject,
              html,
            });
            return { success: true, messageId: result.messageId, provider: 'smtp' };
          } catch (smtpError) {
            console.error('SMTP fallback also failed:', smtpError);
            return { success: false, error: 'Both email providers failed' };
          }
        }
        return { success: false, error: 'Resend failed and no SMTP fallback available' };
      }
    } else if (smtpTransporter) {
      try {
        const result = await smtpTransporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        return { success: true, messageId: result.messageId, provider: 'smtp' };
      } catch (smtpError) {
        console.error('SMTP failed:', smtpError);
        return { success: false, error: 'SMTP sending failed' };
      }
    } else {
      console.warn('Email not sent: No email provider configured');
      return { success: false, error: 'No email provider configured' };
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
