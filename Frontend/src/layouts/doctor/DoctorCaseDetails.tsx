import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AIAssistantModal } from '../../components/ai/AIAssistantModal';
import { DoctorLayout } from './DoctorLayout';

type CaseStage = 'New' | 'In treatment' | 'Waiting on patient' | 'Completed';

type CaseSummary = {
  id?: number;
  status?: string;
  summary?: string;
  recommendation?: string;
  createdAt?: string;
};

type CaseTimelineEntry = {
  id?: number;
  action?: string;
  note?: string;
  createdAt?: string;
};

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000';

const getAuthToken = () =>
  localStorage.getItem('authToken') ||
  localStorage.getItem('token') ||
  '';

const mapStageDbToLabel = (stageDb: string | null | undefined): CaseStage => {
  const s = String(stageDb || '').toUpperCase();
  if (s === 'IN_TREATMENT') return 'In treatment';
  if (s === 'WAITING_ON_PATIENT') return 'Waiting on patient';
  if (s === 'CLOSED' || s === 'COMPLETED') return 'Completed';
  return 'New';
};

const mapStageLabelToDb = (stage: CaseStage): string => {
  switch (stage) {
    case 'In treatment':
      return 'IN_TREATMENT';
    case 'Waiting on patient':
      return 'WAITING_ON_PATIENT';
    case 'Completed':
      return 'CLOSED';
    case 'New':
    default:
      return 'NEW';
  }
};

function isNumericId(v: string | undefined): boolean {
  if (!v) return false;
  return /^\d+$/.test(String(v).trim());
}

function safeText(v: any): string {
  return String(v ?? '').trim();
}

