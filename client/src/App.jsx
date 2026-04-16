import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/UI/Layout';
import Homepage from './pages/Homepage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SignInRestricted from './pages/SignInRestricted';
import SignUpRestricted from './pages/SignUpRestricted';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import PlanAppointment from './pages/PlanAppointment/PlanAppoinment';
import ViewAppointments from './pages/PlanAppointment/viewAppoinments';
import DoctorLayout from './layouts/DoctorLayout';
import Dashboard from './pages/Doctor/Dashboard';
import Availability from './pages/Doctor/Availability';
import Schedule from './pages/Doctor/Schedule';
import DoctorProfile from './pages/Doctor/Profile';
import AdminDeletionReview from './pages/Doctor/AdminDeletionReview';
import PatientLayout from './layouts/PatientLayout';
import PatientDashboard from './pages/Patient/Dashboard';
import PatientProfile from './pages/Patient/Profile';
import PatientAppointments from './pages/Patient/Appointments';
import PatientReports from './pages/Patient/Reports';
import PatientPrescriptions from './pages/Patient/Prescriptions';
import PatientTelemedicine from './pages/Patient/Telemedicine';
import PatientFindDoctorsPage from './pages/Patient/PatientFindDoctorsPage';
import PatientPayments from './pages/Patient/Payments';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentCancel from './pages/Payment/PaymentCancel';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/UI/ProtectedRoute';
import { Toaster } from 'react-hot-toast';


class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
          <h2>Something went wrong (White Screen Prevention)</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>{this.state.error?.toString()}</summary>
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app">
            <Toaster position="top-right" reverseOrder={false} />
            <AppErrorBoundary>

            <Routes>
              {/* Public Routes with General Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<Homepage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Route>
              
              {/* Restricted Routes - Doctor & Admin Only */}
              <Route element={<Layout />}>
                <Route path="/signin/restricted" element={<SignInRestricted />} />
                <Route path="/signup/restricted" element={<SignUpRestricted />} />
              </Route>
              
              {/* Doctor Dashboard Routes - Securely protected */}
              <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
                <Route element={<DoctorLayout />}>
                  <Route path="/doctor/dashboard" element={<Dashboard />} />
                  <Route path="/doctor/availability" element={<Availability />} />
                  <Route path="/doctor/schedules" element={<Schedule />} />
                  <Route path="/doctor/profile" element={<DoctorProfile />} />
                  <Route path="/doctor/admin/deletions" element={<AdminDeletionReview />} />
                </Route>
              </Route>

              {/* Patient Dashboard Routes - Securely protected */}
              <Route element={<ProtectedRoute allowedRoles={['patient', 'admin']} />}>
                <Route element={<PatientLayout />}>
                  <Route path="/patient/dashboard" element={<PatientDashboard />} />
                  <Route path="/patient/profile" element={<PatientProfile />} />
                  <Route path="/patient/appointments" element={<PatientAppointments />} />
                  <Route path="/patient/reports" element={<PatientReports />} />
                  <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
                  <Route path="/patient/telemedicine" element={<PatientTelemedicine />} />
                  <Route path="/patient/doctors" element={<PatientFindDoctorsPage />} />
                  <Route path="/patient/payments" element={<PatientPayments />} />
                  <Route path="/appointments" element={<PlanAppointment />} />
                  <Route path="/viewAppointments" element={<ViewAppointments />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/cancel" element={<PaymentCancel />} />
                </Route>
              </Route>
            </Routes>
            </AppErrorBoundary>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;


