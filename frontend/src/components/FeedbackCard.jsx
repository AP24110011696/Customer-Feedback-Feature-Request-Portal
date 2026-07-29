import { Trash2 } from 'lucide-react';
import { timeAgo, categoryColor, sentimentColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const FeedbackCard = ({ feedback, onDelete }) => {
  const { user, isAdmin } = useAuth();
  const canDelete = isAdmin || feedback.createdBy?._id === user?._id;

  return (
    <div className="card-hover animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">{feedback.title}</h3>
        {canDelete && (
          <button
            onClick={() => onDelete(feedback._id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
        {feedback.description}
      </p>

      <div className="flex items-center flex-wrap gap-2 text-xs">
        <span className={categoryColor(feedback.category)}>{feedback.category}</span>
        {feedback.sentiment?.label && (
          <span className={sentimentColor(feedback.sentiment.label)}>
            {feedback.sentiment.label}
          </span>
        )}
        <span className="text-gray-500 dark:text-gray-400">
          by {feedback.createdBy?.username || 'unknown'}
        </span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500 dark:text-gray-400">{timeAgo(feedback.createdAt)}</span>
      </div>
    </div>
  );
};

export default FeedbackCard;
