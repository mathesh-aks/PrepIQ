import React, { useState } from 'react';
import { X, Rocket, CheckCircle2 } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function WaitlistModal({ isOpen, onClose, message }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    localStorage.setItem('prepiq_waitlist_email', email);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-[#1e2d47] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center">
          {isSubmitted ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 bg-[#1e2d47] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
              </div>
              <h2 className="text-2xl font-bold text-white">You're on the list!</h2>
              <p className="text-slate-400">
                We'll email you when Pro launches.
              </p>
              <button 
                onClick={onClose}
                className="mt-6 w-full bg-[#1e2d47] hover:bg-[#2a3f63] text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#1e2d47] rounded-full flex items-center justify-center mx-auto">
                <Rocket className="w-8 h-8 text-[#3b82f6]" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {message || "PrepIQ Pro is coming soon! 🚀"}
                </h2>
                <p className="text-slate-400">
                  Enter your email to be first in line and get 3 months free.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-lg border border-[#1e2d47] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors bg-[#0a0e1a] text-white placeholder:text-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!email.trim()}
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Notify Me
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
