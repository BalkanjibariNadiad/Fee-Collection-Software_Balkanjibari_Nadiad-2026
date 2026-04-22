'use client'

import { Download, FileText, Loader2, Calendar } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
<<<<<<< HEAD
import { analyticsApi, subjectsApi } from '@/lib/api'
=======
import { analyticsApi, paymentsApi, studentsApi, subjectsApi } from '@/lib/api'
import type { SubjectBatchEnrollmentReport } from '@/lib/api/analytics'
>>>>>>> cdf9366 (Expand reports with full batch data)
import { useNotifications } from '@/hooks/useNotifications'

interface ReportsPageProps {
  userRole: 'admin' | 'staff' | 'student' | 'accountant'
}

export default function ReportsPage({ userRole }: ReportsPageProps) {
  const { notifySuccess, notifyError } = useNotifications()
  const [downloading, setDownloading] = useState<string | null>(null)
  const [batchReportLoading, setBatchReportLoading] = useState(false)
  const [batchReportData, setBatchReportData] = useState<any | null>(null)
  const [allSubjects, setAllSubjects] = useState<any[]>([])
<<<<<<< HEAD
  const [subjectBatches, setSubjectBatches] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL')
  const [startReportDate, setStartReportDate] = useState(new Date().toISOString().split('T')[0])
  const [endReportDate, setEndReportDate] = useState(new Date().toISOString().split('T')[0])

  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)
=======
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL')
  const [subjectBatches, setSubjectBatches] = useState<string[]>([])
  const [subjectBatchReportLoading, setSubjectBatchReportLoading] = useState(false)
  const [subjectBatchReportData, setSubjectBatchReportData] = useState<SubjectBatchEnrollmentReport | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const startDateRef = useRef<HTMLInputElement>(null)
  const subjectDateRef = useRef<HTMLInputElement>(null)
