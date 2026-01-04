import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ArticleCard from './components/ArticleCard';
import ArticleListItem from './components/ArticleListItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  const [feeds, setFeeds] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // Reduced for single-page fit
  const [totalCount, setTotalCount] = useState(0);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedFeedId, currentPage]);

  // Reset to page 1 when changing feed
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFeedId]);

  const fetchFeeds = async () => {
    try {
      const res = await fetch(`${API_URL}/feeds`);
      if (res.ok) {
        const data = await res.json();
        setFeeds(data);
      }
    } catch (err) {
      console.error("Failed to fetch feeds", err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/items?page=${currentPage}&page_size=${pageSize}`;
      if (selectedFeedId) {
        url += `&feed_id=${selectedFeedId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalCount(data.total_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async (url) => {
    try {
      const res = await fetch(`${API_URL}/feeds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        fetchFeeds();
        // Give the worker a moment to pick it up, or wait for next poll
        setTimeout(fetchItems, 2000);
      } else {
        alert("Failed to add feed");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding feed");
    }
  };

  const handleDeleteFeed = async (feedId) => {
    try {
      const res = await fetch(`${API_URL}/feeds/${feedId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchFeeds();
        if (selectedFeedId === feedId) {
          setSelectedFeedId(null);
        }
        fetchItems();
      } else {
        alert("Failed to delete feed");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting feed");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        feeds={feeds}
        onAddFeed={handleAddFeed}
        onDeleteFeed={handleDeleteFeed}
        onSelectFeed={setSelectedFeedId}
        selectedFeedId={selectedFeedId}
      />

      <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden transition-all duration-300">
        <header className="flex items-end justify-between px-8 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg-main)' }}>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {selectedFeedId
                ? feeds.find(f => f.id === selectedFeedId)?.title || 'Feed'
                : 'Latest Articles'}
            </h2>
            <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
              {totalCount} articles {selectedFeedId ? 'in this feed' : 'total'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-hover)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-md transition-all"
                style={{
                  background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--accent)' : 'var(--text-secondary)'
                }}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 rounded-md transition-all"
                style={{
                  background: viewMode === 'list' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--accent)' : 'var(--text-secondary)'
                }}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--text-muted)' }}>
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}></div>
                <p className="mt-4 text-sm">Loading articles...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 glass-card rounded-2xl mx-auto max-w-lg text-center p-8" style={{ color: 'var(--text-muted)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--bg-hover)' }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>No articles found</h3>
                <p className="text-sm">Add a new RSS feed from the sidebar to get started.</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {items.map(item => (
                      <ArticleCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map(item => (
                      <ArticleListItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Fixed pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-4 px-8 border-t shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg-main)' }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9 h-9 rounded-lg transition-all font-medium text-sm"
                    style={{
                      background: currentPage === pageNum ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: currentPage === pageNum ? 'var(--accent)' : 'var(--text-secondary)',
                      border: currentPage === pageNum ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
