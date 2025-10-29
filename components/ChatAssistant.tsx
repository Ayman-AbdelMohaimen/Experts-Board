

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Language } from '../App';
import { translations } from '../lib/translations';
import { XIcon } from './icons/XIcon';
import { MinimizeIcon } from './icons/MinimizeIcon';
import { MaximizeIcon } from './icons/MaximizeIcon';
import { SendIcon } from './icons/SendIcon';
import { CompressIcon } from './icons/CompressIcon';
import { chatWithMedoo } from '../services/geminiService';
import { SmileIcon } from './icons/SmileIcon';

export interface ChatAssistantProps {
  t: (key: keyof typeof translations) => string;
  language: Language;
}

export interface ChatAssistantHandle {
  toggleOpenState: () => void;
}

type Message = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

const suggestedQuestionStyles = [
    'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    'bg-gradient-to-r from-green-400 to-teal-500 text-white',
    'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
];

const artisticGradients = [
  'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30',
  'bg-gradient-to-br from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white shadow-lg shadow-teal-500/30',
  'bg-gradient-to-br from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white shadow-lg shadow-orange-500/30',
];

const parseMarkdownToHTML = (text: string) => {
    // Check if DOMPurify is available on the window object
    if (!(window as any).DOMPurify) {
        console.error('DOMPurify not loaded. Cannot sanitize HTML.');
        // Fallback to a safer, non-HTML rendering if sanitizer is missing
        const safeText = document.createTextNode(text).textContent || '';
        return { __html: safeText.replace(/\n/g, '<br />') };
    }

    const dirtyHTML = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Basic bold support
        .replace(/\n/g, '<br />'); // Newlines to breaks
    
    const cleanHTML = (window as any).DOMPurify.sanitize(dirtyHTML);
    return { __html: cleanHTML };
};

const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    const noteDuration = 0.08;
    const noteGap = 0.1;

    // ICQ message sound arpeggio (approximated)
    playNote(554.37, now, noteDuration); // C#5
    playNote(698.46, now + noteGap, noteDuration); // F5
    playNote(830.61, now + noteGap * 2, noteDuration); // G#5
};


