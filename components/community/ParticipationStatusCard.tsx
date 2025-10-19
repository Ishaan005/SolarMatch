interface ParticipationStatusCardProps {
  totalParticipants: number
  interestedCount: number
  committedCount: number
  installedCount: number
}

export default function ParticipationStatusCard({
  totalParticipants,
  interestedCount,
  committedCount,
  installedCount
}: ParticipationStatusCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          👥
        </span>
        Participation Status
      </h2>
      <div className="space-y-3">
        {/* Total */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Total Participants</div>
              <div className="text-sm text-gray-600">All registered homeowners</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalParticipants}
          </div>
        </div>

        {/* Interested */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-blue-900">Interested</div>
              <div className="text-sm text-blue-600">Exploring options</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {interestedCount}
          </div>
        </div>

        {/* Committed */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-green-900">Committed</div>
              <div className="text-sm text-green-600">Ready to proceed</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {committedCount}
          </div>
        </div>

        {/* Installed */}
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-purple-900">Installed</div>
              <div className="text-sm text-purple-600">Systems operational</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {installedCount}
          </div>
        </div>
      </div>
    </div>
  )
}
