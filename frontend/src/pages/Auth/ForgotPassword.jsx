import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Sparkles, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
      await axios.post(`${apiBase}users/password-reset/`, { email });
      setIsSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-3xl text-primary-600 mb-4">
            <Sparkles className="w-8 h-8 fill-primary-600" />
            <span>StudyAI</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
          <p className="text-slate-600">No worries, we'll send you reset instructions.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
                <p className="text-slate-600">
                  We've sent a password reset link to <span className="font-medium text-slate-900">{email}</span>
                </p>
              </div>
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">
                During development, the link is printed to the backend console.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-600 font-medium hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
