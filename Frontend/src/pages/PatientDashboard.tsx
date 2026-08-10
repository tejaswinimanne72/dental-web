// src/pages/PatientDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarIcon, FileTextIcon, CreditCardIcon, ChevronRightIcon,
  ClockIcon, CheckCircle2Icon, AlertCircleIcon, ShieldIcon,
  SparklesIcon, HeartPulseIcon, ArrowRightIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PatientLayout } from "../layouts/patient/PatientLayout";

type Appointment = {
  id: string; date: string | null; time: string | null;
  doctorName: string; reason: string; status: string; location?: string | null;
};
type TreatmentSummary = {
  id: string; title: string; lastUpdated: string | null; stage: string; snippet: string;
};
type Payment = {
  id: string | number; date: string | null; description: string;
  amount: number; currency?: string | null; status: string;
};
type DashboardResponse = {
  upcomingAppointments: Appointment[];
  treatmentSummaries: TreatmentSummary[];
  payments: Payment[];
  error?: boolean;
};
type LoadState = "idle" | "loading" | "ready" | "error";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:4000";

async function fetchWithAuth<T>(path: string): Promise<T> {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (!token) { const e: any = new Error("Missing auth token"); e.code = "NO_TOKEN"; throw e; }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const e: any = new Error(body.message || `HTTP ${res.status}`); e.status = res.status; throw e;
  }
  return res.json() as Promise<T>;
}

const normStatus = (s: any) => String(s || "").trim().toUpperCase();
const TERMINAL = new Set(["COMPLETED","CANCELLED","CANCELED","NO-SHOW","NOSHOW","NO SHOW"]);

