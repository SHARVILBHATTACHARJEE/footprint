import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';
import { registerUser, signInWithGoogle } from '../firebase/auth';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await registerUser({ firstName, lastName, email, password });
            navigate('/login');
        } catch (err) {
            console.error('Registration error', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        try {
            const user = await signInWithGoogle();
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch (err) {
            console.error('Google register error', err);
            setError('Unable to sign in with Google. Please try again.');
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center relative overflow-hidden bg-black text-white p-4">

            {/* Background Animated Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#050505] to-[#000] z-0" />
            <motion.div
                className="absolute w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,#00ff8820_0%,transparent_70%)] opacity-30 blur-3xl z-0 pointer-events-none"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden"
                >
                    <div className="text-center mb-8 relative z-20">
                        <motion.div
                            className="w-16 h-16 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/50"
                            whileHover={{ rotate: 180 }}
                        >
                            <UserPlus className="text-[#00ff88]" size={32} />
                        </motion.div>
                        <h2 className="text-3xl font-bold tracking-wider mb-2">Create Account</h2>
                        <p className="text-gray-400 text-sm">Sign up to get started.</p>
                    </div>

                    <form className="space-y-4 relative z-20" onSubmit={handleRegister}>
                        {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-700"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-700"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

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
                            className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#00ff88] transition-colors mt-6"
                        >
                            Sign Up <ArrowRight size={20} />
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
                        onClick={handleGoogleRegister}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-[#111] border border-[#333] text-white font-bold uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-[#222] transition-colors"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Google
                    </motion.button>

                    <div className="mt-8 text-center relative z-20">
                        <p className="text-gray-500 text-sm">
                            Already have an account? <Link to="/login" className="text-[#00ff88] hover:underline">Log In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
