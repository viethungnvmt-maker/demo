
import React, { useState } from 'react';
import { Upload, FileText, X, AlertCircle, Info, Sparkles } from 'lucide-react';
// @ts-ignore - mammoth might not have types in this env
import mammoth from 'mammoth';

interface FileUploaderProps {
  onFileLoaded: (text: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      setError('Vui lòng chỉ tải lên tệp .docx (Word)');
      return;
    }

    try {
      setError(null);
      const arrayBuffer = await file.arrayBuffer();
      // Use the imported mammoth library to extract text
      // @ts-ignore
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      if (!text || text.trim().length < 50) {
        setError('Tệp giáo án quá ngắn hoặc không có nội dung văn bản.');
        return;
      }
      
      onFileLoaded(text);
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi đọc tệp. Hãy thử lại.');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-800">Bắt đầu Số hóa Giáo án</h2>
        <p className="text-slate-500 text-lg">Tải lên file giáo án Word để AI tự động tích hợp năng lực số theo chuẩn.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className={`p-6 rounded-full transition-colors ${isDragging ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
          <Upload className="w-12 h-12" />
        </div>
        
        <div className="text-center">
          <p className="text-xl font-semibold text-slate-700">Kéo thả file vào đây</p>
          <p className="text-slate-500 mt-1">hoặc click để chọn từ máy tính</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200">
          <FileText className="w-4 h-4" />
          Hỗ trợ định dạng .docx
        </div>

        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".docx"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard 
          icon={<AlertCircle className="w-5 h-5 text-indigo-500" />} 
          title="Thông minh" 
          desc="AI tự động phân tích mục tiêu bài học." 
        />
        <InfoCard 
          icon={<FileText className="w-5 h-5 text-indigo-500" />} 
          title="Chuẩn hóa" 
          desc="Bám sát khung năng lực số của Bộ GD&ĐT." 
        />
        <InfoCard 
          icon={<Sparkles className="w-5 h-5 text-indigo-500" />} 
          title="Nhanh chóng" 
          desc="Tiết kiệm 80% thời gian soạn giáo án số." 
        />
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
    <div className="bg-indigo-50 w-fit p-2 rounded-lg">{icon}</div>
    <h4 className="font-bold text-slate-800">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default FileUploader;
