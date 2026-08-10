// src/pages/HelpAndContact.tsx
import React, { useMemo, useState } from "react";
import {
  HelpCircleIcon,
  MailIcon,
  PhoneIcon,
  MessageCircleIcon,
  SearchIcon,
  SparklesIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  AlertCircleIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { PatientLayout } from "../layouts/patient/PatientLayout";

const card =
  "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.35)]";

const chipBase =
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border transition";

function chip(active: boolean) {
  return active
    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
    : "bg-white/80 dark:bg-slate-950/70 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/50";
}

type QuickFaq = {
  id: string;
  category: "appointments" | "billing" | "summaries" | "privacy" | "general";
  q: string;
  a: string;
};

const FAQS: QuickFaq[] = [
  {
    id: "cancel",
    category: "appointments",
    q: "Can I reschedule or cancel an appointment here?",
    a: "Not from the portal. Please call the clinic and share the appointment ID so they can update it for you.",
  },
  {
    id: "late",
    category: "appointments",
    q: "My appointment time has passed — what should I do?",
    a: "If you’re running late, call the clinic as soon as possible. They can guide you on availability and next steps.",
  },
  {
    id: "bill",
    category: "billing",
    q: "How do I correct a billing or invoice issue?",
    a: "Contact the clinic and mention the invoice ID (or the date + amount). They’ll verify and update your record.",
  },
  {
    id: "summaries",
    category: "summaries",
    q: "Why does it say “AI summaries” in Treatments?",
    a: "Summaries help explain clinical notes clearly. They’re reviewed by the clinic team before you see them here.",
  },
  {
    id: "privacy",
    category: "privacy",
    q: "Who can access my information?",
    a: "Only authorized clinic staff. Access is role-based and tracked for safety and accountability.",
  },
  {
    id: "records",
    category: "general",
    q: "What details should I share when contacting the clinic?",
    a: "Share the appointment ID or invoice ID, and the date/time shown in the portal. That’s enough to locate your record quickly.",
  },
];

function categoryLabel(c: QuickFaq["category"] | "all") {
  if (c === "appointments") return "Appointments";
  if (c === "billing") return "Billing";
  if (c === "summaries") return "Summaries";
  if (c === "privacy") return "Privacy";
  if (c === "general") return "General";
  return "All";
}

export const HelpAndContact: React.FC = () => {
  // (Optional later) load from clinic_settings
  const supportEmail = "support@dentalclinic.ai";
  const supportPhone = "+91-0000-000-000";

  const [copied, setCopied] = useState<null | "email" | "phone">(null);
  const [activeFaq, setActiveFaq] = useState<string>("cancel");
  const [cat, setCat] = useState<QuickFaq["category"] | "all">("all");
  const [q, setQ] = useState("");

  const filteredFaqs = useMemo(() => {
    const base = FAQS.filter((f) => cat === "all" || f.category === cat);
    const needle = q.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((f) =>
      `${f.q} ${f.a} ${f.category}`.toLowerCase().includes(needle)
    );
  }, [cat, q]);

  const copyToClipboard = async (text: string, which: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // still update UI even if clipboard API is blocked
    } finally {
      setCopied(which);
      window.setTimeout(() => setCopied(null), 1200);
    }
  };

  return (
    <PatientLayout>
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-28 right-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {/* HERO */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-5 py-5 shadow-[0_26px_80px_-55px_rgba(15,23,42,0.55)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <HelpCircleIcon size={14} />
                <span>Help & contact</span>
              </div>

              <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
                Need help? We’re here.
              </h1>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                For rescheduling, billing questions, or corrections, please
                contact the clinic using the options below.
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 px-3 py-1 text-[11px] text-slate-600 dark:text-slate-300">
                <SparklesIcon size={12} />
                <span>Tip: keep your appointment or invoice ID handy.</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/80 dark:border-amber-500/25 bg-amber-50/80 dark:bg-amber-950/25 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
                <AlertCircleIcon
                  size={16}
                  className="text-amber-600 dark:text-amber-300"
                />
                <span>For pain, swelling, or emergencies, call the clinic.</span>
              </div>
            </div>
          </div>

          {/* SEARCH + CHIPS */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500">
                <SearchIcon size={14} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search common questions…"
                className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "all",
                  "appointments",
                  "billing",
                  "summaries",
                  "privacy",
                  "general",
                ] as const
              ).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`${chipBase} ${chip(cat === c)}`}
                >
                  {categoryLabel(c)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTACT CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Phone */}
          <div className={card + " p-5"}>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              <PhoneIcon size={16} className="text-emerald-600 dark:text-emerald-300" />
              Phone
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Best for rescheduling, urgent questions, and quick clarifications.
            </p>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 px-4 py-3">
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Clinic phone</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {supportPhone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(supportPhone, "phone")}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                >
                  {copied === "phone" ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  {copied === "phone" ? "Copied" : "Copy"}
                </button>

                <a
                  href={`tel:${supportPhone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
                >
                  <ExternalLinkIcon size={14} />
                  Call
                </a>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className={card + " p-5"}>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              <MailIcon size={16} className="text-sky-600 dark:text-sky-300" />
              Email
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Best for non-urgent questions, sharing documents, or follow-ups.
            </p>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 px-4 py-3">
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Support email</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {supportEmail}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(supportEmail, "email")}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                >
                  {copied === "email" ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  {copied === "email" ? "Copied" : "Copy"}
                </button>

                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-semibold text-sky-950 hover:bg-sky-400"
                >
                  <ExternalLinkIcon size={14} />
                  Email
                </a>
              </div>
            </div>
          </div>

          {/* Portal notes */}
          <div className={card + " p-5"}>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              <MessageCircleIcon size={16} className="text-emerald-600 dark:text-emerald-300" />
              Portal notes
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              When you contact the clinic, mention:
            </p>

            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Appointment ID (or date & time if needed)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                Invoice ID (for billing questions)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                What looks incorrect (date, tooth, amount, etc.)
              </li>
            </ul>

            <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300">
              This helps the clinic locate your record quickly.
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className={card}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 px-4 py-4">
            <div className="flex items-center gap-2">
              <HelpCircleIcon size={16} className="text-emerald-600 dark:text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Quick answers
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  Tap a question to view the answer.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCat("all");
                setQ("");
                setActiveFaq("cancel");
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
              {filteredFaqs.map((f) => {
                const open = activeFaq === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      setActiveFaq((prev) => (prev === f.id ? "" : f.id))
                    }
                    className="w-full text-left px-4 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {f.q}
                        </p>
                        {open && (
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                            {f.a}
                          </p>
                        )}
                      </div>

                      <div className="mt-0.5 text-slate-400">
                        {open ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-[12px] text-slate-500 dark:text-slate-400">
          If you need urgent help, call the clinic directly.
        </div>
      </div>
    </PatientLayout>
  );
};
