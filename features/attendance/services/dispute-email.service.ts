import { resend } from '@/lib/resend';

export interface SendDisputeEmailParams {
  queryId: string;
  studentName: string;
  studentEmail: string;
  enrollmentNo: string;
  subjectName: string;
  subjectCode: string;
  dateStr: string;
  period?: number | null;
  message: string;
  coordinatorEmail?: string | null;
  hodEmail?: string | null;
}

export async function sendDisputeNotificationEmail(params: SendDisputeEmailParams) {
  const {
    queryId,
    studentName,
    studentEmail,
    enrollmentNo,
    subjectName,
    subjectCode,
    dateStr,
    period,
    message,
    coordinatorEmail,
    hodEmail,
  } = params;

  // Collect recipients
  const recipients = Array.from(
    new Set(
      [coordinatorEmail, hodEmail]
        .filter((e): e is string => Boolean(e && e.trim().length > 0))
    )
  );

  // Fallback recipient if no coordinator/HOD email set in seed/test DB
  if (recipients.length === 0) {
    recipients.push(process.env.TEST_NOTIFICATION_EMAIL || 'admin@campusai.edu');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const reviewLink = `${appUrl}/attendance-coordinator/mark?tab=disputes&queryId=${queryId}`;
  const periodText = period ? `Period ${period}` : 'N/A';

  const senderEmail = process.env.RESEND_FROM_EMAIL || 'CampusAI <onboarding@resend.dev>';

  console.log(`[DisputeEmailService] Attempting to send dispute email via Resend to ${recipients.join(', ')}...`);
  console.log(`[DisputeEmailService] Reply-To set to student email: ${studentEmail}`);

  try {
    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: recipients,
      replyTo: studentEmail,
      subject: `[Attendance Query] Dispute raised by ${studentName} for ${subjectCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1e293b; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">CampusAI Attendance Dispute Notice</h2>
          </div>
          <div style="padding: 24px; color: #334155; line-height: 1.6;">
            <p>Hello,</p>
            <p>A new attendance dispute query has been raised by <strong>${studentName}</strong> (${enrollmentNo}).</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc;">
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Student Name:</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${studentName} (&lt;${studentEmail}&gt;)</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Subject:</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${subjectName} (${subjectCode})</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Date / Period:</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${dateStr} (${periodText})</td>
              </tr>
            </table>

            <div style="background-color: #f1f5f9; padding: 16px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
              <h4 style="margin-top: 0; margin-bottom: 8px; color: #1e293b;">Student Message:</h4>
              <p style="margin: 0; white-space: pre-wrap; font-style: italic;">"${message}"</p>
            </div>

            <p style="margin-bottom: 24px;">
              You can hit <strong>Reply</strong> to reply directly to the student (${studentEmail}), or open the Coordinator Dashboard to mark it Resolved / Rejected:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review Query in Coordinator Portal
              </a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 12px; text-align: center; color: #94a3b8; font-size: 12px;">
            CampusAI Automated Attendance System &bull; Do not block this notification
          </div>
        </div>
      `,
    });

    if (error) {
      console.warn(`[DisputeEmailService] Resend returned error:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[DisputeEmailService] Email sent successfully! Message ID:`, data?.id);
    return { success: true, emailId: data?.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[DisputeEmailService] Failed to send email (non-blocking warning):`, errorMsg);
    return { success: false, error: errorMsg };
  }
}
