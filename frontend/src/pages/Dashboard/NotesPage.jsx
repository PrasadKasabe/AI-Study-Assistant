import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileText, 
  Search, 
  Trash2, 
  Brain, 
  MessageSquare,
  MoreVertical,
  Plus,
  Loader2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('notes/');
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`notes/${id}/`);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Notes</h1>
          <p className="text-slate-500">Manage and explore your uploaded study materials.</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-5 h-5" />
          Upload New
        </Link>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your notes..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="card group hover:border-primary-300 relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary-50 text-slate-400 group-hover:text-primary-600 transition-colors">
                    <FileText className="w-8 h-8" />
                  </div>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary-600 truncate">{note.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link 
                      to={`/summary/${note.id}`} 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                    >
                      <Brain className="w-4 h-4" />
                      Summary
                    </Link>
                    <Link 
                      to={`/chat`}
                      className="flex items-center justify-center p-2.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all border border-transparent hover:border-primary-100"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredNotes.length === 0 && (
        <div className="text-center py-20 card bg-white/50 border-dashed border-2">
          <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">No notes found.</p>
          <Link to="/upload" className="text-primary-600 font-bold mt-2 inline-block">Upload your first note</Link>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
