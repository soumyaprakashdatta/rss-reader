import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

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
    <div className="flex min-h-screen">
      <Sidebar
        feeds={feeds}
        onAddFeed={handleAddFeed}
        onDeleteFeed={handleDeleteFeed}
        onSelectFeed={setSelectedFeedId}
        selectedFeedId={selectedFeedId}
      />

      <main className="flex-1 ml-72 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 flex items-end justify-between border-b border-gray-800/50 pb-6 sticky top-0 bg-[#0f1115]/80 backdrop-blur-md z-40 pt-4 -mt-4">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {selectedFeedId
                  ? feeds.find(f => f.id === selectedFeedId)?.title || 'Feed'
                  : 'Latest Articles'}
              </h2>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                {totalCount} articles {selectedFeedId ? 'in this feed' : 'total'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm">Loading articles...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 glass-card rounded-2xl mx-auto max-w-lg text-center p-8">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No articles found</h3>
              <p className="text-sm">Add a new RSS feed from the sidebar to get started.</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6">
                  {items.map(item => (
                    <ArticleCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-6">
                  {items.map(item => (
                    <ArticleListItem key={item.id} item={item} />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8 border-t border-gray-800/50">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentPage === 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Show page numbers */}
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
                          className={`w-10 h-10 rounded-lg transition-all font-medium ${currentPage === pageNum
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentPage === totalPages
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
