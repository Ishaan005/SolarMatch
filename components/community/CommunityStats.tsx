interface CommunityStatsProps {
  participantCount: number
  capacityKwp: number
  bulkDiscountPct: number
  co2ReductionTonnes: number
}

export default function CommunityStats({
  participantCount,
  capacityKwp,
  bulkDiscountPct,
  co2ReductionTonnes
}: CommunityStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Participants */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold text-purple-900 mb-1">
          {participantCount}
        </div>
        <div className="text-sm text-purple-700 font-medium">
          Participants
        </div>
      </div>

      {/* Capacity */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold text-blue-900 mb-1">
          {capacityKwp.toFixed(0)} kWp
        </div>
        <div className="text-sm text-blue-700 font-medium">
          Total Capacity
        </div>
      </div>

      {/* Bulk Discount */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold text-green-900 mb-1">
          {bulkDiscountPct}%
        </div>
        <div className="text-sm text-green-700 font-medium">
          Bulk Discount
        </div>
      </div>

      {/* CO2 Reduction */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold text-amber-900 mb-1">
          {co2ReductionTonnes.toFixed(1)}
        </div>
        <div className="text-sm text-amber-700 font-medium">
          CO₂ Reduction (tonnes/year)
        </div>
      </div>
    </div>
  )
}
