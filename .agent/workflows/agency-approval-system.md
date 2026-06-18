# Agency Registration & Approval System - Implementation Plan

## Overview
Implement a system where agencies can register through the home page, and Ministry/State admins can approve them before they get access to the agency dashboard.

## Database Changes

### 1. Add approval fields to `implementing_agencies` table
```sql
ALTER TABLE implementing_agencies 
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN rejection_reason TEXT;

-- approval_status values: 'PENDING', 'APPROVED', 'REJECTED'
```

## Frontend Components

### 1. Add "Register Agency" Button to Header (Header.jsx)
- Add button in navigation menu visible to public/unauthenticated users
- Button navigates to `/register-agency` page

### 2. Create Agency Registration Form (/register-agency)
- Agency Name
- Agency Type (dropdown: NGO, Private Company, Government Body, etc.)
- Registration Number
- Address
- Contact Number
- Email
- State (dropdown from states table)
- District (dropdown from districts table based on selected state)
- Password
- Confirm Password

### 3. Create Agency Approval Dashboard (Ministry/State)
**For Ministry:**
- View all agency applications
- Approve/Reject with reason
- Filter by state, status

**For State:**
- View agency applications for their state only
- Approve/Reject with reason
- Filter by district, status

### 4. Update Agency Dashboard
- Only show for APPROVED agencies
- Block access if status is PENDING or REJECTED
- Show status message if not approved

## Backend API Endpoints

### 1. `/api/agencies/register` (POST)
- Public endpoint (no auth required)
- Create agency record with status='PENDING'
- Create user account with role='AGENCY' but disabled
- Send notification to relevant admin

### 2. `/api/agencies/pending` (GET)
- Ministry: See all pending agencies
- State: See pending agencies in their state
- Auth required (Ministry/State role)

### 3. `/api/agencies/approve/:id` (POST)
- Approve agency application
- Enable user account
- Send approval email to agency
- Auth required (Ministry/State role)

### 4. `/api/agencies/reject/:id` (POST)
- Reject agency application with reason
- Send rejection email
- Auth required (Ministry/State role)

## Flow

1. User visits home page → Clicks "Register as Agency"
2. Fills registration form → Submits
3. Account created with status=PENDING
4. Ministry/State admin reviews application
5. Admin approves/rejects
6. If approved: Agency can login and access dashboard
7. If rejected: Agency receives email with reason

## Files to Create/Modify

### New Files:
- `src/pages/RegisterAgency.jsx` - Registration form
- `src/pages/dashboards/ministry/ManageAgencies.jsx` - Approval dashboard for ministry
- `src/pages/dashboards/state/ManageAgencies.jsx` - Approval dashboard for state
- `backend/controllers/agencyController.js` - Agency management logic
- `backend/routes/agencyRoutes.js` - Agency API routes

### Modified Files:
- `src/components/Header.jsx` - Add "Register Agency" link
- `src/App.jsx` - Add route for `/register-agency`
- `backend/database/schema.sql` - Add approval fields
- Ministry/State sidebar - Add "Manage Agencies" menu item