export const DoctorCaseDetails: React.FC = () => {
  const { caseRef } = useParams<{ caseRef: string }>();
  const [dbId, setDbId] = useState<number | null>(null);
  const [caseUid, setCaseUid] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('Unknown patient');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const [model, setModel] = useState({
    diagnosis: '',
    toothRegion: '',
    stage: 'New' as CaseStage,
    notes: '',
    nextReviewDate: '',
  });

  const [summaries, setSummaries] = useState<CaseSummary[]>([]);
  const [timeline, setTimeline] = useState<CaseTimelineEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const displayCaseId = useMemo(
    () => caseUid || (dbId ? `CASE-${dbId}` : 'CASE-UNKNOWN'),
    [caseUid, dbId]
  );

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Not authenticated. Please login again.');
      setLoading(false);
      return;
    }

    const resolveDbId = async () => {
      try {
        if (!caseRef) {
          setError('Missing case identifier in URL.');
          setLoading(false);
          return;
        }

        if (isNumericId(caseRef)) {
          setDbId(Number(caseRef));
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/doctor/cases`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to resolve case');
        }

        const data = await res.json();
        const items = (data.cases || []) as any[];
        const match = items.find((c) => {
          const uid = safeText(
            c.caseId ?? c.case_uid ?? c.caseUid ?? c.uid ?? c.id
          );
          return uid.toLowerCase() === caseRef.toLowerCase();
        });

        const resolvedDbId =
          Number(match?.dbId || match?.db_id || match?.id || 0) || 0;

        if (!resolvedDbId) {
          throw new Error('Case not found for this ID.');
        }

        setDbId(resolvedDbId);
        const uid = safeText(
          match?.caseId ?? match?.case_uid ?? match?.caseUid ?? match?.uid
        );
        if (uid) setCaseUid(uid);
      } catch (err: any) {
        setError(err.message || 'Failed to resolve case ID.');
        setLoading(false);
      }
    };

    resolveDbId();
  }, [caseRef]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token || !dbId) return;

    const fetchCase = async () => {
      try {
        setLoading(true);
        setError(null);
        setStatusMsg(null);

        const res = await fetch(`${API_BASE_URL}/api/doctor/cases/${dbId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to load case');
        }

        const data = await res.json();
        const c = data.case || {};

        const uid = safeText(c.caseId ?? c.case_uid ?? c.caseUid ?? c.id);
        if (uid) setCaseUid(uid);

       setPatientName(safeText(c.patientName) || 'Unknown patient');
       setCreatedAt(safeText(c.createdAt || c.created_at).slice(0, 10));
       setUpdatedAt(safeText(c.updatedAt || c.updated_at).slice(0, 10));

        const agentSummary = safeText(c.agentSummary || c.agent_summary);
        const agentRecommendation = safeText(
          c.agentRecommendation || c.agent_recommendation
        );
        if (agentSummary) {
          setSummaries([
            {
              id: c.id || dbId || undefined,
              status: 'READY',
              summary: agentSummary,
              recommendation: agentRecommendation,
              createdAt: safeText(c.updatedAt || c.updated_at).slice(0, 10),
            },
          ]);
        }

        setModel({
          diagnosis: safeText(c.diagnosis) || safeText(c.case_type),
          toothRegion: safeText(c.toothRegion) || 'Not specified',
          stage: mapStageDbToLabel(c.stage),
          notes: safeText(c.notes),
          nextReviewDate: safeText(c.nextReviewDate || c.next_review_date).slice(0, 10),
        });
      } catch (err: any) {
        setError(err.message || 'Unable to load case.');
      } finally {
        setLoading(false);
      }
    };

    const fetchSummaries = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/doctor/cases/${dbId}/summaries?includePending=1`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          setSummaries([]);
          return;
        }
        const data = await res.json();
        const items = (data.summaries || data.items || []) as any[];
        const mapped = items.map((s) => ({
          id: s.id,
          status: safeText(s.status),
          summary: safeText(s.summary || s.agent_summary),
          recommendation: safeText(s.recommendation || s.agent_recommendation),
          createdAt: safeText(s.created_at || s.createdAt).slice(0, 10),
        }));
        setSummaries(mapped);
      } catch {
        setSummaries([]);
      }
    };

    const fetchTimeline = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/doctor/cases/${dbId}/timeline`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          setTimeline([]);
          return;
        }
        const data = await res.json();
        const items = (data.timeline || data.items || []) as any[];
        const mapped = items.map((t) => ({
          id: t.id,
          action: safeText(t.action || t.event_type || t.type),
          note: safeText(t.note || t.message || t.summary),
          createdAt: safeText(t.created_at || t.createdAt).slice(0, 10),
        }));
        setTimeline(mapped);
      } catch {
        setTimeline([]);
      }
    };

    fetchCase();
    fetchSummaries();
    fetchTimeline();
  }, [dbId]);

  const handleSave = async () => {
    const token = getAuthToken();
    if (!token || !dbId) return;
    try {
      setSaving(true);
      setStatusMsg(null);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/doctor/cases/${dbId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          diagnosis: model.diagnosis,
          stage: mapStageLabelToDb(model.stage),
          notes: model.notes,
          toothRegion: model.toothRegion,
          nextReviewDate: model.nextReviewDate || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to save case');
      }

      setStatusMsg('Case updated.');
    } catch (err: any) {
      setError(err.message || 'Failed to save case.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestSummary = async () => {
    const token = getAuthToken();
    if (!token || !dbId) return;
    try {
      setSummaryStatus(null);
      const res = await fetch(`${API_BASE_URL}/api/doctor/cases/${dbId}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caseId: dbId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to request summary');
      }

      setSummaryStatus('Summary requested. The AI agent will process it shortly.');
    } catch (err: any) {
      setSummaryStatus(err.message || 'Failed to request summary.');
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Loading case details...
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Case details</p>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {displayCaseId}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {patientName}
            </p>
          </div>
          <Link
            to="/doctor/cases"
            className="text-xs inline-flex items-center rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1.5 text-slate-700 dark:text-slate-200"
          >
            Back to cases
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}
        {statusMsg && (
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            {statusMsg}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Diagnosis</label>
                <input
                  value={model.diagnosis}
                  onChange={(e) =>
                    setModel((prev) => ({ ...prev, diagnosis: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Tooth / region</label>
                <input
                  value={model.toothRegion}
                  onChange={(e) =>
                    setModel((prev) => ({ ...prev, toothRegion: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Stage</label>
                <select
                  value={model.stage}
                  onChange={(e) =>
                    setModel((prev) => ({ ...prev, stage: e.target.value as CaseStage }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                >
                  <option value="New">New</option>
                  <option value="In treatment">In treatment</option>
                  <option value="Waiting on patient">Waiting on patient</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Next review date</label>
                <input
                  type="date"
                  value={model.nextReviewDate}
                  onChange={(e) =>
                    setModel((prev) => ({ ...prev, nextReviewDate: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-300">Notes</label>
              <textarea
                value={model.notes}
                onChange={(e) =>
                  setModel((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dbId}
                className="rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 px-3 py-2 font-semibold disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={handleRequestSummary}
                disabled={!dbId}
                className="rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-300 px-3 py-2 font-semibold hover:bg-emerald-500/10 disabled:opacity-60"
              >
                Generate AI summary
              </button>
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 px-3 py-2 text-slate-700 dark:text-slate-200"
              >
                Open AI assistant
              </button>
            </div>
            {summaryStatus && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {summaryStatus}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 p-4 space-y-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <div>Created: {createdAt || 'Unknown'}</div>
              <div>Updated: {updatedAt || 'Unknown'}</div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                AI summaries
              </h3>
              {summaries.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No AI summaries yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {summaries.map((s) => (
                    <div
                      key={s.id || `${s.createdAt}-${s.status}`}
                      className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-2"
                    >
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {s.createdAt || 'Unknown'} {s.status ? `- ${s.status}` : ''}
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200">
                        {s.summary || 'Summary pending.'}
                      </p>
                      {s.recommendation && (
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {s.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Timeline
              </h3>
              {timeline.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No timeline entries yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {timeline.map((t) => (
                    <div
                      key={t.id || `${t.createdAt}-${t.action}`}
                      className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-2 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.createdAt || 'Unknown'}
                      </div>
                      <div className="font-semibold">{t.action || 'Update'}</div>
                      {t.note && <div className="mt-1">{t.note}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AIAssistantModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        context="cases"
      />
    </DoctorLayout>
  );
};

export default DoctorCaseDetails;
