import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { loginUser, signInWithGoogle } from '../firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await loginUser({ email, password });
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch (err) {
            console.error('Login error', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else {
                setError('Unable to sign in. Please try again.');
            }
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const user = await signInWithGoogle();
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch (err) {
            console.error('Google login error', err);
            setError('Unable to sign in with Google. Please try again.');
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

                    <div className="relative mt-6 mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#050505] text-gray-400 font-mono">Or continue with</span>
                        </div>
                    </div>

                    <motion.button
                        onClick={handleGoogleLogin}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Google
                    </motion.button>

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
