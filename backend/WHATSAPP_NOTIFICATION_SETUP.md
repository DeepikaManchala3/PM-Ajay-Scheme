# WhatsApp Notification Setup for Agency Registration

## What's Implemented

When a new agency registers, the system will automatically send a WhatsApp notification to the State Admin with details about the registration.

## Environment Variables Required

Add this line to your `.env` file in the `backend` folder:

```env
STATE_ADMIN_PHONE=9876543210
```

Replace `9876543210` with the actual State Admin's phone number (10 digits, without country code).

## Existing WATI Configuration

Your system already has these environment variables configured (based on your existing implementation):
- `WATI_API_URL` - WATI API base URL
- `WATI_API_KEY` - Your WATI API key
- `TENANT_ID` - Your WATI tenant ID
- `WATI_TEMPLATE_NAME` - Template name (default: 'sih')

## WhatsApp Message Format

When agency registers, State Admin will receive:

```
⚠️ *New Agency Registration*
AGENCY NAME: [Agency Name]
EMAIL: [Email]
PHONE: [Phone]
STATE: [State]
DISTRICTS: [District1, District2, ...]
GST: [GST Number]
STATUS: Pending Approval
Please login to the State Admin dashboard to review and approve this agency registration.
Thank you, PM-AJAY Portal
```

## How It Works

1. ✅ Agency submits registration form
2. ✅ Data saved to database
3. ✅ WhatsApp notification sent to State Admin phone number
4. ✅ State Admin reviews and approves/rejects

## Important Notes

- If WhatsApp fails to send, the registration will still succeed
- Phone number format: 10 digits (e.g., 9876543210)
- System automatically adds country code (91) for India

## Testing

1. Add `STATE_ADMIN_PHONE=<your_test_number>` to `.env`
2. Restart backend server
3. Register a new agency
4. Check if WhatsApp notification is received

## Restart Backend

After adding the phone number to `.env`:

```bash
cd C:\Users\potha\Downloads\PM-Ajay\backend
# Stop server (Ctrl+C)
npm start
```
