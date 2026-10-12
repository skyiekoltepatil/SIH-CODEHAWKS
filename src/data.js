export const applicationsData = [
  {
    id: 'APP-2023-8941',
    schemeName: 'PM-KISAN Samman Nidhi',
    dateApplied: '12 Oct 2023',
    status: 'Approved',
    department: 'Ministry of Agriculture',
  },
  {
    id: 'APP-2023-9022',
    schemeName: 'Ayushman Bharat PM-JAY',
    dateApplied: '15 Oct 2023',
    status: 'Pending',
    department: 'Ministry of Health',
  },
  {
    id: 'APP-2023-9150',
    schemeName: 'Mudra Yojana Loan',
    dateApplied: '18 Oct 2023',
    status: 'Rejected',
    department: 'Ministry of Finance',
  },
];

export const schemesData = [
  {
    id: 'SCH-001',
    name: 'PM-KISAN Samman Nidhi',
    description: 'Income support of ₹6,000/- per year to all landholding farmer families.',
    department: 'Ministry of Agriculture',
    category: 'Agriculture',
    tags: ['Farmer', 'Financial Aid'],
    icon: 'fa-seedling',
  },
  {
    id: 'SCH-002',
    name: 'Ayushman Bharat PM-JAY',
    description:
      'Health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
    department: 'Ministry of Health',
    category: 'Health',
    tags: ['Insurance', 'Healthcare'],
    icon: 'fa-heart-pulse',
  },
  {
    id: 'SCH-003',
    name: 'Stand Up India',
    description:
      'Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one SC/ST borrower and one woman borrower per bank branch.',
    department: 'Ministry of Finance',
    category: 'Business',
    tags: ['Loan', 'Entrepreneurship'],
    icon: 'fa-chart-line',
  },
  {
    id: 'SCH-004',
    name: 'PM Awas Yojana (PMAY)',
    description:
      'Provides affordable housing for the urban and rural poor with an interest subsidy on home loans.',
    department: 'Ministry of Housing',
    category: 'Housing',
    tags: ['Home', 'Subsidy'],
    icon: 'fa-house',
  },
  {
    id: 'SCH-005',
    name: 'Atal Pension Yojana',
    description:
      'A guaranteed pension scheme for unorganized sector workers, providing a minimum pension of ₹1,000 to ₹5,000.',
    department: 'Ministry of Finance',
    category: 'Finance',
    tags: ['Pension', 'Security'],
    icon: 'fa-piggy-bank',
  },
  {
    id: 'SCH-006',
    name: 'Sukanya Samriddhi Yojana',
    description:
      'A savings scheme targeted at parents of girl children to build a fund for their future education and marriage.',
    department: 'Ministry of Women & Child Development',
    category: 'Education',
    tags: ['Girl Child', 'Savings'],
    icon: 'fa-child-dress',
  },
  {
    id: 'SCH-007',
    name: 'PM Shram Yogi Maandhan',
    description:
      'Voluntary and contributory pension scheme for unorganized workers for old age protection.',
    department: 'Ministry of Labour & Employment',
    category: 'Labour',
    tags: ['Workers', 'Pension'],
    icon: 'fa-helmet-safety',
  },
  {
    id: 'SCH-008',
    name: 'Kisan Credit Card (KCC)',
    description:
      'Provides farmers with timely access to adequate credit for agricultural expenses at subsidized interest rates.',
    department: 'Ministry of Agriculture',
    category: 'Agriculture',
    tags: ['Credit', 'Farming'],
    icon: 'fa-credit-card',
  },
  {
    id: 'SCH-009',
    name: 'Digital India Internship',
    description:
      'Opportunity for students to secure first hand and practical work experience under the guidance of qualified mentors.',
    department: 'Ministry of Electronics & IT',
    category: 'Education',
    tags: ['Internship', 'Students'],
    icon: 'fa-laptop-code',
  },
  {
    id: 'SCH-010',
    name: 'Soil Health Card Scheme',
    description:
      'Provides soil health cards to farmers with crop-wise recommendations of appropriate nutrients and fertilizers.',
    department: 'Ministry of Agriculture',
    category: 'Agriculture',
    tags: ['Soil', 'Farming'],
    icon: 'fa-leaf',
  },
];

