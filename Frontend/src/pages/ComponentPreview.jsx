import { useState } from 'react'
import {
  FileText,
  ShieldCheck,
  CloudSun,
  TrendingUp,
  Users,
  AlertTriangle,
} from 'lucide-react'
import Button from '../components/Button'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'

const statCards = [
  { label: 'Active Policies', value: '1,284', icon: FileText, change: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Open Claims', value: '56', icon: ShieldCheck, change: '-3%', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Weather Alerts', value: '8', icon: CloudSun, change: '+2', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Total Farmers', value: '3,742', icon: Users, change: '+89', color: 'text-violet-600', bg: 'bg-violet-50' },
]

function ComponentPreview() {
  const [modalOpen, setModalOpen] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Agricultural Insurance Management Overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {s.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">{s.change}</span>{' '}
                from last month
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Status Badges</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-2">
          <Badge color="green">Active</Badge>
          <Badge color="yellow">Pending</Badge>
          <Badge color="red">Rejected</Badge>
          <Badge color="blue">In Review</Badge>
          <Badge color="gray">Draft</Badge>
          <Badge color="green" size="md">Approved</Badge>
          <Badge color="red" size="md">Expired</Badge>
        </CardBody>
      </Card>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Saving…</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </CardBody>
      </Card>

      {/* Form elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Controls</CardTitle>
        </CardHeader>
        <CardBody className="grid sm:grid-cols-2 gap-4">
          <Input
            id="farm-name"
            label="Farm Name"
            placeholder="Enter farm name"
          />
          <Input
            id="crop-area"
            label="Crop Area (acres)"
            type="number"
            placeholder="0"
          />
          <Select
            id="crop-type"
            label="Crop Type"
            placeholder="Select crop"
            options={[
              { value: 'wheat', label: 'Wheat' },
              { value: 'rice', label: 'Rice' },
              { value: 'corn', label: 'Corn' },
              { value: 'cotton', label: 'Cotton' },
            ]}
          />
          <Select
            id="season"
            label="Season"
            placeholder="Select season"
            options={[
              { value: 'kharif', label: 'Kharif' },
              { value: 'rabi', label: 'Rabi' },
              { value: 'zaid', label: 'Zaid' },
            ]}
          />
          <Input
            id="error-demo"
            label="Insured Amount"
            placeholder="Amount"
            error="This field is required"
          />
          <Input
            id="disabled-demo"
            label="Policy ID"
            value="AGR-2026-0042"
            disabled
          />
        </CardBody>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button>Save Policy</Button>
        </CardFooter>
      </Card>

      {/* Modal trigger */}
      <Card>
        <CardHeader>
          <CardTitle>Modal &amp; States</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-3">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button
            variant="secondary"
            onClick={() => setShowLoading((v) => !v)}
          >
            {showLoading ? 'Hide' : 'Show'} Loading
          </Button>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Action"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to approve this claim? This action cannot be
          undone.
        </p>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            This will release payment to the farmer's registered account.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setModalOpen(false)}>Confirm</Button>
        </div>
      </Modal>

      {/* Loading state */}
      {showLoading && (
        <Card>
          <Loading message="Fetching policies..." />
        </Card>
      )}

      {/* Empty state */}
      <Card>
        <EmptyState
          icon={ShieldCheck}
          title="No claims yet"
          description="Claims will appear here once farmers submit them through the portal."
          actionLabel="View Policies"
          onAction={() => {}}
        />
      </Card>
    </div>
  )
}

export default ComponentPreview
