# OrangeHRM (VibeTestQ HRM) — Exploration Notes and Test Plan

**Target:** https://qtpsudhakar-vibetestq-hrm.up.railway.app/
**Login page:** `/web/index.php/auth/login`
**Build:** OrangeHRM OS 5.9
**Account used:** `testadmin` (Admin role, display name "test admin"). Credentials are kept out of this file; use environment variables in the test suite.
**Method:** Read-only exploration with Playwright CLI. Only navigation, form reads, and tab/menu reads were done. No record was created, edited, or deleted, and no form was saved.

---

## 1. Application map (verified)

Left sidebar modules, in order: Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance, Claim, Buzz.

| Module | Route | Sub-features seen | Notes |
|---|---|---|---|
| Admin | `/admin/viewAdminModule` | User Management, Job, Organization, Qualifications, Nationalities, Corporate Branding, Configuration | System Users list with filters (Username, User Role, Employee Name, Status). Shows 632 records. |
| Admin > Job | `/admin/viewJobTitleList` | Job Titles list with Add button | Empty list (No Records Found). |
| Admin > Organization | `/admin/viewOrganizationGeneralInformation` | General Information with Edit | Shows employee count 1964. |
| PIM | `/pim/viewPimModule` | Configuration, Employee List, Add Employee, Reports | Employee List filters: Employee Name, Employee Id, Employment Status, Include, Current Employees Only, Supervisor Name, Job Title, Sub Unit. Shows 1,964 records. |
| PIM > Add Employee | `/pim/addEmployee` | Full Name, Employee Id, Create Login Details toggle, photo upload (jpg/png/gif, max 1MB, 200x200 recommended) | Required: name. |
| Leave | `/leave/viewLeaveModule` | Only "Configure" (Leave Period) is reachable | Leave Period form: Start Month, Start Date, End Date (fixed to Dec 31), Reset, Save. Other leave features are not reachable until the period is saved (see finding F1). |
| Time | `/time/viewTimeModule` | Timesheets, Attendance, Reports, Project Info | Timesheets: "Select Employee" with View. Pending Action list empty. |
| Time > Attendance | `/attendance/viewAttendanceRecord` | Employee Attendance Records, filters Employee Name and Date | Total Duration column. |
| Time > Reports | `/time/displayProjectReportCriteria` | Project Report: Project Name, Date Range, Only Include Approved Timesheets, View | |
| Recruitment | `/recruitment/viewRecruitmentModule` | Candidates, Vacancies | Candidate filters: Job Title, Vacancy, Hiring Manager, Status, Candidate Name, Keywords, Date of Application, Method of Application. Empty. |
| My Info | `/pim/viewMyDetails` | Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to, Qualifications, Memberships | Personal Details: Employee Full Name, Employee Id, Other Id, Driver's License, License Expiry, Nationality, Marital Status, Date of Birth, Gender, Attachments. |
| Performance | `/performance/viewPerformanceModule` | Configure, Manage Reviews, My Trackers, Employee Trackers | Employee Reviews filters: Employee Name, Job Title, Sub Unit, Include, Review Status, From/To Date. Empty. |
| Dashboard | `/dashboard/index` | Time at Work, My Actions, Quick Launch, Buzz Latest Posts, Employees on Leave Today, Employee Distribution by Sub Unit / Location | Leave widget shows "Leave Period Not Defined". Distribution widgets show only "Unassigned". |
| Directory | `/directory/viewDirectory` | Employee Name, Job Title, Location filters | 1,964 records. |
| Maintenance | `/maintenance/viewMaintenanceModule` | Requires re-entering Username and Password ("Administrator Access") before access | Critical-function guard. |
| Claim | `/claim/viewClaimModule` | Employee Claims, filters: Employee Name, Reference Id, Event Name, Status, From/To Date, Include, Current Employees Only; Assign Claim button | Empty. |
| Buzz | `/buzz/viewBuzz` | Post, Share Photos, Share Video; tabs Most Recent / Most Liked / Most Commented; Upcoming Anniversaries | "No Posts Available". |

