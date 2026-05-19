import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Mail, 
  Calendar, 
  Shield, 
  Bell, 
  Key, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  ChevronRight,
  ChevronDown,
  X,
  Camera,
  Pencil,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const photoInputRef = useRef(null);

  // Profile photo state — use full URL if it's a relative path from Django
  const resolvePhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseApi = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:8000';
    return `${baseApi}${url}`;
  };
  const [photoPreview, setPhotoPreview] = useState(resolvePhotoUrl(user?.profile_picture) || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoStatus, setPhotoStatus] = useState('');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.first_name || '');
  const [editLastName, setEditLastName] = useState(user?.last_name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });

  // API Keys state
  const [geminiKey, setGeminiKey] = useState(user?.gemini_api_key || '');
  const [groqKey, setGroqKey] = useState(user?.groq_api_key || '');
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyStatus, setKeyStatus] = useState({ type: '', message: '' });

  // Change Password state
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwStatus, setPwStatus] = useState({ type: '', message: '' });

  // Notifications state
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    summaryReady: true,
    weeklyDigest: false,
    productUpdates: true,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // Handle photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPhotoStatus('error: Max photo size is 5MB');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setUploadingPhoto(true);
    setPhotoStatus('');
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      const res = await api.patch('users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data);
      if (res.data.profile_picture) {
        setPhotoPreview(resolvePhotoUrl(res.data.profile_picture));
      }
      setPhotoStatus('success');
      setTimeout(() => setPhotoStatus(''), 2000);
    } catch (err) {
      setPhotoStatus('error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle profile info save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileStatus({ type: '', message: '' });
    try {
      const res = await api.patch('users/profile/', {
        username: editUsername,
        email: editEmail,
        first_name: editFirstName,
        last_name: editLastName,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      setUser(res.data);
      setProfileStatus({ type: 'success', message: 'Profile updated!' });
      setIsEditing(false);
      setTimeout(() => setProfileStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Profile update error:', err.response?.data);
      const data = err.response?.data || {};
      // Extract first error from any field
      const msg = data.username?.[0]
        || data.email?.[0]
        || data.first_name?.[0]
        || data.last_name?.[0]
        || data.detail
        || data.error
        || `Error ${err.response?.status || ''}: Failed to update profile.`;
      setProfileStatus({ type: 'error', message: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    setSaving(true);
    setKeyStatus({ type: '', message: '' });
    try {
      const res = await api.patch('users/profile/', {
        gemini_api_key: geminiKey,
        groq_api_key: groqKey
      });
      setUser(res.data);
      setKeyStatus({ type: 'success', message: 'API keys updated successfully!' });
      setTimeout(() => setKeyStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setKeyStatus({ type: 'error', message: 'Failed to update API keys.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }
    setChangingPw(true);
    setPwStatus({ type: '', message: '' });
    try {
      await api.post('users/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPwStatus({ type: 'success', message: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPwStatus({ type: '', message: '' });
        setShowPasswordPanel(false);
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to change password.';
      setPwStatus({ type: 'error', message: msg });
    } finally {
      setChangingPw(false);
    }
  };

  const handleSaveNotifications = () => {
    // Saved to localStorage (no backend endpoint needed for this preference)
    localStorage.setItem('notifSettings', JSON.stringify(notifSettings));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 card p-8">
        {/* Avatar with upload */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 bg-primary-100 rounded-full overflow-hidden flex items-center justify-center text-primary-600 text-5xl font-bold shadow-inner">
            {photoPreview
              ? <img src={photoPreview} alt="profile" className="w-full h-full object-cover" />
              : <span>{user.username[0].toUpperCase()}</span>
            }
          </div>
          {/* Camera overlay */}
          <button
            onClick={() => photoInputRef.current?.click()}
            className="absolute bottom-1 right-1 w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            title="Change photo"
          >
            {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          {photoStatus === 'success' && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </span>
          )}
        </div>

        {/* User info */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-3xl font-bold text-slate-900">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="Edit profile"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          {user.first_name && <p className="text-sm text-slate-400">@{user.username}</p>}
          <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-4 h-4" />
            {user.email}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary-600" /> Edit Profile
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">First Name</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={e => setEditFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Last Name</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={e => setEditLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              {profileStatus.message && (
                <div className={`md:col-span-2 p-3 rounded-xl flex items-center gap-2 text-sm ${
                  profileStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {profileStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {profileStatus.message}
                </div>
              )}
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={savingProfile} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary px-6 py-3">Cancel</button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-8">

        {/* AI API Keys */}
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
                <button type="button" onClick={() => setShowGemini(!showGemini)} className="text-primary-600 text-xs flex items-center gap-1">
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
                <button type="button" onClick={() => setShowGroq(!showGroq)} className="text-primary-600 text-xs flex items-center gap-1">
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

            {keyStatus.message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${keyStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {keyStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {keyStatus.message}
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save API Keys'}
            </button>
          </form>
        </section>

        {/* Security & Preferences */}
        <section className="card p-8 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-100 pb-4">
            <Shield className="w-5 h-5" />
            <h2>Security & Preferences</h2>
          </div>

          {/* Change Password Row */}
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <button
              onClick={() => { setShowPasswordPanel(!showPasswordPanel); setShowNotifPanel(false); }}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-slate-700">
                <Lock className="w-5 h-5 text-slate-400" />
                <span className="font-medium">Change Password</span>
              </div>
              {showPasswordPanel ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            <AnimatePresence>
              {showPasswordPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleChangePassword} className="p-5 pt-0 space-y-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-600">Current Password</label>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-primary-600 hover:underline font-medium"
                        >
                          Forgot current password?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className={`w-full bg-white border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all ${
                          confirmPassword && newPassword !== confirmPassword ? 'border-red-300' : 'border-slate-200'
                        }`}
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    {pwStatus.message && (
                      <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${pwStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {pwStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {pwStatus.message}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button type="submit" disabled={changingPw} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                        {changingPw && <Loader2 className="w-4 h-4 animate-spin" />}
                        {changingPw ? 'Updating...' : 'Update Password'}
                      </button>
                      <button type="button" onClick={() => setShowPasswordPanel(false)} className="btn-secondary px-4 py-2.5">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications Row */}
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <button
              onClick={() => { setShowNotifPanel(!showNotifPanel); setShowPasswordPanel(false); }}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-slate-700">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="font-medium">Notifications</span>
              </div>
              {showNotifPanel ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                    {[
                      { key: 'summaryReady', label: 'Summary Ready', desc: 'Get notified when your AI summary is generated' },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your study activity' },
                      { key: 'productUpdates', label: 'Product Updates', desc: 'News about new features and improvements' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{label}</p>
                          <p className="text-xs text-slate-400">{desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifSettings(s => ({ ...s, [key]: !s[key] }))}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${notifSettings[key] ? 'bg-primary-600' : 'bg-slate-200'}`}
                        >
                          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${notifSettings[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    ))}

                    <button onClick={handleSaveNotifications} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                      {notifSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
                      {notifSaved ? 'Saved!' : 'Save Preferences'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
