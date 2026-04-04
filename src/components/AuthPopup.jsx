import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader } from 'lucide-react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import emailjs from '@emailjs/browser';

const AuthPopup = ({ isOpen, onClose, isInitialLogin = false }) => {
    const [step, setStep] = useState('AUTH'); // AUTH or EMAIL_OTP
    const [isLogin, setIsLogin] = useState(isInitialLogin);
    const [countryCode, setCountryCode] = useState('+91');
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    
    // OTP fields
    const [enteredEmailOtp, setEnteredEmailOtp] = useState('');
    const [generatedEmailOtp, setGeneratedEmailOtp] = useState('');
    
    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset state when popup closes
        if (!isOpen) {
            setStep('AUTH');
            // Remove specific reset if we want it to persist when clicking back and forth
            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setPhone('');
            setEnteredEmailOtp('');
            setGeneratedEmailOtp('');
            setError('');
            setIsLoading(false);
        } else {
            setIsLogin(isInitialLogin);
        }
    }, [isOpen, isInitialLogin]);

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            // LOGIN FLOW
            if (!email || !password) {
                setError('Email and password are required.');
                return;
            }
            setIsLoading(true);
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Fetch extra profile data from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const profile = userDoc.exists() ? userDoc.data() : {};

                localStorage.setItem('user', JSON.stringify({
                    id: user.uid,
                    email: user.email,
                    firstName: profile.firstName || user.displayName?.split(' ')[0] || '',
                    lastName: profile.lastName || user.displayName?.split(' ')[1] || '',
                    phone: ''
                }));

                onClose();
                window.location.reload();
            } catch (err) {
                console.error(err);
                if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                    setError('Invalid email or password.');
                } else {
                    setError('Error logging in. Please try again.');
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            // SIGNUP FLOW -> Trigger EmailJS OTP first
            if (!firstName || !email || !password || !phone) {
                setError('First Name, Email, Password, and Phone Number are required.');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
            }
            // Basic mobile validation (10 digits after country code if India, otherwise flexible)
            if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(phone)) {
                setError('Please enter a valid 10-digit Indian mobile number.');
                return;
            } else if (phone.length < 7) {
                setError('Please enter a valid phone number.');
                return;
            }

            setIsLoading(true);
            try {
                // Generate a 6-digit OTP
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                setGeneratedEmailOtp(otpCode);
                
                const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
                const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
                const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

                if (serviceId && templateId && publicKey) {
                    await emailjs.send(
                        serviceId,
                        templateId,
                        {
                            to_name: firstName,
                            to_email: email,
                            otp_code: otpCode,
                        },
                        publicKey
                    );
                    console.log('OTP sent successfully via EmailJS');
                } else {
                    console.warn('[DEV MODE] Emulated Email OTP since VITE_EMAILJS variables are missing. Code:', otpCode);
                }
                
                setStep('EMAIL_OTP');
            } catch (err) {
                console.error('EmailJS Error:', err);
                setError('Failed to send verification email. Check configuration.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyEmailOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Allow '123456' as a universal bypass for testing since actual emails aren't sent yet
        if (enteredEmailOtp !== generatedEmailOtp && enteredEmailOtp !== '123456') {
            setError('Invalid email verification code.');
            setIsLoading(false);
            return;
        }

        try {
            // OTP Verified! Now create the Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: `${firstName} ${lastName}`.trim() });

            const profileData = {
                uid: user.uid,
                firstName,
                lastName,
                phone: `${countryCode}${phone}`,
                email,
                createdAt: serverTimestamp()
            };

            await setDoc(doc(db, 'users', user.uid), profileData);

            localStorage.setItem('user', JSON.stringify({
                id: user.uid,
                email: user.email,
                firstName,
                lastName,
                phone: `${countryCode}${phone}`
            }));
            
            onClose();
            window.location.reload();
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please go back and log in.');
            } else {
                setError(error.message || 'Error creating account.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-md bg-[#111] border border-[#333] p-8 md:p-10 shadow-2xl overflow-hidden"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black uppercase text-white tracking-tight mb-2">
                            {step === 'EMAIL_OTP' ? 'Verify your Email' : (isLogin ? 'Welcome Back' : 'Join Footprint')}
                        </h2>
                        <p className="text-gray-400 text-sm font-mono leading-relaxed">
                            {step === 'EMAIL_OTP' 
                                ? `We sent a code to ${email}`
                                : (isLogin ? 'Enter your email and password to access your account.' : 'Create an account to get exclusive access to drops and smart-fit technology.')}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-mono">
                            {error}
                        </div>
                    )}

                    {/* AUTH STEP (LOGIN / SIGNUP) */}
                    {step === 'AUTH' && (
                        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5">
                            {!isLogin && (
                                <div className="flex flex-col gap-5">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First Name"
                                            className="w-1/2 bg-transparent border-b-2 border-[#333] py-3 text-white font-mono focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-600"
                                            required={!isLogin}
                                        />
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last Name"
                                            className="w-1/2 bg-transparent border-b-2 border-[#333] py-3 text-white font-mono focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="bg-transparent border-b-2 border-[#333] py-3 text-white font-mono focus:outline-none focus:border-[#00ff88] transition-colors appearance-none cursor-pointer"
                                        >
                                            <option className="bg-[#111]" value="+91">+91 (IN)</option>
                                            <option className="bg-[#111]" value="+1">+1 (US)</option>
                                            <option className="bg-[#111]" value="+44">+44 (UK)</option>
                                            <option className="bg-[#111]" value="+971">+971 (UAE)</option>
                                            <option className="bg-[#111]" value="+61">+61 (AU)</option>
                                        </select>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Phone Number"
                                            className="flex-1 bg-transparent border-b-2 border-[#333] py-3 text-white font-mono focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-600"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full bg-transparent border-b-2 border-[#333] py-3 text-white font-mono focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-600"
                                required
                            />

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-transparent border-b-2 border-[#333] py-3 text-white font-mono focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-600"
                                required
                            />
                            
                            <button
                                type="submit"
                                disabled={isLoading || !email || !password || (!isLogin && (!firstName || !phone))}
                                className="w-full bg-white text-black font-black uppercase tracking-widest py-4 mt-4 hover:bg-[#00ff88] transition-colors border-2 border-transparent disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader className="animate-spin" size={20} /> : (isLogin ? 'Log In' : 'Join Us')}
                                {!isLoading && <ArrowRight size={20} />}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-xs text-gray-500 font-mono hover:text-[#00ff88] transition-colors mt-2 text-center w-full"
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                            </button>
                        </form>
                    )}

                    {/* EMAIL OTP STEP (ONLY FOR SIGNUP) */}
                    {step === 'EMAIL_OTP' && (
                        <form onSubmit={handleVerifyEmailOTP} className="flex flex-col gap-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={enteredEmailOtp}
                                    onChange={(e) => setEnteredEmailOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="w-full bg-transparent border-b-2 border-[#333] py-4 text-white text-xl font-mono focus:outline-none focus:border-[#00ff88] transition-colors text-center tracking-[1rem]"
                                    maxLength={6}
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading || enteredEmailOtp.length !== 6}
                                className="w-full bg-white text-black font-black uppercase tracking-widest py-4 mt-4 hover:bg-[#00ff88] transition-colors border-2 border-transparent disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader className="animate-spin" size={20} /> : 'Complete Registration'}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => setStep('AUTH')}
                                className="text-xs text-gray-500 font-mono hover:text-[#00ff88] transition-colors text-center w-full"
                            >
                                Edit details
                            </button>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthPopup;
