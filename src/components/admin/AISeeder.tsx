'use client';

import React, { useState } from 'react';
import { Bot, Save, Edit3, CheckCircle2, AlertCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';

type DiffKey = 'Easy' | 'Medium' | 'Hard' | 'Olympiad';

interface GeneratedQuestion {
  board: string;
  grade: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: DiffKey;
  type: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function AISeederPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
  
  // Form State
  const [board, setBoard] = useState('ICSE');
  const [grade, setGrade] = useState('9');
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('Algebra');
  const [topic, setTopic] = useState('Factorisation');
  const [concept, setConcept] = useState('');
  
  // Manual Mode Counts
  const [diffCounts, setDiffCounts] = useState<Record<DiffKey, number>>({ Easy: 0, Medium: 3, Hard: 0, Olympiad: 0 });

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Review State
  const [reviewQuestions, setReviewQuestions] = useState<GeneratedQuestion[]>([]);

  const handleGenerate = async (mode: 'manual' | 'auto') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setReviewQuestions([]);

    const countsToGenerate = mode === 'auto' 
      ? { Easy: 3, Medium: 3, Hard: 2, Olympiad: 2 } 
      : diffCounts;

    const allGenerated: GeneratedQuestion[] = [];

    try {
      for (const [diff, count] of Object.entries(countsToGenerate)) {
        if (count > 0) {
          const res = await fetch('/api/questions/ai-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              board, grade, subject, chapter, topic, concept, difficulty: diff, count
            })
          });

          if (!res.ok) throw new Error(`Failed to generate ${diff} questions`);
          
          const data = await res.json();
          const qs = data.questions.map((q: any) => ({
            ...q, board, grade, subject, chapter, topic, difficulty: diff, type: 'MCQ'
          }));
          
          allGenerated.push(...qs);
        }
      }
      
      setReviewQuestions(allGenerated);
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDb = async () => {
    if (reviewQuestions.length === 0) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: reviewQuestions })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(`Successfully imported ${reviewQuestions.length} questions to the database!`);
      setReviewQuestions([]);
    } catch (err: any) {
      setError(err.message || 'Failed to save to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Curriculum Seeder</h1>
          <p className="text-slate-500 text-sm">Generate and review high-quality questions using Gemini AI</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('manual')} className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 ${activeTab === 'manual' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Edit3 className="w-4 h-4" /> Assisted Review Mode
        </button>
        <button onClick={() => setActiveTab('auto')} className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 ${activeTab === 'auto' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Wand2 className="w-4 h-4" /> Auto Pattern Mode (3-3-2-2)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800">Target Curriculum</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Board</label>
              <input value={board} onChange={e=>setBoard(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-semibold" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Grade</label>
              <input value={grade} onChange={e=>setGrade(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-semibold" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Subject</label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-semibold" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Chapter</label>
            <input value={chapter} onChange={e=>setChapter(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-semibold" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Topic</label>
            <input value={topic} onChange={e=>setTopic(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-semibold" />
          </div>

          {activeTab === 'manual' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Specific Concept (Optional)</label>
                <textarea value={concept} onChange={e=>setConcept(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-semibold" rows={2} placeholder="e.g. Expansion using identities" />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 block mb-2">Quantities to Generate</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Easy', 'Medium', 'Hard', 'Olympiad'] as DiffKey[]).map(d => (
                    <div key={d} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs font-bold text-slate-600">{d}</span>
                      <input type="number" min={0} max={10} value={diffCounts[d]} onChange={e => setDiffCounts(prev => ({...prev, [d]: Number(e.target.value)}))} className="w-12 p-1 text-center border rounded text-xs font-bold" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'auto' && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
              Auto mode will strictly generate a <strong>3 Easy, 3 Medium, 2 Hard, 2 Olympiad</strong> pattern for this topic.
            </div>
          )}

          <button 
            disabled={loading} 
            onClick={() => handleGenerate(activeTab)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Questions
          </button>

          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /> {success}</div>}
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          {reviewQuestions.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              <Bot className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-semibold">Generated questions will appear here for review</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900">Review Questions ({reviewQuestions.length})</h3>
                  <p className="text-xs text-slate-500">Please verify the correctness before saving</p>
                </div>
                <button disabled={loading} onClick={handleSaveToDb} className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save to Database
                </button>
              </div>

              {reviewQuestions.map((q, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-slate-100 text-[10px] font-bold text-slate-500 px-2 py-1 rounded-bl-lg uppercase tracking-wider border-b border-l border-slate-200">
                    {q.difficulty}
                  </div>
                  <div className="pr-16">
                    <span className="font-bold text-indigo-600 mr-2">Q{idx+1}.</span>
                    <span className="font-semibold text-slate-800 text-sm">{q.content}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`p-3 text-sm rounded-lg border ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {opt} {opt === q.correctAnswer && <CheckCircle2 className="w-4 h-4 inline ml-2 text-emerald-500" />}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider block mb-1">Explanation</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
