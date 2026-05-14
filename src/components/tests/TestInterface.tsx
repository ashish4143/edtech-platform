'use strict';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Clock, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuestionType } from '@prisma/client';

// Simple hash to generate a seed from a string (attemptId)
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

// Seeded pseudo-random number generator
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

interface TestInterfaceProps {
  attemptId: string;
  testDetails: {
    title: string;
    totalMarks: number;
    questionsList: any[];
  };
  durationMins: number;
  onFinishSubmit: (summary: any) => void;
  onCancel: () => void;
}

export default function TestInterface({
  attemptId,
  testDetails,
  durationMins,
  onFinishSubmit,
  onCancel,
}: TestInterfaceProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(durationMins * 60);
  const [submitting, setSubmitting] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);

  // Deterministically shuffle questions and options based on the attemptId
  const questionsList = useMemo(() => {
    if (!testDetails?.questionsList || testDetails.questionsList.length === 0) return [];

    // Initialize seeded PRNG
    const seed = cyrb128(attemptId);
    const rand = mulberry32(seed[0]);

    // 1. Map and shuffle options within MCQs
    const processedList = testDetails.questionsList.map((item) => {
      const q = item.question;
      if (q && q.type === QuestionType.MCQ && Array.isArray(q.options)) {
        const shuffledOptions = [...q.options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        return {
          ...item,
          question: {
            ...q,
            options: shuffledOptions,
          },
        };
      }
      return item;
    });

    // 2. Shuffle the overall order of the questions
    for (let i = processedList.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [processedList[i], processedList[j]] = [processedList[j], processedList[i]];
    }

    return processedList;
  }, [testDetails?.questionsList, attemptId]);

  const currentItem = questionsList[currentIdx];
  const q = currentItem?.question;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarnings((count) => count + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleFinalSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Format payload
      const payloadAnswers = Object.entries(answers).map(([questionId, studentAnswer]) => ({
        questionId,
        studentAnswer,
      }));

      const res = await fetch('/api/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers: payloadAnswers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onFinishSubmit(data.attemptSummary);
      } else {
        alert(data.error || 'Submission processing issue occurred.');
        onCancel();
      }
    } catch (err) {
      console.error('Submission failure', err);
      onCancel();
    } finally {
      setSubmitting(false);
    }
  }, [answers, attemptId, onCancel, onFinishSubmit, submitting]);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-submit instantly when countdown hits zero
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [handleFinalSubmit, timeLeft]);

  const handleOptionChange = (value: string) => {
    if (!q?.id) return;
    setAnswers((prev) => ({
      ...prev,
      [q.id]: value,
    }));
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300; // < 5 mins turns warning red

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col z-50 animate-fadeIn">
      {/* Sticky Premium Topbar */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse"></div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
              {testDetails?.title || 'Live Assessment Session'}
            </h1>
            <span className="text-[10px] text-slate-400 block">Distraction-free environment</span>
          </div>
        </div>

        {/* Persistent sticky countdown timer */}
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-colors ${
            isLowTime 
              ? 'bg-red-50 dark:bg-red-950/50 border-red-200 text-red-600 animate-pulse' 
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
            {isLowTime && <span className="text-[9px] uppercase font-sans">Warning</span>}
          </div>

          {tabWarnings > 0 && (
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              Focus warnings: {tabWarnings}
            </div>
          )}

          <button
            onClick={() => {
              if (confirm('Are you ready to finalize and submit all recorded candidate answers?')) {
                handleFinalSubmit();
              }
            }}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Send className="w-3 h-3" />
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </header>

      {/* Split-screen layout main block */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Question navigation grid */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
              Questions Navigation Grid
            </span>

            <div className="grid grid-cols-4 gap-2">
              {questionsList.map((item, idx) => {
                const qId = item.question?.id;
                const isAnswered = qId ? !!answers[qId] : false;
                const isActive = idx === currentIdx;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-10 h-10 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                      isActive
                        ? 'ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 scale-105'
                        : isAnswered
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick status map layout hints */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 inline-block"></span>
              <span>Answered Entry</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="w-3 h-3 rounded ring-2 ring-indigo-600 inline-block"></span>
              <span>Active Target</span>
            </div>
          </div>
        </aside>

        {/* Right pane: Current active candidate question text and option forms */}
        <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-8 flex flex-col justify-between overflow-y-auto">
          {currentItem ? (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {/* Prompt meta */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
                    Q{currentIdx + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Standard {currentItem.question?.grade || '10'} • {currentItem.question?.subject || 'Assessment'}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      ({currentItem.marks} Marks Weightage)
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  {q?.type || 'MCQ'} Format
                </span>
              </div>

              {/* Main Prompt Statement */}
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-900 dark:text-slate-100 font-medium text-sm leading-relaxed whitespace-pre-line">
                  {q?.content || 'Question Prompt Missing'}
                </p>
              </div>

              {/* Responsive Options Layout Mapping */}
              {q?.type === QuestionType.MCQ ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Select Corresponding Choice
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q?.options && Array.isArray(q.options) && q.options.map((optionText: string, oIdx: number) => {
                      const isSelected = q.id ? answers[q.id] === optionText : false;
                      const choiceLetter = String.fromCharCode(65 + oIdx);

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleOptionChange(optionText)}
                          className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100 font-bold shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {choiceLetter}
                          </span>
                          <span className="text-xs break-words leading-tight">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Subjective Input Response
                  </span>
                  <textarea
                    rows={6}
                    placeholder="Provide your highly structured complete steps or response narrative here..."
                    value={q?.id ? answers[q.id] || '' : ''}
                    onChange={(e) => handleOptionChange(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="m-auto text-slate-400 text-xs">No active loaded candidate entry.</div>
          )}

          {/* Navigation Action Helpers */}
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Item
            </button>

            <span className="text-[11px] font-semibold text-slate-400">
              Question {currentIdx + 1} of {questionsList.length}
            </span>

            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => Math.min(questionsList.length - 1, prev + 1))}
              disabled={currentIdx === questionsList.length - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              Next Item <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
