import React from 'react';
import { ExternalLink, Calendar } from 'lucide-react';

const ArticleCard = ({ item }) => {
    const date = new Date(item.published_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const time = new Date(item.published_at).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <article
            className="glass-card rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative"
            onClick={() => window.open(item.link, '_blank')}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="p-5 relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between text-xs mb-4 font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                        <time>{date}</time>
                    </div>
                    <span>{time}</span>
                </div>

                <h2 className="text-lg font-bold mb-3 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {item.title}
                    </a>
                </h2>

                <div
                    className="text-sm line-clamp-3 mb-6 leading-relaxed flex-1"
                    style={{ color: 'var(--text-secondary)' }}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                />

                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                            {item.title.substring(0, 1)}
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Read Article</span>
                    </div>

                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors px-3 py-1.5 rounded-full"
                        style={{ color: 'var(--accent)', background: 'rgba(59, 130, 246, 0.15)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Open <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </article>
    );
};

export default ArticleCard;
