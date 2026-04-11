'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoginPage from '@/components/LoginPage'
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'

export default function StudentDashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Security: If not a student, send back to admin
  if (user?.role !== 'STUDENT') {
    router.replace('/admin')
    return null
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      userRole="student"
    />
  )
}
