import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiXCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700"
      >
        <div className="bg-red-500/10 dark:bg-red-900/30 p-8 flex justify-center border-b border-gray-100 dark:border-slate-700">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FiXCircle className="w-24 h-24 text-red-500 dark:text-red-400" />
          </motion.div>
        </div>
        
        <div className="p-8 text-center pb-10">
          <h1 className="text-3xl font-extrabold text-[#112429] dark:text-white mb-4">
            Payment Cancelled
          </h1>
          
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 mb-8">
            <p className="text-amber-700 dark:text-amber-400 font-medium">
              Your appointment is not confirmed yet.
            </p>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            The payment process was interrupted. Don't worry, you haven't been charged. Please try booking your appointment again.
          </p>

          <div className="flex flex-col gap-3 justify-center">
            <button
              onClick={() => navigate('/appointments')}
              className="flex items-center justify-center gap-2 bg-[#055153] hover:bg-[#033A3C] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg w-full"
            >
               <FiRefreshCw /> Try Booking Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 hover:border-teal-300 text-[#055153] dark:text-teal-400 font-bold py-3.5 px-6 rounded-xl transition-all w-full"
            >
               <FiArrowLeft /> Return to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
