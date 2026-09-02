import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  User,
  Plus,
  Key,
  Globe,
  ExternalLink,
  Trash2,
  ChevronRight,
  Layers
} from 'lucide-react';
import { apiService } from '../services/api';

export default function LoginView({ onLoginSuccess, onExploreDemo, theme = 'dark', showToast }) {
  const [authMode, setAuthMode] = useState('accounts'); // 'accounts', 'oauth', 'app_password'
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authHelp, setAuthHelp] = useState('');
  const [existingAccounts, setExistingAccounts] = useState([]);
  const [isSlow, setIsSlow] = useState(false);

  // App Password Form State
  const [imapEmail, setImapEmail] = useState('');
  const [imapPassword, setImapPassword] = useState('');

  const isDark = theme === 'dark';

  const fetchAccounts = async () => {
    try {
      const users = await apiService.getAccounts();
      if (Array.isArray(users)) {
        setExistingAccounts(users);
        if (users.length === 0) {
          setAuthMode('oauth');
        } else {
          setAuthMode('accounts');
        }
      }
    } catch (e) {
      setAuthMode('oauth');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleGoogleSignIn = async (forceNew = true) => {
    setIsAuthenticating(true);
    setAuthError('');
    setAuthHelp('');
    setIsSlow(false);

    const slowTimer = setTimeout(() => {
      setIsSlow(true);
    }, 4000);

    try {
      const res = await apiService.loginWithGoogle(forceNew);
      clearTimeout(slowTimer);
      if (res.success) {
        const email = res.email || res.user?.email || 'Authorized User';
        if (showToast) {
          showToast(`✨ Successfully connected ${email}!`);
        }
        onLoginSuccess({
          email: email,
          name: res.user?.name || email.split('@')[0],
          picture: res.user?.picture || '',
          mode: 'oauth'
        });
      } else {
        setAuthError(res.message || 'Google authentication failed. Ensure credentials.json is present in project root.');
        setAuthHelp(res.help || '');
        if (showToast) {
          showToast(res.message || 'Authentication error', 'error');
        }
      }
    } catch (err) {
      clearTimeout(slowTimer);
      setAuthError('Connection error during Google OAuth authentication.');
    } finally {
      setIsAuthenticating(false);
      setIsSlow(false);
    }
  };

  const handleAppPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!imapEmail.trim() || !imapPassword.trim()) {
      setAuthError('Please enter both Gmail address and 16-character App Password.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError('');
    setAuthHelp('');

    try {
      const cleanPw = imapPassword.replace(/\s+/g, '').trim();
      const res = await apiService.connectGmail(imapEmail.trim(), cleanPw);
      if (res.success) {
        if (showToast) {
          showToast(`✨ Connected Gmail as ${imapEmail}!`);
        }
        onLoginSuccess({
          email: imapEmail.trim(),
          name: imapEmail.split('@')[0],
          picture: '',
          mode: 'imap'
        });
      } else {
        setAuthError(res.message || 'Gmail login failed. Check your App Password.');
        setAuthHelp(res.help || '');
      }
    } catch (err) {
      setAuthError('Error connecting to backend server.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSelectAccount = (account) => {
    if (showToast) {
      showToast(`Logged in as ${account.email}`);
    }
    onLoginSuccess({
      email: account.email,
      name: account.name || account.email.split('@')[0],
      picture: account.picture || '',
      mode: account.auth_mode || 'oauth'
    });
  };

  const handleRemoveAccount = async (e, email) => {
    e.stopPropagation();
    await apiService.removeAccount(email);
    if (showToast) {
      showToast(`Removed account ${email}`);
    }
    fetchAccounts();
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300 relative overflow-hidden ${
      isDark ? 'bg-[#09090b] text-white' : 'bg-[#FAFAFA] text-zinc-900'
    }`}>

      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[460px] z-10 space-y-5">
        
        {/* Brand Card */}
        <div className={`p-8 rounded-3xl border shadow-2xl relative backdrop-blur-xl transition-all ${
          isDark 
            ? 'bg-zinc-900/85 border-white/10 shadow-black/80' 
            : 'bg-white/95 border-black/10 shadow-zinc-300/60'
        }`}>
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-white border border-black/10 shadow-lg p-2 overflow-hidden">
              <img src="/logo.jpeg" alt="Sakha" className="h-full w-full object-contain" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                <span>Enterprise Workspace</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                Sign in to Sakha
              </h1>
              <p className={`text-xs mt-1.5 leading-relaxed max-w-xs mx-auto ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Multi-Tenant Sales Intelligence & AI Inbox Prioritization
              </p>
            </div>
          </div>

          {/* Mode Selector (if accounts exist) */}
          {existingAccounts.length > 0 && (
            <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMode('accounts'); setAuthError(''); setAuthHelp(''); }}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'accounts'
                    ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                    : (isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black')
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Accounts ({existingAccounts.length})</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('oauth'); setAuthError(''); setAuthHelp(''); }}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'oauth' || authMode === 'app_password'
                    ? (isDark ? 'bg-white text-black shadow-md' : 'bg-black text-white shadow-md')
                    : (isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black')
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Account</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {authError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold leading-snug">{authError}</div>
              </div>
              {authHelp && (
                <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed whitespace-pre-line ${
                  isDark ? 'bg-zinc-950/60 border-white/10 text-zinc-300' : 'bg-white border-black/10 text-zinc-700'
                }`}>
                  {authHelp}
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold"
                    >
                      <span>Open Google App Passwords page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slow Auth Helper Notification */}
          {isSlow && isAuthenticating && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-left leading-relaxed">
              💡 <strong>Google Login Window opened:</strong> Check your browser window to enter your Gmail email & password.
            </div>
          )}

          {/* VIEW 1: Existing Accounts Directory */}
          {authMode === 'accounts' && existingAccounts.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                {existingAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer hover:scale-[1.01] active:scale-98 shadow-sm ${
                      isDark 
                        ? 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-white' 
                        : 'bg-black/[0.03] hover:bg-black/[0.07] border-black/10 text-black'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black shrink-0 border border-emerald-500/30">
                        {acc.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{acc.name || acc.email.split('@')[0]}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-mono">
                            {acc.auth_mode || 'OAuth'}
                          </span>
                        </div>
                        <div className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{acc.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleRemoveAccount(e, acc.email)}
                        title="Remove account"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAuthMode('oauth')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  isDark 
                    ? 'border-white/10 hover:bg-white/5 text-zinc-300' 
                    : 'border-black/10 hover:bg-black/5 text-zinc-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another Gmail account</span>
              </button>
            </div>
          )}

          {/* VIEW 2: Google OAuth / Add Account */}
          {(authMode === 'oauth' || authMode === 'app_password') && (
            <div className="space-y-4">
              
              {/* Secondary Tab Switcher */}
              <div className="flex items-center justify-center gap-4 text-[11px] font-semibold border-b pb-2 border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setAuthMode('oauth')}
                  className={`pb-1 border-b-2 transition-all ${
                    authMode === 'oauth' 
                      ? 'border-emerald-500 text-emerald-400' 
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  Google OAuth (Browser)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('app_password')}
                  className={`pb-1 border-b-2 transition-all ${
                    authMode === 'app_password' 
                      ? 'border-emerald-500 text-emerald-400' 
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  Gmail App Password (Direct)
                </button>
              </div>

              {authMode === 'oauth' ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn(true)}
                    disabled={isAuthenticating}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all transform active:scale-98 shadow-lg border ${
                      isDark
                        ? 'bg-white text-zinc-900 hover:bg-zinc-100 border-white/20 shadow-white/10'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 border-black/10 shadow-zinc-400/40'
                    } ${isAuthenticating ? 'opacity-85 cursor-not-allowed' : ''}`}
                  >
                    {isAuthenticating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-current" />
                        <span>Opening Google Sign-In...</span>
                      </>
                    ) : (
                      <>
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

                  {isAuthenticating && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthenticating(false);
                        setIsSlow(false);
                      }}
                      className="w-full py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ) : (
                /* App Password Form */
                <form onSubmit={handleAppPasswordSubmit} className="space-y-3 text-left">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 px-1 ${
                      isDark ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      Gmail Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 opacity-40" />
                      <input
                        type="email"
                        required
                        placeholder="you@gmail.com"
                        value={imapEmail}
                        onChange={(e) => setImapEmail(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border transition-colors outline-none focus:border-emerald-500 ${
                          isDark ? 'bg-zinc-800/80 border-white/10 text-white' : 'bg-zinc-50 border-black/10 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1 px-1">
                      <label className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>
                        16-Character App Password
                      </label>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Get App Password</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 opacity-40" />
                      <input
                        type="password"
                        required
                        placeholder="abcd efgh ijkl mnop"
                        value={imapPassword}
                        onChange={(e) => setImapPassword(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border transition-colors outline-none focus:border-emerald-500 font-mono ${
                          isDark ? 'bg-zinc-800/80 border-white/10 text-white' : 'bg-zinc-50 border-black/10 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all transform active:scale-98 shadow-md border ${
                      isDark
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 border-emerald-400/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600/30'
                    }`}
                  >
                    {isAuthenticating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Connect & Sync Gmail</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Bypass */}
          <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={onExploreDemo}
              className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isDark 
                  ? 'text-zinc-400 hover:text-white hover:bg-white/5' 
                  : 'text-zinc-600 hover:text-black hover:bg-black/5'
              }`}
            >
              <span>Explore Curated Demo Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>

          {/* Security Guarantee */}
          <div className={`mt-5 pt-3 border-t flex items-center justify-center gap-2 text-[11px] ${
            isDark ? 'border-white/10 text-zinc-400' : 'border-black/10 text-zinc-500'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Strict Tenant Isolation: Data is never shared across accounts.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
