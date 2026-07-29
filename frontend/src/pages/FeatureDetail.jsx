import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp, MessageCircle, Send, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { featureService, commentService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { timeAgo, statusColor, categoryColor, sentimentColor } from '../utils/helpers';

const STATUSES = ['pending', 'reviewed', 'implemented', 'rejected'];

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { socket } = useSocket();

  const [feature, setFeature] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [f, c] = await Promise.all([
        featureService.getById(id),
        commentService.list(id),
      ]);
      setFeature(f);
      setComments(c);
    } catch (err) {
      toast.error('Failed to load');
      navigate('/features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  // Real-time updates for votes and comments
  useEffect(() => {
    if (!socket) return;

    const voteHandler = ({ requestId, votes }) => {
      if (requestId === id) setFeature((prev) => prev && { ...prev, votes });
    };
    const commentHandler = ({ requestId, comment }) => {
      if (requestId === id) {
        // Avoid duplicate: only add if not already present
        setComments((prev) => (prev.some((c) => c._id === comment._id) ? prev : [comment, ...prev]));
      }
    };

    socket.on('vote:update', voteHandler);
    socket.on('comment:new', commentHandler);
    return () => {
      socket.off('vote:update', voteHandler);
      socket.off('comment:new', commentHandler);
    };
  }, [socket, id]);

  const handleVote = async () => {
    try {
      const res = await featureService.vote(id);
      setFeature((prev) => ({ ...prev, votes: res.votes, hasVoted: res.hasVoted }));
    } catch (err) {
      toast.error('Vote failed');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const c = await commentService.create(id, newComment);
      setComments((prev) => (prev.some((x) => x._id === c._id) ? prev : [c, ...prev]));
      setNewComment('');
    } catch (err) {
      toast.error('Could not post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (cid) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentService.remove(cid);
      setComments((prev) => prev.filter((c) => c._id !== cid));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await featureService.update(id, { status: newStatus });
      setFeature((prev) => ({ ...prev, status: updated.status }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this feature request permanently?')) return;
    try {
      await featureService.remove(id);
      toast.success('Deleted');
      navigate('/features');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
      </div>
    );
  }

  if (!feature) return null;

  const canDelete = isAdmin || feature.createdBy?._id === user?._id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/features" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to all requests
      </Link>

      <div className="card animate-fade-in">
        <div className="flex gap-4">
          <button
            onClick={handleVote}
            className={`flex flex-col items-center min-w-[70px] px-3 py-4 rounded-xl border-2 transition-all ${
              feature.hasVoted
                ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-600 hover:border-brand-400'
            }`}
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-2xl font-bold">{feature.votes}</span>
            <span className="text-xs mt-0.5">votes</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-2xl font-bold">{feature.title}</h1>
              <span className={statusColor(feature.status)}>{feature.status}</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
              {feature.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
              <span className={categoryColor(feature.category)}>{feature.category}</span>
              {feature.sentiment?.label && (
                <span className={sentimentColor(feature.sentiment.label)}>
                  {feature.sentiment.label}
                </span>
              )}
              <span className="text-gray-500">by {feature.createdBy?.username}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{timeAgo(feature.createdAt)}</span>
            </div>

            {/* Admin controls */}
            {isAdmin && (
              <div className="pt-3 border-t border-gray-200 dark:border-dark-700 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-medium text-gray-500">Admin:</span>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={feature.status === s}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      feature.status === s
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="mt-3 text-xs text-red-500 hover:underline inline-flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Delete request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-brand-500" />
          Discussion ({comments.length})
        </h2>

        <form onSubmit={handleComment} className="card mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Share your thoughts..."
            className="input-field resize-none mb-2"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{newComment.length}/1000</span>
            <button type="submit" disabled={posting || !newComment.trim()} className="btn-primary flex items-center gap-2">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Be the first to comment</div>
          ) : (
            comments.map((c) => {
              const canDel = isAdmin || c.userId?._id === user?._id;
              return (
                <div key={c._id} className="card animate-fade-in">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-semibold">
                        {c.userId?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <span className="font-medium text-sm">{c.userId?.username}</span>
                        <span className="text-xs text-gray-500 ml-2">{timeAgo(c.createdAt)}</span>
                      </div>
                    </div>
                    {canDel && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-10 whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureDetail;
