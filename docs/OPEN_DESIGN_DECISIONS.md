# Open design decisions — Career Advisor CMS

This is the **discussion backlog**, not a specification claiming unresolved interactions are finalized. It reflects the current React prototype and previously agreed workflow rules.

## Confirmed / preserve these

- Homepage v2.0 extends the v1.0 greeting, search, Quick Access, Appointments and To-do design with Enrolled and Follow-up Case-based tables, each showing at most five records and linking directly to Case Detail. See `HOMEPAGE_CLIENT_PROFILE_V2.md`.
- Navigation v4.0: browser-style top Tabs removed. A unified breadcrumb appears at the top left on non-Home pages; it has clickable hierarchy and an explicit Back button following actual recent navigation. See `HOMEPAGE_CLIENT_PROFILE_V2.md`.
- Client Profile contains one combined 201/999 Enrollment Records table; each row opens its independent Case Detail.
- Start New Enrollment explicitly selects 201 or 999 and creates an independent Draft; a profile edit or file upload does not generate a case.
- Client status and Case status are separate.
- Activities can be added without a forced order; Exit date can default to last Job Searching, but is editable.
- 201 has four Follow-up rounds; 999 has one. All rounds are editable without a strict order. A round is complete only when BOTH Completed Date and independent Document are present. Finished Case status is Complete; editing remains allowed.

## Not yet settled — later pages

### 1. Client Detail & client management (next recommended discussion)
- Decide the hierarchy and layout of Client Information, Enrollment Records, Documents, Signatures, Job Search Visits and service notes.
- Determine details of Ready for Enroll checklist and its difference across programs; current mock display and readiness calculation are not a finalized business rule.
- Sorting, searching, empty states and filtered lists for a real workload with many clients.
- Whether a new visit requires a new activity or remains client-level job-search support independent of a Case.

### 2. Documents & Signatures
- Follow-up new files appear in Client Documents and are linked to the corresponding round (confirmed). Exact replacement/version retention and permissions for future production storage still need engineering review.
- Actual file preview, upload, replace, missing docs and file version history. Evidence must eventually reference a specific document **version**, so replacing a file does not rewrite past evidence.
- Exact document categories, employer signatures vs client signatures, multi-file grouping and permissions.
- Current prototype stores filenames only and does not transfer real files.

### 3. Case Detail, Activities, Exit and Follow-ups
- Layout for editing/deleting existing activities, exit and follow-ups; audit trail for changed records.
- Whether Draft or Enrolled case summary fields require visual review cues, and how the enrollment confirmation looks.
- Case-specific evidence picker/preview, File Pending state, and intuitive post-exit revisions.
- Follow-up records use a compact Table: Round, Completed Date, File, Edit (no Period or Status columns). Future work: change history, linked file preview and clear saving feedback.
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
