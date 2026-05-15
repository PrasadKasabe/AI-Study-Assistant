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
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryPage = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const noteRes = await api.get(`notes/${noteId}/`);
        setNote(noteRes.data);
        
        // Try to generate/get summary
        const summaryRes = await api.post('summaries/', { note: noteId, summary_type: 'detailed' });
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
      }
    };
    fetchData();
  }, [noteId]);

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
        <p className="text-slate-600 font-medium animate-pulse">Gemini is analyzing your notes...</p>
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
      <div className="flex items-center justify-between">
        <Link to="/notes" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Back to Notes
        </Link>
        <div className="flex gap-2">
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
      </header>

      <div className="grid gap-8">
        {/* Main Summary */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4 text-primary-600 font-bold border-b border-slate-100 pb-4">
            <FileText className="w-5 h-5" />
            <h2>Detailed Summary</h2>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {summary.content}
          </div>
        </motion.section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Key Points */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center gap-2 mb-4 text-purple-600 font-bold">
              <ListChecks className="w-5 h-5" />
              <h2>Key Points</h2>
            </div>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {summary.key_points}
            </div>
          </motion.section>

          {/* Important Questions */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold">
              <HelpCircle className="w-5 h-5" />
              <h2>Study Questions</h2>
            </div>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {summary.important_questions}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
