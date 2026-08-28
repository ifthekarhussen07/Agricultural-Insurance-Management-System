import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Calendar,
  User,
  Activity,
  BarChart3,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { getStats } from '../services/adminService'
import { getClaims } from '../services/claimService'
import { useAuth } from '../hooks/useAuth'
import { Card, CardHeader, CardTitle, CardBody } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'

function AdminDashboard() {
  const { user } = useAuth()

  // Dynamic statistics state
  const [stats, setStats] = useState({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    totalPolicies: 0,
    activePolicies: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  // Recent claims state
  const [recentClaims, setRecentClaims] = useState([])
  const [claimsLoading, setClaimsLoading] = useState(true)
  const [claimsError, setClaimsError] = useState('')

  // Fetch admin statistics from GET /api/admin/stats
  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError('')
    try {
      const response = await getStats()
      if (response.data?.success && response.data?.data) {
        setStats(response.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
      setStatsError(
        err.response?.data?.message ||
          'Failed to load administrative statistics. Please try again.'
      )
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch recent claims
  const fetchRecentClaims = useCallback(async () => {
    setClaimsLoading(true)
    setClaimsError('')
    try {
      const response = await getClaims()
      const claimsData = response.data?.data || []
      setRecentClaims(claimsData.slice(0, 5))
    } catch (err) {
      console.error('Failed to fetch recent claims:', err)
      setClaimsError(
        err.response?.data?.message ||
          'Failed to load recent claims. Please try again.'
      )
    } finally {
      setClaimsLoading(false)
    }
  }, [])

  // Refresh all dashboard data
  const handleRefreshAll = () => {
    fetchDashboardStats()
    fetchRecentClaims()
  }

  useEffect(() => {
    fetchDashboardStats()
    fetchRecentClaims()
  }, [fetchDashboardStats, fetchRecentClaims])

  // Calculated operational rates
  const resolvedClaimsCount = stats.approvedClaims + stats.rejectedClaims
  const resolutionRate = useMemo(() => {
    if (!stats.totalClaims || stats.totalClaims === 0) return 0
    return Math.round((resolvedClaimsCount / stats.totalClaims) * 100)
  }, [resolvedClaimsCount, stats.totalClaims])

  const activePolicyRate = useMemo(() => {
    if (!stats.totalPolicies || stats.totalPolicies === 0) return 0
    return Math.round((stats.activePolicies / stats.totalPolicies) * 100)
  }, [stats.activePolicies, stats.totalPolicies])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge color="green">Approved</Badge>
      case 'Pending':
        return <Badge color="yellow">Pending Review</Badge>
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
      {/* 1. Header Banner & Quick Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrative Operations Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome, {user?.name || 'Administrator'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Real-time platform metrics, claim verification pipeline, and agricultural insurance policy controls.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleRefreshAll}
              disabled={statsLoading || claimsLoading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm"
              title="Refresh all metrics"
            >
              <RefreshCw
                className={`w-4 h-4 mr-1.5 ${
                  statsLoading || claimsLoading ? 'animate-spin' : ''
                }`}
              />
              Sync Metrics
            </Button>
            <Link to="/claims">
              <Button
                variant="primary"
                size="md"
                className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-950/30"
              >
                <Clock className="w-4 h-4 mr-1.5" />
                Claims Queue ({stats.pendingClaims})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Error Alert if stats endpoint failed */}
      {statsError && (
        <Card className="border-red-200 bg-red-50/70">
          <CardBody className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-red-700">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold">Error Loading Admin Stats</p>
                  <p className="text-xs text-red-600 mt-0.5">{statsError}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={fetchDashboardStats}
                className="shrink-0"
              >
                Retry Request
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 2. Primary Metric Cards (6 core metrics from GET /api/admin/stats) */}
      <section aria-labelledby="metrics-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h2 id="metrics-heading" className="text-lg font-bold text-gray-900">
              System Overview &amp; Key Metrics
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Live Database Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Total Claims */}
          <Card className="hover:shadow-md transition-shadow border-gray-200">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Claims
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {statsLoading ? (
                      <span className="text-gray-300 animate-pulse">--</span>
                    ) : (
                      stats.totalClaims
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>All filed claims to date</span>
                <span className="font-semibold text-gray-700">100% platform</span>
              </div>
            </CardBody>
          </Card>

          {/* 2. Pending Reviews */}
          <Card className="hover:shadow-md transition-shadow border-amber-200/70 bg-gradient-to-br from-white to-amber-50/30">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      Pending Reviews
                    </p>
                    {stats.pendingClaims > 0 && (
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                    )}
                  </div>
                  <p className="text-3xl font-extrabold text-amber-600 mt-1">
                    {statsLoading ? (
                      <span className="text-gray-300 animate-pulse">--</span>
                    ) : (
                      stats.pendingClaims
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-700 font-medium">
                <span>Awaiting evaluation</span>
                <Link
                  to="/claims"
                  className="inline-flex items-center hover:underline font-semibold"
                >
                  Review now &rarr;
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* 3. Approved Claims */}
          <Card className="hover:shadow-md transition-shadow border-emerald-200/70 bg-gradient-to-br from-white to-emerald-50/20">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    Approved Claims
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                    {statsLoading ? (
                      <span className="text-gray-300 animate-pulse">--</span>
                    ) : (
                      stats.approvedClaims
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
                <span>Verified settlements</span>
                <span>
                  {stats.totalClaims > 0
                    ? `${Math.round((stats.approvedClaims / stats.totalClaims) * 100)}% of total`
                    : '0%'}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* 4. Rejected Claims */}
          <Card className="hover:shadow-md transition-shadow border-gray-200">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rejected Claims
                  </p>
                  <p className="text-3xl font-extrabold text-red-600 mt-1">
                    {statsLoading ? (
                      <span className="text-gray-300 animate-pulse">--</span>
                    ) : (
                      stats.rejectedClaims
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                  <XCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-red-600 font-medium">
                <span>Declined claims</span>
                <span>
                  {stats.totalClaims > 0
                    ? `${Math.round((stats.rejectedClaims / stats.totalClaims) * 100)}% of total`
                    : '0%'}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* 5. Total Policies */}
          <Card className="hover:shadow-md transition-shadow border-gray-200">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Policies
                  </p>
                  <p className="text-3xl font-extrabold text-indigo-600 mt-1">
                    {statsLoading ? (
                      <span className="text-gray-300 animate-pulse">--</span>
                    ) : (
                      stats.totalPolicies
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Catalogue offerings</span>
                <Link
                  to="/admin/policies"
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  View catalog &rarr;
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* 6. Active Policies */}
          <Card className="hover:shadow-md transition-shadow border-gray-200">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Active Policies
                  </p>
                  <p className="text-3xl font-extrabold text-teal-600 mt-1">
                    {statsLoading ? (
                      <span className="text-gray-300 animate-pulse">--</span>
                    ) : (
                      stats.activePolicies
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-teal-700 font-medium">
                <span>{activePolicyRate}% active coverage</span>
                <Badge color="green" size="sm">
                  Available
                </Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* 3. Operational Highlights & Admin Navigation Cards */}
      <section aria-labelledby="quick-actions-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 id="quick-actions-heading" className="text-lg font-bold text-gray-900">
            Quick Actions &amp; Management Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Policy Management Card */}
          <Card className="hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-emerald-300 flex flex-col justify-between group">
            <CardBody className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Policy Management
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Browse catalogued insurance policies, inspect crop coverage terms, and review active premium structures.
                </p>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span>Available Policies:</span>
                  <span className="font-bold text-gray-900">
                    {stats.activePolicies} Active / {stats.totalPolicies} Total
                  </span>
                </div>
              </div>
            </CardBody>
            <div className="p-4 pt-0">
              <Link to="/admin/policies" className="block">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors"
                >
                  <span>Explore Policies</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Claims Queue Card */}
          <Card className="hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-amber-300 flex flex-col justify-between group">
            <CardBody className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Claims Verification
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Evaluate pending damage submissions from farmers, review incident records, and issue compensation decisions.
                </p>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                  <span className="text-amber-800">Pending Review:</span>
                  <span className="font-bold text-amber-700">
                    {stats.pendingClaims} claims
                  </span>
                </div>
              </div>
            </CardBody>
            <div className="p-4 pt-0">
              <Link to="/claims" className="block">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-200 transition-colors"
                >
                  <span>Review Claims Queue</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* System Performance & Resolution Analytics Card */}
          <Card className="hover:shadow-lg transition-all duration-200 border-gray-200 flex flex-col justify-between">
            <CardBody className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Resolution Analytics
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Overall pipeline efficiency and status distribution of claims submitted across the platform.
                </p>
              </div>

              {/* Progress bar */}
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-600">Claim Resolution Rate:</span>
                  <span className="text-emerald-700">{resolutionRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${resolutionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>{resolvedClaimsCount} resolved</span>
                  <span>{stats.pendingClaims} in queue</span>
                </div>
              </div>
            </CardBody>

            <div className="p-4 pt-0">
              <Link to="/claims" className="block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-gray-600 hover:text-gray-900"
                >
                  <span>All Claims Log</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. Recent Claims Section (Admin View) */}
      <section aria-labelledby="recent-claims-heading">
        <Card className="border-gray-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-emerald-600" />
              <div>
                <CardTitle id="recent-claims-heading">Recent Insurance Claims</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Latest claim submissions across all registered farmers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/claims">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 hover:text-emerald-800"
                >
                  View All Claims
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRecentClaims}
                disabled={claimsLoading}
                className="text-gray-500 hover:text-gray-900"
                title="Refresh recent claims"
              >
                <RefreshCw
                  className={`w-4 h-4 ${claimsLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </CardHeader>

          <CardBody className="p-0">
            {/* Claims Error State */}
            {claimsError && (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                    <p className="text-sm font-medium">{claimsError}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={fetchRecentClaims}
                    className="shrink-0"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Claims Loading State */}
            {claimsLoading && !claimsError && (
              <div className="py-12">
                <Loading message="Loading recent claims..." />
              </div>
            )}

            {/* Empty State */}
            {!claimsLoading && !claimsError && recentClaims.length === 0 && (
              <div className="p-6">
                <EmptyState
                  icon={ShieldCheck}
                  title="No claims submitted yet"
                  description="Claims filed by farmers across registered insurance policies will appear here for review."
                />
              </div>
            )}

            {/* Claims Table (Desktop) & Card List (Mobile) */}
            {!claimsLoading && !claimsError && recentClaims.length > 0 && (
              <div>
                {/* Desktop Data Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Farmer &amp; Contact</th>
                        <th className="px-6 py-3.5">Policy &amp; Crop</th>
                        <th className="px-6 py-3.5">Damage Cause</th>
                        <th className="px-6 py-3.5">Incident Date</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentClaims.map((claim) => (
                        <tr
                          key={claim._id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          {/* Farmer */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">
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
                            <div className="text-xs text-emerald-700 font-medium">
                              Crop: {claim.crop}
                            </div>
                          </td>

                          {/* Damage */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              {claim.damageType}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-gray-700">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {formatDate(claim.incidentDate)}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {getStatusBadge(claim.status)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <Link to="/claims">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-emerald-700 hover:text-emerald-800"
                              >
                                Review
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {recentClaims.map((claim) => (
                    <div key={claim._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {claim.farmer?.name || 'Farmer'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {claim.policy?.policyName || 'Crop Policy'} &bull;{' '}
                            <span className="text-emerald-700 font-medium">
                              {claim.crop}
                            </span>
                          </p>
                        </div>
                        {getStatusBadge(claim.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <div>
                          <span className="text-gray-400 block">Damage:</span>
                          <span className="font-medium text-gray-800">
                            {claim.damageType}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Incident:</span>
                          <span className="text-gray-700">
                            {formatDate(claim.incidentDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link to="/claims">
                          <Button size="sm" variant="ghost" className="text-xs text-emerald-700">
                            Inspect Claim &rarr;
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  )
}

export default AdminDashboard
