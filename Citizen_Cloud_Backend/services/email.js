import nodemailer from "nodemailer";

let transporter;

export function initEmail() {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("[EMAIL] SMTP connection error:", error);
    } else {
      console.log("[EMAIL] SMTP server is ready to send messages");
    }
  });
}

export async function sendOtpEmail(toEmail, otpCode) {
  if (!transporter) {
    console.warn("[EMAIL] Transporter not initialized. Cannot send OTP.");
    return false;
  }

  const mailOptions = {
    from: `"Agastir Police Portal" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Agastir - Verify your account",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">Agastir Citizen Portal</h2>
        <p>You requested to verify your email address to submit police reports.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otpCode}</span>
        </div>
        <p style="color: #475569; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send OTP email:", error);
    return false;
  }
}
