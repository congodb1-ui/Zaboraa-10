import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Sliders,
  LogOut,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdmin,
    setIsAdmin,
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    verifyAdminPasscode,
    setIsCustomizerOpen,
    setIsWatermarkModalOpen
  } = useCustomization();

  const { signInWithGoogle, user } = useAuth();

  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setErrorMsg('Please enter the architect admin passcode');
      return;
    }

    const isValid = verifyAdminPasscode(passcode);
    if (isValid) {
      setErrorMsg('');
      setSuccessMsg('Access granted! Full control unlocked.');
      setTimeout(() => {
        setIsAdminLoginModalOpen(false);
        setSuccessMsg('');
        setPasscode('');
      }, 1000);
    } else {
      setErrorMsg('Invalid admin passcode. Please verify your credentials and try again.');
    }
  };

  const handleGoogleAdminSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    try {
      const loggedUser = await signInWithGoogle();
      // Unlock admin mode for the authenticated architect session
      setIsAdmin(true);
      try {
        localStorage.setItem('zaboraa_admin_session', 'active');
      } catch {}
      setSuccessMsg(`Welcome, ${loggedUser.displayName || 'Architect'}! Admin privileges unlocked via Google Auth.`);
      setTimeout(() => {
        setIsAdminLoginModalOpen(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication was unable to complete.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem('zaboraa_admin_session');
    } catch {}
    setIsAdminLoginModalOpen(false);
    setPasscode('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        data-theme-container="dark"
        className="dark-card dark-feature-container relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${isAdmin ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'}`}>
              {isAdmin ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAdmin ? 'Admin Control Center' : 'Architect Access Portal'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAdmin ? 'Admin Mode: Wasim Sayyed (Full Control)' : 'Client Protection: Read-Only Mode'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAdmin ? (
          /* Already Logged In / Admin State */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Admin Mode is Active:</strong> You have full control to edit platform sections, upload architecture diagrams, configure watermarks, customize architecture runbooks, and manage founder portraits.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdminLoginModalOpen(false);
                  setIsCustomizerOpen(true);
                }}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Site Customizer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAdminLoginModalOpen(false);
                  setIsWatermarkModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Watermark Settings</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Exit to Public Client View</span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock & Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Form for Admin */
          <div className="space-y-4">
            {/* 1. Quick Sign in with Google Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleAdminSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer hover:scale-101"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleLoading ? 'Verifying with Google...' : 'Sign In with Google (Admin)'}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase font-mono">Or enter passcode</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Enter Admin Passcode</span>
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Enter architect admin passcode"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Restricted Access</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminLoginModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Unlock Admin
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
