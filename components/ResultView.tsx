
import React, { useState } from 'react';
import { LessonPlanData, LessonPart, DigitalCompetencyGoal } from '../types';
import { Check, Edit2, Plus, Download, Trash2, Cpu, Wrench, Layout, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultViewProps {
  data: LessonPlanData;
  onExport: (data: LessonPlanData) => void;
  skillName?: string;
}

const ResultView: React.FC<ResultViewProps> = ({ data, onExport, skillName }) => {
  const [editedData, setEditedData] = useState<LessonPlanData>(data);
  const [activeTab, setActiveTab] = useState<'goals' | 'activities' | 'tools'>('goals');

  const updateGoal = (id: string, value: string) => {
    setEditedData({
      ...editedData,
      digitalGoals: editedData.digitalGoals.map(g => g.id === id ? { ...g, description: value } : g)
    });
  };

  const updateActivity = (id: string, field: keyof LessonPart, value: string) => {
    setEditedData({
      ...editedData,
      activities: editedData.activities.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  const handleExport = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ffffff']
    });
    onExport(editedData);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-extrabold text-slate-900">{editedData.title || "Phân tích Giáo án"}</h2>
            {skillName && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Expert: {skillName}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
              Môn: {editedData.subject || "Chưa rõ"}
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
              Khối: {editedData.grade || "Chưa rõ"}
            </span>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="gradient-bg text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Download className="w-5 h-5" />
          Xuất Giáo án .docx
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <aside className="lg:col-span-1 space-y-2">
          <TabButton
            active={activeTab === 'goals'}
            onClick={() => setActiveTab('goals')}
            icon={<Cpu className="w-5 h-5" />}
            label="Mục tiêu Năng lực số"
          />
          <TabButton
            active={activeTab === 'activities'}
            onClick={() => setActiveTab('activities')}
            icon={<Layout className="w-5 h-5" />}
            label="Phân bổ Hoạt động"
          />
          <TabButton
            active={activeTab === 'tools'}
            onClick={() => setActiveTab('tools')}
            icon={<Wrench className="w-5 h-5" />}
            label="Công cụ & Tài nguyên"
          />
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[500px]">
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-800">Mục tiêu Năng lực số đề xuất</h3>
                  <button className="text-indigo-600 font-semibold text-sm flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> Thêm mục tiêu
                  </button>
                </div>
                {editedData.digitalGoals.map((goal, idx) => (
                  <div key={goal.id} className="group relative bg-slate-50 p-6 rounded-2xl border border-slate-100 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-md">
                    <div className="flex gap-4">
                      <div className="bg-indigo-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <textarea
                        value={goal.description}
                        onChange={(e) => updateGoal(goal.id, e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-700 resize-none font-medium text-lg leading-relaxed"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-slate-800">Chuỗi hoạt động học tập có tích hợp Năng lực số</h3>
                {editedData.activities.map((act) => (
                  <div key={act.id} className="border-l-4 border-indigo-500 pl-6 py-2 space-y-4">
                    <h4 className="text-lg font-bold text-indigo-700 uppercase tracking-wider">{act.name}</h4>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Đề xuất hoạt động số</label>
                      <textarea
                        value={act.digitalActivity}
                        onChange={(e) => updateActivity(act.id, 'digitalActivity', e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-slate-700"
                        rows={3}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {act.digitalTools.map((tool, tIdx) => (
                        <span key={tIdx} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                          {tool}
                          <button onClick={() => { }} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                      <button className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-indigo-100 hover:text-indigo-600 transition-all flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Thêm công cụ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-slate-800">Hệ sinh thái công cụ hỗ trợ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editedData.recommendedTools.map((tool, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                          <Wrench className="w-5 h-5 text-indigo-500" />
                        </div>
                        <span className="font-bold text-slate-700">{tool}</span>
                      </div>
                      <button className="text-slate-300 group-hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all">
                    <Plus className="w-5 h-5" />
                    Thêm công cụ mới
                  </button>
                </div>

                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                  <h4 className="font-bold text-indigo-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Mẹo triển khai từ AI
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Giáo viên nên bắt đầu bằng việc hướng dẫn học sinh cách sử dụng công cụ an toàn (Năng lực số về An toàn thông tin). Trong phần Luyện tập, hãy khuyến khích các em làm việc nhóm trên các nền tảng cộng tác như Padlet để rèn luyện kỹ năng Giao tiếp và Hợp tác số.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold ${active
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]'
      : 'text-slate-500 hover:bg-slate-100'
      }`}
  >
    {icon}
    {label}
  </button>
);

const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default ResultView;
