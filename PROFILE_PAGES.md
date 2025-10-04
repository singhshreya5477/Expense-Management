# Role-Based Profile Pages - Implementation Complete

## Overview
Three separate profile pages have been created for Admin, Manager, and Employee roles. Each user sees a customized profile page when they click on their name in the sidebar, tailored to their role and responsibilities.

## Profile Pages Created

### 1. Admin Profile (`AdminProfile.jsx`)
**Color Theme:** Purple/Indigo gradient
**Icon:** Shield
**Route:** `/profile` (when user role = Admin)

**Features:**
- **Profile Card (Left Column):**
  - Large circular avatar with Shield icon
  - Administrator badge
  - Member since date
  - User ID
  - Active status indicator

- **Account Information (Right Column - Top):**
  - View/Edit mode toggle
  - Full name (editable)
  - Email address (editable)
  - Role display (Administrator)
  - Password change section (optional)
    * Current password
    * New password
    * Confirm new password
  - Save/Cancel buttons

- **Administrator Capabilities:**
  - User Management card - Full control over users
  - Approval Rules card - Configure workflows
  - Company Settings card - Manage organization
  - System Access card - Unrestricted access
  - Visual grid with icons and descriptions

- **Preferences:**
  - Email Notifications toggle
  - System Alerts toggle
  - Modern toggle switches for settings

**Design Elements:**
- Purple gradient backgrounds
- Shield icon branding
- Admin-focused capability cards
- Clean, professional layout

---

### 2. Manager Profile (`ManagerProfile.jsx`)
**Color Theme:** Blue/Cyan gradient
**Icon:** Briefcase
**Route:** `/profile` (when user role = Manager)

**Features:**
- **Profile Card (Left Column):**
  - Large circular avatar with User icon
  - Manager badge
  - "Approver" badge (if isManagerApprover = true)
  - Member since date
  - User ID
  - Active status indicator

- **Activity Overview (Left Column - Bottom):**
  - Pending Approvals count with icon
  - My Expenses count with icon
  - Team Expenses count with icon
  - Total Approved count with icon
  - Color-coded stat cards

- **Account Information (Right Column - Top):**
  - View/Edit mode toggle
  - Full name (editable)
  - Email address (editable)
  - Role display (Manager + Approver badge if applicable)
  - Password change section (optional)
  - Save/Cancel buttons

- **Manager Responsibilities:**
  - Approve Expenses card - Review team submissions
  - Team Oversight card - Monitor team expenses
  - Visual cards showing key responsibilities

- **Recent Personal Expenses:**
  - List of manager's own submitted expenses
  - Description, date, category, amount
  - Status badges for each expense
  - Quick overview of personal claims

**Design Elements:**
- Blue/teal gradient backgrounds
- Briefcase icon branding
- Activity statistics
- Team-focused sections
- Professional manager aesthetic

---

### 3. Employee Profile (`EmployeeProfile.jsx`)
**Color Theme:** Green/Emerald gradient
**Icon:** Wallet
**Route:** `/profile` (when user role = Employee)

**Features:**
- **Profile Card (Left Column):**
  - Large circular avatar with User icon
  - Employee badge
  - Member since date
  - User ID
  - Active status indicator
  - Reports To (Manager ID) if assigned

- **Expense Summary (Left Column - Middle):**
  - Total Expenses count
  - Pending count
  - Approved count
  - Total Claimed amount
  - Color-coded stat cards with icons

- **Financial Overview (Left Column - Bottom):**
  - Total Submitted amount
  - Approved Amount (reimbursed)
  - Visual comparison cards

- **Account Information (Right Column - Top):**
  - View/Edit mode toggle
  - Full name (editable)
  - Email address (editable)
  - Role display (Employee)
  - Reports To (Manager ID if applicable)
  - Password change section (optional)
  - Save/Cancel buttons

- **Recent Expenses:**
  - Detailed list of last 8 submitted expenses
  - Description, status badge
  - Date, category, merchant
  - Amount for each expense
  - Empty state with helpful message

- **Expense Submission Tips:**
  - Numbered list of guidelines:
    1. Always attach receipts for expenses over $50
    2. Provide clear descriptions for faster approvals
    3. Submit expenses within 30 days of purchase
    4. Check approval status regularly in dashboard
  - Helpful blue-themed info cards

**Design Elements:**
- Green/emerald gradient backgrounds
- Wallet icon branding
- Financial focus (submitted vs approved amounts)
- Submission guidelines for employees
- User-friendly, simple interface

---

## How It Works

### 1. User Clicks Profile
When a user clicks on their name in the sidebar (bottom left), they are routed to `/profile`.

### 2. Profile Router (`Profile.jsx`)
The main Profile component checks the user's role and displays the appropriate profile page:
```javascript
switch (user?.role) {
  case 'Admin':
    return <AdminProfile />;
  case 'Manager':
    return <ManagerProfile />;
  case 'Employee':
    return <EmployeeProfile />;
}
```

