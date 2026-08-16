import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FilePlus,
  Shield,
  Sprout,
  AlertTriangle,
  Calendar,
  MapPin,
  FileText,
  Link2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Info,
} from 'lucide-react'
import { getPolicies } from '../services/policyService'
import { createClaim } from '../services/claimService'
import { useAuth } from '../hooks/useAuth'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Loading from '../components/Loading'

const damageTypes = [
  { value: '', label: 'Select damage type' },
  { value: 'Drought', label: 'Drought / Extreme Heat' },
  { value: 'Flood', label: 'Flooding / Excessive Rain' },
  { value: 'Hailstorm', label: 'Hailstorm' },
  { value: 'Pest Infestation', label: 'Pest Infestation' },
  { value: 'Disease Outbreak', label: 'Crop Disease Outbreak' },
  { value: 'Frost / Cold Freeze', label: 'Frost / Severe Freezing' },
  { value: 'Windstorm / Cyclone', label: 'Windstorm / Severe Gales' },
  { value: 'Wildfire', label: 'Wildfire' },
  { value: 'Other', label: 'Other Natural Disaster' },
]

function SubmitClaimPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Policies data
  const [policies, setPolicies] = useState([])
  const [loadingPolicies, setLoadingPolicies] = useState(true)
  const [policyLoadError, setPolicyLoadError] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    policy: '',
    crop: '',
    damageType: '',
    incidentDate: '',
    location: '',
    description: '',
    documentUrl: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch active policies for dropdown
  const loadPolicies = useCallback(async () => {
    setLoadingPolicies(true)
    setPolicyLoadError('')
    try {
      const response = await getPolicies()
      // Filter active policies for farmer
      const activeList = (response.data?.data || []).filter((p) => p.isActive)
      setPolicies(activeList)
    } catch (err) {
      console.error('Error fetching policies for claim form:', err)
      setPolicyLoadError('Unable to load available policies. Please refresh.')
    } finally {
      setLoadingPolicies(false)
    }
  }, [])

  useEffect(() => {
    loadPolicies()
  }, [loadPolicies])

  // Handle policy selection and auto-fill crop
  const handlePolicyChange = (e) => {
    const selectedPolicyId = e.target.value
    const selectedPolicyObj = policies.find((p) => p._id === selectedPolicyId)

    setFormData((prev) => ({
      ...prev,
      policy: selectedPolicyId,
      crop: selectedPolicyObj?.coveredCrop || prev.crop,
    }))

    if (errors.policy) {
      setErrors((prev) => ({ ...prev, policy: '', crop: '' }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (apiError) setApiError('')
  }

  // Today's date in YYYY-MM-DD for max date restriction
  const today = new Date().toISOString().split('T')[0]

  const validateForm = () => {
    const errs = {}

    if (!formData.policy) {
      errs.policy = 'Please select an insurance policy'
    }
    if (!formData.crop.trim()) {
      errs.crop = 'Covered crop name is required'
    }
    if (!formData.damageType) {
      errs.damageType = 'Please select the cause of damage'
    }
    if (!formData.incidentDate) {
      errs.incidentDate = 'Date of incident is required'
    } else if (formData.incidentDate > today) {
      errs.incidentDate = 'Incident date cannot be in the future'
    }
    if (!formData.location.trim()) {
      errs.location = 'Field location / farm address is required'
    }

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    setApiError('')
    setSuccessMessage('')

    try {
      const payload = {
        policy: formData.policy,
        crop: formData.crop.trim(),
        damageType: formData.damageType,
        incidentDate: formData.incidentDate,
        location: formData.location.trim(),
        description: formData.description.trim(),
        documentUrl: formData.documentUrl.trim(),
      }

      await createClaim(payload)

      setSuccessMessage(
        'Your insurance claim has been submitted successfully! Redirecting to dashboard...'
      )

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/farmer-dashboard')
      }, 2000)
    } catch (err) {
      console.error('Failed to submit claim:', err)
      const msg =
        err.response?.data?.message ||
        'Failed to submit claim. Please verify your details and try again.'
      setApiError(msg)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  // Find currently selected policy details
  const currentPolicy = policies.find((p) => p._id === formData.policy)

  const policyOptions = [
    { value: '', label: 'Select an active insurance policy' },
    ...policies.map((p) => ({
      value: p._id,
      label: `${p.policyName} (${p.coveredCrop} — Max Coverage: $${p.coverageAmount?.toLocaleString()})`,
    })),
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/farmer-dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700/60 rounded-full text-xs font-medium text-emerald-100 backdrop-blur-sm">
            <FilePlus className="w-3.5 h-3.5 text-emerald-300" />
            Claim Filing Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Submit Insurance Claim
          </h1>
          <p className="text-emerald-100/90 text-sm max-w-2xl">
            Provide accurate details regarding your crop loss or incident.
            Our agricultural assessment team will evaluate your claim for rapid processing.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Submission Confirmed</h4>
            <p className="text-sm mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* API Error Notification */}
      {apiError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Submission Error</h4>
            <p className="text-sm mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {/* Loading Policies State */}
      {loadingPolicies ? (
        <Card>
          <CardBody className="py-16">
            <Loading message="Loading your eligible insurance policies..." />
          </CardBody>
        </Card>
      ) : policies.length === 0 ? (
        <Card>
          <CardBody className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No Active Policies Found
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              You must have an active crop policy registered before submitting a claim.
            </p>
            <Link to="/policies">
              <Button variant="primary">Browse Available Policies</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        /* Main Claim Submission Form */
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Claim &amp; Incident Information
              </CardTitle>
            </CardHeader>

            <CardBody className="space-y-5">
              {/* Policy Selection */}
              <div>
                <Select
                  id="policy-select"
                  name="policy"
                  label="Select Registered Policy *"
                  options={policyOptions}
                  value={formData.policy}
                  onChange={handlePolicyChange}
                  error={errors.policy}
                />
                {currentPolicy && (
                  <div className="mt-2.5 p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 flex flex-wrap items-center justify-between text-xs text-emerald-900 gap-2">
                    <span>
                      Covered Crop: <strong>{currentPolicy.coveredCrop}</strong>
                    </span>
                    <span>
                      Max Coverage:{' '}
                      <strong>
                        ${currentPolicy.coverageAmount?.toLocaleString()}
                      </strong>
                    </span>
                    <span>
                      Duration: <strong>{currentPolicy.duration}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Crop & Damage Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="crop-name"
                  name="crop"
                  label="Affected Crop *"
                  placeholder="e.g. Wheat, Rice, Corn"
                  value={formData.crop}
                  onChange={handleChange}
                  error={errors.crop}
                />

                <Select
                  id="damage-type"
                  name="damageType"
                  label="Primary Cause of Damage *"
                  options={damageTypes}
                  value={formData.damageType}
                  onChange={handleChange}
                  error={errors.damageType}
                />
              </div>

              {/* Incident Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="incident-date"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Incident Date *
                  </label>
                  <div className="relative">
                    <input
                      id="incident-date"
                      name="incidentDate"
                      type="date"
                      max={today}
                      value={formData.incidentDate}
                      onChange={handleChange}
                      className={`block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                        errors.incidentDate
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    />
                  </div>
                  {errors.incidentDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.incidentDate}
                    </p>
                  )}
                </div>

                <Input
                  id="field-location"
                  name="location"
                  label="Field Location / Address *"
                  placeholder="e.g. North Plot, Sector 4, Green Valley"
                  value={formData.location}
                  onChange={handleChange}
                  error={errors.location}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="incident-description"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Incident Description &amp; Estimated Loss
                </label>
                <textarea
                  id="incident-description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details of how the damage occurred, estimated acreage affected, and observable crop condition..."
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Optional but recommended for faster claim assessment.
                </p>
              </div>

              {/* Document / Evidence URL */}
              <div>
                <Input
                  id="document-url"
                  name="documentUrl"
                  label="Evidence Document / Image URL"
                  placeholder="https://example.com/field-damage-photo.jpg"
                  value={formData.documentUrl}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Provide a web link to photo evidence, surveyor assessment, or drone imagery.
                </p>
              </div>

              {/* Informational Notice */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 leading-relaxed">
                  <p className="font-semibold text-gray-800">
                    Farmer Verification
                  </p>
                  <p>
                    This claim is registered under your authenticated account:{' '}
                    <strong>{user?.name}</strong> ({user?.email}). All submitted
                    data is subject to agricultural insurance review.
                  </p>
                </div>
              </div>
            </CardBody>

            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 rounded-b-xl">
              <Link to="/farmer-dashboard" className="w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="w-full sm:w-auto shadow-md shadow-emerald-900/10"
              >
                Submit Claim for Review
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}

export default SubmitClaimPage
