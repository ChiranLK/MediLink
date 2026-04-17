import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  Search,
  X,
  Loader2,
  Users,
  FileText,
  ClipboardList,
  PenLine,
  Plus,
  Trash2,
  Calendar,
  Pill,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import customFetch from "../../utils/customFetch";
import { useDoctorContext } from "../../context/DoctorContext";

// --- Helpers ---

const shortId = (id) => (id ? `#${String(id).slice(-6).toUpperCase()}` : "");

const fmtDate = (d) => {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const fmtMonthKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

const fmtMonthLabel = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const getConditionBadge = (h) => {
  if (!h) return null;
  const l = h.toLowerCase();
  if (l.includes("diabetes"))
    return {
      label: "Diabetes",
      cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
  if (l.includes("hypertension"))
    return {
      label: "Hypertension",
      cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    };
  if (l.includes("heart"))
    return {
      label: "Heart Disease",
      cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
  if (l.includes("post-op") || l.includes("surgery"))
    return {
      label: "Post-Op",
      cls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    };
  if (l.includes("cancer") || l.includes("oncol"))
    return {
      label: "Oncology",
      cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
  return {
    label: h.slice(0, 14),
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
};

const DEFAULT_NOTE = {
  diagnosis: "",
  notes: "",
  followUpDate: "",
  medicines: [
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ],
};

// --- Shared Modal Shell ---

const Modal = ({ title, subtitle, wide, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div
      className={`bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} max-h-[92vh]`}
    >
      <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
        <div>
          <h3 className="font-bold text-lg text-[#0D1C2E] dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors ml-4"
        >
          <X size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
    </div>
  </div>
);

// --- Patient Card ---

const PatientCard = ({
  patient,
  lastConsult,
  consultCount,
  onHistory,
  onSummary,
  onNote,
}) => {
  const badge = getConditionBadge(patient.medicalHistory);
  const initial = (patient.name || "?")[0].toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#055153]/20 to-[#055153]/5 rounded-2xl flex items-center justify-center">
            <span className="text-[#055153] dark:text-[#0ea5a8] font-black text-2xl">
              {initial}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              {badge && (
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${badge.cls}`}
                >
                  {badge.label}
                </span>
              )}
              <h3 className="font-bold text-[16px] text-[#0D1C2E] dark:text-white leading-tight">
                {patient.name}
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                {patient.gender} · {patient.age} yrs · ID {shortId(patient._id)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-semibold flex-wrap">
            {patient.bloodGroup && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                {patient.bloodGroup}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={10} /> Last seen:{" "}
              {lastConsult ? fmtDate(lastConsult) : "No visits yet"}
            </span>
            <span>
              {consultCount} consult{consultCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onHistory}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all"
        >
          <FileText size={15} /> History
        </button>
        <button
          onClick={onSummary}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all"
        >
          <ClipboardList size={15} /> Summary
        </button>
        <button
          onClick={onNote}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-[#055153] hover:bg-[#044143] text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm"
        >
          <PenLine size={15} /> New Note
        </button>
      </div>
    </div>
  );
};

// --- History Modal ---

const HistoryModal = ({ patient, prescriptions, loading, onClose }) => {
  const [expanded, setExpanded] = useState(null);
  return (
    <Modal
      title="Consultation History"
      subtitle={`Dr's clinical records for ${patient.name}`}
      onClose={onClose}
      wide
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#055153]" size={30} />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText size={44} className="mx-auto mb-3 opacity-25" />
          <p className="font-bold text-base">No consultations recorded</p>
          <p className="text-sm mt-1">
            Use "New Note" to create the first clinical entry.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => {
            const isOpen = expanded === p._id;
            return (
              <div
                key={p._id}
                className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : p._id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        p.status === "active"
                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      <Pill
                        size={16}
                        className={
                          p.status === "active"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400"
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0D1C2E] dark:text-white truncate">
                        {p.diagnosis}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                        <Calendar size={10} /> {fmtDate(p.date)} ·{" "}
                        {p.medicines?.length || 0} medicine
                        {p.medicines?.length !== 1 ? "s" : ""} prescribed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        p.status === "active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {p.status || "active"}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    {p.medicines?.length > 0 && (
                      <div className="mt-3 mb-3">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                          Medicines prescribed on {fmtDate(p.date)}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {p.medicines.map((m, i) => (
                            <div
                              key={i}
                              className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-700 border-l-2 border-l-[#055153]"
                            >
                              <p className="font-bold text-sm text-[#0D1C2E] dark:text-white">
                                {m.name}
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                {m.dosage && <span>{m.dosage}</span>}
                                {m.frequency && (
                                  <span className="flex items-center gap-0.5">
                                    <Calendar size={9} /> {m.frequency}
                                  </span>
                                )}
                                {m.duration && <span>{m.duration}</span>}
                              </div>
                              {m.instructions && (
                                <div className="mt-2 flex items-start gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1.5 rounded-lg text-[11px] font-medium">
                                  <Info
                                    size={11}
                                    className="mt-0.5 flex-shrink-0"
                                  />
                                  {m.instructions}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {p.notes && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic border-l-2 border-slate-300 dark:border-slate-600 pl-3 py-1">
                        "{p.notes}"
                      </p>
                    )}
                    {p.followUpDate && (
                      <p className="text-[11px] text-[#055153] dark:text-[#0ea5a8] font-bold mt-2 flex items-center gap-1">
                        <Calendar size={11} /> Follow-up:{" "}
                        {fmtDate(p.followUpDate)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

// --- Summary Modal ---

const SummaryModal = ({ patient, prescriptions, loading, onClose }) => (
  <Modal
    title="Prescription Summary"
    subtitle={`All issued prescriptions for ${patient.name}`}
    onClose={onClose}
    wide
  >
    {loading ? (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-[#055153]" size={30} />
      </div>
    ) : prescriptions.length === 0 ? (
      <div className="text-center py-12 text-slate-400">
        <ClipboardList size={44} className="mx-auto mb-3 opacity-25" />
        <p className="font-bold">No prescriptions issued</p>
        <p className="text-sm mt-1">
          No doctor has issued a prescription for this patient yet.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {prescriptions.map((p) => (
          <div
            key={p._id}
            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="font-bold text-[#0D1C2E] dark:text-white">
                  {p.diagnosis}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Calendar size={10} /> Issued: {fmtDate(p.date)}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
                  p.status === "active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
                {p.status || "active"}
              </span>
            </div>

            {p.medicines?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.medicines.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-[#055153]/10 text-[#055153] dark:bg-[#055153]/20 dark:text-[#0ea5a8] px-2.5 py-1 rounded-lg"
                  >
                    {m.name}
                    {m.dosage ? ` · ${m.dosage}` : ""}
                    {m.frequency ? ` (${m.frequency})` : ""}
                  </span>
                ))}
              </div>
            )}

            {p.notes && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-2">
                "{p.notes}"
              </p>
            )}
            {p.followUpDate && (
              <p className="text-[11px] text-[#055153] dark:text-[#0ea5a8] font-bold flex items-center gap-1">
                <Calendar size={11} /> Follow-up: {fmtDate(p.followUpDate)}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </Modal>
);

// --- New Note Modal ---

const NewNoteModal = ({
  patient,
  form,
  setForm,
  onSubmit,
  onClose,
  submitting,
}) => {
  const setMed = (i, field, val) =>
    setForm((f) => ({
      ...f,
      medicines: f.medicines.map((m, idx) =>
        idx === i ? { ...m, [field]: val } : m,
      ),
    }));
  const addMed = () =>
    setForm((f) => ({
      ...f,
      medicines: [
        ...f.medicines,
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
    }));
  const removeMed = (i) =>
    setForm((f) => ({
      ...f,
      medicines: f.medicines.filter((_, idx) => idx !== i),
    }));

  const inp =
    "w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#055153]/20 focus:border-[#055153] outline-none";
  const lbl =
    "block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    <Modal
      title="New Clinical Note"
      subtitle={`For patient: ${patient.name}`}
      onClose={onClose}
      wide
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className={lbl}>
            Diagnosis <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={form.diagnosis}
            placeholder="Primary diagnosis..."
            onChange={(e) =>
              setForm((f) => ({ ...f, diagnosis: e.target.value }))
            }
            className={`${inp} resize-none`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={lbl}>Medicines</label>
            <button
              type="button"
              onClick={addMed}
              className="flex items-center gap-1 text-[#055153] dark:text-[#0ea5a8] text-xs font-bold hover:underline"
            >
              <Plus size={12} /> Add
            </button>
          </div>
          <div className="space-y-3">
            {form.medicines.map((m, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 relative"
              >
                <button
                  type="button"
                  onClick={() => removeMed(i)}
                  disabled={form.medicines.length === 1}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="col-span-2">
                    <input
                      value={m.name}
                      onChange={(e) => setMed(i, "name", e.target.value)}
                      placeholder="Medicine name *"
                      className={inp}
                    />
                  </div>
                  <input
                    value={m.dosage}
                    onChange={(e) => setMed(i, "dosage", e.target.value)}
                    placeholder="Dosage (e.g. 500mg)"
                    className={inp}
                  />
                  <input
                    value={m.frequency}
                    onChange={(e) => setMed(i, "frequency", e.target.value)}
                    placeholder="Frequency (e.g. TID)"
                    className={inp}
                  />
                  <input
                    value={m.duration}
                    onChange={(e) => setMed(i, "duration", e.target.value)}
                    placeholder="Duration (e.g. 7 days)"
                    className={inp}
                  />
                  <input
                    value={m.instructions}
                    onChange={(e) => setMed(i, "instructions", e.target.value)}
                    placeholder="Instructions (optional)"
                    className={inp}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={lbl}>Clinical Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            placeholder="Additional observations or notes..."
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={`${inp} resize-none`}
          />
        </div>

        <div>
          <label className={lbl}>Follow-up Date</label>
          <input
            type="date"
            value={form.followUpDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, followUpDate: e.target.value }))
            }
            className={inp}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#055153] hover:bg-[#044143] text-white rounded-xl font-bold transition-all disabled:opacity-60 shadow-[0_4px_14px_rgba(5,81,83,0.3)]"
        >
          {submitting ? "Saving..." : "Save Clinical Note & Prescriptions"}
        </button>
      </form>
    </Modal>
  );
};

// --- Main Patients Component ---

const Patients = () => {
  const { doctorId, doctorProfile, startRouteLoading, stopRouteLoading } =
    useDoctorContext();
  const effectiveDoctorId = doctorId || doctorProfile?._id;

  // Core data
  const [allPatients, setAllPatients] = useState([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter / search
  const [activeMonth, setActiveMonth] = useState("all");
  const [search, setSearch] = useState("");

  // Modal state
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // New Note form
  const [noteForm, setNoteForm] = useState(DEFAULT_NOTE);
  const [submitting, setSubmitting] = useState(false);

  // -- Fetch both datasets in parallel --
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      startRouteLoading();
      try {
        const [pRes, rxRes, aptRes] = await Promise.allSettled([
          customFetch.get("/api/patient/patients"),
          effectiveDoctorId
            ? customFetch.get(
                `/api/prescriptions/doctor/${effectiveDoctorId}?limit=500`,
              )
            : Promise.resolve({ data: { data: [] } }),
          effectiveDoctorId
            ? customFetch.get(
                `/api/doctors/${effectiveDoctorId}/appointments?limit=500`,
              )
            : Promise.resolve({ data: { data: [] } }),
        ]);
        setAllPatients(
          pRes.status === "fulfilled" ? pRes.value.data?.data || [] : [],
        );
        setDoctorPrescriptions(
          rxRes.status === "fulfilled" ? rxRes.value.data?.data || [] : [],
        );
        setDoctorAppointments(
          aptRes.status === "fulfilled" ? aptRes.value.data?.data || [] : [],
        );
      } catch {
        toast.error("Failed to load patient data");
      } finally {
        setLoading(false);
        stopRouteLoading();
      }
    };
    load();
  }, [effectiveDoctorId]);

  // -- Derived: doctor's patients (from prescriptions OR appointments) --
  const doctorPatientIds = useMemo(() => {
    const ids = new Set(doctorPrescriptions.map((p) => p.patientId));
    // Also include patients from appointments
    doctorAppointments.forEach((a) => {
      const pid =
        typeof a.patientId === "object" ? a.patientId?._id : a.patientId;
      if (pid) ids.add(String(pid));
    });
    return ids;
  }, [doctorPrescriptions, doctorAppointments]);

  const doctorPatients = useMemo(
    () =>
      allPatients.filter(
        (p) =>
          doctorPatientIds.has(p._id) ||
          doctorPatientIds.has(String(p._id)) ||
          (p.userId &&
            (doctorPatientIds.has(p.userId) ||
              doctorPatientIds.has(String(p.userId)))),
      ),
    [allPatients, doctorPatientIds],
  );

  // -- Derived: monthly filter tabs from prescription dates --
  const monthTabs = useMemo(() => {
    const map = new Map();
    doctorPrescriptions.forEach((p) => {
      if (!p.date) return;
      const key = fmtMonthKey(p.date);
      if (!map.has(key)) map.set(key, fmtMonthLabel(p.date));
    });
    const sorted = [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    return [
      { key: "all", label: "All Time" },
      ...sorted.map(([key, label]) => ({ key, label })),
    ];
  }, [doctorPrescriptions]);

  // -- Derived: filtered patients --
  const filteredPatients = useMemo(() => {
    let result = doctorPatients;

    if (activeMonth !== "all") {
      const idsInMonth = new Set(
        doctorPrescriptions
          .filter((p) => p.date && fmtMonthKey(p.date) === activeMonth)
          .map((p) => p.patientId),
      );
      result = result.filter((p) => idsInMonth.has(p._id));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p._id?.toLowerCase().includes(q) ||
          p.phone?.includes(q),
      );
    }
    return result;
  }, [doctorPatients, doctorPrescriptions, activeMonth, search]);

  // -- Per-patient consultation stats --
  const getStats = (patientId) => {
    const rx = doctorPrescriptions
      .filter((p) => p.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return { count: rx.length, lastDate: rx[0]?.date || null };
  };

  // -- Handlers --
  const openHistory = (patient) => {
    const rx = doctorPrescriptions
      .filter((p) => p.patientId === patient._id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setSelected(patient);
    setModalData(rx);
    setModal("history");
  };

  const openSummary = async (patient) => {
    setSelected(patient);
    setModal("summary");
    setModalLoading(true);
    setModalData([]);
    try {
      const { data } = await customFetch.get(
        `/api/prescriptions/patient/${patient._id}`,
      );
      setModalData(data?.data || []);
    } catch {
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openNote = (patient) => {
    setSelected(patient);
    setNoteForm(DEFAULT_NOTE);
    setModal("note");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setModalData([]);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteForm.diagnosis.trim()) return toast.error("Diagnosis is required");
    if (!effectiveDoctorId)
      return toast.error("Doctor profile not loaded. Please refresh.");
    setSubmitting(true);
    try {
      const { data } = await customFetch.post("/api/prescriptions", {
        doctorId: effectiveDoctorId,
        patientId: selected._id,
        diagnosis: noteForm.diagnosis,
        medicines: noteForm.medicines.filter((m) => m.name.trim()),
        notes: noteForm.notes,
        followUpDate: noteForm.followUpDate || null,
      });
      // Update local prescriptions list so filters/stats refresh without reload
      setDoctorPrescriptions((prev) => [data.data, ...prev]);
      toast.success("Clinical note saved — visible on patient side now");
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  };

  // -- Export realistic CSV --
  const handleExport = () => {
    const now = new Date().toLocaleString("en-US");
    const doctorName = doctorProfile?.name || "Doctor";
    const spec = doctorProfile?.specialization || "";

    const meta = [
      [`MediLink Clinical Patient Report`],
      [`Generated: ${now}`],
      [`Doctor: Dr. ${doctorName}${spec ? " — " + spec : ""}`],
      [`Total Patients: ${doctorPatients.length}`],
      [],
      [
        "Patient ID",
        "Full Name",
        "Age",
        "Gender",
        "Blood Group",
        "Phone",
        "Address",
        "Medical History",
        "Total Consultations",
        "Last Consultation",
      ],
    ];

    const rows = doctorPatients.map((p) => {
      const { count, lastDate } = getStats(p._id);
      return [
        p._id,
        p.name,
        p.age,
        p.gender,
        p.bloodGroup || "",
        p.phone,
        p.address,
        p.medicalHistory || "",
        count,
        lastDate ? fmtDate(lastDate) : "N/A",
      ];
    });

    const csv = [...meta, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = `MediLink_Patients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // -- Render --
  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 gap-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-black text-[#0D1C2E] dark:text-white tracking-tight">
            My Patients
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            <span className="font-bold text-[#0D1C2E] dark:text-white">
              {doctorPatients.length}
            </span>{" "}
            patients under your care
            {activeMonth !== "all" &&
              filteredPatients.length !== doctorPatients.length && (
                <span className="text-[#055153] dark:text-[#0ea5a8]">
                  {" "}
                  · {filteredPatients.length} this period
                </span>
              )}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={doctorPatients.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(16,185,129,0.28)] self-start sm:self-auto"
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Month Filter + Search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
            Filter by month
          </span>
          {monthTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveMonth(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeMonth === tab.key
                  ? "bg-[#055153] text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#055153]/40 hover:text-[#055153] dark:hover:text-[#0ea5a8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or phone..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#055153]/20 focus:border-[#055153] outline-none"
          />
        </div>
      </div>

      {/* Patient Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2
              className="animate-spin text-[#055153] mx-auto mb-3"
              size={36}
            />
            <p className="text-slate-400 text-sm font-semibold">
              Loading your patients…
            </p>
          </div>
        </div>
      ) : doctorPatients.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Users size={52} className="opacity-20" />
          <p className="font-bold text-base">No patients yet</p>
          <p className="text-sm text-center max-w-xs">
            Patients will appear here once you write your first clinical note or
            prescription for them.
          </p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Search size={44} className="opacity-20" />
          <p className="font-bold">No results found</p>
          <p className="text-sm">Try a different month or search term.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
            {filteredPatients.map((patient) => {
              const { count, lastDate } = getStats(patient._id);
              return (
                <PatientCard
                  key={patient._id}
                  patient={patient}
                  lastConsult={lastDate}
                  consultCount={count}
                  onHistory={() => openHistory(patient)}
                  onSummary={() => openSummary(patient)}
                  onNote={() => openNote(patient)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === "history" && selected && (
        <HistoryModal
          patient={selected}
          prescriptions={modalData}
          loading={false}
          onClose={closeModal}
        />
      )}
      {modal === "summary" && selected && (
        <SummaryModal
          patient={selected}
          prescriptions={modalData}
          loading={modalLoading}
          onClose={closeModal}
        />
      )}
      {modal === "note" && selected && (
        <NewNoteModal
          patient={selected}
          form={noteForm}
          setForm={setNoteForm}
          onSubmit={handleCreateNote}
          onClose={closeModal}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default Patients;
