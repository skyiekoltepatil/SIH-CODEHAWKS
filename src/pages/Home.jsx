import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/icons.jsx";
import { Btn, Card, IconTile } from "../components/ui.jsx";
import { schemeTabs, schemes } from "../data/bharatData.js";
import banner1 from '../assets/banners/hero_bg_schemes.jpg';
import banner2 from '../assets/banners/hero_bg_languages.jpg';
import banner3 from '../assets/banners/hero_bg_ai.jpg';

const slides = [
  {
    image: banner1,
    kicker: "Government Services",
    title1: "Supporting",
    title2: "Senior Citizens",
    title2Color: "text-ink-800 dark:text-ink-200",
    underlineColor: "#138808",
    desc: <>Easier access. Secure data. <span className="font-semibold text-ink-800 dark:text-ink-200">A stronger Bharat.</span></>,
    btn1: "Explore Schemes",
    btn1To: "/schemes",
    btn2: "How it works",
    btn2Href: "#how",
    stats: [
      ["220+", "Live services"],
      ["5.4 Cr", "Verified citizens"],
      ["100%", "Paperless approvals"]
    ],
    cardIcon: "shield",
    cardTitle: <>Digital India<br />for a better tomorrow</>,
    cardDesc: "One verified identity. Every government service. Zero paperwork.",
    cardList: ["Aadhaar verified identity", "Consent-based data sharing", "Live application tracking"]
  },
  {
    image: banner2,
    kicker: "Multilingual Support",
    title1: "Access in",
    title2: "22 Languages",
    title2Color: "text-amber-600 dark:text-amber-400",
    underlineColor: "#f59e0b",
    desc: <>Seamlessly use services in your <span className="font-semibold text-ink-800 dark:text-ink-200">native language.</span></>,
    btn1: "Change Language",
    btn1To: "/dashboard/profile",
    btn2: "Learn more",
    btn2Href: "#how",
    stats: [
      ["22", "Official Languages"],
      ["Real-time", "Translations"],
      ["100%", "Inclusive"]
    ],
    cardIcon: "users",
    cardTitle: <>Language is no<br />longer a barrier</>,
    cardDesc: "Read documents and fill forms in the language you are most comfortable with.",
    cardList: ["Hindi, Marathi, Tamil, etc.", "Instant UI translation", "Voice support coming soon"]
  },
  {
    image: banner3,
    kicker: "Smart Governance",
    title1: "Meet Your",
    title2: "AI Assistant",
    title2Color: "text-blue-600 dark:text-blue-400",
    underlineColor: "#3b82f6",
    desc: <>Get instant help and answers to <span className="font-semibold text-ink-800 dark:text-ink-200">all your queries.</span></>,
    btn1: "Ask Assistant",
    btn1To: "/dashboard/ai-assistant",
    btn2: "View FAQs",
    btn2Href: "#how",
    stats: [
      ["24/7", "Availability"],
      ["Instant", "Responses"],
      ["Context", "Aware"]
    ],
    cardIcon: "help",
    cardTitle: <>Intelligent help<br />at your fingertips</>,
    cardDesc: "Having trouble finding a scheme? Just ask the AI.",
    cardList: ["Find eligible schemes", "Track application status", "Ask general questions"]
  }
];

function CarouselCard({ s }) {
  return (
    <Card hover className="group flex min-w-[260px] flex-1 flex-col p-5 sm:min-w-[280px]">
      <IconTile icon={s.icon} tone={s.tint} size="lg" />
      <h3 className="mt-3.5 text-[15px] font-bold leading-snug text-ink-900 dark:text-white ">{s.title}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-500 dark:text-ink-400 ">{s.desc}</p>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-700 dark:text-ink-300 transition-colors group-hover:text-ink-900 dark:text-white "
      >
        {s.cta}
        <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </a>
    </Card>
  );
}

