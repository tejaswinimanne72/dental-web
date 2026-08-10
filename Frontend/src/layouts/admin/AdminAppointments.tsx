// src/layouts/admin/AdminAppointments.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  FilterIcon,
  SearchIcon,
  ClockIcon,
  UserIcon,
  XIcon,
  Loader2Icon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const ADMIN_API = `${API_BASE}/api/admin`;

function getAuthHeaders() {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    "";
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function safeText(s: any) {
  return String(s ?? "").trim();
}

function localYYYYMMDD(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toHM(timeLike: any) {
  if (!timeLike) return "";
  const s = String(timeLike).trim();
  const m = s.match(/^(\d{2}):(\d{2})/);
  if (m) return `${m[1]}:${m[2]}`;
  return s.slice(0, 5);
}

function normalizeApptTime(timeLike: any) {
  const s = String(timeLike || "").trim();
  if (!s) return "";
  if (/[AaPp][Mm]/.test(s)) return s;
  return toHM(s);
}

function formatTimeAMPM(hhmm: string) {
  const raw = String(hhmm || "").trim();
  if (!raw) return "—";

  // If backend already sends AM/PM, normalize and return as-is.
  const ampmMatch = raw.match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])/);
  if (ampmMatch) {
    let hh = Number(ampmMatch[1]);
    const mm = ampmMatch[2];
    const ampm = ampmMatch[3].toUpperCase();
    if (!Number.isFinite(hh) || hh <= 0) hh = 12;
    if (hh > 12) hh = hh % 12 || 12;
    return `${hh}:${mm} ${ampm}`;
  }

  const t = toHM(raw);
  const m = t.match(/^(\d{2}):(\d{2})$/);
  if (!m) return t || "—";
  let hh = Number(m[1]);
  const mm = m[2];
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${mm} ${ampm}`;
}

function isPastLocal(dateStr: string, timeStr: string) {
  if (!dateStr || !timeStr) return false;
  const hhmm = String(timeStr).slice(0, 5);
  const dt = new Date(`${dateStr}T${hhmm}:00`);
  if (Number.isNaN(dt.getTime())) return false;
  return dt.getTime() < Date.now();
}

function roundTimeToStep(d: Date, stepMinutes: number) {
  const ms = stepMinutes * 60_000;
  return new Date(Math.ceil(d.getTime() / ms) * ms);
}

function defaultTimeNow(stepMinutes = 5) {
  const now = roundTimeToStep(new Date(), stepMinutes);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function toLocalIso(date: string, time: string) {
  const d = safeText(date).slice(0, 10);
  const t = toHM(time);
  if (!d || !t) return "";
  // local time ISO-like, backend can parse as string
  return `${d}T${t}:00`;
}

async function safeReadBody(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json().catch(() => ({}));
  }
  const text = await res.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || `HTTP ${res.status}` };
  }
}

export type SuggestedSlot = {
  date: string;
  startTime: string;
  endTime?: string;
  predictedDurationMin?: number;
};

type ProcedureCatalogItem = {
  key: string;
  code?: string;
  name?: string;
  defaultPrice?: number;
};

type VisitProcedureItem = {
  key: string;
  procedureCode: string;
  name?: string;
  qty: number;
  unitPrice: number;
  itemType: 'PROCEDURE' | 'MATERIAL' | 'APPARATUS';
  notes?: string;
};

const VISIT_TYPE_OPTIONS = [
  "New patient consultation",
  "Follow-up visit",
  "Routine checkup",
  "Cleaning (Scaling)",
  "Emergency visit",
  "Procedure visit",
  "Post-op review",
  "Other",
];

function normalizeSuggestedSlots(raw: any): SuggestedSlot[] {
  const pick =
    raw?.suggestedSlots ??
    raw?.suggested_slots ??
    raw?.slots ??
    raw?.suggestions ??
    raw?.availableSlots ??
    raw?.available_slots ??
    raw?.alternatives ??
    raw?.alternativeSlots ??
    raw?.availability ??
    raw?.data?.suggestedSlots ??
    raw?.data?.suggested_slots ??
    raw?.data?.slots ??
    raw?.conflict?.suggestedSlots ??
    raw?.conflict?.suggested_slots ??
    raw?.details?.suggestedSlots ??
    raw?.details?.suggested_slots ??
    raw?.details?.slots ??
    raw?.result?.slots ??
    [];

  // Support formats like:
  // { slotsByDate: { "2026-01-03": [{start:"10:00"}] } }
  // or { availability: { "2026-01-03": [...] } }
  const toArray = (x: any): any[] => {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (typeof x === "object") {
      // Flatten object-of-arrays
      const out: any[] = [];
      for (const v of Object.values(x)) {
        if (Array.isArray(v)) out.push(...v);
      }
      return out;
    }
    return [];
  };

  const arr: any[] = toArray(pick);
  const out: SuggestedSlot[] = [];

  for (const it of arr) {
    if (!it) continue;

    const date = safeText(
      it.date ??
      it.scheduled_date ??
      it.day ??
      it.scheduledDate ??
      it.on ??
      it.slot_date ??
      ""
    ).slice(0, 10);

    const start = safeText(
      it.startTime ??
      it.start_time ??
      it.start ??
      it.time ??
      it.scheduled_time ??
      it.scheduledTime ??
      it.from ??
      ""
    );

    const end = safeText(
      it.endTime ??
      it.end_time ??
      it.end ??
      it.scheduled_end_time ??
      it.scheduledEndTime ??
      it.to ??
      ""
    );

    const dur =
      Number(
        it.predictedDurationMin ??
        it.predicted_duration_min ??
        it.durationMin ??
        it.duration_min ??
        it.duration ??
        it.minutes ??
        0
      ) || undefined;

    if (!date || !start) continue;

    out.push({
      date,
      startTime: start,
      endTime: end || undefined,
      predictedDurationMin: dur,
    });
  }

  out.sort((a, b) =>
    `${a.date} ${toHM(a.startTime)}`.localeCompare(`${b.date} ${toHM(b.startTime)}`)
  );
  return out;
}

function normalizeProcedureCatalog(raw: any): ProcedureCatalogItem[] {
  const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
  return items
    .map((r: any) => ({
      key: safeText(r.procedure_key ?? r.id ?? r.code ?? r.procedure_code ?? r.name ?? ""),
      code: safeText(r.code ?? r.procedure_code ?? r.procedureCode ?? ""),
      name: safeText(r.name ?? r.procedure_name ?? r.title ?? ""),
      defaultPrice:
        Number(
          r.default_price ?? r.defaultPrice ?? r.price ?? r.unit_price ?? r.unitPrice ?? 0
        ) || 0,
    }))
    .filter((x) => x.key || x.code || x.name);
}

function normalizeVisitProcedures(raw: any): VisitProcedureItem[] {
  const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
  return items.map((r: any, idx: number) => {
    const code = safeText(r.procedure_code ?? r.procedureCode ?? r.code ?? r.name ?? "");
    const qty = Number(r.qty ?? r.quantity ?? 1) || 1;
    const unitPrice = Number(r.unit_price ?? r.unitPrice ?? r.price ?? 0) || 0;
    const notes = safeText(r.notes ?? r.note ?? "");
    let itype = safeText(r.item_type ?? r.itemType ?? 'PROCEDURE').toUpperCase();
    if (!['PROCEDURE', 'MATERIAL', 'APPARATUS'].includes(itype)) itype = 'PROCEDURE';

    return {
      key: `${code || "proc"}-${idx}-${Date.now()}`,
      procedureCode: code,
      qty,
      unitPrice,
      itemType: itype as any,
      notes: notes || undefined,
    };
  });
}

type AppointmentRow = {
  dbId?: number;
  id: string;
  date: string;
  time: string;
  patient: string;
  doctor: string;
  type: string;
  status: string;
};

type UserOption = {
  id: string;
  name: string;
  phone?: string | null;
};

type CreateAppointmentForm = {
  patientUid: string;
  doctorUid: string;
  date: string;
  time: string;
  type: string;
};

function statusPill(status: string) {
  const s = safeText(status).toUpperCase();

  // Higher contrast pills (light + dark)
  if (s === "CONFIRMED") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30";
  }
  if (s === "IN PROGRESS" || s === "CHECKED IN" || s === "IN_PROGRESS") {
    return "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30";
  }
  if (s === "COMPLETED") {
    return "bg-slate-100 text-slate-900 border border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800";
  }
  if (s === "CANCELLED") {
    return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30";
  }
  if (s === "NO-SHOW" || s === "NO SHOW" || s === "NOSHOW" || s === "NO_SHOW") {
    return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30";
  }
  if (s === "REQUESTED") {
    return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
  }
  return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
}

export const AdminAppointments: React.FC = () => {
  const [dateStr, setDateStr] = useState(() => localYYYYMMDD(new Date()));
  const [refreshKey, setRefreshKey] = useState(0);

  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "REQUESTED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  >("ALL");
  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [suggestedSlots, setSuggestedSlots] = useState<SuggestedSlot[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestAttempted, setSuggestAttempted] = useState(false);
  const [allowBackdated, setAllowBackdated] = useState(false);

  // Procedures modal (billing inputs for revenue agent)
  const [procedureModalOpen, setProcedureModalOpen] = useState(false);
  const [procedureAppt, setProcedureAppt] = useState<AppointmentRow | null>(null);
  const [procedureCatalog, setProcedureCatalog] = useState<ProcedureCatalogItem[]>([]);
  const [procedureItems, setProcedureItems] = useState<VisitProcedureItem[]>([]);
  const [procedureLoading, setProcedureLoading] = useState(false);
  const [procedureSaving, setProcedureSaving] = useState(false);
  const [procedureError, setProcedureError] = useState<string | null>(null);

  // People
  const [patients, setPatients] = useState<UserOption[]>([]);
  const [doctors, setDoctors] = useState<UserOption[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  const [createForm, setCreateForm] = useState<CreateAppointmentForm>(() => ({
    patientUid: "",
    doctorUid: "",
    date: localYYYYMMDD(new Date()),
    time: defaultTimeNow(5),
    type: "New patient consultation",
  }));
  const [customVisitType, setCustomVisitType] = useState("");

  async function fetchAppointments() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${ADMIN_API}/appointments?date=${encodeURIComponent(dateStr)}`,
        { headers: getAuthHeaders() }
      );
      const body = await safeReadBody(res);
      if (!res.ok) throw new Error(body?.message || `Could not load (HTTP ${res.status})`);

      const items = Array.isArray(body?.items) ? body.items : [];
      const mapped: AppointmentRow[] = items.map((x: any) => ({
        dbId: Number(x.dbId ?? x.db_id ?? x.id) || undefined,
        id: safeText(x.id ?? x.appointment_uid ?? x.uid ?? x.appointmentId ?? ""),
        date: safeText(x.date ?? x.scheduled_date ?? x.scheduledDate ?? "").slice(0, 10),
        time: normalizeApptTime(x.time ?? x.scheduled_time ?? x.scheduledTime ?? x.start_time ?? ""),
        patient: safeText(x.patient ?? x.patient_name ?? x.patientName ?? "—"),
        doctor: safeText(x.doctor ?? x.doctor_name ?? x.doctorName ?? "—"),
        type: safeText(x.type ?? x.reason ?? x.visit_type ?? "Visit"),
        status: safeText(x.status ?? "Requested"),
      }));

      setAppointments(mapped);
    } catch (e: any) {
      setError(e?.message || "Could not load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr, refreshKey]);

  const doctorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of appointments) if (a.doctor) set.add(a.doctor);
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      if (doctorFilter !== "ALL" && a.doctor !== doctorFilter) return false;

      const s = safeText(a.status).toUpperCase();
      if (statusFilter !== "ALL") {
        if (statusFilter === "IN_PROGRESS") {
          if (!(s === "IN PROGRESS" || s === "CHECKED IN" || s === "IN_PROGRESS")) return false;
        } else if (statusFilter === "NO_SHOW") {
          if (!(s === "NO-SHOW" || s === "NO SHOW" || s === "NOSHOW" || s === "NO_SHOW")) return false;
        } else {
          if (s !== statusFilter.replace("_", " ")) return false;
        }
      }

      if (!q) return true;
      const hay = `${a.id} ${a.patient} ${a.doctor} ${a.type} ${a.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [appointments, search, statusFilter, doctorFilter]);

  async function loadPeople() {
    try {
      setPeopleLoading(true);
      setPeopleError(null);

      const [rp, rd] = await Promise.all([
        fetch(`${ADMIN_API}/patients`, { headers: getAuthHeaders() }),
        fetch(`${ADMIN_API}/doctors`, { headers: getAuthHeaders() }),
      ]);

      const bp = await safeReadBody(rp);
      if (!rp.ok) throw new Error(bp?.message || `Patients: HTTP ${rp.status}`);

      const bd = await safeReadBody(rd);
      if (!rd.ok) throw new Error(bd?.message || `Doctors: HTTP ${rd.status}`);

      const patientItems: UserOption[] = (bp.items || bp.patients || []).map((p: any) => ({
        id: safeText(p.id),
        name: safeText(p.name || p.full_name || "Patient"),
        phone: p.phone ?? null,
      }));

      const doctorItems: UserOption[] = (bd.items || []).map((d: any) => ({
        id: safeText(d.id),
        name: safeText(d.name || d.full_name || "Doctor"),
        phone: d.phone ?? null,
      }));

      setPatients(patientItems);
      setDoctors(doctorItems);

      setCreateForm((prev) => ({
        ...prev,
        patientUid: prev.patientUid || patientItems[0]?.id || "",
        doctorUid: prev.doctorUid || doctorItems[0]?.id || "",
      }));
    } catch (e: any) {
      setPeopleError(e?.message || "Could not load patient/doctor lists.");
    } finally {
      setPeopleLoading(false);
    }
  }

  async function ensureProcedureCatalog() {
    if (procedureCatalog.length > 0) return procedureCatalog;
    try {
      const res = await fetch(`${ADMIN_API}/consumables/procedures`, {
        headers: getAuthHeaders(),
      });
      const body = await safeReadBody(res);
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
      const list = normalizeProcedureCatalog(body);
      setProcedureCatalog(list);
      return list;
    } catch (e: any) {
      setProcedureCatalog([]);
      setProcedureError(e?.message || "Failed to load procedures catalog.");
      return [];
    }
  }

  function buildProcedureRowFromCatalog(item?: ProcedureCatalogItem, forceType?: VisitProcedureItem['itemType']): VisitProcedureItem {
    const code = safeText(item?.code || item?.name || "");
    const name = safeText(item?.name || "");
    const unitPrice = Number(item?.defaultPrice || 0) || 0;
    return {
      key: `proc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      procedureCode: code,
      name: name || undefined,
      qty: 1,
      unitPrice,
      itemType: forceType || 'PROCEDURE',
      notes: undefined,
    };
  }

  async function openProceduresModal(appt: AppointmentRow) {
    setProcedureError(null);
    setProcedureAppt(appt);
    setProcedureModalOpen(true);
    setProcedureLoading(true);
    setProcedureItems([]);

    try {
      const dbId = Number(appt.dbId);
      if (!Number.isFinite(dbId) || dbId <= 0) {
        throw new Error("Missing appointment DB id.");
      }

      const catalog = await ensureProcedureCatalog();

      const res = await fetch(`${ADMIN_API}/appointments/${dbId}/procedures`, {
        headers: getAuthHeaders(),
      });
      const body = await safeReadBody(res);
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);

      const items = normalizeVisitProcedures(body);
      if (items.length === 0) {
        setProcedureItems([buildProcedureRowFromCatalog(catalog[0])]);
      } else {
        setProcedureItems(items);
      }
    } catch (e: any) {
      setProcedureError(e?.message || "Failed to load visit procedures.");
      if (procedureItems.length === 0) {
        setProcedureItems([buildProcedureRowFromCatalog(procedureCatalog[0])]);
      }
    } finally {
      setProcedureLoading(false);
    }
  }

  function closeProceduresModal() {
    if (procedureSaving) return;
    setProcedureModalOpen(false);
    setProcedureAppt(null);
    setProcedureError(null);
  }

  function updateProcedureRow(key: string, patch: Partial<VisitProcedureItem>) {
    setProcedureItems((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function addProcedureRow(forcedType: VisitProcedureItem['itemType'] = 'PROCEDURE') {
    setProcedureItems((prev) => [...prev, buildProcedureRowFromCatalog(procedureCatalog[0], forcedType)]);
  }

  function removeProcedureRow(key: string) {
    setProcedureItems((prev) => prev.filter((row) => row.key !== key));
  }

  async function saveProcedures() {
    try {
      setProcedureSaving(true);
      setProcedureError(null);
      const dbId = Number(procedureAppt?.dbId);
      if (!Number.isFinite(dbId) || dbId <= 0) {
        throw new Error("Missing appointment DB id.");
      }

      const payloadItems = procedureItems
        .map((row) => ({
          code: safeText(row.procedureCode),
          qty: Number(row.qty) || 1,
          unitPrice: Number(row.unitPrice) || 0,
          notes: row.notes || "",
          itemType: row.itemType,
        }))
        .filter((row) => row.code);

      const res = await fetch(`${ADMIN_API}/appointments/${dbId}/procedures`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ items: payloadItems }),
      });
      const body = await safeReadBody(res);
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);

      setProcedureModalOpen(false);
      setProcedureAppt(null);
    } catch (e: any) {
      setProcedureError(e?.message || "Failed to save procedures.");
    } finally {
      setProcedureSaving(false);
    }
  }

  function openCreate() {
    setShowCreate(true);
    setCreateError(null);
    setSuggestedSlots([]);
    setSuggestLoading(false);
    setSuggestAttempted(false);
    setAllowBackdated(false);
    setPatientSearch("");
    setDoctorSearch("");
    setCustomVisitType("");

    setCreateForm((f) => ({
      ...f,
      date: dateStr || localYYYYMMDD(new Date()),
      time: defaultTimeNow(5), // auto "now"
      type: f.type || "New patient consultation",
    }));

    if (patients.length === 0 || doctors.length === 0) loadPeople();
  }

  function closeCreate() {
    if (creating) return;
    setShowCreate(false);
  }

  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      `${p.name} ${p.id} ${p.phone || ""}`.toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  const filteredDoctors = useMemo(() => {
    const q = doctorSearch.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) =>
      `${d.name} ${d.id} ${d.phone || ""}`.toLowerCase().includes(q)
    );
  }, [doctors, doctorSearch]);

  const procedureOptions = useMemo(() => {
    return procedureCatalog
      .map((p) => ({
        value: safeText(p.code || p.name || p.key),
        label: safeText(p.name || p.code || p.key),
        defaultPrice: Number(p.defaultPrice || 0) || 0,
      }))
      .filter((p) => p.value);
  }, [procedureCatalog]);

  const totalsBreakdown = useMemo(() => {
    const b = { PROCEDURE: 0, MATERIAL: 0, APPARATUS: 0, TOTAL: 0 };
    procedureItems.forEach(row => {
      const amt = (Number(row.qty) || 0) * (Number(row.unitPrice) || 0);
      if (row.itemType in b) b[row.itemType as keyof typeof b] += amt;
      b.TOTAL += amt;
    });
    return b;
  }, [procedureItems]);


  function pickSlot(s: SuggestedSlot) {
    setCreateForm((f) => ({
      ...f,
      date: s.date,
      time: toHM(s.startTime),
    }));
    setCreateError(null);
  }

  function buildSuggestPayload(form: CreateAppointmentForm) {
    const scheduled_at = toLocalIso(form.date, form.time);
    // Send aliases so backend variation won’t break suggestions
    return {
      patientUid: form.patientUid,
      patientId: form.patientUid,
      patient_id: form.patientUid,

      doctorUid: form.doctorUid,
      doctorId: form.doctorUid,
      doctor_id: form.doctorUid,

      date: form.date,
      time: form.time,
      type: form.type,
      reason: form.type,

      scheduled_at,
      appointment_datetime: scheduled_at, // harmless alias if ignored
    };
  }

  async function fetchSuggestedSlotsFromServer(form: CreateAppointmentForm) {
    setSuggestLoading(true);
    setSuggestAttempted(true);
    try {
      const res = await fetch(`${ADMIN_API}/appointments/suggest-slots`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(buildSuggestPayload(form)),
      });

      const body = await safeReadBody(res);
      if (!res.ok) return [];
      return normalizeSuggestedSlots(body);
    } catch {
      return [];
    } finally {
      setSuggestLoading(false);
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setSuggestedSlots([]);
    setSuggestAttempted(false);

    const { patientUid, doctorUid, date, time, type } = createForm;

    if (!patientUid || !doctorUid) {
      setCreateError("Please select both patient and doctor.");
      return;
    }
    if (!date || !time) {
      setCreateError("Please choose a date and time.");
      return;
    }

    if (!allowBackdated && isPastLocal(date, time)) {
      setCreateError("That time is in the past. Please pick a future time.");
      return;
    }

    try {
      setCreating(true);

      const scheduled_at = toLocalIso(date, time);

      const res = await fetch(`${ADMIN_API}/appointments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          // original fields
          patientUid,
          doctorUid,
          date,
          time,
          type: type.trim() || "New patient consultation",
          status: "Requested",

          // alias fields for backend variations
          patientId: patientUid,
          patient_id: patientUid,
          doctorId: doctorUid,
          doctor_id: doctorUid,
          reason: type.trim() || "New patient consultation",
          scheduled_at,
        }),
      });

      const body = await safeReadBody(res);

      if (!res.ok) {
        if (res.status === 409) {
          const slotsFrom409 = normalizeSuggestedSlots(body);
          setCreateError(body?.message || "That time is already booked.");

          if (slotsFrom409.length > 0) {
            setSuggestedSlots(slotsFrom409);
            setCreating(false);
            return;
          }

          const slots = await fetchSuggestedSlotsFromServer(createForm);
          setSuggestedSlots(slots);
          setCreating(false);
          return;
        }

        throw new Error(body?.message || `Could not create (HTTP ${res.status})`);
      }

      setShowCreate(false);
      setCreating(false);

      setRefreshKey((k) => k + 1);
      const start = Date.now();
      const poll = window.setInterval(() => {
        setRefreshKey((k) => k + 1);
        if (Date.now() - start > 10_000) window.clearInterval(poll);
      }, 2000);
    } catch (e: any) {
      setCreating(false);
      setCreateError(e?.message || "Could not create appointment.");
    }
  }

  return (
    <>
      <section className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <CalendarDaysIcon size={14} />
              <span>Appointments</span>
            </div>

            <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
              Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              New appointments are created as{" "}
              <span className="font-semibold">Requested</span>. The system will
              confirm and notify the doctor and patient.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1.5 text-slate-700 dark:text-slate-200"
              title="Refresh"
            >
              <RefreshCwIcon size={14} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 px-3 py-1.5 font-semibold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition"
            >
              + New appointment
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-[280px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <SearchIcon size={14} />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, doctor, ID…"
                className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                <ClockIcon size={14} />
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="bg-transparent focus:outline-none"
                />
              </span>

              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                <FilterIcon size={14} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent focus:outline-none"
                >
                  <option value="ALL">All status</option>
                  <option value="REQUESTED">Requested</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No-show</option>
                </select>
              </span>

              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                <UserIcon size={14} />
                <select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="bg-transparent focus:outline-none"
                >
                  {doctorOptions.map((d) => (
                    <option key={d} value={d}>
                      {d === "ALL" ? "All doctors" : d}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-900/60">
            {error}
          </p>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 shadow-sm">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-2 font-semibold">ID</th>
                <th className="px-4 py-2 font-semibold">Date</th>
                <th className="px-4 py-2 font-semibold">Time</th>
                <th className="px-4 py-2 font-semibold">Patient</th>
                <th className="px-4 py-2 font-semibold">Doctor</th>
                <th className="px-4 py-2 font-semibold">Visit type</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Procedures</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-4 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={`${a.id}-${a.date}-${a.time}`}
                    className="border-b border-slate-100/80 dark:border-slate-900/80 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                  >
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                      {a.id || "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                      {a.date || "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                      {a.time ? formatTimeAMPM(a.time) : "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                      {a.patient}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                      {a.doctor}
                    </td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                      {a.type}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusPill(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => openProceduresModal(a)}
                        className="inline-flex items-center rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-60"
                        disabled={!a.dbId}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Procedures modal */}
      {procedureModalOpen && procedureAppt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl flex flex-col text-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">Visit procedures</h2>
                <p className="text-[11px] text-slate-400">
                  {procedureAppt.patient} - {procedureAppt.date} {procedureAppt.time}
                </p>
              </div>
              <button
                type="button"
                onClick={closeProceduresModal}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100"
              >
                <XIcon size={16} />
              </button>
            </div>

            {procedureError && (
              <div className="mb-3 text-[11px] text-amber-200 bg-amber-950/40 border border-amber-900/60 rounded-lg px-3 py-2">
                {procedureError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {procedureLoading ? (
                <div className="text-slate-300 text-xs">Loading procedures…</div>
              ) : procedureItems.length === 0 ? (
                <div className="text-slate-300 text-xs">No procedures yet.</div>
              ) : (
                procedureItems.map((row, idx) => {
                  const isCustom =
                    !procedureOptions.some((opt) => opt.value === row.procedureCode) ||
                    !row.procedureCode;
                  const selected = procedureOptions.find((opt) => opt.value === row.procedureCode);
                  const amount = (Number(row.qty) || 0) * (Number(row.unitPrice) || 0);

                  return (
                    <div
                      key={row.key}
                      className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 space-y-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-1">
                          <label className="block text-[11px] text-slate-200">Type</label>
                          <select
                            value={row.itemType}
                            onChange={(e) => updateProcedureRow(row.key, { itemType: e.target.value as any })}
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                          >
                            <option value="PROCEDURE">Procedure</option>
                            <option value="APPARATUS">Apparatus</option>
                            <option value="MATERIAL">Material</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] text-slate-200">Description</label>
                          <select
                            value={isCustom ? "__CUSTOM__" : row.procedureCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "__CUSTOM__") {
                                updateProcedureRow(row.key, { procedureCode: "" });
                                return;
                              }
                              const opt = procedureOptions.find((o) => o.value === val);
                              updateProcedureRow(row.key, {
                                procedureCode: val,
                                name: opt?.label || undefined,
                                unitPrice:
                                  Number(row.unitPrice) > 0
                                    ? row.unitPrice
                                    : Number(opt?.defaultPrice || 0),
                              });
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                          >
                            {procedureOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                            <option value="__CUSTOM__">Custom…</option>
                          </select>

                          {isCustom && (
                            <input
                              type="text"
                              value={row.procedureCode}
                              onChange={(e) =>
                                updateProcedureRow(row.key, { procedureCode: e.target.value })
                              }
                              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                              placeholder="Procedure code or name"
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-200">Qty</label>
                            <input
                              type="number"
                              min={1}
                              value={row.qty}
                              onChange={(e) =>
                                updateProcedureRow(row.key, { qty: Number(e.target.value) || 1 })
                              }
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-200">Unit price</label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={row.unitPrice}
                              onChange={(e) =>
                                updateProcedureRow(row.key, {
                                  unitPrice: Number(e.target.value) || 0,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-[11px] text-slate-200">Notes</label>
                          <input
                            type="text"
                            value={row.notes || ""}
                            onChange={(e) =>
                              updateProcedureRow(row.key, { notes: e.target.value })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            placeholder="Optional notes"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-300">
                            Amount: {amount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProcedureRow(row.key)}
                            className="text-[11px] text-rose-300 hover:text-rose-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Procedures:</span>
                  <span className="text-slate-200">₹{totalsBreakdown.PROCEDURE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Apparatus:</span>
                  <span className="text-slate-200">₹{totalsBreakdown.APPARATUS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Materials:</span>
                  <span className="text-slate-200">₹{totalsBreakdown.MATERIAL.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-800 pt-1 text-slate-50">
                  <span>Total:</span>
                  <span>₹{totalsBreakdown.TOTAL.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => addProcedureRow('PROCEDURE')}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] text-slate-200 hover:bg-slate-800"
                >
                  + Add procedure
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addProcedureRow('APPARATUS')}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] text-slate-200 hover:bg-slate-800"
                  >
                    + Apparatus
                  </button>
                  <button
                    type="button"
                    onClick={() => addProcedureRow('MATERIAL')}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] text-slate-200 hover:bg-slate-800"
                  >
                    + Material
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeProceduresModal}
                disabled={procedureSaving}
                className="px-3 py-1.5 rounded-lg text-[11px] text-slate-300 hover:bg-slate-800 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProcedures}
                disabled={procedureSaving}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {procedureSaving && <Loader2Icon size={14} className="animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-50">New appointment</h2>
              <button
                type="button"
                onClick={closeCreate}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100"
              >
                <XIcon size={16} />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Create as <span className="text-slate-200 font-semibold">Requested</span>. The
              system confirms and sends notifications.
            </p>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {peopleError && (
                <p className="mb-2 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900/60 rounded-lg px-3 py-2">
                  {peopleError}
                </p>
              )}

              {createError && (
                <div className="mb-2 text-[11px] text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon size={14} className="mt-[1px]" />
                    <div className="flex-1">{createError}</div>
                  </div>
                </div>
              )}

              {/* Suggested slots */}
              {suggestedSlots.length > 0 && (
                <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-200 font-semibold">
                      Suggested times (tap to use)
                    </p>
                    {suggestLoading && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                        <Loader2Icon size={12} className="animate-spin" />
                        Checking…
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestedSlots.slice(0, 12).map((s, idx) => {
                      const label = `${s.date} • ${formatTimeAMPM(s.startTime)}${s.endTime ? ` – ${formatTimeAMPM(s.endTime)}` : ""
                        }`;
                      return (
                        <button
                          key={`${s.date}-${s.startTime}-${idx}`}
                          type="button"
                          onClick={() => pickSlot(s)}
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Only show "no availability" after we actually tried to fetch */}
              {createError && suggestedSlots.length === 0 && suggestAttempted && !suggestLoading && (
                <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/30 p-3">
                  <p className="text-[11px] text-slate-300">
                    No availability was returned. Try another time/date, or fetch slots again.
                  </p>
                </div>
              )}

              {/* Past time warning */}
              {isPastLocal(createForm.date, createForm.time) && (
                <div className="mb-3 rounded-xl border border-amber-900/60 bg-amber-950/30 p-3">
                  <p className="text-[11px] text-amber-200">
                    This time is in the past. Please choose a future time.
                  </p>
                  <label className="mt-2 inline-flex items-center gap-2 text-[11px] text-amber-100">
                    <input
                      type="checkbox"
                      checked={allowBackdated}
                      onChange={(e) => setAllowBackdated(e.target.checked)}
                    />
                    Allow past time (admin override)
                  </label>
                </div>
              )}

              <form className="space-y-3 text-xs text-slate-100" onSubmit={handleCreateSubmit}>
                {/* Patient */}
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-300">Patient</label>
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search patient by name, ID, phone"
                    className="mb-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <select
                    value={createForm.patientUid}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, patientUid: e.target.value }))
                    }
                    disabled={peopleLoading || patients.length === 0}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
                  >
                    <option value="">
                      {peopleLoading
                        ? "Loading patients…"
                        : filteredPatients.length === 0
                          ? "No patients match"
                          : "Select patient"}
                    </option>
                    {filteredPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doctor */}
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-300">Doctor</label>
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctor by name, ID, phone"
                    className="mb-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <select
                    value={createForm.doctorUid}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, doctorUid: e.target.value }))
                    }
                    disabled={peopleLoading || doctors.length === 0}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
                  >
                    <option value="">
                      {peopleLoading
                        ? "Loading doctors…"
                        : filteredDoctors.length === 0
                          ? "No doctors match"
                          : "Select doctor"}
                    </option>
                    {filteredDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300">Date</label>
                    <input
                      type="date"
                      value={createForm.date}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300">Time</label>
                    <input
                      type="time"
                      value={createForm.time}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, time: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-300">Visit type</label>
                  <select
                    value={VISIT_TYPE_OPTIONS.includes(createForm.type) ? createForm.type : "Other"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        setCreateForm((f) => ({ ...f, type: customVisitType || "" }));
                      } else {
                        setCustomVisitType("");
                        setCreateForm((f) => ({ ...f, type: val }));
                      }
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {VISIT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {(!VISIT_TYPE_OPTIONS.includes(createForm.type) || createForm.type === "Other") && (
                    <input
                      type="text"
                      value={customVisitType}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCustomVisitType(v);
                        setCreateForm((f) => ({ ...f, type: v }));
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Custom visit type"
                    />
                  )}
                  <p className="text-[10px] text-slate-400">
                    For auto-deduction, pick a predefined visit type whenever possible.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    disabled={suggestLoading}
                    onClick={async () => {
                      const slots = await fetchSuggestedSlotsFromServer(createForm);
                      setSuggestedSlots(slots);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                  >
                    {suggestLoading ? (
                      <>
                        <Loader2Icon size={12} className="animate-spin" />
                        Checking…
                      </>
                    ) : (
                      "Find available times"
                    )}
                  </button>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeCreate}
                      disabled={creating}
                      className="px-3 py-1.5 rounded-lg text-[11px] text-slate-300 hover:bg-slate-800 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || peopleLoading || patients.length === 0 || doctors.length === 0}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {creating && <Loader2Icon size={14} className="animate-spin" />}
                      <span>Create</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Default export too (prevents AppRouter import mismatch)
export default AdminAppointments;
