interface CommunityDetailHeaderProps {
  name: string
  description: string
  status: string
  acceptingParticipants: boolean
  onExpressInterest: () => void
  onContactCoordinator: () => void
}

export default function CommunityDetailHeader({
  name,
  description,
  status,
  acceptingParticipants,
  onExpressInterest,
  onContactCoordinator
}: CommunityDetailHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 mb-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {name}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-4 py-2 rounded-full text-sm font-medium text-center ${
            status === 'active' ? 'bg-green-100 text-green-700' :
            status === 'coordinating' ? 'bg-blue-100 text-blue-700' :
            status === 'installing' ? 'bg-purple-100 text-purple-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {status === 'planning' ? 'Planning' :
             status === 'coordinating' ? 'Coordinating' :
             status === 'installing' ? 'Installing' :
             status === 'active' ? 'Active' : status}
          </span>
          <span className={`px-4 py-2 rounded-full text-sm font-medium text-center ${
            acceptingParticipants
              ? "bg-green-100 text-green-700" 
              : "bg-gray-200 text-gray-700"
          }`}>
            {acceptingParticipants ? "Accepting Participants" : "Full"}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {acceptingParticipants && (
          <button
            onClick={onExpressInterest}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Express Interest
          </button>
        )}
        <button
          onClick={onContactCoordinator}
          className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact Coordinator
        </button>
      </div>
    </div>
  )
}
