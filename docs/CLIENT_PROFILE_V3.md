# Client Profile: service recording

Implemented from the November 25 design decisions.

- Quick creation requires name and phone. Service date defaults to local today and is editable. First comment is optional.
- Client service dates and comments are independent of Enrollment dates and Case activities.
- Current Needs is free text with its own editor beneath basic information.
- Header retains Start New Enrollment and Edit Profile, with Add Visit and New Appointment.
- Add/Edit Visit uses a dialog with date and comment. Records can be deleted after confirmation. No change-history interface.
- Latest five visits display newest first; View All expands the list. Existing service labels and comments are retained.
- Appointments sit between Enrollment Records and Visits. Basic creation links the current client, requires a date and allows optional time. Full Calendar/details/history design is the next module; the existing Calendar and homepage appointment examples remain separate for now.
- Everything remains synthetic browser-local demo data. No backend integration.

Validation: existing 21 tests and Vite build passed. A temporary React interaction harness verified required phone, creating a client with its first comment, editing needs, visit add/edit/delete, five-row expansion, appointment creation without time, and persistence after remount. Visual browser inspection was not performed.
