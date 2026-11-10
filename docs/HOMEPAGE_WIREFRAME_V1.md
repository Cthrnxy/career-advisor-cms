# Homepage Wireframe v1.0 — Approved baseline

Status: **v1.0 (Homepage only)**. Other app modules remain in active prototype development.

## Canonical reference
Based on the agreed November 9 Career Advisor dashboard wireframe, *职业顾问工作台仪表盘.png*.

## Layout and UX contract
1. Collapsible left Sidebar: Home, Enroll Clients, Clients, Calendar, Settings; Add New Client action within sidebar.
2. Browser-style application work tabs: Home, client detail, client list, Case Detail, form editor; open/activate/close without discarding client records.
3. Personalized greeting: "Good morning, Catherine".
4. Prominent search by client name, phone, client ID, or application number. Suggestions may overlay lower content; selecting a suggestion opens the client's profile; Search opens Clients results.
5. **No Program / Status / Funding filters on Homepage**. Filters from older wireframes were removed by the user.
6. Quick Access: Add New Client, Ready for Enroll, Exited.
7. Today's Work: Appointments and To-do (interactive demo checkboxes).
8. Enrolled (Not Exited): client list with Client Name, Program, Enrollment Date, Last Activity, Days Enrolled, row click opens Client Detail.
9. Enrollment form creation remains an explicit action on Client Detail: choose 201 or 999 and create a Draft. Case status and Client Profile status stay independent.

## Previously established synthetic people
- Lihua Zhang — CA-1001, (415) 555-0123, enrolled 201 IHSS, 2026-10-20, last Job Searching 2026-10-27.
- Linda Chen — CA-1045, (650) 555-0199, Ready for Enroll.
- Lisa Wang — CA-1078, (415) 555-0177, Exited.
- Ming Chen — Hospitality OST – Custodial, enrolled 2026-10-18, Job Searching 2026-10-25.
- Wei Liu — Hospitality OST – General, enrolled 2026-10-15, Job Searching 2026-10-24.
- Jason Lee — Job Search Support appointment, previously seeded as CL-1058.
- Mei Chen (CL-1024), Lucy Wang (CL-1076), and their existing demo data remain unchanged.

The screenshot shows three visible Enrolled rows but labels the full list (8). This implementation computes the counter from actual synthetic case records rather than misleadingly showing eight while only three are seeded. Days Enrolled is dynamically computed from enrollment dates.

### Appointments (fictional)
9:30 AM Lihua Zhang — Document Review; 11:00 AM Ming Chen — Enrollment; 2:00 PM Jason Lee — Job Search Support.

### To-do (fictional)
- Follow up with 3 clients (quarterly)
- Collect missing documents – 2 clients
- Process enrollment – Lihua Zhang
- Update case notes – Ming Chen
- Review EV / paystub – 1 client

## Privacy and limitations
Every person, date, ID, application number, appointment and file is synthetic. No client records are pulled from an external system. Browser storage is used only for demo data. Never upload genuine identification, SSNs, signatures or health/financial records. The UI is a prototype, not a government platform.
