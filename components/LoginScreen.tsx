import React, { useState } from 'react';
import { getUsers } from '../services/mockDb';
import { SystemUser } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: SystemUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      const users = getUsers();
      // Auth check
      const inputId = email.trim();
      const user = users.find(u => u.email.toLowerCase() === inputId.toLowerCase());

      if (user) {
        if (user.status === 'INACTIVE') {
           setError('Account is inactive. Contact admin.');
           setIsLoading(false);
           return;
        }

        // Specific password check for Admin
        if (inputId === 'Admin' && password !== 'admin') {
            setError('Invalid password.');
            setIsLoading(false);
            return;
        }

        onLogin(user);
      } else {
        setError('Invalid credentials.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-shark-950 flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-gradient-to-t from-shark-950 via-shark-900/80 to-shark-900/40"></div>
       
       <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-in-up">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-teal-500 rounded-xl mx-auto flex items-center justify-center text-3xl font-bold text-shark-950 mb-4 shadow-lg shadow-teal-500/20">
                S
             </div>
             <h1 className="text-2xl font-bold text-white tracking-wide">SHARK ISLAND</h1>
             <p className="text-shark-200 text-sm mt-1">Operations System Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
             <div>
                <label className="block text-xs font-bold text-shark-300 uppercase mb-2">Email or Username</label>
                <input 
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-shark-900/50 border border-shark-700 rounded-xl px-4 py-3 text-white placeholder-shark-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Admin or email address"
                />
             </div>
             
             <div>
                <label className="block text-xs font-bold text-shark-300 uppercase mb-2">Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-shark-900/50 border border-shark-700 rounded-xl px-4 py-3 text-white placeholder-shark-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
             </div>

             {error && (
               <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 text-red-200 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
               </div>
             )}

             <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-shark-950 font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
             </button>
          </form>

          <div className="mt-8 text-center text-xs text-shark-500">
             Authorized personnel only. <br/>System activity is monitored.
             
             <div className="mt-6 pt-6 border-t border-white/5 opacity-70">
                Powered by <a href="https://www.intouranex.com/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 font-bold transition-colors">IntouraNex</a>
             </div>
          </div>
       </div>
    </div>
  );
};