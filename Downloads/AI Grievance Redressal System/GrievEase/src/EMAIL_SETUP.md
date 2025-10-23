# Email Notification Setup

The AI Grievance Redressal System now includes email notification functionality using Gmail SMTP.

## Current Status

✅ **Gmail SMTP integration is now configured and active!**

## Email Notification Events

The system sends emails for the following events:

1. **Grievance Submission** - Sent to the student who submitted the grievance (if not anonymous)
2. **Grievance Received** - Sent to admins and relevant HODs when a new grievance is submitted
3. **Status Update** - Sent to the student when their grievance status changes
4. **New Comment** - Sent to the student when an admin or HOD adds a comment to their grievance

## Gmail SMTP Configuration

The system is configured to use Gmail SMTP with the following settings:

- **SMTP Host:** smtp.gmail.com
- **Port:** 587 (STARTTLS)
- **Authentication:** Using Gmail App Password

### Environment Variables Required

Two environment variables must be set in your Supabase Edge Functions:

1. **GMAIL_USER** - Your Gmail email address (e.g., youremail@gmail.com)
2. **GMAIL_APP_PASSWORD** - Your Gmail App Password (16-character password)

### How to Generate Gmail App Password

If you haven't already created a Gmail App Password:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification (must be enabled)
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Add it to the GMAIL_APP_PASSWORD environment variable

### Setting Environment Variables in Supabase

1. Go to your Supabase dashboard
2. Navigate to Settings > Edge Functions > Environment Variables
3. Add both variables:
   - `GMAIL_USER` = your-email@gmail.com
   - `GMAIL_APP_PASSWORD` = your-16-char-app-password

## Testing

You can test email notifications by:

1. **Submit a new grievance** - You should receive a confirmation email
2. **Update grievance status** - Student should receive status update email
3. **Add a comment** - Student should receive new comment notification
4. **Check server logs** - Look for "Email sent successfully" messages in Edge Functions logs

## Troubleshooting

If emails are not being sent:

1. Check that both GMAIL_USER and GMAIL_APP_PASSWORD are set correctly
2. Ensure 2-Step Verification is enabled on your Google account
3. Verify the App Password is correct (no spaces)
4. Check Edge Functions logs for error messages
5. Make sure "Less secure app access" is NOT required (App Passwords work with 2FA)

## Email Templates

All emails are sent with HTML formatting and include:
- Grievance title and details
- Status information
- Call-to-action to log in for more details
- Professional formatting with system branding

## Security Notes

- Never share your App Password
- Gmail App Passwords are specific to individual apps and can be revoked anytime
- Emails are sent over secure SMTP connection (STARTTLS)
- Email addresses are only collected for non-anonymous grievances
