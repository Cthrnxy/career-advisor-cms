# Homepage v2.0 and Client Profile v2.0 — Confirmed UI

Both screens use existing Browser-style Tabs v1.3 (no top breadcrumb bar). Client Profile and Case Detail display their own small hierarchical back links.

## Homepage
- **Enrolled (Not Exited):** Case-based; display at most five records with Client Name, Program, Form Type, Enrollment Date, Last Activity, Days Enrolled. Clicking opens **that Case Detail**. View All opens full Enrolled Case list.
- **Follow-up:** Case-based; display at most five records with Client, Program, Form Type, Exit Date, Status (Follow-up N only). Clicking opens **that Case Detail**. View All opens all currently due Follow-up Cases.
- **Ready for Enroll:** Client-based; click Quick Access to view a list of names; each name opens **Client Profile**, never an automatic Case.
- A single client can have multiple 201 and 999 Cases that appear in either Homepage case-based table independently.
- Other Homepage v1.0 elements (greeting, client search/suggestions, Add New Client, Appointments, To-do) are retained.

## Follow-up logic
- Exit quarter determines when each next-quarter follow-up starts: May and June Exit both yield July follow-up start.
- The allowed follow-up completion window is the whole quarter, e.g. July–September.
- Each 201 Case has four rounds, each 999 Case one. Every round independently editable regardless of previous completion order.
- A round is complete only when **Completed Date AND its independent Document** exist.
- Homepage only shows the earliest incomplete round whose quarter has begun. A completed round is skipped; a completed FU1 with FU2 not due yet hides the Case until FU2's quarter starts.
- An overdue earlier incomplete round remains the Case's displayed status, even if newer rounds are also due.
- The Follow-up table never uses a separate Document Status column.

## Client Profile
- Internal path: Clients > Client Name; personal information and editable employment/client status; Enrollment Records table (per independent Case); central Documents; separate Signatures; Client Visits / Job Search notes.
- The user can start a 201/999 case, open an existing Case, record visits, or add/replace file references without switching between multiple client records.
- Documents are still file-name-only demo records stored in browser localStorage; no actual client evidence/IDs or signatures are transmitted.

## Case Detail (minimum update to support homepage)
- Clicking Homepage Case opens Case Detail directly.
- Follow-up Records uses a compact table: Follow-up, Completed Date, File, Action (Edit). No Period or standalone Status column.
- Edit always opens the relevant per-round Modal and supports Select Existing File or Upload New File.
- Uploading saves its filename under Client Documents and links that unique file to the round; replacing file updates the same client library reference.
- Completion is retained per Follow-up and editing is possible out of order.

## Still future work
PDF form field mapping, real file storage and preview, full document audit/version history, program-based readiness checklist validation, calendar scheduling and backend permissions require separate specification.


## Homepage v3.0 — Custom Dashboard in Settings
- Settings > Customize Homepage controls dashboard module visibility and order, and chooses Comfortable or Compact spacing.
- Modules: Quick Access, Appointments, To-do, Enrolled (Not Exited), Follow-up.
- Client search, sidebar navigation, and workspace tabs are always available, even when every optional module is hidden.
- Default arrangement matches Homepage v2.0. Appointments and To-do can share a row; larger modules use a full-width row.
- Homepage Enrolled and Follow-up previews remain capped at **five Cases** each, regardless of visual customization; View All goes to the complete appropriate Case list.
- Preference changes apply immediately and are saved in a separate browser localStorage key; no backend, user-account sync, or cross-device persistence.
- Layout preferences do not change any Case business rules or underlying data.
