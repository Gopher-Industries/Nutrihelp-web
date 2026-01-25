import React, { useState } from 'react';
import BreachCheckForm from '../modules/Medical_Breach_Harsh_Kanojia/components/BreachCheckForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, AlertTriangle, ChevronDown, Lock, Activity, Users } from 'lucide-react';

// --- Floating Icon Component ---
const FloatingIcon = ({ Icon, top, left, right, bottom, color, delay }) => (
    <motion.div
        className={`absolute ${color} pointer-events-none opacity-40`}
        style={{ top, left, right, bottom }}
        animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
        }}
        transition={{
            duration: 5,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    >
        <Icon size={48} />
    </motion.div>
);

// --- Risk Explorer Card Component ---
const RiskCard = ({ icon: Icon, title, description, color }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            layout
            onHoverStart={() => setIsOpen(true)}
            onHoverEnd={() => setIsOpen(false)}
            className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${color === 'red' ? 'border-l-red-500' : color === 'blue' ? 'border-l-blue-500' : 'border-l-amber-500'} cursor-pointer overflow-hidden relative group`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color === 'red' ? 'bg-red-50 text-red-600' : color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Icon size={24} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-slate-400">
                    <ChevronDown size={20} />
                </motion.div>
            </div>

            <p className="text-slate-500 font-medium text-sm leading-relaxed">
                Hover to learn more...
            </p>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                    >
                        <p className="text-slate-600 text-sm leading-relaxed border-t pt-3 border-slate-100">
                            {description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${color === 'red' ? 'bg-red-500' : color === 'blue' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
        </motion.div>
    );
};

const BreachDetectionPage = () => {
    return (
        <div className="min-h-0 bg-slate-50 font-sans overflow-x-hidden">
            {/* Soft Medical Hero Gradient */}
            <div className="relative bg-gradient-to-b from-blue-50 via-white to-slate-50 pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
                {/* Background Decor & Animations */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/40 to-transparent skew-x-12 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>

                {/* EKG Pulse Animation */}
                <svg className="absolute top-1/2 left-0 w-full h-32 opacity-20 pointer-events-none" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <motion.path
                        d="M0,60 L200,60 L230,20 L260,100 L290,60 L1200,60"
                        fill="none"
                        stroke="#10b981" // Emerald
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1, pathOffset: [0, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </svg>

                {/* Floating Medical/Security Particles */}
                <FloatingIcon Icon={ShieldCheck} top="10%" left="5%" color="text-blue-200" delay={0} />
                <FloatingIcon Icon={Activity} top="15%" right="10%" color="text-emerald-200" delay={1} />
                <FloatingIcon Icon={Lock} bottom="20%" left="10%" color="text-blue-100" delay={2} />
                <FloatingIcon Icon={FileText} top="10%" left="45%" color="text-emerald-100" delay={1.5} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* LEFT COLUMN: Text Content */}
                        <div className="text-center lg:text-left flex flex-col items-center lg:items-start relative z-20">
                            {/* Glowing Background Behind Text (localized) */}
                            <div className="absolute top-1/2 left-1/2 lg:left-0 -translate-x-1/2 lg:-translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/20 blur-[100px] rounded-full pointer-events-none mix-blend-multiply opacity-50"></div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-blue-100/50 shadow-sm text-blue-600 text-sm font-bold tracking-wider uppercase mb-6"
                            >
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nutrihelp Security Center</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                                className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6 drop-shadow-sm"
                            >
                                Is Your Health Data <br className="hidden lg:block" />
                                <motion.span
                                    className="relative inline-block text-transparent bg-clip-text bg-[linear-gradient(to_right,#3b82f6,#10b981,#3b82f6)] bg-[length:200%_auto] pb-2"
                                    animate={{
                                        backgroundPosition: ["0% center", "200% center"],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                >
                                    Safe & Secure?
                                    {/* Underline decoration */}
                                    <svg className="absolute w-full h-4 -bottom-1 left-0 pointer-events-none opacity-60" viewBox="0 0 200 9">
                                        <path fill="#10b981" d="M2.00025 8.99997C2.00025 8.99997 -4.00025 -1.00003 128.001 3.50001C260.002 8.00004 186.002 8.99997 186.002 8.99997" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </motion.span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-2xl lg:max-w-none mb-8"
                            >
                                Medical records are <span className="text-blue-600 font-bold">10x more valuable</span> than credit cards on the dark web.
                                Instantly check if your sensitive information has been exposed.
                            </motion.p>
                        </div>

                        {/* RIGHT COLUMN: Breach Form */}
                        <div className="w-full relative z-30">
                            <BreachCheckForm />
                        </div>
                    </div>
                </div>
            </div>

            {/* "Why It Matters" - Interactive Risk Explorer */}
            <div className="bg-white py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 cursor-default inline-block"
                        >
                            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 transition-all duration-300">Medical Data Privacy</span> Matters
                        </motion.h2>

                        <motion.div
                            className="flex justify-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <p className="text-slate-500 max-w-2xl mx-auto text-lg hover:text-slate-700 transition-colors duration-300">
                                It's not just about privacy. A compromised medical identity can have
                                <span className="font-semibold text-red-500 mx-1">real-world financial</span>
                                and
                                <span className="font-semibold text-red-500 mx-1">legal consequences</span>.
                                Explore the risks below.
                            </p>
                        </motion.div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <RiskCard
                            icon={Files}
                            title="Medical Identity Theft"
                            color="red"
                            description="Criminals can use your health ID to get surgery, drugs, or make false claims, leaving you with the bill and a corrupted medical history that could endanger your life."
                        />
                        <RiskCard
                            icon={Lock}
                            title="Insurance Fraud"
                            color="blue"
                            description="Stolen policy numbers allow fraudsters to exhaust your benefits caps. You might be denied critical care later because your insurance thinks you've already used it."
                        />
                        <RiskCard
                            icon={Users}
                            title="Targeted Phishing"
                            color="amber"
                            description="Knowing your specific conditions allows scammers to craft highly convincing emails pretending to be your doctor or pharmacy, tricking you into revealing more data."
                        />
                        <RiskCard
                            icon={AlertTriangle}
                            title="Sensitive Exposure"
                            color="purple"
                            description="Private diagnoses (mental health, infectious diseases) can be weaponized for blackmail, workplace discrimination, or public social stigma if leaked."
                        />
                    </div>

                    {/* Reassurance/Trust Section */}
                    <div className="mt-20 bg-slate-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-100">
                        <div className="flex-1">
                            <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Activity className="text-emerald-600" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Nutrihelp Guardian Promise</h3>
                            <p className="text-slate-600 leading-relaxed">
                                We believe in proactive health defense. This tool is free, private, and powered by the Have I Been Pwned API. We never store, log, or share your search query.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="text-3xl font-bold text-blue-600 mb-1">256-bit</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Encryption</div>
                            </div>
                            <div className="text-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="text-3xl font-bold text-emerald-600 mb-1">0%</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Logs</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Start Icon helper due to Lucide imports mismatch sometimes
const Files = ({ size }) => <FileText size={size} />;

export default BreachDetectionPage;
