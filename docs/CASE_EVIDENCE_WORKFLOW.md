# Case evidence and enrollment workflow

Confirmed design:
- Draft allows missing evidence and incomplete form fields.
- 201 export requires List A OR List B + List C, plus client and employer signature copies.
- Profile uploads may be unclassified, or contain multiple specific List A/B/C evidence entries.
- Case imports copy both metadata and binary content into independent IndexedDB records.
- Evidence selections in the editor come from Case copies, not the live Profile.
- Case EV/Exit/Follow-up uploads are stored inside the Case, not in Profile.
- Attachment packages include Case-owned files, selected signature copies and a manifest (.tar).
- Completed official export leads to In Process; application number leads to Enrolled.
- Existing historical Enrolled Cases remain unchanged.

Implemented: evidence classification on upload/edit, independent file/signature copies, Case uploads and attachment archive, auto evidence selections, export gates, In Process homepage module, application-number transition and last editor page persistence.

Remaining: the current demo maps only pages 1–5 of the 201 form. Pages 6–12 and official PDF rendering/export are not implemented. Official Export remains blocked, and no UI path marks a draft In Process from a printable review copy or an attachments-only package. The tested successful-export state transition is ready for the official export integration. 999 export rules remain undecided.

The previously discussed unsaved-edit three-way dialog and Profile-field change review are still pending. The editor continues to store browser-local drafts. Browser interaction QA was unavailable due to the preview access policy; unit tests and production build were run.
