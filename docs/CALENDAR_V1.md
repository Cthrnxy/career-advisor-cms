# My Workday and appointments

Approved November 25, 2026: month default, mini calendar and filters, collapsed main navigation; appointments use a right drawer and must link an existing client. Date required, time optional, short optional description. Unscheduled times appear first as Time TBD. Only Not completed / Completed states. Editing and confirmed deletion supported; deleting appointments preserves service history.

Completion requires a short service comment and defaults service date to local today (editable). Save atomically completes appointment and adds a client service record; duplicate completion is ignored. Enrollment dates are independent.

Profile, home and calendar share client appointment data through existing local browser persistence. Home shows up to five upcoming incomplete appointments. No external calendar integration.

Tasks derive from existing case state: draft preparation and enrolled case review are undated; first incomplete follow-up uses existing quarter scheduling. Tasks can be scheduled independently by stage, moved to a different date or unscheduled. Due dates remain separate. Tasks cannot be manually added or checked off independently.

Validation: production build, existing 21 tests and four calendar tests passed. Browser verified month view, automatic sidebar collapse, right drawer, no-time appointment save, completion with comment. Synthetic demo appointment/service retained for preview. Approved for push after preview discussion.

Client lookup accepts names with partial/near matches and normalized phone numbers. Exact unique phones prefill names for explicit selection; shared phones show choices. No match offers create-and-select without losing appointment inputs. Double-click a month date or empty cell to add an appointment; single click selects it.

Latest validation: build and 28 tests passed. Browser access was blocked for the last interaction revisions; these revisions have not had a final browser check.
