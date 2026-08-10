import React, { useEffect, useMemo, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  RefreshCwIcon,
  Loader2Icon,
  CalendarDaysIcon,
  CreditCardIcon,
  FileTextIcon,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function authHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token") || "";
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

type Tab = "unread" | "all";
type Filter = "ALL" | "APPOINTMENTS" | "BILLING" | "TREATMENT";

function isUnread(n: Notif) {
  return String(n.status || "").toUpperCase() !== "READ";
}

function isInventoryNotif(n: Notif) {
  const t = String(n.type || "").toUpperCase();
  const title = String(n.title || "").toUpperCase();
  const msg = String(n.message || "").toUpperCase();
  return t.startsWith("INVENTORY_") || title.includes("INVENTORY") || msg.includes("INVENTORY");
}

function matchesFilter(n: Notif, f: Filter) {
  if (f === "ALL") return true;

  const hay = `${n.type || ""} ${n.title || ""} ${n.message || ""}`.toLowerCase();

  if (f === "APPOINTMENTS") return hay.includes("appointment") || hay.includes("schedule") || hay.includes("visit");
  if (f === "BILLING") return hay.includes("invoice") || hay.includes("billing") || hay.includes("payment") || hay.includes("due");
  if (f === "TREATMENT") return hay.includes("treatment") || hay.includes("summary") || hay.includes("follow-up") || hay.includes("healing");

  return true;
}

export const PatientNotificationsPage: React.FC = () => {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("unread");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base = tab === "all" ? items : items.filter(isUnread);
    return base.filter((n) => matchesFilter(n, filter));
  }, [items, tab, filter]);

  const counts = useMemo(() => {
    const base = tab === "all" ? items : items.filter(isUnread);
    const c = (f: Filter) => base.filter((n) => matchesFilter(n, f)).length;
    return {
      ALL: base.length,
      APPOINTMENTS: c("APPOINTMENTS"),
      BILLING: c("BILLING"),
      TREATMENT: c("TREATMENT"),
    };
  }, [items, tab]);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`${API_BASE}/api/notifications?includeRead=1`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Couldn’t load notifications.");
      const list = Array.isArray(data.items) ? data.items : [];
      setItems(list.filter((n: Notif) => !isInventoryNotif(n)));
    } catch (e: any) {
      setErr("We couldn’t load your updates right now. Please try again.");
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

  const chipBase =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold border transition";

  const chip = (active: boolean) =>
    active
      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent"
      : "bg-white/80 dark:bg-slate-950/70 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/50";

  return (
    <section className="max-w-6xl mx-auto space-y-4">
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-5 py-5 shadow-[0_26px_80px_-55px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <BellIcon size={14} />
              <span>Notifications</span>
            </div>
            <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
              Updates & reminders
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Appointment reminders, treatment updates, billing notes, and inventory-related alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("unread")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${chip(tab === "unread")}`}
            >
              Unread
            </button>
            <button
              onClick={() => setTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${chip(tab === "all")}`}
            >
              All
            </button>

            <button
              onClick={load}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 text-slate-700 dark:text-slate-200"
            >
              <RefreshCwIcon size={14} />
              Refresh
            </button>

            <button
              onClick={readAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            >
              <CheckIcon size={14} />
              Mark all read
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className={`${chipBase} ${chip(filter === "ALL")}`} onClick={() => setFilter("ALL")}>
            All <span className="opacity-70">({counts.ALL})</span>
          </button>

          <button className={`${chipBase} ${chip(filter === "APPOINTMENTS")}`} onClick={() => setFilter("APPOINTMENTS")}>
            <CalendarDaysIcon size={14} /> Appointments <span className="opacity-70">({counts.APPOINTMENTS})</span>
          </button>


          <button className={`${chipBase} ${chip(filter === "BILLING")}`} onClick={() => setFilter("BILLING")}>
            <CreditCardIcon size={14} /> Billing <span className="opacity-70">({counts.BILLING})</span>
          </button>

          <button className={`${chipBase} ${chip(filter === "TREATMENT")}`} onClick={() => setFilter("TREATMENT")}>
            <FileTextIcon size={14} /> Treatment <span className="opacity-70">({counts.TREATMENT})</span>
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
          {err}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-4 py-6 text-slate-400 text-sm flex items-center gap-2">
            <Loader2Icon className="animate-spin" size={16} /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">
            No updates here right now.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100/80 dark:divide-slate-900/80">
            {filtered.map((n) => (
              <li key={n.id} className="px-4 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-900/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                      {n.title || n.type || "Update"}
                    </div>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                      {n.message}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      {n.created_at || ""}
                      {n.scheduled_at ? (
                        <>
                          <span className="mx-2">•</span>
                          Scheduled: <span className="font-mono">{n.scheduled_at}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {String(n.status || "").toUpperCase() !== "READ" && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 text-slate-700 dark:text-slate-200"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
