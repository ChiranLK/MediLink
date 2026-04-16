import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  // We could potentially verify the session here by calling the backend,
  // but for the user flow, the webhook already handles the confirmation.
  
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700"
      >
        <div className="bg-teal-500/10 dark:bg-teal-900/30 p-8 flex justify-center border-b border-gray-100 dark:border-slate-700">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FiCheckCircle className="w-24 h-24 text-teal-600 dark:text-teal-400" />
          </motion.div>
        </div>
        
        <div className="p-8 text-center pb-10">
          <h1 className="text-3xl font-extrabold text-[#112429] dark:text-white mb-4">
            Payment Successful!
          </h1>
          
          <div className="bg-[#F2FDFE] dark:bg-teal-900/10 rounded-2xl p-4 mb-8">
            <p className="text-[#055153] dark:text-teal-300 font-medium">
              Your appointment is now confirmed.
            </p>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Thank you for booking with MediLink. We have sent the receipt to your email address. You can view and manage all your upcoming appointments in your Patient Dashboard.
          </p>

          {sessionId && (
            <p className="text-xs text-slate-400 mb-8 max-w-[250px] mx-auto truncate" title={sessionId}>
              Session ID: {sessionId}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="flex items-center justify-center gap-2 bg-[#055153] hover:bg-[#033A3C] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            >
               Go to Dashboard <FiArrowRight />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
