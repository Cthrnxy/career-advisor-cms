# Case evidence and enrollment workflow

Confirmed design:
- Draft allows missing evidence and incomplete form fields.
- 201 export requires (List A OR List B + List C), a client signature, and either an employer signature or a CA-selected Employment Verification Case file. Paystub-only eligibility remains undecided.
- Profile uploads may be unclassified, or contain multiple specific List A/B/C evidence entries.
- Case imports copy both metadata and binary content into independent IndexedDB records.
- Evidence selections in the editor come from Case copies, not the live Profile.
- Case EV/Exit/Follow-up uploads are stored inside the Case, not in Profile.
- Attachment packages include Case-owned files, selected signature copies and a manifest (.tar).
- Completed official export leads to In Process; application number leads to Enrolled.
- Existing historical Enrolled Cases remain unchanged.

Implemented: evidence classification on upload/edit, independent file/signature copies, Case uploads and attachment archive, auto evidence selections, export gates, In Process homepage module, application-number transition and last editor page persistence.

The 201 editor now maps all 573 widgets in the 12-page main application, preserves original field order and section labels, renders the actual PDF, and exports an editable PDF with independent Case attachments. The blank template was rebuilt from the user-provided PY 2026–27 copy with filled widget values removed; the original uploaded customer PDF is not a repository asset.

IEP continues to use the original form as a separate uploaded Case attachment. It is included unchanged in attachment/export packages, not appended to the 12-page 201 application. The IEP activity type remains available. No new IEP requirement or eligibility gate is introduced.

The editor offers Save and Leave / Discard Changes / Continue Editing, and selective Profile-field change review. Required identity/evidence checks and implemented original consistency rules gate export; CA review of applicable fields is recorded for every page. This is not a claim that every original backend validation has been ported. Drafts and exported packages remain browser-local. 999 mapping/export rules remain pending.

Validation: unit tests, editable PDF field readback, PDF page render inspection and production build. Browser interaction QA remains unavailable due to the preview access policy; component interaction checks cover consecutive saves, discard, explicit Profile updates, incomplete export blocking and section persistence. Navigation dialogs and visual layout still need browser review before release.

## ui-redesign decisions and implementation

- All subsequent commits belong to `ui-redesign`; no additional main updates.
- 999 requires a CA-designated ID file, IEP file, client signature and CA signature; employer signature is optional. The same readiness helper protects state transitions.
- CA assigns EV / ID / IEP from actual Case attachments. Filenames do not automatically satisfy these requirements. Removing a selected file invalidates readiness.
- New enrollment suggests the most recent 201/999 Case; CA can choose another or no copy. Copied values are independent, editable suggestions. Dates, signatures, application numbers, attachments, completion and review status are excluded.
- Current cross-form prefill covers mapped common answers (contact, household/income, and available legacy employment/language answers). Same-form 201 also copies non-date answer fields from its known schema. Full 999 demographic/education cross-mapping is pending its PDF field inventory.
- Optional training-supplement selection is saved on 999 Cases. Main and training PDF editors/export are still pending; selection alone does not claim completion or permit export.
- The original 999 main PDF exists in the source repository but its >1 MB binary contents are not returned by the connected Contents API; the smaller training PDF is retrievable. A usable main PDF is needed to complete exact fields and export.