### 3. Layout Update (`Layout.jsx`)
The user profile section in the sidebar is now clickable:
```jsx
<Link to="/profile" className="...">
  {user info}
</Link>
```

### 4. Route Configuration (`App.jsx`)
Added profile route accessible to all authenticated users:
```jsx
<Route path="/profile" element={<Profile />} />
```

---

## Common Features Across All Profiles

### Edit Mode
- Toggle between View and Edit modes
- Edit button prominently displayed
- Save/Cancel actions when editing

### Password Change
- Optional password update section
- Requires current password for security
- New password confirmation
- Validation for password match

### Profile Update Mutation
All profiles use React Query mutation:
```javascript
const updateProfileMutation = useMutation(
  (data) => userAPI.updateProfile(data),
  {
    onSuccess: (response) => {
      toast.success('Profile updated successfully');
      setUser(response.data.data);
      // refresh profile data
    }
  }
);
```

### Responsive Design
- 3-column grid on desktop (1-2 split)
- Single column on mobile
- Cards adapt to screen size
- Maintains readability on all devices

---

## Design Consistency

### Color Schemes (Role-Based)
- **Admin:** Purple/Indigo (`from-purple-50 to-indigo-50`)
- **Manager:** Blue/Cyan (`from-blue-50 to-cyan-50`)
- **Employee:** Green/Emerald (`from-green-50 to-emerald-50`)

### Common Elements
- Large circular avatar (24x24 rem)
- Role badge with icon
- Gradient backgrounds for key sections
- Hover effects on cards
- Consistent spacing and padding
- Same form input styling
- Status indicators

### Icons (Lucide React)
- Admin: Shield, Settings, Users, Activity
- Manager: Briefcase, CheckSquare, Users
- Employee: Wallet, Receipt, DollarSign, Calendar

---

## Data Integration

### API Calls
Each profile makes appropriate queries:

**Admin:**
- `userAPI.getProfile()` - Admin profile data
- Stats pulled from dashboard queries

**Manager:**
- `userAPI.getProfile()` - Manager profile data
- `expenseAPI.getMyExpenses()` - Personal expenses
- `approvalAPI.getPending()` - Pending approvals

**Employee:**
- `userAPI.getProfile()` - Employee profile data
- `expenseAPI.getMyExpenses()` - All personal expenses

### Real-Time Stats
- Counts calculated from fetched data
- Financial totals computed on frontend
- Status breakdowns with percentages
- Activity overview updates automatically

---

## User Experience Benefits

### Role-Appropriate Information
- Admins see system capabilities and control options
- Managers see team oversight and approval stats
- Employees see expense tracking and submission tips

### Single Click Access
- User profile clickable from sidebar
- No need to navigate through menus
- Quick access to account settings

### Visual Distinction
- Each role has unique color scheme
- Different icons for instant recognition
- Role-specific sections and cards

### Activity Tracking
- Managers see approval workload
- Employees see expense status overview
- Admins see system-wide responsibilities

---

## Testing the Profile Pages

### As Admin:
1. Login with admin credentials
2. Click on your name in the sidebar (bottom left)
3. See purple-themed AdminProfile
4. View administrator capabilities
5. Edit profile information
6. Change password if needed

### As Manager:
1. Login with manager credentials
2. Click on your name in the sidebar
3. See blue-themed ManagerProfile
4. View activity overview (approvals, expenses)
5. Check recent personal expenses
6. See manager responsibilities

### As Employee:
1. Login with employee credentials
2. Click on your name in the sidebar
3. See green-themed EmployeeProfile
4. View expense summary and financial overview
5. Check recent submitted expenses
6. Read submission tips

---

## Files Created/Modified

### Created:
1. `frontend/src/pages/profiles/AdminProfile.jsx` - Admin-specific profile page
2. `frontend/src/pages/profiles/ManagerProfile.jsx` - Manager-specific profile page
3. `frontend/src/pages/profiles/EmployeeProfile.jsx` - Employee-specific profile page

### Modified:
1. `frontend/src/pages/Profile.jsx` - Router component for role-based profiles
2. `frontend/src/components/Layout.jsx` - Made user profile section clickable
3. `frontend/src/App.jsx` - Added `/profile` route

---

## Security Considerations

### Password Changes
- Require current password for verification
- Password confirmation to prevent typos
- Minimum length validation
- Server-side validation on backend

### Profile Updates
- Only user's own profile can be edited
- Email changes disabled (requires admin)
- Role changes not allowed through profile
- Backend validates user identity

### Data Privacy
- Each user sees only their own data
- Managers see team stats but not other managers' data
- Employees cannot see other employees' profiles

---

## Next Steps

The role-based profile system is now complete. Users can:
- Click their name to access their profile
- View role-appropriate information
- Edit their personal details
- Change their password securely
- See relevant statistics and activities

All three roles have distinct, tailored profile experiences that match their responsibilities and needs within the expense management system.
