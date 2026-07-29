import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, MessageSquare, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { featureService, feedbackService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import FeatureCard from '../components/FeatureCard';
import { toast } from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="card-hover">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [f, fb] = await Promise.all([
        featureService.list({ sort: 'trending' }),
        feedbackService.list({ sort: 'newest' }),
      ]);
      setFeatures(f);
      setFeedback(fb);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVote = async (id) => {
    try {
      const res = await featureService.vote(id);
      setFeatures((prev) =>
        prev.map((f) => (f._id === id ? { ...f, votes: res.votes, hasVoted: res.hasVoted } : f))
      );
      toast.success(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Vote failed');
    }
  };

  const topFeatures = features.slice(0, 5);
  const recentFeedback = feedback.slice(0, 3);
  const pendingCount = features.filter((f) => f.status === 'pending').length;
  const implementedCount = features.filter((f) => f.status === 'implemented').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Welcome back, {user?.username} 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Here&apos;s what&apos;s happening in your portal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Lightbulb}
          label="Feature Requests"
          value={features.length}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          icon={MessageSquare}
          label="Feedback Entries"
          value={feedback.length}
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pendingCount}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Implemented"
          value={implementedCount}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trending features */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Trending Requests
            </h2>
            <Link to="/features" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : topFeatures.length === 0 ? (
            <div className="card text-center py-10">
              <Lightbulb className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No feature requests yet. Be the first!</p>
              <Link to="/features" className="btn-primary mt-4 inline-flex">
                Submit one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topFeatures.map((f) => (
                <FeatureCard key={f._id} feature={f} onVote={handleVote} />
              ))}
            </div>
          )}
        </div>

        {/* Recent feedback */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Recent Feedback
            </h2>
            <Link to="/feedback" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentFeedback.length === 0 ? (
            <div className="card text-center py-10">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No feedback yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((f) => (
                <div key={f._id} className="card">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{f.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {f.description}
                  </p>
                  <span className="text-xs text-gray-500">by {f.createdBy?.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
