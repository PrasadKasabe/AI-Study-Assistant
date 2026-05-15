import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  ArrowRight,
  PlusCircle,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({ notes: 0, summaries: 0, chats: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, summariesRes, chatsRes] = await Promise.all([
          api.get('notes/'),
          api.get('summaries/'),
          api.get('chatbot/conversations/')
        ]);
        
        setStats({
          notes: notesRes.data.length,
          summaries: summariesRes.data.length,
          chats: chatsRes.data.length
        });
        setRecentNotes(notesRes.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse">Loading dashboard...</div>;

  const statCards = [
    { label: 'Uploaded Notes', value: stats.notes, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'AI Summaries', value: stats.summaries, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Conversations', value: stats.chats, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
  ];

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
