import React from 'react';
import { BrainCircuitIcon } from '../icons/BrainCircuitIcon';

interface ToolPlaceholderProps {
    toolName: string;
}

const ToolPlaceholder: React.FC<ToolPlaceholderProps> = ({ toolName }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center h-[60vh] bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)] animate-fade-in">
            <div className="p-6 bg-[var(--primary-color-translucent)] rounded-full mb-6">
                <BrainCircuitIcon className="w-16 h-16 text-[var(--primary-color-light)]" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--text-color)] mb-2">
                {toolName}
            </h1>
            <p className="text-lg text-[var(--text-muted-color)]">
                قيد التطوير... قريباً!
            </p>
        </div>
    );
};

export default ToolPlaceholder;
