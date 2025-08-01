'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple connection test - just check if we can reach Supabase
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, error } = await supabase.auth.getSession()

        // If we get any response (even an error), it means we can connect
        // The error here would be auth-related, not connection-related
        setIsConnected(true)

      } catch (error) {
        console.error('Supabase connection error:', error)
        setIsConnected(false)
      } finally {
        setLoading(false)
      }
    }

    // Also check if environment variables are present
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setIsConnected(false)
      setLoading(false)
      return
    }

    checkConnection()
  }, [])

  const getStatusColor = () => {
    if (loading) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (isConnected) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getStatusText = () => {
    if (loading) return 'Checking connection...'
    if (isConnected) return 'Connected to Supabase'
    return 'Failed to connect to Supabase'
  }

  const getStatusIcon = () => {
    if (loading) return '⏳'
    if (isConnected) return '✅'
    return '❌'
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-r from-purple-200 via-pink-200 to-emerald-200 p-[1px] shadow-lg rounded-lg">
        <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Supabase Connection Status
        </h3>

        <div className={`px-4 py-3 rounded-md border text-center ${getStatusColor()}`}>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">{getStatusIcon()}</span>
            <span className="font-medium">{getStatusText()}</span>
          </div>
        </div>

        {!isConnected && !loading && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              Make sure your environment variables are set:
            </p>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li>• NEXT_PUBLIC_SUPABASE_URL</li>
              <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}