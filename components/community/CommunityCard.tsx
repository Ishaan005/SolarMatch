interface CommunityCardProps {
  id: string
  name: string
  description: string
  location: {
    address: string
    county: string
  }
  status: string
  participant_count: number
  committed_count: number
  distance_km: number | null
  bulk_discount_pct: number
  capacity_kwp: number
  annual_savings_eur: number
  cost_per_home_eur: number
  accepting_participants: boolean
  onClick: () => void
}

export default function CommunityCard({
  name,
  description,
  location,
  status,
  participant_count,
  committed_count,
  distance_km,
  bulk_discount_pct,
  capacity_kwp,
  annual_savings_eur,
  cost_per_home_eur,
  accepting_participants,
  onClick
}: CommunityCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-6">
        {/* Left side - Icon and Info */}
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{participant_count} participants ({committed_count} committed)</span>
              </div>
              {distance_km !== null && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{distance_km} km away</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{capacity_kwp.toFixed(0)} kWp capacity</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xs text-green-600 font-medium">Bulk Discount</div>
                <div className="text-lg font-bold text-green-700">{bulk_discount_pct}%</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-xs text-blue-600 font-medium">Cost/Home</div>
                <div className="text-lg font-bold text-blue-700">€{cost_per_home_eur.toLocaleString()}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-xs text-purple-600 font-medium">Annual Savings</div>
                <div className="text-lg font-bold text-purple-700">€{annual_savings_eur.toLocaleString()}</div>
              </div>
            </div>

            {/* Location */}
            <div className="text-sm text-gray-600">
              📍 {location.address}
            </div>
          </div>
        </div>

        {/* Right side - Status and Button */}
        <div className="flex flex-col items-end gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'active' ? 'bg-green-100 text-green-700' :
            status === 'coordinating' ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {status === 'planning' ? 'Planning' :
             status === 'coordinating' ? 'Coordinating' :
             status === 'installing' ? 'Installing' :
             status === 'active' ? 'Active' : status}
          </span>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            accepting_participants
              ? "bg-green-100 text-green-700" 
              : "bg-gray-200 text-gray-700"
          }`}>
            {accepting_participants ? "Accepting Participants" : "Full"}
          </span>
        </div>
      </div>
    </div>
  )
}
