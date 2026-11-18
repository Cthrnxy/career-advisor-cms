# Career Advisor CMS — Workflows

- Internal recordkeeping prototype, not a government system integration.
- Client profile status is editable and independent from Case status.
- Start New Enrollment asks for form type 201 or 999 and creates an independent Draft Case.
- A unified Enrollment Records table contains all form types; opening an existing case does not create a new one.
- Enrollment Form is accessed within Case Detail, not a standalone Client Profile section.
- Activities can be recorded anytime; Job Search services are independent of enrollment.
- Exit date may default to the last Job Searching date, but is editable.
- Exit Evidence supports separate Select Existing File and Upload New File flows.
- Uploading a file alone does not mark a Case Exited.
- Follow-up rounds: 201 has four; 999 has one.
- Each Follow-up round is independent, editable out of order, and counts as complete only when Completed Date AND its own file are saved.
- File references are stored in Client Documents and linked to the matching Follow-up. This remains a filename-only frontend prototype.
- After the final required round has BOTH a Completed Date and file, Case Status is Complete.
- Exited Cases enter Follow-up starting the next calendar quarter, not three months after their exact Exit day.
- Homepage shows at most five Enrolled Cases and five currently due Follow-up Cases. Click a Case to open Case Detail; View All opens the complete Case list.
- Ready for Enroll lists Client names; names open Client Profile.
- Case Detail Follow-up Records is a four-column table: Round, Completed Date, File, Edit, without Period/Status columns.
- This prototype uses fictional client data. No actual file bytes are uploaded or saved.