export const user = {
  initials: "BK",
  name: "Bhushan Kolte",
  fullName: "Bhushan Dinesh Kolte",
  dob: "13 Feb 2007",
  gender: "Male",
  mobile: "+91 98765 43210",
  email: "bhushan.kolte@example.com",
  aadhaarLast4: "4321",
  profileCompletion: 67,
  lastUpdated: "27 Sept 2026, 10:45 PM",
};

export const verification = [
  { key: "aadhaar", label: "Aadhaar", icon: "id", status: "verified" },
  { key: "pan", label: "PAN Card", icon: "card", status: "verified" },
  { key: "bank", label: "Bank Account", icon: "bank", status: "verified" },
  { key: "mobile", label: "Mobile Number", icon: "phone", status: "verified" },
  { key: "digi", label: "DigiLocker", icon: "doc", status: "pending" },
  { key: "dl", label: "Driving Licence", icon: "car", status: "none" },
];

export const completionItems = [
  { key: "contact", label: "Contact Information", status: "verified" },
  { key: "aadhaar", label: "Aadhaar e-KYC", status: "verified" },
  { key: "bank", label: "Bank Details", status: "verified" },
  { key: "family", label: "Family Members", status: "pending" },
  { key: "edu", label: "Education & Employment", status: "none" },
];

export const quickAccess = [
  { key: "apply", label: "Apply for a Scheme", sub: "Browse eligibility", icon: "doc", to: "/schemes" },
  { key: "track", label: "Track Application", sub: "Check status", icon: "search", to: "/applications" },
  { key: "share", label: "Data Transfer", sub: "Share verified data", icon: "swap", to: "/data-transfer" },
  { key: "profile", label: "Update Profile", sub: "Keep information current", icon: "user", to: "/profile" },
];

export const activities = [
  {
    key: "cmp",
    title: "Citizen Master Profile Registry",
    sub: "Draft saved as at Step 3 of 5 (Education)",
    date: "27 Sept 2026",
    time: "12:45 PM",
    tone: "blue",
    icon: "doc",
  },
  {
    key: "ab",
    title: "Ayushman Bharat PM-JAY",
    sub: "Application submitted",
    date: "26 Sept 2026",
    time: "04:15 PM",
    tone: "green",
    icon: "check",
  },
  {
    key: "pk",
    title: "PM-KISAN",
    sub: "Application was rejected. Please review.",
    date: "25 Sept 2026",
    time: "11:20 AM",
    tone: "red",
    icon: "alert",
  },
];

export const applications = [
  {
    id: "CMP2026001",
    scheme: "Citizen Master Profile Registry",
    service: "Auto save on incomplete",
    dept: "Ministry of Electronics & IT",
    date: "27 Sept 2026",
    time: "02:18 PM",
    status: "completed",
    icon: "doc",
    tint: "blue",
  },
  {
    id: "AB202624512",
    scheme: "Ayushman Bharat PM-JAY",
    service: "Health & Family Welfare",
    dept: "Ministry of Health and Family Welfare",
    date: "26 Sept 2026",
    time: "04:15 PM",
    status: "pending",
    icon: "health",
    tint: "amber",
  },
  {
    id: "PK202626310",
    scheme: "PM-KISAN",
    service: "Agriculture & Farmers Welfare",
    dept: "Ministry of Agriculture",
    date: "25 Sept 2026",
    time: "11:20 AM",
    status: "rejected",
    icon: "leaf",
    tint: "red",
  },
  {
    id: "UJ202601288",
    scheme: "Ujjwala Yojana",
    service: "LPG connection verification",
    dept: "Ministry of Petroleum and Natural Gas",
    date: "20 Sept 2026",
    time: "09:40 AM",
    status: "approved",
    icon: "flame",
    tint: "green",
  },
  {
    id: "PEN2026015",
    scheme: "Pension Scheme",
    service: "Application in progress. Documents under verification.",
    dept: "Ministry of Social Justice and Empowerment",
    date: "18 Sept 2026",
    time: "03:12 PM",
    status: "progress",
    icon: "user",
    tint: "violet",
  },
  {
    id: "AY202600812",
    scheme: "Atal Pension Yojana",
    service: "Enrollment for unorganized workers",
    dept: "Ministry of Finance",
    date: "12 Sept 2026",
    time: "10:05 AM",
    status: "approved",
    icon: "bank",
    tint: "green",
  },
  {
    id: "VY202601977",
    scheme: "Vay Vandana Yojana",
    service: "Pension plan with assured returns",
    dept: "Ministry of Finance",
    date: "08 Sept 2026",
    time: "05:32 PM",
    status: "completed",
    icon: "umbrella",
    tint: "blue",
  },
  {
    id: "SCS20260244",
    scheme: "Senior Citizen Savings Scheme",
    service: "Reliable investment avenue",
    dept: "Ministry of Finance",
    date: "02 Sept 2026",
    time: "01:26 PM",
    status: "pending",
    icon: "piggy",
    tint: "amber",
  },
];

