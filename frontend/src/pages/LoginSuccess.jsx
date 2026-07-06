import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

const LoginSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      navigate('/dashboard');
    } else {
      navigate('/login?error=no_token');
    }
  }, [login, navigate, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
      <Loader2 size={36} className="animate-spin text-indigo-600" />
      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Finalizing authentication...
      </p>
    </div>
  );
};

export default LoginSuccess;
