import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../patient/services/patientApi';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Search,
  Filter,
  Eye,
  X,
  TrendingUp,
  AlertCircle,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, dotColor: 'bg-emerald-500' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock, dotColor: 'bg-amber-500' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle, dotColor: 'bg-red-500' },
  refunded: { label: 'Refunded', color: 'bg-blue-100 text-blue-700', icon: RotateCcw, dotColor: 'bg-blue-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: XCircle, dotColor: 'bg-gray-400' },
};

const TYPE_LABELS = {
  appointment: 'Appointment',
  consultation: 'Consultation',
  prescription: 'Prescription',
};

const formatCurrency = (amount, currency = 'lkr') => {
  const symbols = { lkr: 'Rs.', usd: '$', eur: '€', gbp: '£', inr: '₹' };
  const symbol = symbols[currency?.toLowerCase()] || currency?.toUpperCase() + ' ';
  return `${symbol} ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    {subtext && <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">{subtext}</p>}
  </div>
);

const PaymentRow = ({ payment, onView }) => {
  const config = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-slate-800/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <CreditCard size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              {TYPE_LABELS[payment.paymentType] || payment.paymentType}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {payment.metadata?.doctorName || payment.metadata?.description || `#${payment._id?.slice(-8)}`}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
          {formatCurrency(payment.amount, payment.currency)}
        </p>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(payment.createdAt)}</p>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
          <StatusIcon size={12} />
          {config.label}
        </span>
      </td>
      <td className="py-4 px-4">
        <button
          onClick={() => onView(payment)}
          className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
          title="View details"
        >
          <Eye size={16} />
        </button>
      </td>
    </tr>
  );
};

const PaymentDetailModal = ({ payment, onClose }) => {
  if (!payment) return null;
  const config = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white dark:bg-slate-900/20 transition">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Receipt size={24} />
            <h2 className="text-xl font-bold">Payment Details</h2>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
          <p className="text-teal-100 text-sm mt-1">{formatDateTime(payment.createdAt)}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
              <StatusIcon size={12} />
              {config.label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Type</span>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              {TYPE_LABELS[payment.paymentType] || payment.paymentType}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Payment Method</span>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              {payment.paymentMethod ? payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Currency</span>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              {(payment.currency || 'lkr').toUpperCase()}
            </span>
          </div>

          {payment.metadata?.doctorName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Doctor</span>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {payment.metadata.doctorName}
              </span>
            </div>
          )}

          {payment.metadata?.description && (
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
              <span className="text-sm block mb-1" >Description</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">{payment.metadata.description}</p>
            </div>
          )}

          {payment.receipt?.url && (
            <a
              href={payment.receipt.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 bg-teal-50 text-teal-700 font-semibold rounded-lg hover:bg-teal-100 transition text-sm"
            >
              View Receipt
            </a>
          )}

          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Payment ID: {payment._id}
            </p>
            {payment.stripeCheckoutSessionId && (
              <p className="text-xs truncate" >
                Session: {payment.stripeCheckoutSessionId}
              </p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-sm transition"
            
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {[1, 2, 3, 4, 5].map(i => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
      </td>
    ))}
  </tr>
);

const PatientPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const LIMIT = 10;

  useEffect(() => {
    loadPayments();
  }, [page, activeFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (activeFilter !== 'all') params.status = activeFilter;

      const response = await patientApi.getPayments(params);
      setPayments(response.data || []);
      setPagination(response.pagination || { total: 0, pages: 1 });
    } catch (error) {
      console.error('Failed to load payments:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load payment history');
      }
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;
    const q = searchTerm.toLowerCase();
    return payments.filter(p =>
      p.metadata?.doctorName?.toLowerCase().includes(q) ||
      p.metadata?.description?.toLowerCase().includes(q) ||
      p.paymentType?.toLowerCase().includes(q) ||
      p._id?.toLowerCase().includes(q)
    );
  }, [payments, searchTerm]);

  const stats = useMemo(() => {
    const all = payments;
    const totalSpent = all.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingCount = all.filter(p => p.status === 'pending').length;
    const refundedAmount = all.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      totalPayments: pagination.total || all.length,
      totalSpent,
      pendingCount,
      refundedAmount,
    };
  }, [payments, pagination]);

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' },
    { id: 'refunded', label: 'Refunded' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-[#F8FAFB] dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#112429] dark:text-white">Payments</h1>
        <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Track and manage your payment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={CreditCard}
          label="Total Payments"
          value={stats.totalPayments}
          color="bg-teal-500"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingCount}
          subtext="Awaiting confirmation"
          color="bg-amber-500"
        />
        <StatCard
          icon={RotateCcw}
          label="Refunded"
          value={formatCurrency(stats.refundedAmount)}
          color="bg-blue-500"
        />
      </div>

      {/* Filters + Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4">
          <div className="flex gap-1 overflow-x-auto">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveFilter(tab.id); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activeFilter === tab.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-500 hover:bg-gray-50 dark:bg-slate-800 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none w-full sm:w-64 bg-white dark:bg-slate-900 text-gray-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" >Payment</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" >Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" >Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" >Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" ></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map(payment => (
                  <PaymentRow
                    key={payment._id}
                    payment={payment}
                    onView={setSelectedPayment}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Receipt size={28} className="text-gray-300" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1" >
                        {searchTerm ? 'No matching payments' : 'No payments yet'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {searchTerm
                          ? 'Try adjusting your search or filters'
                          : 'Your payment history will appear here after you book an appointment'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Page {page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16}  />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16}  />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
    </div>
  );
};

export default PatientPayments;