export const myApplications = [
  { key: "ab", title: "Ayushman Bharat PM-JAY", status: "Approved", tone: "green", icon: "health" },
  { key: "pk", title: "PM-KISAN", status: "Rejected", tone: "red", icon: "leaf" },
  { key: "uj", title: "Ujjwala Yojana", status: "Under Review", tone: "amber", icon: "flame" },
];

export const schemeTabs = [
  { key: "popular", label: "Popular for Senior Citizens" },
  { key: "health", label: "Health" },
  { key: "pension", label: "Pension" },
  { key: "finance", label: "Financial Support" },
  { key: "identity", label: "Identity & Documents" },
  { key: "housing", label: "Housing" },
  { key: "more", label: "More" },
];

export const schemes = {
  popular: [
    { key: "ayushman", title: "Ayushman Bharat PM-JAY", desc: "Health coverage for senior citizens", cta: "Apply Now", icon: "health", tint: "green" },
    { key: "atal", title: "Atal Pension Yojana", desc: "Pension scheme for unorganized sector workers", cta: "Apply Now", icon: "bank", tint: "blue" },
    { key: "vay", title: "Vay Vandana Yojana", desc: "Pension plan with assured returns", cta: "Know More", icon: "umbrella", tint: "amber" },
    { key: "scss", title: "Senior Citizen Savings Scheme", desc: "Safe and reliable investment scheme", cta: "Know More", icon: "piggy", tint: "violet" },
    { key: "phc", title: "Primary Health Card", desc: "Access to government health centers", cta: "Apply Now", icon: "steth", tint: "blue" },
    { key: "tev", title: "Travel Concession", desc: "Discounted rail and air fare for seniors", cta: "Apply Now", icon: "train", tint: "green" },
    { key: "rte", title: "Retirement Helpdesk", desc: "Guidance for post-retirement services", cta: "Know More", icon: "help", tint: "amber" },
    { key: "elc", title: "Elder Line 14567", desc: "National helpline for senior citizens", cta: "Know More", icon: "phone", tint: "violet" },
  ],
  health: [
    { key: "ayushman", title: "Ayushman Bharat PM-JAY", desc: "₹5 lakh health cover per family per year", cta: "Apply Now", icon: "health", tint: "green" },
    { key: "jan", title: "Jan Aushadhi Kendra", desc: "Affordable generic medicines", cta: "Locate Kendra", icon: "pill", tint: "blue" },
    { key: "phc", title: "Primary Health Card", desc: "Access to government health centers", cta: "Apply Now", icon: "steth", tint: "amber" },
    { key: "covid", title: "Preventive Health Checkup", desc: "Free annual checkup for 60+", cta: "Book Slot", icon: "heart", tint: "violet" },
  ],
  pension: [
    { key: "atal", title: "Atal Pension Yojana", desc: "Assured pension of ₹1,000–₹5,000", cta: "Apply Now", icon: "bank", tint: "blue" },
    { key: "vay", title: "Vay Vandana Yojana", desc: "Pension plan with assured returns", cta: "Know More", icon: "umbrella", tint: "amber" },
    { key: "nps", title: "National Pension System", desc: "Market-linked retirement savings", cta: "Know More", icon: "chart", tint: "green" },
    { key: "epso", title: "EPF Pension (EPS-95)", desc: "Monthly pension for organized workers", cta: "Check Status", icon: "doc", tint: "violet" },
  ],
  finance: [
    { key: "scss", title: "Senior Citizen Savings Scheme", desc: "Safe and reliable investment scheme", cta: "Know More", icon: "piggy", tint: "amber" },
    { key: "pmkisan", title: "PM-KISAN", desc: "₹6,000 yearly income support for farmers", cta: "Apply Now", icon: "leaf", tint: "green" },
    { key: "pmy", title: "Pradhan Mantri Mudra Yojana", desc: "Business loans up to ₹20 lakh", cta: "Apply Now", icon: "brief", tint: "blue" },
    { key: "ssy", title: "Sukanya Samriddhi Yojana", desc: "Savings for girl child education", cta: "Know More", icon: "girl", tint: "violet" },
  ],
  identity: [
    { key: "eaadhaar", title: "e-Aadhaar Download", desc: "Digitally signed Aadhaar copy", cta: "Download", icon: "id", tint: "blue" },
    { key: "epan", title: "e-PAN", desc: "Instant electronic PAN card", cta: "Download", icon: "card", tint: "green" },
    { key: "digi", title: "DigiLocker", desc: "Store and share digital documents", cta: "Open DigiLocker", icon: "doc", tint: "amber" },
    { key: "pvoter", title: "Voter ID (EPIC)", desc: "Electoral photo identity card", cta: "Apply Now", icon: "vote", tint: "violet" },
  ],
  housing: [
    { key: "pmayg", title: "PM Awas Yojana (Gramin)", desc: "Rural housing assistance", cta: "Apply Now", icon: "home", tint: "green" },
    { key: "pmayu", title: "PM Awas Yojana (Urban)", desc: "Urban housing for EWS/LIG", cta: "Apply Now", icon: "building", tint: "blue" },
    { key: "amr", title: "ATM Amrut Scheme", desc: "Urban development projects", cta: "Know More", icon: "city", tint: "amber" },
    { key: "rural", title: "Rural Electrification", desc: "Power connections to all homes", cta: "Know More", icon: "bulb", tint: "violet" },
  ],
  more: [
    { key: "edu", title: "National Scholarship Portal", desc: "Scholarships for all categories", cta: "Apply Now", icon: "grad", tint: "blue" },
    { key: "skill", title: "Skill India Digital", desc: "Free courses and certifications", cta: "Explore", icon: "skill", tint: "green" },
    { key: "farmer", title: "Kisan Rail Parivahan", desc: "Subsidized freight for produce", cta: "Know More", icon: "train", tint: "amber" },
    { key: "udid", title: "UDID for Divyangjan", desc: "Unique disability identity card", cta: "Apply Now", icon: "wheel", tint: "violet" },
  ],
};

