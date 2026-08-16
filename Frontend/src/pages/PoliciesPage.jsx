import { FileText } from 'lucide-react'

function PoliciesPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
          <p className="text-sm text-gray-500">View and manage insurance policies</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
        Policies page content will be implemented here.
      </div>
    </div>
  )
}

export default PoliciesPage