Top bar on every page: Upgrade link (to orangehrm.com paid edition), profile menu, and a topbar menu.

---

## 2. Findings from exploration

- **F1 — Leave is gated behind the Leave Period.** Until the leave period is saved, the Leave module shows only the Configure page. Entitlements, Leave List, Apply, Assign, and Requests are not reachable from the menu, and the dashboard shows "Leave Period Not Defined". The test environment needs this set up in a fixture, or the leave tests will fail for setup reasons, not product reasons.
- **F2 — Shared, noisy test data.** The system has 632 users and 1,964 employees. Many are leftover test records (for example `AaravAuto2609...`, `testuser 1785924763404`, `Tamash Junit33925`, `Admin1/2/3`). Lists are not stable, so tests must not assert on total counts or on the first row of an unfiltered list. They must create their own data and filter by a unique name.
- **F3 — Several modules are empty.** Recruitment, Performance reviews, Claims, Time pending items, and Job Titles show "No Records Found". Tests for those modules need seeded data first.
- **F4 — Dashboard distribution widgets show only "Unassigned".** Employees have no sub unit or location assigned. The "Distribution" charts will look wrong until data is cleaned up.
- **F5 — Maintenance is protected.** It asks for the password again. This is good, and it should be covered by a negative test (wrong password does not open the page).
- **F6 — Upgrade prompts.** Several pages show an "Upgrade" button linking to orangehrm.com. This is an expected edition promotion, not a fault. Tests should not click it.
- **F7 — Sub-tabs are not all real pages.** Some tabs (Nationalities, Corporate Branding, Recruitment Candidates/Vacancies, Performance My Trackers) render with a "#" link. Their routes were not confirmed, so do not assert their URLs.
- **F8 — Dashboard "Time at Work" shows "Not Punched In".** Punch in/out is not tested here. Actions were not taken.

---

## 3. Proposed test plan

Priority: **P1** = core smoke / must pass before a release, **P2** = important functional, **P3** = nice to have.

### 3.1 Authentication and access (P1)
1. Valid login as `testadmin` lands on the Dashboard.
2. Invalid password shows "Invalid credentials".
3. Empty username and password show "Required" validation.
4. Logout returns to the login page, and back-navigation does not reopen a session.
5. Direct URL to a protected module while logged out redirects to login.
6. "Forgot your password?" opens the reset flow (check the page loads; do not submit).
7. Maintenance requires re-authentication: wrong password is rejected, correct password opens it (P1 negative).

### 3.2 Navigation and shell (P1)
1. Each sidebar item opens its module and highlights the active item.
2. Sidebar search filters the menu entries.
3. Topbar profile menu opens and has logout.
4. Browser back and forward keep the correct module.
5. Pages render at phone width without horizontal scroll (P2 responsive).

### 3.3 Admin: User Management (P1)
1. System Users list loads with pagination and "Records Found" count.
2. Filter by Username, User Role, Employee Name, and Status; Reset clears filters.
3. Add User form: required fields (User Role, Employee Name, Status, Username, Password, Confirm Password) show validation when empty.
4. Password and Confirm Password must match.
5. Create a user with a unique name, verify it appears in the list, then edit and delete it (data created and cleaned up inside the test).
6. Duplicate username is rejected.
7. Password strength message is shown.

### 3.4 Admin: Job, Organization, Qualifications (P2)
1. Job Titles: add, edit, delete a title; list shows the new entry.
2. Organization General Information: Edit, change a value, save, and verify it is kept.
3. Qualifications and Nationalities: list loads (confirm routes first; see F7).

### 3.5 PIM: Employee management (P1)
1. Employee List filters (name, Employee Id, status, job title, sub unit, supervisor) and Reset.
2. Add Employee: first and last name required; Employee Id auto-filled or unique.
3. Add Employee with "Create Login Details" on: username and password validation.
4. Created employee appears in the Employee List and Directory.
5. Edit the employee's Personal Details, save, and reload to confirm persistence.
6. Delete the employee created in the test (cleanup).
7. Photo upload rejects a file over 1MB or an unsupported type (P2).

