import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../utils/api';

const emptyForm = {
  title: '', description: '', genre: '', language: '', duration: '',
  rating: '', releaseDate: '', poster: '', banner: '', cast: '',
  director: '', status: 'now_showing', isFeatured: false,
};

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const fetchMovies = () => {
    api.get('/movies').then((res) => setMovies(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMovies(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModal(true); };

  const openEdit = (movie) => {
    setForm({
      title: movie.title, description: movie.description,
      genre: movie.genre?.join(', ') || '', language: movie.language,
      duration: movie.duration, rating: movie.rating,
      releaseDate: movie.releaseDate?.split('T')[0] || '',
      poster: movie.poster, banner: movie.banner,
      cast: movie.cast?.join(', ') || '', director: movie.director,
      status: movie.status, isFeatured: movie.isFeatured,
    });
    setEditId(movie._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      genre: form.genre.split(',').map((g) => g.trim()).filter(Boolean),
      cast: form.cast.split(',').map((c) => c.trim()).filter(Boolean),
      duration: Number(form.duration),
      rating: Number(form.rating),
    };
    try {
      if (editId) {
        await api.put(`/movies/${editId}`, payload);
        toast.success('Movie updated');
      } else {
        await api.post('/movies', payload);
        toast.success('Movie created');
      }
      setModal(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this movie?')) return;
    try {
      await api.delete(`/movies/${id}`);
      toast.success('Deleted');
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Movies</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Movie
        </button>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="text-left py-3 px-4">Poster</th>
              <th className="text-left py-3 px-4">Title</th>
              <th className="text-left py-3 px-4">Language</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Rating</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m) => (
              <tr key={m._id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4"><img src={m.poster} alt="" className="w-10 h-14 object-cover rounded" /></td>
                <td className="py-3 px-4 font-medium">{m.title}</td>
                <td className="py-3 px-4">{m.language}</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">{m.status}</span></td>
                <td className="py-3 px-4">{m.rating}/10</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded inline-flex"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(m._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded inline-flex"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editId ? 'Edit Movie' : 'Add Movie'}</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {['title', 'description', 'genre', 'language', 'director', 'poster', 'banner', 'cast'].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium mb-1 capitalize">{field}</label>
                  {field === 'description' ? (
                    <textarea name={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="input-field" rows={3} required={field === 'title' || field === 'description'} />
                  ) : (
                    <input name={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="input-field" required={['title', 'language'].includes(field)} />
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1">Duration (min)</label><input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-field" required /></div>
                <div><label className="block text-xs font-medium mb-1">Rating</label><input type="number" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1">Release Date</label><input type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} className="input-field" required /></div>
                <div><label className="block text-xs font-medium mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
              <button type="submit" className="btn-primary w-full">{editId ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
