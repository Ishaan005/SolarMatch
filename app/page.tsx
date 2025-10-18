import Header from "../components/Header"
import Hero from "../components/Hero"
import FeatureCard from "../components/FeatureCard"
import FloatingHelp from "../components/FloatingHelp"

const MapPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3b82f6"/>
  </svg>
)

const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="#f59e0b"/>
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M6.34 6.34l-1.42-1.42M19.08 19.08l-1.42-1.42M6.34 17.66l-1.42 1.42M19.08 4.92l-1.42 1.42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const TrendingDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 18l-9.5-9.5-5 5L1 6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 18h6v-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Home(){
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/40">
      <Header />
      <main>
        <Hero />

        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center text-gray-900">
            <FeatureCard title="Satellite Analysis" color="bg-blue-100" icon={<MapPinIcon />}>
              AI-powered rooftop identification using satellite imagery
            </FeatureCard>
            <FeatureCard title="Cost & Savings" color="bg-amber-100" icon={<SunIcon />}>
              Instant estimates on installation costs and payback period
            </FeatureCard>
            <FeatureCard title="CO₂ Reduction" color="bg-green-100" icon={<TrendingDownIcon />}>
              See your environmental impact and carbon savings
            </FeatureCard>
            <FeatureCard title="Solar Co-ops" color="bg-violet-100" icon={<UsersIcon />}>
              Join neighbours to share costs and go solar together
            </FeatureCard>
          </div>
        </section>
      </main>
      <FloatingHelp />
    </div>
  )
}