export default function Home() {
  const [tab, setTab] = useState("popular");
  const items = schemes[tab] || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] page active">
      {/* ---------------- Hero Carousel ---------------- */}
      <section className="relative overflow-hidden border-b border-ink-100 dark:border-white/10 bg-ink-50 dark:bg-[#000000]">
        {/* Carousel Content */}
        <div className="relative w-full overflow-hidden" style={{ height: '620px' }}>
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full w-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((s, index) => (
              <div 
                key={index} 
                className="w-full h-full flex-shrink-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${s.image})` }}
              >
                <div className="mx-auto grid h-full w-full max-w-[1440px] items-center gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
                <div className="animate-rise z-10 p-6 rounded-2xl">
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-ink-500 dark:text-ink-400">{s.kicker}</p>
                  <h1 className="mt-3 font-display text-[clamp(40px,5.4vw,64px)] font-bold leading-[1.04] tracking-tight text-ink-900 dark:text-white">
                    <span className="block">{s.title1}</span>
                    <span className={`relative inline-block ${s.title2Color}`}>
                      {s.title2}
                      <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 10" fill="none" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M2 8 C 80 2, 220 2, 298 7" stroke={s.underlineColor} strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
                      </svg>
                    </span>
                  </h1>
                  <p className="nums mt-6 max-w-md text-[15px] leading-relaxed text-ink-500 dark:text-ink-400">
                    {s.desc}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link to={s.btn1To}>
                      <Btn className="!px-6 !py-3 !text-[14px]" iconRight="arrow">{s.btn1}</Btn>
                    </Link>
                    <a href={s.btn2Href}>
                      <Btn variant="outline" className="!px-6 !py-3 !text-[14px]" icon="help">{s.btn2}</Btn>
                    </a>
                  </div>
                  <div className="mt-10 flex items-center gap-6">
                    {s.stats.map(([v, l]) => (
                      <div key={l}>
                        <p className="nums text-[20px] font-bold text-ink-900 dark:text-white">{v}</p>
                        <p className="text-[11.5px] font-medium text-ink-400 dark:text-ink-500">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="relative z-10 hidden justify-self-end lg:block pt-8">
                  <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white/70 dark:bg-[#000000]/80 p-6 shadow-[0_18px_48px_-20px_rgba(16,31,60,0.3)] backdrop-blur">
                    <Icon name={s.cardIcon} className="h-7 w-7 text-ink-700 dark:text-ink-300" strokeWidth={1.6} />
                    <p className="mt-3 text-[17px] font-bold leading-snug text-ink-900 dark:text-white">
                      {s.cardTitle}
                    </p>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500 dark:text-ink-400">
                      {s.cardDesc}
                    </p>
                    <div className="mt-4 space-y-2 border-t border-ink-100 dark:border-white/10 pt-4">
                      {s.cardList.map((t) => (
                        <p key={t} className="flex items-center gap-2 text-[12.5px] font-medium text-ink-700 dark:text-ink-300">
                          <Icon name="check" className="h-4 w-4 text-verd-500" strokeWidth={2} /> {t}
                        </p>
                      ))}
                    </div>
                  </div>
                </aside>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows & Indicators */}
          <div className="pointer-events-none absolute inset-0 z-20 w-full">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="pointer-events-auto absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[1.2rem] text-ink-600 shadow-md transition-colors hover:bg-ink-50 sm:left-4 lg:left-6"
              aria-label="Previous slide"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="pointer-events-auto absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-600 bg-white text-[1.2rem] text-ink-600 shadow-sm transition-colors hover:bg-ink-50 sm:right-4 lg:right-6"
              aria-label="Next slide"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>

            {/* Carousel Indicators */}
            <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    currentSlide === index ? "bg-ink-800" : "bg-ink-300 hover:bg-ink-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Scheme tabs ---------------- */}
      <section id="how" className="bg-white dark:bg-[#000000] pt-12">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-ink-100 dark:border-white/10 " role="tablist" aria-label="Scheme categories">
            {schemeTabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`relative whitespace-nowrap px-4 py-3 text-[13.5px] font-semibold transition-colors ${
                  tab === t.key ? "text-ink-900 dark:text-white " : "text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:text-ink-300 "
                }`}
              >
                {t.label}
                {tab === t.key && <span className="absolute inset-x-3 bottom-0 h-[2.5px] rounded-full bg-ink-800" />}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(items.length ? items : schemes.popular).map((s) => (
              <SchemeCard key={s.key + tab} s={s} />
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 pb-16 pt-8">
            <Link to="/schemes">
              <Btn variant="outline" iconRight="arrow">View all schemes</Btn>
            </Link>
            <p className="text-[12px] text-ink-400 dark:text-ink-500 ">Showing {items.length} of 220+ services across ministries</p>
          </div>
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <section className="border-t border-ink-100 dark:border-white/10 bg-ink-50/70 dark:bg-white/5 ">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {[
            { icon: "shield", title: "Your data, your consent", sub: "Nothing is shared without your explicit approval, ever." },
            { icon: "clock", title: "Live status, always", sub: "Track every application the moment it moves forward." },
            { icon: "doc", title: "Zero paperwork", sub: "Verified once with Aadhaar, reused across all services." },
            { icon: "users", title: "Built for every citizen", sub: "22 languages, screen-reader friendly, senior-first design." },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <IconTile icon={f.icon} tone="blue" />
              <div>
                <p className="text-[14px] font-bold text-ink-900 dark:text-white ">{f.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500 dark:text-ink-400 ">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA footer ---------------- */}
      <section className="border-t border-ink-100 dark:border-white/10 bg-white dark:bg-[#000000] ">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 px-6 py-14 lg:flex-row lg:items-center lg:px-10">
          <div>
            <h2 className="font-display text-[28px] font-bold tracking-tight text-ink-900 dark:text-white ">One profile. Every service.</h2>
            <p className="mt-2 max-w-xl text-[14px] text-ink-500 dark:text-ink-400 ">
              Verify once with your Aadhaar and apply to any central scheme without re-filling a single form.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard"><Btn className="!px-6 !py-3" iconRight="arrow">Go to Dashboard</Btn></Link>
            <Link to="/data-transfer"><Btn variant="outline" className="!px-6 !py-3">Try Data Transfer</Btn></Link>
          </div>
        </div>

      </section>
    </div>
  );
}

function SchemeCard({ s }) {
  return (
    <Card hover className="group flex flex-col p-5">
      <div className="flex items-start justify-between">
        <IconTile icon={s.icon} tone={s.tint} size="lg" />
        <Icon name="arrow" className="h-4 w-4 text-ink-200 transition-all group-hover:translate-x-0.5 group-hover:text-ink-600 dark:text-ink-400 " />
      </div>
      <h3 className="mt-4 text-[15px] font-bold leading-snug text-ink-900 dark:text-white ">{s.title}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-500 dark:text-ink-400 ">{s.desc}</p>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-700 dark:text-ink-300 transition-colors hover:text-ink-900 dark:text-white "
      >
        {s.cta}
        <Icon name="arrow" className="h-4 w-4" />
      </a>
    </Card>
  );
}

function EmblemSmall() {
  return <span className="inline-block h-4 w-4 rounded-full border border-ink-200 dark:border-white/20 bg-ink-100 dark:bg-white/10 text-center text-[9px] leading-[14px] text-ink-600 dark:text-ink-400 ">◎</span>;
}
