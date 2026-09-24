import { AnnouncementStrip } from './components/AnnouncementStrip'
import { ComparisonPanel } from './components/ComparisonPanel'
import { FeatureTiles } from './components/FeatureTiles'
import { Footer } from './components/Footer'
import { GlobalNav } from './components/GlobalNav'
import { HeroStage } from './components/HeroStage'
import { Highlights } from './components/Highlights'
import { PaleComparison } from './components/PaleComparison'
import { ProductNav } from './components/ProductNav'

export function App() {
  return (
    <>
      <GlobalNav />
      <AnnouncementStrip />
      <ProductNav />
      <main>
        <HeroStage />
        <Highlights />
        <FeatureTiles />
        <ComparisonPanel />
        <PaleComparison />
      </main>
      <Footer />
    </>
  )
}
