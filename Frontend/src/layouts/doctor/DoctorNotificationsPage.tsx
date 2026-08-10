import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  CheckIcon,
  Loader2Icon,
  RefreshCwIcon,
  CalendarClockIcon,
  ClipboardListIcon,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

type Notif = {
  id: number;
  channel?: string | null;
  type?: string | null;
  title?: string | null;
  message: string;
  status: string;
  created_at?: string | null;
  scheduled_at?: string | null;
};

type Tab = "UNREAD" | "ALL";
type Filter = "ALL" | "APPOINTMENTS" | "CASES";

const norm = (v: any) => String(v ?? "").trim().toUpperCase();

function isUnread(n: Notif) {
  return norm(n.status) !== "READ";
}

function isInventoryNotif(n: Notif) {
  const t = norm(n.type);
  const title = norm(n.title);
  const msg = norm(n.message);
  return t.startsWith("INVENTORY_") || title.includes("INVENTORY") || msg.includes("INVENTORY");
}

function extractCaseDbId(n: Notif): number | null {
  const hay = `${n.type ?? ""} ${n.title ?? ""} ${n.message ?? ""}`;
  const m = hay.match(/\bcase\s*#?\s*(\d+)\b/i);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function matchesFilter(n: Notif, filter: Filter) {
  const t = norm(n.type);
  const title = norm(n.title);
  const msg = norm(n.message);

  const hay = `${t} ${title} ${msg}`;

  if (filter === "ALL") return true;
  if (filter === "APPOINTMENTS") {
    return hay.includes("APPOINTMENT") || hay.includes("SCHEDULE") || hay.includes("NO-SHOW") || hay.includes("DELAY");
  }
  if (filter === "CASES") {
    return hay.includes("CASE") || hay.includes("TREATMENT") || hay.includes("SUMMARY");
  }
  return true;
}

export const DoctorNotificationsPage: React.FC = () => {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const [tab, setTab] = useState<Tab>("UNREAD");
  const [filter, setFilter] = useState<Filter>("ALL");

  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`${API_BASE}/api/notifications?includeRead=1`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Status ${res.status}`);
      const list = Array.isArray(data.items) ? data.items : [];
      setItems(list.filter((n: Notif) => !isInventoryNotif(n)));
    } catch (e: any) {
      setErr(e?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: number) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n)));
    await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: "POST",
      headers: authHeaders(),
    }).catch(() => {});
  }

  async function readAll() {
    setItems((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: "POST",
      headers: authHeaders(),
    }).catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const base = tab === "ALL" ? items : items.filter(isUnread);
    return base.filter((n) => matchesFilter(n, filter));
  }, [items, tab, filter]);

  const counts = useMemo(() => {
    const unread = items.filter(isUnread).length;
    const appt = items.filter((n) => matchesFilter(n, "APPOINTMENTS")).length;
    const cases = items.filter((n) => matchesFilter(n, "CASES")).length;
    return { unread, appt, cases, total: items.length };
  }, [items]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <BellIcon size={14} />
            <span>Doctor notifications</span>
          </div>
          <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
            Updates & alerts
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Appointment alerts (delay/no-show) and case updates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setTab("UNREAD")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              tab === "UNREAD"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
                : "bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
            }`}
          >
            Unread ({counts.unread})
          </button>
          <button
            onClick={() => setTab("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              tab === "ALL"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
                : "bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
            }`}
          >
            All ({counts.total})
          </button>

          <button
            onClick={load}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200"
          >
            <RefreshCwIcon size={14} />
            Refresh
          </button>

          <button
            onClick={readAll}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          >
            <CheckIcon size={14} />
            Read all
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl font-semibold border ${
            filter === "ALL"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
              : "bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("APPOINTMENTS")}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold border ${
            filter === "APPOINTMENTS"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
              : "bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
          }`}
        >
          <CalendarClockIcon size={14} /> Appointments ({counts.appt})
        </button>
        <button
          onClick={() => setFilter("CASES")}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold border ${
            filter === "CASES"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
              : "bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
          }`}
        >
          <ClipboardListIcon size={14} /> Cases ({counts.cases})
        </button>
      </div>

      {err && (
        <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 dark:bg-rose-950/40 dark:border-rose-900/60">
          {err}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-4 py-6 text-slate-400 text-sm flex items-center gap-2">
            <Loader2Icon className="animate-spin" size={16} /> Loading...
          </div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-10 text-slate-400 text-sm text-center">
            No notifications for this view.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100/80 dark:divide-slate-900/80">
            {visible.map((n) => {
              const caseDbId = extractCaseDbId(n);
              return (
                <li
                  key={n.id}
                  className="px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-900/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                        {n.title || n.type || "Notification"}
                      </div>
                      <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {n.message}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400">
                        {n.created_at || ""}
                        {n.scheduled_at && (
                          <>
                            <span className="mx-2">•</span>
                            Scheduled: <span className="font-mono">{n.scheduled_at}</span>
                          </>
                        )}
                        <span className="mx-2">•</span>
                        <span className="font-mono">{String(n.status).toUpperCase()}</span>
                      </div>
                      {caseDbId && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => nav(`/doctor/cases/${caseDbId}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200"
                          >
                            View case
                          </button>
                        </div>
                      )}
                    </div>

                    {String(n.status).toUpperCase() !== "READ" && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};
