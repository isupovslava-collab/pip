import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { EmptyState } from './components/EmptyState'
import { FeedbackProvider } from './components/FeedbackProvider'
import { InspirationBoardProvider } from './components/InspirationBoardProvider'
import { LoadingState } from './components/LoadingState'
import { TestModeBanner } from './components/TestModeBanner'
import { InspirationBoardPage } from './pages/InspirationBoardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ReferencePage } from './pages/ReferencePage'
import { SearchPage } from './pages/SearchPage'
import { TestFeedbackPage } from './pages/TestFeedbackPage'
import { TestReferenceReviewPage } from './pages/TestReferenceReviewPage'
import { CuratedCoreReviewPage } from './pages/CuratedCoreReviewPage'
import { CoverRecoveryReviewPage } from './pages/CoverRecoveryReviewPage'
import { PresentationIntelligenceReviewPage } from './pages/PresentationIntelligenceReviewPage'
import { loadReferences } from './services/loadReferences'
import type { Reference, SearchQuery } from './types/reference'
import { isTestMode } from './utils/testMode'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function TestModeChrome() {
  const { search } = useLocation()
  return isTestMode(search) ? <TestModeBanner /> : null
}

export default function App() {
  const [references, setReferences] = useState<Reference[]>([])
  const [query, setQuery] = useState<SearchQuery | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    loadReferences()
      .then(setReferences)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <HashRouter>
      <FeedbackProvider>
        <InspirationBoardProvider>
          <ScrollToTop />
          <AppHeader />
          <TestModeChrome />
          <main className="relative mx-auto min-h-[calc(100vh-73px)] max-w-7xl overflow-hidden px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            {loading ? <LoadingState /> : loadError ? (
              <EmptyState title="Не удалось загрузить библиотеку" text="Обновите страницу. Если проблема сохранится, попробуйте открыть сайт позднее." action={false} />
            ) : (
              <Routes>
                <Route path="/" element={<SearchPage references={references} query={query} setQuery={setQuery} />} />
                <Route path="/search" element={<SearchPage references={references} query={query} setQuery={setQuery} />} />
                <Route path="/reference/:id" element={<ReferencePage references={references} query={query} />} />
                <Route path="/board" element={<InspirationBoardPage references={references} />} />
                <Route path="/test-feedback" element={<TestFeedbackPage />} />
                <Route path="/test-reference-review" element={<TestReferenceReviewPage />} />
                <Route path="/test-curated-core-review" element={<CuratedCoreReviewPage references={references} />} />
                <Route path="/test-cover-recovery-review" element={<CoverRecoveryReviewPage />} />
                <Route path="/test-intelligence-review" element={<PresentationIntelligenceReviewPage references={references} />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            )}
          </main>
        </InspirationBoardProvider>
      </FeedbackProvider>
    </HashRouter>
  )
}
