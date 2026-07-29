import { useEffect, useState } from 'react';
import { Plus, Search, MessageSquare, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { feedbackService } from '../services/services';
import FeedbackCard from '../components/FeedbackCard';

const CATEGORIES = ['Bug', 'UI/UX', 'Performance', 'General', 'Other'];

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.list({ search, category, sentiment });
      setFeedback(data);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [search, category, sentiment]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await feedbackService.create({
        title: form.title,
        description: form.description,
        category: form.category || undefined,
      });
      setFeedback((prev) => [created, ...prev]);
      setForm({ title: '', description: '', category: '' });
      setShowForm(false);
      toast.success('Feedback submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await feedbackService.remove(id);
      setFeedback((prev) => prev.filter((f) => f._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Feedback</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Share your thoughts about the product</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Feedback'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-slide-up">
          <h2 className="font-semibold text-lg mb-4">Submit Feedback</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="Brief title"
            />
            <textarea
              required
              maxLength={2000}
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none"
              placeholder="Tell us more..."
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              <option value="">Auto-categorize (AI) 🤖</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback..."
              className="input-field pl-10"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="input-field">
            <option value="all">All Sentiments</option>
            <option value="positive">😊 Positive</option>
            <option value="neutral">😐 Neutral</option>
            <option value="negative">😞 Negative</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : feedback.length === 0 ? (
        <div className="card text-center py-16">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 mb-4">No feedback yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Submit the first
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {feedback.map((f) => (
            <FeedbackCard key={f._id} feedback={f} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
