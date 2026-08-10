import React, { useEffect, useMemo, useState } from "react";
import {
  CreditCardIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  DownloadIcon,
  RefreshCwIcon,
} from "lucide-react";
import { PatientLayout } from "../layouts/patient/PatientLayout";
import { fetchWithAuth } from "../lib/api";

type Payment = {
  id: number | string;
  date: string | null;
  description: string;
  amount: number;
  status: string;
  currency?: string;
};

type DashboardResponse = {
  payments?: Payment[];
};

type LoadState = "loading" | "ready" | "error";

const card =
  "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.35)]";

export const PatientBilling: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");

  async function load() {
    try {
      setStatus("loading");
      const data = await fetchWithAuth<DashboardResponse>("/api/patient/dashboard");
      setPayments(Array.isArray(data.payments) ? data.payments : []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const currencyLabel =
    payments[0]?.currency === "INR" || !payments[0]?.currency
      ? "₹"
      : payments[0]?.currency + " ";

  const visiblePayments = useMemo(
    () => payments.filter((p) => Number(p.amount || 0) > 0),
    [payments]
  );

  const totalDue = useMemo(() => {
    return visiblePayments
      .filter((p) => String(p.status || "").toUpperCase() !== "PAID")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [visiblePayments]);

  const pendingCount = useMemo(() => {
    return visiblePayments.filter((p) => String(p.status || "").toUpperCase() !== "PAID").length;
  }, [visiblePayments]);

  return (
    <PatientLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-5 py-5 shadow-[0_26px_80px_-55px_rgba(15,23,42,0.55)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <CreditCardIcon size={14} />
                <span>Billing</span>
              </div>
              <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
                Payments & invoices
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Review billing history and invoice status from your clinic.
              </p>
            </div>

            <button
              onClick={load}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 text-slate-700 dark:text-slate-200"
            >
              <RefreshCwIcon size={14} />
              Refresh
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[0.9fr,1.1fr] gap-4">
          {/* summary */}
          <div className={card + " p-5"}>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-[0.16em] uppercase">
              Overview
            </p>

            <h2 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              Current balance
            </h2>

            <p className="mt-1 text-2xl font-semibold text-amber-700 dark:text-amber-200">
              {currencyLabel}
              {Number(totalDue || 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-2 text-[12px] text-slate-600 dark:text-slate-300">
              This reflects invoices that are not marked as paid in your clinic’s system.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 px-3 py-1 text-[11px] text-slate-600 dark:text-slate-300">
              <CreditCardIcon size={12} />
              <span>
                Pending invoices:{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {status === "ready" ? pendingCount : "—"}
                </span>
              </span>
            </div>

            <div className="mt-4 border-t border-slate-200/80 dark:border-slate-800 pt-3 text-[12px] text-slate-600 dark:text-slate-300">
              For payments, insurance clarifications, or corrections, please contact your clinic.
            </div>
          </div>

          {/* table */}
          <div className={card + " p-5"}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                Invoice history
              </p>
            </div>

            {status === "loading" && (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            )}

            {status === "error" && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                We couldn’t load billing right now. Please try again a little later.
              </p>
            )}

            {status === "ready" && visiblePayments.length === 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No invoices yet.
              </p>
            )}

            {status === "ready" && visiblePayments.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="py-2 pr-3 text-left">Invoice</th>
                      <th className="py-2 pr-3 text-left">Date</th>
                      <th className="py-2 pr-3 text-left">Description</th>
                      <th className="py-2 pr-3 text-left">Amount</th>
                      <th className="py-2 pr-3 text-left">Status</th>
                      <th className="py-2 text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 dark:divide-slate-900/70">
                    {visiblePayments.map((p) => {
                      const raw = String(p.status || "").toUpperCase();
                      const isPaid = raw === "PAID";
                      const isOverdue = raw === "OVERDUE";

                      const statusLabel = isPaid ? "Paid" : isOverdue ? "Overdue" : (p.status || "Pending");

                      const statusClasses = isPaid
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-500/30"
                        : isOverdue
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-200 border border-rose-500/30"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-500/30";

                      return (
                        <tr key={String(p.id)} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition">
                          <td className="py-3 pr-3 font-medium text-slate-900 dark:text-slate-50">
                            {typeof p.id === "string" ? p.id : `INV-${p.id}`}
                          </td>
                          <td className="py-3 pr-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {p.date || "—"}
                          </td>
                          <td className="py-3 pr-3 text-slate-700 dark:text-slate-200">
                            {p.description || "Dental invoice"}
                          </td>
                          <td className="py-3 pr-3 font-semibold text-amber-700 dark:text-amber-200 whitespace-nowrap">
                            {currencyLabel}{Number(p.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClasses}`}>
                              {isPaid ? <CheckCircle2Icon size={11} className="mr-1" /> : <AlertCircleIcon size={11} className="mr-1" />}
                              {statusLabel}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition"
                              onClick={() => {}}
                              title="PDFs are shared by the clinic"
                            >
                              <DownloadIcon size={12} />
                              PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <p className="mt-3 text-[12px] text-slate-500 dark:text-slate-400">
                  PDFs are shared by your clinic. If you need a copy, please contact the front desk.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </PatientLayout>
  );
};
