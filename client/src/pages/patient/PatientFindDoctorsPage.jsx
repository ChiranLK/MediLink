import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  CalendarClock,
  Search,
  Star,
  MapPin,
  Award,
  Clock,
  BadgeCheck,
  Globe,
  Building2,
  Stethoscope,
  X,
  ChevronDown,
  Users,
} from "lucide-react";
import { patientApi } from "@/patient/services/patientApi";
import { useAsyncData } from "@/patient/hooks/useAsyncData";
import LoadingState from "@/patient/components/ui/LoadingState";
import ErrorState from "@/patient/components/ui/ErrorState";
import ModalCard from "@/patient/components/ui/ModalCard";
import { usePatientAuth } from "@/patient/context/PatientAuthContext";
import { useAuth } from "@/context/AuthContext";

const ACCENT_COLORS = [
  "from-teal-500 to-emerald-400",
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
  "from-indigo-500 to-blue-400",
];

function getAccentColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

function DoctorAvatar({ name, image, size = "md" }) {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-2xl",
  };
  const initials = (name || "D")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (image && !image.includes("default-avatar")) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClasses[size]} rounded-2xl object-cover ring-2 ring-white shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br ${getAccentColor(name)} rounded-2xl flex items-center justify-center font-bold text-white ring-2 ring-white shadow-md`}
    >
      {initials}
    </div>
  );
}

function RatingStars({ average = 0, count = 0 }) {
  const stars = Math.round(average * 2) / 2;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={13}
            className={
              i <= Math.floor(stars)
                ? "fill-amber-400 text-amber-400"
                : i - 0.5 === stars
                  ? "fill-amber-400/50 text-amber-400"
                  : "text-slate-200"
            }
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {average > 0 ? average.toFixed(1) : "New"}
      </span>
      {count > 0 && <span className="text-xs text-slate-400">({count})</span>}
    </div>
  );
}

function SpecialtyChip({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-teal-600 text-white shadow-md shadow-teal-200"
          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50"
      }`}
    >
      {label}
      {isActive && <X size={14} className="ml-0.5" />}
    </button>
  );
}