function parseYMD(ds: any): { y:number; m:number; d:number } | null {
  if (!ds) return null;
  const s = String(ds).trim().slice(0,10);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return { y: +m[1], m: +m[2], d: +m[3] };
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) return { y: dt.getFullYear(), m: dt.getMonth()+1, d: dt.getDate() };
  return null;
}
function parseHM(ts: any): { hh:number; mm:number } | null {
  if (!ts) return null;
  const s = String(ts).trim();
  const ampm = s.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (ampm) {
    let hh = +ampm[1]; const mm = +ampm[2]; const ap = ampm[3].toUpperCase();
    if (hh === 12) hh = 0; if (ap === "PM") hh += 12;
    return { hh, mm };
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m24) return { hh: +m24[1], mm: +m24[2] };
  return null;
}
function parseLocalDateTime(ds: any, ts: any): Date | null {
  const ymd = parseYMD(ds); const hm = parseHM(ts);
  if (!ymd || !hm) return null;
  const dt = new Date(ymd.y, ymd.m-1, ymd.d, hm.hh, hm.mm, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
}
function formatDayTime(ds: any, ts: any) {
  const dt = parseLocalDateTime(ds, ts);
  if (!dt) return `${ds ? String(ds).slice(0,10) : "—"} · ${ts || "—"}`;
  return `${dt.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"2-digit"})} · ${dt.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})}`;
}

const STATUS_PILL: Record<string, string> = {
  CONFIRMED:  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-300 dark:border-emerald-500/30",
  REQUESTED:  "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/12 dark:text-sky-300 dark:border-sky-500/30",
  PENDING:    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/12 dark:text-sky-300 dark:border-sky-500/30",
  COMPLETED:  "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};
function statusPillClass(s: any) {
  return STATUS_PILL[normStatus(s)] || "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
}

/* ── Layout tokens ── */
const cardBase = "rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.10)] overflow-hidden";

const Skeleton: React.FC = () => (
  <div className="space-y-3">
    {[0,1].map(i=>(
      <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 animate-pulse">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 p-6 text-center">
    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
      <AlertCircleIcon size={18} className="text-slate-400" />
    </div>
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
  </div>
);

export const PatientDashboard: React.FC = () => {
  const userName = localStorage.getItem("userName") || "Patient";
  const navigate = useNavigate();

  const [rawAppointments, setRawAppointments] = useState<Appointment[]>([]);
  const [treatmentSummaries, setTreatmentSummaries] = useState<TreatmentSummary[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("loading"); setErrorMsg(null);
        const data = await fetchWithAuth<DashboardResponse>("/api/patient/dashboard");
        if (cancelled) return;
        setRawAppointments(data.upcomingAppointments ?? []);
        setTreatmentSummaries(data.treatmentSummaries ?? []);
        setPayments(data.payments ?? []);
        setStatus("ready");
      } catch (err: any) {
        if (cancelled) return;
        if (err.code === "NO_TOKEN" || err.status === 401) { setErrorMsg("Session expired."); setStatus("error"); navigate("/login?role=patient"); }
        else { setErrorMsg(err.message || "Failed to load dashboard."); setStatus("error"); }
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const visiblePayments = useMemo(() => (payments || []).filter(p => +p.amount > 0), [payments]);
  const pendingCount = visiblePayments.filter(p => p.status?.toUpperCase() !== "PAID").length;
  const currSym = visiblePayments[0]?.currency === "INR" || !visiblePayments[0]?.currency ? "₹" : `${visiblePayments[0]?.currency} `;

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return (rawAppointments || [])
      .filter(a => { const st = normStatus(a?.status); if (TERMINAL.has(st)) return false; const dt = parseLocalDateTime(a?.date, a?.time); if (dt && dt.getTime() < now) return false; return true; })
      .sort((x, y) => {
        const dx = parseLocalDateTime(x.date, x.time)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const dy = parseLocalDateTime(y.date, y.time)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return dx - dy;
      });
  }, [rawAppointments]);

  return (
    <PatientLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-600 p-6 shadow-lg">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:36px_36px]" />
          <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-white/6 blur-2xl" />
          <div className="absolute -bottom-10 left-6 w-36 h-36 rounded-full bg-white/6 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <HeartPulseIcon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-sky-100 flex items-center gap-1.5">
                  <SparklesIcon size={12} /> Patient overview
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Hi {userName}, welcome back.</h1>
                <p className="text-sm text-sky-100/70 mt-1 max-w-xl">
                  Your upcoming visits, treatments, and recent billing at a glance.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 shrink-0">
              <ShieldIcon size={12} className="text-emerald-200" />
              Clinic-managed data
            </div>
          </div>

          {errorMsg && (
            <div className="relative mt-4 rounded-xl border border-amber-300/50 bg-amber-500/20 px-4 py-2.5 text-xs text-white font-medium">
              {errorMsg}
            </div>
          )}
        </section>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
          {[
            { label:"Upcoming visits", value: status==="ready" ? upcomingAppointments.length : "—",
              Icon: CalendarIcon, iconBg:"bg-sky-50 dark:bg-sky-500/12", iconColor:"text-sky-600 dark:text-sky-400",
              accent:"bg-sky-500", href:"/patient/appointments", linkLabel:"Open schedule" },
            { label:"Active treatments", value: status==="ready" ? treatmentSummaries.length : "—",
              Icon: FileTextIcon, iconBg:"bg-emerald-50 dark:bg-emerald-500/12", iconColor:"text-emerald-600 dark:text-emerald-400",
              accent:"bg-emerald-500", href:"/patient/treatments", linkLabel:"View details" },
            { label:"Pending invoices", value: status==="ready" ? pendingCount : "—",
              Icon: CreditCardIcon, iconBg:"bg-amber-50 dark:bg-amber-500/12", iconColor:"text-amber-600 dark:text-amber-400",
              accent:"bg-amber-500", href:"/patient/billing", linkLabel:"Open billing" },
          ].map(({ label, value, Icon, iconBg, iconColor, accent, href, linkLabel }) => (
            <div key={label} className={`${cardBase} relative p-4 flex flex-col gap-2`}>
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${accent}`} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon size={16} className={iconColor} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-none">{value}</p>
              <Link to={href} className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition pt-2 border-t border-slate-100 dark:border-slate-800">
                {linkLabel} <ArrowRightIcon size={11} />
              </Link>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-5">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Upcoming appointments */}
            <div className={cardBase}>
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/12 flex items-center justify-center">
                    <CalendarIcon size={15} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Upcoming appointments</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><ClockIcon size={10} /> Local time zone</p>
                  </div>
                </div>
                <Link to="/patient/appointments" className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition">
                  All <ChevronRightIcon size={13} />
                </Link>
              </div>

              <div className="px-5 pb-5">
                {status === "loading" && <Skeleton />}
                {status === "ready" && upcomingAppointments.length === 0 && (
                  <EmptyState title="No upcoming appointments" desc="When the clinic schedules your next visit, it will appear here." />
                )}
                {status === "ready" && upcomingAppointments.length > 0 && (
                  <ul className="space-y-3">
                    {upcomingAppointments.map(apt => (
                      <li key={apt.id}
                        className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900 dark:text-slate-50">{formatDayTime(apt.date, apt.time)}</p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{apt.reason || "Visit"}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                              With <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.doctorName || "Doctor"}</span>
                              {" · "}{apt.location || "Main clinic"}
                            </p>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusPillClass(apt.status)}`}>
                              {apt.status}
                            </span>
                            <Link to="/patient/appointments" className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-0.5">
                              Details <ChevronRightIcon size={12} />
                            </Link>
                          </div>
                        </div>
                        <p className="mt-2.5 text-[10px] font-mono text-slate-400 dark:text-slate-600">ID: {apt.id}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Treatment summaries */}
            <div className={`${cardBase} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/12 flex items-center justify-center">
                    <FileTextIcon size={15} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Treatment summaries</h2>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2Icon size={10} /> AI-assisted notes</p>
                  </div>
                </div>
                <Link to="/patient/treatments" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                  All <ChevronRightIcon size={13} />
                </Link>
              </div>
              {status === "loading" && <Skeleton />}
              {status === "ready" && treatmentSummaries.length === 0 && (
                <EmptyState title="No treatment summaries yet" desc="After a completed visit, your treatment notes appear here." />
              )}
              {status === "ready" && treatmentSummaries.length > 0 && (
                <ul className="space-y-3">
                  {treatmentSummaries.map(t => (
                    <li key={t.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-50">{t.title}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{t.lastUpdated || "—"}</span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Stage: {t.stage || "—"}</p>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">{t.snippet}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">

            {/* Payments */}
            <div className={`${cardBase} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/12 flex items-center justify-center">
                    <CreditCardIcon size={15} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Payments & invoices</h2>
                </div>
                <Link to="/patient/billing" className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                  All <ChevronRightIcon size={13} />
                </Link>
              </div>
              {status === "loading" && <Skeleton />}
              {status === "ready" && visiblePayments.length === 0 && (
                <EmptyState title="No invoices yet" desc="Invoices appear here after treatments are billed by the clinic." />
              )}
              {status === "ready" && visiblePayments.length > 0 && (
                <ul className="space-y-3">
                  {visiblePayments.map(p => {
                    const paid = normStatus(p.status) === "PAID";
                    return (
                      <li key={p.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3.5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-50 truncate">{p.description}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{p.date || "—"}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-sm text-amber-700 dark:text-amber-300 tabular-nums">
                            {currSym}{(+p.amount||0).toLocaleString("en-IN")}
                          </p>
                          <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${paid ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-300 dark:border-emerald-500/30" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/12 dark:text-amber-300 dark:border-amber-500/30"}`}>
                            {paid ? <CheckCircle2Icon size={9} /> : <AlertCircleIcon size={9} />}
                            {p.status}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Data note */}
            <div className={`${cardBase} p-4 flex items-start gap-3`}>
              <ShieldIcon size={18} className="text-sky-500 dark:text-sky-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-1">Data from your clinic</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Appointments, treatments, and billing refresh automatically from the clinic's system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};
