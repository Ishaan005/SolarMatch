interface SolarPotentialCardProps {
  annualEnergyKwh: number
  capacityKwp: number
  annualSavingsEur: number
  co2ReductionTonnes: number
}

export default function SolarPotentialCard({
  annualEnergyKwh,
  capacityKwp,
  annualSavingsEur,
  co2ReductionTonnes
}: SolarPotentialCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
          ☀️
        </span>
        Aggregate Solar Potential
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="text-sm text-yellow-700 font-medium mb-1">
            Annual Energy Production
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {annualEnergyKwh.toLocaleString()} kWh
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-sm text-blue-700 font-medium mb-1">
            Total System Capacity
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {capacityKwp.toFixed(1)} kWp
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="text-sm text-green-700 font-medium mb-1">
            Annual Cost Savings
          </div>
          <div className="text-2xl font-bold text-green-900">
            €{annualSavingsEur.toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="text-sm text-purple-700 font-medium mb-1">
            CO₂ Reduction
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {co2ReductionTonnes.toFixed(1)} tonnes/year
          </div>
        </div>
      </div>
    </div>
  )
}
