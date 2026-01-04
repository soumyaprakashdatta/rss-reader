import React from 'react';
import { ExternalLink, Calendar } from 'lucide-react';

const ArticleListItem = ({ item }) => {
    const date = new Date(item.published_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const time = new Date(item.published_at).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit'
    });

    // Extract text content from HTML and truncate
    const getContentGist = (content) => {
        if (!content) return '';
        // Remove HTML tags and get plain text
        const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        // Truncate to ~120 characters
        return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
    };

    const gist = getContentGist(item.content || item.description);

    return (
        <article
            className="glass-card rounded-lg overflow-hidden transition-all duration-200 group cursor-pointer relative"
            style={{ '--hover-bg': 'var(--bg-hover)' }}
            onClick={() => window.open(item.link, '_blank')}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = ''}
        >
            <div className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-medium min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                        <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                        <time>{date}</time>
                    </div>

                    <h2 className="flex-1 text-base font-semibold group-hover:text-blue-400 transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {item.title}
                        </a>
                    </h2>

                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{time}</div>

                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors px-3 py-1.5 rounded-full shrink-0"
                        style={{ color: 'var(--accent)', background: 'rgba(59, 130, 246, 0.15)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Open <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                {gist && (
                    <p className="mt-2 text-sm leading-relaxed ml-[136px]" style={{ color: 'var(--text-secondary)' }}>
                        {gist}
                    </p>
                )}
            </div>
        </article>
    );
};

export default ArticleListItem;
