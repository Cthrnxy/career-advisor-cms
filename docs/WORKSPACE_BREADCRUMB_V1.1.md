# Workspace Breadcrumb Header v1.1

Replaces the former WorkspaceTabs component. This is a **hierarchical page path**, not recently opened tabs, browser history, or an in-page section menu.

## Navigation paths

- Home: \`NJC > Homepage\`
- Clients: \`NJC > Clients\`
- Enroll Clients: \`NJC > Enroll Clients\`
- Client Detail: \`NJC > Clients > Mei Chen\`
- Case Detail: \`NJC > Clients > Mei Chen > 201 Case\` (or 999)
- Form Editor: \`NJC > Clients > Mei Chen > 201 Case > Form Editor\`
- Calendar: \`NJC > Calendar\`
- Settings: \`NJC > Settings\`

## Overflow / folder behavior

- If the hierarchy is long (more than 4 levels), or the rendered width cannot show it comfortably, show the folder overflow button.
- The folder contains **only hidden earlier ancestors of the current path**, ordered from the root to the nearer parent.
- The last two levels stay visible. The **current** page is always the rightmost visible level.
- Clicking an ancestor (inline or in the folder dropdown) navigates to that level, preserving the selected client and case where relevant.
- Clicking the folder toggles the dropdown; clicking outside or pressing Escape closes it.
- Short paths are fully visible and do not show the folder.
- The client-specific section menus remain inside the Client Detail / Case Detail pages; they are NOT part of breadcrumb overflow.

## Versioning

Homepage layout, Quick Access, Appointments, To-do, Enrolled (Not Exited), and seeded fictional client information remain **Homepage Wireframe v1.0**. Only the top workspace navigation changes to **Header v1.1**.
