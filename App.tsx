
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FileUploader from './components/FileUploader';
import ResultView from './components/ResultView';
import SkillSelector from './components/SkillSelector';
import { AppStep, LessonPlanData, Skill } from './types';
import { analyzeLessonPlan } from './services/geminiService';
import { Loader2, CheckCircle2, FileDown } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SELECTION);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [lessonData, setLessonData] = useState<LessonPlanData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Đang khởi tạo AI...');

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleSkillConfirm = () => {
    if (selectedSkill) {
      setStep(AppStep.UPLOAD);
    }
  };

  const handleFileLoaded = (text: string) => {
    setExtractedText(text);
    setStep(AppStep.ANALYZING);
  };

  useEffect(() => {
    if (step === AppStep.ANALYZING && extractedText) {
      const messages = [
        `Đang tham vấn chuyên gia ${selectedSkill?.name}...`,
        'Phân tích cơ hội tích hợp năng lực số...',
        'Đối chiếu với khung năng lực Bộ Giáo dục...',
        'Thiết kế các hoạt động học tập số...',
        'Đang hoàn tất giáo án số hóa...'
      ];

      let msgIndex = 0;
      const interval = setInterval(() => {
        setLoadingMessage(messages[msgIndex % messages.length]);
        msgIndex++;
      }, 3000);

      analyzeLessonPlan(extractedText, selectedSkill || undefined)
        .then(data => {
          setLessonData(data);
          setStep(AppStep.REVIEW);
        })
        .catch(err => {
          console.error(err);
          const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gọi AI.';
          alert(errorMessage);
          setStep(AppStep.SELECTION); // Go back to start on error
        })
        .finally(() => clearInterval(interval));
    }
  }, [step, extractedText, selectedSkill]);

  const handleExport = (data: LessonPlanData) => {
    setLessonData(data);
    setStep(AppStep.EXPORT);
  };

  return (
    <Layout currentStep={step}>
      {step === AppStep.SELECTION && (
        <SkillSelector
          selectedSkill={selectedSkill}
          onSelect={handleSkillSelect}
          onNext={handleSkillConfirm}
        />
      )}

      {step === AppStep.UPLOAD && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                {/* We could dynamically load the icon here if needed, but for now simple fallback */}
                <span className="font-bold text-lg">AI</span>
              </div>
              <div>
                <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">Chuyên gia đang hỗ trợ</p>
                <h3 className="text-lg font-bold text-indigo-900">{selectedSkill?.name}</h3>
              </div>
            </div>
            <button
              onClick={() => setStep(AppStep.SELECTION)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
            >
              Đổi chuyên gia
            </button>
          </div>
          <FileUploader onFileLoaded={handleFileLoaded} />
        </div>
      )}

      {step === AppStep.ANALYZING && (
        <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
            <Loader2 className="w-24 h-24 text-indigo-600 animate-spin relative" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-slate-800">Trí tuệ nhân tạo đang làm việc</h3>
            <p className="text-slate-500 animate-pulse text-lg">{loadingMessage}</p>
          </div>

          <div className="max-w-md w-full bg-white p-2 rounded-full border border-slate-100 overflow-hidden shadow-sm">
            <div className="h-2 bg-indigo-600 rounded-full animate-[progress_15s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
          </div>
        </div>
      )}

      {step === AppStep.REVIEW && lessonData && (
        <ResultView
          data={lessonData}
          onExport={handleExport}
          skillName={selectedSkill?.name}
        />
      )}

      {step === AppStep.EXPORT && lessonData && (
        <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900">Tuyệt vời!</h2>
            <p className="text-xl text-slate-500">Giáo án tích hợp năng lực số của bạn đã sẵn sàng.</p>
          </div>

          <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-indigo-100 border border-slate-50 space-y-6">
            <div className="flex items-center gap-6 text-left">
              <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-lg">
                <FileDown className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-slate-800">{lessonData.title}</h4>
                <p className="text-slate-400 font-medium">Đã bao gồm {lessonData.digitalGoals.length} mục tiêu số & {lessonData.activities.length} hoạt động học tập số.</p>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border-2 border-slate-100"
              >
                Làm giáo án mới
              </button>
              <button
                onClick={() => alert('Chức năng tải file .docx đang được giả lập. Trong môi trường thực tế, hệ thống sẽ sử dụng thư viện docx để tạo file.')}
                className="flex-[2] py-5 rounded-2xl font-bold text-white gradient-bg shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
              >
                Tải về ngay
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Mẹo: Hãy kiểm tra lại định dạng trước khi in ấn.
          </p>
        </div>
      )}
    </Layout>
  );
};

export default App;
