import React from 'react';
import { ExternalLink, Calendar } from 'lucide-react';

const ArticleListItem = ({ item }) => {
    const date = new Date(item.published_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const time = new Date(item.published_at).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <article
            className="glass-card rounded-lg overflow-hidden hover:bg-gray-800/50 transition-all duration-200 group cursor-pointer relative"
            onClick={() => window.open(item.link, '_blank')}
        >
            <div className="p-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium min-w-[120px]">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <time>{date}</time>
                </div>

                <h2 className="flex-1 text-base font-semibold text-gray-100 group-hover:text-blue-400 transition-colors truncate">
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {item.title}
                    </a>
                </h2>

                <div className="text-xs text-gray-500">{time}</div>

                <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30"
                    onClick={(e) => e.stopPropagation()}
                >
                    Open <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </article>
    );
};

export default ArticleListItem;