export const dataOptions = [
  { key: "personal", label: "Personal Details", sub: "Name, DOB, Gender", icon: "user", verified: true },
  { key: "aadhaar", label: "Aadhaar Details", sub: "Aadhaar information", icon: "id", verified: true },
  { key: "contact", label: "Contact Information", sub: "Mobile, Email", icon: "phone", verified: true },
  { key: "bank", label: "Bank Details", sub: "Account information", icon: "bank", verified: true },
  { key: "address", label: "Address", sub: "Current & Permanent", icon: "home", verified: false },
  { key: "education", label: "Education Details", sub: "Income certificate data", icon: "grad", verified: false },
  { key: "income", label: "Income Details", sub: "Income certificate data", icon: "rupee", verified: false },
  { key: "family", label: "Family Members", sub: "Family member details", icon: "users", verified: true },
  { key: "docs", label: "Other Documents", sub: "Not verified documents", icon: "doc", verified: false },
];

export const services = [
  { key: "ab", title: "Ayushman Bharat PM-JAY", dept: "Ministry of Health and Family Welfare", icon: "health" },
  { key: "pk", title: "PM-KISAN", dept: "Ministry of Agriculture and Farmers Welfare", icon: "leaf" },
  { key: "uj", title: "Ujjwala Yojana", dept: "Ministry of Petroleum and Natural Gas", icon: "flame" },
  { key: "pen", title: "Pension Scheme", dept: "Ministry of Social Justice and Empowerment", icon: "user" },
  { key: "others", title: "Others", dept: "Other government services", icon: "grid" },
];

