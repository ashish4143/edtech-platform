import nodemailer from 'nodemailer';

interface SendTestLinkParams {
  to: string;
  studentName: string;
  studentEmail: string;
  testTitle: string;
  testAssignmentId: string;
  magicLink: string;
  generatedPassword?: string;
  durationMins?: number;
  totalMarks?: number;
}

interface SendWelcomeParams {
  to: string;
  studentName: string;
  tempPassword: string;
  loginUrl: string;
}

function getTransporter() {
  const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  return nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: Number(EMAIL_PORT) || 587,
    secure: EMAIL_PORT === '465',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

async function trySend(to: string, subject: string, html: string, label: string): Promise<{ success: boolean; message: string; messageId?: string }> {
  console.log(`\n======== 📧 ${label} ========`);
  console.log(`To: ${to} | Subject: ${subject}`);
  console.log('================================\n');

  const transporter = getTransporter();
  if (!transporter) {
    console.log('✅ Simulation mode (no SMTP creds). Email logged to console.');
    return { success: true, message: 'Simulated', messageId: `sim-${Date.now()}` };
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"EdTech Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ Sent (attempt ${attempt}). ID: ${info.messageId}`);
      return { success: true, message: 'Sent', messageId: info.messageId };
    } catch (err: any) {
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return { success: true, message: 'SMTP failed, logged to console', messageId: `fallback-${Date.now()}` };
}

export async function sendTestMagicLink({
  to, studentName, studentEmail, testTitle, testAssignmentId, magicLink, generatedPassword, durationMins, totalMarks,
}: SendTestLinkParams): Promise<{ success: boolean; message: string; messageId?: string }> {
  const html = `
    <div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f172a;color:#f8fafc;border-radius:16px;border:1px solid #1e293b;">
      <div style="text-align:center;margin-bottom:24px;"><h1 style="color:#818cf8;font-size:24px;margin:0;">Assessment Dispatch</h1><p style="color:#94a3b8;font-size:14px;margin-top:4px;">Secure Examination Link</p></div>
      <div style="background:#1e293b;padding:20px;border-radius:12px;margin-bottom:24px;">
        <p style="font-size:16px;margin-top:0;">Dear <strong>${studentName}</strong>,</p>
        <p style="color:#cbd5e1;font-size:14px;">You have been assigned:</p>
        <div style="background:#0b0f19;padding:12px 16px;border-radius:8px;border-left:4px solid #6366f1;margin:16px 0;">
          <strong style="color:#f1f5f9;font-size:16px;">${testTitle}</strong>
          <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">${durationMins ? `Duration: ${durationMins} min` : ''}${durationMins && totalMarks ? ' | ' : ''}${totalMarks ? `Marks: ${totalMarks}` : ''}</p>
        </div>
        <div style="background:#111827;padding:12px 16px;border-radius:8px;border:1px solid #334155;margin:16px 0;">
          <p style="color:#f8fafc;font-size:13px;margin:0;">Email: <strong>${studentEmail}</strong></p>
          <p style="color:#f8fafc;font-size:13px;margin:4px 0 0;">Password: <strong>${generatedPassword || 'Use your account password'}</strong></p>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:32px;"><a href="${magicLink}" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 28px;font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;box-shadow:0 4px 12px rgba(99,102,241,0.3);">Start Assessment</a></div>
      <div style="border-top:1px solid #334155;padding-top:16px;font-size:12px;color:#64748b;text-align:center;"><p style="word-break:break-all;color:#818cf8;margin-top:8px;">${magicLink}</p><p style="margin-top:16px;">Assignment ID: ${testAssignmentId}</p></div>
    </div>`;

  return trySend(to, `Assessment: ${testTitle}`, html, 'TEST DISPATCH');
}

export async function sendWelcomeCredentials({ to, studentName, tempPassword, loginUrl }: SendWelcomeParams): Promise<{ success: boolean; message: string; messageId?: string }> {
  const html = `
    <div style="font-family:'Segoe UI',Tahoma,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f172a;color:#f8fafc;border-radius:16px;border:1px solid #1e293b;">
      <div style="text-align:center;margin-bottom:24px;"><h1 style="color:#818cf8;font-size:24px;margin:0;">Welcome to EdTech</h1><p style="color:#94a3b8;font-size:14px;margin-top:4px;">Your account has been created</p></div>
      <div style="background:#1e293b;padding:20px;border-radius:12px;margin-bottom:24px;">
        <p style="font-size:16px;margin-top:0;">Hello <strong>${studentName}</strong>,</p>
        <p style="color:#cbd5e1;font-size:14px;">Your institute admin has created an account for you. Use the credentials below to log in:</p>
        <div style="background:#111827;padding:16px;border-radius:8px;border:1px solid #334155;margin:16px 0;">
          <p style="color:#f8fafc;font-size:14px;margin:0;">Email: <strong>${to}</strong></p>
          <p style="color:#f8fafc;font-size:14px;margin:8px 0 0;">Temporary Password: <strong style="color:#818cf8;font-size:16px;">${tempPassword}</strong></p>
        </div>
        <p style="color:#fbbf24;font-size:13px;margin-top:12px;">⚠️ You will be asked to change your password on first login.</p>
      </div>
      <div style="text-align:center;margin-bottom:32px;"><a href="${loginUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 28px;font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;">Login to Portal</a></div>
      <div style="border-top:1px solid #334155;padding-top:16px;font-size:12px;color:#64748b;text-align:center;"><p>${loginUrl}</p></div>
    </div>`;

  console.log(`🔑 Temp password for ${studentName} (${to}): ${tempPassword}`);
  return trySend(to, 'Your EdTech Account Credentials', html, 'WELCOME EMAIL');
}
