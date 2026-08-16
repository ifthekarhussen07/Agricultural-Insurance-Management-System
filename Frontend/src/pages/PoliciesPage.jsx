import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  Shield,
  Sprout,
  DollarSign,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Info,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FilePlus,
  Layers,
} from 'lucide-react'
import { getPolicies } from '../services/policyService'
import { useAuth } from '../hooks/useAuth'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Input from '../components/Input'
import Select from '../components/Select'
import Modal from '../components/Modal'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'

function PoliciesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCrop, setSelectedCrop] = useState('')
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const fetchPoliciesData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getPolicies()
      setPolicies(response.data?.data || [])
    } catch (err) {
      console.error('Failed to load policies:', err)
      setError(
        err.response?.data?.message ||
          'Unable to load insurance policies. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPoliciesData()
  }, [fetchPoliciesData])

  // Extract unique crops for filter dropdown
  const cropOptions = useMemo(() => {
    const crops = new Set(policies.map((p) => p.coveredCrop).filter(Boolean))
    return [
      { value: '', label: 'All Crops' },
      ...Array.from(crops).map((crop) => ({ value: crop, label: crop })),
    ]
  }, [policies])

  // Filtered policies based on search and crop filter
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const matchesSearch =
        policy.policyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.coveredCrop?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCrop =
        !selectedCrop ||
        policy.coveredCrop?.toLowerCase() === selectedCrop.toLowerCase()

      return matchesSearch && matchesCrop
    })
  }, [policies, searchQuery, selectedCrop])

  const handleOpenDetails = (policy) => {
    setSelectedPolicy(policy)
    setDetailsModalOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsModalOpen(false)
    setSelectedPolicy(null)
  }

  const formatCurrency = (amount) => {
    if (amount == null) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700/60 rounded-full text-xs font-medium text-emerald-100 backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              Coverage Plans
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Agricultural Insurance Policies
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl">
              Explore standardized crop protection policies designed to safeguard
              your farm against natural disasters, drought, flooding, and unforeseen crop loss.
            </p>
          </div>

          {/* Quick CTA */}
          {user?.role === 'Farmer' && (
            <div className="shrink-0">
              <Link to="/submit-claim">
                <Button
                  size="md"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-950/20"
                >
                  <FilePlus className="w-4 h-4 mr-1.5" />
                  File a Claim
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <Card>
        <CardBody className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="w-full sm:max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search policies by name, crop, or details..."
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Crop Filter & Refresh */}
            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="w-full sm:w-48">
                <Select
                  options={cropOptions}
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                />
              </div>

              <Button
                variant="secondary"
                size="md"
                onClick={fetchPoliciesData}
                disabled={loading}
                className="shrink-0"
                title="Refresh Policies"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 3. Main Content: Policies Grid / States */}
      <div>
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
                  onClick={fetchPoliciesData}
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
            <Loading message="Loading available insurance policies..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPolicies.length === 0 && (
          <Card>
            <CardBody className="p-8">
              <EmptyState
                icon={Shield}
                title={
                  searchQuery || selectedCrop
                    ? 'No matching policies found'
                    : 'No active policies available'
                }
                description={
                  searchQuery || selectedCrop
                    ? 'Try adjusting your search criteria or clearing filters to see all available coverage options.'
                    : 'There are currently no active crop insurance policies in the system. Please check back later.'
                }
                actionLabel={
                  searchQuery || selectedCrop ? 'Clear Filters' : undefined
                }
                onAction={
                  searchQuery || selectedCrop
                    ? () => {
                        setSearchQuery('')
                        setSelectedCrop('')
                      }
                    : undefined
                }
              />
            </CardBody>
          </Card>
        )}

        {/* Policies Grid */}
        {!loading && !error && filteredPolicies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((policy) => (
              <Card
                key={policy._id}
                className="flex flex-col hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-emerald-200 group"
              >
                <CardHeader className="pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Sprout className="w-3.5 h-3.5" />
                        {policy.coveredCrop}
                      </span>
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors pt-1">
                        {policy.policyName}
                      </CardTitle>
                    </div>

                    {policy.isActive ? (
                      <Badge color="green">Active</Badge>
                    ) : (
                      <Badge color="gray">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardBody className="py-4 flex-1 space-y-4">
                  {/* Financial Overview Card */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Coverage Amount
                      </p>
                      <p className="text-lg font-bold text-emerald-700 mt-0.5">
                        {formatCurrency(policy.coverageAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Annual Premium
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">
                        {formatCurrency(policy.premiumAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Duration & Crop Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Duration: <strong>{policy.duration}</strong></span>
                    </div>
                  </div>

                  {/* Description preview */}
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {policy.description || 'Comprehensive insurance protection covering unexpected crop loss and natural damage.'}
                  </p>
                </CardBody>

                <CardFooter className="pt-3 pb-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex items-center justify-between gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenDetails(policy)}
                    className="text-gray-700"
                  >
                    <Info className="w-4 h-4" />
                    Details
                  </Button>

                  {user?.role === 'Farmer' && (
                    <Link to="/submit-claim">
                      <Button size="sm" variant="primary">
                        Submit Claim
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. Policy Details Modal */}
      <Modal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        title="Insurance Policy Specifications"
        size="lg"
      >
        {selectedPolicy && (
          <div className="space-y-6">
            {/* Title & Badge */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                  <Sprout className="w-3.5 h-3.5" />
                  Covered Crop: {selectedPolicy.coveredCrop}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedPolicy.policyName}
                </h3>
              </div>
              {selectedPolicy.isActive ? (
                <Badge color="green" size="md">
                  Active Coverage
                </Badge>
              ) : (
                <Badge color="gray" size="md">
                  Inactive
                </Badge>
              )}
            </div>

            {/* Financial & Duration Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Coverage Limit
                </p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {formatCurrency(selectedPolicy.coverageAmount)}
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Max compensation per event
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium Cost
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(selectedPolicy.premiumAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Payable per policy period
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validity Period
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedPolicy.duration}
                </p>
                <p className="text-xs text-gray-500 mt-1">Coverage timeline</p>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Policy Terms & Description
              </h4>
              <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedPolicy.description ||
                  'This policy provides financial indemnification against recognized perils including extreme temperature, drought, flood, pest outbreaks, and violent storms affecting registered crop acreage.'}
              </div>
            </div>

            {/* Key Coverage Highlights */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">
                Standard Inclusions
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Drought & heatwave loss coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Excess rainfall & flash flood compensation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hailstorm & gale wind damage relief</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Rapid claims verification process</span>
                </li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={handleCloseDetails}>
                Close
              </Button>
              {user?.role === 'Farmer' && (
                <Link to="/submit-claim">
                  <Button variant="primary">
                    <FilePlus className="w-4 h-4 mr-1.5" />
                    File Claim Under This Policy
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PoliciesPage
