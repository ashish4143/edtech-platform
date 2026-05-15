'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Users, Send, ChevronRight, Trash2, RefreshCw, CheckCircle2, X, Search } from 'lucide-react';

interface Batch { id: string; name: string; grade: string; board: string; isActive: boolean; createdBy: { name: string }; _count: { enrollments: number; dispatches: number }; }
interface Student { id: string; name: string; email: string; phone: string | null; }
interface BatchDetail { id: string; name: string; grade: string; board: string; description: string | null; inviteCode: string | null; enrollments: { id: string; student: Student }[]; dispatches: { id: string; dispatchedAt: string; totalSent: number; totalFailed: number; test: { title: string } }[]; }
interface TestOpt { id: string; title: string; subject: string; }

const GRADES = ['7','8','9','10','11','12'];
const BOARDS = ['CBSE','ICSE','Foundation'];

export default function BatchManager({ userId }: { userId: string }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [tests, setTests] = useState<TestOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('10');
  const [newBoard, setNewBoard] = useState('CBSE');
  const [newDesc, setNewDesc] = useState('');

  // Smart search
  const [searchMode, setSearchMode] = useState<'filtered' | 'global'>('filtered');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterBatchId, setFilterBatchId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);

  // Dispatch
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dispatchTestId, setDispatchTestId] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch('/api/batches'); const d = await r.json(); setBatches(d.batches || []); } catch {}
    setLoading(false);
  }, []);

  const loadTests = useCallback(async () => {
    try { const r = await fetch('/api/tests?status=Published'); const d = await r.json(); setTests((d.tests || []).map((t: any) => ({ id: t.id, title: t.title, subject: t.subject }))); } catch {}
  }, []);

  useEffect(() => { load(); loadTests(); }, [load, loadTests]);

  // Filtered batches by selected grade
  const batchesForGrade = filterGrade ? batches.filter(b => b.grade === filterGrade) : [];

  // Search students: filtered = within batch, global = across all students
  useEffect(() => {
    if (searchMode === 'filtered' && !filterBatchId) { setSearchResults([]); return; }
    if (searchMode === 'global' && searchQuery.trim().length < 2) { setSearchResults([]); return; }

    const fetchStudents = async () => {
      setSearching(true);
      try {
        if (searchMode === 'filtered') {
          const r = await fetch(`/api/batches/${filterBatchId}/students`);
          const d = await r.json();
          const all: Student[] = d.students || [];
          setSearchResults(searchQuery.trim() ? all.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())) : all);
        } else {
          const r = await fetch(`/api/users/students?q=${encodeURIComponent(searchQuery.trim())}`);
          const d = await r.json();
          setSearchResults(d.students || []);
        }
      } catch {}
      setSearching(false);
    };
    const timeout = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timeout);
  }, [filterBatchId, searchQuery, searchMode]);

  const openBatch = async (id: string) => {
    try { const r = await fetch(`/api/batches/${id}`); const d = await r.json(); setDetail(d.batch); setSelectedStudents(d.batch.enrollments.map((e: any) => e.student.id)); } catch {}
  };

  const createBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, grade: newGrade, board: newBoard, description: newDesc || null, createdById: userId }) });
    setShowCreate(false); setNewName(''); setNewDesc(''); load();
  };

  const removeStudent = async (sid: string) => {
    if (!detail) return;
    await fetch(`/api/batches/${detail.id}/enroll`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid }) });
    openBatch(detail.id);
  };

  const toggleStudent = (sid: string) => setSelectedStudents(prev => prev.includes(sid) ? prev.filter(id => id !== sid) : [...prev, sid]);

  const dispatchTest = async () => {
    if (!detail || !dispatchTestId || selectedStudents.length === 0) return;
    setDispatching(true); setDispatchMsg('');
    try {
      const r = await fetch('/api/assignments/targeted', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId: dispatchTestId, studentIds: selectedStudents, batchId: detail.id }) });
      const d = await r.json();
      setDispatchMsg(d.message || 'Dispatched successfully');
      openBatch(detail.id);
    } catch { setDispatchMsg('Failed to dispatch'); }
    setDispatching(false);
  };

  // ─── Batch Detail View ───────────────────────────────────────────────
  if (detail) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fadeIn">
        <button onClick={() => setDetail(null)} className="text-xs text-indigo-500 hover:text-indigo-400 font-bold">← Back to batches</button>
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-xl flex items-center justify-between">
          <div><h2 className="text-xl font-bold">{detail.name}</h2><p className="text-indigo-200 text-xs mt-1">Grade {detail.grade} • {detail.board}</p>{detail.description && <p className="text-indigo-100 text-xs mt-2">{detail.description}</p>}</div>
          <div className="text-right"><p className="text-3xl font-bold">{detail.enrollments.length}</p><p className="text-indigo-200 text-xs">Students</p></div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><Send className="w-4 h-4 text-indigo-500" /> Targeted Dispatch</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{selectedStudents.length} selected</span>
          </h3>
          <div className="flex flex-col md:flex-row gap-3">
            <select value={dispatchTestId} onChange={e => setDispatchTestId(e.target.value)} className="flex-1 py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
              <option value="">Select test to dispatch...</option>
              {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <button onClick={dispatchTest} disabled={dispatching || !dispatchTestId || selectedStudents.length === 0} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md">
              {dispatching ? <RefreshCw className="w-3.5 h-3.5 inline animate-spin" /> : 'Dispatch to Selected'}
            </button>
          </div>
          {dispatchMsg && <p className="mt-2 text-xs text-emerald-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {dispatchMsg}</p>}
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> Enrolled Students</h3>
            <button onClick={() => setSelectedStudents(detail.enrollments.map(e => e.student.id))} className="text-xs text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">Select All</button>
          </div>
          {detail.enrollments.length === 0 ? <p className="text-xs text-slate-400 py-4 text-center">No students enrolled.</p> : (
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2 pr-2 w-8"></th><th className="text-left py-2 pr-4 font-medium">Name</th><th className="text-left py-2 pr-4 font-medium hidden sm:table-cell">Email</th><th className="text-left py-2 font-medium"></th>
              </tr></thead>
              <tbody>
                {detail.enrollments.map(e => {
                  const isSelected = selectedStudents.includes(e.student.id);
                  return (
                    <tr key={e.id} className={`border-b border-slate-100 dark:border-slate-800/50 transition-colors ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}>
                      <td className="py-2 pr-2"><input type="checkbox" checked={isSelected} onChange={() => toggleStudent(e.student.id)} className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 cursor-pointer" /></td>
                      <td className="py-2 pr-4 text-slate-900 dark:text-slate-200 font-medium">{e.student.name}</td>
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-400 hidden sm:table-cell">{e.student.email}</td>
                      <td className="py-2 text-right"><button onClick={() => removeStudent(e.student.id)} className="text-red-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {detail.dispatches.length > 0 && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Dispatch History</h3>
            {detail.dispatches.map(d => (<div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs mb-1"><span className="font-medium">{d.test.title}</span><span className="text-slate-500">{new Date(d.dispatchedAt).toLocaleString()} • {d.totalSent} sent</span></div>))}
          </div>
        )}
      </div>
    );
  }

  // ─── Main Batches List + Smart Search ────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Batch Management</h2><p className="text-xs text-slate-500 mt-1">Create batches, search students by class & batch, and dispatch tests.</p></div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New Batch</button>
      </div>

      {/* Smart Student Search */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-2"><Search className="w-4 h-4 text-indigo-500" /> Find Student</span>
          {/* Mode Toggle */}
          <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button onClick={() => { setSearchMode('filtered'); setSearchQuery(''); setSearchResults([]); }} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${searchMode === 'filtered' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>By Class & Batch</button>
            <button onClick={() => { setSearchMode('global'); setFilterGrade(''); setFilterBatchId(''); setSearchResults([]); }} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${searchMode === 'global' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Global Search</button>
          </div>
        </h3>

        {searchMode === 'filtered' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">1. Select Class</label>
              <select value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setFilterBatchId(''); setSearchQuery(''); setSearchResults([]); }} className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500">
                <option value="">Select class...</option>
                {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">2. Select Batch</label>
              <select value={filterBatchId} onChange={e => { setFilterBatchId(e.target.value); setSearchQuery(''); }} disabled={!filterGrade} className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40">
                <option value="">{filterGrade ? `Batches for Class ${filterGrade}...` : 'Select class first'}</option>
                {batchesForGrade.map(b => <option key={b.id} value={b.id}>{b.name} ({b.board}) — {b._count.enrollments} students</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">3. Search by Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={filterBatchId ? 'Type student name...' : 'Select batch first'} disabled={!filterBatchId} className="w-full py-2 pl-8 pr-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Type any student name (min 2 chars)..." className="w-full py-2.5 pl-9 pr-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
          </div>
        )}

        {/* Search Results */}
        {(filterBatchId || (searchMode === 'global' && searchQuery.trim().length >= 2)) && (
          <div className="mt-2">
            {searching ? (
              <p className="text-xs text-slate-400 flex items-center gap-2"><RefreshCw className="w-3 h-3 animate-spin" /> Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{searchMode === 'global' ? `No students found matching "${searchQuery}".` : (searchQuery ? `No students matching "${searchQuery}" in this batch.` : 'No students enrolled in this batch.')}</p>
            ) : (
              <table className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <thead><tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-2 px-3 font-medium">Name</th>
                  <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Email</th>
                  {searchMode === 'global' && <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Class / Batch</th>}
                  <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Phone</th>
                </tr></thead>
                <tbody>
                  {searchResults.map((s: any) => (
                    <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors">
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                      <td className="py-2 px-3 text-slate-500 hidden sm:table-cell">{s.email}</td>
                      {searchMode === 'global' && <td className="py-2 px-3 text-slate-500 hidden md:table-cell">{s.grade ? `Class ${s.grade}` : '—'}{s.batchEnrollments?.[0] ? ` • ${s.batchEnrollments[0].batch.name}` : ''}</td>}
                      <td className="py-2 px-3 text-slate-500 hidden md:table-cell">{s.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Batch Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : batches.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"><Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-sm text-slate-500">No batches yet. Create one above.</p></div>
      ) : (
        <>
          {/* Group by grade */}
          {GRADES.filter(g => batches.some(b => b.grade === g)).map(g => (
            <div key={g}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Class {g}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.filter(b => b.grade === g).map(b => (
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
            </div>
          ))}
        </>
      )}

      {/* Create Batch Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={createBatch} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create New Batch</h3><button type="button" onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-slate-400" /></button></div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Batch Name <span className="text-slate-400">(e.g. Aspire, Excel)</span></label>
              <input type="text" placeholder="e.g. Aspire" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
                <select value={newGrade} onChange={e => setNewGrade(e.target.value)} className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                  {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Board</label>
                <select value={newBoard} onChange={e => setNewBoard(e.target.value)} className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description <span className="text-slate-400">(optional)</span></label>
              <textarea placeholder="e.g. Morning batch for top performers" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none" />
            </div>

            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md">Create Batch</button>
          </form>
        </div>
      )}
    </div>
  );
}
