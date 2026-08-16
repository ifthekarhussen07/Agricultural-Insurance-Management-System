import { ShieldCheck } from 'lucide-react'

function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-50 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">System administration overview</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
        Admin dashboard content will be implemented here.
      </div>
    </div>
  )
}

export default AdminDashboard
