import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  FilePlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Search,
  RefreshCw,
  ExternalLink,
  Sprout,
} from 'lucide-react'
import { getClaims } from '../services/claimService'
import { Card, CardHeader, CardBody } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'

function ClaimsPage() {
  const navigate = useNavigate()

  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchClaims = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getClaims()
      setClaims(response.data?.data || [])
    } catch (err) {
      console.error('Failed to load claims:', err)
      setError(
        err.response?.data?.message ||
          'Unable to load your claims. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  // Summary counts
  const counts = useMemo(() => {
    return {
      all: claims.length,
      pending: claims.filter((c) => c.status === 'Pending').length,
      approved: claims.filter((c) => c.status === 'Approved').length,
      rejected: claims.filter((c) => c.status === 'Rejected').length,
    }
  }, [claims])

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesStatus =
        statusFilter === 'ALL' || claim.status === statusFilter

      const matchesSearch =
        claim.policy?.policyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.damageType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.description?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [claims, statusFilter, searchQuery])

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
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700/60 rounded-full text-xs font-medium text-emerald-100 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Claim Status Tracker
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              My Insurance Claims
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl">
              Track live evaluation stages, inspector notes, and settlement
              decisions for all crop damage claims submitted under your account.
            </p>
          </div>

          <div className="shrink-0">
            <Link to="/submit-claim">
              <Button
                size="md"
                className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-950/20"
              >
                <FilePlus className="w-4 h-4 mr-1.5" />
                Submit New Claim
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Filters & Status Tabs */}
      <div className="space-y-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            All Claims ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              statusFilter === 'Pending'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('Approved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              statusFilter === 'Approved'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Approved ({counts.approved})
          </button>
          <button
            onClick={() => setStatusFilter('Rejected')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              statusFilter === 'Rejected'
                ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Rejected ({counts.rejected})
          </button>
        </div>

        {/* Search & Refresh */}
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by policy, crop, damage cause, location..."
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>

              <Button
                variant="secondary"
                size="md"
                onClick={fetchClaims}
                disabled={loading}
                className="shrink-0 w-full sm:w-auto"
                title="Refresh Claims"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Claims List & Detailed Cards */}
      <div className="space-y-6">
        {/* Error State */}
        {error && (
          <Card>
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={fetchClaims}
                  className="shrink-0"
                >
                  Retry
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="py-16">
            <Loading message="Loading your insurance claim records..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredClaims.length === 0 && (
          <Card>
            <CardBody className="p-8">
              <EmptyState
                icon={ShieldCheck}
                title={
                  searchQuery || statusFilter !== 'ALL'
                    ? 'No matching claims found'
                    : 'No insurance claims submitted yet'
                }
                description={
                  searchQuery || statusFilter !== 'ALL'
                    ? 'Try adjusting your search terms or selecting a different status filter.'
                    : 'When you encounter crop damage, you can file a compensation claim against your active policies.'
                }
                actionLabel={
                  searchQuery || statusFilter !== 'ALL'
                    ? 'Reset Filters'
                    : 'Submit a Claim'
                }
                onAction={
                  searchQuery || statusFilter !== 'ALL'
                    ? () => {
                        setSearchQuery('')
                        setStatusFilter('ALL')
                      }
                    : () => navigate('/submit-claim')
                }
              />
            </CardBody>
          </Card>
        )}

        {/* Claims Cards with Visual Status Timeline */}
        {!loading && !error && filteredClaims.length > 0 && (
          <div className="space-y-6">
            {filteredClaims.map((claim) => {
              const isPending = claim.status === 'Pending'
              const isApproved = claim.status === 'Approved'
              const isRejected = claim.status === 'Rejected'

              return (
                <Card
                  key={claim._id}
                  className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow"
                >
                  <CardHeader className="bg-gray-50/70 py-4 px-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Sprout className="w-3.5 h-3.5" />
                            {claim.crop}
                          </span>
                          <span className="text-xs font-medium text-gray-400">
                            Claim ID: #{claim._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          {claim.policy?.policyName || 'Crop Insurance Policy'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(claim.status)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardBody className="p-6 space-y-6">
                    {/* Visual Status Progress Timeline */}
                    <div className="p-4 rounded-xl bg-gray-50/90 border border-gray-200/80">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Claim Processing Status
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                        {/* Step 1: Submission */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              1. Claim Submitted
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDate(claim.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Step 2: Assessment */}
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                              isPending
                                ? 'bg-amber-100 text-amber-700 ring-4 ring-amber-50 animate-pulse'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isPending ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              2. Verification &amp; Review
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {isPending
                                ? 'Under active assessment'
                                : 'Assessment completed'}
                            </p>
                          </div>
                        </div>

                        {/* Step 3: Final Decision */}
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                              isApproved
                                ? 'bg-emerald-600 text-white'
                                : isRejected
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {isApproved ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isRejected ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              3. Final Decision
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {isApproved
                                ? 'Approved for payout'
                                : isRejected
                                ? 'Claim declined'
                                : 'Pending resolution'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Claim Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50/60 border border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400 block mb-0.5 font-medium">
                          Damage Type:
                        </span>
                        <span className="font-semibold text-gray-800">
                          {claim.damageType}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-0.5 font-medium">
                          Incident Date:
                        </span>
                        <span className="font-semibold text-gray-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(claim.incidentDate)}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-0.5 font-medium">
                          Field Location:
                        </span>
                        <span className="font-semibold text-gray-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {claim.location}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-0.5 font-medium">
                          Submitted On:
                        </span>
                        <span className="font-semibold text-gray-800">
                          {formatDateTime(claim.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Incident Description */}
                    {claim.description && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Farmer&apos;s Description:
                        </h4>
                        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-700 leading-relaxed">
                          &quot;{claim.description}&quot;
                        </div>
                      </div>
                    )}

                    {/* Document Evidence Link */}
                    {claim.documentUrl && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 font-medium">
                          Evidence Attachment:
                        </span>
                        <a
                          href={claim.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold underline"
                        >
                          View Document Link
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Review Notes & Status Feedback Notice */}
                    {isPending && (
                      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed space-y-0.5">
                          <p className="font-bold text-amber-900">
                            Awaiting Agricultural Review
                          </p>
                          <p className="text-amber-700">
                            This claim is in the queue for evaluation. Our claims
                            officers cross-reference weather records and field
                            damage assessments before approving compensation.
                          </p>
                        </div>
                      </div>
                    )}

                    {isApproved && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed space-y-1">
                          <p className="font-bold text-emerald-900">
                            Claim Approved
                          </p>
                          {claim.reviewNotes ? (
                            <p className="text-emerald-800">
                              <strong>Reviewer Notes:</strong> {claim.reviewNotes}
                            </p>
                          ) : (
                            <p className="text-emerald-700">
                              Your claim has been verified and approved according to policy terms.
                            </p>
                          )}
                          {claim.reviewedAt && (
                            <p className="text-emerald-600 text-[11px]">
                              Approved on {formatDateTime(claim.reviewedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {isRejected && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed space-y-1">
                          <p className="font-bold text-red-900">
                            Claim Rejected
                          </p>
                          {claim.reviewNotes ? (
                            <p className="text-red-800">
                              <strong>Rejection Reason / Notes:</strong>{' '}
                              {claim.reviewNotes}
                            </p>
                          ) : (
                            <p className="text-red-700">
                              This claim did not meet the necessary coverage criteria.
                            </p>
                          )}
                          {claim.reviewedAt && (
                            <p className="text-red-600 text-[11px]">
                              Reviewed on {formatDateTime(claim.reviewedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClaimsPage
