import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Bell, 
  Settings, 
  Key, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [geminiKey, setGeminiKey] = useState(user?.gemini_api_key || '');
  const [groqKey, setGroqKey] = useState(user?.groq_api_key || '');
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await api.patch('users/profile/', {
        gemini_api_key: geminiKey,
        groq_api_key: groqKey
      });
      setUser(res.data);
      setStatus({ type: 'success', message: 'API keys updated successfully!' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to update API keys.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-8 card p-8">
        <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-5xl font-bold shadow-inner">
          {user.username[0].toUpperCase()}
        </div>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">{user.username}</h1>
          <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-4 h-4" />
            {user.email}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Active Plan: Free</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="card p-8 space-y-6">
          <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-100 pb-4">
            <Settings className="w-5 h-5" />
            <h2>Account Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Username</label>
              <input type="text" disabled value={user.username} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Email Address</label>
              <input type="email" disabled value={user.email} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
            </div>
            <button className="btn-primary w-full py-3 opacity-50 cursor-not-allowed">Save Changes</button>
          </div>
        </section>

        <section className="card p-8 space-y-6">
          <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-100 pb-4">
            <Key className="w-5 h-5 text-primary-600" />
            <h2>AI API Configuration (BYOK)</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your own API keys to avoid shared rate limits. Leave blank to use the system default keys.
          </p>
          
          <form onSubmit={handleSaveKeys} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex justify-between">
                Google Gemini API Key
                <button 
                  type="button" 
                  onClick={() => setShowGemini(!showGemini)}
                  className="text-primary-600 hover:text-primary-700 text-xs flex items-center gap-1"
                >
                  {showGemini ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showGemini ? 'Hide' : 'Show'}
                </button>
              </label>
              <input 
                type={showGemini ? "text" : "password"} 
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..." 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex justify-between">
                Groq API Key
                <button 
                  type="button" 
                  onClick={() => setShowGroq(!showGroq)}
                  className="text-primary-600 hover:text-primary-700 text-xs flex items-center gap-1"
                >
                  {showGroq ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showGroq ? 'Hide' : 'Show'}
                </button>
              </label>
              <input 
                type={showGroq ? "text" : "password"} 
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..." 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              />
            </div>

            {status.message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {status.message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save API Keys'}
            </button>
          </form>
        </section>

        <section className="card p-8 space-y-6">
          <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-100 pb-4">
            <Shield className="w-5 h-5" />
            <h2>Security & Preferences</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700">
                <Lock className="w-5 h-5 text-slate-400" />
                <span>Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700">
                <Bell className="w-5 h-5 text-slate-400" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

// Simple Chevron component for the buttons above
const ChevronRight = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
const Lock = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

export default ProfilePage;
