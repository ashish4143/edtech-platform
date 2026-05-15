'use client';

import React, { useState, useEffect } from 'react';
import { Users, Send, RefreshCw, Layers, Plus, UserPlus, X, CheckCircle2 } from 'lucide-react';

export default function StudentList({ userRole }: { userRole?: string }) {
  const isAdminOrTeacher = userRole === 'Admin' || userRole === 'Teacher';

  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Assignment state tracker
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null);

  // Add Student Modal States
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '10',
    board: 'CBSE',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalErr, setModalErr] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Profile Modal States
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch students list
      const resStud = await fetch('/api/users/students');
      const dataStud = await resStud.json();
      if (dataStud.students) setStudents(dataStud.students);

      // Fetch existing assessments available for assignment
      const resTest = await fetch('/api/tests');
      const dataTest = await resTest.json();
      if (dataTest.tests) {
        setTests(dataTest.tests);
        if (dataTest.tests.length > 0) {
          setSelectedTestId(dataTest.tests[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to retrieve management database arrays', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignTest = async (studentId: string) => {
    if (!selectedTestId) {
      alert('Please select a target test template first.');
      return;
    }

    setAssigningId(studentId);
    setStatusMsg(null);

    try {
      // Use the newly engineered single-dispatch API generating magic links automatically
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: selectedTestId, studentId }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({
          id: studentId,
          text: 'Assigned & Dispatch Notification Sent!',
          type: 'success',
        });
      } else {
        setStatusMsg({
          id: studentId,
          text: data.error || 'Failed assignment dispatch.',
          type: 'error',
        });
      }
    } catch {
      setStatusMsg({
        id: studentId,
        text: 'Network timeout reached.',
        type: 'error',
      });
    } finally {
      setAssigningId(null);
      setTimeout(() => {
        setStatusMsg((prev) => (prev?.id === studentId ? null : prev));
      }, 4000);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErr('');
    setModalSuccess('');
    setModalLoading(true);

    if (!newStudent.name || !newStudent.email || !newStudent.phone) {
      setModalErr('Please fill out all mandatory candidate profile fields.');
      setModalLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email,
          phone: newStudent.phone,
          grade: newStudent.grade,
          board: newStudent.board,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalSuccess(`Successfully added! Auto-generated password: ${data.generatedPassword}`);
        // Refresh local student roster list dynamically
        fetchData();
        setTimeout(() => {
          // Reset form fields
          setNewStudent({ name: '', email: '', phone: '', grade: '10', board: 'CBSE' });
          setModalSuccess('');
          setShowModal(false);
        }, 2500);
      } else {
        setModalErr(data.error || 'Unable to register student account profile.');
      }
    } catch (err) {
      console.error('Registration dispatch issue:', err);
      setModalErr('Connection intercommunication break encountered.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewProfile = async (studentId: string) => {
    setViewProfileId(studentId);
    setProfileLoading(true);
    setProfileData(null);
    try {
      const res = await fetch(`/api/users/${studentId}/profile`);
      const data = await res.json();
      if (res.ok) {
        setProfileData(data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fadeIn font-sans">
      {/* Module Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Candidate Students Roster
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administer target candidates, view registered contact metrics, and instantly dispatch verification-locked testing magic links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrTeacher && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Student
            </button>
          )}
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Target Action Assessment Selection Toolbar */}
      {isAdminOrTeacher && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Active Assessment Target for Direct Dispatch:
            </span>
          </div>

          <div className="w-full sm:w-auto flex-1 max-w-md">
            {tests.length === 0 ? (
              <span className="text-xs italic text-slate-400 block py-1">
                No target assessments available. Launch Test Wizard first to populate options.
              </span>
            ) : (
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} — Std {t.grade} ({t.subject} • {t.totalMarks} Marks)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Roster Representation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <th className="p-4">Candidate Identification</th>
              {isAdminOrTeacher && <th className="p-4">Registered Accounts Key</th>}
              <th className="p-4">{isAdminOrTeacher ? 'Phone / ' : ''}Curriculum</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <tr key={idx}>
                  <td className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-32"></div></td>
                  {isAdminOrTeacher && <td className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-40"></div></td>}
                  <td className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-24"></div></td>
                  <td className="p-4 text-right"><div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-24 ml-auto"></div></td>
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  No registered student accounts found. Click &quot;Add Student&quot; above to onboard directly.
                </td>
              </tr>
            ) : (
              students.map((stud) => (
                <tr key={stud.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {stud.name}
                    </span>
                    <span className="text-[10px] text-indigo-500 font-mono">
                      ID: {stud.id.split('-')[0]}
                    </span>
                  </td>
                  {isAdminOrTeacher && (
                    <td className="p-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300 font-medium">
                      {stud.email}
                    </td>
                  )}
                  <td className="p-4 whitespace-nowrap">
                    {isAdminOrTeacher && (
                      <span className="text-slate-700 dark:text-slate-300 font-medium block">
                        {stud.phone || 'N/A'}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Class {stud.grade || '10'} • {stud.board || 'CBSE'}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-right">
                    <div className="flex flex-col items-end justify-center gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewProfile(stud.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors"
                        >
                          View Profile
                        </button>
                        {isAdminOrTeacher && (
                          <button
                            type="button"
                            onClick={() => handleAssignTest(stud.id)}
                            disabled={assigningId === stud.id || tests.length === 0}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-sm"
                          >
                            {assigningId === stud.id ? (
                              <span>Dispatching...</span>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                <span>Dispatch Magic Link</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {statusMsg && statusMsg.id === stud.id && (
                        <span className={`text-[10px] font-bold animate-fadeIn ${
                          statusMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {statusMsg.text}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Admin Onboarding Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <UserPlus className="w-4 h-4" />
                <span>Admin Student Onboarding</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-4 space-y-3.5">
              {modalErr && (
                <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[11px] font-medium text-center">
                  {modalErr}
                </div>
              )}
              {modalSuccess && (
                <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Full Candidate Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ramesh@student.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Mobile Number (SMS verification key)
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Grade Context
                  </label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="12">Grade 12</option>
                    <option value="11">Grade 11</option>
                    <option value="10">Grade 10</option>
                    <option value="9">Grade 9</option>
                    <option value="8">Grade 8</option>
                    <option value="7">Grade 7</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Board System
                  </label>
                  <select
                    value={newStudent.board}
                    onChange={(e) => setNewStudent({ ...newStudent, board: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="Foundation">Foundation</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                >
                  {modalLoading ? 'Registering Account...' : 'Confirm Candidate Insertion'}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2 italic">
                  Password automatically assigned as: firstName + phoneLast4
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Detail Modal Overlay */}
      {viewProfileId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                  {profileData ? profileData.name.charAt(0).toUpperCase() : <Users className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {profileData ? profileData.name : 'Loading Profile...'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {viewProfileId.split('-')[0]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewProfileId(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-slate-950/30">
              {profileLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  <p className="text-xs text-slate-500">Retrieving student records...</p>
                </div>
              ) : profileData ? (
                <div className="space-y-6">
                  {/* Contact & Meta Data */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 break-words">{profileData.email || 'Hidden'}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{profileData.phone || 'Hidden'}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Curriculum</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">Grade {profileData.grade} • {profileData.board}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Joined</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{new Date(profileData.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Performance Snapshot */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" /> Performance Snapshot
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg">
                        <span className="text-xs text-indigo-100 font-medium block mb-1">Assessments Evaluated</span>
                        <span className="text-3xl font-black">{profileData.stats.totalEvaluatedTests}</span>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
                        <span className="text-xs text-emerald-100 font-medium block mb-1">Average Aggregate Score</span>
                        <span className="text-3xl font-black">{profileData.stats.averageScorePercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Batches */}
                  {profileData.batches && profileData.batches.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" /> Enrolled Batches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.batches.map((batchName: string, idx: number) => (
                          <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                            {batchName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity Log */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Recent Assessment History
                    </h3>
                    {profileData.recentActivity && profileData.recentActivity.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.recentActivity.map((attempt: any) => {
                          const percentage = Math.round((attempt.totalScore / attempt.maxScore) * 100);
                          const isGood = percentage >= 75;
                          const isWarning = percentage < 40;
                          
                          return (
                            <div key={attempt.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-300 transition-colors">
                              <div>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {attempt.test.title}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {new Date(attempt.submittedAt).toLocaleDateString()} • {attempt.test.subject}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className={`text-lg font-black block ${
                                  isGood ? 'text-emerald-500' : isWarning ? 'text-red-500' : 'text-amber-500'
                                }`}>
                                  {attempt.totalScore}/{attempt.maxScore}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  Score
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                        No evaluated assessment history available for this candidate yet.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-red-500 text-sm font-medium">
                  Failed to load candidate profile data.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
