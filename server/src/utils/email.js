import { Resend } from "resend";

// Lazily create the client so it picks up env vars after dotenv loads
let resendClient = null;
const getClient = () => {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

// Core send function — never throws to the caller.
// Emails are best-effort: a failure here must not break the main request.
export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️  RESEND_API_KEY not set — skipping email");
      return;
    }

    const resend = getClient();
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return;
    }

    console.log(`📧 Email sent to ${to} (id: ${data?.id})`);
  } catch (err) {
    console.error("Email exception:", err.message);
  }
};

// ---- Email templates ----

export const complaintStatusEmail = (residentName, complaint) => {
  const { category, status, _id } = complaint;
  return {
    subject: `Your complaint status is now: ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Complaint Update</h2>
        <p>Hi ${residentName},</p>
        <p>The status of your complaint has been updated.</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 12px; font-weight: bold;">Category</td><td style="padding: 6px 12px;">${category}</td></tr>
          <tr><td style="padding: 6px 12px; font-weight: bold;">New Status</td><td style="padding: 6px 12px;">${status}</td></tr>
          <tr><td style="padding: 6px 12px; font-weight: bold;">Complaint ID</td><td style="padding: 6px 12px;">${_id}</td></tr>
        </table>
        <p>You can log in to the portal to see the full history.</p>
        <p style="color: #888; font-size: 12px;">— Society Maintenance Team</p>
      </div>
    `,
  };
};

export const importantNoticeEmail = (residentName, notice) => {
  const { title, content } = notice;
  return {
    subject: `📢 Important Notice: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Important Notice</h2>
        <p>Hi ${residentName},</p>
        <h3>${title}</h3>
        <p>${content}</p>
        <p style="color: #888; font-size: 12px;">— Society Maintenance Team</p>
      </div>
    `,
  };
};