import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { CreditCard, LogIn, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL ? 
      import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#0b0f19] transition-colors duration-200">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-dark-border dark:bg-dark-card/90 transition-all duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
            <CreditCard size={24} />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Welcome to SmartSpend
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            An automated dashboard to analyze transactions directly from your bank alerts.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:hover:bg-dark-border transition-all duration-200"
          >
            {/* Google Vector Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.03-1.38-1.21-2.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-8 flex items-start gap-2.5 rounded-2xl bg-indigo-50/50 p-4 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 text-xs">
          <LogIn size={16} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            By signing in, we only request standard profile permissions. You can separately connect your Gmail inbox for transaction scanning in the settings dashboard.
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
            <ShieldAlert size={14} />
            <span>OAuth process failed or denied. Please try again.</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
