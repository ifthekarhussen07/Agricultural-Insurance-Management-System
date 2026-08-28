import { useState, useEffect, useCallback } from 'react'
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Search,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  MapPin,
} from 'lucide-react'
import { getWeather } from '../services/weatherService'
import { Card, CardHeader, CardTitle, CardBody } from './Card'
import Button from './Button'
import Badge from './Badge'
import Loading from './Loading'

const quickCities = ['Chicago', 'Dallas', 'Fresno', 'London', 'Dhaka']

function WeatherWidget({ defaultCity = 'Chicago', className = '' }) {
  const [cityInput, setCityInput] = useState('')
  const [currentCity, setCurrentCity] = useState(defaultCity)
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWeather = useCallback(async (searchCity) => {
    if (!searchCity || !searchCity.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await getWeather(searchCity.trim())
      setWeatherData(response.data?.data || null)
      setCurrentCity(response.data?.data?.city || searchCity)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(
        err.response?.data?.message ||
          `Unable to retrieve weather data for "${searchCity}".`
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather(defaultCity)
  }, [defaultCity, fetchWeather])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (cityInput.trim()) {
      fetchWeather(cityInput.trim())
      setCityInput('')
    }
  }

  // Choose icon based on weather condition
  const getWeatherIcon = (condition = '') => {
    const lower = condition.toLowerCase()
    if (lower.includes('thunderstorm') || lower.includes('lightning')) {
      return <CloudLightning className="w-9 h-9 text-amber-400" />
    }
    if (lower.includes('rain')) {
      return <CloudRain className="w-9 h-9 text-blue-300" />
    }
    if (lower.includes('drizzle')) {
      return <CloudDrizzle className="w-9 h-9 text-cyan-300" />
    }
    if (lower.includes('snow') || lower.includes('freeze')) {
      return <CloudSnow className="w-9 h-9 text-blue-200" />
    }
    if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) {
      return <CloudFog className="w-9 h-9 text-gray-300" />
    }
    if (lower.includes('cloud')) {
      return <Cloud className="w-9 h-9 text-slate-200" />
    }
    return <Sun className="w-9 h-9 text-amber-300" />
  }

  // Calculate Agricultural Risk Level
  const calculateAgriRisk = (data) => {
    if (!data) return { level: 'Low Risk', color: 'green', badgeColor: 'green', message: 'Optimal field conditions observed.' }

    const { temperature, windSpeed, condition } = data
    const condLower = condition?.toLowerCase() || ''

    if (
      condLower.includes('thunderstorm') ||
      condLower.includes('hail') ||
      temperature <= 0 ||
      temperature >= 38 ||
      windSpeed >= 15
    ) {
      return {
        level: 'High Risk',
        color: 'red',
        badgeColor: 'red',
        message: 'Severe conditions: High likelihood of crop stress or storm damage.',
      }
    }

    if (
      condLower.includes('rain') ||
      temperature >= 32 ||
      temperature <= 4 ||
      windSpeed >= 9
    ) {
      return {
        level: 'Moderate Risk',
        color: 'yellow',
        badgeColor: 'yellow',
        message: 'Caution advised: Monitor soil saturation, moisture, and wind exposure.',
      }
    }

    return {
      level: 'Low Risk',
      color: 'green',
      badgeColor: 'green',
      message: 'Favorable conditions: Standard crop growth parameters observed.',
    }
  }

  const risk = calculateAgriRisk(weatherData)

  return (
    <Card className={`overflow-hidden border-gray-200 shadow-sm ${className}`}>
      {/* Header with Centered/Aligned Badge */}
      <CardHeader className="bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white py-3.5 px-5 border-b border-emerald-100/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm sm:text-base font-bold text-gray-900 truncate">
                Live Agricultural Weather
              </CardTitle>
              <p className="text-[11px] text-gray-500 truncate">
                Regional hazard monitoring
              </p>
            </div>
          </div>

          {weatherData && !loading && (
            <div className="shrink-0">
              <Badge
                color={risk.badgeColor}
                size="sm"
                className="px-3 py-1 text-xs font-bold tracking-wide shadow-2xs"
              >
                {risk.level}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Search city (e.g. Dallas, London)..."
              className="block w-full rounded-lg border border-gray-300 pl-9 pr-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <Button type="submit" size="sm" variant="primary" disabled={loading} className="px-3 text-xs">
            Search
          </Button>
        </form>

        {/* Quick City Suggestions */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] text-gray-400 font-medium mr-0.5">Quick:</span>
          {quickCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => fetchWeather(city)}
              disabled={loading}
              className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                currentCity?.toLowerCase() === city.toLowerCase()
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-8">
            <Loading message={`Fetching weather for ${currentCity}...`} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <h5 className="font-bold">Weather Unavailable</h5>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fetchWeather(currentCity || defaultCity)}
                className="text-xs py-1 px-2.5"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Weather Content Display */}
        {!loading && !error && weatherData && (
          <div className="space-y-3.5">
            {/* Primary Weather Hero Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-emerald-100 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{weatherData.city}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {Math.round(weatherData.temperature)}°C
                </div>
                <p className="text-xs font-medium capitalize text-emerald-100/90 pt-0.5">
                  {weatherData.description}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/10 backdrop-blur-sm shrink-0 min-w-[72px]">
                {getWeatherIcon(weatherData.condition)}
                <span className="text-[11px] font-bold mt-1 text-white text-center leading-tight">
                  {weatherData.condition}
                </span>
              </div>
            </div>

            {/* Redesigned 3 Metric Cards: Centered, Clean, No Text Breaking */}
            <div className="grid grid-cols-3 gap-2">
              {/* Humidity */}
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-gray-50/90 border border-gray-100 text-center hover:bg-gray-100/70 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shrink-0">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-none mb-1">
                  Humidity
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {weatherData.humidity}%
                </p>
              </div>

              {/* Wind Speed */}
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-gray-50/90 border border-gray-100 text-center hover:bg-gray-100/70 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5 shrink-0">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-none mb-1">
                  Wind
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {weatherData.windSpeed} <span className="text-[10px] font-normal text-gray-400">m/s</span>
                </p>
              </div>

              {/* Thermal Index */}
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-gray-50/90 border border-gray-100 text-center hover:bg-gray-100/70 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 shrink-0">
                  <Thermometer className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-none mb-1">
                  Thermal
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {weatherData.temperature > 30
                    ? 'Hot'
                    : weatherData.temperature < 10
                    ? 'Cold'
                    : 'Mild'}
                </p>
              </div>
            </div>

            {/* Agricultural Risk Advisory Banner */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 text-xs leading-relaxed ${
                risk.color === 'red'
                  ? 'bg-red-50/90 border-red-200 text-red-800'
                  : risk.color === 'yellow'
                  ? 'bg-amber-50/90 border-amber-200 text-amber-800'
                  : 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
              }`}
            >
              {risk.color === 'red' ? (
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : risk.color === 'yellow' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">
                  Advisory: {risk.level}
                </span>
                <p className="text-[11px] mt-0.5 text-gray-700">{risk.message}</p>
              </div>
            </div>

            {/* Severe Weather Alerts (when returned from backend) */}
            {weatherData.alerts && weatherData.alerts.length > 0 && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Severe Weather Alert</span>
                </div>
                {weatherData.alerts.map((alert, idx) => (
                  <p key={idx} className="text-red-800 text-[11px]">
                    {alert.event || alert.description || JSON.stringify(alert)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default WeatherWidget
