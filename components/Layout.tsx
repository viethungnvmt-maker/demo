
import React from 'react';
import { Sparkles, FileText, Cpu, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentStep }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="gradient-bg text-white py-6 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">DigiPlan AI</h1>
              <p className="text-sm text-indigo-100 font-medium">Tích hợp năng lực số vào giáo án</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 bg-white/10 p-1.5 rounded-full backdrop-blur-sm overflow-x-auto max-w-full">
            <StepItem active={currentStep === 'SELECTION'} label="Chọn chuyên gia" />
            <ChevronRight className="w-4 h-4 text-white/50" />
            <StepItem active={currentStep === 'UPLOAD'} label="Tải lên" />
            <ChevronRight className="w-4 h-4 text-white/50" />
            <StepItem active={currentStep === 'ANALYZING'} label="Phân tích" />
            <ChevronRight className="w-4 h-4 text-white/50" />
            <StepItem active={currentStep === 'REVIEW'} label="Chỉnh sửa" />
            <ChevronRight className="w-4 h-4 text-white/50" />
            <StepItem active={currentStep === 'EXPORT'} label="Hoàn thành" />
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm flex items-center justify-center gap-2">
            Phát triển bởi Đội ngũ Công nghệ Giáo dục <Sparkles className="w-4 h-4 text-amber-400" /> 2024
          </p>
          <p className="text-xs mt-2 opacity-60">Sử dụng công nghệ Gemini AI tiên tiến</p>
        </div>
      </footer>
    </div>
  );
};

const StepItem: React.FC<{ active: boolean; label: string }> = ({ active, label }) => (
  <span className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/80'
    }`}>
    {label}
  </span>
);

export default Layout;
