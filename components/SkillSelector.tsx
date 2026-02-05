import React from 'react';
import { Bot, Palette, Gamepad2, Layers, Sparkles } from 'lucide-react';
import { SKILL_REGISTRY } from '../services/skillService';
import { Skill } from '../types';

interface SkillSelectorProps {
    selectedSkill: Skill | null;
    onSelect: (skill: Skill) => void;
    onNext: () => void;
}

const IconMap: Record<string, React.ElementType> = {
    'Bot': Bot,
    'Palette': Palette,
    'Gamepad2': Gamepad2,
    'Layers': Layers,
    'Sparkles': Sparkles
};

const SkillSelector: React.FC<SkillSelectorProps> = ({ selectedSkill, onSelect, onNext }) => {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                    Chọn Chuyên Gia Đồng Hành
                </h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    Mỗi chuyên gia sẽ có góc nhìn và cách tiếp cận bài giảng khác nhau. Hãy chọn "người cố vấn" phù hợp nhất cho giáo án của bạn.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SKILL_REGISTRY.map((skill) => {
                    const Icon = IconMap[skill.icon] || Sparkles;
                    const isSelected = selectedSkill?.id === skill.id;

                    return (
                        <button
                            key={skill.id}
                            onClick={() => onSelect(skill)}
                            className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 text-left hover:scale-[1.02] active:scale-[0.98]
                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-100 shadow-xl'
                                    : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg'
                                }
              `}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors
                ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
              `}>
                                <Icon className="w-6 h-6" />
                            </div>

                            <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                {skill.name}
                            </h3>

                            <p className="text-sm text-slate-500 leading-relaxed">
                                {skill.description}
                            </p>

                            {isSelected && (
                                <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                    <span className="flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={onNext}
                    disabled={!selectedSkill}
                    className={`px-12 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all duration-300
            ${selectedSkill
                            ? 'gradient-bg text-white hover:scale-105 active:scale-95 cursor-pointer'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }
          `}
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    );
};

export default SkillSelector;
