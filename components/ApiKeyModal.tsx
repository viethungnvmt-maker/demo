
import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, X, Check, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (apiKey: string, model: string) => void;
    initialApiKey?: string;
    initialModel?: string;
    isRequired?: boolean;
}

export const AI_MODELS = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Nhanh, hiệu quả, phù hợp cho đa số tác vụ',
        isDefault: true
    },
    {
        id: 'gemini-2.5-pro-preview-05-06',
        name: 'Gemini 2.5 Pro Preview',
        description: 'Mạnh mẽ nhất, phù hợp cho tác vụ phức tạp'
    },
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Ổn định, nhanh chóng'
    }
];

export const DEFAULT_MODEL = 'gemini-2.5-flash';

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialApiKey = '',
    initialModel = DEFAULT_MODEL,
    isRequired = false
}) => {
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [selectedModel, setSelectedModel] = useState(initialModel);
    const [error, setError] = useState('');

    useEffect(() => {
        setApiKey(initialApiKey);
        setSelectedModel(initialModel);
    }, [initialApiKey, initialModel, isOpen]);

    const handleSave = () => {
        if (!apiKey.trim()) {
            setError('Vui lòng nhập API Key');
            return;
        }
        if (!apiKey.startsWith('AI')) {
            setError('API Key không hợp lệ. Key phải bắt đầu bằng "AI"');
            return;
        }
        setError('');
        onSave(apiKey.trim(), selectedModel);
        if (!isRequired) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="gradient-bg text-white p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Key className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Thiết lập API Key</h2>
                                <p className="text-indigo-100 text-sm">Cấu hình để sử dụng AI</p>
                            </div>
                        </div>
                        {!isRequired && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* API Key Input */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                            Google AI API Key <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setError('');
                            }}
                            placeholder="AIza..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-lg"
                        />
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <a
                            href="https://aistudio.google.com/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Lấy API Key miễn phí tại Google AI Studio
                        </a>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                            Chọn Model AI
                        </label>
                        <div className="grid gap-3">
                            {AI_MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedModel === model.id
                                            ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-800">{model.name}</span>
                                                {model.isDefault && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Khuyên dùng
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{model.description}</p>
                                        </div>
                                        {selectedModel === model.id && (
                                            <div className="bg-indigo-600 p-1 rounded-full">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-800">
                            <strong>Lưu ý:</strong> API Key được lưu trữ cục bộ trên trình duyệt của bạn và không được gửi đến server của chúng tôi.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <button
                        onClick={handleSave}
                        className="w-full py-4 rounded-2xl font-bold text-white gradient-bg shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Lưu và tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
