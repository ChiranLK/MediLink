import React, { useEffect, useState } from 'react';
import { Download, FileText, Loader2, User, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { patientApi } from '../../patient/services/patientApi';
import { useDoctorContext } from '../../context/DoctorContext';
import toast from 'react-hot-toast';

const REPORT_TYPE_COLORS = {
  'X-Ray':        'bg-blue-100 text-blue-700',
  'MRI':          'bg-purple-100 text-purple-700',
  'CT Scan':      'bg-orange-100 text-orange-700',
  'Blood Test':   'bg-red-100 text-red-700',
  'ECG':          'bg-green-100 text-green-700',
  'Ultrasound':   'bg-cyan-100 text-cyan-700',
  'Other':        'bg-gray-100 text-gray-700',
};

const typeBadge = (type) => REPORT_TYPE_COLORS[type] || REPORT_TYPE_COLORS['Other'];

const DoctorReports = () => {
  const { doctorId, isLoadingProfile } = useDoctorContext();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!doctorId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await patientApi.getIncomingReportsForDoctor(doctorId);
      setReports(res.data || []);
    } catch (e) {
      console.error('[DoctorReports]', e);
      const msg = e.response?.data?.message || 'Could not load patient reports';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [doctorId]);

  /* ── Loading ── */
  if (isLoadingProfile || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-teal-600" size={36} />
        <p className="text-slate-500 font-medium">Loading patient reports…</p>
      </div>
    );
  }

  /* ── No doctor profile ── */
  if (!doctorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 p-8 text-center">
        <AlertCircle size={40} className="text-amber-500" />
        <p className="text-slate-700 font-semibold text-lg">Doctor profile not set up</p>
        <p className="text-slate-500 text-sm max-w-md">
          Complete your doctor profile to view reports from your patients.
        </p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <AlertCircle size={40} className="text-red-500" />
        <p className="text-slate-700 font-semibold text-lg">Failed to load reports</p>
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Patient Reports</h1>
        <p className="text-slate-500 text-sm">
          Medical reports uploaded by patients who have booked appointments with you.
        </p>
      </div>

      {/* Empty state */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <FileText size={48} className="text-slate-300" />
          <p className="text-slate-500 font-medium">No patient reports yet.</p>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Reports uploaded by your patients will appear here once they book an appointment.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Patient &amp; Description</span>
            <span className="text-center">Type</span>
            <span className="text-right">Date</span>
            <span className="text-right">Action</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {reports.map((r) => (
              <li
                key={r._id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-slate-50 transition"
              >
                {/* Patient + description */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      <User size={11} />
                      {r.senderPatientName || 'Patient'}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium truncate text-sm">{r.description}</p>
                  {r.fileSize ? (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(r.fileSize / 1024).toFixed(0)} KB
                    </p>
                  ) : null}
                </div>

                {/* Report type */}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${typeBadge(r.reportType)}`}
                >
                  {r.reportType || 'Report'}
                </span>

                {/* Date */}
                <span className="text-xs text-slate-500 whitespace-nowrap text-right">
                  {r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : '—'}
                </span>

                {/* Download */}
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition whitespace-nowrap"
                >
                  <Download size={14} />
                  Download
                </a>
              </li>
            ))}
          </ul>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
            {reports.length} report{reports.length !== 1 ? 's' : ''} total
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorReports;
