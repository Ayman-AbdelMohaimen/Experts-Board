import React from 'react';
import { Language } from '../App';

interface LoaderProps {
    language: Language;
}

const messagesAr = [
    "جاري تحليل السيرة الذاتية...",
    "بناء ملفك الشخصي الذكي...",
    "تصميم الخط الزمني لمسيرتك المهنية...",
    "وضع هيكل الدورة التعليمية...",
    "إعداد مقترحات التقييم والتطوير...",
    "لحظات قليلة وينتهي كل شيء..."
];

const messagesEn = [
    "Analyzing your CV...",
    "Building your smart profile...",
    "Designing your career timeline...",
    "Structuring your educational course...",
    "Preparing assessment and development suggestions...",
    "Just a few more moments..."
];

export const Loader: React.FC<LoaderProps> = ({ language }) => {
    const messages = language === 'ar' ? messagesAr : messagesEn;
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, [messages]);

    return (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin"></div>
                <p className="mt-4 text-lg font-semibold text-[var(--text-dark)] animate-pulse">{message}</p>
            </div>
        </div>
    );
};
