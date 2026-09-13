// Source: AI_Janala_MOPA_Survey_ProofOfConcept.csv (500 responses, quota
// sample across 6 user personas: BCS Cadre, Student, Banker, Small Business
// Owner, IT Professional, Housewife). Aggregated once at build time; the raw
// file is served as-is at /data/ai-janala-survey-responses.csv for download.

export interface Count {
  label: string;
  count: number;
}

export interface RecommendByPersona {
  persona: string;
  n: number;
  yes: number;
  maybe: number;
  no: number;
}

export interface RecommendByClarity {
  clarity: number;
  n: number;
  yesPct: number;
}

export interface HeatRow {
  persona: string;
  [column: string]: string | number;
}

export const SURVEY = {
  n: 500,
  districts: 10,
  dhakaShare: 32.4,
  avgClarity: 3.89,
  avgTrust: 3.85,
  recommendYesPct: 63.8,
  bengaliInclusivePct: 77.0,
  phonePct: 63.4,

  persona: [
    { label: "BCS Cadre", count: 100 },
    { label: "Student", count: 100 },
    { label: "Banker", count: 100 },
    { label: "Small Business Owner", count: 100 },
    { label: "IT Professional", count: 50 },
    { label: "Housewife", count: 50 },
  ] as Count[],

  channel: [
    { label: "Facebook/WhatsApp", count: 191 },
    { label: "LinkedIn", count: 111 },
    { label: "Friend or family", count: 108 },
    { label: "University", count: 45 },
    { label: "Other", count: 45 },
  ] as Count[],

  district: [
    { label: "Dhaka", count: 162 },
    { label: "Chattogram", count: 57 },
    { label: "Rajshahi", count: 51 },
    { label: "Cumilla", count: 43 },
    { label: "Khulna", count: 36 },
    { label: "Sylhet", count: 34 },
    { label: "Rangpur", count: 32 },
    { label: "Barishal", count: 31 },
    { label: "Mymensingh", count: 28 },
    { label: "Bogura", count: 26 },
  ] as Count[],

  language: [
    { label: "Bengali", count: 192 },
    { label: "Both", count: 193 },
    { label: "English", count: 115 },
  ] as Count[],

  device: [
    { label: "Phone", count: 317 },
    { label: "Laptop or desktop", count: 150 },
    { label: "Tablet", count: 33 },
  ] as Count[],

  topic: [
    { label: "AI and jobs", count: 127 },
    { label: "AI in government or policy", count: 104 },
    { label: "What AI is", count: 97 },
    { label: "How to grow a business", count: 51 },
    { label: "Code generation", count: 27 },
    { label: "Banking automation", count: 26 },
    { label: "Scholarships / studies", count: 20 },
    { label: "Marketing", count: 19 },
    { label: "Education for kids", count: 15 },
    { label: "Daily life", count: 14 },
  ] as Count[],

  pain: [
    { label: "No answer given", count: 191 },
    { label: "A bit confusing on specific government policies", count: 97 },
    { label: "Missed some local Bangladesh context", count: 92 },
    { label: "Could be simpler", count: 75 },
    { label: "Some Bengali phrasing was slightly unnatural", count: 9 },
    { label: "No, it was helpful", count: 8 },
    { label: "Nothing, it was very clear", count: 8 },
    { label: "All good", count: 6 },
    { label: "Did not fully grasp the regional context", count: 6 },
    { label: "Answers were a bit too long", count: 5 },
    { label: "Too technical", count: 3 },
  ] as Count[],

  improve: [
    { label: "Include more local examples", count: 82 },
    { label: "Make it faster", count: 78 },
    { label: "Offline support through SMS", count: 73 },
    { label: "Add voice input in Bengali", count: 68 },
    { label: "Better regional language understanding", count: 67 },
    { label: "More accurate financial terminology in Bengali", count: 16 },
    { label: "Include loan information or SME resources", count: 16 },
    { label: "Information on scholarships", count: 15 },
    { label: "Ensure strict data privacy", count: 14 },
    { label: "Provide business advice in simple Bangla", count: 14 },
    { label: "Help with specific university subjects", count: 11 },
    { label: "Add circular references", count: 10 },
    { label: "Data on Bangladesh Bank regulations", count: 9 },
    { label: "More technical depth", count: 9 },
    { label: "Integrate directly with MOPA guidelines", count: 7 },
    { label: "Citations for claims", count: 6 },
    { label: "API access", count: 5 },
  ] as Count[],

  clarityHist: [
    { label: "2", count: 23 },
    { label: "3", count: 156 },
    { label: "4", count: 173 },
    { label: "5", count: 148 },
  ] as Count[],

  trustHist: [
    { label: "2", count: 45 },
    { label: "3", count: 145 },
    { label: "4", count: 150 },
    { label: "5", count: 160 },
  ] as Count[],

  recommend: [
    { label: "Yes", count: 319 },
    { label: "Maybe", count: 124 },
    { label: "No", count: 57 },
  ] as Count[],

  recommendByPersona: [
    { persona: "BCS Cadre", n: 100, yes: 63.0, maybe: 27.0, no: 10.0 },
    { persona: "Student", n: 100, yes: 69.0, maybe: 19.0, no: 12.0 },
    { persona: "Banker", n: 100, yes: 65.0, maybe: 25.0, no: 10.0 },
    { persona: "Small Business Owner", n: 100, yes: 57.0, maybe: 26.0, no: 17.0 },
    { persona: "IT Professional", n: 50, yes: 72.0, maybe: 20.0, no: 8.0 },
    { persona: "Housewife", n: 50, yes: 58.0, maybe: 34.0, no: 8.0 },
  ] as RecommendByPersona[],

  recommendByClarity: [
    { clarity: 2, n: 23, yesPct: 34.8 },
    { clarity: 3, n: 156, yesPct: 35.3 },
    { clarity: 4, n: 173, yesPct: 79.2 },
    { clarity: 5, n: 148, yesPct: 80.4 },
  ] as RecommendByClarity[],

  heatLanguage: [
    { persona: "BCS Cadre", Bengali: 29.0, Both: 43.0, English: 28.0 },
    { persona: "Student", Bengali: 17.0, Both: 69.0, English: 14.0 },
    { persona: "Banker", Bengali: 7.0, Both: 52.0, English: 41.0 },
    { persona: "Small Business Owner", Bengali: 89.0, Both: 11.0, English: 0.0 },
    { persona: "IT Professional", Bengali: 4.0, Both: 32.0, English: 64.0 },
    { persona: "Housewife", Bengali: 96.0, Both: 4.0, English: 0.0 },
  ] as HeatRow[],

  heatDevice: [
    { persona: "BCS Cadre", Phone: 58.0, "Laptop/desktop": 33.0, Tablet: 9.0 },
    { persona: "Student", Phone: 79.0, "Laptop/desktop": 19.0, Tablet: 2.0 },
    { persona: "Banker", Phone: 39.0, "Laptop/desktop": 54.0, Tablet: 7.0 },
    { persona: "Small Business Owner", Phone: 88.0, "Laptop/desktop": 5.0, Tablet: 7.0 },
    { persona: "IT Professional", Phone: 14.0, "Laptop/desktop": 78.0, Tablet: 8.0 },
    { persona: "Housewife", Phone: 92.0, "Laptop/desktop": 0.0, Tablet: 8.0 },
  ] as HeatRow[],
} as const;

export const CHART_COLORS = {
  brandGreen: "#006A4E",
  brandGreenDark: "#00543E",
  brandGreenLight: "#E6F2EE",
  blue: "#2a78d6",
  orange: "#eb6834",
  aqua: "#1baf7a",
  red: "#e34948",
  neutral: "#9a9990",
};