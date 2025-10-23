# Changelog - AI Grievance Redressal System Updates

## October 23, 2025 - Major Feature Updates

### 1. ✅ Admin Comments Now Visible to Students

**Changes Made:**
- Updated `GrievanceTable.tsx` to show comments button for all users (not just admins)
- Students can now view all comments and updates on their grievances
- Admin/HOD comments are visually distinguished with colored badges and background
- Comment count badge appears on the comment button when comments exist
- Modal shows read-only view for students, allowing them to see conversation history

**User Experience:**
- Students can click the comment icon to view all updates from admins/HODs
- Comments from admins/HODs are highlighted in blue to distinguish them from student comments
- Full conversation history is visible to all parties

### 2. ✅ Replaced Ollama with Gemini API for AI Classification

**Changes Made:**
- Replaced Ollama AI integration with Google's Gemini API
- Using model: `gemini-2.0-flash-lite`
- Updated `classifyGrievance()` function in `/supabase/functions/server/index.tsx`
- Improved JSON parsing to handle markdown code blocks from Gemini responses
- Better error handling and fallback classification

**Configuration:**
- API Key stored in environment variable: `GEMINI_API_KEY`
- Gemini API endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent`
- Improved classification accuracy with better prompt engineering

### 3. ✅ Manual Department Selection (Bypass AI)

**Changes Made:**
- Added department selection toggle in `SubmitGrievancePage.tsx`
- Students can now choose between AI classification or manual department selection
- Interactive switch to toggle between "AI" and "Manual" modes
- Department dropdown populated from active departments in the system
- Visual indicators (Sparkles icon) for AI mode

**User Experience:**
- Default: AI classification enabled
- Toggle to manual mode to select specific department
- Cannot submit without selecting a department in manual mode
- Clear visual feedback for which mode is active

**Backend Updates:**
- Updated grievance submission endpoint to accept `manualDepartment` parameter
- Added `manuallyClassified` flag to grievance records
- Manual selections bypass AI classification entirely

### 4. ✅ Email Notifications

**Changes Made:**
- Implemented email notification infrastructure in `/supabase/functions/server/index.tsx`
- Added `sendEmail()` helper function
- Email notifications for:
  1. Grievance submission confirmation (to student)
  2. New grievance alert (to admins/HODs)
  3. Status update notifications (to student)
  4. New comment notifications (to student when admin/HOD comments)

**Email Templates:**
- Professional HTML email templates with all relevant information
- Includes grievance details, status, department, and action prompts

**Configuration Required:**
- Email service provider integration needed (see `/EMAIL_SETUP.md`)
- Currently logs to console only until email service is configured
- Recommended providers: Resend, SendGrid, or AWS SES

**Email Events:**
```
Submission → Student + Admins/HODs notified
Status Change → Student notified
Admin/HOD Comment → Student notified
```

## Technical Details

### Files Modified:
1. `/supabase/functions/server/index.tsx` - Backend API updates
2. `/components/SubmitGrievancePage.tsx` - Manual department selection
3. `/components/GrievanceTable.tsx` - Comments visible to all users
4. `/components/UserDashboard.tsx` - Fixed onUpdate prop
5. `/utils/api.tsx` - Added manualDepartment parameter

### Files Created:
1. `/EMAIL_SETUP.md` - Email configuration instructions
2. `/CHANGELOG.md` - This file

### Environment Variables:
- `GEMINI_API_KEY` - Google Gemini API key for AI classification

### Database Schema Changes:
- Added `manuallyClassified` boolean field to grievance records
- Added `userRole` field to comment records for better role identification

## Breaking Changes

None. All changes are backward compatible.

## Migration Notes

1. **Gemini API Key**: Please ensure the Gemini API key is correctly set in the environment variables
2. **Email Service**: Follow `/EMAIL_SETUP.md` to enable actual email sending
3. **Existing Grievances**: Will continue to work normally with new features

## Testing Recommendations

1. Test AI classification with various grievance descriptions
2. Test manual department selection
3. Verify students can see admin comments
4. Check email logs in Supabase Edge Functions dashboard
5. Test all notification triggers (submission, status update, comments)

## Next Steps

- Configure email service provider for production email sending
- Monitor Gemini API usage and costs
- Consider adding email preferences for users
- Add email notification settings in user profile
