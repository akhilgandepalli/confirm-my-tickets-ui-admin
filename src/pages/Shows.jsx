import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Trash2,
  X,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Armchair,
  Clapperboard,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../utils/api';

const Shows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  // Search, Filter, Sort, Pagination State
  const [search, setSearch] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterTheater, setFilterTheater] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc'); // Default: new to old
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShows, setTotalShows] = useState(0);

  // Form State
  const [form, setForm] = useState({
    movie: '',
    theater: '',
    screen: 'Screen 1',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:00 PM',
    endTime: '10:00 PM',
    price: 250,
  });

  const fetchDropdownData = async () => {
    try {
      const [moviesRes, theatersRes] = await Promise.all([
        api.get('/movies'),
        api.get('/theaters'),
      ]);
      setMovies(moviesRes.data);
      setTheaters(theatersRes.data);
    } catch (err) {
      console.error('Failed to load movies/theaters:', err);
    }
  };

  const fetchShows = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        order,
      };
      if (search.trim()) params.search = search.trim();
      if (filterMovie) params.movie = filterMovie;
      if (filterTheater) params.theater = filterTheater;
      if (filterDate) params.date = filterDate;

      const res = await api.get('/shows', { params });

      if (res.data && res.data.shows) {
        setShows(res.data.shows);
        setTotalShows(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      } else if (Array.isArray(res.data)) {
        setShows(res.data);
        setTotalShows(res.data.length);
        setTotalPages(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch shows');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, order, search, filterMovie, filterTheater, filterDate]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'newest') {
      setSortBy('createdAt');
      setOrder('desc');
    } else if (val === 'oldest') {
      setSortBy('createdAt');
      setOrder('asc');
    } else if (val === 'date_asc') {
      setSortBy('date');
      setOrder('asc');
    } else if (val === 'date_desc') {
      setSortBy('date');
      setOrder('desc');
    } else if (val === 'price_asc') {
      setSortBy('price');
      setOrder('asc');
    } else if (val === 'price_desc') {
      setSortBy('price');
      setOrder('desc');
    }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setFilterMovie('');
    setFilterTheater('');
    setFilterDate('');
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedTheater = theaters.find((t) => t._id === form.theater);
      const rows = selectedTheater?.seatingLayout?.rows || 10;
      const cols = selectedTheater?.seatingLayout?.cols || 10;

      await api.post('/shows', {
        ...form,
        price: Number(form.price),
        totalSeats: rows * cols,
        bookedSeats: [],
      });

      toast.success('Show successfully created! Showing at top of list.');
      setModal(false);
      // Reset to page 1 and newest sort so new show is immediately visible!
      setSortBy('createdAt');
      setOrder('desc');
      setPage(1);
      fetchShows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create show');
    }
  };

  const handleDelete = async (id, movieTitle) => {
    if (!confirm(`Are you sure you want to delete this show for "${movieTitle || 'Movie'}"?`)) return;
    try {
      await api.delete(`/shows/${id}`);
      toast.success('Show deleted');
      fetchShows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete show');
    }
  };

  const currentSortVal =
    sortBy === 'createdAt' && order === 'desc'
      ? 'newest'
      : sortBy === 'createdAt' && order === 'asc'
      ? 'oldest'
      : sortBy === 'date' && order === 'asc'
      ? 'date_asc'
      : sortBy === 'date' && order === 'desc'
      ? 'date_desc'
      : sortBy === 'price' && order === 'asc'
      ? 'price_asc'
      : 'price_desc';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Shows & Screenings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage movie schedules, tickets pricing, screens, and capacity across all theaters.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({
              movie: movies[0]?._id || '',
              theater: theaters[0]?._id || '',
              screen: 'Screen 1',
              date: new Date().toISOString().split('T')[0],
              startTime: '07:00 PM',
              endTime: '10:00 PM',
              price: 250,
            });
            setModal(true);
          }}
          className="btn-primary inline-flex items-center justify-center gap-2 text-sm shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" /> Add New Show
        </button>
      </div>

      {/* Filter, Search & Sort Control Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by movie title, theater, city, screen..."
              value={search}
              onChange={handleSearchChange}
              className="input-field pl-10 text-sm"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <select
              value={currentSortVal}
              onChange={handleSortChange}
              className="input-field pl-10 text-sm"
            >
              <option value="newest">Sort: Newest First (Default)</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="date_asc">Show Date: Earliest First</option>
              <option value="date_desc">Show Date: Latest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Per page:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="input-field text-sm"
            >
              <option value={10}>10 items</option>
              <option value={20}>20 items</option>
              <option value={50}>50 items</option>
              <option value={100}>100 items</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters: Movie, Theater, Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          <select
            value={filterMovie}
            onChange={handleFilterChange(setFilterMovie)}
            className="input-field text-xs"
          >
            <option value="">All Movies ({movies.length})</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>

          <select
            value={filterTheater}
            onChange={handleFilterChange(setFilterTheater)}
            className="input-field text-xs"
          >
            <option value="">All Theaters ({theaters.length})</option>
            {theaters.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.city})
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={handleFilterChange(setFilterDate)}
              className="input-field text-xs"
            />
          </div>

          {(search || filterMovie || filterTheater || filterDate) && (
            <button
              onClick={resetFilters}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Shows Table Container */}
      <div className="card overflow-hidden !p-0 border border-gray-200/80 dark:border-gray-700">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading shows schedule...</p>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Clapperboard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">No shows found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search criteria or create a new show.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Movie</th>
                  <th className="py-3.5 px-4 font-semibold">Theater & City</th>
                  <th className="py-3.5 px-4 font-semibold">Screen</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Seats / Booked</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {shows.map((s) => {
                  const showDate = new Date(s.date);
                  const isToday =
                    new Date().toDateString() === showDate.toDateString();
                  const bookedCount = s.bookedSeats?.length || 0;
                  const total = s.totalSeats || 100;
                  const percentBooked = Math.round((bookedCount / total) * 100);

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Movie Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {s.movie?.poster ? (
                            <img
                              src={s.movie.poster}
                              alt={s.movie.title}
                              className="w-10 h-14 object-cover rounded shadow-sm shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                              <Clapperboard className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white leading-tight">
                              {s.movie?.title || 'Unknown Movie'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {s.movie?.language} • {s.movie?.duration} min
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Theater & City */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {s.theater?.name || 'Unknown Theater'}
                        </p>
                        <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                          {s.theater?.city || 'N/A'}
                        </span>
                      </td>

                      {/* Screen */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                          {s.screen}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
                          <Clock className="w-3.5 h-3.5 text-primary-500" />
                          {s.startTime}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {showDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {isToday && (
                            <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                              TODAY
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 dark:text-white">
                          ₹{s.price}
                        </span>
                      </td>

                      {/* Seats & Occupancy */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {bookedCount}/{total}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            ({percentBooked}%)
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentBooked > 80
                                ? 'bg-red-500'
                                : percentBooked > 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, percentBooked)}%` }}
                          />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(s._id, s.movie?.title)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete Show"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalShows > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {(page - 1) * limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {Math.min(page * limit, totalShows)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {totalShows}
              </span>{' '}
              shows
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pNum = page - 3 + i;
                  if (pNum > totalPages) pNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      page === pNum
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Show Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" /> Add New Show
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  New shows will appear instantly at the top of the schedule.
                </p>
              </div>
              <button
                onClick={() => setModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Movie Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Select Movie *
                </label>
                <select
                  value={form.movie}
                  onChange={(e) => setForm({ ...form, movie: e.target.value })}
                  className="input-field text-sm"
                  required
                >
                  <option value="">-- Choose a movie --</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.language}) - {m.duration} mins
                    </option>
                  ))}
                </select>
              </div>

              {/* Theater Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Select Theater *
                </label>
                <select
                  value={form.theater}
                  onChange={(e) => setForm({ ...form, theater: e.target.value })}
                  className="input-field text-sm"
                  required
                >
                  <option value="">-- Choose a theater venue --</option>
                  {theaters.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} - {t.city} ({t.screens} screens,{' '}
                      {(t.seatingLayout?.rows || 10) * (t.seatingLayout?.cols || 10)} seats)
                    </option>
                  ))}
                </select>
              </div>

              {/* Screen & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Screen Name
                  </label>
                  <input
                    type="text"
                    value={form.screen}
                    onChange={(e) => setForm({ ...form, screen: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Screen 1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Ticket Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Show Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07:00 PM"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 PM"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2 text-sm font-semibold shadow-md"
                >
                  Create Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shows;
