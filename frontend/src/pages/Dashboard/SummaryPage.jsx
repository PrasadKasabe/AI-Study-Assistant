import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Brain, 
  ListChecks, 
  HelpCircle, 
  Download, 
  Copy, 
  Check, 
  ChevronLeft,
  Loader2,
  FileText,
  AlignLeft,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryPage = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryType, setSummaryType] = useState('detailed');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async (type, isToggle = false) => {
    if (isToggle) setToggling(true);
    else setLoading(true);
    setError(null);
    try {
      if (!note && !isToggle) {
        const noteRes = await api.get(`notes/${noteId}/`);
        setNote(noteRes.data);
      }
      const summaryRes = await api.post('summaries/', { note: noteId, summary_type: type });
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
      let errorMessage = "Failed to load summary.";
      if (err.response?.data?.error) {
        if (err.response.data.error.includes("429") || err.response.data.error.includes("Quota exceeded") || err.response.data.error.includes("rate_limit_exceeded")) {
          errorMessage = "API Rate Limit Exceeded: The free tier quota for the API has been reached. Please try again later.";
        } else {
          errorMessage = err.response.data.error;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setToggling(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const noteRes = await api.get(`notes/${noteId}/`);
        setNote(noteRes.data);
        const summaryRes = await api.post('summaries/', { note: noteId, summary_type: summaryType });
        setSummary(summaryRes.data);
      } catch (err) {
        let errorMessage = "Failed to load summary.";
        if (err.response?.data?.error) {
          if (err.response.data.error.includes("429") || err.response.data.error.includes("Quota exceeded") || err.response.data.error.includes("rate_limit_exceeded")) {
            errorMessage = "API Rate Limit Exceeded: Please try again later.";
          } else {
            errorMessage = err.response.data.error;
          }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [noteId]);

  const handleToggle = async (type) => {
    if (type === summaryType || toggling) return;
    setSummaryType(type);
    setToggling(true);
    setError(null);
    try {
      const summaryRes = await api.post('summaries/', { note: noteId, summary_type: type });
      setSummary(summaryRes.data);
    } catch (err) {
      setError("Failed to switch summary type. Please try again.");
    } finally {
      setToggling(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = `${summary.content}\n\nKey Points:\n${summary.key_points}\n\nQuestions:\n${summary.important_questions}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!summary) return;
    setIsDownloading(true);
    try {
      const response = await api.get(`summaries/${summary.id}/export/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StudyAI_Summary_${summary.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">AI is analyzing your notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link to="/notes" className="mt-4 inline-block btn-secondary">Back to Notes</Link>
        </div>
      </div>
    );
  }

  if (!note || !summary) return <div>Error loading summary.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/notes" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Back to Notes
        </Link>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleCopy}
            className="btn-secondary flex items-center gap-2 py-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy All'}
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="btn-primary flex items-center gap-2 py-2 disabled:opacity-70"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{note.title}</h1>
            <p className="text-slate-500">AI-Generated Summary & Insights</p>
          </div>
        </div>

        {/* Summary Type Toggle */}
        <div className="inline-flex bg-slate-100 rounded-2xl p-1.5 gap-1">
          <button
            onClick={() => handleToggle('short')}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              summaryType === 'short'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
            Short
          </button>
          <button
            onClick={() => handleToggle('detailed')}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              summaryType === 'detailed'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Detailed
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {toggling ? (
          <motion.div
            key="toggling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-48 gap-3"
          >
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="text-slate-500 text-sm">Switching to {summaryType} summary...</p>
          </motion.div>
        ) : (
          <motion.div
            key={summaryType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid gap-8"
          >
            {/* Main Summary */}
            <section className="card">
              <div className="flex items-center gap-2 mb-4 text-primary-600 font-bold border-b border-slate-100 pb-4">
                <FileText className="w-5 h-5" />
                <h2>{summaryType === 'short' ? 'Short Summary' : 'Detailed Summary'}</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                {summary.content}
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Key Points */}
              <section className="card">
                <div className="flex items-center gap-2 mb-4 text-purple-600 font-bold">
                  <ListChecks className="w-5 h-5" />
                  <h2>Key Points</h2>
                </div>
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {summary.key_points}
                </div>
              </section>

              {/* Important Questions */}
              <section className="card">
                <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold">
                  <HelpCircle className="w-5 h-5" />
                  <h2>Study Questions</h2>
                </div>
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {summary.important_questions}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SummaryPage;
