import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  ArrowRight,
  PlusCircle,
  Brain,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ notes: 0, summaries: 0, chats: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, summariesRes, chatsRes, analyticsRes] = await Promise.all([
          api.get('notes/'),
          api.get('summaries/'),
          api.get('chatbot/conversations/'),
          api.get('notes/analytics/'),
        ]);
        
        setStats({
          notes: notesRes.data.length,
          summaries: summariesRes.data.length,
          chats: chatsRes.data.length
        });
        setRecentNotes(notesRes.data.slice(0, 3));
        setChartData(analyticsRes.data.chart_data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl" />
    </div>
  );

  const statCards = [
    { label: 'Uploaded Notes', value: stats.notes, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'AI Summaries', value: stats.summaries, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Conversations', value: stats.chats, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const hasActivity = chartData.some(d => d.notes > 0 || d.summaries > 0);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card flex items-center gap-6"
          >
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity Chart */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Study Activity</h2>
            <p className="text-xs text-slate-400">Last 7 days</p>
          </div>
        </div>

        {hasActivity ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSummaries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: '12px' }}
                labelStyle={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
              <Area type="monotone" dataKey="notes" name="Notes Uploaded" stroke="#6366f1" strokeWidth={2} fill="url(#colorNotes)" dot={{ r: 3, fill: '#6366f1' }} />
              <Area type="monotone" dataKey="summaries" name="Summaries" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorSummaries)" dot={{ r: 3, fill: '#8b5cf6' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <TrendingUp className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">No activity yet this week.</p>
            <Link to="/upload" className="text-primary-600 text-sm font-semibold hover:underline">Upload your first note →</Link>
          </div>
        )}
      </motion.section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Notes */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recent Notes</h2>
            <Link to="/notes" className="text-primary-600 hover:underline text-sm font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <div key={note.id} className="card p-4 flex items-center justify-between hover:border-primary-200 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-primary-600">{note.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link to={`/summary/${note.id}`} className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg">
                    <Brain className="w-5 h-5" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="card text-center py-10 text-slate-500">
                <p>No notes uploaded yet.</p>
                <Link to="/upload" className="text-primary-600 mt-2 inline-block">Upload your first note</Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="grid gap-4">
            <Link to="/upload" className="flex items-center gap-4 p-6 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl text-white hover:shadow-lg transition-all transform hover:-translate-y-1">
              <PlusCircle className="w-10 h-10 opacity-80" />
              <div>
                <h3 className="font-bold text-lg">Upload New Note</h3>
                <p className="text-white/80 text-sm">PDF or Text files supported</p>
              </div>
            </Link>
            <Link to="/chat" className="flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl text-slate-800 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <MessageSquare className="w-10 h-10 text-primary-600" />
              <div>
                <h3 className="font-bold text-lg">Chat with AI</h3>
                <p className="text-slate-500 text-sm">Ask questions from your notes</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
