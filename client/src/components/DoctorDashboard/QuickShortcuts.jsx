import React from 'react';
import { FileText, Users, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts = [
    {
      id: 1,
      label: 'Add Prescription',
      icon: FileText,
      primary: true,
      to: '/doctor/patients',
    },
    {
      id: 2,
      label: 'View Patient Registry',
      icon: Users,
      primary: false,
      to: '/doctor/patients',
    },
    {
      id: 3,
      label: 'Set Availability',
      icon: CalendarCheck,
      primary: false,
      to: '/doctor/availability',
    }
  ];

  return (
    <div className="font-inter">
      <h3 className="text-[17px] font-bold text-[#112429] dark:text-white font-manrope mb-4 transition-colors">Quick Shortcuts</h3>
      <div className="flex flex-col gap-3">
        {shortcuts.map((shortcut) => (
          <button 
            key={shortcut.id}
            onClick={() => navigate(shortcut.to)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group ${
              shortcut.primary 
                ? 'bg-[#055153] dark:bg-teal-600 text-white hover:bg-[#044143] dark:hover:bg-teal-500 shadow-md shadow-[#055153]/20 dark:shadow-black/20' 
                : 'bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 text-[#112429] dark:text-slate-300 hover:border-[#055153]/50 dark:hover:border-teal-500/50 hover:shadow-sm transition-all'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              shortcut.primary 
                ? 'bg-white/20 dark:bg-white/10' 
                : 'bg-[#E6F3F3] dark:bg-teal-500/10 text-[#055153] dark:text-teal-400 group-hover:bg-[#055153] dark:group-hover:bg-teal-500 group-hover:text-white transition-colors'
            }`}>
              <shortcut.icon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[14px] font-bold">{shortcut.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickShortcuts;

