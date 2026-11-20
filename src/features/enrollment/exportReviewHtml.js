/* Printable review copy for prototype demos, not an official OEWD PDF or enrollment action. */
const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[ch]));
const PRINT_FIELDS = [
  ['Page 1 · Work Authorization', [
    ['Document route', 'workRoute'], ['List A document', 'listA'], ['List B document', 'listB'],
    ['List C document', 'listC'], ['Selective Service', 'selectiveRoute'],
    ['Evidence / exemption', 'selectiveEvidence']]],
  ['Page 2 · Adult Eligibility', [
    ['Adult eligibility', 'adultEligibility'], ['Family size', 'familySize'],
    ['Annual family income', 'annualIncome'], ['Public benefits', 'publicBenefit']]],
  ['Page 3 · Application & Contact', [
    ['Agency', 'agency'], ['Application date', 'applicationDate'], ['Application number', 'applicationNumber'],
    ['First name', 'firstName'], ['Last name', 'lastName'], ['Phone', 'phone'], ['Email', 'email'],
    ['Residential address', 'address'], ['City', 'city'], ['State', 'state'], ['ZIP', 'zip'], ['County', 'county']]],
  ['Page 4 · Language & Employment', [
    ['Primary language other than English', 'otherLanguage'], ['Language', 'language'],
    ['Farmworker status', 'farmworker'], ['Veteran status', 'veteran'],
    ['Employment status', 'employment'], ['Weeks unemployed', 'unemployedWeeks']]]
];
const notApplicable = (value,key) =>
  (key==='listA' && value.workRoute==='BC') ||
  ((key==='listB'||key==='listC')&&value.workRoute==='A') ||
  (key==='language' && value.otherLanguage==='No') ||
  ((key==='familySize'||key==='annualIncome')&&value.adultEligibility!=='income') ||
  (key==='publicBenefit' && value.adultEligibility!=='benefits');

export function buildEnrollmentReviewHtml({clientName, values = {}, issues = [], pendingPages = []}) {
  const body = PRINT_FIELDS.map(([title,fields]) =>
    '<section><h2>'+escape(title)+'</h2><table><tbody>'+
    fields.map(([label,key])=>'<tr><th>'+escape(label)+'</th><td>'+
      (notApplicable(values,key)?'<i>Not applicable</i>':escape(values[key]||'—'))+'</td></tr>').join('')+
    '</tbody></table></section>').join('');
  const issueContent = issues.length ?
    '<ol>'+issues.map(item=>'<li><strong>Page '+escape(item.page)+' · '+escape(item.label)+':</strong> '+escape(item.message)+'</li>').join('')+'</ol>' :
    '<p>No issues found on the four mapped pages (other pages not assessed).</p>';
  const pending = pendingPages.map((label,i)=>'<li>Page '+(i+5)+' · '+escape(label)+'</li>').join('');
  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>201 Enrollment - Prototype Review Copy</title>',
    '<style>',
    '*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#243447;background:#f5f7fa;margin:0}',
    '.toolbar{padding:15px 24px;background:#25394c;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:14px}',
    '.toolbar button{font:inherit;padding:10px 16px;background:white;color:#25394c;border:0;border-radius:6px;cursor:pointer}',
    '.paper{width:min(850px,94%);margin:30px auto;background:#fff;padding:36px;box-shadow:0 2px 18px #30405022}',
    'h1{font-size:22px;margin:0 0 8px}p{line-height:1.5}small,.muted{color:#657687}',
    '.warning{border:1px solid #dbbd9c;background:#fff7ec;border-radius:8px;padding:14px;margin:20px 0}',
    '.warning strong{display:block;font-size:13px}h2{font-size:15px;margin-top:28px;border-bottom:1px solid #dde3e9;padding-bottom:7px}',
    'table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #e9edf2;vertical-align:top;overflow-wrap:anywhere}',
    'th{width:43%;font-weight:600;color:#617184}li{font-size:12px;line-height:1.6;margin:3px 0}',
    'footer{border-top:1px solid #dde3e9;padding-top:12px;font-size:11px;color:#657687;margin-top:28px}',
    '@page{size:letter;margin:0.65in}',
    '@media print{body{background:#fff}.paper{width:auto;margin:0;box-shadow:none;padding:0}.toolbar{display:none}section{break-inside:avoid}h2{break-after:avoid}}',
    '</style></head><body>',
    '<div class="toolbar"><strong>Prototype enrollment review copy</strong><button type="button" onclick="window.print()">Print / Save as PDF</button></div>',
    '<main class="paper"><h1>201 WIOA Adult · Enrollment Review Copy</h1><p>Client: <strong>'+escape(clientName)+'</strong></p>',
    '<div class="warning"><strong>NOT AN OFFICIAL OEWD FORM</strong><p>This printable prototype reflects only pages 1–4 of a partially mapped application. It is not approved for government submission or proof of enrollment. Use the original PDF workflow for actual cases.</p></div>',
    body,
    '<section><h2>Review issues ('+issues.length+')</h2>'+issueContent+'</section>',
    '<section><h2>Pages not mapped ('+pendingPages.length+')</h2><ol>'+pending+'</ol></section>',
    '<footer>Career Advisor CMS · Browser-only design preview · Not an official 201 Master Application</footer>',
    '</main></body></html>'
  ].join('\n');
}
