import { Menu, Bell, UserCircle } from 'lucide-react'

function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200">
      {/* Left — hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Spacer on desktop */}
      <div className="hidden lg:block" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="User menu"
        >
          <UserCircle className="w-7 h-7 text-gray-400" />
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            Account
          </span>
        </button>
      </div>
    </header>
  )
}

export default Header
