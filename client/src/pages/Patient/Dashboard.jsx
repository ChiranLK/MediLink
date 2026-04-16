import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Video, 
  PlusCircle, 
  FileText, 
  Upload, 
  Download,
  Activity,
  Heart,
  Moon,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import customFetch from '@/utils/customFetch';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const [isJoining, setIsJoining] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState('none');
  const [nextAppointment, setNextAppointment] = useState(null);
  const [nextConsultation, setNextConsultation] = useState(null);

  useEffect(() => {
    const loadNextAppointment = async () => {
      try {
        const { data } = await customFetch.get('/api/appointment/my-appointments');
        const apts = data.appointments || data.data || data || [];
        
        // Find the next upcoming confirmed appointment
        const confirmed = apts
          .filter(a => a.status === 'Confirmed')
          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        
        const apt = confirmed[0] || null;
        setNextAppointment(apt);

        if (apt) {
          try {
            const { data: cData } = await customFetch.get(`/api/consultations/${apt._id}`);
            if (cData.success) {
              setNextConsultation(cData.data);
              setConsultationStatus(cData.data.status);
            }
          } catch {
            // No session yet — doctor hasn't started it
            setConsultationStatus('none');
          }
        }
      } catch (err) {
        // Appointment service unavailable — graceful degradation
      }
    };
    loadNextAppointment();
  }, []);

  const handleJoinVideoCall = async () => {
    if (!nextAppointment) {
      toast.error('No upcoming appointment found.');
      return;
    }
    if (consultationStatus === 'completed') {
      toast.error('This session has already ended.');
      return;
    }
    if (consultationStatus === 'none' || !nextConsultation) {
      toast.error('Your doctor has not started the session yet. Please wait.');
      return;
    }

    setIsJoining(true);
    try {
      const { meetingLink, status } = nextConsultation;
      if (status === 'completed') {
        setConsultationStatus('completed');
        toast.error('This session has already ended.');
        return;
      }
      toast.success('Opening video consultation…');
      // Frontend should open meetingLink in browser for video call
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error('Video call is not ready yet. Please wait for the doctor.');
    } finally {
      setIsJoining(false);
    }
  };


  // Mock data ...
  const stats = [
    { label: 'STEP COUNT', value: '8,432', sub: '/ 10k', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'HEART RATE', value: '72', sub: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'SLEEP QUALITY', value: '7h 45m', sub: 'Good', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const recentDocs = [
    { title: 'Blood Test Results', date: 'May 15, 2024 • LabCorp', icon: FileText },
    { title: 'Prescription Renewal - Lisinopril', date: 'May 10, 2024 • Dr. Aris Thorne', icon: FileText },
    { title: 'Annual Physical Summary', date: 'April 22, 2024 • Aura Wellness', icon: FileText },
  ];

  const medicalTeam = [
    { name: 'Dr. A. Thorne', role: 'PRIMARY CARE', img: 'https://i.pravatar.cc/150?img=11', status: 'online' },
    { name: 'Dr. L. Chen', role: 'NEUROLOGY', img: 'https://i.pravatar.cc/150?img=5', status: 'offline' },
    { name: 'Dr. K. Miller', role: 'ORTHOPEDICS', img: 'https://i.pravatar.cc/150?img=8', status: 'online' },
  ];

  return (
    <div className="w-full animate-fade-in pb-10">
      {/* Header Greeting */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-black mb-2 select-none" style={{color: '#000000'}}>
          Good morning, {user?.name?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'Patient'}
        </h1>
        <p className="text-base font-medium text-slate-700">
          {format(today, 'EEEE, MMMM do, yyyy')} • You have 1 appointment today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        
        {/* Next Appointment Card (Spans 2 columns) */}
        <div className="lg:col-span-2 relative overflow-hidden bg-[#0D877B] rounded-[24px] p-8 text-white shadow-lg shadow-[#0D877B]/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="z-10 w-full md:w-auto">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wider uppercase mb-4">
              Next Appointment
            </div>
            <h2 className="text-[32px] font-bold leading-tight mb-2">
              {nextAppointment
                ? (nextAppointment.specialization || nextAppointment.recommendedSpecialty || 'Consultation')
                : 'No Upcoming Appointments'}
            </h2>
            <p className="text-white/80 text-[15px] mb-8">
              {nextAppointment
                ? (() => {
                    try {
                      const d = new Date(nextAppointment.appointmentDate);
                      return `${nextAppointment.recommendedSpecialty || 'General'} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n${d.toDateString()}`;
                    } catch { return 'Date TBD'; }
                  })()
                : 'Book an appointment to get started'}
            </p>
            <button 
              onClick={handleJoinVideoCall}
              disabled={isJoining || consultationStatus === 'completed' || !nextAppointment}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-[15px] transition-all shadow-sm disabled:opacity-50 ${
                consultationStatus === 'completed' || !nextAppointment
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : consultationStatus === 'none'
                  ? 'bg-white/20 text-white border border-white/40 cursor-not-allowed'
                  : 'bg-white text-[#0D877B] hover:bg-emerald-50'
              }`}
            >
              <Video size={18} />
              {isJoining ? 'Connecting…'
                : !nextAppointment ? 'No Appointment'
                : consultationStatus === 'completed' ? 'Session Ended'
                : consultationStatus === 'none' ? 'Waiting for Doctor…'
                : 'Join Video Call'}
            </button>
          </div>


          <div className="relative z-10 w-full md:w-auto flex justify-end">
             {/* Doctor Portrait styled like the image */}
             <div className="w-48 h-48 md:w-[220px] md:h-[220px] rounded-[20px] overflow-hidden border-4 border-white/20 shadow-xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop" 
                  alt="Dr. Sarah Jenkins" 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>

          {/* Decorative background vectors */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>
        </div>

        {/* Quick Actions (Right side column) */}
        <div className="flex flex-col gap-4 w-full">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Quick Actions</h3>
          
          <button onClick={() => navigate('/viewAppointments')} className="flex items-center gap-4 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all font-bold text-[#0D1C2E] text-[15px]">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#0D877B]">
              <PlusCircle size={20} />
            </div>
            View my Appointment
          </button>

          <button className="flex items-center gap-4 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all font-bold text-[#0D1C2E] text-[15px]">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText size={20} />
            </div>
            Request Prescription
          </button>

          <button className="flex items-center gap-4 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all font-bold text-[#0D1C2E] text-[15px]">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Upload size={20} />
            </div>
            Upload Medical Report
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-[#0D1C2E] leading-none">{stat.value}</span>
                  <span className="text-[13px] font-medium text-slate-400">{stat.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Documents */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-bold text-[#0D1C2E]">Recent Documents</h3>
            <button className="text-[#0D877B] text-[14px] font-bold hover:underline">View All</button>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentDocs.map((doc, i) => {
              const Icon = doc.icon;
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0D1C2E] text-[15px]">{doc.title}</h4>
                      <p className="text-[12px] text-slate-500 mt-0.5">{doc.date}</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#0D877B] group-hover:border-[#0D877B] transition-colors shadow-sm">
                    <Download size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Medical Team */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-[18px] font-bold text-[#0D1C2E] mb-8">My Medical Team</h3>
          
          <div className="flex justify-around items-end mb-10 flex-1">
            {medicalTeam.map((dr, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-[88px] h-[88px] rounded-full p-1 border-2 border-slate-100 mb-3 relative">
                  <img src={dr.img} alt={dr.name} className="w-full h-full rounded-full object-cover" />
                  <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${dr.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                </div>
                <h4 className="font-bold text-[#0D1C2E] text-[15px] text-center">{dr.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 text-center">{dr.role}</p>
              </div>
            ))}
          </div>

          <button className="w-full py-3.5 border-2 border-slate-100 hover:border-slate-200 text-[#0D1C2E] rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors">
            <Users size={18} className="opacity-70" />
            Directory
          </button>
        </div>

      </div>

      <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
        <div>
          <span className="font-bold text-[#055153]">Aura <span className="font-medium">Health</span></span>
          <p className="text-xs text-gray-400 mt-1">© 2024 Aura Health. All rights reserved. HIPAA Compliant & Secure Data.</p>
        </div>
        <a href="#" className="text-xs text-gray-400 hover:text-[#055153]">Privacy Policy</a>
      </div>
    </div>
  );
};

export default PatientDashboard;
