import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Save } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProfilePopup = ({ isOpen, onClose }) => {
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const userString = localStorage.getItem('user');
            if (userString) {
                const parsedUser = JSON.parse(userString);
                setUser(parsedUser);
                setFirstName(parsedUser.firstName || '');
                setLastName(parsedUser.lastName || '');
                
                // Try to parse country code from phone
                const fullPhone = parsedUser.phone || '';
                const codes = ['+91', '+1', '+44', '+971', '+61'];
                let foundCode = '+91';
                let number = fullPhone;
                
                for (const code of codes) {
                    if (fullPhone.startsWith(code)) {
                        foundCode = code;
                        number = fullPhone.substring(code.length);
                        break;
                    }
                }
                
                setCountryCode(foundCode);
                setPhone(number.replace(/\D/g, ''));
            } else {
                onClose();
            }
        }
    }, [isOpen, onClose]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validation
        if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(phone)) {
            setError('Please enter a valid 10-digit Indian mobile number.');
            return;
        } else if (phone.length < 7) {
            setError('Please enter a valid phone number.');
            return;
        }

        setIsLoading(true);

        const fullPhone = `${countryCode}${phone}`;

        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                firstName,
                lastName,
                phone: fullPhone
            });
            
            const updatedUser = { ...user, firstName, lastName, phone: fullPhone };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setMessage('Profile updated successfully!');
            setTimeout(() => {
                onClose();
                window.location.reload(); // Reload to update navbar easily
            }, 1000);
        } catch (err) {
            console.error(err);
            setError('Failed to update profile. ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;

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
                            Update Profile
                        </h2>
                        <p className="text-gray-400 text-sm font-mono leading-relaxed">
                            Manage your personal information.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-mono">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mb-6 p-3 bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] text-xs font-mono">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="flex flex-col gap-5">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                className="w-1/2 bg-transparent border-b-2 border-[#333] py-3 text-white font-mono focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-600"
                                required
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
                                required
                            />
                        </div>

                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full bg-transparent border-b-2 border-[#333] py-3 text-gray-500 font-mono cursor-not-allowed opacity-50"
                        />
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-black uppercase tracking-widest py-4 mt-4 hover:bg-[#00ff88] transition-colors border-2 border-transparent disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader className="animate-spin" size={20} /> : 'Save Changes'}
                            {!isLoading && <Save size={20} />}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProfilePopup;
