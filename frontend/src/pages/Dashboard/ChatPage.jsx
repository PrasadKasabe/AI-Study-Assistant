import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare,
  ChevronRight,
  Plus,
  X,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notes, setNotes] = useState([]);
  const [showNoteSelect, setShowNoteSelect] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchNotes();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetail(conversationId);
    } else {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('chatbot/conversations/');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get('notes/');
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConversationDetail = async (id) => {
    try {
      const res = await api.get(`chatbot/conversations/${id}/`);
      setCurrentConversation(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation || isTyping) return;

    const userMsg = { role: 'user', message: input };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('chatbot/messages/', {
        conversation: currentConversation.id,
        message: userInput
      });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      let errorMessage = "Sorry, I encountered an error. Please try again later.";
      if (err.response?.data?.error) {
        if (err.response.data.error.includes("429") || err.response.data.error.includes("Quota exceeded") || err.response.data.error.includes("rate_limit_exceeded")) {
          errorMessage = "API Rate Limit Exceeded: The free tier quota for the API has been reached. Please try again later.";
        } else {
          errorMessage = `Error: ${err.response.data.error}`;
        }
      }
      setMessages(prev => [...prev, { role: 'ai', message: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = async (noteId) => {
    const note = notes.find(n => n.id === noteId);
    try {
      const res = await api.post('chatbot/conversations/', {
        note: noteId,
        title: `Chat about ${note.title}`
      });
      fetchConversations();
      setShowNoteSelect(false);
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-95px)] md:h-[calc(100vh-120px)] bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {/* Chat Sidebar */}
      <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100">
          <button 
            onClick={() => setShowNoteSelect(true)}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${
                conversationId == conv.id ? 'bg-white shadow-sm border border-slate-100 text-primary-600' : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${conversationId == conv.id ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`} />
              <span className="truncate text-sm font-medium">{conv.title}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative ${conversationId ? 'flex' : 'hidden md:flex'}`}>
        {!conversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-600 mb-6">
              <Bot className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Your AI Study Assistant</h2>
            <p className="text-slate-500 max-w-sm mt-2">Select a conversation or start a new one to ask questions about your notes.</p>
            <button 
              onClick={() => setShowNoteSelect(true)}
              className="mt-6 btn-secondary"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Link 
                  to="/chat" 
                  className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors -ml-2"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 truncate max-w-[150px] xs:max-w-none">{currentConversation?.title}</h3>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    AI Online
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50/30">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white shadow-sm border border-slate-100 text-primary-600'
                    }`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`p-3.5 md:p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white shadow-md rounded-tr-none' 
                        : 'bg-white shadow-sm border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%] md:max-w-[80%]">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 text-primary-600 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="p-3.5 md:p-4 rounded-2xl bg-white shadow-sm border border-slate-100 rounded-tl-none">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your notes..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="btn-primary p-3 md:p-4 rounded-xl md:rounded-2xl disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  <Send className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* Note Selector Modal */}
        <AnimatePresence>
          {showNoteSelect && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Select a Note</h3>
                  <button onClick={() => setShowNoteSelect(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {notes.length > 0 ? notes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => startNewChat(note.id)}
                      className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-all flex items-center gap-3"
                    >
                      <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-slate-700 truncate">{note.title}</span>
                    </button>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm">No notes found. Upload one first!</p>
                      <Link to="/upload" className="text-primary-600 font-bold mt-2 inline-block">Upload Note</Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatPage;
