import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../patient/services/patientApi';
import toast from 'react-hot-toast';
import { Pill, Calendar, User, Eye } from 'lucide-react';
import { format } from 'date-fns';

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    loadPrescriptions();
  }, [user?.id]);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, activeTab, searchTerm]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await patientApi.getPrescriptions(user.id);
        const presc = response.data || response.prescriptions || [];
        setPrescriptions(Array.isArray(presc) ? presc : []);
      }
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
      toast.error('Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = prescriptions;

    // Filter by status (active/expired)
    if (activeTab === 'active') {
      filtered = filtered.filter(p => {
        if (!p.expiryDate) return true;
        return new Date(p.expiryDate) > new Date();
      });
    } else if (activeTab === 'expired') {
      filtered = filtered.filter(p => {
        if (!p.expiryDate) return false;
        return new Date(p.expiryDate) <= new Date();
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.medicines?.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const getStatusColor = (expiryDate) => {
    if (!expiryDate) return 'bg-blue-100 text-blue-700';
    const isExpired = new Date(expiryDate) <= new Date();
    return isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
  };

  const getStatusText = (expiryDate) => {
    if (!expiryDate) return 'Active';
    const isExpired = new Date(expiryDate) <= new Date();
    return isExpired ? 'Expired' : 'Active';
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
      <h1 className="text-4xl font-bold text-[#1e293b] mb-8">My Prescriptions</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'expired', label: 'Expired' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-[#1e293b]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by medicine name, doctor, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Pill size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No prescriptions found</h3>
          <p className="text-gray-500">
            {prescriptions.length === 0
              ? 'Your prescriptions will appear here once your doctor issues them.'
              : 'No prescriptions match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPrescriptions.map(prescription => (
            <div
              key={prescription._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#1e293b] mb-2">
                    {prescription.doctorName || 'Dr. Unknown'}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      <span>Issued: {format(new Date(prescription.date), 'MMM dd, yyyy')}</span>
                    </div>
                    {prescription.expiryDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-orange-500" />
                        <span>Expires: {format(new Date(prescription.expiryDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(prescription.expiryDate)}`}>
                  {getStatusText(prescription.expiryDate)}
                </span>
              </div>

              {/* Medicines List */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                  <Pill size={18} className="text-blue-500" />
                  Medicines
                </h4>
                <div className="space-y-3">
                  {prescription.medicines?.map((medicine, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold text-[#1e293b]">{medicine.name}</h5>
                          <p className="text-sm text-gray-600">{medicine.dosage}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span><strong>Frequency:</strong> {medicine.frequency}</span>
                        <span><strong>Duration:</strong> {medicine.duration}</span>
                      </div>
                      {medicine.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Instructions:</strong> {medicine.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
                  <h4 className="font-semibold text-[#1e293b] mb-2">Notes from Doctor</h4>
                  <p className="text-[#334155]">{prescription.notes}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => setSelectedPrescription(prescription)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition"
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-[#1e293b] mb-6">Prescription Details</h2>

            {/* Doctor Info */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg mb-6">
              <div className="flex items-center gap-4 mb-4">
                <User size={32} className="text-blue-500" />
                <div>
                  <h3 className="font-bold text-lg text-[#1e293b]">
                    Dr. {selectedPrescription.doctorName}
                  </h3>
                  <p className="text-gray-600">{selectedPrescription.specialization || 'Medical Practitioner'}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Issued Date</p>
                  <p className="font-semibold text-[#1e293b]">
                    {format(new Date(selectedPrescription.date), 'MMMM dd, yyyy')}
                  </p>
                </div>
                {selectedPrescription.expiryDate && (
                  <div>
                    <p className="text-gray-600">Expiry Date</p>
                    <p className="font-semibold text-[#1e293b]">
                      {format(new Date(selectedPrescription.expiryDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medicines */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                <Pill size={24} className="text-blue-500" />
                Prescribed Medicines
              </h3>
              <div className="space-y-4">
                {selectedPrescription.medicines?.map((medicine, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-lg text-[#1e293b] mb-2">{medicine.name}</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-[#334155]">
                      <div>
                        <p className="text-sm text-gray-600">Dosage</p>
                        <p className="font-semibold">{medicine.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Frequency</p>
                        <p className="font-semibold">{medicine.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{medicine.duration}</p>
                      </div>
                    </div>
                    {medicine.instructions && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded">
                        <p className="text-sm text-[#334155]">
                          <strong>Special Instructions:</strong> {medicine.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            {selectedPrescription.notes && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <h3 className="font-bold text-[#1e293b] mb-2">Doctor's Notes</h3>
                <p className="text-[#334155]">{selectedPrescription.notes}</p>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedPrescription(null)}
              className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