export const ChatAssistant = React.forwardRef<ChatAssistantHandle, ChatAssistantProps>(({ t, language }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [position, setPosition] = useState({ x: 30, y: 30 });
  
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    t('medooSuggestion1'),
    t('medooSuggestion2'),
    t('medooSuggestion3'),
    t('medooSuggestion4'),
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, followUpQuestions]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFullScreen) return;
    isDragging.current = true;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.currentTarget.classList.add('active');
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || isFullScreen) return;
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if(chatWindowRef.current) {
      chatWindowRef.current.querySelector('.chat-window-drag-handle')?.classList.remove('active');
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getContextData = () => {
      const profile = localStorage.getItem('expertProfile');
      const library = localStorage.getItem('expertLibrary');
      return { profile, library };
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { role: 'user', parts: [{ text }] };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setFollowUpQuestions([]); // Clear previous suggestions

    try {
        const userData = getContextData();
        const history = [...messages, userMessage].filter(m => m.role !== 'user' || m.parts[0].text !== text); // History without the current prompt
        
        const responseText = await chatWithMedoo(text, history, userData, language);

        const responseLines = responseText.split('\n');
        const mainResponse = responseLines.filter(line => !line.startsWith('SUGGESTION:')).join('\n').trim();
        const suggestions = responseLines
            .filter(line => line.startsWith('SUGGESTION:'))
            .map(line => line.replace('SUGGESTION:', '').trim());

        const modelMessage: Message = { role: 'model', parts: [{ text: mainResponse }] };
        setMessages(prev => [...prev, modelMessage]);
        setFollowUpQuestions(suggestions);
        playCompletionSound();

    } catch (error) {
        console.error(error);
        const errorMessage: Message = { role: 'model', parts: [{ text: t('medooError') }] };
        setMessages(prev => [...prev, errorMessage]);
        setFollowUpQuestions([]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(userInput);
    setUserInput('');
  };

  const handleSuggestedClick = (question: string) => {
    setUserInput(question);
    sendMessage(question);
    setUserInput('');
  };
  
  // New state handlers for better control
  const openChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
      if (messages.length === 0) {
          setMessages([{ role: 'model', parts: [{ text: t('medooWelcome') }] }]);
      }
  };
  const closeChat = () => setIsOpen(false);
  const minimizeChat = () => setIsMinimized(true);
  const toggleFullScreen = () => {
      setIsFullScreen(prev => !prev);
      if (!isFullScreen) setIsMinimized(false);
  };
  const toggleOpenState = () => {
      if (!isOpen) {
          openChat();
      } else if (isMinimized) {
          setIsMinimized(false);
      } else {
          closeChat();
      }
  };

  useImperativeHandle(ref, () => ({
    toggleOpenState,
  }));


  const chatWindowClass = `
    fixed bg-[var(--background-elevated-color)] rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-[60]
    ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
    ${isMinimized ? 'h-16 w-64' : (isFullScreen ? 'w-screen h-screen rounded-none' : 'w-[450px] h-[600px] max-w-[90vw] max-h-[80vh]')}
    ${isFullScreen ? 'top-0 left-0' : ''}
  `;

  return (
      <div
        ref={chatWindowRef}
        className={chatWindowClass}
        style={!isFullScreen ? { top: `${position.y}px`, left: `${position.x}px` } : {}}
      >
        <div 
            className="chat-window-drag-handle p-4 border-b border-[var(--border-color)] flex justify-between items-center shrink-0"
            onMouseDown={handleMouseDown}
        >
          <h3 className="font-bold text-lg">{t('medooName')}</h3>
          <div className="flex items-center gap-1">
            <button onClick={minimizeChat} className="p-2 rounded-full hover:bg-[var(--button-muted-background)]"><MinimizeIcon className="w-4 h-4" /></button>
            <button onClick={toggleFullScreen} className="p-2 rounded-full hover:bg-[var(--button-muted-background)]">{isFullScreen ? <CompressIcon className="w-4 h-4"/> : <MaximizeIcon className="w-4 h-4"/>}</button>
            <button onClick={closeChat} className="p-2 rounded-full hover:bg-[var(--button-muted-background)]"><XIcon className="w-5 h-5" /></button>
          </div>
        </div>
        {!isMinimized && (
          <>
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4">
              {messages.length === 1 && messages[0].parts[0].text === t('medooWelcome') && !isLoading && (
                  <div className="text-center p-4">
                      <div className="grid grid-cols-2 gap-2">
                         {suggestedQuestions.map((q, i) => (
                             <button key={i} onClick={() => handleSuggestedClick(q)} className={`p-3 rounded-lg text-sm font-semibold transition-transform hover:scale-105 ${suggestedQuestionStyles[i % suggestedQuestionStyles.length]}`}>
                                {q}
                             </button>
                         ))}
                      </div>
                  </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs md:max-w-md p-3 rounded-2xl break-words ${msg.role === 'user' ? 'bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] text-white rounded-br-none' : 'bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-bl-none'}`}>
                     <div
                        className="prose prose-sm max-w-none text-inherit prose-strong:text-inherit"
                        dangerouslySetInnerHTML={parseMarkdownToHTML(msg.parts[0].text)}
                      />
                  </div>
                </div>
              ))}
              {isLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-[var(--button-muted-background)] rounded-bl-none">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-[var(--text-muted-color)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-[var(--text-muted-color)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-[var(--text-muted-color)] rounded-full animate-bounce"></span>
                        </div>
                    </div>
                  </div>
              )}
               {followUpQuestions.length > 0 && !isLoading && (
                    <div className="pt-2 flex flex-col items-start gap-2">
                        <p className="text-xs text-[var(--text-muted-color)] px-2">{t('suggestedReplies')}</p>
                        <div className="flex flex-wrap gap-2">
                            {followUpQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestedClick(q)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${artisticGradients[i % artisticGradients.length]}`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 border-t border-[var(--border-color)] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={t('medooPlaceholder')}
                className="w-full p-2 border rounded-lg bg-[var(--input-background)] border-[var(--border-muted-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                disabled={isLoading}
              />
              <button type="submit" className="p-3 rounded-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all disabled:opacity-50" disabled={isLoading || !userInput.trim()}>
                <SendIcon className="w-5 h-5" />
              </button>
            </form>
          </>
        )}
      </div>
  );
});