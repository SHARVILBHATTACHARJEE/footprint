import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('https://footprint-6e9p.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                // Redirect user after login
                console.log(data);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error', err);
            setError('Unable to connect to server');
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center relative overflow-hidden bg-black text-white p-4">

            {/* Background Animated Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#050505] to-[#000] z-0" />
            <motion.div
                className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#00ff88] rounded-full blur-[150px] opacity-10"
                animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#00ccff] rounded-full blur-[150px] opacity-10"
                animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ rotateY: 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="w-16 h-16 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/50"
                        >
                            <Lock className="text-[#00ff88]" size={32} />
                        </motion.div>
                        <h2 className="text-3xl font-bold tracking-wider mb-2">Log In</h2>
                        <p className="text-gray-400 text-sm">Enter your credentials to access your account.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-700"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-700"
                                placeholder="••••••••"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-[#00ff88] text-black font-bold uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#00cc6a] transition-colors"
                        >
                            Sign In <ArrowRight size={20} />
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Don't have an account? <Link to="/register" className="text-[#00ff88] hover:underline">Create Account</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
