import customFetch from "@/utils/customFetch";

const ENDPOINTS = {
  patient: "/api/patient/patients",
  reports: "/api/patient/reports",
  upload: "/api/patient/upload",
  prescriptions: "/api/patient/prescriptions",
  appointments: "/api/appointment",
  doctors: "/api/doctor",
  telemedicine: "/api/telemedicine",
  payments: "/api/payment",
};

export const patientApi = {
  // ========== PATIENT PROFILE ==========
  async getPatientProfile(patientId) {
    const { data } = await customFetch.get(`${ENDPOINTS.patient}/${patientId}`);
    return data;
  },

  async updatePatientProfile(patientId, payload) {
    const { data } = await customFetch.put(`${ENDPOINTS.patient}/${patientId}`, payload);
    return data;
  },

  async createPatientProfile(payload) {
    const { data } = await customFetch.post(`${ENDPOINTS.patient}`, payload);
    return data;
  },

  // ========== REPORTS & UPLOADS ==========
  async uploadReport(formData) {
    const { data } = await customFetch.post(`${ENDPOINTS.upload}/single`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async uploadMultipleReports(formData) {
    const { data } = await customFetch.post(`${ENDPOINTS.upload}/multiple`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deleteUploadedFile(publicId) {
    const { data } = await customFetch.delete(`${ENDPOINTS.upload}/delete/${publicId}`);
    return data;
  },

  async createReport(payload) {
    const { data } = await customFetch.post(`${ENDPOINTS.reports}`, payload);
    return data;
  },

  async getPatientReports(patientId) {
    const { data } = await customFetch.get(`${ENDPOINTS.reports}/patient/${patientId}`);
    return data;
  },

  async getReportById(reportId) {
    const { data } = await customFetch.get(`${ENDPOINTS.reports}/${reportId}`);
    return data;
  },

  async updateReport(reportId, payload) {
    const { data } = await customFetch.put(`${ENDPOINTS.reports}/${reportId}`, payload);
    return data;
  },

  async deleteReport(reportId) {
    const { data } = await customFetch.delete(`${ENDPOINTS.reports}/${reportId}`);
    return data;
  },

  // ========== PRESCRIPTIONS ==========
  async getPrescriptions(patientId, params = {}) {
    const { data } = await customFetch.get(
      `${ENDPOINTS.prescriptions}/patient/${patientId}`,
      { params }
    );
    return data;
  },

  async getActivePrescriptions(patientId) {
    const { data } = await customFetch.get(
      `${ENDPOINTS.prescriptions}/patient/${patientId}/active`
    );
    return data;
  },

  async getPrescriptionById(prescriptionId) {
    const { data } = await customFetch.get(`${ENDPOINTS.prescriptions}/${prescriptionId}`);
    return data;
  },

  // ========== APPOINTMENTS ==========
  async bookAppointment(payload) {
    const { data } = await customFetch.post(`${ENDPOINTS.appointments}`, payload);
    return data;
  },

  async getMyAppointments() {
    const { data } = await customFetch.get(`${ENDPOINTS.appointments}/my-appointments`);
    return data;
  },

  async getAppointmentById(appointmentId) {
    const { data } = await customFetch.get(`${ENDPOINTS.appointments}/${appointmentId}`);
    return data;
  },

  async updateAppointment(appointmentId, payload) {
    const { data } = await customFetch.put(`${ENDPOINTS.appointments}/${appointmentId}`, payload);
    return data;
  },

  async cancelAppointment(appointmentId) {
    const { data } = await customFetch.delete(`${ENDPOINTS.appointments}/${appointmentId}`);
    return data;
  },

  // ========== DOCTORS ==========
  async getDoctors(params = {}) {
    const { data } = await customFetch.get(`${ENDPOINTS.doctors}`, { params });
    return data;
  },

  async getDoctorById(doctorId) {
    const { data } = await customFetch.get(`${ENDPOINTS.doctors}/${doctorId}`);
    return data;
  },

  async getDoctorAvailability(doctorId) {
    const { data } = await customFetch.get(`/api/doctor/availability/${doctorId}`);
    return data;
  },

  // ========== VIDEO CONSULTATIONS (TELEMEDICINE) ==========
  async createConsultationSession(payload) {
    const { data } = await customFetch.post(
      `${ENDPOINTS.telemedicine}/create-session`,
      payload
    );
    return data;
  },

  async getConsultationsByPatient(patientId, params = {}) {
    const { data } = await customFetch.get(
      `${ENDPOINTS.telemedicine}/patient/${patientId}`,
      { params }
    );
    return data;
  },

  async getConsultationByAppointment(appointmentId) {
    const { data } = await customFetch.get(`${ENDPOINTS.telemedicine}/${appointmentId}`);
    return data;
  },

  async updateConsultationStatus(appointmentId, status) {
    const { data } = await customFetch.patch(
      `${ENDPOINTS.telemedicine}/${appointmentId}/status`,
      { status }
    );
    return data;
  },

  async updateConsultationNotes(appointmentId, notes) {
    const { data } = await customFetch.patch(
      `${ENDPOINTS.telemedicine}/${appointmentId}/notes`,
      { notes }
    );
    return data;
  },

  // ========== PAYMENTS ==========
  async getPayments(params = {}) {
    const { data } = await customFetch.get(ENDPOINTS.payments, { params });
    return data;
  },

  async getPaymentById(paymentId) {
    const { data } = await customFetch.get(`${ENDPOINTS.payments}/${paymentId}`);
    return data;
  },

  async createCheckout(payload) {
    const { data } = await customFetch.post(`${ENDPOINTS.payments}/checkout`, payload);
    return data;
  },

  async verifyCheckout(sessionId) {
    const { data } = await customFetch.post(`${ENDPOINTS.payments}/verify-checkout`, { sessionId });
    return data;
  },

  async requestRefund(paymentId, payload) {
    const { data } = await customFetch.post(`${ENDPOINTS.payments}/${paymentId}/refund`, payload);
    return data;
  },
};
