import { Link } from 'react-router-dom';
import { ArrowUp, MessageCircle, TrendingUp } from 'lucide-react';
import { timeAgo, statusColor, categoryColor } from '../utils/helpers';

const FeatureCard = ({ feature, onVote, voting }) => {
  return (
    <div className="card-hover group animate-fade-in">
      <div className="flex gap-4">
        {/* Vote button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onVote(feature._id);
          }}
          disabled={voting}
          className={`flex flex-col items-center justify-center min-w-[60px] px-2 py-3 rounded-lg border-2 transition-all ${
            feature.hasVoted
              ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30'
              : 'bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-500'
          } disabled:opacity-50`}
        >
          <ArrowUp className="w-5 h-5" />
          <span className="text-lg font-bold">{feature.votes}</span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              to={`/features/${feature._id}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1"
            >
              {feature.title}
            </Link>
            <span className={statusColor(feature.status)}>{feature.status}</span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {feature.description}
          </p>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className={categoryColor(feature.category)}>{feature.category}</span>
            <span className="text-gray-500 dark:text-gray-400">
              by {feature.createdBy?.username || 'unknown'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 dark:text-gray-400">{timeAgo(feature.createdAt)}</span>
            {feature.trendingScore > 10 && (
              <span className="flex items-center gap-1 text-orange-500 font-medium">
                <TrendingUp className="w-3 h-3" />
                Hot
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
