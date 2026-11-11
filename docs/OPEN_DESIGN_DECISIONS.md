# Open design decisions — Career Advisor CMS

This is the **discussion backlog**, not a specification claiming unresolved interactions are finalized. It reflects the current React prototype and previously agreed workflow rules.

## Confirmed / preserve these

- Homepage Wireframe v1.0 remains the baseline (greeting, search, Quick Access, appointments, To-do, enrolled list).
- Top navigation v1.3: Browser-style Tabs **only**, no separate Breadcrumb row; parent client/case views remain reachable through their open tabs and the existing Back to Client / Back to Case actions.
- Client Profile contains one combined 201/999 Enrollment Records table; each row opens its independent Case Detail.
- Start New Enrollment explicitly selects 201 or 999 and creates an independent Draft; a profile edit or file upload does not generate a case.
- Client status and Case status are separate.
- Activities can be added without a forced order; Exit date can default to last Job Searching, but is editable.
- 201 has four Follow-up rounds; 999 has one; File Pending is allowed; final round makes the case Complete without blocking edits.

## Not yet settled — later pages

### 1. Client Detail & client management (next recommended discussion)
- Decide the hierarchy and layout of Client Information, Enrollment Records, Documents, Signatures, Job Search Visits and service notes.
- Determine details of Ready for Enroll checklist and its difference across programs; current mock display and readiness calculation are not a finalized business rule.
- Sorting, searching, empty states and filtered lists for a real workload with many clients.
- Whether a new visit requires a new activity or remains client-level job-search support independent of a Case.

### 2. Documents & Signatures
- Should an uploaded Case evidence document automatically appear in the client-level file library? Not yet decided.
- Actual file preview, upload, replace, missing docs and file version history. Evidence must eventually reference a specific document **version**, so replacing a file does not rewrite past evidence.
- Exact document categories, employer signatures vs client signatures, multi-file grouping and permissions.
- Current prototype stores filenames only and does not transfer real files.

### 3. Case Detail, Activities, Exit and Follow-ups
- Layout for editing/deleting existing activities, exit and follow-ups; audit trail for changed records.
- Whether Draft or Enrolled case summary fields require visual review cues, and how the enrollment confirmation looks.
- Case-specific evidence picker/preview, File Pending state, and intuitive post-exit revisions.
- Four follow-ups as a timeline vs rows/stepper; notes, linked versions, pending states and deadline indicators.
- No hard evidence gate is assumed: caseworkers need flexible recording/backfills.

### 4. 201 / 999 Form Editor
- Real PDF mapping and preview (left form editor, right PDF page), page navigation, skip logic and validation hints.
- Save Draft, PDF download/export and a clear indication of mapped vs unmapped fields.
- Managing and recovering *unsaved* per-case form drafts when switching or closing tabs; the current demo edits save immediately to local browser storage.

### 5. Calendar, appointments, To-do and Workday
- Appointment creation/edit/reschedule, link to client profiles, notifications and calendar view.
- Tasks manually created vs auto-generated (e.g. quarterly Follow-up), completion, postponement, sorting and assignment.
- Whether "View All" leads to Calendar, Workday or a distinct task manager. Current Home examples are fictional.

### 6. App-wide decisions and future implementation
- Program workspace/root selection (NJC/HCA/HOSP), independent of the removed Breadcrumb: decide if this affects search scope, dashboard, or client lists.
- Persisting open tabs and drafts across refresh/devices, handling simultaneous edits and restoring closed tabs.
- Reusable component design system, backend data layer, user permissions, secure document storage and audit logs.
- Existing Vercel preview is protected; the GitHub repository is separate from the old PDF desktop project.

## Review order

Suggested sequence: Client Detail → Documents/Signatures → Case Detail and Follow-ups → Form Editor → Calendar/To-do. Discuss these one screen at a time; no invented implementation requirement should be treated as approved.
