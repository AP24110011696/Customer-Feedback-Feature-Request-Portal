import { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  MessageSquare,
  Lightbulb,
  ThumbsUp,
  MessageCircle,
  Shield,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/services';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="card-hover">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  const load = async () => {
    try {
      const [analytics, usersList] = await Promise.all([
        adminService.analytics(),
        adminService.users(),
      ]);
      setData(analytics);
      setUsers(usersList);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await adminService.updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      toast.success(`User role updated to ${role}`);
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
      </div>
    );
  }

  if (!data) return null;

  // Prepare chart data
  const statusData = data.statusDistribution.map((d) => ({ name: d._id, value: d.count }));
  const categoryData = data.categoryDistribution.map((d) => ({ name: d._id, value: d.count }));
  const sentimentData = data.sentimentDistribution.map((d) => ({
    name: d._id,
    value: d.count,
  }));

  // Merge trends on a common date axis for the last 14 days
  const trendMap = {};
  data.feedbackTrend.forEach((d) => {
    trendMap[d._id] = trendMap[d._id] || { date: d._id, feedback: 0, features: 0 };
    trendMap[d._id].feedback = d.count;
  });
  data.featureTrend.forEach((d) => {
    trendMap[d._id] = trendMap[d._id] || { date: d._id, feedback: 0, features: 0 };
    trendMap[d._id].features = d.count;
  });
  const trendData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="p-2.5 gradient-bg rounded-xl shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-0.5">Portal analytics & management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-dark-800">
        {[
          { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          { key: 'users', label: 'Users', icon: Users },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={Users} label="Users" value={data.totals.users} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
            <StatCard icon={Lightbulb} label="Features" value={data.totals.features} gradient="bg-gradient-to-br from-purple-500 to-pink-600" />
            <StatCard icon={MessageSquare} label="Feedback" value={data.totals.feedback} gradient="bg-gradient-to-br from-pink-500 to-rose-600" />
            <StatCard icon={ThumbsUp} label="Votes" value={data.totals.votes} gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
            <StatCard icon={MessageCircle} label="Comments" value={data.totals.comments} gradient="bg-gradient-to-br from-orange-500 to-red-600" />
          </div>

          {/* Charts grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Trend line */}
            <div className="card lg:col-span-2">
              <h3 className="font-semibold mb-4">Activity (last 14 days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={axisColor} fontSize={12} />
                  <YAxis stroke={axisColor} fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: theme === 'dark' ? '#1e293b' : '#fff',
                      border: `1px solid ${gridColor}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="feedback" stroke="#8b5cf6" strokeWidth={2} name="Feedback" />
                  <Line type="monotone" dataKey="features" stroke="#0ea5e9" strokeWidth={2} name="Features" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status pie */}
            <div className="card">
              <h3 className="font-semibold mb-4">Feature Status Distribution</h3>
              {statusData.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: theme === 'dark' ? '#1e293b' : '#fff',
                        border: `1px solid ${gridColor}`,
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category bar */}
            <div className="card">
              <h3 className="font-semibold mb-4">Feature Categories</h3>
              {categoryData.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke={axisColor} fontSize={11} />
                    <YAxis stroke={axisColor} fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: theme === 'dark' ? '#1e293b' : '#fff',
                        border: `1px solid ${gridColor}`,
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top features */}
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Top 5 Most Voted Features
            </h3>
            <div className="space-y-2">
              {data.topFeatures.map((f, i) => (
                <div key={f._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-900">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{f.title}</p>
                    <p className="text-xs text-gray-500">by {f.createdBy?.username || 'unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-500">{f.votes}</p>
                    <p className="text-xs text-gray-500">votes</p>
                  </div>
                </div>
              ))}
              {data.topFeatures.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No features yet</p>
              )}
            </div>
          </div>

          {/* Sentiment summary */}
          {sentimentData.length > 0 && (
            <div className="card mt-6">
              <h3 className="font-semibold mb-4">Feedback Sentiment Breakdown (AI)</h3>
              <div className="grid grid-cols-3 gap-4">
                {sentimentData.map((s) => {
                  const emoji = s.name === 'positive' ? '😊' : s.name === 'negative' ? '😞' : '😐';
                  const color =
                    s.name === 'positive'
                      ? 'text-green-500'
                      : s.name === 'negative'
                      ? 'text-red-500'
                      : 'text-gray-500';
                  return (
                    <div key={s.name} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-dark-900">
                      <div className="text-3xl mb-1">{emoji}</div>
                      <div className={`text-2xl font-bold ${color}`}>{s.value}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{s.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-700 text-left">
                <th className="py-3 px-2 font-semibold">Username</th>
                <th className="py-3 px-2 font-semibold">Email</th>
                <th className="py-3 px-2 font-semibold">Role</th>
                <th className="py-3 px-2 font-semibold">Joined</th>
                <th className="py-3 px-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 dark:border-dark-800">
                  <td className="py-3 px-2 font-medium">{u.username}</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="py-3 px-2">
                    <span className={u.role === 'admin' ? 'badge-purple' : 'badge-gray'}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() =>
                        handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')
                      }
                      className="text-xs px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 hover:bg-brand-200"
                    >
                      {u.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
