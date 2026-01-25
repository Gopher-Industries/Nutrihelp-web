import React, { useState } from 'react';
import { checkMedicalBreach } from '../api';
import BreachResultCard from './BreachResultCard';
import { Loader, Search, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Module Owner: Harsh Kanojia (Junior Cyber Security Lead)

const BreachCheckForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleCheck = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const data = await checkMedicalBreach(email);
            setResults(data);
        } catch (err) {
            setError(err.message || 'An error occurred while checking.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative z-30">
            {/* Premium Highlighted Box - Glassmorphism & Interactive Theme */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-6 md:p-10 border border-white/60 max-w-full mx-auto relative overflow-hidden group hover:shadow-blue-500/20 transition-all duration-500"
            >
                {/* Decorative Top Line with Gradient Animation */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-80"></div>

                {/* Subtle background glow effects */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

                <form onSubmit={handleCheck} className="mb-8 relative z-10">
                    <div className="relative group/input">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="text-slate-400 group-focus-within/input:text-blue-600 transition-colors duration-300" size={22} />
                        </div>
                        <input
                            type="email"
                            placeholder="Enter your email address to scan..."
                            className="w-full pl-14 pr-44 py-5 rounded-full border border-slate-200 bg-slate-50/50 backdrop-blur-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-slate-800 text-lg placeholder:text-slate-400 font-medium hover:border-slate-300 shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group/btn"
                        >
                            {loading ? <Loader className="animate-spin w-5 h-5" /> : (
                                <div className="flex items-center gap-2">
                                    <span className="text-base tracking-wide">Check Now</span>
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                                </div>
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-2 font-medium">
                        <Lock size={16} className="text-green-500" />
                        <span className="text-gray-600">Secure & Confidential.</span> <span className="text-gray-400 font-normal">We do not store your search history.</span>
                    </p>
                </form>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3 animate-pulse">
                        <AlertCircle className="text-red-500 flex-shrink-0" />
                        <div>
                            <h4 className="text-red-800 font-bold text-sm">Error</h4>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {results && results.breaches.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl p-8 text-center"
                    >
                        <ShieldCheck size={48} className="mx-auto text-green-600 mb-4" />
                        <h3 className="text-2xl font-bold text-green-800 mb-2">You're Safe!</h3>
                        <p className="text-green-700">No medical data breaches found for <strong>{results.email}</strong>.</p>
                        <p className="text-green-600 text-sm mt-2">However, always stay vigilant against phishing attempts.</p>
                    </motion.div>
                )}

                {results && results.breaches.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-800">Scan Results</h3>
                            <span className="text-sm bg-red-100 text-red-600 py-1 px-3 rounded-full font-bold">{results.breaches.length} Breaches Found</span>
                        </div>
                        <div className="space-y-4">
                            {results.breaches.map((breach, index) => (
                                <BreachResultCard key={index} breach={breach} index={index} />
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
            {/* Privacy Disclaimer */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-12 mx-auto max-w-2xl"
            >
                <div className="group relative bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl text-blue-600 shrink-0 border border-blue-100 group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck size={20} />
                    </div>

                    <div className="relative">
                        <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                            Bank-Grade Privacy Protocol
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider font-bold">Encrypted</span>
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            This tool securely queries the official <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Have I Been Pwned API</a>.
                            We operate on a <strong>Zero-Log Policy</strong> — your email is never stored, tracked, or shared.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BreachCheckForm;
