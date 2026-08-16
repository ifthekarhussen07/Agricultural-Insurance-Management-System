import { Loader2 } from 'lucide-react'

function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

export default Loading
