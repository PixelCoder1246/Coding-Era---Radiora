const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

async function sendReportEmail({ to, patientName, accessToken }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[EMAIL] SendGrid not configured. Skipping email to ${to}`);
    return;
  }

  const portalUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/portal/report/${accessToken}`;

  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'noreply@radiora.app',
    subject: 'Your Radiology Report is Ready',
    text: `Hello ${patientName},\n\nYour radiology report is ready. Access it here:\n${portalUrl}\n\nThis link is unique to you. Please do not share it.\n\n— Radiora`,
    html: `
      <p>Hello <strong>${patientName}</strong>,</p>
      <p>Your radiology report is ready. Access it using the link below:</p>
      <p><a href="${portalUrl}">${portalUrl}</a></p>
      <p>This link is unique to you. Please do not share it.</p>
      <p>— Radiora</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`[EMAIL] Report email sent to ${to}`);
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}:`, err.message);
  }
}

module.exports = { sendReportEmail };
