import { useMemo, useState } from "react";
import PageHead from "../../components/PageHead.jsx";
import Icon from "../../components/icons.jsx";
import { Btn, Card, IconTile } from "../../components/ui.jsx";
import { useAuth } from "../../context/BCAuthContext.jsx";

const faqsData = [
  {
    q: "How do I register on the portal?",
    a: "Click Sign Up, verify your mobile number via OTP, complete Aadhaar e-KYC and set a password. Registration takes under 3 minutes and your Citizen Master Profile is created automatically."
  },
  {
    q: "What is the Citizen Master Profile?",
    a: "The Citizen Master Profile is your one-time created digital identity on PRAAMAN PORTAL. It stores your verified personal, demographic, and document details so you don't have to fill out forms repeatedly."
  },
  {
    q: "How does Data Transfer keep my data safe?",
    a: "Your data is securely encrypted and stored using standard security protocols. We only share necessary details with relevant authorities when you explicitly apply for a scheme."
  },
  {
    q: "How can I track my application status?",
    a: "You can track your application status by navigating to the 'My Applications' section in your dashboard. It will show real-time updates for each scheme you've applied to."
  },
  {
    q: "What should I do if my application is rejected?",
    a: "If an application is rejected, you can review the rejection reason provided in the 'My Applications' tab. You may need to update your profile or upload valid documents before reapplying."
  },
  {
    q: "Is there a helpline if I get stuck?",
    a: "Yes! You can call our toll-free support number 1800-11-0000 between 9:00 AM and 6:00 PM IST or start a live chat right here on the portal."
  }
];

export default function Faq() {
  const authContext = useAuth();
  const notify = authContext?.notify || ((msg) => alert(msg));
  const [open, setOpen] = useState(0);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    if (!q.trim()) return faqsData;
    const s = q.toLowerCase();
    return faqsData.filter((f) => f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 font-sans">
      <PageHead
        crumb="Help & Support"
        title="Help & Support"
        sub="Answers to common questions and ways to reach our support team."
      />

      <div className="grid gap-4 sm:grid-cols-2 mt-6">
        <Card className="p-6">
          <IconTile icon="phone" tone="blue" size="lg" />
          <h2 className="mt-3.5 text-[16px] font-bold text-ink-900 dark:text-white">Call us</h2>
          <p className="nums mt-1 text-[13px] text-ink-500 dark:text-ink-400">1800-11-0000 (toll free)</p>
          <p className="mt-0.5 text-[12px] text-ink-400 dark:text-ink-500">Mon–Sat, 9:00 AM – 6:00 PM IST</p>
          <Btn variant="outline" className="mt-4 !py-2 !text-[13px]" icon="phone" onClick={() => (window.location.href = "tel:1800110000")}>Call now</Btn>
        </Card>
        <Card className="p-6">
          <IconTile icon="send" tone="green" size="lg" />
          <h2 className="mt-3.5 text-[16px] font-bold text-ink-900 dark:text-white">Chat with us</h2>
          <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400">Average reply under 2 minutes</p>
          <p className="mt-0.5 text-[12px] text-ink-400 dark:text-ink-500">Available in 12 languages</p>
          <Btn variant="outline" className="mt-4 !py-2 !text-[13px]" icon="send" onClick={() => notify("Support chat is being connected. An agent will reply here shortly.", "blue")}>Start chat</Btn>
        </Card>
      </div>

      <Card className="mt-6 p-6 sm:p-7">
        <h2 className="text-[17px] font-bold text-ink-900 dark:text-white">Frequently asked questions</h2>
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-[#000000] px-3.5 py-2.5 text-ink-400 dark:text-ink-500 focus-within:border-ink-400 dark:focus-within:border-white/40">
          <Icon name="search" className="h-4 w-4 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions..."
            className="w-full bg-transparent text-[13.5px] text-ink-900 dark:text-white outline-none placeholder:text-ink-400 dark:text-ink-500"
            aria-label="Search FAQs"
          />
        </div>

        <div className="mt-4 divide-y divide-ink-100 dark:divide-white/10">
          {list.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className={`text-[14px] font-semibold ${isOpen ? "text-ink-900 dark:text-white" : "text-ink-700 dark:text-ink-300"}`}>{f.q}</span>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ${isOpen ? "bg-ink-800 text-white" : "bg-ink-50 dark:bg-[#000000] text-ink-500 dark:text-ink-400"}`}>
                    <Icon name="down" className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {isOpen && <p className="pb-4 pr-10 text-[13.5px] leading-relaxed text-ink-500 dark:text-ink-400 animate-fade">{f.a}</p>}
              </div>
            );
          })}
          {list.length === 0 && <p className="py-8 text-center text-[13.5px] text-ink-400 dark:text-ink-500">No matching questions. Try other keywords or contact support.</p>}
        </div>
      </Card>
    </div>
  );
}
