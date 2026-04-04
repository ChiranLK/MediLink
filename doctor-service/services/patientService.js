// import axios from 'axios';

/**
 * Service to handle cross-service communication with patient-service
 * Designed so that when the patient-service is ready, you uncomment Axios
 * and route to the actual URL.
 */

// Placeholder data representing what patient-service would return
const MOCK_REPORTS = [
  {
    reportId: 'REP-001',
    patientId: 'PAT-101',
    fileName: 'blood_test_results.pdf',
    fileType: 'application/pdf',
    uploadedAt: '2026-05-01T10:00:00Z',
    description: 'Annual complete blood count test results',
    fileUrl: 'http://localhost:3000/uploads/blood_test_results.pdf',
  },
  {
    reportId: 'REP-002',
    patientId: 'PAT-101',
    fileName: 'chest_xray.png',
    fileType: 'image/png',
    uploadedAt: '2026-05-02T14:30:00Z',
    description: 'Chest X-Ray from City Hospital',
    fileUrl: 'http://localhost:3000/uploads/chest_xray.png',
  },
  {
    reportId: 'REP-003',
    patientId: 'PAT-102',
    fileName: 'mri_scan.pdf',
    fileType: 'application/pdf',
    uploadedAt: '2026-05-05T09:15:00Z',
    description: 'Brain MRI Scan results',
    fileUrl: 'http://localhost:3000/uploads/mri_scan.pdf',
  }
];

export const fetchPatientReportsUrl = async (patientId) => {
  try {
    /* 
    // TODO: When patient-service is live, wire this up:
    const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000';
    const response = await axios.get(`${PATIENT_SERVICE_URL}/api/reports/patient/${patientId}`);
    return response.data.data; 
    */

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Return filtered mock data
    const reports = MOCK_REPORTS.filter((report) => report.patientId === patientId);
    return reports;

  } catch (error) {
    // If the real axios call fails, you can format the error here or return empty/null
    console.error(`Failed to fetch reports from patient service: ${error.message}`);
    throw new Error('Could not retrieve patient reports at this time');
  }
};
