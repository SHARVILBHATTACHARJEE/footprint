import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hi there! I am your AI Footprint Guide. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simple mock responses
        setTimeout(() => {
            const lowerInput = userMsg.text.toLowerCase();
            let botReply = "I'm not sure about that. Try asking about our smart shoes, tracking your order, finding your size, or checking our return policy.";

            if (lowerInput.includes('smart') || lowerInput.includes('shoe') || lowerInput.includes('feature')) {
                botReply = "Our smart shoes feature impact redistribution, arch alignment, and thermal regulation. Plus, you can preview them in 3D or track their lifecycle right from our app!";
            } else if (lowerInput.includes('order') || lowerInput.includes('track')) {
                botReply = "You can track your order by navigating to your profile and clicking on 'Orders', or check the confirmation email we sent you.";
            } else if (lowerInput.includes('return') || lowerInput.includes('refund')) {
                botReply = "We offer a 30-day hassle-free return policy. As long as the shoes are in neat condition, we've got you covered.";
            } else if (lowerInput.includes('size') || lowerInput.includes('fit')) {
                botReply = "Not sure about your size? Use our 'Sole Size Detector' tool in the app to get an accurate scan of your foot length.";
            } else if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
                botReply = "Hello! Looking for a new pair of ultra-modern sneakers?";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
            setIsTyping(false);
        }, 1200);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: isOpen ? 0 : 1 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-[60] bg-[#00ff88] text-black p-4 rounded-full shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#00cc6a] hover:scale-110 transition-all ${isOpen ? 'pointer-events-none' : ''}`}
            >
                <MessageSquare size={24} />
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-[70] w-full max-w-[350px] h-[500px] bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-[#222] bg-[#111]">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#00ff88]/20 p-2 rounded-full text-[#00ff88]">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Footprint AI</h3>
                                    <div className="flex items-center gap-1.5 align-middle">
                                        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                                        <span className="text-[10px] uppercase text-[#00ff88] font-mono font-bold tracking-widest">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-[#1a1a1a] p-1.5 rounded-full hover:bg-[#333]">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl ${
                                        msg.sender === 'user' 
                                            ? 'bg-[#00ff88] text-black rounded-tr-sm' 
                                            : 'bg-[#1a1a1a] text-gray-200 border border-[#333] rounded-tl-sm'
                                    }`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-2xl rounded-tl-sm">
                                        <div className="flex gap-1.5">
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies (Optional, if no messages from user yet) */}
                        {messages.length === 1 && !isTyping && (
                            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                                {['Shoe Specs', 'Size Guide', 'Track Order'].map((chip) => (
                                    <button 
                                        key={chip}
                                        onClick={() => {
                                            setInputValue(chip);
                                            // Optional: immediately send instead of just filling input
                                            // setTimeout(() => handleSend(), 100);
                                        }}
                                        className="whitespace-nowrap text-xs bg-[#1a1a1a] border border-[#333] text-gray-300 px-3 py-1.5 rounded-full hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-[#111] border-t border-[#222]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-[#0a0a0a] text-white text-sm px-4 py-3 rounded-xl border border-[#333] focus:outline-none focus:border-[#00ff88] transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="bg-[#00ff88] text-black p-3 rounded-xl hover:bg-[#00cc6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
