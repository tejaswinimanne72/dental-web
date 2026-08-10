// src/pages/doctor/DoctorInsights.tsx
import React from 'react';
import {
  ActivityIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  Clock3Icon,
} from 'lucide-react';
import { DoctorLayout } from './DoctorLayout';

export const DoctorInsights: React.FC = () => {
  const kpis = [
    { label: 'Chair utilisation', value: '82%', delta: '+6.1%', up: true },
    { label: 'Avg. wait time', value: '06m', delta: '-1.8m', up: false },
    { label: 'On-time starts', value: '91%', delta: '+3.4%', up: true },
  ];

  const positives = [
    'Chair utilisation is above your 4-week average.',
    'Follow-up adherence is trending upwards for implant patients.',
    'Most morning slots are consistently filled.',
  ];

  const watchlist = [
    'Late afternoon slots have more cancellations than usual.',
    'Two implant cases are approaching their review window.',
    'Consider spacing long procedures with short hygiene visits.',
  ];

  return (
    <DoctorLayout>
      <section className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <ActivityIcon size={14} />
              <span>Signals & insights</span>
            </div>
            <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
              How your week is trending
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Quick read on utilisation, punctuality, and case follow-ups. Refine your schedule with these signals.
            </p>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {kpis.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-4 py-3 shadow-sm"
            >
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                {item.label}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {item.value}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
                    item.up
                      ? 'text-emerald-700 bg-emerald-100 border border-emerald-200/70 dark:text-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                      : 'text-amber-700 bg-amber-100 border border-amber-200/70 dark:text-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30'
                  }`}
                >
                  {item.up ? <ArrowUpRightIcon size={12} /> : <ArrowDownRightIcon size={12} />}
                  {item.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Positive + Watch list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur px-4 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2Icon size={16} className="text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Positive signals</h2>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {positives.map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur px-4 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleIcon size={16} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Watch list</h2>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {watchlist.map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Schedule hygiene */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-100">
            <Clock3Icon size={16} />
            <h3 className="text-sm font-semibold">Scheduling hygiene tips</h3>
          </div>
          <p className="text-xs text-slate-200/90">
            Mix long procedures with short hygiene visits to keep day balance, and keep early slots for high-value
            work. Use follow-up reminders for patients with overdue reviews.
          </p>
        </div>
      </section>
    </DoctorLayout>
  );
};
