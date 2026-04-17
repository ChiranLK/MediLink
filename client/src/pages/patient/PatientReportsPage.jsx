import { useState } from "react";
import { toast } from "react-hot-toast";
import { Download, UploadCloud } from "lucide-react";
import { patientApi } from "@/patient/services/patientApi";
import { useAsyncData } from "@/patient/hooks/useAsyncData";
import SectionCard from "@/patient/components/ui/SectionCard";
import LoadingState from "@/patient/components/ui/LoadingState";
import ErrorState from "@/patient/components/ui/ErrorState";
import EmptyState from "@/patient/components/ui/EmptyState";
import DataTable from "@/patient/components/ui/DataTable";
import StatusBadge from "@/patient/components/ui/StatusBadge";
import { usePatientAuth } from "@/patient/context/PatientAuthContext";

export default function PatientReportsPage() {
  const { patientId, isLoadingAuth, authError } = usePatientAuth();
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState("General Report");
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    if (!patientId) return [];
    const response = await patientApi.getReports(patientId);
    return response?.data || response || [];
  }, [patientId]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!patientId) {
      toast.error("Patient session not found. Please sign in again.");
      return;
    }
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("reportType", reportType);
      await patientApi.uploadReport(patientId, formData);
      toast.success("Report uploaded successfully.");
      setFile(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await patientApi.deleteReport(reportId);
      toast.success("Report removed.");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove report.");
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6 bg-[#F8FAFB] dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <SectionCard
        title="Upload Medical Report"
        subtitle="Supports PDF, JPG, and DICOM files"
      >
        <form onSubmit={handleUpload} className="grid gap-3 md:grid-cols-3">
          <input
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
            placeholder="Report type"
          />
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            <UploadCloud size={16} />
            {isUploading ? "Uploading..." : "Upload Report"}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="My Reports">
        {isLoadingAuth ? (
          <LoadingState label="Loading patient session..." />
        ) : null}
        {!isLoadingAuth && authError ? (
          <ErrorState message={authError} />
        ) : null}
        {isLoading ? <LoadingState label="Loading reports..." /> : null}
        {!isLoading && error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : null}
        {!isLoadingAuth &&
        !authError &&
        !isLoading &&
        !error &&
        !data.length ? (
          <EmptyState
            title="No reports yet"
            description="Upload your first report to build your medical history."
          />
        ) : null}
        {!isLoadingAuth && !authError && !isLoading && !error && data.length ? (
          <DataTable
            columns={[
              { key: "reportType", label: "Report Type" },
              {
                key: "createdAt",
                label: "Uploaded At",
                render: (row) => new Date(row.createdAt).toLocaleDateString(),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusBadge value={row.status || "active"} />,
              },
            ]}
            rows={data}
            renderActions={(row) => (
              <div className="flex items-center gap-2">
                {row.fileUrl ? (
                  <a
                    href={row.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-teal-600 hover:text-teal-700"
                  >
                    <Download size={14} />
                    View
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(row._id)}
                  className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          />
        ) : null}
      </SectionCard>
    </div>
  );
}
