import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Users, Zap, MessageSquare, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  const features = [
    { icon: MessageSquare, title: 'Collect Feedback', desc: 'Gather user insights in one centralized place' },
    { icon: TrendingUp, title: 'Community Voting', desc: 'Let users upvote the features they want most' },
    { icon: BarChart3, title: 'Smart Analytics', desc: 'AI-powered sentiment analysis & trend tracking' },
    { icon: Zap, title: 'Real-time Updates', desc: 'See votes and comments update live via Socket.io' },
    { icon: Sparkles, title: 'AI Categorization', desc: 'Automatic category suggestions for new submissions' },
    { icon: Users, title: 'Admin Dashboard', desc: 'Powerful tools to moderate and prioritize' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Customer Feedback, Reimagined
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Listen. Build. Ship.
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-10">
              A centralized portal where your users submit feedback, request features, and vote on
              what matters most — so you always build what they actually want.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-lg px-6 py-3 flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-6 py-3 flex items-center gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-6 py-3">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">Everything you need</h2>
          <p className="text-gray-600 dark:text-gray-400">A complete feedback management platform out of the box</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card-hover"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative overflow-hidden rounded-3xl gradient-bg p-10 lg:p-16 text-center text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.3),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to hear from your users?</h2>
              <p className="text-white/90 mb-8 text-lg">Start collecting feedback in under a minute.</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Create your account <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Landing;
