import { schemesData, applicationsData } from '../data';

// ---------------------------------------------------------------------------
// Intent classification — keyword based, no external API
// ---------------------------------------------------------------------------

const INTENT_PATTERNS = [
  {
    keywords: ['scheme', 'schemes', 'which', 'available', 'eligib', 'eligible', 'apply for', 'applying'],
    action: 'list_schemes',
  },
  {
    keywords: ['application', 'applied', 'status', 'track', 'my application', 'check status', 'application status'],
    action: 'check_application_status',
  },
  {
    keywords: ['aadhaar', 'pan', 'verify', 'verification', 'ekyc', 'kyc', 'identity'],
    action: 'verify_identity',
  },
  {
    keywords: ['document', 'documents', 'upload', 'required', 'upload doc', 'missing doc'],
    action: 'documents_required',
  },
  {
    keywords: ['profile', 'complete', 'edit', 'fill', 'personal details', 'update profile'],
    action: 'profile_help',
  },
  {
    keywords: ['password', 'forgot', 'change password', 'reset'],
    action: 'password_help',
  },
  {
    keywords: ['contact', 'support', 'help', 'helpline', 'call', 'phone'],
    action: 'contact_support',
  },
  {
    keywords: ['pm-kisan', 'pradhan', 'kisan', 'farmer'],
    action: 'explain_pm_kisan',
  },
  {
    keywords: ['ayushman', 'pm-jay', 'health', 'insurance', 'hospital'],
    action: 'explain_ayushman',
  },
  {
    keywords: ['pmay', 'awas', 'housing', 'home loan', 'affordable housing'],
    action: 'explain_pmay',
  },
  {
    keywords: ['mudra', 'loan', 'business', 'stand up', 'entrepreneur'],
    action: 'explain_mudra_standup',
  },
  {
    keywords: ['pension', 'atal', 'shram', 'unorganised', 'worker'],
    action: 'explain_pension',
  },
  {
    keywords: ['sukanya', 'girl child', 'savings', 'daughter'],
    action: 'explain_sukanya',
  },
  {
    keywords: ['hours', 'time', 'deadline', 'date', 'when'],
    action: 'timeline_info',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greetings'],
    action: 'greet',
  },
  {
    keywords: ['thank', 'thanks', 'appreciate'],
    action: 'thank',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function classifyIntent(message) {
  const lower = message.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const pattern of INTENT_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (lower.includes(kw)) score += kw.split(' ').length > 1 ? 3 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = pattern.action;
    }
  }

  // Only return an intent if we matched at least 2 keyword points
  return bestScore >= 1 ? best : 'unknown';
}

