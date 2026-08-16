import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  FilePlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { getClaims } from '../services/claimService'
import { useAuth } from '../hooks/useAuth'
import { Card, CardHeader, CardTitle, CardBody } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'

function FarmerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchFarmerClaims = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getClaims()
      setClaims(response.data?.data || [])
    } catch (err) {
      console.error('Failed to load farmer claims:', err)
      setError(
        err.response?.data?.message ||
          'Unable to load your claims data. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFarmerClaims()
  }, [fetchFarmerClaims])

  // Calculate statistics from the farmer's claims
  const totalClaims = claims.length
  const pendingCount = claims.filter((c) => c.status === 'Pending').length
  const approvedCount = claims.filter((c) => c.status === 'Approved').length
  const rejectedCount = claims.filter((c) => c.status === 'Rejected').length

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge color="green">Approved</Badge>
      case 'Pending':
        return <Badge color="yellow">Pending</Badge>
      case 'Rejected':
        return <Badge color="red">Rejected</Badge>
      default:
        return <Badge color="gray">{status}</Badge>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Welcome & Header Section with Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/50 rounded-full text-xs font-medium text-emerald-100 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
              Farmer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.name || 'Farmer'}!
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-xl">
              Track active crop protections, monitor real-time claim statuses,
              and manage agricultural coverage.
            </p>
          </div>

          {/* 2. Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/policies">
              <Button
                variant="secondary"
                size="md"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm"
              >
                <FileText className="w-4 h-4" />
                Browse Policies
              </Button>
            </Link>
            <Link to="/submit-claim">
              <Button
                variant="primary"
                size="md"
                className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-950/20"
              >
                <FilePlus className="w-4 h-4" />
                Submit Claim
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Claim Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Claims */}
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Claims
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : totalClaims}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>All filed claims to date</span>
            </div>
          </CardBody>
        </Card>

        {/* Pending */}
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {loading ? '...' : pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-amber-600 font-medium">
              <span>Awaiting admin evaluation</span>
            </div>
          </CardBody>
        </Card>

        {/* Approved */}
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved Claims
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {loading ? '...' : approvedCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
              <span>Settlement verified</span>
            </div>
          </CardBody>
        </Card>

        {/* Rejected */}
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rejected Claims
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {loading ? '...' : rejectedCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-red-600 font-medium">
              <span>Eligibility not met</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 4. Recent Claims & Actions */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <CardTitle>Recent Claims History</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchFarmerClaims}
              disabled={loading}
              className="text-gray-500 hover:text-gray-900"
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={fetchFarmerClaims}
                  className="shrink-0"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="py-12">
              <Loading message="Loading your claims..." />
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && claims.length === 0 && (
            <div className="p-6">
              <EmptyState
                icon={FilePlus}
                title="No insurance claims filed yet"
                description="When your insured crops suffer damage from drought, flood, pests, or hail, file a claim to request compensation."
                actionLabel="Submit Your First Claim"
                onAction={() => navigate('/submit-claim')}
              />
            </div>
          )}

          {/* Table of Claims for Desktop */}
          {!loading && !error && claims.length > 0 && (
            <div>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5">Policy / Crop</th>
                      <th className="px-6 py-3.5">Damage Type</th>
                      <th className="px-6 py-3.5">Incident Date</th>
                      <th className="px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Filed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {claims.map((claim) => (
                      <tr
                        key={claim._id}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {claim.policy?.policyName || 'Standard Policy'}
                          </div>
                          <div className="text-xs text-emerald-700 font-medium">
                            Crop: {claim.crop}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            {claim.damageType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(claim.incidentDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center gap-1.5 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {claim.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(claim.status)}
                          {claim.reviewNotes && (
                            <p className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={claim.reviewNotes}>
                              Note: {claim.reviewNotes}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-gray-500">
                          {formatDate(claim.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-gray-100">
                {claims.map((claim) => (
                  <div key={claim._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {claim.policy?.policyName || 'Crop Policy'}
                        </h4>
                        <p className="text-xs text-emerald-600 font-medium">
                          Crop: {claim.crop}
                        </p>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                      <div>
                        <span className="text-gray-400 block">Damage:</span>
                        <span className="font-medium text-gray-800">
                          {claim.damageType}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Location:</span>
                        <span className="font-medium text-gray-800 truncate block">
                          {claim.location}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Incident:</span>
                        <span>{formatDate(claim.incidentDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Filed:</span>
                        <span>{formatDate(claim.createdAt)}</span>
                      </div>
                    </div>

                    {claim.description && (
                      <p className="text-xs text-gray-600 italic">
                        &quot;{claim.description}&quot;
                      </p>
                    )}

                    {claim.reviewNotes && (
                      <div className="text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-200">
                        <strong>Review Note:</strong> {claim.reviewNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default FarmerDashboard
