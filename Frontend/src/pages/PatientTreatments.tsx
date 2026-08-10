import React, { useEffect, useState } from "react";
import {
  FileTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  PackageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PatientLayout } from "../layouts/patient/PatientLayout";
import { fetchWithAuth } from "../lib/api";

type Treatment = {
  id: string;
  title: string;
  lastUpdated: string | null;
  stage: string;
  summary: string;
  details: string | null;
  aiSummaries?: Array<{
    summary: string | null;
    recommendation: string | null;
    createdAt: string | null;
  }>;

  // Optional: if backend provides structured info
  materials?: Array<{ name: string; qty?: number; unit?: string }>;
  consumables?: Array<{ name: string; qty?: number; unit?: string }>;
};

type TreatmentsResponse = {
  items: Treatment[];
  error?: boolean;
};

type LoadState = "loading" | "ready" | "error";

const card =
  "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.35)]";

export const PatientTreatments: React.FC = () => {
  const navigate = useNavigate();

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");
        setErrorMsg(null);

        const data = await fetchWithAuth<TreatmentsResponse>("/api/patient/treatments");
        if (cancelled) return;

        const items = Array.isArray(data.items) ? data.items : [];
        setTreatments(items);
        setExpandedId(items[0]?.id ?? null);
        setStatus("ready");
      } catch (err: any) {
        if (cancelled) return;

        if (err?.code === "NO_TOKEN" || err?.status === 401) {
          setErrorMsg("Please log in again to view your treatment summaries.");
          setStatus("error");
          navigate("/login?role=patient", { replace: true });
        } else {
          setErrorMsg("We couldn’t load your summaries right now. Please try again.");
          setStatus("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <PatientLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-5 py-5 shadow-[0_26px_80px_-55px_rgba(15,23,42,0.55)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <FileTextIcon size={14} />
            <span>Treatment summaries</span>
          </div>

          <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
            Your treatment timeline
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Summaries are prepared from clinical notes and reviewed by your dentist.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/25 dark:text-amber-200">
            {errorMsg}
          </div>
        )}

        <section className={card + " p-4 sm:p-5 space-y-3"}>
          {status === "loading" && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading summaries…
            </p>
          )}

          {status === "ready" && treatments.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No treatment summaries yet.
            </p>
          )}

              {status === "ready" &&
                treatments.map((t) => {
                  const isOpen = expandedId === t.id;
                  const materials = (t.materials || t.consumables || []) as Array<any>;
                  const hasAISummaries = t.aiSummaries && t.aiSummaries.length > 0;

                  return (
                    <div
                      key={t.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : t.id)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {t.title}
                      </p>
                      <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Stage: <span className="font-semibold">{t.stage}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Updated: {t.lastUpdated || "—"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-300">
                      <CheckCircle2Icon size={12} />
                      <span>Reviewed</span>
                      {isOpen ? (
                        <ChevronDownIcon size={16} className="text-slate-400" />
                      ) : (
                        <ChevronRightIcon size={16} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                      {isOpen && (
                        <div className="border-t border-slate-200/80 dark:border-slate-800 px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                      <p className="mb-3">{t.summary}</p>

                      {t.details && (
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300">
                          {t.details}
                        </div>
                      )}

                      {hasAISummaries && (
                        <div className="mt-4">
                          <div className="text-[12px] font-semibold text-slate-900 dark:text-slate-50">
                            AI summaries
                          </div>
                          <div className="mt-2 space-y-2">
                            {(t.aiSummaries || []).map((s, idx) => (
                              <div
                                key={`${t.id}-ai-${idx}`}
                                className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200"
                              >
                                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                  <span>{s.createdAt ? s.createdAt.slice(0, 10) : "Recently"}</span>
                                  {idx === 0 && <span className="text-emerald-500 font-semibold">Latest</span>}
                                </div>
                                {s.summary && <p className="mt-1">{s.summary}</p>}
                                {s.recommendation && (
                                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                                    Recommendation: {s.recommendation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {materials.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-900 dark:text-slate-50">
                            <PackageIcon size={14} className="text-emerald-600 dark:text-emerald-300" />
                            Materials & supplies
                          </div>
                          <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-300">
                            Items listed here are based on your visit record.
                          </p>

                          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                            {materials.map((m, idx) => (
                              <li
                                key={`${t.id}-m-${idx}`}
                                className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 px-3 py-2"
                              >
                                <div className="font-medium text-slate-900 dark:text-slate-50">
                                  {String(m.name || m.item || "Item")}
                                </div>
                                {(m.qty || m.quantity) && (
                                  <div className="text-slate-500 dark:text-slate-400">
                                    Qty: {m.qty ?? m.quantity} {m.unit || ""}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </section>
      </div>
    </PatientLayout>
  );
};
