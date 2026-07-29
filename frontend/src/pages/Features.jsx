import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Sparkles, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { featureService } from '../services/services';
import { useSocket } from '../context/SocketContext';
import FeatureCard from '../components/FeatureCard';

const CATEGORIES = ['UI/UX', 'Feature', 'Integration', 'Performance', 'Other'];
const STATUSES = ['pending', 'reviewed', 'implemented', 'rejected'];

const Features = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('trending');
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const { socket } = useSocket();

  const load = async () => {
    setLoading(true);
    try {
      const data = await featureService.list({ search, category, status, sort });
      setFeatures(data);
    } catch (err) {
      toast.error('Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [search, category, status, sort]);

  // Subscribe to real-time vote updates
  useEffect(() => {
    if (!socket) return;
    const handler = ({ requestId, votes }) => {
      setFeatures((prev) => prev.map((f) => (f._id === requestId ? { ...f, votes } : f)));
    };
    socket.on('vote:update', handler);
    return () => socket.off('vote:update', handler);
  }, [socket]);

  const handleVote = async (id) => {
    try {
      const res = await featureService.vote(id);
      setFeatures((prev) =>
        prev.map((f) => (f._id === id ? { ...f, votes: res.votes, hasVoted: res.hasVoted } : f))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Vote failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await featureService.create({
        title: form.title,
        description: form.description,
        category: form.category || undefined, // let backend auto-categorize if empty
      });
      setFeatures((prev) => [created, ...prev]);
      setForm({ title: '', description: '', category: '' });
      setPrediction(null);
      setShowForm(false);
      toast.success('Feature request submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePredict = async () => {
    if (!form.title && !form.description) {
      toast.error('Add a title or description first');
      return;
    }
    setPredicting(true);
    try {
      const res = await featureService.predict({
        title: form.title,
        description: form.description,
      });
      setPrediction(res);
    } catch (err) {
      toast.error('Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Feature Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Vote for what you want to see next</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card mb-6 animate-slide-up">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            Submit a Feature Request
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="Short, descriptive title"
            />
            <textarea
              required
              maxLength={2000}
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none"
              placeholder="Describe the feature and why it would be valuable..."
            />
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field flex-1 min-w-[180px]"
              >
                <option value="">Auto-categorize (AI) 🤖</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handlePredict}
                disabled={predicting}
                className="btn-secondary flex items-center gap-2"
              >
                {predicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Predict Popularity
              </button>
            </div>

            {prediction && (
              <div className="p-4 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">AI Popularity Score</span>
                  <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                    {prediction.predictedScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 mb-2">
                  <div
                    className="gradient-bg h-2 rounded-full transition-all duration-500"
                    style={{ width: `${prediction.predictedScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sentiment: <strong>{prediction.sentiment.label}</strong>
                </p>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="input-field pl-10"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Sort:</span>
          {['trending', 'newest', 'votes', 'oldest'].map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sort === s
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse h-28" />
          ))}
        </div>
      ) : features.length === 0 ? (
        <div className="card text-center py-16">
          <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 mb-4">No feature requests match your filters</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Be the first to submit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((f) => (
            <FeatureCard key={f._id} feature={f} onVote={handleVote} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Features;
