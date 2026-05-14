'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Sparkles, Key, Mail, User, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Student' | 'Teacher' | 'Admin'>('Student');
  
  // UX states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prefillEmail = params.get('email');
      const targetRedirect = params.get('redirect');
      if (prefillEmail) {
        setEmail(prefillEmail);
      }
      if (targetRedirect) {
        setRedirectUrl(targetRedirect);
      }
    }
  }, []);

  // Quick fill macro helpers for rapid demoability
  const handleQuickFill = (targetEmail: string, targetPass: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setIsLogin(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        // Authenticate using NextAuth credentials provider
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setErrorMsg('Invalid email or password credentials provided.');
        } else {
          setSuccessMsg('Authentication successful! Initializing user workspace session...');
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 600);
        }
      } else {
        // Register new account
        if (!name || !email || !password) {
          setErrorMsg('Please fill out all required fields to register.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccessMsg(`Account created successfully as ${role}! Please log in.`);
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMsg('');
            // Pre-fill password for effortless onboarding flow
          }, 1200);
        } else {
          setErrorMsg(data.error || 'Failed to complete registration workflow.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg('An unexpected network interruption occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-12 font-sans overflow-y-auto">
      {/* Decorative dynamic ambient glow blooms */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10 space-y-6">
        
        {/* Top Header branding branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            EdTech Platform Access
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Secure authentication portal for administrators, instructors, and target candidates.
          </p>
        </div>

        {/* View Switcher Controls Toggle */}
        <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isLogin 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Account Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isLogin 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Sign Up
          </button>
        </div>

        {/* Quick Click Automated Credentials Macro Array */}
        {isLogin && (
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
              ⚡ Effortless Testing Pre-fills:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('ashish@admin.com', 'admin123')}
                className="p-1.5 text-left rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
              >
                <span className="font-bold text-white block">Ashish Shaw</span>
                <span className="text-[9px] text-indigo-400 block">Admin Role</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('dilip@admin.com', 'admin123')}
                className="p-1.5 text-left rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
              >
                <span className="font-bold text-white block">Dilip Shah</span>
                <span className="text-[9px] text-indigo-400 block">Admin Role</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student1@edtech.com', 'student123')}
                className="p-1.5 text-left rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
              >
                <span className="font-bold text-white block">Amit Patel</span>
                <span className="text-[9px] text-emerald-400 block">Demo Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student2@edtech.com', 'student123')}
                className="p-1.5 text-left rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
              >
                <span className="font-bold text-white block">Priya Sharma</span>
                <span className="text-[9px] text-emerald-400 block">Demo Student</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Alerts Form Blocks */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs text-center animate-fadeIn">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1 animate-fadeIn">
              <label className="block text-xs font-medium text-slate-400">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="account@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1 animate-fadeIn">
              <label className="block text-xs font-medium text-slate-400">Target Role Registration</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="Student">Student Candidate</option>
                  <option value="Teacher">Teacher / Instructor</option>
                  <option value="Admin">Platform Administrator</option>
                </select>
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                * Note: Real production environments restrict open admin selection. Enabled here for testing access.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isLogin ? 'Securely Sign In' : 'Create Student Access'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-800">
          <p className="text-[11px] text-slate-500">
            Powered by standard NextAuth.js App Router integrations.
          </p>
        </div>
      </div>
    </div>
  );
}
