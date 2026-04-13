import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, ArrowRight, ArrowUp, Sparkles } from 'lucide-react';
import { getProducts } from '../firebase/firestore';
import { Link } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [showFaq, setShowFaq] = useState(true);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'What can I help you with today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [products, setProducts] = useState([]);
    
    // Active Gemini Chat Session
    const [chatSession, setChatSession] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const initAI = async () => {
            try {
                const data = await getProducts();
                setProducts(data);

                if (!import.meta.env.VITE_GEMINI_API_KEY) {
                    console.warn("No Gemini API key found");
                    return;
                }

                // Inject product list into context
                const catalogContext = data.map(p => {
                    const rawPrice = p.feature_price || p.price || '0';
                    const parsedPrice = parseFloat(rawPrice.toString().replace(/[^0-9.]/g, ''));
                    return `- ID: ${p.id}, Name: ${p.name}, Price: INR ${parsedPrice}, Category: ${p.category}, Style: ${p.walking_style || 'All-Purpose'}, Specs: ${p.description}`;
                }).join("\n");

                const systemInstruction = `You are a premium AI Footwear Specialist for an innovative brand named 'Footprint'. 
Your goal is to converse with users naturally, understand their foot profile (like flat feet, running frequency, or joint pain), and recommend the absolute BEST shoes from our catalog.

RULES:
1. Keep the conversation strictly focused on footwear, foot health, sizing, tracking orders, and the user's needs. Do not answer off-topic queries.
2. Be concise, friendly, and expert-like. Always make the user feel like a VIP. Respond with plain text or simple markdown.
3. If you recommend a product, ONLY recommend ones from the catalog list below. Do not make up any products.
4. When recommending a product, YOU MUST explicitly include the exact phrase "RECOMMEND_PRODUCT_ID: [ID]" somewhere in your response (preferably at the end) so the UI can render a visual clickable card! 
Example: "I think you'll love the Cloud Strider for your morning runs! RECOMMEND_PRODUCT_ID: cloud-strider"
5. Explain briefly why a product is a good match based on its specs.

CATALOG:
${catalogContext}`;

                const generativeModel = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    systemInstruction: systemInstruction,
                    generationConfig: { temperature: 0.7 }
                });

                const chat = generativeModel.startChat({
                    history: [
                        { role: "user", parts: [{ text: "Hello!" }] },
                        { role: "model", parts: [{ text: "What can I help you with today?" }] }
                    ]
                });

                setChatSession(chat);
            } catch (e) {
                console.error("AI Init Failed", e);
            }
        };
        initAI();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (textToSend) => {
        if (!textToSend.trim()) return;

        if (showFaq) {
            setShowFaq(false);
        }

        const userText = textToSend.trim();
        const userMsg = { id: Date.now(), sender: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            if (!chatSession) {
                // Fallback if AI not initialized
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "I'm currently unable to connect to my AI brain. Check your API key or try again later!" }]);
                    setIsTyping(false);
                }, 1000);
                return;
            }

            // Real Gemini Chat
            const result = await chatSession.sendMessage(userText);
            const responseText = result.response.text();
            
            let finalResponseText = responseText;
            let recommendedIds = [];

            // Extract recommended IDs tags
            const regex = /RECOMMEND_PRODUCT_ID:\s*([a-zA-Z0-9_-]+)/g;
            let match;
            while ((match = regex.exec(responseText)) !== null) {
                recommendedIds.push(match[1]);
            }
            
            // Clean out the raw text tags before showing to user
            finalResponseText = responseText.replace(/RECOMMEND_PRODUCT_ID:\s*([a-zA-Z0-9_-]+)/g, '').trim();

            const botMsg = { 
                id: Date.now() + 1, 
                sender: 'bot', 
                text: finalResponseText,
                type: recommendedIds.length > 0 ? 'recommendation' : 'text',
                recommendedProducts: recommendedIds.map(id => products.find(p => p.id === id)).filter(Boolean)
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Live AI Chat error", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Oops, something interrupted my thoughts. Could you say that again?", type: 'text' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage(inputValue);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: isOpen ? 0 : 1 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-28 md:bottom-6 right-4 md:right-6 z-[110] bg-[var(--color-accent)] text-black p-4 rounded-full shadow-xl hover:bg-[#00cc6a] hover:scale-110 transition-all border border-transparent ${isOpen ? 'pointer-events-none' : ''}`}
            >
                <Sparkles size={24} />
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-[120] w-[calc(100vw-32px)] md:w-full max-w-[380px] h-[70vh] md:h-[550px] bg-black border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-black">
                            <div className="flex items-center gap-2 text-white">
                                <Sparkles size={20} className="text-[var(--color-accent)]" />
                                <h3 className="font-semibold text-[17px]">Footprint AI Chat</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-900">
                                <X size={20} />
                            </button>
                        </div>

                        {!hasStarted ? (
                            // Let's Go Interface
                            <div className="flex-1 flex flex-col p-6 bg-black overflow-y-auto scrollbar-hide">
                                <div className="mb-4 mt-2">
                                    <Sparkles size={40} className="text-[var(--color-accent)]" />
                                </div>
                                <h2 className="text-[26px] md:text-[28px] leading-tight font-medium text-white mb-6 tracking-tight">
                                    Hi. I'm Footprint AI and I'm here to answer your questions, help with your orders, or connect you with a Footwear Expert.
                                </h2>
                                
                                <div className="mt-auto pt-4 pb-2">
                                    <p className="text-[11px] text-gray-400 mb-6 leading-relaxed">
                                        By tapping "Let's go", you agree to <Link to="/terms" onClick={() => setIsOpen(false)} className="font-semibold text-gray-300 underline hover:text-[var(--color-accent)]">Footprint's Terms of Use</Link>, <Link to="/privacy" onClick={() => setIsOpen(false)} className="font-semibold text-gray-300 underline hover:text-[var(--color-accent)]">Privacy Policy</Link>, and monitoring, recording, and use of your chat.
                                    </p>
                                    <button 
                                        onClick={() => setHasStarted(true)}
                                        className="w-full bg-[var(--color-accent)] text-black rounded-full py-3.5 px-6 flex justify-center items-center gap-2 hover:bg-[#00cc6a] transition-colors text-[17px] font-medium"
                                    >
                                        Let's Go <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-black">
                                    {messages.map((msg, index) => {
                                        if (index === 0) {
                                            return (
                                                <div key={msg.id} className="w-full mb-6 mt-2">
                                                    <p className="text-white text-[17px] mb-6">{msg.text}</p>
                                                    {showFaq && (
                                                        <div className="space-y-2">
                                                            <p className="font-semibold text-white text-[15px] mb-3">Frequently Asked Questions</p>
                                                            {['Where is my order?', 'What are the best shoes for running?', 'How do I clean my sneakers?', 'Can you recommend shoes for flat feet?'].map((faq) => (
                                                                <button
                                                                    key={faq}
                                                                    onClick={() => handleSendMessage(faq)}
                                                                    className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-transparent hover:border-gray-700 text-gray-200 px-4 py-3.5 rounded-xl transition-all text-[14px] font-medium"
                                                                >
                                                                    {faq}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                                                <div className={`max-w-[85%] p-3 rounded-2xl ${
                                                    msg.sender === 'user' 
                                                        ? 'bg-[var(--color-accent)] text-black rounded-tr-sm' 
                                                        : 'bg-gray-900 text-white border border-gray-800 rounded-tl-sm shadow-sm'
                                                }`}>
                                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                                    {/* Dynamic Product Recommendations */}
                                                    {msg.type === 'recommendation' && msg.recommendedProducts?.length > 0 && (
                                                        <div className="mt-4 flex flex-col gap-2">
                                                            {msg.recommendedProducts.map(product => (
                                                                <div key={product.id} className="bg-black border border-gray-800 rounded-xl p-2 flex gap-3 items-center shadow-sm">
                                                                    <img src={product.image_url || product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-gray-900" />
                                                                    <div className="flex-1">
                                                                        <h4 className="text-[12px] md:text-sm font-bold text-white uppercase line-clamp-1">{product.name}</h4>
                                                                        <p className="text-[10px] md:text-xs text-gray-400 font-medium tracking-wide">{product.walking_style || 'All-Purpose'}</p>
                                                                        <p className="text-sm text-white font-bold mt-1">₹{parseFloat((product.feature_price || product.price || '0').toString().replace(/[^0-9.]/g, ''))}</p>
                                                                    </div>
                                                                    <Link 
                                                                        to="/shop"
                                                                        onClick={() => setIsOpen(false)}
                                                                        className="p-2 bg-gray-800 hover:bg-[var(--color-accent)] text-white hover:text-black rounded-lg transition-colors shrink-0"
                                                                    >
                                                                        <ArrowRight size={16} />
                                                                    </Link>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                                                <div className="flex gap-1.5">
                                                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 bg-black border-t border-gray-800 flex gap-2">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask Footprint AI"
                                        className="flex-1 bg-gray-900 text-white placeholder-gray-400 text-[15px] px-5 py-3 rounded-full border border-gray-800 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                                    />
                                    <button
                                        onClick={() => handleSendMessage(inputValue)}
                                        disabled={!inputValue.trim()}
                                        className="bg-[var(--color-accent)] text-black w-12 h-12 rounded-full hover:bg-[#00cc6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 border border-transparent disabled:bg-gray-800 disabled:text-gray-500"
                                    >
                                        <ArrowUp size={20} />
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