>>>>>>> cdf9366 (Expand reports with full batch data)

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectsApi.getAll()
        const data = (response as any)?.data || response
        const subjects = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : []

        setAllSubjects(subjects)

        if (subjects.length > 0) {
          const firstSubjectId = subjects[0].id.toString()
          setSelectedSubject(firstSubjectId)
          await loadSubjectBatches(firstSubjectId)
        }
      } catch (error) {
        console.error('Failed to load subjects for report filters:', error)
        notifyError('Unable to load subjects for report filters')
      }
    }

    fetchSubjects()
  }, [])

  const loadSubjectBatches = async (subjectId: string) => {
    if (!subjectId) {
      setSubjectBatches([])
      return
    }

    try {
      const response = await subjectsApi.getBatches(Number(subjectId))
      const data = (response as any)?.data || response
      const batches = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : []

    } catch (error) {
      console.error('Failed to load batches for selected subject:', error)
      setSubjectBatches([])
    }
  }

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedBatch('ALL')
    setBatchReportData(null)
    await loadSubjectBatches(subjectId)
  }

  const generateSubjectBatchReport = async () => {
    if (!selectedSubject) {
      notifyError('Please select a subject')
      return
    }

    if (startReportDate > endReportDate) {
      notifyError('Start date cannot be after end date')
      return
    }

    try {
<<<<<<< HEAD
=======
      setDownloading(`date_wise_${format}`)
      if (format === 'PDF') {
        await analyticsApi.exportDateWiseFeeReportPdf(startReportDate, endReportDate)
      } else {
        await analyticsApi.exportDateWiseFeeReportCsv(startReportDate, endReportDate)
      }
      notifySuccess(`${format} Report downloaded successfully`)
    } catch (error) {
      console.error('Date-wise report download failed:', error)
      notifyError(`Failed to download ${format} report`)
    } finally {
      setDownloading(null)
    }
  }

  const formatCurrency = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`

  const getPaymentModeClass = (mode?: string) => {
    if (mode === 'Online') {
      return 'bg-blue-100 text-blue-700'
    }

    if (mode === 'Offline') {
      return 'bg-orange-100 text-orange-700'
    }

    return 'bg-slate-100 text-slate-700'
  }

  const getPaymentStatusClass = (status?: string) => {
    const normalizedStatus = (status || '').toUpperCase()

    if (normalizedStatus === 'PAID') {
      return 'bg-emerald-100 text-emerald-700'
    }

    if (normalizedStatus === 'PARTIAL') {
      return 'bg-amber-100 text-amber-700'
    }

    if (normalizedStatus === 'PAYMENT PENDING') {
      return 'bg-rose-100 text-rose-700'
    }

    return 'bg-slate-100 text-slate-700'
  }

  const handleSubjectSelect = async (subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedBatch('ALL')
    setSubjectBatchReportData(null)

    if (!subjectId) {
      setSubjectBatches([])
      return
    }

    try {
      const response = await subjectsApi.getBatches(Number(subjectId))
      const data = (response as any)?.data || response
      const batches = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : []

      setSubjectBatches((batches || []).map((item: any) => item.batch_time || item.name || item).filter(Boolean))
    } catch (error) {
      console.error('Failed to load batches for selected subject:', error)
      setSubjectBatches([])
      notifyError('Unable to load batches for selected subject')
    }
  }

  const generateSubjectBatchReport = async () => {
    if (!selectedSubject) {
      notifyError('Please select a subject')
      return
    }

    if (startReportDate > endReportDate) {
      notifyError('Start date cannot be after end date')
      return
    }

    try {
      setSubjectBatchReportLoading(true)
      const response = await analyticsApi.getSubjectBatchEnrollmentReport(
        Number(selectedSubject),
        selectedBatch || 'ALL',
        startReportDate,
        endReportDate
      )
      const data = (response as any)?.data || response
      setSubjectBatchReportData(data || null)
      notifySuccess('Subject and batch enrollment report generated successfully')
    } catch (error: any) {
      console.error('Subject/batch report generation failed:', error)
      notifyError('Failed to generate subject and batch report')
    } finally {
      setSubjectBatchReportLoading(false)
    }
  }

  const handleSubjectBatchDownload = async (format: 'CSV' | 'PDF') => {
    if (!selectedSubject) {
      notifyError('Please select a subject before downloading')
      return
    }

    try {
      setDownloading(`subject_batch_${format}`)

      if (format === 'PDF') {
        await analyticsApi.exportSubjectBatchEnrollmentReportPdf(
          Number(selectedSubject),
          selectedBatch || 'ALL',
          startReportDate,
          endReportDate
        )
      } else {
        await analyticsApi.exportSubjectBatchEnrollmentReportCsv(
          Number(selectedSubject),
          selectedBatch || 'ALL',
          startReportDate,
          endReportDate
        )
      }

      notifySuccess(`${format} report downloaded successfully`)
    } catch (error) {
      console.error('Subject/batch report download failed:', error)
      notifyError(`Failed to download ${format} report`)
    } finally {
      setDownloading(null)
    }
  }

  const generateSubjectWiseReport = async (date: string) => {
    try {
      setSubjectReportLoading(true)
      const response = await analyticsApi.getSubjectWiseDailyFeeReport(date)
      const data = (response as any)?.data || response
      setSubjectReportData(data || null)
      notifySuccess('Subject-wise report generated successfully')
    } catch (error) {
      console.error('Subject-wise report generation failed:', error)
      notifyError('Failed to generate subject-wise report')
    } finally {
      setSubjectReportLoading(false)
    }
  }

  const handleSubjectWiseDownload = async (format: 'CSV' | 'PDF') => {
    if (!selectedSubjectReportDate) {
      notifyError('Please select a date first')
      return
    }

    try {
      setDownloading(`subject_wise_${format}`)
      if (format === 'PDF') {
        await analyticsApi.exportSubjectWiseDailyFeeReportPdf(selectedSubjectReportDate)
      } else {
        await analyticsApi.exportSubjectWiseDailyFeeReportCsv(selectedSubjectReportDate)
      }
      notifySuccess(`${format} Report downloaded successfully`)
    } catch (error) {
      console.error('Subject-wise report download failed:', error)
      notifyError(`Failed to download ${format} report`)
    } finally {
      setDownloading(null)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)
    try {
      const res = await studentsApi.importCsv(file)
      if (res.success) {
        setImportResult(res.data)
        notifySuccess(res.message || 'Import successful')
      } else {
        notifyError(res.error || 'Import failed')
      }
    } catch (error: any) {
      notifyError(error.response?.data?.error || 'Failed to connect to server')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // New Report Handlers (Session 12)
  const generateBatchReport = async () => {
    try {
>>>>>>> cdf9366 (Expand reports with full batch data)
      setBatchReportLoading(true)
      const response = await analyticsApi.getSubjectBatchEnrollmentReport(
        Number(selectedSubject),
        selectedBatch,
        startReportDate,
        endReportDate
      )
      const data = (response as any)?.data || response
      setBatchReportData(data || null)
      notifySuccess('Subject and batch enrollment report generated successfully')
    } catch (error) {
      console.error('Subject/batch enrollment report generation failed:', error)
      notifyError('Failed to generate the report')
    } finally {
      setBatchReportLoading(false)
    }
  }

  const handleBatchReportDownload = async (format: 'CSV' | 'PDF') => {
    if (!selectedSubject) {
      notifyError('Please select a subject before downloading')
      return
    }

    try {
      setDownloading(`subject_batch_${format}`)
      if (format === 'PDF') {
        await analyticsApi.exportSubjectBatchEnrollmentReportPdf(
          Number(selectedSubject),
          selectedBatch,
          startReportDate,
          endReportDate
        )
      } else {
        await analyticsApi.exportSubjectBatchEnrollmentReportCsv(
          Number(selectedSubject),
          selectedBatch,
          startReportDate,
          endReportDate
        )
      }
      notifySuccess(`${format} Report downloaded successfully`)
    } catch (error) {
      console.error('Subject/batch report download failed:', error)
      notifyError(`Failed to download ${format} report`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="p-2.5 sm:p-6 space-y-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-tight font-poppins">Subject-wise Batch-wise Enrollment Report</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium font-inter">Generate live student enrollment data grouped by batch and subject, with export options for CSV and PDF.</p>
        </div>

<<<<<<< HEAD
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(event) => handleSubjectChange(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900"
            >
              {allSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Batch</label>
            <select
              value={selectedBatch}
              onChange={(event) => setSelectedBatch(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900"
            >
              <option value="ALL">All Batches</option>
              {subjectBatches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Start Date</label>
              <input
                ref={startDateRef}
                type="date"
                value={startReportDate}
                onChange={(event) => setStartReportDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900"
              />
=======
      {/* Activity Type Filter */}
      <div className="card-standard p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest font-inter">Filter Global Data:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'SUMMER_CAMP', label: 'Summer Camp' },
            ].map((bt) => (
              <button
                key={bt.id}
                onClick={() => setActivityType(bt.id as any)}
                className={`h-11 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs uppercase tracking-widest font-poppins ${activityType === bt.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                  }`}
              >
                {bt.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-inter">
          <Info size={12} className="text-indigo-500" />
          Reports are strictly filtered for Summer Camp 2026 data
        </p>
      </div>

      {/* Quick Generate Section */}
      <div className="card-standard p-6">
        <h2 className="text-base font-bold text-slate-900 mb-6 uppercase tracking-widest pt-1 font-poppins">Generate Instant Reports</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {[
            { id: 'daily', title: 'Daily Collection', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { id: 'payment', title: 'Monthly Collection', icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { id: 'subject_detailed', title: 'Subject Detailed', icon: BookOpen, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
            { id: 'total_detailed', title: 'Enrollment List', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
          ].map((report) => (
            <div
              key={report.id}
              className="group bg-white p-6 rounded-2xl transition-all text-center space-y-4 border border-slate-50 shadow-sm hover:shadow-md"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${report.bgColor} ${report.color} mx-auto transition-transform group-hover:scale-110`}>
                <report.icon size={24} />
              </div>
              <p className="font-bold text-xs text-slate-900 uppercase tracking-tight truncate font-inter">{report.title}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleDownload(report.id, 'CSV')}
                  disabled={!!downloading}
                  className="h-8 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex-1 font-poppins"
                >
                  {downloading === `${report.id}_CSV` ? <Loader2 size={12} className="animate-spin" /> : 'CSV'}
                </button>
                <button
                  onClick={() => handleDownload(report.id, 'PDF')}
                  disabled={!!downloading}
                  className="h-8 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100/50 flex-1 font-poppins"
                >
                  {downloading === `${report.id}_PDF` ? <Loader2 size={12} className="animate-spin" /> : 'PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Data Management (Importer) */}
      <div className="card-standard p-6 bg-gradient-to-br from-indigo-50/50 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
              <Upload size={24} />
>>>>>>> cdf9366 (Expand reports with full batch data)
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">End Date</label>
              <input
                ref={endDateRef}
                type="date"
                value={endReportDate}
                onChange={(event) => setEndReportDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={generateSubjectBatchReport}
            disabled={batchReportLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {batchReportLoading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
            Generate Report
          </button>

<<<<<<< HEAD
          {batchReportData ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBatchReportDownload('CSV')}
                disabled={!!downloading}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold uppercase tracking-widest text-emerald-600 border border-emerald-100"
=======
      {/* Available Reports Table */}
      <div className="card-standard overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-widest font-poppins">Report Catalog</h2>
        </div>
        <div className="overflow-x-auto no-scrollbar hidden lg:block">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-[10px] sm:text-sm font-bold text-gray-600 uppercase tracking-wider font-poppins">Report Name</th>
                <th className="px-3 sm:px-6 py-4 text-left text-[10px] sm:text-sm font-bold text-gray-600 uppercase tracking-wider font-poppins">Formats</th>
                <th className="px-3 sm:px-6 py-4 text-left text-[10px] sm:text-sm font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell font-poppins">Refreshed</th>
                <th className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-bold text-gray-600 uppercase tracking-wider font-poppins">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg">
                        <FileText size={16} className="text-indigo-600 sm:size-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 font-inter">{report.name}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1 font-inter">{report.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-800">CSV</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">PDF</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs text-gray-500 hidden sm:table-cell font-inter">{report.date}</td>
                  <td className="px-3 sm:px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleDownload(report.id, 'CSV')}
                        disabled={!!downloading}
                        className="w-10 h-10 flex items-center justify-center hover:bg-green-50 text-green-600 rounded-xl transition-all border border-transparent hover:border-green-100"
                        title="Download CSV"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDownload(report.id, 'PDF')}
                        disabled={!!downloading}
                        className="w-10 h-10 flex items-center justify-center hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                        title="Download PDF"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View for Reports */}
        <div className="lg:hidden divide-y divide-slate-100">
            {reports.map((report) => (
                <div key={report.id} className="p-4 space-y-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <FileText size={18} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight font-poppins">{report.name}</p>
                                <p className="text-[9px] font-medium text-slate-400 mt-0.5 line-clamp-1 font-inter">{report.desc}</p>
                            </div>
                        </div>
                        <div className="flex gap-1.5 grayscale opacity-60">
                            <span className="px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">CSV</span>
                            <span className="px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold bg-blue-50 text-blue-700 border border-blue-100">PDF</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDownload(report.id, 'CSV')}
                            disabled={!!downloading}
                            className="flex-1 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 font-poppins"
                        >
                            {downloading === `${report.id}_CSV` ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
                            Download CSV
                        </button>
                        <button
                            onClick={() => handleDownload(report.id, 'PDF')}
                            disabled={!!downloading}
                            className="flex-1 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 font-poppins"
                        >
                            {downloading === `${report.id}_PDF` ? <Loader2 size={12} className="animate-spin" /> : <FileText size={14} />}
                            Download PDF
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Subject & Batch-wise Student Report - NEW */}
      <div className="card-standard p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-widest font-poppins">Subject & Batch-wise Student Report</h2>
            <p className="text-xs text-slate-500 mt-1 font-inter">Filter students by subject and batch time, then export as CSV/PDF</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Dropdown Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Subject Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest font-inter">Select Subject *</label>
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectSelect(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-400"
              >
                <option value="">Choose a subject...</option>
                {allSubjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest font-inter">Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={!selectedSubject}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="ALL">All batches</option>
                {subjectBatches.map((batch: string) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest font-inter">Start Date</label>
              <input
                type="date"
                value={startReportDate}
                onChange={(e) => setStartReportDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest font-inter">End Date</label>
              <input
                type="date"
                value={endReportDate}
                onChange={(e) => setEndReportDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Generate Button */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest font-inter invisible">Action</label>
              <button
                onClick={generateSubjectBatchReport}
                disabled={!selectedSubject || subjectBatchReportLoading || !!downloading}
                className="w-full h-10 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
>>>>>>> cdf9366 (Expand reports with full batch data)
              >
                {downloading === 'subject_batch_CSV' ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
                Download CSV
              </button>
              <button
                onClick={() => handleBatchReportDownload('PDF')}
                disabled={!!downloading}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-xs font-bold uppercase tracking-widest text-indigo-600 border border-indigo-100"
              >
                {downloading === 'subject_batch_PDF' ? <Loader2 size={12} className="animate-spin" /> : <FileText size={14} />}
                Download PDF
              </button>
            </div>
<<<<<<< HEAD
          ) : null}
=======

            {/* Download Buttons Container */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest font-inter invisible">Download</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSubjectBatchDownload('CSV')}
                  disabled={!subjectBatchReportData || !!downloading}
                  className="flex-1 h-10 px-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                >
                  {downloading === 'subject_batch_CSV' ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
                  CSV
                </button>
                <button
                  onClick={() => handleSubjectBatchDownload('PDF')}
                  disabled={!subjectBatchReportData || !!downloading}
                  className="flex-1 h-10 px-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                >
                  {downloading === 'subject_batch_PDF' ? <Loader2 size={12} className="animate-spin" /> : <FileText size={14} />}
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          <div className="mt-4 p-3 rounded-lg border border-slate-200 bg-slate-50">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
              {debugMode ? '▼' : '▶'} Debug Info
            </button>
            {debugMode && (
              <div className="mt-3 space-y-2 text-[9px] font-mono bg-white p-2 rounded border border-slate-200 max-h-40 overflow-y-auto">
                <div><span className="text-slate-500">Subjects Loaded:</span> <span className="text-emerald-600 font-bold">{allSubjects.length}</span></div>
                <div><span className="text-slate-500">Selected Subject:</span> <span className="text-indigo-600 font-bold">{selectedSubject || 'None'}</span></div>
                <div><span className="text-slate-500">Available Batches:</span> <span className="text-purple-600 font-bold">{subjectBatches.length}</span></div>
                <div><span className="text-slate-500">Selected Batch:</span> <span className="text-orange-600 font-bold">{selectedBatch || 'ALL'}</span></div>
                <div><span className="text-slate-500">Report Generated:</span> <span className="text-blue-600 font-bold">{subjectBatchReportData ? 'Yes' : 'No'}</span></div>
                {subjectBatchReportData && (
                  <div><span className="text-slate-500">Report Rows:</span> <span className="text-emerald-600 font-bold">{subjectBatchReportData.rows?.length || 0}</span></div>
                )}
              </div>
            )}
          </div>

          {/* Report Results Table */}
          {subjectBatchReportLoading ? (
            <div className="py-10 flex items-center justify-center gap-2 text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest font-inter">Generating Report...</span>
            </div>
          ) : subjectBatchReportData ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-inter">Subject</p>
                  <p className="text-sm font-bold text-indigo-900 mt-1 font-poppins">{subjectBatchReportData.subject_name}</p>
                </div>
                <div className="p-3 rounded-xl border border-purple-100 bg-purple-50">
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest font-inter">Batch</p>
                  <p className="text-sm font-bold text-purple-900 mt-1 line-clamp-2 font-poppins">{subjectBatchReportData.batch === 'ALL' ? 'All batches' : subjectBatchReportData.batch}</p>
                </div>
                <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-inter">Total Students</p>
                  <p className="text-lg font-bold text-emerald-900 font-poppins">{subjectBatchReportData.summary?.total_students || 0}</p>
                </div>
                <div className="p-3 rounded-xl border border-orange-100 bg-orange-50">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest font-inter">Total Fees</p>
                  <p className="text-sm font-bold text-orange-900 font-poppins">{formatCurrency(subjectBatchReportData.summary?.total_fees || subjectBatchReportData.summary?.total_enrolled || 0)}</p>
                </div>
                <div className="p-3 rounded-xl border border-blue-100 bg-blue-50">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-inter">Total Paid</p>
                  <p className="text-sm font-bold text-blue-900 font-poppins">{formatCurrency(subjectBatchReportData.summary?.total_paid || 0)}</p>
                </div>
                <div className="p-3 rounded-xl border border-rose-100 bg-rose-50">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest font-inter">Total Pending</p>
                  <p className="text-sm font-bold text-rose-900 font-poppins">{formatCurrency(subjectBatchReportData.summary?.total_pending || 0)}</p>
                </div>
              </div>

              {/* Data Table */}
              {subjectBatchReportData.rows && subjectBatchReportData.rows.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Sr No.</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Enrollment ID</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Student ID</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Student Name</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Login ID</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Password</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Subject</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Batch Time</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Enrollment Date</th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Total Fee</th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Paid Amount</th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Pending</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Payment Mode</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Payment Status</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Payment ID</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Reference No</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Phone</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Receipt ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectBatchReportData.rows.map((row: any, index: number) => (
                        <tr key={index} className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-bold text-slate-900 font-poppins">{row.sr_no || index + 1}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-mono">{row.enrollment_id}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.student_id}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.student_name}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-mono">{row.login_id}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-mono">{row.password}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.subject_name}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.batch_time}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.enrollment_date}</td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-700 text-right font-poppins">{formatCurrency(row.total_fee || 0)}</td>
                          <td className="px-4 py-3 text-xs font-bold text-emerald-600 text-right font-poppins">{formatCurrency(row.paid_amount || 0)}</td>
                          <td className="px-4 py-3 text-xs font-bold text-rose-600 text-right font-poppins">{formatCurrency(row.pending_amount || 0)}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.payment_mode}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${getPaymentStatusClass(row.payment_status)}`}>
                              {row.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.payment_id}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.payment_reference_no}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.phone_number}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 font-inter">{row.receipt_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-widest font-inter">No students found for this selection</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <p className="text-xs font-bold uppercase tracking-widest font-inter">Select subject and batch, then click "Generate Report" to view student details</p>
            </div>
          )}
>>>>>>> cdf9366 (Expand reports with full batch data)
        </div>
      </div>

      {batchReportLoading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-500 shadow-sm">
          <Loader2 size={18} className="mx-auto mb-3 animate-spin" />
          <p className="text-sm font-semibold uppercase tracking-widest">Loading report data...</p>
        </div>
      ) : batchReportData ? (
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Selected Subject</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{batchReportData.subject_name}</p>
              <p className="text-xs text-slate-500">{batchReportData.batch === 'ALL' ? 'All batches' : batchReportData.batch}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Date Range</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{batchReportData.start_date} → {batchReportData.end_date}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Total Students</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{batchReportData.total_students}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Generated</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{batchReportData.generated_at}</p>
            </div>
          </div>

          {batchReportData.totals_by_batch?.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {batchReportData.totals_by_batch.map((entry: any) => (
                <div key={entry.batch_time} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Batch</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{entry.batch_time}</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{entry.total_students}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Sr. No.</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Student Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Login ID</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Batch</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Enrollment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchReportData.rows?.map((row: any, index: number) => (
                  <tr key={`${row.student_id}-${index}`} className="bg-white">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700">{index + 1}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{row.student_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{row.login_id}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{row.subject_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{row.batch_time}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{row.enrollment_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-400">
          <p className="text-sm font-semibold uppercase tracking-widest">No report generated yet</p>
          <p className="mt-2 text-xs">Choose subject, batch, and date range above, then click Generate Report.</p>
        </div>
      )}
    </div>
  )
}
