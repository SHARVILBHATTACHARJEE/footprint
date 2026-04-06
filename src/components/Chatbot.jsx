import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, ArrowRight } from 'lucide-react';
import { getProducts } from '../firebase/firestore';
import { Link } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Welcome to Footprint! I am your AI Footwear Specialist. To find your perfect match, tell me: what is your primary activity? (e.g., Running, City Walking, or Standing)' }
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
                const catalogContext = data.map(p => 
                    `- ID: ${p.id}, Name: ${p.name}, Price: INR ${p.price || p.feature_price || 2999}, Category: ${p.category}, Style: ${p.walking_style || 'All-Purpose'}, Specs: ${p.description}`
                ).join("\n");

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
                        { role: "model", parts: [{ text: "Welcome to Footprint! I am your AI Footwear Specialist. To find your perfect match, tell me: what is your primary activity? (e.g., Running, City Walking, or Standing)" }] }
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

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
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
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Footwear Specialist</h3>
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
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl ${
                                        msg.sender === 'user' 
                                            ? 'bg-[#00ff88] text-black rounded-tr-sm' 
                                            : 'bg-[#1a1a1a] text-gray-200 border border-[#333] rounded-tl-sm'
                                    }`}>
                                        <p className="text-sm">{msg.text}</p>

                                        {/* Dynamic Product Recommendations */}
                                        {msg.type === 'recommendation' && msg.recommendedProducts?.length > 0 && (
                                            <div className="mt-4 flex flex-col gap-2">
                                                {msg.recommendedProducts.map(product => (
                                                        <div key={product.id} className="bg-black border border-[#333] rounded-xl p-2 flex gap-3 items-center">
                                                            <img src={product.image_url || product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-[#111]" />
                                                            <div className="flex-1">
                                                                <h4 className="text-[11px] md:text-xs font-bold text-white uppercase line-clamp-1">{product.name}</h4>
                                                                <p className="text-[9px] md:text-[10px] text-gray-400 font-mono tracking-wider">{product.walking_style || 'All-Purpose'}</p>
                                                                <p className="text-xs text-[#00ff88] font-bold mt-1">₹{product.price || product.feature_price || '2999'}</p>
                                                            </div>
                                                            <Link 
                                                                to="/shop"
                                                                onClick={() => setIsOpen(false)}
                                                                className="p-2 bg-[#111] hover:bg-[#00ff88] text-[#00ff88] hover:text-black rounded-lg transition-colors border border-[#00ff88]/20 shrink-0"
                                                            >
                                                                <ArrowRight size={14} />
                                                            </Link>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
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

                        {/* Initial Quick Replies just for starting off */}
                        {messages.length === 1 && !isTyping && (
                            <div className="px-4 pb-2 flex gap-2 flex-wrap">
                                {['Running', 'City Walking', 'Standing All Day', 'Flat Feet?'].map((chip) => (
                                    <button 
                                        key={chip}
                                        onClick={() => {
                                            setInputValue(chip);
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
