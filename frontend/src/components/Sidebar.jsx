import React, { useState } from 'react';
import { Plus, Rss, Layers, Hash, Trash2 } from 'lucide-react';

const Sidebar = ({ feeds, onAddFeed, onSelectFeed, onDeleteFeed, selectedFeedId }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [url, setUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!url.trim()) return;
        onAddFeed(url);
        setUrl('');
        setIsAdding(false);
    };

    const handleDelete = (e, feedId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this feed? All associated articles will also be removed.')) {
            onDeleteFeed(feedId);
        }
    };

    return (
        <div className="w-72 glass flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300">
            <div className="p-6 flex items-center justify-between">
                <h1 className="text-xl font-bold flex items-center gap-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Rss className="w-5 h-5 text-white" />
                    </div>
                    <span>Reader</span>
                </h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 rounded-lg transition-all"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                    title="Add Feed"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAdding ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                <form onSubmit={handleSubmit} className="px-6 mb-4">
                    <div className="relative group">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste RSS link..."
                            className="w-full text-sm rounded-lg px-4 py-3 outline-none transition-all"
                            style={{
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            autoFocus
                        />
                    </div>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider px-3 mb-3 mt-2" style={{ color: 'var(--text-muted)' }}>
                    Menu
                </div>

                <button
                    onClick={() => onSelectFeed(null)}
                    className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200"
                    style={{
                        background: selectedFeedId === null ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        color: selectedFeedId === null ? 'var(--accent)' : 'var(--text-secondary)',
                        border: selectedFeedId === null ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent'
                    }}
                >
                    <Layers className="w-4 h-4" />
                    <span className="font-medium text-sm">All Articles</span>
                </button>

                <div className="text-xs font-semibold uppercase tracking-wider px-3 mt-8 mb-3" style={{ color: 'var(--text-muted)' }}>
                    Feeds
                </div>

                {feeds.map(feed => (
                    <div
                        key={feed.id}
                        className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 cursor-pointer"
                        style={{
                            background: selectedFeedId === feed.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            color: selectedFeedId === feed.id ? 'var(--accent)' : 'var(--text-secondary)',
                            border: selectedFeedId === feed.id ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent'
                        }}
                        onClick={() => onSelectFeed(feed.id)}
                    >
                        <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: selectedFeedId === feed.id ? 'var(--accent)' : 'var(--text-muted)' }}
                        />
                        <span className="font-medium text-sm truncate text-left flex-1">{feed.title || feed.url}</span>
                        {selectedFeedId === feed.id && (
                            <button
                                onClick={(e) => handleDelete(e, feed.id)}
                                className="p-1 rounded transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                title="Delete Feed"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-xs text-center font-medium" style={{ color: 'var(--text-muted)' }}>
                    v1.0.0
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