### 3.6 My Info (P1)
1. Personal Details loads the logged-in user's data and saves changes.
2. Contact Details, Emergency Contacts, Dependents: add and delete one record each (P2).
3. Immigration, Qualifications, Memberships, Salary, Report-to, Job tabs load without error (P2).
4. Attachments: upload, list, and delete a small file (P2).

### 3.7 Leave (P1 once the leave period is set; see F1)
1. Leave Period: set Start Month and Start Date, save, and confirm the dashboard no longer shows "Leave Period Not Defined".
2. Reset on the Leave Period form restores the previous values.
3. After setup: Entitlements add/edit, Apply Leave with date validation (end before start rejected), Leave List filters, Approve/Reject flow, and My Leave list (P1).
4. Leave Period setup is a prerequisite fixture; the test suite should run it once before the leave tests.

### 3.8 Time (P2)
1. Timesheets: select an employee, view, and check the period header.
2. Attendance Records: filter by employee and date; Total Duration column shows values.
3. Time Reports > Project Report: requires a project name and date range; Only Include Approved toggle works.
4. Punch in / punch out from the dashboard widget (needs a test employee; not explored yet).

### 3.9 Recruitment (P2)
1. Candidate list filters (Job Title, Vacancy, Hiring Manager, Status, Name, Keywords, Date, Method) and Reset.
2. Add candidate: first and last name and email validation; candidate appears in the list.
3. Vacancy list loads (route to confirm, see F7).

### 3.10 Performance (P2)
1. Configure: confirm the performance settings page loads.
2. Manage Reviews: filters (Employee Name, Job Title, Sub Unit, Review Status, From/To Date) and Reset.
3. Review workflow (create, submit, view) needs seeded data (F3).

### 3.11 Directory (P2)
1. Search by Employee Name, Job Title, Location; results match the filter.
2. Clicking an employee opens the card with name and job title.

### 3.12 Claim (P3)
1. Employee Claims filters load and Reset clears them.
2. Assign Claim form loads (needs an event and an employee; seed first).

### 3.13 Buzz (P3)
1. Post a text message and see it in Most Recent Posts (created post is removed in cleanup).
2. Like and comment on a post; counters update.
3. Upcoming Anniversaries section loads.

### 3.14 Dashboard (P2)
1. All widgets load without console errors.
2. "Employee Distribution" widgets render the real data after F4 cleanup (assert widget is not all "Unassigned" once data is seeded).
3. Quick Launch buttons open Timesheets and My Timesheet.

### 3.15 Cross-cutting (P2)
1. Role-based access: log in as a non-admin employee and confirm Admin and Maintenance are hidden or blocked (needs an ESS user).
2. Console and network: no uncaught JS errors on the main pages.
3. Accessibility basics: each form field has a label; buttons have text.
4. Session timeout: an idle session redirects to login on the next action.

---

## 4. Test data and automation notes

- Use a unique suffix per run (timestamp) for every record created, and delete it in `afterEach`/teardown.
- Filter lists by the unique name before asserting; do not assert on totals or on row position (F2).
- Set up the leave period once in a global setup (F1).
- Keep credentials in `.env` / GitHub secrets (the repo already reads app credentials from secrets). Do not hard-code them.
- Page Object Model per module (Admin, PIM, Leave, Time, Recruitment, Performance, MyInfo, Directory, Claim, Buzz, Dashboard, Maintenance).
- Suggested smoke suite (P1 items above) for CI on each deploy; full regression nightly.

---

## 5. Open questions and not yet explored

- Exact routes for Corporate Branding, Nationalities, Qualifications, Recruitment Candidates/Vacancies, and Performance My Trackers/Employee Trackers (they render as "#" links; F7).
- Behaviour of Add Employee save, Add User save, and all delete actions. These were not run, because the instruction was read-only exploration on a shared environment (F2).
- Leave flows after the leave period is saved (F1), Time punch in/out, Claim and Buzz write actions.
- Whether `testadmin` is shared by other testers; the shared data in F2 suggests it may be.
