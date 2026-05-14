'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Users, Send, ChevronRight, Trash2, RefreshCw, CheckCircle2, X } from 'lucide-react';

interface Batch { id: string; name: string; grade: string; board: string; isActive: boolean; createdBy: { name: string }; _count: { enrollments: number; dispatches: number }; }
interface BatchDetail { id: string; name: string; grade: string; board: string; description: string | null; inviteCode: string | null; enrollments: { id: string; student: { id: string; name: string; email: string; phone: string | null } }[]; dispatches: { id: string; dispatchedAt: string; totalSent: number; totalFailed: number; test: { title: string } }[]; }
interface TestOpt { id: string; title: string; subject: string; }

export default function BatchManager({ userId }: { userId: string }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [tests, setTests] = useState<TestOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [dispatchTestId, setDispatchTestId] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState('');
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('10');
  const [newBoard, setNewBoard] = useState('CBSE');
  const [newDesc, setNewDesc] = useState('');
  const [newCode, setNewCode] = useState('');

  const load = useCallback(async () => { setLoading(true); try { const r = await fetch('/api/batches'); const d = await r.json(); setBatches(d.batches || []); } catch {} setLoading(false); }, []);
  const loadTests = useCallback(async () => { try { const r = await fetch('/api/tests?status=Published'); const d = await r.json(); setTests((d.tests || []).map((t: any) => ({ id: t.id, title: t.title, subject: t.subject }))); } catch {} }, []);
  useEffect(() => { load(); loadTests(); }, [load, loadTests]);

  const openBatch = async (id: string) => { try { const r = await fetch(`/api/batches/${id}`); const d = await r.json(); setDetail(d.batch); } catch {} };

  const createBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, grade: newGrade, board: newBoard, description: newDesc || null, inviteCode: newCode || null, createdById: userId }) });
    setShowCreate(false); setNewName(''); setNewDesc(''); setNewCode(''); load();
  };

  const removeStudent = async (sid: string) => { if (!detail) return; await fetch(`/api/batches/${detail.id}/enroll`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid }) }); openBatch(detail.id); };

  const dispatchTest = async () => {
    if (!detail || !dispatchTestId) return;
    setDispatching(true); setDispatchMsg('');
    try { const r = await fetch(`/api/batches/${detail.id}/dispatch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId: dispatchTestId }) }); const d = await r.json(); setDispatchMsg(d.message || 'Done'); openBatch(detail.id); } catch { setDispatchMsg('Failed'); }
    setDispatching(false);
  };

  if (detail) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fadeIn">
        <button onClick={() => setDetail(null)} className="text-xs text-indigo-500 hover:text-indigo-400 font-bold">← Back to batches</button>
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-xl flex items-center justify-between">
          <div><h2 className="text-xl font-bold">{detail.name}</h2><p className="text-indigo-200 text-xs mt-1">Grade {detail.grade} • {detail.board}{detail.inviteCode ? ` • Code: ${detail.inviteCode}` : ''}</p>{detail.description && <p className="text-indigo-100 text-xs mt-2">{detail.description}</p>}</div>
          <div className="text-right"><p className="text-3xl font-bold">{detail.enrollments.length}</p><p className="text-indigo-200 text-xs">Students</p></div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2"><Send className="w-4 h-4 text-indigo-500" /> Dispatch Test</h3>
          <div className="flex gap-3">
            <select value={dispatchTestId} onChange={e => setDispatchTestId(e.target.value)} className="flex-1 py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
              <option value="">Select test...</option>
              {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <button onClick={dispatchTest} disabled={dispatching || !dispatchTestId} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md">
              {dispatching ? <RefreshCw className="w-3.5 h-3.5 inline animate-spin" /> : 'Dispatch'}
            </button>
          </div>
          {dispatchMsg && <p className="mt-2 text-xs text-emerald-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {dispatchMsg}</p>}
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> Enrolled Students</h3>
          {detail.enrollments.length === 0 ? <p className="text-xs text-slate-400 py-4 text-center">No students enrolled. Use Provision Students to add.</p> : (
            <table className="w-full text-xs"><thead><tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500"><th className="text-left py-2 pr-4 font-medium">Name</th><th className="text-left py-2 pr-4 font-medium">Email</th><th className="text-left py-2 pr-4 font-medium">Phone</th><th className="text-left py-2 font-medium"></th></tr></thead>
            <tbody>{detail.enrollments.map(e => (<tr key={e.id} className="border-b border-slate-100 dark:border-slate-800/50"><td className="py-2 pr-4 text-slate-900 dark:text-slate-200 font-medium">{e.student.name}</td><td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{e.student.email}</td><td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{e.student.phone || '—'}</td><td className="py-2"><button onClick={() => removeStudent(e.student.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button></td></tr>))}</tbody></table>
          )}
        </div>

        {detail.dispatches.length > 0 && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Dispatch History</h3>
            {detail.dispatches.map(d => (<div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs mb-1"><span className="text-slate-900 dark:text-slate-200 font-medium">{d.test.title}</span><span className="text-slate-500">{new Date(d.dispatchedAt).toLocaleString()} • {d.totalSent} sent{d.totalFailed > 0 ? `, ${d.totalFailed} failed` : ''}</span></div>))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Batch Management</h2><p className="text-xs text-slate-500 mt-1">Organize students for targeted dispatch and tracking.</p></div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New Batch</button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={createBatch} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create Batch</h3><button type="button" onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-slate-400" /></button></div>
            <input type="text" placeholder="Batch name" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newGrade} onChange={e => setNewGrade(e.target.value)} className="py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">{['12','11','10','9','8','7'].map(g => <option key={g} value={g}>Grade {g}</option>)}</select>
              <select value={newBoard} onChange={e => setNewBoard(e.target.value)} className="py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">{['CBSE','ICSE','Foundation'].map(b => <option key={b} value={b}>{b}</option>)}</select>
            </div>
            <input type="text" placeholder="Invite code (optional)" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white" />
            <textarea placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none" />
            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md">Create Batch</button>
          </form>
        </div>
      )}

      {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div> : batches.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"><Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-sm text-slate-500">No batches yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map(b => (
            <button key={b.id} onClick={() => openBatch(b.id)} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all text-left group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"><Layers className="w-5 h-5" /></div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.isActive ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{b.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Grade {b.grade} • {b.board}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> {b._count.enrollments} students</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
