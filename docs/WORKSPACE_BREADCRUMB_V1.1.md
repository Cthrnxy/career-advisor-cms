# Archived — Workspace Breadcrumb navigation (v1.1–v1.2)

**Superseded by the user's choice to keep Browser-style Tabs only (v1.3).** This document records an earlier exploration and does not describe the active navigation.

# Workspace navigation v1.2 — Browser Tabs + Breadcrumb

Final navigation direction: **Browser-style work tabs on the first row**, **hierarchical breadcrumb on the second row**.

## Responsibility of each control

- Tabs switch between the open client, case and form workspaces without re-searching. An open resource is uniquely keyed by client ID and, for Case/Form, its case ID. A 201 case belonging to one client is not conflated with another client's 201 case.
- The Home tab is permanently present. The remaining tabs have close buttons. Closing one only closes the view; it does not delete client records or cases.
- When tabs no longer fit horizontally, the strip scrolls. The "Open (N)" dropdown independently lists all open tabs.
- Breadcrumb shows the current **parent hierarchy**, not the history of previously visited pages: e.g. NJC > Clients > Mei Chen > 201 Case > Form Editor. Clicking any ancestor returns to that level.
- The breadcrumb folder collects **only hidden earlier ancestor segments** when the path is too long, keeping the last two levels visible.
- Switching away from an edited Client Profile with unsaved field changes requires confirmation before discarding. Case Form Editor demo fields currently update local browser state immediately.
- Open workspace tabs reset on browser refresh in this prototype; saving the tab layout or individual unsaved form drafts for later sessions remains a future decision.

## Sample paths

Home: NJC > Homepage
Client: NJC > Clients > Mei Chen
201 Case: NJC > Clients > Mei Chen > 201 Case
Form Editor: NJC > Clients > Mei Chen > 201 Case > Form Editor

## Versions and constraints

Homepage Wireframe v1.0 stays unchanged: greeting, client search, Quick Access, Today's Work, Enrolled (Not Exited), and existing synthetic clients.
The Breadcrumb overflow from Header v1.1 is preserved, now paired with Browser Tabs in navigation v1.2.
No new decisions for Client Detail, Case Detail, Form Editor, Documents or Calendar are assumed from this navigation change. See docs/OPEN_DESIGN_DECISIONS.md.
