import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { EmptyState } from './components/EmptyState'
import { InspirationBoardProvider } from './components/InspirationBoardProvider'
import { LoadingState } from './components/LoadingState'
import { InspirationBoardPage } from './pages/InspirationBoardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ReferencePage } from './pages/ReferencePage'
import { SearchPage } from './pages/SearchPage'
import { loadReferences } from './services/loadReferences'
import type { Reference, SearchQuery } from './types/reference'

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
      <InspirationBoardProvider>
        <AppHeader />
        <main className="mx-auto min-h-[calc(100vh-81px)] max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {loading ? <LoadingState /> : loadError ? (
            <EmptyState title="Не удалось загрузить библиотеку" text="Обновите страницу. Если проблема сохранится, попробуйте открыть сайт позднее." action={false} />
          ) : (
            <Routes>
              <Route path="/" element={<SearchPage references={references} query={query} setQuery={setQuery} />} />
              <Route path="/reference/:id" element={<ReferencePage references={references} query={query} />} />
              <Route path="/board" element={<InspirationBoardPage references={references} />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          )}
        </main>
      </InspirationBoardProvider>
    </HashRouter>
  )
}
