const PAYSLIP_EXTRACTION_PROMPT = `You are an expert at reading Indian salary payslips (PDF/image).
Extract all visible financial and employment data. Amounts must be numbers in INR (no currency symbols).
If a field is missing, use 0 for numbers and null for strings.

Return ONLY valid JSON (no markdown):
{
  "basicSalary": number,
  "hra": number,
  "specialAllowance": number,
  "otherAllowances": number,
  "grossSalary": number,
  "pf": number,
  "professionalTax": number,
  "tax": number,
  "otherDeductions": number,
  "totalDeductions": number,
  "bonus": number,
  "netSalary": number,
  "employerName": string or null,
  "employeeName": string or null,
  "employeeId": string or null,
  "designation": string or null,
  "panNumber": string or null,
  "payPeriod": string or null,
  "month": number (1-12) or null,
  "year": number (4 digits) or null
}`;

const normalizeExtractedPayslip = (raw = {}) => ({
  basicSalary: Number(raw.basicSalary) || 0,
  hra: Number(raw.hra) || 0,
  specialAllowance: Number(raw.specialAllowance) || 0,
  otherAllowances: Number(raw.otherAllowances) || 0,
  grossSalary: Number(raw.grossSalary) || 0,
  pf: Number(raw.pf) || 0,
  professionalTax: Number(raw.professionalTax) || 0,
  tax: Number(raw.tax) || 0,
  otherDeductions: Number(raw.otherDeductions) || 0,
  totalDeductions: Number(raw.totalDeductions) || 0,
  bonus: Number(raw.bonus) || 0,
  netSalary: Number(raw.netSalary) || 0,
  employerName: raw.employerName || null,
  employeeName: raw.employeeName || null,
  employeeId: raw.employeeId || null,
  designation: raw.designation || null,
  panNumber: raw.panNumber || null,
  payPeriod: raw.payPeriod || null,
  month: raw.month ? Number(raw.month) : null,
  year: raw.year ? Number(raw.year) : null,
});

const parseGeminiJson = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Invalid JSON response from AI');
  return JSON.parse(cleaned.slice(start, end + 1));
};

module.exports = {
  PAYSLIP_EXTRACTION_PROMPT,
  normalizeExtractedPayslip,
  parseGeminiJson,
};