export const notifications = [
  {
    key: "n1",
    title: "Ayushman Bharat PM-JAY approved",
    sub: "Your application AB202624512 has been approved. Your e-card is ready to download.",
    date: "27 Sept 2026",
    time: "09:10 AM",
    type: "success",
    unread: true,
  },
  {
    key: "n2",
    title: "Action needed on PM-KISAN",
    sub: "Your application was rejected due to land record mismatch. Please update and reapply.",
    date: "25 Sept 2026",
    time: "11:20 AM",
    type: "error",
    unread: true,
  },
  {
    key: "n3",
    title: "Pension Scheme documents under review",
    sub: "Your uploaded documents for PEN2026015 are being verified. This usually takes 2–3 days.",
    date: "22 Sept 2026",
    time: "05:48 PM",
    type: "info",
    unread: true,
  },
  {
    key: "n4",
    title: "Profile completion reminder",
    sub: "Complete your Family Members and Education sections to reach 100% profile strength.",
    date: "20 Sept 2026",
    time: "10:02 AM",
    type: "info",
    unread: false,
  },
  {
    key: "n5",
    title: "Ujjwala Yojana connection verified",
    sub: "Your LPG connection details were successfully verified against the database.",
    date: "18 Sept 2026",
    time: "12:30 PM",
    type: "success",
    unread: false,
  },
  {
    key: "n6",
    title: "Scheduled maintenance on Sunday",
    sub: "Services will be unavailable between 1:00 AM and 3:00 AM on 5 October 2026.",
    date: "15 Sept 2026",
    time: "04:00 PM",
    type: "info",
    unread: false,
  },
];

export const benefits = [
  { key: "b1", title: "Ayushman Bharat e-Card", sub: "Health cover up to ₹5,00,000 per year", scheme: "PM-JAY", status: "Active", valid: "Valid till Mar 2031", icon: "health", tint: "green" },
  { key: "b2", title: "PM-KISAN Income Support", sub: "₹2,000 credited every quarter", scheme: "PM-KISAN", status: "Active", valid: "Next credit Dec 2026", icon: "rupee", tint: "blue" },
  { key: "b3", title: "Ujjwala LPG Subsidy", sub: "Subsidized cylinder refills", scheme: "Ujjwala Yojana", status: "Active", valid: "Ongoing", icon: "flame", tint: "amber" },
  { key: "b4", title: "Atal Pension Account", sub: "Assured monthly pension ₹2,000", scheme: "APY", status: "Active", valid: "Ongoing", icon: "bank", tint: "violet" },
];

export const faqs = [
  {
    q: "How do I register on the portal?",
    a: "Click Sign Up, verify your mobile number via OTP, complete Aadhaar e-KYC and set a password. Registration takes under 3 minutes and your Citizen Master Profile is created automatically.",
  },
  {
    q: "What is the Citizen Master Profile?",
    a: "It is a single verified record of your personal, contact, bank and family details. Services across departments read from this profile, so you never fill the same form twice.",
  },
  {
    q: "How does Data Transfer keep my data safe?",
    a: "Data is shared only after your explicit consent, only for the fields you select, and only with the department you choose. Every transfer is logged and you can revoke access at any time from Preferences.",
  },
  {
    q: "How can I track my application status?",
    a: "Open My Applications to see live status for every submission — Pending, In Progress, Approved, Rejected or Completed — with a timestamped timeline inside each application.",
  },
  {
    q: "What should I do if my application is rejected?",
    a: "Open the application, read the rejection reason, update the incorrect fields in your profile, and click Reapply. Most rejections are resolved within one correction cycle.",
  },
  {
    q: "Is there a helpline if I get stuck?",
    a: "Yes. Call 1800-11-0000 (toll free, Mon–Sat 9 AM to 6 PM) or use Talk to Support in the sidebar to start a chat or request a callback in your preferred language.",
  },
];
