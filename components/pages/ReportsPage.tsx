'use client'

import { Download, FileText, Loader2, Calendar } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
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

      setSubjectBatches(
        batches
          .map((batch: any) => batch?.batch_time || batch?.name || String(batch || ''))
          .filter(Boolean)
      )
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const isAllBatch = selectedBatch === 'ALL'

  const batchGroups: Record<string, any[]> = {}
  if (batchReportData?.rows) {
    for (const row of batchReportData.rows) {
      const bn = row.batch_time || 'Unknown'
      if (!batchGroups[bn]) batchGroups[bn] = []
      batchGroups[bn].push(row)
    }
  }
  const sortedBatchNames = Object.keys(batchGroups).sort()
  const totalStudents = batchReportData?.rows?.length ?? 0

  return (
    <div className="p-2.5 sm:p-6 space-y-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-tight font-poppins">Subject-Wise Batch-Wise Enrollment Report</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium font-inter">Generate a student list for a subject and batch within a date range.</p>
        </div>

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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
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
              >
                {downloading === 'subject_batch_CSV' ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
                Download CSV
              </button>
              <button
                onClick={() => handleBatchReportDownload('PDF')}
                disabled={!!downloading}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-xs font-bold uppercase tracking-widest text-indigo-600 border border-indigo-100 disabled:opacity-50"
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
          {/* Summary Stats */}
          <div className="grid gap-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Subject</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{batchReportData.subject_name}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-blue-50 p-3">
              <p className="text-[10px] uppercase tracking-widest text-blue-600">
                {isAllBatch ? 'Total Students' : `Students in ${selectedBatch}`}
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{totalStudents}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-green-50 p-3">
              <p className="text-[10px] uppercase tracking-widest text-green-600">Total Paid</p>
              <p className="mt-1 text-sm font-bold text-green-900">{formatCurrency(batchReportData.summary?.total_paid || 0)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-red-50 p-3">
              <p className="text-[10px] uppercase tracking-widest text-red-600">Total Pending</p>
              <p className="mt-1 text-sm font-bold text-red-900">{formatCurrency(batchReportData.summary?.total_pending || 0)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-purple-50 p-3">
              <p className="text-[10px] uppercase tracking-widest text-purple-600">Total Fees</p>
              <p className="mt-1 text-sm font-bold text-purple-900">{formatCurrency(batchReportData.summary?.total_enrolled || 0)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-600">Generated</p>
              <p className="mt-1 text-xs font-bold text-slate-900">{batchReportData.generated_at}</p>
            </div>
          </div>

          {/* Payment Mode Breakdown */}
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-cyan-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-cyan-600 font-bold">Online Payments</p>
              <p className="mt-2 text-2xl font-bold text-cyan-900">{formatCurrency(batchReportData.summary?.online_payments || 0)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-orange-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Offline Payments</p>
              <p className="mt-2 text-2xl font-bold text-orange-900">{formatCurrency(batchReportData.summary?.offline_payments || 0)}</p>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-900 text-white sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-widest w-16">Sr. No.</th>
                  <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-widest">Student Name</th>
                  <th className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-widest w-36">Student ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {totalStudents > 0 ? (
                  <>
                    {isAllBatch ? (
                      sortedBatchNames.map((batchName) => {
                        const batchRows = batchGroups[batchName]
                        return (
                          <Fragment key={`batch-${batchName}`}>
                            <tr className="bg-indigo-50 border-t-2 border-indigo-100">
                              <td colSpan={3} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                                {batchName} &nbsp;•&nbsp; {batchRows.length} Student{batchRows.length !== 1 ? 's' : ''}
                              </td>
                            </tr>
                            {batchRows.map((row: any, index: number) => (
                              <tr
                                key={`${row.student_id}-${index}`}
                                className={index % 2 === 0 ? 'bg-white hover:bg-slate-50 transition' : 'bg-slate-50 hover:bg-slate-100 transition'}
                              >
                                <td className="px-4 py-3 text-center font-semibold text-slate-500">{row.sr_no || index + 1}</td>
                                <td className="px-4 py-3 font-medium text-slate-900 break-words">{row.student_name}</td>
                                <td className="px-4 py-3 text-center text-slate-700 font-mono">{row.student_id}</td>
                              </tr>
                            ))}
                          </Fragment>
                        )
                      })
                    ) : (
                      batchReportData.rows.map((row: any, index: number) => (
                        <tr
                          key={`${row.student_id}-${index}`}
                          className={index % 2 === 0 ? 'bg-white hover:bg-slate-50 transition' : 'bg-slate-50 hover:bg-slate-100 transition'}
                        >
                          <td className="px-4 py-3 text-center font-semibold text-slate-500">{row.sr_no || index + 1}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 break-words">{row.student_name}</td>
                          <td className="px-4 py-3 text-center text-slate-700 font-mono">{row.student_id}</td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-slate-800 text-white">
                      <td colSpan={3} className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest">
                        {isAllBatch
                          ? `Total: ${totalStudents} Student${totalStudents !== 1 ? 's' : ''} across ${sortedBatchNames.length} Batch${sortedBatchNames.length !== 1 ? 'es' : ''}`
                          : `Total: ${totalStudents} Student${totalStudents !== 1 ? 's' : ''} in ${selectedBatch}`
                        }
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No enrollment records found for the selected criteria.
                    </td>
                  </tr>
                )}
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
