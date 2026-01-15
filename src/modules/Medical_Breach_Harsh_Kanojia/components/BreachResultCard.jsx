import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

// Module Owner: Harsh Kanojia (Junior Cyber Security Lead)

const BreachResultCard = ({ breach, index }) => {
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'High': return 'bg-red-50 border-red-500 text-red-900';
            case 'Medium': return 'bg-orange-50 border-orange-500 text-orange-900';
            case 'Low': return 'bg-yellow-50 border-yellow-500 text-yellow-900';
            default: return 'bg-gray-50 border-gray-400 text-gray-900';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`p-5 mb-4 border-l-4 rounded-r-lg shadow-sm hover:shadow-md transition-shadow ${getRiskColor(breach.riskLevel)}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        {breach.riskLevel === 'High' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                        {breach.name}
                    </h3>
                    <p className="text-sm font-semibold opacity-90">{breach.title}</p>
                    <p className="text-xs mt-1 opacity-75">Breach Date: {breach.breachDate}</p>
                </div>
                <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md border ${breach.riskLevel === 'High' ? 'border-red-200 bg-red-100 text-red-700' :
                        breach.riskLevel === 'Medium' ? 'border-orange-200 bg-orange-100 text-orange-700' :
                            'border-yellow-200 bg-yellow-100 text-yellow-700'
                        }`}>
                        {breach.riskLevel} Risk
                    </span>
                </div>
            </div>

            <div className="mt-3 text-sm opacity-90 leading-relaxed" dangerouslySetInnerHTML={{ __html: breach.description }} />

            <div className="mt-4 pt-3 border-t border-black/5">
                <h4 className="text-xs font-bold uppercase mb-2 opacity-75 flex items-center gap-1">
                    Compromised Data:
                </h4>
                <div className="flex flex-wrap gap-2">
                    {breach.dataClasses && breach.dataClasses.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white/60 rounded text-xs font-medium border border-black/5">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default BreachResultCard;
