import { FilePlus } from 'lucide-react'

function SubmitClaimPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-50 rounded-lg">
          <FilePlus className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Claim</h1>
          <p className="text-sm text-gray-500">File a new insurance claim</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
        Claim submission form will be implemented here.
      </div>
    </div>
  )
}

export default SubmitClaimPage
