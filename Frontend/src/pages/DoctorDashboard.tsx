import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarClockIcon,
  ActivityIcon,
  UsersIcon,
  ClipboardListIcon,
  AlertCircleIcon,
  SparklesIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  StethoscopeIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DoctorLayout } from "../layouts/doctor/DoctorLayout";

type DoctorAppointment = {
  id: string | number;
  date: string | null;
  time: string | null;
  patient: string;
  reason: string;
  room: string;
  status: string;
};
type DoctorCase = {
  id: string; patientName: string; toothRegion: string;
  diagnosis: string; stage: string; createdAt: string | null; updatedAt: string | null;
};
type DoctorPatient = { id: string; name: string; lastVisit: string | null; activeCases: number };
type AppointmentsResponse = { items: DoctorAppointment[]; date: string; message?: string };
type CasesResponse = { cases: DoctorCase[]; message?: string };
type PatientsResponse = { items: DoctorPatient[]; message?: string };

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("authToken") || localStorage.getItem("token") || "";
}
async function fetchWithAuth<T>(path: string): Promise<T> {
  const token = getToken();
  if (!token) { const e: any = new Error("No auth token"); e.code = "NO_TOKEN"; throw e; }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const e: any = new Error(data.message || `HTTP ${res.status}`); e.status = res.status; throw e;
  }
  return res.json() as Promise<T>;
}

const norm = (v: any) => String(v ?? "").trim().toUpperCase();

function parseLocalDateTime(dateStr: any, timeStr: any): Date | null {
  const d = String(dateStr || "").trim();
  const t = String(timeStr || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d) && /^\d{2}:\d{2}(:\d{2})?$/.test(t)) {
    const [hh, mm] = t.split(":");
    const dt = new Date(+d.slice(0,4), +d.slice(5,7)-1, +d.slice(8,10), +hh, +mm, 0, 0);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(d || t);
  return isNaN(dt.getTime()) ? null : dt;
}

function mapStatusLabel(raw: any) {
  const s = norm(raw);
  if (s === "CONFIRMED") return "Confirmed";
  if (s === "CHECKED IN" || s === "IN PROGRESS") return "In progress";
  if (s === "COMPLETED") return "Completed";
  if (s === "CANCELLED") return "Cancelled";
  if (s === "NO-SHOW" || s === "NO SHOW" || s === "NOSHOW") return "No-show";
  return s || "Pending";
}

function deriveDisplayStatus(raw: any, dt: Date | null, now: Date) {
  const s = norm(raw);
  const label = mapStatusLabel(raw);
  if (!dt) return label;
  const isFinal = ["COMPLETED","CANCELLED","NO-SHOW","NO SHOW","NOSHOW"].includes(s);
  if (!isFinal && dt.getTime() < now.getTime()) return "No-show";
  return label;
}

function sameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const STATUS_STYLES: Record<string, string> = {
  "CONFIRMED":   "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-300 dark:border-emerald-500/30",
  "IN PROGRESS": "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/12 dark:text-sky-300 dark:border-sky-500/30",
  "COMPLETED":   "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  "CANCELLED":   "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/12 dark:text-amber-300 dark:border-amber-500/30",
  "NO-SHOW":     "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/12 dark:text-rose-300 dark:border-rose-500/30",
  "PENDING":     "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};
function statusPill(label: string) {
  return STATUS_STYLES[norm(label)] || STATUS_STYLES["PENDING"];
}

/* ── Shared tokens ── */
const cardBase = "rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.10)] overflow-hidden";

type StatCardProps = {
  label: string; value: string | number; sub?: string;
  Icon: React.ElementType; iconBg: string; iconColor: string;
  accentColor: string; href: string; linkLabel: string;
};
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, Icon, iconBg, iconColor, accentColor, href, linkLabel }) => (
  <div className={`${cardBase} relative p-4 flex flex-col gap-2`}>
    <div className={`absolute top-0 left-0 right-0 h-[3px] ${accentColor}`} />
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={16} className={iconColor} />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-none">{value}</p>
    {sub && <p className="text-[11px] text-slate-500 dark:text-slate-400">{sub}</p>}
    <Link to={href} className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition pt-2 border-t border-slate-100 dark:border-slate-800">
      {linkLabel} <ArrowRightIcon size={11} />
    </Link>
  </div>
);

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Doctor";

  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [cases,        setCases]        = useState<DoctorCase[]>([]);
  const [patients,     setPatients]     = useState<DoctorPatient[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setErrorMsg(null);
        const [apptData, caseData, patientData] = await Promise.all([
          fetchWithAuth<AppointmentsResponse>("/api/doctor/appointments"),
          fetchWithAuth<CasesResponse>("/api/doctor/cases"),
          fetchWithAuth<PatientsResponse>("/api/doctor/patients"),
        ]);
        if (cancelled) return;
        setAppointments(apptData.items || []);
        setCases(caseData.cases || []);
        setPatients(patientData.items || []);
      } catch (err: any) {
        if (cancelled) return;
        if (err.code === "NO_TOKEN" || err.status === 401) { setErrorMsg("Session expired."); navigate("/login?role=doctor"); }
        else if (err.status === 403) setErrorMsg("No permission for this view.");
        else setErrorMsg(err.message || "Failed to load dashboard.");
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const now = useMemo(() => new Date(), []);

  const todayUpcoming = useMemo(() => {
    const n = new Date();
    return appointments
      .map((a) => {
        const dt = parseLocalDateTime(a.date, a.time);
        return { ...a, __dt: dt, __status: deriveDisplayStatus(a.status, dt, n) };
      })
      .filter((a: any) => {
        if (!a.__dt || !sameLocalDay(a.__dt, n)) return false;
        if (a.__dt.getTime() < n.getTime()) return false;
        const s = norm(a.__status);
        return !["COMPLETED","CANCELLED","NO-SHOW"].includes(s);
      })
      .sort((x: any, y: any) => x.__dt.getTime() - y.__dt.getTime());
  }, [appointments]);

  const totalAppts      = appointments.length;
  const nonCancelled    = appointments.filter((a) => norm(a.status) !== "CANCELLED");
  const completed       = appointments.filter((a) => norm(a.status) === "COMPLETED");
  const completionRate  = nonCancelled.length > 0 ? Math.round((completed.length / nonCancelled.length) * 100) : 0;
  const openCasesCount  = cases.filter((c) => !["CLOSED","COMPLETED"].includes(norm(c.stage))).length;

  return (
    <DoctorLayout>
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-0 h-80 w-80 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-sky-500/8 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── HERO BANNER ── */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 p-6 shadow-lg">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/6 blur-2xl" />
          <div className="absolute -bottom-10 left-8 w-36 h-36 rounded-full bg-white/6 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <StethoscopeIcon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-emerald-200 flex items-center gap-1.5">
                  <SparklesIcon size={12} /> Today's workspace
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Good day, {userName}.</h1>
                <p className="text-sm text-emerald-100/70 mt-1 max-w-lg">
                  Upcoming schedule, case load, and operational signals. Past appointments are hidden automatically.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 shrink-0">
              <ActivityIcon size={12} className="text-emerald-300" />
              Clinic-managed workflow
            </div>
          </div>
        </section>

        {/* ── ERROR ── */}
        {errorMsg && (
          <div className="rounded-xl border border-amber-300/60 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-200 animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
          <StatCard label="Appointments" value={loading ? "—" : totalAppts}
            Icon={CalendarClockIcon} iconBg="bg-emerald-50 dark:bg-emerald-500/12" iconColor="text-emerald-600 dark:text-emerald-400"
            accentColor="bg-emerald-500" href="/doctor/appointments" linkLabel="Open schedule" />
          <StatCard label="Open cases" value={loading ? "—" : openCasesCount}
            Icon={ClipboardListIcon} iconBg="bg-sky-50 dark:bg-sky-500/12" iconColor="text-sky-600 dark:text-sky-400"
            accentColor="bg-sky-500" href="/doctor/cases" linkLabel="View cases" />
          <StatCard label="Patient panel" value={loading ? "—" : patients.length}
            Icon={UsersIcon} iconBg="bg-violet-50 dark:bg-violet-500/12" iconColor="text-violet-600 dark:text-violet-400"
            accentColor="bg-violet-500" href="/doctor/patients" linkLabel="View patients" />
          <StatCard label="Completion rate" value={loading ? "—" : `${completionRate}%`}
            sub={loading ? "" : `${completed.length} of ${nonCancelled.length} appts`}
            Icon={TrendingUpIcon} iconBg="bg-amber-50 dark:bg-amber-500/12" iconColor="text-amber-600 dark:text-amber-400"
            accentColor="bg-amber-500" href="/doctor/insights" linkLabel="View insights" />
        </div>

        {/* ── TODAY'S UPCOMING ── */}
        <section className={`${cardBase} p-5`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/12 flex items-center justify-center">
                <CalendarClockIcon size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Upcoming today</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Future appointments only · past hidden</p>
              </div>
            </div>
            <Link to="/doctor/appointments" className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition">
              Full schedule <ChevronRightIcon size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : todayUpcoming.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/50 px-4 py-4">
              <AlertCircleIcon size={16} className="mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No upcoming appointments today</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Past-time items and auto no-shows are hidden. Check the full schedule for history.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {(todayUpcoming as any[]).map((a) => (
                <li key={String(a.id)}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/40 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Time chip */}
                    <div className="shrink-0 text-center">
                      <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800 px-2.5 py-1 font-mono text-[12px] font-bold text-slate-700 dark:text-slate-200">
                        {a.time || "—:—"}
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{a.room || "—"}</p>
                    </div>
                    {/* Patient info */}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">{a.patient}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{a.reason || "Visit"}</p>
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-600 mt-0.5">#{String(a.id)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusPill(a.__status)}`}>
                      {a.__status}
                    </span>
                    <Link to="/doctor/appointments" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition">
                      Details →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </DoctorLayout>
  );
};
