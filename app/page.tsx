import Header from "../components/Header"
import Hero from "../components/Hero"
import FeatureCard from "../components/FeatureCard"
import ChatWidget from "../components/ChatWidget"

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3b82f6"/>
  </svg>
)

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="#f59e0b"/>
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M6.34 6.34l-1.42-1.42M19.08 19.08l-1.42-1.42M6.34 17.66l-1.42 1.42M19.08 4.92l-1.42 1.42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const TrendingDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 18l-9.5-9.5-5 5L1 6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 18h6v-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Home(){
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/20 to-orange-50/30">
      <Header />
      <main>
        <Hero />

        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-100/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                How SolarMatch Works
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm">
                Four powerful features to help you make the switch to solar energy
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center mb-10">
              <FeatureCard title="Satellite Analysis" color="bg-gradient-to-br from-blue-50 to-blue-100/50" icon={<MapPinIcon />}>
                AI-powered rooftop identification using satellite imagery
              </FeatureCard>
              <FeatureCard title="Cost & Savings" color="bg-gradient-to-br from-amber-50 to-orange-100/50" icon={<SunIcon />}>
                Instant estimates on installation costs and payback period
              </FeatureCard>
              <FeatureCard title="CO₂ Reduction" color="bg-gradient-to-br from-emerald-50 to-green-100/50" icon={<TrendingDownIcon />}>
                See your environmental impact and carbon savings
              </FeatureCard>
              <FeatureCard title="Solar Co-ops" color="bg-gradient-to-br from-purple-50 to-purple-100/50" icon={<UsersIcon />}>
                Join neighbours to share costs and go solar together
              </FeatureCard>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">100%</div>
                  <div className="text-xs text-gray-600 font-medium">Free Analysis</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">&lt;1min</div>
                  <div className="text-xs text-gray-600 font-medium">Instant Results</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">€1000s</div>
                  <div className="text-xs text-gray-600 font-medium">Potential Savings</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ChatWidget />
    </div>
  )
}