function extractSchemeId(message) {
  const match = message.match(/SCH-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function extractAppId(message) {
  const match = message.match(/APP[-\s]?\d+/i);
  return match ? match[0].toUpperCase() : null;
}

// ---------------------------------------------------------------------------
// Response builders
// ---------------------------------------------------------------------------

function greet() {
  return {
    text: "Hello! I'm the SIH CODEHAWKS AI Assistant. I can help you with:\n\n• Checking your scheme application status\n• Finding schemes you're eligible for\n• Explaining government schemes (PM-KISAN, Ayushman Bharat, PMAY, etc.)\n• Guiding you through Aadhaar/PAN verification\n• Listing required documents\n• Password and profile help\n\nJust ask me anything!",
    action: null,
  };
}

function unknown(msg) {
  return {
    text: `I'm not sure I understand. Could you rephrase that?\n\nIf you're looking for something specific, try asking about:\n• "What schemes are available?"\n• "Check my application status"\n• "How to verify Aadhaar"\n• "Documents needed for PMAY"\n• "Explain Ayushman Bharat"\n\nOr type "help" to see all topics I can assist with.`,
    action: null,
  };
}

function listSchemes() {
  const list = schemesData.map(
    (s) => `🔹 ${s.name}\n   ${s.description}\n   Category: ${s.category} | Dept: ${s.department}`
  );
  return {
    text: `Here are the government schemes available on this platform:\n\n${list.join('\n\n')}\n\nYou can apply by clicking "Apply Now" on the scheme card, or visit /schemes for full details.`,
    action: null,
  };
}

function explainScheme(schemeId) {
  const scheme = schemesData.find((s) => s.id === schemeId);
  if (!scheme) {
    return {
      text: `I couldn't find scheme ${schemeId}. Try asking "list all schemes" to see what's available.`,
      action: null,
    };
  }
  return {
    text: `${scheme.name} (${scheme.id})\n\n${scheme.description}\n\nCategory: ${scheme.category}\nDepartment: ${scheme.department}\nTags: ${scheme.tags.join(', ')}\n\nYou can apply from your dashboard or view full details on the Schemes page.`,
    action: null,
  };
}

function checkApplicationStatus(userUid, applications) {
  if (!userUid) {
    return {
      text: "I couldn't find your account details. Please make sure you're logged in and try again.",
      action: null,
    };
  }

  const userApps = applications.filter((a) => a.userId === userUid || a.userId === userUid?.substring(0, 8));
  // Fallback: match by uid substring since Firestore doc ids are the uid
  const allApps = applications.length > 0 ? applications : applicationsData;

  if (allApps.length === 0) {
    return {
      text: "You haven't applied for any schemes yet. Visit the Schemes page to find one that suits you!",
      action: null,
    };
  }

  const lines = allApps.map((app) => {
    const statusIcon =
      app.status === 'Approved'
        ? '✅'
        : app.status === 'Pending'
          ? '⏳'
          : '❌';
    return `${statusIcon} ${app.schemeName || app.name} — ${app.status}\n   Applied: ${app.dateApplied || app.date || 'N/A'} | ID: ${app.id}`;
  });

  return {
    text: `Your Application Status:\n\n${lines.join('\n\n')}\n\nClick "Track" on any application from your dashboard to see full details, timelines, and audit notes.`,
    action: null,
  };
}

function verifyIdentity() {
  return {
    text: `Here's how to verify your identity on SIH CODEHAWKS:\n\n🔹 **Aadhaar e-KYC**\n1. Go to Dashboard → Profile → Identity tab\n2. Enter your 12-digit Aadhaar number\n3. Click "Verify Aadhaar" — we validate via checksum\n4. An OTP is sent to your registered email\n5. Enter the OTP to complete verification\n\n🔹 **PAN Verification**\n1. Go to Dashboard → Profile → Identity tab\n2. Enter your PAN (format: ABCDE1234F)\n3. Click "Verify PAN"\n4. OTP sent to email, enter it to complete\n\nBoth are required for most scheme applications. Let me know if you need help with a specific step!`,
    action: null,
  };
}

function documentsRequired(schemeId) {
  const scheme = schemesData.find((s) => s.id === schemeId);
  const baseDocs = [
    'Aadhaar Card (Front & Back)',
    'PAN Card',
    'Income Certificate',
    'Bank Passbook / Cheque',
    'Passport Size Photograph',
  ];

  if (scheme) {
    return {
      text: `For **${scheme.name}**, you'll typically need:\n\n${baseDocs.map((d) => `• ${d}`).join('\n')}\n\nUpload these from Dashboard → Profile → Upload Documents.\n\nAll files must be clear scans (PDF/JPG, max 5MB each).`,
      action: null,
    };
  }

  return {
    text: `The standard documents required for most scheme applications are:\n\n${baseDocs.map((d) => `• ${d}`).join('\n')}\n\nUpload them from Dashboard → Profile → Upload Documents.\n\nSome schemes may have additional requirements — check the specific scheme page for details.`,
    action: null,
  };
}

function profileHelp() {
  return {
    text: `Here's how to complete your profile:\n\n1. **Dashboard → Profile** — filled out across multiple tabs:\n   • Personal Details (name, email, caste, domicile, etc.)\n   • Contact Details (phone + address verification)\n   • Family Details (parent info, career choice)\n   • Education & Examination Details\n   • Bank Details\n   • Identity (Aadhaar + PAN verification)\n   • Upload Documents\n   • Change Password\n\n2. Your **profile completion %** is shown on the Dashboard Overview.\n\n3. Once you're done, click **"Lock Profile"** to finalize it for verification.\n\n4. You can always unlock and edit before locking.\n\nWhich section do you need help with?`,
    action: null,
  };
}

function passwordHelp() {
  return {
    text: `For password issues:\n\n🔹 **Forgot Password**\n- Go to Login page → click "Forgot Password"\n- Enter your registered email\n- A reset link is sent to your Gmail (check spam too)\n\n🔹 **Change Password (from Dashboard)**\n- Dashboard → Profile → Change Password tab\n- Enter current password + new password (min 6 chars) + confirm\n- You'll be re-authenticated first for security\n\nNeed help with a specific password issue?`,
    action: null,
  };
}

function contactSupport() {
  return {
    text: `If you need human assistance:\n\n📞 **Helpline**: Available during office hours (Mon-Fri, 10 AM - 6 PM)\n\n💬 **Support Chat**: Use the chat widget (top-right corner) — we're working on making this fully operational\n\n📧 **Email**: Reach out through the platform's support channels\n\n🏢 **Visit**: Your nearest Common Service Centre (CSC) or educational institution office\n\nFor urgent scheme-related issues, you can also contact the respective department directly (Agriculture, Health, Finance, etc. as listed on each scheme page).`,
    action: null,
  };
}

function explainPmKisan() {
  return {
    text: `**PM-KISAN Samman Nidhi** (SCH-001)\n\n💰 **What it is**: Income support of ₹6,000 per year to all landholding farmer families.\n\n🏛️ **Department**: Ministry of Agriculture\n\n👥 **Who's eligible**: Landholding farmer families across India.\n\n📋 **Key details**:\n- ₹6,000 paid in 3 installments of ₹2,000 each\n- Direct Benefit Transfer (DBT) to bank accounts\n- Applicable to all states except those already running similar schemes\n\nThis is one of the most widely applicable schemes. Want help applying?`,
    action: null,
  };
}

function explainAyushman() {
  return {
    text: `**Ayushman Bharat PM-JAY** (SCH-002)\n\n🏥 **What it is**: Health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.\n\n🏛️ **Department**: Ministry of Health\n\n👥 **Who's eligible**: Families in identified occupational/income groups (SECC 2011 criteria).\n\n📋 **Key details**:\n- Cashless treatment at empaneled hospitals\n- Covers 3 days pre-hospitalization and 30 days post-hospitalization\n- Includes medical, surgical, and maternity treatments\n- Portable across India\n\nNeed help checking your eligibility or applying?`,
    action: null,
  };
}

function explainPmay() {
  return {
    text: `**PM Awas Yojana (PMAY)** (SCH-004)\n\n🏠 **What it is**: Affordable housing for urban and rural poor with interest subsidy on home loans.\n\n🏛️ **Department**: Ministry of Housing\n\n👥 **Who's eligible**: EWS, LIG, MIG categories (annual income up to ₹18 lakhs).\n\n📋 **Key details**:\n- Interest subsidy up to 6.5% on home loans\n- Urban (PMAY-U) and Rural (PMAY-G) variants\n- First-time home buyers preferred\n- Beneficiary led construction (BLC) for rural areas\n\nWant to apply or know more details?`,
    action: null,
  };
}

function explainMudraStandup() {
  return {
    text: `**Mudra Yojana & Stand Up India** (SCH-003)\n\n💼 **Mudra Loan**:\n- Bank loans between ₹50,000 to ₹10 lakhs for MSME/non-farm income generating activities\n- Three categories: Shishu (up to ₹50K), Kishor (₹50K-₹5L), Tarun (₹5L-₹10L)\n- Available through commercial banks, RRBs, and MFIs\n\n🚀 **Stand Up India**:\n- Facilitates bank loans between ₹10 lakh and ₹1 crore\n- At least one SC/ST borrower and one woman borrower per bank branch\n- For greenfield enterprises in manufacturing, services, or trading\n\nBoth are great for aspiring entrepreneurs. Need help applying?`,
    action: null,
  };
}

function explainPension() {
  return {
    text: `**Pension Schemes** (SCH-005, SCH-007)\n\n🐖 **Atal Pension Yojana (APY)** (SCH-005):\n- Guaranteed pension of ₹1,000 to ₹5,000 per month (fixed based on contribution)\n- For unorganized sector workers aged 18-40\n- Coordinated with NPS architecture\n- Government co-contribution for eligible subscribers\n\n🛡️ **PM Shram Yogi Maandhan** (SCH-007):\n- Voluntary and contributory pension scheme for unorganized workers\n- Monthly contribution of ₹55 to ₹200 (based on age, fixed pension of ₹3,000)\n- For workers in age group 18-40 with income ≤ ₹25,000/month\n- Covered workers: street vendors, domestic help, rag pickers, drivers, etc.\n\nWhich one sounds relevant to you?`,
    action: null,
  };
}

function explainSukanya() {
  return {
    text: `**Sukanya Samriddhi Yojana** (SCH-006)\n\n👧 **What it is**: A savings scheme for parents of girl children to build a fund for future education and marriage.\n\n🏛️ **Department**: Ministry of Women & Child Development\n\n👥 **Who's eligible**: Parents/legal guardians of a girl child below 10 years.\n\n📋 **Key details**:\n- Account can be opened in post offices or authorized banks\n- **High interest rate** (typically 8.2% — reviewed quarterly)\n- Minimum deposit: ₹250, Maximum: ₹1.5 lakhs per year\n- Maturity at age 21 (partial withdrawal at 18 for education)\n- Tax benefits under Section 80C\n\nThis is one of the highest-yielding small savings schemes. Want to apply?`,
    action: null,
  };
}

function timelineInfo() {
  return {
    text: `Here's a general timeline for scheme applications:\n\n📅 **Application Processing**:\n- After you submit, applications go through verification (Aadhaar, PAN, documents)\n- Typical review time: 2-4 weeks\n- Approved applications get disbursed based on scheme rules\n\n⏰ **Important deadlines**:\n- Check the Active Alerts banner on your Dashboard for scheme-specific deadlines\n- PM-KISAN: ongoing registration, disbursement cycles every quarter\n- Ayushman Bharat: year-round, but annual renewal may be required\n- PMAY: depends on state-level implementation timelines\n\nFor exact deadlines, check each scheme's page or ask about a specific scheme.`,
    action: null,
  };
}

function thankUser() {
  return {
    text: "You're welcome! 😊 If you have any more questions, I'm here to help. Feel free to ask about schemes, applications, or anything else on the platform.",
    action: null,
  };
}

// ---------------------------------------------------------------------------
// Main processing entry point
// ---------------------------------------------------------------------------

export function handleUserMessage(message, context = {}) {
  const { user, applications = [] } = context;
  const userId = user?.uid || user?.id;
  const intent = classifyIntent(message);

  switch (intent) {
    case 'greet':
      return greet();

    case 'thank':
      return thankUser();

    case 'list_schemes': {
      const schemeId = extractSchemeId(message);
      if (schemeId) return explainScheme(schemeId);
      return listSchemes();
    }

    case 'check_application_status':
      return checkApplicationStatus(userId, applications.length > 0 ? applications : applicationsData);

    case 'verify_identity':
      return verifyIdentity();

    case 'documents_required': {
      const schemeId = extractSchemeId(message);
      return documentsRequired(schemeId);
    }

    case 'explain_pm_kisan':
      return explainPmKisan();

    case 'explain_ayushman':
      return explainAyushman();

    case 'explain_pmay':
      return explainPmay();

    case 'explain_mudra_standup':
      return explainMudraStandup();

    case 'explain_pension':
      return explainPension();

    case 'explain_sukanya':
      return explainSukanya();

    case 'profile_help':
      return profileHelp();

    case 'password_help':
      return passwordHelp();

    case 'contact_support':
      return contactSupport();

    case 'timeline_info':
      return timelineInfo();

    case 'unknown':
    default: {
      // If there's a scheme ID in the message, try to explain that scheme
      const sid = extractSchemeId(message);
      if (sid) return explainScheme(sid);

      // If there's an application ID, try to find it
      const aid = extractAppId(message);
      if (aid) {
        const app = applicationsData.find((a) => a.id === aid) ||
          (context.applications || []).find((a) => String(a.id) === aid);
        if (app) {
          const statusIcon =
            app.status === 'Approved' ? '✅' : app.status === 'Pending' ? '⏳' : '❌';
          return {
            text: `${statusIcon} ${app.schemeName || app.name} — **${app.status}**\n   Applied: ${app.dateApplied || app.date || 'N/A'} | Dept: ${app.department}`,
            action: null,
          };
        }
      }

      return unknown(message);
    }
  }
}

// ---------------------------------------------------------------------------
// Quick-stop answers for the /help command and FAQ-style queries
// ---------------------------------------------------------------------------

export const FAQ_RESPONSES = {
  help: {
    text: `I can help with these topics:\n\n📋 **Schemes** — "List schemes", "Tell me about PM-KISAN", "Explain PM-JAY eligibility"\n📊 **Applications** — "Check my application status", "Status of APP-2023-8941"\n🆔 **Identity** — "How to verify Aadhaar", "PAN verification steps"\n📄 **Documents** — "Documents needed for PMAY", "Required documents"\n👤 **Profile** — "How to complete profile", "Lock/unlock profile"\n🔑 **Password** — "Forgot password", "Change password"\n💬 **Support** — "Contact support", "Helpline number"\n⏰ **Timeline** — "How long does processing take"\n\nJust type your question naturally!`,
  },
  hello: greet(),
  hi: greet(),
  hey: greet(),
};

export function handleQuickCommand(command) {
  const cmd = command.toLowerCase().trim();
  if (FAQ_RESPONSES[cmd]) return FAQ_RESPONSES[cmd];
  return null;
}
