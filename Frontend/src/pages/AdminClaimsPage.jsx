import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  ExternalLink,
  User,
  Sprout,
  Eye,
  FileCheck,
  FileX,
  FileText,
  AlertTriangle,
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
} from 'lucide-react'
import { getClaims, updateClaimStatus } from '../services/claimService'
import { getWeather } from '../services/weatherService'
import { Card, CardHeader, CardTitle, CardBody } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Select from '../components/Select'
import Modal from '../components/Modal'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'

const DAMAGE_TYPE_OPTIONS = [
  { value: '', label: 'All Damage Types' },
  { value: 'Drought', label: 'Drought' },
  { value: 'Flood', label: 'Flood' },
  { value: 'Hail', label: 'Hail' },
  { value: 'Pest Infestation', label: 'Pest Infestation' },
  { value: 'Frost / Freeze', label: 'Frost / Freeze' },
  { value: 'Crop Disease', label: 'Crop Disease' },
  { value: 'Fire', label: 'Fire' },
  { value: 'Wind / Storm', label: 'Wind / Storm' },
  { value: 'Other', label: 'Other' },
]

function AdminClaimsPage() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, Pending, Approved, Rejected
  const [damageTypeFilter, setDamageTypeFilter] = useState('')

  // Review / Details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewNotesError, setReviewNotesError] = useState('')

  // External Weather Context state for modal
  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [weatherCityInput, setWeatherCityInput] = useState('')

  // Decision Confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'Approved' | 'Rejected'
  const [submittingDecision, setSubmittingDecision] = useState(false)

  // Fetch all claims from backend
  const fetchClaimsData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getClaims()
      setClaims(response.data?.data || [])
    } catch (err) {
      console.error('Failed to load claims:', err)
      setError(
        err.response?.data?.message ||
          'Failed to load claims records. Please check your connection and retry.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClaimsData()
  }, [fetchClaimsData])

  // Clear success notification after 5s
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => {
      setSuccessMessage('')
    }, 5000)
    return () => clearTimeout(timer)
  }, [successMessage])

  // Fetch weather for a given location / city
  const fetchClaimWeather = useCallback(async (locationStr) => {
    if (!locationStr || !locationStr.trim()) {
      setWeatherError('No location specified in this claim record.')
      return
    }

    setWeatherLoading(true)
    setWeatherError('')
    try {
      const response = await getWeather(locationStr.trim())
      if (response.data?.success && response.data?.data) {
        setWeatherData(response.data.data)
      } else {
        setWeatherData(null)
        setWeatherError('No meteorological records returned for this location.')
      }
    } catch (err) {
      console.error('Failed to fetch weather for claim location:', err)
      setWeatherData(null)
      setWeatherError(
        err.response?.data?.message ||
          `Unable to retrieve weather data for "${locationStr}". Try checking city name spelling.`
      )
    } finally {
      setWeatherLoading(false)
    }
  }, [])

  // Metric counts
  const counts = useMemo(() => {
    const total = claims.length
    const pending = claims.filter((c) => c.status === 'Pending').length
    const approved = claims.filter((c) => c.status === 'Approved').length
    const rejected = claims.filter((c) => c.status === 'Rejected').length
    return { total, pending, approved, rejected }
  }, [claims])

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Status filter
      if (statusFilter !== 'ALL' && claim.status !== statusFilter) {
        return false
      }

      // Damage type filter
      if (
        damageTypeFilter &&
        claim.damageType?.toLowerCase() !== damageTypeFilter.toLowerCase()
      ) {
        return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const farmerName = claim.farmer?.name?.toLowerCase() || ''
        const farmerEmail = claim.farmer?.email?.toLowerCase() || ''
        const policyName = claim.policy?.policyName?.toLowerCase() || ''
        const crop = claim.crop?.toLowerCase() || ''
        const damageType = claim.damageType?.toLowerCase() || ''
        const location = claim.location?.toLowerCase() || ''
        const description = claim.description?.toLowerCase() || ''
        const claimId = claim._id?.toLowerCase() || ''

        const matches =
          farmerName.includes(query) ||
          farmerEmail.includes(query) ||
          policyName.includes(query) ||
          crop.includes(query) ||
          damageType.includes(query) ||
          location.includes(query) ||
          description.includes(query) ||
          claimId.includes(query)

        if (!matches) return false
      }

      return true
    })
  }, [claims, statusFilter, damageTypeFilter, searchQuery])

  // Open Claim Details / Review Modal
  const handleOpenReviewModal = (claim) => {
    setSelectedClaim(claim)
    setReviewNotes(claim.reviewNotes || '')
    setReviewNotesError('')
    setWeatherData(null)
    setWeatherError('')
    setWeatherCityInput(claim.location || '')
    setDetailsModalOpen(true)

    // Automatically lookup weather for claim location upon opening modal
    if (claim.location) {
      fetchClaimWeather(claim.location)
    }
  }

  const handleCloseReviewModal = () => {
    if (submittingDecision) return
    setDetailsModalOpen(false)
    setSelectedClaim(null)
    setReviewNotes('')
    setReviewNotesError('')
    setWeatherData(null)
    setWeatherError('')
    setWeatherLoading(false)
  }

  // Trigger Confirmation for Approve or Reject
  const handleInitiateDecision = (status) => {
    // If rejecting, review notes are strongly required to explain to the farmer
    if (status === 'Rejected' && !reviewNotes.trim()) {
      setReviewNotesError('Please provide a reason or review note explaining why this claim is being rejected.')
      return
    }

    setReviewNotesError('')
    setPendingAction(status)
    setConfirmModalOpen(true)
  }

  // Execute PUT /api/claims/:id/status
  const handleConfirmDecision = async () => {
    if (!selectedClaim || !pendingAction) return

    setSubmittingDecision(true)
    setError('')

    try {
      const response = await updateClaimStatus(selectedClaim._id, {
        status: pendingAction,
        reviewNotes: reviewNotes.trim(),
      })

      setSuccessMessage(
        response.data?.message ||
          `Claim has been ${pendingAction.toLowerCase()} successfully.`
      )

      setConfirmModalOpen(false)
      setDetailsModalOpen(false)
      setSelectedClaim(null)
      setReviewNotes('')
      setPendingAction(null)
      setWeatherData(null)

      // Refresh claim list
      fetchClaimsData()
    } catch (err) {
      console.error('Update claim status error:', err)
      const msg =
        err.response?.data?.message ||
        `Failed to ${pendingAction?.toLowerCase()} claim. Please retry.`
      setError(msg)
      setConfirmModalOpen(false)
    } finally {
      setSubmittingDecision(false)
    }
  }

  // Weather icon helper
  const getWeatherIcon = (condition = '') => {
    const lower = condition.toLowerCase()
    if (lower.includes('thunderstorm') || lower.includes('lightning')) {
      return <CloudLightning className="w-7 h-7 text-amber-500" />
    }
    if (lower.includes('rain')) {
      return <CloudRain className="w-7 h-7 text-blue-500" />
    }
    if (lower.includes('drizzle')) {
      return <CloudDrizzle className="w-7 h-7 text-cyan-500" />
    }
    if (lower.includes('snow') || lower.includes('freeze') || lower.includes('frost')) {
      return <CloudSnow className="w-7 h-7 text-sky-400" />
    }
    if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) {
      return <CloudFog className="w-7 h-7 text-gray-400" />
    }
    if (lower.includes('cloud')) {
      return <Cloud className="w-7 h-7 text-slate-500" />
    }
    return <Sun className="w-7 h-7 text-amber-500" />
  }

  const formatCurrency = (amount) => {
    if (amount == null) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge color="green" size="md">
            Approved
          </Badge>
        )
      case 'Pending':
        return (
          <Badge color="yellow" size="md">
            Pending Review
          </Badge>
        )
      case 'Rejected':
        return (
          <Badge color="red" size="md">
            Rejected
          </Badge>
        )
      default:
        return <Badge color="gray">{status}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Claims Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Insurance Claims Queue
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Review filed crop damage claims, verify farmer documentation, inspect policy coverage limits, and approve or reject indemnity payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={fetchClaimsData}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm"
              title="Refresh claims list"
            >
              <RefreshCw
                className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`}
              />
              Sync Claims
            </Button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50/70">
          <CardBody className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-red-700">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold">Error Processing Claim</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={fetchClaimsData}
                className="shrink-0"
              >
                Retry
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 2. Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-gray-200">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Filed Claims
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                {loading ? '...' : counts.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">All platform submissions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Pending Review
                </p>
                {counts.pending > 0 && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                {loading ? '...' : counts.pending}
              </p>
              <p className="text-xs text-amber-700 mt-1">Action required</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700">
              <Clock className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Approved
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                {loading ? '...' : counts.approved}
              </p>
              <p className="text-xs text-emerald-700 mt-1">Compensation authorized</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-gray-200">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rejected
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1">
                {loading ? '...' : counts.rejected}
              </p>
              <p className="text-xs text-gray-500 mt-1">Declined claims</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Filter & Search Controls */}
      <Card className="border-gray-200">
        <CardBody className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by farmer name, email, policy, crop, location, damage type..."
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Damage Type Filter & Status Tabs */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-48">
                <Select
                  options={DAMAGE_TYPE_OPTIONS}
                  value={damageTypeFilter}
                  onChange={(e) => setDamageTypeFilter(e.target.value)}
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50/80 text-xs font-medium">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-gray-900 font-bold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({counts.total})
                </button>
                <button
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'Pending'
                      ? 'bg-amber-500 text-white font-bold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pending ({counts.pending})
                </button>
                <button
                  onClick={() => setStatusFilter('Approved')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'Approved'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Approved ({counts.approved})
                </button>
                <button
                  onClick={() => setStatusFilter('Rejected')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'Rejected'
                      ? 'bg-red-600 text-white font-bold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rejected ({counts.rejected})
                </button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Claims Data Table / Cards */}
      <div>
        {/* Loading State */}
        {loading && (
          <div className="py-16">
            <Loading message="Loading insurance claims queue..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredClaims.length === 0 && (
          <Card>
            <CardBody className="p-8">
              <EmptyState
                icon={ShieldCheck}
                title={
                  searchQuery || statusFilter !== 'ALL' || damageTypeFilter
                    ? 'No matching claims found'
                    : 'No insurance claims submitted'
                }
                description={
                  searchQuery || statusFilter !== 'ALL' || damageTypeFilter
                    ? 'Try clearing your search query or status filter to view all claims.'
                    : 'When farmers submit crop damage claims, they will appear in this administrative queue.'
                }
                actionLabel={
                  searchQuery || statusFilter !== 'ALL' || damageTypeFilter
                    ? 'Reset Filters'
                    : undefined
                }
                onAction={
                  searchQuery || statusFilter !== 'ALL' || damageTypeFilter
                    ? () => {
                        setSearchQuery('')
                        setStatusFilter('ALL')
                        setDamageTypeFilter('')
                      }
                    : undefined
                }
              />
            </CardBody>
          </Card>
        )}

        {/* Claims Table (Desktop) & Cards (Mobile) */}
        {!loading && filteredClaims.length > 0 && (
          <Card className="border-gray-200 overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <CardTitle>Insurance Claims Records</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing {filteredClaims.length} of {counts.total} total claims
                </p>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/90 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5">Farmer &amp; Contact</th>
                      <th className="px-6 py-3.5">Policy &amp; Crop</th>
                      <th className="px-6 py-3.5">Damage &amp; Location</th>
                      <th className="px-6 py-3.5">Incident Date</th>
                      <th className="px-6 py-3.5">Submitted</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Review / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClaims.map((claim) => (
                      <tr
                        key={claim._id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        {/* Farmer Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {claim.farmer?.name || 'Unknown Farmer'}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {claim.farmer?.email || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Policy & Crop */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {claim.policy?.policyName || 'Standard Policy'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Sprout className="w-3 h-3" />
                              {claim.crop}
                            </span>
                            {claim.policy?.coverageAmount && (
                              <span className="text-[11px] text-gray-400">
                                Limit: {formatCurrency(claim.policy.coverageAmount)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Damage & Location */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-800">
                            {claim.damageType}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[150px]">
                              {claim.location}
                            </span>
                          </div>
                        </td>

                        {/* Incident Date */}
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(claim.incidentDate)}
                          </div>
                        </td>

                        {/* Submitted Date */}
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {formatDate(claim.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(claim.status)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {claim.status === 'Pending' ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenReviewModal(claim)}
                              className="text-xs px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              Review Claim
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenReviewModal(claim)}
                              className="text-xs px-2.5 py-1 text-gray-700"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View Record
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredClaims.map((claim) => (
                  <div key={claim._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm">
                            {claim.farmer?.name || 'Farmer'}
                          </p>
                          <span className="text-xs text-gray-400">
                            #{claim._id.slice(-5).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {claim.policy?.policyName || 'Crop Policy'} &bull;{' '}
                          <strong className="text-emerald-700 font-semibold">
                            {claim.crop}
                          </strong>
                        </p>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-gray-400 block">Damage Cause:</span>
                        <span className="font-bold text-gray-800">
                          {claim.damageType}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Incident Date:</span>
                        <span className="text-gray-700 font-medium">
                          {formatDate(claim.incidentDate)}
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-gray-200/60 flex items-center justify-between text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {claim.location}
                        </span>
                        <span>Filed: {formatDate(claim.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      {claim.status === 'Pending' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenReviewModal(claim)}
                          className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Review Claim
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenReviewModal(claim)}
                          className="text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Record
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* 5. Claim Review & Evaluation Modal */}
      <Modal
        open={detailsModalOpen}
        onClose={handleCloseReviewModal}
        title={
          selectedClaim?.status === 'Pending'
            ? 'Review & Evaluate Claim'
            : 'Claim Audit Record'
        }
        size="lg"
      >
        {selectedClaim && (
          <div className="space-y-6">
            {/* Modal Header Badge & Claim ID */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sprout className="w-3.5 h-3.5" />
                    Crop: {selectedClaim.crop}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    ID: #{selectedClaim._id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedClaim.policy?.policyName || 'Crop Insurance Policy'}
                </h3>
              </div>
              {getStatusBadge(selectedClaim.status)}
            </div>

            {/* Farmer & Policy Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Farmer Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Farmer Profile
                </p>
                <p className="text-base font-bold text-gray-900">
                  {selectedClaim.farmer?.name || 'Farmer Account'}
                </p>
                <p className="text-xs text-gray-500">
                  Email: {selectedClaim.farmer?.email || 'N/A'}
                </p>
              </div>

              {/* Policy Financials */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Policy Coverage
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Coverage Limit:</span>
                  <strong className="text-sm font-bold text-emerald-900">
                    {formatCurrency(selectedClaim.policy?.coverageAmount)}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Annual Premium:</span>
                  <strong className="font-semibold text-gray-800">
                    {formatCurrency(selectedClaim.policy?.premiumAmount)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Damage Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Damage Cause:
                </span>
                <span className="font-bold text-gray-900">
                  {selectedClaim.damageType}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Incident Date:
                </span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(selectedClaim.incidentDate)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Field Location:
                </span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {selectedClaim.location}
                </span>
              </div>
            </div>

            {/* Farmer's Incident Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Farmer&apos;s Incident Description:
              </h4>
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                {selectedClaim.description
                  ? `"${selectedClaim.description}"`
                  : 'No detailed description was provided by the farmer.'}
              </div>
            </div>

            {/* Document / Evidence URL */}
            {selectedClaim.documentUrl && (
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Evidence Attachment URL:</span>
                  <span className="font-mono text-[11px] text-gray-500 truncate max-w-xs">
                    {selectedClaim.documentUrl}
                  </span>
                </div>
                <a
                  href={selectedClaim.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0"
                >
                  Open Evidence
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* --- DEDICATED WEATHER CONTEXT SECTION --- */}
            <div className="rounded-xl border-2 border-sky-200 bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-slate-50 p-4 sm:p-5 space-y-4">
              {/* Weather Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-100 rounded-lg text-sky-700">
                      <CloudSun className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-sky-950">
                      External Meteorological Reference Data
                    </h4>
                  </div>
                  <p className="text-[11px] text-sky-800/80">
                    Third-party atmospheric proxy context for verification against recorded damages.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fetchClaimWeather(weatherCityInput || selectedClaim.location)}
                    disabled={weatherLoading}
                    className="bg-white hover:bg-sky-50 text-sky-900 border-sky-200 text-xs shrink-0"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 mr-1 text-sky-600 ${
                        weatherLoading ? 'animate-spin' : ''
                      }`}
                    />
                    Check Weather
                  </Button>
                </div>
              </div>

              {/* Weather Data / States */}
              {weatherLoading && (
                <div className="py-6">
                  <Loading message={`Querying weather records for "${weatherCityInput || selectedClaim.location}"...`} />
                </div>
              )}

              {!weatherLoading && weatherError && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <span className="font-semibold">{weatherError}</span>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Weather check is advisory and does not block claim approval or rejection.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={weatherCityInput}
                      onChange={(e) => setWeatherCityInput(e.target.value)}
                      placeholder="Try city name..."
                      className="px-2 py-1 text-xs border border-amber-300 rounded bg-white text-gray-900 w-32 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fetchClaimWeather(weatherCityInput)}
                      className="text-xs px-2 py-1 bg-white"
                    >
                      Lookup
                    </Button>
                  </div>
                </div>
              )}

              {!weatherLoading && !weatherError && weatherData && (
                <div className="space-y-3.5">
                  {/* Primary Weather Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Temperature */}
                    <div className="p-3 rounded-lg bg-white/90 border border-sky-100 shadow-sm flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                        <Thermometer className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block font-medium">
                          Temperature
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {Math.round(weatherData.temperature)}°C
                        </span>
                      </div>
                    </div>

                    {/* Condition & Description */}
                    <div className="p-3 rounded-lg bg-white/90 border border-sky-100 shadow-sm flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-sky-50 shrink-0">
                        {getWeatherIcon(weatherData.condition)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-gray-500 block font-medium truncate">
                          {weatherData.condition}
                        </span>
                        <span className="text-xs font-bold text-gray-900 capitalize truncate block">
                          {weatherData.description}
                        </span>
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="p-3 rounded-lg bg-white/90 border border-sky-100 shadow-sm flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block font-medium">
                          Humidity
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {weatherData.humidity}%
                        </span>
                      </div>
                    </div>

                    {/* Wind Speed */}
                    <div className="p-3 rounded-lg bg-white/90 border border-sky-100 shadow-sm flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0">
                        <Wind className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block font-medium">
                          Wind Speed
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {weatherData.windSpeed} m/s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weather Alerts & City Match Footnote */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-sky-900/90">
                    <div className="flex items-center gap-1.5">
                      {weatherData.alerts ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-100/90 px-2 py-0.5 rounded">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          Severe Weather Alert: {weatherData.alerts}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          No active weather warnings
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500">
                      Reporting Station: <strong>{weatherData.city}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Advisory Disclaimer */}
              <div className="pt-2 border-t border-sky-200/60 text-[11px] text-sky-900/75 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>
                  <strong>Advisory:</strong> Meteorological readings provide external context for field conditions. Admins hold full responsibility for final claim decisions.
                </span>
              </div>
            </div>

            {/* If Already Reviewed: Show Existing Review Notes & Audit Info */}
            {selectedClaim.status !== 'Pending' && (
              <div
                className={`p-4 rounded-xl border space-y-2 text-xs ${
                  selectedClaim.status === 'Approved'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider">
                    {selectedClaim.status === 'Approved'
                      ? 'Decision: Approved for Payout'
                      : 'Decision: Claim Rejected'}
                  </span>
                  {selectedClaim.reviewedAt && (
                    <span className="text-[11px] opacity-80">
                      Evaluated on {formatDateTime(selectedClaim.reviewedAt)}
                    </span>
                  )}
                </div>
                {selectedClaim.reviewNotes ? (
                  <p className="leading-relaxed">
                    <strong>Review Notes:</strong> {selectedClaim.reviewNotes}
                  </p>
                ) : (
                  <p className="italic opacity-80">
                    No additional reviewer notes recorded.
                  </p>
                )}
                {selectedClaim.reviewedBy && (
                  <p className="text-[11px] opacity-80">
                    Reviewer:{' '}
                    {selectedClaim.reviewedBy.name || selectedClaim.reviewedBy.email || 'Admin'}
                  </p>
                )}
              </div>
            )}

            {/* If Pending: Review Notes Input and Action Buttons */}
            {selectedClaim.status === 'Pending' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <label
                    htmlFor="reviewNotes"
                    className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                  >
                    Administrative Review Notes &amp; Decision Rationale
                  </label>
                  <textarea
                    id="reviewNotes"
                    rows={3}
                    value={reviewNotes}
                    onChange={(e) => {
                      setReviewNotes(e.target.value)
                      if (reviewNotesError) setReviewNotesError('')
                    }}
                    placeholder="Enter assessment findings, payout adjustments, or rejection grounds..."
                    className={`block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                      reviewNotesError
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-500'
                    }`}
                  />
                  {reviewNotesError ? (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {reviewNotesError}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-gray-500">
                      * Required when rejecting a claim to inform the farmer.
                    </p>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="secondary"
                    onClick={handleCloseReviewModal}
                    disabled={submittingDecision}
                  >
                    Cancel
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="danger"
                      onClick={() => handleInitiateDecision('Rejected')}
                      disabled={submittingDecision}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <FileX className="w-4 h-4 mr-1.5" />
                      Reject Claim
                    </Button>

                    <Button
                      variant="primary"
                      onClick={() => handleInitiateDecision('Approved')}
                      disabled={submittingDecision}
                      className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-950/20"
                    >
                      <FileCheck className="w-4 h-4 mr-1.5" />
                      Approve Claim
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 6. Action Confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onClose={() => !submittingDecision && setConfirmModalOpen(false)}
        title={
          pendingAction === 'Approved'
            ? 'Confirm Claim Approval'
            : 'Confirm Claim Rejection'
        }
        size="md"
      >
        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl border text-xs space-y-1.5 leading-relaxed flex items-start gap-3 ${
              pendingAction === 'Approved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {pendingAction === 'Approved' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">
                {pendingAction === 'Approved'
                  ? 'Authorize Claim Approval'
                  : 'Decline Crop Damage Claim'}
              </p>
              <p>
                Are you sure you want to set this claim status to{' '}
                <strong>{pendingAction}</strong>?
              </p>
              <p className="opacity-80">
                This action is final and will be updated in the farmer&apos;s claim tracker.
              </p>
            </div>
          </div>

          {selectedClaim && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
              <p className="font-bold text-gray-900">
                Farmer: {selectedClaim.farmer?.name} ({selectedClaim.crop})
              </p>
              <p className="text-gray-600">
                Policy: {selectedClaim.policy?.policyName} &bull; Cause: {selectedClaim.damageType}
              </p>
              {reviewNotes && (
                <p className="text-gray-700 pt-1 border-t border-gray-200">
                  <strong>Notes:</strong> &quot;{reviewNotes}&quot;
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setConfirmModalOpen(false)}
              disabled={submittingDecision}
            >
              Cancel
            </Button>
            <Button
              variant={pendingAction === 'Approved' ? 'primary' : 'danger'}
              onClick={handleConfirmDecision}
              loading={submittingDecision}
              disabled={submittingDecision}
            >
              Confirm {pendingAction}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminClaimsPage
