// src/layouts/patient/PatientHelp.tsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Info,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CalendarDays,
  CreditCard,
  ClipboardList,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";
import { PatientLayout } from "./PatientLayout";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: "appointments" | "billing" | "profile" | "general";
};

const FAQS: FaqItem[] = [
  {
    id: "how-book-appointment",
    category: "appointments",
    question: "How do I book an appointment?",
    answer:
      "Open Appointments and choose a doctor, date, and time. Once you confirm, you’ll see it in your schedule and receive an in-app update.",
  },
  {
    id: "reschedule-appointment",
    category: "appointments",
    question: "Can I reschedule or cancel an appointment?",
    answer:
      "Yes. Open Appointments and select an upcoming visit. If changes aren’t available for your slot, please call the clinic for help.",
  },
  {
    id: "view-treatment-history",
    category: "profile",
    question: "Where can I see my treatment history?",
    answer:
      "Open Treatment summaries from the sidebar. You’ll find the timeline, notes shared by your dentist, and follow-up information.",
  },
  {
    id: "billing-summary",
    category: "billing",
    question: "How do I view my bills and payments?",
    answer:
      "Open Billing to see invoices, payment status, and any pending balance. For payment links or corrections, contact the clinic.",
  },
  {
    id: "update-contact-details",
    category: "profile",
    question: "How can I update my phone number or address?",
    answer:
      "If your profile editing is available, update it from your account area. If it’s locked, the clinic can update it for you.",
  },
  {
    id: "data-privacy",
    category: "general",
    question: "Who can see my data inside the clinic?",
    answer:
      "Only authorized clinic staff can access your records. Access is role-based and tracked for safety and accountability.",
  },
];

type Category = FaqItem["category"] | "all";

const card =
  "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.35)]";

const chipBase =
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border transition";

function chip(active: boolean) {
  return active
    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
    : "bg-white/80 dark:bg-slate-950/70 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/50";
}

function categoryLabel(c: Category) {
  if (c === "appointments") return "Appointments";
  if (c === "billing") return "Billing";
  if (c === "profile") return "Profile & records";
  if (c === "general") return "General";
  return "All";
}

export const PatientHelp: React.FC = () => {
  const [activeFaqId, setActiveFaqId] = useState<string | null>("how-book-appointment");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [q, setQ] = useState("");

  const filteredFaqs = useMemo(() => {
    const base = FAQS.filter((f) => selectedCategory === "all" || f.category === selectedCategory);
    const needle = q.trim().toLowerCase();
    if (!needle) return base;

    return base.filter((f) => {
      const hay = `${f.question} ${f.answer} ${f.category}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [selectedCategory, q]);

  return (
    <PatientLayout>
      {/* subtle glow (matches your other pages) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-24 right-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-5 py-5 shadow-[0_26px_80px_-55px_rgba(15,23,42,0.55)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <MessageCircle size={14} />
                <span>Help Center</span>
              </div>

              <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
                How can we help?
              </h1>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                Quick answers about appointments, billing, and your records — designed for your patient account.
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 px-3 py-1 text-[11px] text-slate-600 dark:text-slate-300">
                <SparklesIcon size={12} />
                <span>Tip: search by “reschedule”, “invoice”, or “privacy”.</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Need help from the clinic team?
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/help/contact"
                  className="inline-flex items-center rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
                >
                  <Mail size={14} className="mr-1" />
                  Contact support
                </Link>

                <button
                  type="button"
                  onClick={() => window.alert("Please call your clinic’s front desk number for urgent help.")}
                  className="inline-flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                >
                  <Phone size={14} className="mr-1" />
                  Call clinic
                </button>
              </div>
            </div>
          </div>

          {/* search + category chips */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500">
                <SearchIcon size={14} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search help topics…"
                className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "appointments", "billing", "profile", "general"] as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`${chipBase} ${chip(selectedCategory === c)}`}
                  type="button"
                >
                  {categoryLabel(c)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gentle info banner */}
        <div className={`${card} px-4 py-3`}>
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 text-amber-500 dark:text-amber-300" />
            <p className="text-sm text-slate-700 dark:text-slate-200">
              This app helps manage appointments and records. For pain, swelling, or emergencies,
              please call the clinic directly.
            </p>
          </div>
        </div>

        {/* FAQ list */}
        <div className={card}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 px-4 py-4">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-emerald-600 dark:text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Frequently asked questions
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  Tap a question to view the answer.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setQ("");
                setActiveFaqId("how-book-appointment");
              }}
              className="rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
            >
              Reset
            </button>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No results. Try a different keyword.
            </div>
          ) : (
            <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {filteredFaqs.map((faq) => {
                const isActive = activeFaqId === faq.id;
                return (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => setActiveFaqId((prev) => (prev === faq.id ? null : faq.id))}
                    className="w-full text-left px-4 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {faq.question}
                        </p>
                        {isActive && (
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>

                      <div className="mt-0.5 text-slate-400">
                        {isActive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-[12px] text-slate-500 dark:text-slate-400">
          If you still need help, use <span className="font-semibold text-slate-800 dark:text-slate-200">Contact support</span>.
        </div>
      </div>
    </PatientLayout>
  );
};
