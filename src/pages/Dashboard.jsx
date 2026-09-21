import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Building2,
  Calendar,
  Ticket,
  Users,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Clapperboard,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Star,
  Armchair,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, subtext, gradient, iconBg, trend }) => (
  <div className="card relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700/80">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
    <div className="flex items-start justify-between relative z-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            {trend && <span className="text-emerald-500 font-semibold flex items-center">↑</span>}
            {subtext}
          </p>
        )}
      </div>
      <div className={`p-3.5 rounded-2xl ${iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Preparing executive dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-primary-950 text-white p-6 sm:p-8 shadow-xl border border-gray-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Monitoring
              </span>
              <span className="text-xs text-gray-400">{todayStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {admin?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Here is your cinema operations command center. Track live bookings, monitor theater networks across cities, and manage show schedules.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/shows"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-600/30 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" /> Add Show
            </Link>
            <Link
              to="/theaters"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/15 transition-all hover:scale-105"
            >
              <Building2 className="w-4 h-4" /> Manage Theaters
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${(stats?.revenue || 0).toLocaleString('en-IN')}`}
          subtext="Gross ticketing revenue"
          gradient="from-emerald-500 to-teal-500"
          iconBg="bg-gradient-to-tr from-emerald-600 to-teal-500"
          trend={true}
        />
        <StatCard
          icon={Ticket}
          label="Confirmed Bookings"
          value={(stats?.bookings || 0).toLocaleString()}
          subtext="All successful reservations"
          gradient="from-accent-500 to-amber-500"
          iconBg="bg-gradient-to-tr from-accent-500 to-amber-500"
          trend={true}
        />
        <StatCard
          icon={Building2}
          label="Theaters Network"
          value={stats?.theaters || 0}
          subtext="Venues in Hyderabad & Vizag"
          gradient="from-purple-500 to-indigo-500"
          iconBg="bg-gradient-to-tr from-purple-600 to-indigo-500"
        />
        <StatCard
          icon={Calendar}
          label="Active Shows"
          value={(stats?.shows || 0).toLocaleString()}
          subtext="7-day scheduling active"
          gradient="from-blue-500 to-cyan-500"
          iconBg="bg-gradient-to-tr from-blue-600 to-cyan-500"
        />
        <StatCard
          icon={Film}
          label="Featured Movies"
          value={stats?.movies || 0}
          subtext="Now showing & upcoming"
          gradient="from-primary-600 to-rose-500"
          iconBg="bg-gradient-to-tr from-primary-600 to-rose-500"
        />
        <StatCard
          icon={Users}
          label="Registered Users"
          value={(stats?.users || 0).toLocaleString()}
          subtext="Active customer accounts"
          gradient="from-sky-500 to-blue-600"
          iconBg="bg-gradient-to-tr from-sky-500 to-blue-600"
        />
      </div>

      {/* 2-Column Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Network Coverage */}
        <div className="card lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" /> City Network Distribution
              </h2>
              <Link to="/theaters" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Breakdown of cinema complexes and multi-screen screens across major operational hubs.
            </p>

            <div className="space-y-4">
              {(stats?.cityStats || [
                { _id: 'Hyderabad', count: 10, totalScreens: 48 },
                { _id: 'Visakhapatnam', count: 10, totalScreens: 28 },
              ]).map((c) => {
                const totalTheaters = stats?.theaters || 20;
                const percent = Math.round((c.count / totalTheaters) * 100);
                return (
                  <div key={c._id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-sm font-semibold mb-1">
                      <span className="text-gray-900 dark:text-gray-100">{c._id}</span>
                      <span className="text-primary-600 dark:text-primary-400">{c.count} Theaters</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{c.totalScreens || 'Multi'} Total Screens</span>
                      <span>{percent}% network share</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" /> 100% Locations Active
            </span>
            <span>20 Venues Online</span>
          </div>
        </div>

        {/* Top Movies In Theaters */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-primary-500" /> Now Showing Titles
            </h2>
            <Link to="/movies" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              All Movies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {stats?.topMovies?.map((m) => (
              <div
                key={m._id}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow"
              >
                {m.poster ? (
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-12 h-16 object-cover rounded-lg shadow shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {m.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {m.language} • {m.duration} min
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {m.rating || 8.5}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate">
                      {m.genre?.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card overflow-hidden !p-0 border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary-500" /> Recent Bookings
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live transactions and verified ticket purchases.
            </p>
          </div>
          <Link
            to="/bookings"
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1"
          >
            View All Bookings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentBookings?.length === 0 ? (
          <div className="text-center py-14">
            <Ticket className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No bookings recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Booking ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Movie & Theater</th>
                  <th className="py-3 px-4 font-semibold">Seats</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {stats?.recentBookings?.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-primary-600 dark:text-primary-400">
                      {b.bookingId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {b.user?.name ? b.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-gray-900 dark:text-white">
                            {b.user?.name || 'Guest User'}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {b.user?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-xs text-gray-900 dark:text-white">
                        {b.show?.movie?.title || 'Unknown Title'}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {b.show?.theater?.name} ({b.show?.theater?.city})
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {b.seats?.map((seat, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-mono px-1.5 py-0.5 rounded font-semibold"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-gray-900 dark:text-white">
                      ₹{b.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
