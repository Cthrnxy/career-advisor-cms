// UI-only 201 form prototype. These checks are design demonstrations, not eligibility determinations.
export const EDITOR_PAGES = [
  'Work Authorization',
  'Eligibility Checklist',
  'Contact & Demographics',
  'Language & Employment',
  'Unemployment & Layoff',
  'Education & School',
  'Barriers & Services',
  'Section 188',
  'Participant Rights',
  'Rights Acknowledgment',
  'Information Release',
  'Photo Release'
];
export const MAPPED_PAGES = 5;
export const LIST_A = ['U.S. Passport', 'Permanent Resident Card (I-551)', 'Employment Authorization Document (I-766)', 'Foreign passport with temporary I-551 stamp', 'Foreign passport with Form I-94 or I-94A', 'Passport from Micronesia or Marshall Islands with Form I-94'];
export const LIST_B = ["Valid Driver's License or ID Card", 'Federal, state or local government ID', 'School ID card with photograph', "Voter's Registration Card", 'U.S. Military card or draft record', 'Military dependent ID card', 'U.S. Coast Guard Merchant Mariner card', 'Native American tribal document (List B)', 'Canadian driver license'];
export const LIST_C = ['Unrestricted Social Security Card', 'Certification of Birth Abroad', 'Original or certified U.S. birth certificate', 'U.S. Citizen ID Card (I-197)', 'Native American tribal document (List C)', 'Resident Citizen ID Card (I-179)', 'DHS employment authorization document'];
export const SELECTIVE_REGISTERED = ['SSS Internet Verification', 'Registration Acknowledgment Letter', 'Selective Service Registration Card', 'Selective Service Verification Form (Form 3A)', 'Stamped Post Office Receipt of Registration', 'Other registration evidence'];
export const SELECTIVE_EXEMPT = ['Born Female', 'Male born on or before December 31, 1959', 'DD-214 (U.S. Military Discharge)', 'Non-U.S. male first entered the U.S. after age 26', 'Other exemption'];
export const ELIGIBILITY_OPTIONS = [
  ['income', 'Option 1 · Income Eligibility'],
  ['benefits', 'Option 2 · Public Benefits'],
  ['homeless', 'Option 3 · Homeless Status'],
  ['skills', 'Option 4 · Basic Skills Deficient']
];
export const UC_STATUS = [
  ['claimantWprs', 'Claimant · referred by WPRS'],
  ['claimant', 'Claimant · not referred by WPRS'],
  ['exhaustee', 'Exhaustee of benefits'],
  ['neither', 'Neither claimant nor exhaustee'],
  ['notApplicable', 'Not applicable']
];
export const LAYOFF_CATEGORY = [
  ['none', 'None of the above'],
  ['1', 'Category 1 · Layoff / termination, eligible for or exhausted UC'],
  ['2', 'Category 2 · Layoff / termination, not UC eligible, workforce attached'],
  ['3', 'Category 3 · Permanent closure or substantial layoff'],
  ['4', 'Category 4 · Employer announced facility closure'],
  ['5', 'Category 5 · Formerly self-employed, unemployed for economic or natural-disaster reasons'],
  ['6', 'Category 6 · Displaced homemaker'],
  ['7', 'Category 7 · Military spouse relocation / job loss'],
  ['8', 'Category 8 · Military spouse unemployed or underemployed']
];
export const DW_GENERAL = ['1','2','3','4','5'];
export const DW_SPECIAL = ['6','7','8'];
export const isDwGeneral = values => DW_GENERAL.includes(values.layoffCategory);
export const isDwSpecial = values => DW_SPECIAL.includes(values.layoffCategory);
export const isDwApplicable = values => isDwGeneral(values) || isDwSpecial(values);
export function enrollmentIssues(values = {}, page) {
  const issues = [];
  const add = (key, label, message, severity = 'missing') => issues.push({page, key, label, message, severity});
  const blank = key => !String(values[key] ?? '').trim();
  if (page === 1) {
    if (blank('workRoute')) add('workRoute', 'Work Authorization', 'Choose List A or List B + List C.');
    if (values.workRoute === 'A' && blank('listA')) add('listA', 'List A document', 'Select an identity and work authorization document.');
    if (values.workRoute === 'BC' && blank('listB')) add('listB', 'List B document', 'Select identity evidence.');
    if (values.workRoute === 'BC' && blank('listC')) add('listC', 'List C document', 'Select employment authorization evidence.');
    if (blank('selectiveRoute')) add('selectiveRoute', 'Selective Service', 'Choose registration evidence or an applicable exemption.');
    if (values.selectiveRoute && blank('selectiveEvidence')) add('selectiveEvidence', 'Selective Service evidence', 'Select the supporting evidence or exemption.');
  }
  if (page === 2) {
    if (blank('adultEligibility')) add('adultEligibility', 'Adult Eligibility', 'Choose one Adult Priority of Service option.');
    if (values.adultEligibility === 'income') {
      if (blank('familySize')) add('familySize', 'Family Size', 'Enter the family size for income eligibility.');
      if (blank('annualIncome')) add('annualIncome', 'Annual Family Income', 'Enter the annual family income.');
      if (!blank('familySize') && (!/^[1-9]\d*$/.test(String(values.familySize)) || Number(values.familySize)>100))
        add('familySize', 'Family Size', 'Enter a reasonable whole number.', 'error');
      if (!blank('annualIncome') && (!/^\d+(\.\d{1,2})?$/.test(String(values.annualIncome)) || Number(values.annualIncome)>10000000))
        add('annualIncome', 'Annual Family Income', 'Enter a valid nonnegative amount.', 'error');
    }
    if (values.adultEligibility === 'benefits' && blank('publicBenefit'))
      add('publicBenefit', 'Public Benefits', 'Select the benefit used as evidence.');
  }
  if (page === 3) {
    if (blank('firstName')) add('firstName', 'First Name', 'Enter the participant’s first name.');
    if (blank('lastName')) add('lastName', 'Last Name', 'Enter the participant’s last name.');
    if (blank('applicationDate')) add('applicationDate', 'Application Date', 'Enter the date after checking the original form instructions.');
    if (values.applicationDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.applicationDate))
      add('applicationDate', 'Application Date', 'Enter a valid date.', 'error');
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      add('email', 'Email', 'Check the email address format.', 'error');
    if (values.zip && !/^\d{5}(-\d{4})?$/.test(values.zip))
      add('zip', 'ZIP Code', 'Enter a five-digit or ZIP+4 code.', 'error');
  }
  if (page === 4) {
    if (blank('otherLanguage')) add('otherLanguage', 'Primary Language', 'Select Yes or No for a primary language other than English.');
    if (values.otherLanguage === 'Yes' && blank('language')) add('language', 'Language', 'Choose or enter the language.');
    if (blank('farmworker')) add('farmworker', 'Farmworker Status', 'Select the applicable farmworker status.');
    if (blank('veteran')) add('veteran', 'Veteran Status', 'Select a veteran status.');
    if (blank('employment')) add('employment', 'Employment Status', 'Select the employment status.');
    if (values.unemployedWeeks && (!/^\d+$/.test(values.unemployedWeeks) || Number(values.unemployedWeeks)>5500))
      add('unemployedWeeks', 'Weeks Unemployed', 'Check the number of weeks.', 'error');
  }
  if (page === 5) {
    if (blank('ucStatus')) add('ucStatus','67 · Unemployment Compensation','Select the participant’s UC status.');
    if (blank('layoffCategory')) add('layoffCategory','68 · Reason for Layoff','Choose the applicable category or None of the above.');
    // The original PDF explicitly skips Q69–90 after "None"; categories 6–8 go to Q73.
    if (isDwGeneral(values)) {
      if (['claimantWprs','claimant'].includes(values.ucStatus) && blank('uiReferral'))
        add('uiReferral','69 · UI Referral','Select the UI referral program or Not Applicable.');
      if (blank('workSearchExempt')) add('workSearchExempt','70 · Exempt from Work Search','Choose Yes or No.');
      if (values.workSearchExempt === 'Yes' && blank('workSearchExemptDate'))
        add('workSearchExemptDate','71 · Exemption Date','Enter the date exempted from work search.');
      if (values.employment?.startsWith('Employed') && blank('wageAdvance'))
        add('wageAdvance','72 · Opportunity to Advance','Choose Yes or No.');
      if (blank('terminationNotice')) add('terminationNotice','73 · Layoff Notice','Choose Yes or No.');
      if (blank('rapidResponse')) add('rapidResponse','76 · Rapid Response','Choose Yes or No.');
      if (values.rapidResponse === 'Yes' && blank('rapidResponseDate'))
        add('rapidResponseDate','77 · Rapid Response Date','Enter the date of the most recent orientation.');
      if (blank('decliningOccupation'))
        add('decliningOccupation','90 · Declining Occupation / Industry','Choose Yes or No.');
    }
    if (isDwSpecial(values) && blank('terminationNotice'))
      add('terminationNotice','73 · Layoff Notice','Choose Yes or No.');
    if (isDwApplicable(values)) {
      for (const [key,label] of [
        ['workSearchExemptDate','71 · Exemption Date'],
        ['projectedLayoffDate','74 · Projected Layoff Date'],
        ['actualLayoffDate','75 · Actual Layoff Date'],
        ['rapidResponseDate','77 · Rapid Response Date']]) {
        const applies = key==='workSearchExemptDate' ? isDwGeneral(values)&&values.workSearchExempt==='Yes'
          : key==='rapidResponseDate' ? isDwGeneral(values)&&values.rapidResponse==='Yes'
          : isDwGeneral(values)&&values.terminationNotice==='Yes';
        if (applies && values[key] && !/^\d{4}-\d{2}-\d{2}$/.test(String(values[key])))
          add(key,label,'Enter a valid date.','error');
      }
      if (isDwGeneral(values) && values.dislocationWage &&
          (!/^\d+(\.\d{1,2})?$/.test(String(values.dislocationWage)) || Number(values.dislocationWage)>100000))
        add('dislocationWage','80 · Dislocation Hourly Wage','Enter a valid nonnegative amount.','error');
    }
  }
  return issues;
}
