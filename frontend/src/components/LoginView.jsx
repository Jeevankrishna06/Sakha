import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Database, 
  Zap, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';

export default function LoginView({ onLoginSuccess, onExploreDemo, theme = 'dark', showToast }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const isDark = theme === 'dark';

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const res = await apiService.loginWithGoogle();
      if (res.success) {
        if (showToast) {
          showToast(`✨ Signed in successfully as ${res.email || 'Google User'}!`);
        }
        onLoginSuccess({
          email: res.email || 'jeevankrishna675@gmail.com',
          mode: 'oauth'
        });
      } else {
        setAuthError(res.message || 'Google OAuth failed. Ensure credentials.json is configured.');
        if (showToast) {
          showToast(res.message || 'Authentication error', 'error');
        }
      }
    } catch (err) {
      setAuthError('Connection error during Google OAuth authentication.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300 relative overflow-hidden ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-[#FAFAFA] text-zinc-900'
    }`}>

      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Brand Card */}
        <div className={`p-8 rounded-3xl border text-center shadow-2xl relative backdrop-blur-xl ${
          isDark 
            ? 'bg-zinc-900/80 border-white/10 shadow-black/60' 
            : 'bg-white/90 border-black/10 shadow-zinc-300/50'
        }`}>
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-white border border-black/10 shadow-lg p-2 overflow-hidden">
              <img src="/logo.jpeg" alt="Sakha" className="h-full w-full object-contain" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                <span>AI Sales Follow-Up Agent</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Welcome to Sakha
              </h1>
              <p className={`text-xs mt-1.5 leading-relaxed max-w-xs mx-auto ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Proactive inbox intelligence that prioritizes high-value sales deals and drafts context-aware follow-ups.
              </p>
            </div>
          </div>

          {/* Value Props Pills */}
          <div className="grid grid-cols-2 gap-2 text-left mb-6 text-[11px]">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              isDark ? 'bg-white/[0.03] border-white/5 text-zinc-300' : 'bg-black/[0.02] border-black/5 text-zinc-700'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium">OAuth 2.0 Ingestion</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              isDark ? 'bg-white/[0.03] border-white/5 text-zinc-300' : 'bg-black/[0.02] border-black/5 text-zinc-700'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium">1-10 Urgency Scoring</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              isDark ? 'bg-white/[0.03] border-white/5 text-zinc-300' : 'bg-black/[0.02] border-black/5 text-zinc-700'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium">Local RAG Copilot</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              isDark ? 'bg-white/[0.03] border-white/5 text-zinc-300' : 'bg-black/[0.02] border-black/5 text-zinc-700'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium">Human-in-the-Loop</span>
            </div>
          </div>

          {/* Error Banner if any */}
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{authError}</div>
            </div>
          )}

          {/* Primary Action: Sign In With Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all transform active:scale-98 shadow-lg border ${
                isDark
                  ? 'bg-white text-zinc-900 hover:bg-zinc-100 border-white/20 shadow-white/10'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 border-black/10 shadow-zinc-400/40'
              } ${isAuthenticating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-current" />
                  <span>Connecting to Google OAuth...</span>
                </>
              ) : (
                <>
                  {/* Official Google 'G' Icon */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Quick Demo Bypass */}
            <button
              type="button"
              onClick={onExploreDemo}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isDark 
                  ? 'text-zinc-400 hover:text-white hover:bg-white/5' 
                  : 'text-zinc-600 hover:text-black hover:bg-black/5'
              }`}
            >
              <span>Explore Curated Demo Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className={`mt-6 pt-4 border-t flex items-center justify-center gap-2 text-[11px] ${
            isDark ? 'border-white/10 text-zinc-400' : 'border-black/10 text-zinc-500'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Privacy First: Vectors computed locally. Sakha never sends emails automatically.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
