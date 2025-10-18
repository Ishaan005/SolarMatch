import Header from "../components/Header"
import Hero from "../components/Hero"
import FeatureCard from "../components/FeatureCard"
import FloatingHelp from "../components/FloatingHelp"

export default function Home(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      <Header />
      <main>
        <Hero />

        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-4 gap-6 justify-items-center">
            <FeatureCard title="Satellite Analysis" color="bg-blue-50">AI-powered rooftop identification using satellite imagery</FeatureCard>
            <FeatureCard title="Cost & Savings" color="bg-amber-50">Instant estimates on installation costs and payback period</FeatureCard>
            <FeatureCard title="CO₂ Reduction" color="bg-green-50">See your environmental impact and carbon savings</FeatureCard>
            <FeatureCard title="Solar Co-ops" color="bg-violet-50">Join neighbours to share costs and go solar together</FeatureCard>
          </div>
        </section>
      </main>
      <FloatingHelp />
    </div>
  )
}