function DoctorCard({ doctor, onBook }) {
  const rating = doctor.rating?.average || 0;
  const reviewCount = doctor.rating?.count || 0;
  const specialty =
    doctor.specialty || doctor.specialization || "General Practice";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5">
      <div
        className={`h-1.5 bg-gradient-to-r ${getAccentColor(doctor.name)}`}
      />

      <div className="p-5">
        <div className="flex gap-4">
          <DoctorAvatar
            name={doctor.name}
            image={doctor.profileImage}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  Dr. {doctor.name || "Specialist"}
                </h3>
                <p className="text-sm font-medium text-teal-600 mt-0.5">
                  {specialty}
                </p>
              </div>
              {doctor.isVerified && (
                <span className="flex-shrink-0 flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <BadgeCheck size={12} />
                  Verified
                </span>
              )}
            </div>
            <div className="mt-2">
              <RatingStars average={rating} count={reviewCount} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {doctor.experience > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <Award size={14} className="text-teal-600 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate">
                {doctor.experience} yrs exp.
              </span>
            </div>
          )}
          {doctor.hospital && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <Building2 size={14} className="text-teal-600 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate">
                {doctor.hospital}
              </span>
            </div>
          )}
          {doctor.location && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <MapPin size={14} className="text-teal-600 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate">
                {doctor.location}
              </span>
            </div>
          )}
          {doctor.languages?.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <Globe size={14} className="text-teal-600 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate">
                {doctor.languages.slice(0, 2).join(", ")}
                {doctor.languages.length > 2 &&
                  ` +${doctor.languages.length - 2}`}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <div>
            {doctor.consultationFee > 0 ? (
              <>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  LKR {doctor.consultationFee.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">per session</p>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-400">
                Fee not listed
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onBook(doctor)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-200 transition-all hover:bg-teal-700 hover:shadow-md active:scale-[0.97]"
          >
            <CalendarClock size={15} />
            Book
          </button>
        </div>
      </div>
    </article>
  );
}

function DoctorCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-pulse">
      <div className="h-1.5 bg-slate-200" />
      <div className="p-5">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="h-9 rounded-lg bg-slate-100" />
          <div className="h-9 rounded-lg bg-slate-100" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="h-6 w-20 rounded bg-slate-200" />
          <div className="h-10 w-24 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function PatientFindDoctorsPage() {
  const { patientId, isLoadingAuth, authError } = usePatientAuth();
  const { user } = useAuth();
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [showAllSpecialties, setShowAllSpecialties] = useState(true);

  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    const response = await patientApi.getDoctors();
    return response?.doctors || response?.data || response || [];
  }, []);

  const doctors = useMemo(() => {
    return data.filter((doctor) => {
      const matchesSpecialty =
        !specialtyFilter ||
        (doctor.specialty || doctor.specialization || "")
          .toLowerCase()
          .includes(specialtyFilter.toLowerCase());

      const matchesName =
        !nameFilter ||
        (doctor.name || "").toLowerCase().includes(nameFilter.toLowerCase());

      return matchesSpecialty && matchesName;
    });
  }, [data, specialtyFilter, nameFilter]);

  const specialties = useMemo(() => {
    const specs = new Set(
      data.map((doc) => doc.specialty || doc.specialization || "General"),
    );
    return Array.from(specs).sort();
  }, [data]);

  const visibleSpecialties = showAllSpecialties
    ? specialties
    : specialties.slice(0, 6);

  const handleBook = async () => {
    if (!selectedDoctor || !appointmentDate) {
      toast.error("Please select a date and time for your appointment.");
      return;
    }
    if (!patientId) {
      toast.error("Patient session not found. Please sign in again.");
      return;
    }

    try {
      await patientApi.bookAppointment({
        patientId,
        doctorId: selectedDoctor._id || selectedDoctor.id,
        appointmentDate,
        patientEmail: user?.email || "",
      });
      toast.success("Appointment booked successfully!");
      setSelectedDoctor(null);
      setAppointmentDate("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not book appointment.",
      );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#F8FAFB] dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30">
            <Stethoscope
              size={20}
              className="text-teal-700 dark:text-teal-400"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Find a Doctor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Browse and book appointments with qualified specialists
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Search doctors by name..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50 focus:shadow-md"
        />
        {nameFilter && (
          <button
            type="button"
            onClick={() => setNameFilter("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Specialty Chips */}
      {specialties.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Specialties
          </p>
          <div className="flex flex-wrap gap-2">
            <SpecialtyChip
              label="All"
              isActive={!specialtyFilter}
              onClick={() => setSpecialtyFilter("")}
            />
            {visibleSpecialties.map((s) => (
              <SpecialtyChip
                key={s}
                label={s}
                isActive={specialtyFilter === s}
                onClick={() =>
                  setSpecialtyFilter(specialtyFilter === s ? "" : s)
                }
              />
            ))}
            {specialties.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showAllSpecialties ? "rotate-180" : ""}`}
                />
                {showAllSpecialties
                  ? "Show less"
                  : `+${specialties.length - 6} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth / Loading / Error States */}
      {isLoadingAuth && <LoadingState label="Loading patient session..." />}
      {!isLoadingAuth && authError && <ErrorState message={authError} />}
      {!isLoading && error && <ErrorState message={error} onRetry={refetch} />}

      {/* Loading Skeleton */}
      {isLoading && (
        <div>
          <div className="mb-4 h-4 w-36 rounded bg-slate-200 animate-pulse" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && !doctors.length && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800/50 py-16 px-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Users size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">
            No doctors found
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            {nameFilter || specialtyFilter
              ? "Try adjusting your search term or removing the specialty filter."
              : "No doctors are currently available. Please check back later."}
          </p>
          {(nameFilter || specialtyFilter) && (
            <button
              type="button"
              onClick={() => {
                setNameFilter("");
                setSpecialtyFilter("");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:bg-slate-800 transition-colors shadow-sm"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results + Doctor Grid */}
      {!isLoading && !error && doctors.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {doctors.length}
              </span>{" "}
              doctor{doctors.length !== 1 ? "s" : ""}
              {(nameFilter || specialtyFilter) && (
                <span className="ml-1 text-slate-400">
                  {nameFilter && `matching "${nameFilter}"`}
                  {nameFilter && specialtyFilter && " in "}
                  {specialtyFilter && (
                    <span className="text-teal-600 font-medium">
                      {specialtyFilter}
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id || doctor.id}
                doctor={doctor}
                onBook={setSelectedDoctor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <ModalCard
        isOpen={Boolean(selectedDoctor)}
        title="Book an Appointment"
        onClose={() => {
          setSelectedDoctor(null);
          setAppointmentDate("");
        }}
      >
        {selectedDoctor ? (
          <div className="space-y-5">
            {/* Doctor Summary */}
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-slate-50 to-teal-50/50 p-4">
              <DoctorAvatar
                name={selectedDoctor.name}
                image={selectedDoctor.profileImage}
                size="lg"
              />
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Dr. {selectedDoctor.name}
                </h4>
                <p className="text-sm font-medium text-teal-600">
                  {selectedDoctor.specialty ||
                    selectedDoctor.specialization ||
                    "General Practice"}
                </p>
                {selectedDoctor.hospital && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 size={12} />
                    {selectedDoctor.hospital}
                  </p>
                )}
                {selectedDoctor.consultationFee > 0 && (
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    LKR {selectedDoctor.consultationFee.toLocaleString()} per
                    session
                  </p>
                )}
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Preferred Date & Time
              </label>
              <div className="relative">
                <Clock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-3 pl-10 pr-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Choose a date and time that works for you
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctor(null);
                  setAppointmentDate("");
                }}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBook}
                disabled={!appointmentDate}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-teal-200 transition-all hover:bg-teal-700 hover:shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <CalendarClock size={16} />
                Confirm Booking
              </button>
            </div>
          </div>
        ) : null}
      </ModalCard>
    </div>
  );
}
