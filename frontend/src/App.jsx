import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ArticleCard from './components/ArticleCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  const [feeds, setFeeds] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeeds();
    fetchItems();

    // Auto-refresh items every 30 seconds
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, []);

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
      const res = await fetch(`${API_URL}/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch items", err);
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

  const filteredItems = selectedFeedId
    ? items.filter(i => i.feed_id === selectedFeedId)
    : items;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        feeds={feeds}
        onAddFeed={handleAddFeed}
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
                {filteredItems.length} unread updates
              </p>
            </div>
          </header>

          {filteredItems.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12">
              {filteredItems.map(item => (
                <ArticleCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
