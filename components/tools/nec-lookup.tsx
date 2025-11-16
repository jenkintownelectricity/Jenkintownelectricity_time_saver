'use client'

import { useState, useEffect } from 'react'
import { useAppStore, NECCode } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Bookmark, Loader2, Mic, BookOpen, Filter } from 'lucide-react'

export default function NECLookup() {
  const { bookmarkedCodes, addBookmark, removeBookmark } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<NECCode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    // Load initial sample codes
    handleSearch('')

    // Load recent searches
    const saved = localStorage.getItem('nec-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        // Invalid data
      }
    }
  }, [])

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/nec/lookup?q=' + encodeURIComponent(query))
      const data = await response.json()
      setResults(data.codes || [])

      // Save to recent searches
      if (query.trim()) {
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10)
        setRecentSearches(updated)
        localStorage.setItem('nec-recent-searches', JSON.stringify(updated))
      }
    } catch (error) {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSearchQuery(transcript)
        handleSearch(transcript)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      alert('Voice search is not supported in your browser')
    }
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

  const categories = [
    { id: 'all', label: 'All Codes' },
    { id: 'wiring', label: 'Wiring' },
    { id: 'protection', label: 'Protection' },
    { id: 'grounding', label: 'Grounding' },
    { id: 'equipment', label: 'Equipment' },
  ]

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NEC codes (e.g., 210.12, GFCI, arc-fault)..."
            className="pl-10 pr-12 h-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleVoiceSearch}
            disabled={isListening}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
          </Button>
        </div>
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Search'
          )}
        </Button>
      </form>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !showBookmarks && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Recent:</span>
          {recentSearches.slice(0, 5).map((search, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                setSearchQuery(search)
                handleSearch(search)
              }}
            >
              {search}
            </Badge>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-muted-foreground" />
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* View Toggles */}
      <div className="flex gap-2">
        <Button
          variant={!showBookmarks ? 'default' : 'outline'}
          onClick={() => setShowBookmarks(false)}
        >
          <BookOpen className="w-4 h-4 mr-2" />
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

      {/* Results */}
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

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-2">
            About NEC Code Database
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            The National Electrical Code (NEC) is the standard for safe electrical design, installation, and inspection.
            This database provides quick access to commonly used codes and regulations.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">Voice Search Enabled</Badge>
            <Badge variant="outline">Bookmark Support</Badge>
            <Badge variant="outline">Recent Searches</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
