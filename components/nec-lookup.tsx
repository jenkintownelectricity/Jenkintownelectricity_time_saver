'use client'

import { useState, useEffect } from 'react'
import { useAppStore, NECCode } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Bookmark, Loader2 } from 'lucide-react'

export default function NECLookup() {
  const { setCurrentSection, bookmarkedCodes, addBookmark, removeBookmark } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<NECCode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)

  useEffect(() => {
    // Load initial sample codes
    handleSearch('')
  }, [])

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/nec/lookup?q=' + encodeURIComponent(query))
      const data = await response.json()
      setResults(data.codes || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  const isBookmarked = (code: string) => {
    return bookmarkedCodes.some((c: NECCode) => c.code === code)
  }

  const toggleBookmark = (necCode: NECCode) => {
    if (isBookmarked(necCode.code)) {
      removeBookmark(necCode.code)
    } else {
      addBookmark({ ...necCode, isBookmarked: true })
    }
  }

  const displayCodes = showBookmarks ? bookmarkedCodes : results

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSection('home')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">NEC Code Lookup</h1>
              <p className="text-xs text-muted-foreground">National Electrical Code reference</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search NEC codes (e.g., 210.12, GFCI, arc-fault)..."
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </form>

          <div className="flex gap-2">
            <Button
              variant={!showBookmarks ? 'default' : 'outline'}
              onClick={() => setShowBookmarks(false)}
            >
              All Codes
            </Button>
            <Button
              variant={showBookmarks ? 'default' : 'outline'}
              onClick={() => setShowBookmarks(true)}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmarked ({bookmarkedCodes.length})
            </Button>
          </div>

          {displayCodes.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {showBookmarks
                    ? 'No bookmarked codes yet. Bookmark codes to access them quickly.'
                    : 'No codes found. Try a different search term.'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayCodes.map((necCode: NECCode) => (
                <Card key={necCode.code} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {necCode.code}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{necCode.title}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleBookmark(necCode)}
                        className={isBookmarked(necCode.code) ? 'text-primary' : ''}
                      >
                        <Bookmark
                          className="w-5 h-5"
                          fill={isBookmarked(necCode.code) ? 'currentColor' : 'none'}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {necCode.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">
                About NEC Code Database
              </h3>
              <p className="text-sm text-muted-foreground">
                Currently showing sample NEC codes. We can integrate your existing Python file 
                with all NEC codes to provide comprehensive code lookup functionality. 
                The database will be continuously updated as part of AppIo.AI's construction 
                knowledge base.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
