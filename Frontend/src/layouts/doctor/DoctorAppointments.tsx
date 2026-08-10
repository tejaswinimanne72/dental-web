// src/layouts/doctor/DoctorAppointments.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  HistoryIcon,
  SearchIcon,
  PackageIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
  Loader2Icon,
} from "lucide-react";
import { DoctorLayout } from "../../layouts/doctor/DoctorLayout";

type DoctorAppointment = {
  dbId: number; // numeric DB id for complete endpoint
  id: string; // appointment_uid for display
  date: string | null; // YYYY-MM-DD preferred OR ISO string
  time: string | null; // HH:MM
  patient: string;
  reason: string;
  room: string;
  status: string;

  durationMin?: number | null;

  // optional raw fields (if backend provides)
  scheduledAtRaw?: string | null; // ISO datetime
};

type ViewMode = "UPCOMING" | "HISTORY" | "ALL";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:4000";

const getAuthToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

const norm = (v: any) => String(v ?? "").trim().toUpperCase();

function asNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : -1;
}

function safeJson(res: Response) {
  return res.json().catch(() => ({}));
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Robust local datetime parsing:
 * - If date=YYYY-MM-DD and time=HH:mm -> build local Date
 * - Else if date is ISO -> new Date(date)
 * - Else if scheduledAtRaw exists -> new Date(scheduledAtRaw)
 */
function parseLocalDateTime(dateStr: any, timeStr: any, scheduledAtRaw?: any): Date | null {
  const d = String(dateStr || "").trim();
  const t = String(timeStr || "").trim();
  const raw = String(scheduledAtRaw || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(d) && /^\d{2}:\d{2}(:\d{2})?$/.test(t)) {
    const [hh, mm] = t.split(":");
    const dt = new Date(
      Number(d.slice(0, 4)),
      Number(d.slice(5, 7)) - 1,
      Number(d.slice(8, 10)),
      Number(hh),
      Number(mm),
      0,
      0
    );
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // date itself might be ISO
  const dt1 = d ? new Date(d) : null;
  if (dt1 && !Number.isNaN(dt1.getTime())) return dt1;

  // fallback to scheduledAtRaw
  const dt2 = raw ? new Date(raw) : null;
  if (dt2 && !Number.isNaN(dt2.getTime())) return dt2;

  return null;
}

// --- Status normalization ---
// We want "final" detection to be extremely robust so completed never leaks into Upcoming.
const FINAL_STATUS_SET = new Set([
  "COMPLETED",
  "COMPLETE",
  "DONE",
  "FINISHED",
  "CANCELLED",
  "CANCELED",
  "CANCEL",
  "NO-SHOW",
  "NO SHOW",
  "NOSHOW",
  "NO_SHOW",
]);

function isFinalBackendStatus(raw: any) {
  const s = norm(raw).replace(/_/g, " ");
  if (!s) return false;

  // Some backends send e.g. "Completed " or "Done"
  if (FINAL_STATUS_SET.has(s)) return true;

  // extra tolerant
  if (s.includes("NO") && s.includes("SHOW")) return true;
  if (s === "CANCEL" || s === "CANCELLED" || s === "CANCELED") return true;
  if (s === "COMPLETED" || s === "COMPLETE" || s === "DONE" || s === "FINISHED") return true;

  return false;
}

function mapStatusLabel(raw: any) {
  const s0 = norm(raw).replace(/_/g, " ");

  if (s0 === "CONFIRMED") return "Confirmed";
  if (s0 === "CHECKED IN" || s0 === "IN PROGRESS") return "In progress";
  if (s0 === "COMPLETED" || s0 === "COMPLETE" || s0 === "DONE" || s0 === "FINISHED") return "Completed";
  if (s0 === "CANCELLED" || s0 === "CANCELED" || s0 === "CANCEL") return "Cancelled";
  if (s0 === "NO SHOW" || s0 === "NO-SHOW" || s0 === "NOSHOW" || s0 === "NO_SHOW") return "No-show";
  if (s0 === "REQUESTED") return "Requested";
  if (s0 === "PENDING") return "Pending";

  if (!s0) return "Pending";
  return String(raw);
}

const DEFAULT_DURATION_MIN = 20;
const GRACE_MIN_DELAY = 10;
const GRACE_MIN_NO_SHOW = 45;

type Phase = "FUTURE" | "LIVE" | "LATE" | "MISSED" | "UNKNOWN";

function computePhase(scheduledAt: Date | null, durationMin: number | null | undefined, now: Date): Phase {
  if (!scheduledAt) return "UNKNOWN";

  const start = scheduledAt.getTime();
  const dur = Math.max(5, Number(durationMin ?? DEFAULT_DURATION_MIN));
  const end = start + dur * 60_000;

  const lateThreshold = start + GRACE_MIN_DELAY * 60_000;
  const missThreshold = start + GRACE_MIN_NO_SHOW * 60_000;

  const t = now.getTime();
  if (t < start) return "FUTURE";
  if (t <= Math.max(end, lateThreshold)) return "LIVE";
  if (t <= missThreshold) return "LATE";
  return "MISSED";
}

/**
 * IMPORTANT workflow rule:
 * - We NEVER invent "No-show" just because time passed.
 * - Until backend marks NO-SHOW, we show LATE / MISSED (pending).
 */
function deriveUiLabel(rawStatus: any, phase: Phase): string {
  if (isFinalBackendStatus(rawStatus)) return mapStatusLabel(rawStatus);

  const base = mapStatusLabel(rawStatus);

  if (phase === "FUTURE" || phase === "UNKNOWN") return base;
  if (norm(base) === "IN PROGRESS") return "In progress";
  if (phase === "LIVE") return "Live";
  if (phase === "LATE") return "Late";
  if (phase === "MISSED") return "Missed (pending)";
  return base;
}

function pillClass(label: string) {
  const s = norm(label).replace(/_/g, " ");

  if (s === "CONFIRMED")
    return "border-emerald-200/70 dark:border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200";
  if (s === "IN PROGRESS" || s === "LIVE")
    return "border-sky-200/70 dark:border-sky-500/30 bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-200";
  if (s === "LATE")
    return "border-amber-200/70 dark:border-amber-500/30 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200";
  if (s === "MISSED (PENDING)" || s === "MISSED")
    return "border-rose-200/70 dark:border-rose-500/30 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200";
  if (s === "COMPLETED")
    return "border-slate-200/80 dark:border-slate-700 bg-slate-50 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200";
  if (s === "CANCELLED")
    return "border-amber-200/70 dark:border-amber-500/30 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200";
  if (s === "NO-SHOW" || s === "NO SHOW")
    return "border-rose-200/70 dark:border-rose-500/30 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200";
  if (s === "REQUESTED" || s === "PENDING")
    return "border-slate-200/80 dark:border-slate-800 bg-white/80 text-slate-700 dark:bg-slate-950/60 dark:text-slate-200";

  return "border-slate-200/80 dark:border-slate-800 bg-white/80 text-slate-700 dark:bg-slate-950/60 dark:text-slate-200";
}

function doneEligibility(label: string, rawStatus: any, dbId: number, phase: Phase): { can: boolean; why: string } {
  if (!dbId || dbId <= 0) return { can: false, why: "Missing DB id from API response." };
  if (isFinalBackendStatus(rawStatus)) return { can: false, why: "Already final." };

  if (phase === "FUTURE") return { can: false, why: "Not started yet." };
  if (phase === "MISSED") return { can: false, why: "Past grace window; wait for monitor or handle in history." };

  const s = norm(label).replace(/_/g, " ");
  if (s === "LIVE" || s === "LATE" || s === "CONFIRMED" || s === "IN PROGRESS" || s === "PENDING" || s === "REQUESTED")
    return { can: true, why: "" };

  return { can: false, why: "Not eligible right now." };
}

function fmtWhen(dt: Date | null, date: string | null, time: string | null) {
  if (dt) {
    const dd = dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    const tt = dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${dd} • ${tt}`;
  }
  const d = date || "—";
  const t = time || "--:--";
  return `${d} • ${t}`;
}

// ------------------------------
// Consumables workflow types
// ------------------------------
type ConsumableLine = {
  item_code: string;
  qty_used: number;
  name?: string;
};

type CatalogItem = {
  item_code: string;
  name: string;
  stock?: number | null;
  expiry_date?: string | null;
};

function cleanCode(v: any) {
  return String(v ?? "").trim().toUpperCase();
}

function cleanQty(v: any) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function sameKey(a: ConsumableLine, b: ConsumableLine) {
  return cleanCode(a.item_code) === cleanCode(b.item_code);
}

export const DoctorAppointments: React.FC = () => {
  const [rows, setRows] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>("UPCOMING");
  const [q, setQ] = useState("");
  const [completingId, setCompletingId] = useState<number | null>(null);

  // tick keeps lists accurate as time passes (no refresh required)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // keep only page content scroll (sidebar stable)
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // request cancellation
  const abortRef = useRef<AbortController | null>(null);

  // ------------------------------
  // Consumables modal state
  // ------------------------------
  const [consModalOpen, setConsModalOpen] = useState(false);
  const [consModalDbId, setConsModalDbId] = useState<number | null>(null);
  const [consModalMode, setConsModalMode] = useState<"EDIT" | "COMPLETE">("EDIT");

  const [consLoading, setConsLoading] = useState(false);
  const [consSaving, setConsSaving] = useState(false);
  const [consErr, setConsErr] = useState<string | null>(null);
  const [consNotice, setConsNotice] = useState<string | null>(null);
  const consNoticeTimer = useRef<number | null>(null);

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [lines, setLines] = useState<ConsumableLine[]>([{ item_code: "", qty_used: 1 }]);
  const [savedByAppt, setSavedByAppt] = useState<Record<number, ConsumableLine[]>>({});

  async function fetchAppointments() {
    const token = getAuthToken();
    if (!token) {
      setErr("Please log in again to view your schedule.");
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(`${API_BASE_URL}/api/doctor/appointments`, {
        headers: authHeaders(token),
        signal: ac.signal,
      });

      const body = await safeJson(res);
      if (!res.ok) throw new Error(body.message || "Couldn’t load appointments.");

      const raw = Array.isArray(body.items) ? body.items : Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : [];

      const items: DoctorAppointment[] = raw.map((x: any) => {
        const dbId = asNumber(
          x.dbId ??
            x.db_id ??
            x.appointment_db_id ??
            x.appointment_id ??
            x.appointmentId ??
            (typeof x.id === "number" ? x.id : null)
        );

        const displayUid = String(
          x.appointment_uid ?? x.appointmentUid ?? x.uid ?? (typeof x.id === "string" ? x.id : "") ?? ""
        ).trim();

        const durationMin = (() => {
          const v = Number(
            x.durationMin ??
              x.duration_min ??
              x.predictedDurationMin ??
              x.predicted_duration_min ??
              x.estimated_duration_min ??
              ""
          );
          return Number.isFinite(v) && v > 0 ? v : null;
        })();

        const scheduledAtRaw = (x.scheduled_at ?? x.scheduledAt ?? x.scheduled_datetime ?? x.scheduledDatetime ?? null) as
          | string
          | null;

        return {
          dbId,
          id: displayUid || String(dbId > 0 ? dbId : ""),
          date: x.date ?? x.scheduled_date ?? x.scheduledDate ?? (scheduledAtRaw ? String(scheduledAtRaw) : null),
          time: x.time ?? x.scheduled_time ?? x.scheduledTime ?? null,
          patient: x.patient ?? x.patient_name ?? x.patientName ?? "—",
          reason: x.reason ?? x.type ?? x.visit_type ?? "Visit",
          room: x.room ?? x.operatory ?? x.operatory_name ?? "—",
          status: x.status ?? "Pending",
          durationMin,
          scheduledAtRaw,
        };
      });

      setRows(items);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message || "Couldn’t load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = useMemo(() => new Date(), [tick, loading]);

  const enriched = useMemo(() => {
    return rows.map((a) => {
      const dt = parseLocalDateTime(a.date, a.time, a.scheduledAtRaw);
      const phase = computePhase(dt, a.durationMin ?? null, now);
      const label = deriveUiLabel(a.status, phase);
      const labelIsFinal = norm(label) === "COMPLETED" || norm(label) === "CANCELLED" || norm(label) === "NO-SHOW" || norm(label) === "NO SHOW";
      const finalByAny = isFinalBackendStatus(a.status) || labelIsFinal;
      return { ...a, __dt: dt, __phase: phase, __label: label, __isFinal: finalByAny };
    });
  }, [rows, now]);

  const counts = useMemo(() => {
    const upcoming = enriched.filter((a: any) => {
      if (!a.__dt) return false;
      if (a.__isFinal) return false;
      const phase = a.__phase as Phase;
      return phase === "FUTURE" || phase === "LIVE" || phase === "LATE";
    }).length;

    const history = enriched.filter((a: any) => {
      if (a.__isFinal) return true;
      const phase = a.__phase as Phase;
      return phase === "MISSED";
    }).length;

    const live = enriched.filter((a: any) => !a.__isFinal && a.__phase === "LIVE").length;
    const late = enriched.filter((a: any) => !a.__isFinal && a.__phase === "LATE").length;
    const missedPending = enriched.filter((a: any) => !a.__isFinal && a.__phase === "MISSED").length;

    return { upcoming, history, all: enriched.length, live, late, missedPending };
  }, [enriched]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const upcoming = enriched
      .filter((a: any) => {
        if (!a.__dt) return false;
        if (a.__isFinal) return false;
        const phase = a.__phase as Phase;
        return phase === "FUTURE" || phase === "LIVE" || phase === "LATE";
      })
      .sort((x: any, y: any) => {
        const ax = x.__dt ? x.__dt.getTime() : Number.MAX_SAFE_INTEGER;
        const ay = y.__dt ? y.__dt.getTime() : Number.MAX_SAFE_INTEGER;
        return ax - ay;
      });

    const history = enriched
      .filter((a: any) => {
        if (a.__isFinal) return true;
        const phase = a.__phase as Phase;
        return phase === "MISSED";
      })
      .sort((x: any, y: any) => {
        const ax = x.__dt ? x.__dt.getTime() : 0;
        const ay = y.__dt ? y.__dt.getTime() : 0;
        return ay - ax;
      });

    const base = view === "UPCOMING" ? upcoming : view === "HISTORY" ? history : [...upcoming, ...history];

    if (!query) return base;

    return base.filter((a: any) => {
      const hay = `${a.patient} ${a.reason} ${a.room} ${a.id} ${a.__label}`.toLowerCase();
      return hay.includes(query);
    });
  }, [enriched, view, q]);

  const actionableCount = useMemo(() => {
    return enriched.filter((a: any) => {
      const el = doneEligibility(a.__label, a.status, a.dbId, a.__phase);
      return el.can;
    }).length;
  }, [enriched]);

  // ------------------------------
  // Catalog + consumables APIs (robust fallbacks)
  // ------------------------------
  async function tryLoadCatalog() {
    const token = getAuthToken();
    if (!token) return;

    setCatalogLoading(true);
    try {
      const candidates = [
        `${API_BASE_URL}/api/doctor/inventory/catalog`,
        `${API_BASE_URL}/api/doctor/inventory`,
      ];

      let ok = false;
      for (const url of candidates) {
        try {
          const res = await fetch(url, { headers: authHeaders(token) });
          const body = await safeJson(res);
          if (!res.ok) continue;

          const list = Array.isArray(body)
            ? body
            : Array.isArray(body.items)
            ? body.items
            : Array.isArray(body.data)
            ? body.data
            : [];

          const mapped: CatalogItem[] = list
            .map((x: any) => ({
              item_code: cleanCode(x.item_code ?? x.itemCode ?? x.code ?? x.sku ?? ""),
              name: String(x.name ?? x.item_name ?? x.title ?? "").trim(),
              stock: x.stock ?? x.quantity ?? x.qty ?? null,
              expiry_date: x.expiry_date ?? x.expiryDate ?? x.expiry ?? null,
            }))
            .filter((x: CatalogItem) => x.item_code && x.name);

          if (mapped.length) {
            setCatalog(mapped);
            ok = true;
            break;
          }
        } catch {
          // try next
        }
      }

      if (!ok) setCatalog([]);
    } finally {
      setCatalogLoading(false);
    }
  }

  async function fetchConsumables(dbId: number) {
    const token = getAuthToken();
    if (!token) throw new Error("Please log in again.");

    const res = await fetch(`${API_BASE_URL}/api/doctor/appointments/${dbId}/consumables`, {
      headers: authHeaders(token),
    });
    const body = await safeJson(res);
    if (!res.ok) return { items: [] as ConsumableLine[] };

    const items = Array.isArray(body.items) ? body.items : Array.isArray(body.data) ? body.data : [];
    const mapped: ConsumableLine[] = items
      .map((x: any) => ({
        item_code: cleanCode(
          x.item_code ?? x.itemCode ?? x.item_ref ?? x.itemRef ?? x.item_key ?? x.itemKey ?? x.code ?? ""
        ),
        qty_used: cleanQty(x.qty_used ?? x.qtyUsed ?? x.qty ?? x.quantity ?? 1),
        name: String(x.name ?? x.item_name ?? "").trim() || undefined,
      }))
      .filter((x: ConsumableLine) => x.item_code);

    return { items: mapped };
  }

  async function saveConsumables(dbId: number, nextLines: ConsumableLine[]) {
    const token = getAuthToken();
    if (!token) throw new Error("Please log in again.");

    const payload = {
      items: nextLines.map((x) => {
        const itemCode = cleanCode(x.item_code);
        const qty = cleanQty(x.qty_used);
        return {
          itemRef: itemCode,
          item_code: itemCode,
          qty,
          quantity: qty,
          qty_used: qty,
        };
      }),
    };

    const res = await fetch(`${API_BASE_URL}/api/doctor/appointments/${dbId}/consumables`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const body = await safeJson(res);

    if (!res.ok) {
      const msg =
        body?.message ||
        body?.error ||
        (res.status === 404
          ? "Consumables endpoint not implemented in backend yet."
          : `HTTP ${res.status}`);
      throw new Error(msg);
    }

    return body;
  }

  // ------------------------------
  // Modal open/close helpers
  // ------------------------------
  async function openConsumables(dbId: number, mode: "EDIT" | "COMPLETE") {
    setConsModalOpen(true);
    setConsModalDbId(dbId);
    setConsModalMode(mode);
    setConsErr(null);
    setConsNotice(null);

    if (!catalogLoading && catalog.length === 0) {
      setCatalogLoading(true);
      try {
        await tryLoadCatalog();
      } finally {
        setCatalogLoading(false);
      }
    }

    setConsLoading(true);
    try {
      const cached = savedByAppt[dbId];
      if (cached && cached.length) {
        setLines(cached.map((x) => ({ ...x })));
      } else {
        const data = await fetchConsumables(dbId);
        const existing = data.items || [];
        if (existing.length) {
          setLines(existing.map((x) => ({ ...x })));
          setSavedByAppt((m) => ({ ...m, [dbId]: existing }));
        } else {
          setLines([{ item_code: "", qty_used: 1 }]);
        }
      }
    } catch (e: any) {
      setLines([{ item_code: "", qty_used: 1 }]);
      setConsErr(e?.message || "Couldn’t load consumables.");
    } finally {
      setConsLoading(false);
    }
  }

  function closeConsumables() {
    if (consSaving) return;
    setConsModalOpen(false);
    setConsModalDbId(null);
    setConsErr(null);
    setConsNotice(null);
  }

  function addLine() {
    setLines((prev) => [...prev, { item_code: "", qty_used: 1 }]);
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, patch: Partial<ConsumableLine>) {
    setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  function inferName(code: string) {
    const c = cleanCode(code);
    if (!c) return undefined;
    const hit = catalog.find((x) => cleanCode(x.item_code) === c);
    return hit?.name;
  }

  function validateLines(next: ConsumableLine[]) {
    const cleaned = next
      .map((x) => ({
        item_code: cleanCode(x.item_code),
        qty_used: cleanQty(x.qty_used),
        name: x.name,
      }))
      .filter((x) => x.item_code);

    const merged: ConsumableLine[] = [];
    for (const x of cleaned) {
      const existing = merged.find((m) => sameKey(m, x));
      if (existing) existing.qty_used = cleanQty((existing.qty_used || 0) + (x.qty_used || 0));
      else merged.push({ ...x, name: x.name || inferName(x.item_code) });
    }

    return { merged };
  }

  async function onSaveConsumables() {
    if (!consModalDbId) return;

    setConsErr(null);
    setConsNotice(null);
    setConsSaving(true);
    try {
      const { merged } = validateLines(lines);
      if (merged.length === 0) {
        setConsErr("Add at least one item before saving.");
        return;
      }
      await saveConsumables(consModalDbId, merged);

      setSavedByAppt((m) => ({ ...m, [consModalDbId]: merged }));
      setLines(merged.length ? merged : [{ item_code: "", qty_used: 1 }]);
      setConsNotice("Consumables saved.");
      if (consNoticeTimer.current) window.clearTimeout(consNoticeTimer.current);
      consNoticeTimer.current = window.setTimeout(() => setConsNotice(null), 2500);
    } catch (e: any) {
      setConsErr(e?.message || "Couldn’t save consumables.");
      throw e;
    } finally {
      setConsSaving(false);
    }
  }

  // ------------------------------
  // Completion flow (workflow-safe)
  // ------------------------------
  async function markDone(dbId: number) {
    const token = getAuthToken();
    if (!token) {
      setErr("Please log in again to continue.");
      return;
    }

    try {
      setCompletingId(dbId);
      setErr(null);

      const res = await fetch(`${API_BASE_URL}/api/doctor/appointments/${dbId}/complete`, {
        method: "PATCH",
        headers: authHeaders(token),
      });

      const body = await safeJson(res);
      if (!res.ok) throw new Error(body.message || "Couldn’t update the appointment.");

      await fetchAppointments();
    } catch (e: any) {
      setErr(e?.message || "Couldn’t update the appointment.");
    } finally {
      setCompletingId(null);
    }
  }

  async function completeWithConsumables(dbId: number) {
    try {
      await onSaveConsumables();
    } catch {
      return;
    }
    await markDone(dbId);
    closeConsumables();
  }

  // ------------------------------
  // UI
  // ------------------------------
  const SectionTabs = (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => setView("UPCOMING")}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
          view === "UPCOMING"
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
            : "bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
        }`}
      >
        Upcoming ({counts.upcoming})
      </button>

      <button
        type="button"
        onClick={() => setView("HISTORY")}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
          view === "HISTORY"
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
            : "bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
        }`}
      >
        <span className="inline-flex items-center gap-1">
          <HistoryIcon size={14} /> History ({counts.history})
        </span>
      </button>

      <button
        type="button"
        onClick={() => setView("ALL")}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
          view === "ALL"
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
            : "bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
        }`}
      >
        All ({counts.all})
      </button>

      <button
        type="button"
        onClick={fetchAppointments}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200"
      >
        <RefreshCwIcon size={14} />
        Refresh
      </button>
    </div>
  );

  return (
    <DoctorLayout>
      <div className="h-screen overflow-y-auto">
        <section className="relative max-w-6xl mx-auto space-y-4 px-3 sm:px-6 py-4 sm:py-6">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute top-24 right-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-slate-200/80 dark:border-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <CalendarDaysIcon size={14} />
                    <span>Doctor schedule</span>
                  </div>

                  <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Appointments</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Upcoming shows <b>future + live + late</b> visits only. Final statuses (Completed / Cancelled / No-show)
                    never appear in Upcoming. “No-show” is never guessed by the UI — only your backend monitor sets it.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-2.5 py-1">
                      <ClockIcon size={12} />
                      Local time
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-2.5 py-1">
                      <CheckCircle2Icon size={12} />
                      {actionableCount} ready to complete
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-2.5 py-1">
                      <PackageIcon size={12} />
                      Consumables saved:{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {Object.keys(savedByAppt).length}
                      </span>
                    </span>

                    {(counts.live > 0 || counts.late > 0 || counts.missedPending > 0) && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-2.5 py-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Now:</span>
                        <span className="font-mono">Live {counts.live}</span>
                        <span className="opacity-40">•</span>
                        <span className="font-mono">Late {counts.late}</span>
                        <span className="opacity-40">•</span>
                        <span className="font-mono">Missed {counts.missedPending}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  {SectionTabs}

                  <div className="relative w-full sm:w-[340px]">
                    <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search patient, reason, room…"
                      className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {err && (
              <div className="px-4 sm:px-5 py-3 text-sm text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/30 border-t border-rose-100 dark:border-rose-900/60">
                {err}
              </div>
            )}

            <div className="px-4 sm:px-5 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-3">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-50">{filtered.length}</span>{" "}
                {view === "UPCOMING" ? "upcoming" : view === "HISTORY" ? "history" : "appointments"}
              </div>
              <div className="hidden sm:block">Auto-updates every 30s</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 shadow-sm overflow-hidden">
            {loading ? (
              <div className="px-4 py-10 text-slate-400 text-sm inline-flex items-center gap-2">
                <Loader2Icon size={16} className="animate-spin" />
                Loading your schedule…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-slate-400 text-sm text-center">
                {view === "UPCOMING" ? "No upcoming appointments." : "No items found."}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100/80 dark:divide-slate-900/80">
                {filtered.map((a: any) => {
                  const when = fmtWhen(a.__dt, a.date, a.time);
                  const label = a.__label as string;
                  const eligibility = doneEligibility(label, a.status, a.dbId, a.__phase);

                  const saved = a.dbId > 0 ? savedByAppt[a.dbId] : undefined;
                  const savedCount = saved?.length || 0;

                  return (
                    <li
                      key={`${a.dbId}-${a.id}-${a.date}-${a.time}`}
                      className="px-4 sm:px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-2 py-0.5 font-mono text-[12px] text-slate-700 dark:text-slate-200">
                              {when}
                            </span>

                            <span
                              className={[
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                                pillClass(label),
                              ].join(" ")}
                            >
                              {label}
                            </span>

                            {savedCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                                <PackageIcon size={12} />
                                {savedCount} consumable{savedCount === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                            {a.patient || "—"}
                          </div>

                          <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{a.reason || "Visit"}</div>

                          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>
                              Room: <span className="font-mono">{a.room || "—"}</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono">{a.id || "—"}</span>
                            {a.dbId > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-mono">DB#{a.dbId}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
                          <button
                            type="button"
                            disabled={!a.dbId || a.dbId <= 0 || a.__isFinal}
                            onClick={() => a.dbId > 0 && openConsumables(a.dbId, "EDIT")}
                            className={[
                              "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border",
                              "border-slate-200/80 dark:border-slate-800/80",
                              "bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200",
                              "hover:bg-slate-50/80 dark:hover:bg-slate-900/60",
                              "disabled:opacity-50 disabled:hover:bg-white/80 disabled:cursor-not-allowed",
                            ].join(" ")}
                            title="Record consumables used for this appointment"
                          >
                            <PackageIcon size={14} />
                            Consumables
                          </button>

                          <button
                            type="button"
                            disabled={!eligibility.can || completingId === a.dbId}
                            onClick={() => {
                              if (!eligibility.can) return;
                              openConsumables(a.dbId, "COMPLETE");
                            }}
                            title={
                              completingId === a.dbId
                                ? "Saving…"
                                : eligibility.can
                                ? "Complete appointment (records consumables + triggers inventory consumption)"
                                : eligibility.why
                            }
                            className={[
                              "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border",
                              "border-slate-200/80 dark:border-slate-800/80",
                              "bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200",
                              "hover:bg-slate-50/80 dark:hover:bg-slate-900/60",
                              "disabled:opacity-50 disabled:hover:bg-white/80 disabled:cursor-not-allowed",
                            ].join(" ")}
                          >
                            <CheckCircle2Icon size={14} />
                            {completingId === a.dbId ? "Saving…" : "Complete"}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="h-6" />
        </section>
      </div>

      {/* Consumables Modal */}
      {consModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeConsumables} />

          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
            <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-900">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <PackageIcon size={14} />
                  Consumables used
                </div>
                <h2 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {consModalMode === "COMPLETE" ? "Complete appointment" : "Update consumables"}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Record what was used in the visit. When you complete, Inventory Agent will consume stock based on these
                  lines.
                </p>
              </div>

              <button
                onClick={closeConsumables}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                aria-label="Close"
                disabled={consSaving}
              >
                <XIcon size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {consNotice && (
                <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 rounded-xl px-3 py-2">
                  {consNotice}
                </div>
              )}

              {consErr && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 rounded-xl px-3 py-2">
                  {consErr}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {catalogLoading
                    ? "Loading inventory catalog…"
                    : catalog.length
                    ? `Catalog loaded (${catalog.length})`
                    : "Catalog not available. Manual item codes still work."}
                </div>
                <button
                  type="button"
                  onClick={tryLoadCatalog}
                  disabled={catalogLoading}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-60"
                >
                  <RefreshCwIcon size={14} className={catalogLoading ? "animate-spin" : ""} />
                  Reload catalog
                </button>
              </div>

              {consLoading ? (
                <div className="py-8 text-center text-sm text-slate-400 inline-flex items-center justify-center gap-2">
                  <Loader2Icon size={16} className="animate-spin" />
                  Loading…
                </div>
              ) : (
                <div className="space-y-2">
                  {lines.map((ln, idx) => {
                    const code = cleanCode(ln.item_code);
                    const hit = code ? catalog.find((c) => cleanCode(c.item_code) === code) : undefined;

                    return (
                      <div
                        key={`${idx}-${code || "row"}`}
                        className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/70 px-3 py-2"
                      >
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-12 sm:col-span-7">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              Item code
                            </label>

                            <input
                              list={catalog.length ? "invCodes" : undefined}
                              value={ln.item_code}
                              onChange={(e) =>
                                updateLine(idx, { item_code: e.target.value.toUpperCase(), name: undefined })
                              }
                              placeholder="GAUZE-001"
                              className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                            />

                            {hit?.name && (
                              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                {hit.name}
                                {typeof hit.stock === "number" && <span className="ml-2 font-mono">• stock {hit.stock}</span>}
                                {hit.expiry_date && (
                                  <span className="ml-2 font-mono">• exp {String(hit.expiry_date).slice(0, 10)}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="col-span-6 sm:col-span-3">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Qty used</label>
                            <input
                              type="number"
                              min={1}
                              value={ln.qty_used}
                              onChange={(e) => updateLine(idx, { qty_used: cleanQty(e.target.value) })}
                              className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                            />
                          </div>

                          <div className="col-span-6 sm:col-span-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                              title="Remove"
                            >
                              <Trash2Icon size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {catalog.length > 0 && (
                    <datalist id="invCodes">
                      {catalog.slice(0, 2000).map((c) => (
                        <option key={c.item_code} value={c.item_code}>
                          {c.name}
                        </option>
                      ))}
                    </datalist>
                  )}

                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={addLine}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                    >
                      <PlusIcon size={14} />
                      Add item
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await onSaveConsumables();
                          } catch {}
                        }}
                        disabled={consSaving || !consModalDbId}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-60"
                      >
                        {consSaving && <Loader2Icon size={14} className="animate-spin" />}
                        Save
                      </button>

                      {consModalMode === "COMPLETE" && (
                        <button
                          type="button"
                          onClick={() => consModalDbId && completeWithConsumables(consModalDbId)}
                          disabled={consSaving || !consModalDbId}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 px-3 py-2 text-xs font-semibold disabled:opacity-60"
                        >
                          {consSaving && <Loader2Icon size={14} className="animate-spin" />}
                          Complete appointment
                        </button>
                      )}
                    </div>
                  </div>

                  {consModalMode === "COMPLETE" && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tip: If nothing was used, leave it empty and still complete. Inventory Agent consumes only what exists
                      in <span className="font-mono">visit_consumables</span>.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
};
