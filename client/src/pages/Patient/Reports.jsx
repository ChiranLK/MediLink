import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../patient/services/patientApi';
import toast from 'react-hot-toast';
import { Upload, FileText, Download, Trash2, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';

const PatientReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    files: [],
    description: '',
    reportType: 'Other',
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    loadReports();
  }, [user]);

  const loadReports = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await patientApi.getPatientReports(user.id);
        setReports(response.data || response.reports || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setUploadForm(prev => ({
      ...prev,
      files: files
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);

      if (selectedFiles.length === 0) {
        toast.error('Please select at least one file');
        return;
      }

      if (!uploadForm.description) {
        toast.error('Please add a description');
        return;
      }

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // First upload files to cloud storage
      let uploadedFiles = [];
      if (selectedFiles.length === 1) {
        const response = await patientApi.uploadReport(formData);
        uploadedFiles = [response.data];
      } else {
        const response = await patientApi.uploadMultipleReports(formData);
        uploadedFiles = response.data.uploadedFiles || response.data;
      }

      // Then create report records in database
      for (const file of uploadedFiles) {
        await patientApi.createReport({
          patientId: user.id,
          fileUrl: file.fileUrl,
          description: uploadForm.description,
          reportType: uploadForm.reportType,
          fileSize: file.fileSize || 0,
        });
      }

      toast.success('Reports uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({
        files: [],
        description: '',
        reportType: 'Other',
      });
      setSelectedFiles([]);
      await loadReports();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload reports');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await patientApi.deleteReport(reportId);
      toast.success('Report deleted');
      await loadReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const getReportTypeColor = (type) => {
    const colors = {
      'Blood Test': 'bg-red-100 text-red-700',
      'X-Ray': 'bg-purple-100 text-purple-700',
      'CT Scan': 'bg-blue-100 text-blue-700',
      'MRI': 'bg-indigo-100 text-indigo-700',
      'Ultrasound': 'bg-teal-100 text-teal-700',
      'Other': 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Medical Reports</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
        >
          <Upload size={20} />
          Upload Report
        </button>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No reports uploaded yet</h3>
          <p className="text-gray-500 mb-6">Upload your medical reports to keep them organized and accessible</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={20} />
            Upload Your First Report
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <div key={report._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 text-white flex items-start justify-between">
                <FileText size={32} />
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getReportTypeColor(report.reportType)}`}>
                  {report.reportType}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {report.description || 'Medical Report'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {format(new Date(report.createdAt), 'MMM dd, yyyy • hh:mm a')}
                </p>

                {report.fileSize && (
                  <p className="text-xs text-gray-500 mb-4">
                    Size: {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewFile(report)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-semibold"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition text-sm font-semibold"
                  >
                    <Download size={16} />
                    Download
                  </a>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Medical Reports</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Files *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <Upload size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 font-semibold mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-gray-700">Selected Files ({selectedFiles.length})</h4>
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText size={16} className="text-blue-500" />
                        <span className="flex-1 text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                <select
                  value={uploadForm.reportType}
                  onChange={(e) => setUploadForm({ ...uploadForm, reportType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Blood Test">Blood Test</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Enter description or additional notes..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                    setUploadForm({ files: [], description: '', reportType: 'Other' });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{previewFile.description}</h2>
            <div className="mb-4 bg-gray-100 rounded p-4">
              <iframe
                src={previewFile.fileUrl}
                className="w-full h-96 rounded"
                title="Report Preview"
              />
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="w-full px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientReports;
