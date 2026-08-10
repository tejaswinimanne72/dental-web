// src/layouts/doctor/DoctorPatients.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { UsersIcon, AlertCircleIcon, SearchIcon, ActivityIcon } from 'lucide-react';
import { DoctorLayout } from './DoctorLayout';

type DoctorPatient = {
  id: string;
  name: string;
  lastVisit: string | null;
  activeCases: number;
};

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000';

const getAuthToken = () =>
  localStorage.getItem('authToken') ||
  localStorage.getItem('token') ||
  '';

export const DoctorPatients: React.FC = () => {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Not authenticated. Please login again.');
      setLoading(false);
      return;
    }

    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/doctor/patients`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to load patients');
        }

        const data = await res.json();
        setPatients(data.items || []);
      } catch (err: any) {
        console.error('Doctor patients error:', err);
        setError(err.message || 'Unable to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.lastVisit || '').toLowerCase().includes(q)
    );
  }, [patients, search]);

  return (
    <DoctorLayout>
      <section className="space-y-4">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <UsersIcon size={14} />
              <span>Patients</span>
            </div>
            <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
              Patient roster
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Track patients under your care with quick visibility into last visit and active cases.
            </p>
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500">
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID"
              className="w-full sm:min-w-[260px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur px-4 py-4 shadow-sm">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading patients…
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/5 px-3 py-3 text-xs text-amber-100">
              <AlertCircleIcon size={14} className="mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200">Couldn't load patients</p>
                <p className="mt-0.5 text-[11px] opacity-90 text-amber-100">{error}</p>
              </div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No patients match your search.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 p-4 shadow-sm hover:shadow-[0_18px_55px_-40px_rgba(15,23,42,0.45)] transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ID: <span className="font-mono">{p.id}</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-200">
                      <ActivityIcon size={12} />
                      {p.activeCases} active
                    </span>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 font-semibold">
                      Last visit
                    </p>
                    <p className="mt-0.5 text-slate-800 dark:text-slate-100">
                      {p.lastVisit || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </DoctorLayout>
  );
};
