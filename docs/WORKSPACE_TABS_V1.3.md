# Workspace navigation v1.3 — Browser Tabs only

## Confirmed design

The top of Career Advisor CMS uses a **single Browser-style Tabs row**. The separate Breadcrumb / path row and its folder dropdown have been removed based on the latest decision.

- Home is a pinned workspace tab.
- Opening a client, 201/999 Case, or its Form Editor creates or focuses the corresponding resource tab.
- Tab titles include client names (e.g. `Mei Chen · 201 Case`) to prevent two clients' identically numbered Case tabs from being confused.
- Each tab retains its client and case context when switching between workspaces.
- The strip scrolls when many tabs are open. **Open (N)** lists them in a dropdown.
- Each removable tab has an × close action; closing a view does **not** delete the underlying client or Case.
- To find a parent page, switch to its existing client/Case tab; existing **Back to Client** and **Back to Case Detail** links are fallback navigation.
- If a Client Profile edit has unsaved changes, switching to another tab asks for confirmation before discarding them. The demo's Form Editor currently stores edits immediately in browser state.
- Open tab positions are not yet persisted across browser refresh. This remains a design/implementation decision.

## Version boundaries

**Homepage Wireframe v1.0** is unchanged (greeting, search, shortcuts, appointments, tasks, enrolled list and synthetic client data). Only the navigation shell changes to **v1.3**.

Earlier v1.1/v1.2 Breadcrumb exploration is archived in `WORKSPACE_BREADCRUMB_V1.1.md` and is **not** part of the current UI.

## Still open for future discussion

The profile, document library, signatures, activities, Exit, Follow-up, PDF Form Editor, Calendar, To-do and data persistence screens are **not finalized**; see `OPEN_DESIGN_DECISIONS.md`.