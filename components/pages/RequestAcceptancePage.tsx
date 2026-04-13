'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, CreditCard, Loader2, RefreshCw } from 'lucide-react'
import { paymentsApi, enrollmentsApi, Payment } from '@/lib/api'
import { useNotifications } from '@/hooks/useNotifications'

interface RequestAcceptancePageProps {
  userRole: 'admin' | 'staff' | 'student' | 'accountant'
}

const PENDING_STATUSES = new Set(['PENDING_CONFIRMATION', 'CREATED', 'UNPAID'])

export default function RequestAcceptancePage({ userRole }: RequestAcceptancePageProps) {
  const { notifySuccess, notifyError, notifyInfo } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [rows, setRows] = useState<Payment[]>([])

  const canAccept = userRole === 'admin' || userRole === 'staff' || userRole === 'accountant'

  const pendingCashRows = useMemo(() => {
    return rows.filter((p) => p.payment_mode === 'CASH' && PENDING_STATUSES.has((p.status || '').toUpperCase()))
  }, [rows])

  const fetchPendingCashRequests = async () => {
    setLoading(true)
    try {
      const pageSize = 200
      let page = 1
      let totalPages = 1
      const collected: Payment[] = []

      while (page <= totalPages) {
        const res = await paymentsApi.getAll({ page, page_size: pageSize, payment_mode: 'CASH' })
        const pageRows = Array.isArray(res?.results) ? res.results : []
        collected.push(...pageRows)
        totalPages = Number(res?.total_pages || 1)
        page += 1
      }

      setRows(collected)
    } catch (err: any) {
      notifyError(err?.response?.data?.error?.message || 'Failed to fetch cash pending requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingCashRequests()
  }, [])

  const handleAcceptPayment = async (payment: Payment) => {
    const ok = window.confirm(`Accept cash payment for ${payment.student_name}?`)
    if (!ok) return

    try {
      setProcessingId(payment.id)
      notifyInfo('Confirming cash payment and generating documents...')

      const confirmRes = await paymentsApi.confirmPayment(payment.id)
      const enrollmentId = Number((confirmRes as any)?.data?.enrollment_id || payment.enrollment)
      const confirmedPaymentId = Number((confirmRes as any)?.data?.payment_id || payment.id)

      await Promise.all([
        paymentsApi.openReceiptInNewTab(confirmedPaymentId),
        enrollmentsApi.openIdCardInNewTab(enrollmentId),
      ])

      notifySuccess('Payment accepted. Receipt and ID card opened in new tabs.')
      await fetchPendingCashRequests()
    } catch (err: any) {
      notifyError(err?.response?.data?.error?.message || 'Failed to accept payment')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 font-poppins uppercase tracking-tight">Request Acceptance</h1>
          <p className="text-slate-500 text-[10px] sm:text-sm mt-1 font-medium font-inter uppercase tracking-widest">Offline cash registrations awaiting counter confirmation</p>
        </div>
        <button
          onClick={fetchPendingCashRequests}
          disabled={loading}
          className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium font-poppins flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Cash Pending</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCashRows.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</p>
          <p className="text-sm font-bold text-orange-600 mt-2">UNPAID / Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mode</p>
          <p className="text-sm font-bold text-slate-900 mt-2">CASH (Pending)</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mb-3" size={28} />
            <p className="text-sm font-semibold">Loading pending cash requests...</p>
          </div>
        ) : pendingCashRows.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle2 size={30} className="text-emerald-500 mb-3" />
            <p className="text-sm font-semibold">No pending cash requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Student Name</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Fees</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Payment Status</th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingCashRows.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{payment.student_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{payment.subject_name}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-slate-900">₹{Number(payment.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        disabled={!canAccept || processingId === payment.id}
                        onClick={() => handleAcceptPayment(payment)}
                        className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {processingId === payment.id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                        Accept Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs">
        <AlertCircle size={14} className="mt-0.5" />
        <p>After acceptance, payment is marked as paid in CASH mode and both fee receipt and ID card PDFs are auto-opened in new tabs for instant printing.</p>
      </div>
    </div>
  )
}