interface CoordinatorCardProps {
  coordinatorName: string
  coordinatorContact: string
}

export default function CoordinatorCard({
  coordinatorName,
  coordinatorContact
}: CoordinatorCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          📧
        </span>
        Community Coordinator
      </h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-1">
              {coordinatorName}
            </div>
            <a 
              href={`mailto:${coordinatorContact}`}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 group"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="group-hover:underline">{coordinatorContact}</span>
            </a>
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <p className="text-sm text-amber-800">
            💬 The coordinator facilitates communication between participants and helps organize the bulk solar installation.
          </p>
        </div>
      </div>
    </div>
  )
}
