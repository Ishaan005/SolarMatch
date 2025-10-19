interface CostSavingsCardProps {
  bulkDiscountPct: number
  costPerHomeEur: number
  originalCostPerHomeEur: number
  annualSavingsPerHomeEur: number
  paybackYears: number
}

export default function CostSavingsCard({
  bulkDiscountPct,
  costPerHomeEur,
  originalCostPerHomeEur,
  annualSavingsPerHomeEur,
  paybackYears
}: CostSavingsCardProps) {
  const savingsAmount = originalCostPerHomeEur - costPerHomeEur

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          💰
        </span>
        Cost Savings Through Bulk Coordination
      </h2>
      <div className="space-y-4">
        {/* Bulk Discount Highlight */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">
              Current Bulk Discount
            </span>
            <span className="text-3xl font-bold text-green-900">
              {bulkDiscountPct}%
            </span>
          </div>
          <p className="text-sm text-green-600">
            You save €{savingsAmount.toLocaleString()} compared to individual installation
          </p>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 font-medium mb-1">
              Original Cost
            </div>
            <div className="text-xl font-bold text-gray-900 line-through">
              €{originalCostPerHomeEur.toLocaleString()}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-sm text-blue-700 font-medium mb-1">
              Your Cost
            </div>
            <div className="text-xl font-bold text-blue-900">
              €{costPerHomeEur.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Annual Savings & Payback */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="text-sm text-purple-700 font-medium mb-1">
              Annual Savings
            </div>
            <div className="text-xl font-bold text-purple-900">
              €{annualSavingsPerHomeEur.toLocaleString()}
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="text-sm text-amber-700 font-medium mb-1">
              Payback Period
            </div>
            <div className="text-xl font-bold text-amber-900">
              {paybackYears.toFixed(1)} years
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> The more participants who join, the better the bulk discount becomes! 
            At 50 homes, the discount reaches 40%.
          </p>
        </div>
      </div>
    </div>
  )
}
