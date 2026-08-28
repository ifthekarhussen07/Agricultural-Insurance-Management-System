import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  FileText,
  Plus,
  Edit,
  PowerOff,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sprout,
  Clock,
  Shield,
  Eye,
} from 'lucide-react'
import {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from '../services/policyService'
import { Card, CardHeader, CardTitle, CardBody } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Input from '../components/Input'
import Select from '../components/Select'
import Modal from '../components/Modal'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'

const INITIAL_FORM_STATE = {
  policyName: '',
  coveredCrop: '',
  premiumAmount: '',
  coverageAmount: '',
  duration: '1 Year',
  description: '',
  isActive: true,
}

const DURATION_OPTIONS = [
  { value: '3 Months', label: '3 Months (Single Crop Cycle)' },
  { value: '6 Months', label: '6 Months (Semi-Annual)' },
  { value: '1 Season', label: '1 Season (Harvest Cycle)' },
  { value: '1 Year', label: '1 Year (Annual Policy)' },
  { value: '2 Years', label: '2 Years (Multi-Year)' },
]

function AdminPoliciesPage() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, ACTIVE, INACTIVE
  const [cropFilter, setCropFilter] = useState('')

  // Form modal state (Create / Edit)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [editingPolicyId, setEditingPolicyId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Deactivate confirmation modal state
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false)
  const [policyToDeactivate, setPolicyToDeactivate] = useState(null)
  const [deactivating, setDeactivating] = useState(false)

  // Details preview modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)

  // Fetch policies from backend (Admin sees all policies)
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
          'Failed to load insurance policies. Please check your connection and retry.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPoliciesData()
  }, [fetchPoliciesData])

  // Clear success notification after 5 seconds
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => {
      setSuccessMessage('')
    }, 5000)
    return () => clearTimeout(timer)
  }, [successMessage])

  // Unique crop list for filter
  const uniqueCrops = useMemo(() => {
    const crops = new Set(policies.map((p) => p.coveredCrop).filter(Boolean))
    return [
      { value: '', label: 'All Crops' },
      ...Array.from(crops).map((c) => ({ value: c, label: c })),
    ]
  }, [policies])

  // Summary counts
  const summary = useMemo(() => {
    const total = policies.length
    const active = policies.filter((p) => p.isActive).length
    const inactive = total - active
    return { total, active, inactive }
  }, [policies])

  // Filtered policies
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && !policy.isActive) return false
      if (statusFilter === 'INACTIVE' && policy.isActive) return false

      // Crop filter
      if (
        cropFilter &&
        policy.coveredCrop?.toLowerCase() !== cropFilter.toLowerCase()
      ) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = policy.policyName?.toLowerCase().includes(query)
        const matchesCrop = policy.coveredCrop?.toLowerCase().includes(query)
        const matchesDesc = policy.description?.toLowerCase().includes(query)
        const matchesDuration = policy.duration?.toLowerCase().includes(query)
        if (!matchesName && !matchesCrop && !matchesDesc && !matchesDuration) {
          return false
        }
      }

      return true
    })
  }, [policies, statusFilter, cropFilter, searchQuery])

  // Validate form fields
  const validateForm = () => {
    const errors = {}

    if (!formData.policyName.trim()) {
      errors.policyName = 'Policy name is required'
    } else if (formData.policyName.trim().length < 3) {
      errors.policyName = 'Policy name must be at least 3 characters'
    }

    if (!formData.coveredCrop.trim()) {
      errors.coveredCrop = 'Covered crop is required'
    }

    const premiumNum = parseFloat(formData.premiumAmount)
    if (formData.premiumAmount === '' || isNaN(premiumNum)) {
      errors.premiumAmount = 'Premium amount is required'
    } else if (premiumNum <= 0) {
      errors.premiumAmount = 'Premium amount must be greater than 0'
    }

    const coverageNum = parseFloat(formData.coverageAmount)
    if (formData.coverageAmount === '' || isNaN(coverageNum)) {
      errors.coverageAmount = 'Coverage amount is required'
    } else if (coverageNum <= 0) {
      errors.coverageAmount = 'Coverage amount must be greater than 0'
    } else if (premiumNum && coverageNum < premiumNum) {
      errors.coverageAmount =
        'Coverage amount should typically be greater than the premium'
    }

    if (!formData.duration.trim()) {
      errors.duration = 'Duration is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalMode('create')
    setEditingPolicyId(null)
    setFormData(INITIAL_FORM_STATE)
    setFormErrors({})
    setFormModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (policy) => {
    setModalMode('edit')
    setEditingPolicyId(policy._id)
    setFormData({
      policyName: policy.policyName || '',
      coveredCrop: policy.coveredCrop || '',
      premiumAmount: policy.premiumAmount?.toString() || '',
      coverageAmount: policy.coverageAmount?.toString() || '',
      duration: policy.duration || '1 Year',
      description: policy.description || '',
      isActive: policy.isActive ?? true,
    })
    setFormErrors({})
    setFormModalOpen(true)
  }

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Submit Create or Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setError('')

    const payload = {
      policyName: formData.policyName.trim(),
      coveredCrop: formData.coveredCrop.trim(),
      premiumAmount: parseFloat(formData.premiumAmount),
      coverageAmount: parseFloat(formData.coverageAmount),
      duration: formData.duration.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
    }

    try {
      if (modalMode === 'create') {
        const response = await createPolicy(payload)
        setSuccessMessage(
          response.data?.message || 'New insurance policy created successfully.'
        )
      } else {
        const response = await updatePolicy(editingPolicyId, payload)
        setSuccessMessage(
          response.data?.message || 'Policy updated successfully.'
        )
      }
      setFormModalOpen(false)
      fetchPoliciesData()
    } catch (err) {
      console.error('Save policy error:', err)
      const errorMsg =
        err.response?.data?.message ||
        'Failed to save policy. Please check input values and retry.'
      setFormErrors((prev) => ({ ...prev, general: errorMsg }))
    } finally {
      setSubmitting(false)
    }
  }

  // Open Deactivation Confirmation Modal
  const handleOpenDeactivateModal = (policy) => {
    setPolicyToDeactivate(policy)
    setDeactivateModalOpen(true)
  }

  // Confirm Deactivation (calls DELETE /api/policies/:id which sets isActive = false)
  const handleConfirmDeactivate = async () => {
    if (!policyToDeactivate) return

    setDeactivating(true)
    try {
      const response = await deletePolicy(policyToDeactivate._id)
      setSuccessMessage(
        response.data?.message ||
          `Policy "${policyToDeactivate.policyName}" deactivated successfully.`
      )
      setDeactivateModalOpen(false)
      setPolicyToDeactivate(null)
      fetchPoliciesData()
    } catch (err) {
      console.error('Deactivate policy error:', err)
      setError(
        err.response?.data?.message ||
          'Failed to deactivate policy. Please try again.'
      )
      setDeactivateModalOpen(false)
    } finally {
      setDeactivating(false)
    }
  }

  // Open Policy Details Modal
  const handleOpenDetails = (policy) => {
    setSelectedPolicy(policy)
    setDetailsModalOpen(true)
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Policy Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Agricultural Insurance Policies
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Create, update, and manage policy terms, crop coverage limits, and active status for farmers across the platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={fetchPoliciesData}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm"
              title="Refresh policies"
            >
              <RefreshCw
                className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreateModal}
              className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-950/30"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create New Policy
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
                  <p className="text-sm font-semibold">Operation Error</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
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

      {/* 2. Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-gray-200">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Policies
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                {loading ? '...' : summary.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">All policies in catalogue</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <FileText className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Active Policies
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                {loading ? '...' : summary.active}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Available for farmers &amp; claims
              </p>
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
                Inactive / Deactivated
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-600 mt-1">
                {loading ? '...' : summary.inactive}
              </p>
              <p className="text-xs text-gray-500 mt-1">Hidden from farmer portal</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
              <PowerOff className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Filters & Search Control Bar */}
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
                placeholder="Search policies by name, crop, duration, or terms..."
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Crop Select & Status Tabs */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-44">
                <Select
                  options={uniqueCrops}
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
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
                  All ({summary.total})
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Active ({summary.active})
                </button>
                <button
                  onClick={() => setStatusFilter('INACTIVE')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'INACTIVE'
                      ? 'bg-gray-700 text-white font-bold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Inactive ({summary.inactive})
                </button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Main Policies Table & Card List */}
      <div>
        {/* Loading State */}
        {loading && (
          <div className="py-16">
            <Loading message="Loading insurance policies catalogue..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPolicies.length === 0 && (
          <Card>
            <CardBody className="p-8">
              <EmptyState
                icon={FileText}
                title={
                  searchQuery || statusFilter !== 'ALL' || cropFilter
                    ? 'No matching policies found'
                    : 'No policies created yet'
                }
                description={
                  searchQuery || statusFilter !== 'ALL' || cropFilter
                    ? 'Try clearing your search or status filters to view all policies.'
                    : 'Click "Create New Policy" to add your first crop insurance plan.'
                }
                actionLabel={
                  searchQuery || statusFilter !== 'ALL' || cropFilter
                    ? 'Reset Filters'
                    : 'Create Policy'
                }
                onAction={
                  searchQuery || statusFilter !== 'ALL' || cropFilter
                    ? () => {
                        setSearchQuery('')
                        setStatusFilter('ALL')
                        setCropFilter('')
                      }
                    : handleOpenCreateModal
                }
              />
            </CardBody>
          </Card>
        )}

        {/* Policies List: Desktop Table + Mobile Cards */}
        {!loading && filteredPolicies.length > 0 && (
          <Card className="border-gray-200 overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <CardTitle>Insurance Policies Catalogue</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing {filteredPolicies.length} of {summary.total} policies
                </p>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/90 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5">Policy &amp; Crop</th>
                      <th className="px-6 py-3.5">Premium</th>
                      <th className="px-6 py-3.5">Coverage Limit</th>
                      <th className="px-6 py-3.5">Duration</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPolicies.map((policy) => (
                      <tr
                        key={policy._id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          !policy.isActive ? 'bg-gray-50/40 opacity-80' : ''
                        }`}
                      >
                        {/* Policy Name & Covered Crop */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                              <Sprout className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {policy.policyName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  Crop: {policy.coveredCrop}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Premium */}
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatCurrency(policy.premiumAmount)}
                        </td>

                        {/* Coverage Amount */}
                        <td className="px-6 py-4 font-bold text-emerald-700">
                          {formatCurrency(policy.coverageAmount)}
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{policy.duration}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {policy.isActive ? (
                            <Badge color="green" size="md">
                              Active
                            </Badge>
                          ) : (
                            <Badge color="gray" size="md">
                              Inactive
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenDetails(policy)}
                              className="text-gray-600 hover:text-gray-900 p-1.5"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Edit Policy */}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenEditModal(policy)}
                              className="text-xs px-2.5 py-1"
                              title="Edit Policy"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>

                            {/* Deactivate (Soft-delete) */}
                            {policy.isActive ? (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleOpenDeactivateModal(policy)}
                                className="text-xs px-2.5 py-1"
                                title="Deactivate Policy"
                              >
                                <PowerOff className="w-3.5 h-3.5 mr-1" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled
                                className="text-xs px-2 py-1 text-gray-400 cursor-not-allowed"
                                title="Policy is already inactive"
                              >
                                Inactive
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredPolicies.map((policy) => (
                  <div
                    key={policy._id}
                    className={`p-4 space-y-3 ${
                      !policy.isActive ? 'bg-gray-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {policy.policyName}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
                          <Sprout className="w-3 h-3" />
                          {policy.coveredCrop}
                        </span>
                      </div>
                      {policy.isActive ? (
                        <Badge color="green">Active</Badge>
                      ) : (
                        <Badge color="gray">Inactive</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-gray-400 block">Premium:</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(policy.premiumAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Coverage:</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(policy.coverageAmount)}
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-gray-200/60 flex items-center justify-between text-gray-500">
                        <span>Duration: {policy.duration}</span>
                        <span>Created: {formatDate(policy.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDetails(policy)}
                        className="text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEditModal(policy)}
                        className="text-xs"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      {policy.isActive && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenDeactivateModal(policy)}
                          className="text-xs"
                        >
                          <PowerOff className="w-3.5 h-3.5 mr-1" />
                          Deactivate
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

      {/* 5. Create / Edit Policy Modal */}
      <Modal
        open={formModalOpen}
        onClose={() => !submitting && setFormModalOpen(false)}
        title={
          modalMode === 'create'
            ? 'Create New Agricultural Policy'
            : 'Edit Policy Specifications'
        }
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formErrors.general && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formErrors.general}</span>
            </div>
          )}

          {/* Policy Name */}
          <div>
            <Input
              id="policyName"
              name="policyName"
              label="Policy Name *"
              placeholder="e.g. Comprehensive Corn Crop Protection"
              value={formData.policyName}
              onChange={handleInputChange}
              error={formErrors.policyName}
              disabled={submitting}
            />
          </div>

          {/* Covered Crop & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                id="coveredCrop"
                name="coveredCrop"
                label="Covered Crop *"
                placeholder="e.g. Wheat, Corn, Rice, Soybeans"
                value={formData.coveredCrop}
                onChange={handleInputChange}
                error={formErrors.coveredCrop}
                disabled={submitting}
              />
            </div>
            <div>
              <Select
                id="duration"
                name="duration"
                label="Coverage Duration *"
                options={DURATION_OPTIONS}
                value={formData.duration}
                onChange={handleInputChange}
                error={formErrors.duration}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Financials: Premium & Coverage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                id="premiumAmount"
                name="premiumAmount"
                type="number"
                min="1"
                step="any"
                label="Annual Premium Amount ($) *"
                placeholder="e.g. 500"
                value={formData.premiumAmount}
                onChange={handleInputChange}
                error={formErrors.premiumAmount}
                disabled={submitting}
              />
            </div>
            <div>
              <Input
                id="coverageAmount"
                name="coverageAmount"
                type="number"
                min="1"
                step="any"
                label="Maximum Coverage Amount ($) *"
                placeholder="e.g. 15000"
                value={formData.coverageAmount}
                onChange={handleInputChange}
                error={formErrors.coverageAmount}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Policy Description &amp; Terms
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Detail covered natural perils, damage assessment terms, and payout conditions..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={submitting}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Active Status Toggle (For Edit Mode or Create) */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={submitting}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Policy is Active (Visible to farmers in policy catalogue)
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting}
            >
              {modalMode === 'create' ? 'Create Policy' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Deactivation Confirmation Modal */}
      <Modal
        open={deactivateModalOpen}
        onClose={() => !deactivating && setDeactivateModalOpen(false)}
        title="Confirm Policy Deactivation"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 leading-relaxed">
              <p className="font-bold text-sm text-amber-950">
                Soft-Deactivation Notice
              </p>
              <p>
                Deactivating this policy will set its status to <strong>Inactive</strong>.
                Farmers will no longer be able to select it when filing new claims or browsing policies.
              </p>
              <p className="text-amber-800">
                Existing claims associated with this policy remain preserved in the system.
              </p>
            </div>
          </div>

          {policyToDeactivate && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
              <p className="font-bold text-gray-900 text-sm">
                {policyToDeactivate.policyName}
              </p>
              <p className="text-gray-600">
                Crop: <strong>{policyToDeactivate.coveredCrop}</strong> &bull; Coverage: <strong>{formatCurrency(policyToDeactivate.coverageAmount)}</strong>
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setDeactivateModalOpen(false)}
              disabled={deactivating}
            >
              Keep Policy Active
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeactivate}
              loading={deactivating}
              disabled={deactivating}
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. Policy Full Details Modal */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Insurance Policy Details"
        size="lg"
      >
        {selectedPolicy && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                  <Sprout className="w-3.5 h-3.5" />
                  Covered Crop: {selectedPolicy.coveredCrop}
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedPolicy.policyName}
                </h3>
              </div>
              {selectedPolicy.isActive ? (
                <Badge color="green" size="md">
                  Active
                </Badge>
              ) : (
                <Badge color="gray" size="md">
                  Inactive
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Coverage Limit
                </p>
                <p className="text-2xl font-extrabold text-emerald-900 mt-1">
                  {formatCurrency(selectedPolicy.coverageAmount)}
                </p>
                <p className="text-xs text-emerald-700 mt-1">Maximum indemnity</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Premium Cost
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {formatCurrency(selectedPolicy.premiumAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Annual or period fee</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Duration
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {selectedPolicy.duration}
                </p>
                <p className="text-xs text-gray-500 mt-1">Coverage period</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Policy Description &amp; Scope
              </h4>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedPolicy.description ||
                  'Comprehensive insurance protection covering unexpected crop loss, drought, pest damage, and flood damage.'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div>
                <span>Policy ID: </span>
                <strong className="text-gray-800">{selectedPolicy._id}</strong>
              </div>
              <div className="text-right">
                <span>Created On: </span>
                <strong className="text-gray-800">
                  {formatDate(selectedPolicy.createdAt)}
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDetailsModalOpen(false)
                  handleOpenEditModal(selectedPolicy)
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit This Policy
              </Button>
              <Button
                variant="primary"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminPoliciesPage
