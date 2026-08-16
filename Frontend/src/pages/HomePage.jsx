import { Sprout, Shield, CloudSun, BarChart3, ArrowRight } from 'lucide-react'

function HomePage() {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Crop Protection',
      description: 'Comprehensive insurance policies tailored for diverse agricultural needs.',
    },
    {
      icon: <CloudSun className="w-8 h-8" />,
      title: 'Weather Monitoring',
      description: 'Real-time weather data integration for accurate risk assessment.',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Claims Analytics',
      description: 'Transparent claims processing with data-driven insights.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="border-b border-emerald-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              AgriInsure
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-emerald-600 font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer">
              Sign In
            </span>
            <span className="text-sm text-white font-medium px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 transition-all cursor-pointer">
              Get Started
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            System Online
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Protecting Farmers,{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Securing Harvests
            </span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            A modern agricultural insurance management platform that combines
            weather intelligence with comprehensive crop coverage to safeguard
            farming communities.
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all cursor-pointer">
              Explore Platform
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white border border-emerald-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center text-emerald-600 mb-5 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>&copy; {new Date().getFullYear()} AgriInsure</span>
          </div>
          <p className="text-sm text-gray-400">
            Agricultural Insurance Management System
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
