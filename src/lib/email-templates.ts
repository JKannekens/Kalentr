// Email template utilities

interface BaseTemplateProps {
  businessName: string;
  primaryColor?: string;
}

function baseTemplate(content: string, { businessName, primaryColor = '#3b82f6' }: BaseTemplateProps) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${businessName}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Powered by <a href="https://kalentr.com" style="color: ${primaryColor}; text-decoration: none;">Kalentr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================
// BOOKING CONFIRMATION (Client)
// ============================================

interface BookingConfirmationProps extends BaseTemplateProps {
  clientName: string;
  serviceName: string;
  date: string;        // Formatted date string
  time: string;        // Formatted time string
  duration: number;    // minutes
  notes?: string;
  cancellationUrl?: string;
}

export function bookingConfirmationEmail({
  businessName,
  primaryColor,
  clientName,
  serviceName,
  date,
  time,
  duration,
  notes,
  cancellationUrl,
}: BookingConfirmationProps): string {
  const content = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Booking Confirmed!</h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hi ${clientName}, your appointment has been confirmed.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Service</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Date</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${date}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Time</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${time} (${duration} minutes)</span>
              </td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Notes</span><br>
                <span style="color: #111827; font-size: 16px;">${notes}</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${cancellationUrl ? `
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Need to cancel? <a href="${cancellationUrl}" style="color: ${primaryColor || '#3b82f6'}; text-decoration: none;">Click here</a>
    </p>
    ` : ''}
  `;
  
  return baseTemplate(content, { businessName, primaryColor });
}

// ============================================
// NEW BOOKING NOTIFICATION (Business Owner)
// ============================================

interface NewBookingNotificationProps extends BaseTemplateProps {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  dashboardUrl: string;
}

export function newBookingNotificationEmail({
  businessName,
  primaryColor,
  clientName,
  clientEmail,
  clientPhone,
  serviceName,
  date,
  time,
  duration,
  notes,
  dashboardUrl,
}: NewBookingNotificationProps): string {
  const content = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">New Booking!</h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      You have a new appointment scheduled.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Client</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${clientName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Email</span><br>
                <a href="mailto:${clientEmail}" style="color: ${primaryColor || '#3b82f6'}; font-size: 16px; text-decoration: none;">${clientEmail}</a>
              </td>
            </tr>
            ${clientPhone ? `
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Phone</span><br>
                <a href="tel:${clientPhone}" style="color: ${primaryColor || '#3b82f6'}; font-size: 16px; text-decoration: none;">${clientPhone}</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 16px;">
                <span style="color: #6b7280; font-size: 14px;">Service</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Date & Time</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${date} at ${time} (${duration} min)</span>
              </td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Client Notes</span><br>
                <span style="color: #111827; font-size: 16px;">${notes}</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    <a href="${dashboardUrl}" style="display: inline-block; background-color: ${primaryColor || '#3b82f6'}; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
      View in Dashboard
    </a>
  `;
  
  return baseTemplate(content, { businessName, primaryColor });
}

// ============================================
// APPOINTMENT REMINDER (Client)
// ============================================

interface AppointmentReminderProps extends BaseTemplateProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  hoursUntil: number;
  cancellationUrl?: string;
}

export function appointmentReminderEmail({
  businessName,
  primaryColor,
  clientName,
  serviceName,
  date,
  time,
  duration,
  hoursUntil,
  cancellationUrl,
}: AppointmentReminderProps): string {
  const content = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Appointment Reminder</h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hi ${clientName}, this is a reminder that you have an appointment ${hoursUntil === 24 ? 'tomorrow' : `in ${hoursUntil} hours`}.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Service</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Date</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${date}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #6b7280; font-size: 14px;">Time</span><br>
                <span style="color: #111827; font-size: 16px; font-weight: 500;">${time} (${duration} minutes)</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0; color: #4b5563; font-size: 14px;">
      We look forward to seeing you!
    </p>
    
    ${cancellationUrl ? `
    <p style="margin: 16px 0 0; color: #6b7280; font-size: 14px;">
      Need to reschedule? <a href="${cancellationUrl}" style="color: ${primaryColor || '#3b82f6'}; text-decoration: none;">Click here</a>
    </p>
    ` : ''}
  `;
  
  return baseTemplate(content, { businessName, primaryColor });
}

// ============================================
// EMAIL VERIFICATION
// ============================================

interface EmailVerificationProps {
  userName: string;
  verificationUrl: string;
}

export function emailVerificationEmail({
  userName,
  verificationUrl,
}: EmailVerificationProps): string {
  const content = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Verify your email</h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.5;">
      Hi ${userName}, please verify your email address to complete your registration.
    </p>
    
    <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-bottom: 24px;">
      Verify Email
    </a>
    
    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px;">
      This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>
  `;
  
  return baseTemplate(content, { businessName: 'Kalentr', primaryColor: '#3b82f6' });
}
