import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Upload, File, Image as ImageIcon, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size too large. Max 10MB.');
        return;
      }
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    
    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const res = await api.post('notes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => navigate(`/summary/${res.data.id}`), 1500);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Upload Your Notes</h1>
        <p className="text-slate-600 mt-2">Upload a PDF, TXT, or Image (PNG/JPG) to get started with AI summaries.</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleUpload} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Note Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. History Chapter 1"
            />
          </div>

          <div 
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center transition-all
              ${file ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-400'}
            `}
          >
            <input
              type="file"
              accept=".pdf,.txt,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto">
                    {file.type.startsWith('image/') ? <ImageIcon className="w-8 h-8" /> : <File className="w-8 h-8" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 text-sm font-medium hover:underline"
                  >
                    Remove File
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500">PDF, TXT, PNG, or JPG up to 10MB</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={!file || isUploading || success}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-70"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing Note...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Upload Successful!
              </>
            ) : (
              'Start Summarizing'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
