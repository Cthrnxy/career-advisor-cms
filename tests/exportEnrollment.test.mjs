import test from 'node:test';
import assert from 'node:assert/strict';
import {buildEnrollmentReviewHtml} from '../src/features/enrollment/exportReviewHtml.js';

test('export produces a printable, clearly non-official enrollment review copy',()=>{
 const html=buildEnrollmentReviewHtml({
   clientName:'Mei Chen', values:{firstName:'Mei',lastName:'Chen',workRoute:'A',listA:'U.S. Passport'},
   issues:[{page:1,label:'Selective Service',message:'Choose registration evidence.'}],
   pendingPages:['Unemployment & Benefits','Education & School']
 });
 assert.match(html,/NOT AN OFFICIAL OEWD FORM/);
 assert.match(html,/Print \/ Save as PDF/);
 assert.match(html,/Mei Chen/);
 assert.match(html,/Review issues \(1\)/);
 assert.match(html,/Pages not mapped \(2\)/);
 assert.match(html,/Not applicable/);
});
test('export escapes participant and form data instead of injecting markup',()=>{
 const html=buildEnrollmentReviewHtml({
   clientName:'<script>alert(1)</script>',values:{firstName:'<img src=x onerror=alert(1)>'},
   issues:[{page:1,label:'<unsafe>',message:'"unexpected"'}]
 });
 assert.ok(!html.includes('<script>alert(1)</script>'));
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
 assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.match(html,/&lt;unsafe&gt;/);
});
