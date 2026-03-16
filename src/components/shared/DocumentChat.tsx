import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { createDocumentChat } from '../../services/ai/aiService';
import { ChatSession } from '../../types';

interface DocumentChatProps {
  documentText: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

const DocumentChat: React.FC<DocumentChatProps> = ({ documentText }) => {
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Assalomu alaykum! Men ushbu hujjatni o\'rganib chiqdim. Savollaringiz bormi? (Eslatma: Agar hujjat yuridik bo\'lmasa, tahlil aniqligi cheklangan bo\'lishi mumkin).' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (documentText) {
        try {
          const chat = await createDocumentChat(documentText);
          setChatSession(chat);
        } catch (e) {
          console.error("Failed to create chat session", e);
          setMessages(prev => [...prev, { role: 'model', text: "Kechirasiz, chat tizimini ishga tushirishda xatolik yuz berdi.", isError: true }]);
        }
      }
    };
    initChat();
  }, [documentText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSession) return;

    const userMessage = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    setIsTyping(true);

    try {
      // Add a placeholder for the model response immediately
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      const responseStream = chatSession.sendMessageStream(userMessage);

      let fullResponse = "";

      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          // Update the last message with accumulating text for streaming effect
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            // Ensure we are updating the model's message
            if (lastMsg.role === 'model' && !lastMsg.isError) {
              lastMsg.text = fullResponse;
            }
            return newMessages;
          });
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];

        let errorMessage = "Kechirasiz, xatolik yuz berdi. Internet aloqasini tekshiring.\n\nEslatma: Agar hujjat yuridik mavzudan tashqari bo'lsa, tahlil aniqligi cheklangan bo'lishi mumkin.";

        // If the last message was the empty placeholder, replace it with error
        if (lastMsg.role === 'model' && lastMsg.text === "") {
          lastMsg.text = errorMessage;
          lastMsg.isError = true;
          return newMessages;
        } else {
          // If partial response was received, append error message as a new bubble
          return [...newMessages, { role: 'model', text: errorMessage, isError: true }];
        }
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px] print-break-inside-avoid">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-900">AI Yurist bilan Chat</h3>
          <p className="text-xs text-blue-600">Hujjat bo'yicha istalgan savol bering</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.isError ? 'bg-red-100 border-red-200' : 'bg-blue-100 border-blue-200'}`}>
                {msg.isError ? <AlertCircle className="w-5 h-5 text-red-600" /> : <Bot className="w-5 h-5 text-blue-600" />}
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-tr-none'
              : msg.isError
                ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-none'
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}>
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-200">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Masalan: To'lov kechiksa nima bo'ladi?"
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block transition-all"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className={`absolute right-2 p-2 rounded-lg transition-colors ${!inputText.trim() || isTyping
              ? 'text-gray-400 bg-transparent'
              : 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm'
              }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentChat;
