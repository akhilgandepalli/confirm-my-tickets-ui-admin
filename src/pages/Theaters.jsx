import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Armchair, Monitor, RotateCcw, Building2, MapPin, Layers } from 'lucide-react';
import api from '../utils/api';

const defaultRowNames = (count) => {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
};

const emptyForm = {
  name: '',
  city: '',
  address: '',
  screens: 1,
  amenities: '',
  image: '',
  seatingLayout: {
    rows: 10,
    cols: 10,
    screenPosition: 'top',
    rowNames: defaultRowNames(10),
  },
};

const Theaters = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [searchCity, setSearchCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTheaters = () => {
    setLoading(true);
    api.get('/theaters')
      .then((res) => setTheaters(res.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to fetch theaters'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setModal(true);
  };

  const openEdit = (t) => {
    const rows = t.seatingLayout?.rows || 10;
    const cols = t.seatingLayout?.cols || 10;
    const screenPosition = t.seatingLayout?.screenPosition || 'top';
    const rowNames = (t.seatingLayout?.rowNames && t.seatingLayout.rowNames.length === rows)
      ? t.seatingLayout.rowNames
      : defaultRowNames(rows);

    setForm({
      name: t.name || '',
      city: t.city || '',
      address: t.address || '',
      screens: t.screens || 1,
      amenities: t.amenities?.join(', ') || '',
      image: t.image || '',
      seatingLayout: {
        rows,
        cols,
        screenPosition,
        rowNames,
      },
    });
    setEditId(t._id);
    setModal(true);
  };

  const handleRowsChange = (newRowsVal) => {
    const newRows = Math.max(1, Math.min(26, parseInt(newRowsVal, 10) || 1));
    const currentNames = form.seatingLayout?.rowNames || [];
    const updatedNames = [];
    for (let i = 0; i < newRows; i++) {
      if (i < currentNames.length && currentNames[i]) {
        updatedNames.push(currentNames[i]);
      } else {
        updatedNames.push(String.fromCharCode(65 + i));
      }
    }

    setForm((prev) => ({
      ...prev,
      seatingLayout: {
        ...prev.seatingLayout,
        rows: newRows,
        rowNames: updatedNames,
      },
    }));
  };

  const handleColsChange = (newColsVal) => {
    const newCols = Math.max(1, Math.min(30, parseInt(newColsVal, 10) || 1));
    setForm((prev) => ({
      ...prev,
      seatingLayout: {
        ...prev.seatingLayout,
        cols: newCols,
      },
    }));
  };

  const handleScreenPositionChange = (pos) => {
    setForm((prev) => ({
      ...prev,
      seatingLayout: {
        ...prev.seatingLayout,
        screenPosition: pos,
      },
    }));
  };

  const handleRowNameChange = (index, value) => {
    const updated = [...(form.seatingLayout?.rowNames || [])];
    updated[index] = value;
    setForm((prev) => ({
      ...prev,
      seatingLayout: {
        ...prev.seatingLayout,
        rowNames: updated,
      },
    }));
  };

  const resetRowNames = () => {
    const rows = form.seatingLayout?.rows || 10;
    setForm((prev) => ({
      ...prev,
      seatingLayout: {
        ...prev.seatingLayout,
        rowNames: defaultRowNames(rows),
      },
    }));
    toast.success('Row names reset to A-Z');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      screens: Number(form.screens) || 1,
      amenities: form.amenities
        ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : [],
      image: form.image?.trim() || '',
      seatingLayout: {
        rows: Number(form.seatingLayout.rows) || 10,
        cols: Number(form.seatingLayout.cols) || 10,
        screenPosition: form.seatingLayout.screenPosition || 'top',
        rowNames: (form.seatingLayout.rowNames || []).map((rn, idx) => rn?.trim() || String.fromCharCode(65 + idx)),
      },
    };

    try {
      if (editId) {
        await api.put(`/theaters/${editId}`, payload);
        toast.success('Theater updated successfully!');
      } else {
        await api.post('/theaters', payload);
        toast.success('Theater created successfully!');
      }
      setModal(false);
      fetchTheaters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save theater');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/theaters/${id}`);
      toast.success('Theater deleted');
      fetchTheaters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete theater');
    }
  };

  const cities = Array.from(new Set(theaters.map((t) => t.city))).filter(Boolean);

  const filteredTheaters = theaters.filter((t) => {
    const matchesCity = searchCity === 'all' || t.city?.toLowerCase() === searchCity.toLowerCase();
    const matchesQuery = !searchQuery.trim() ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amenities?.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Theaters & Seating Layouts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage cinema venues, screens, and customizable seating configurations.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary inline-flex items-center justify-center gap-2 text-sm shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" /> Add Theater
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search theaters by name, location, amenity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-sm"
          />
          <select
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="input-field text-sm sm:w-48"
          >
            <option value="all">All Cities ({theaters.length})</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city} ({theaters.filter((t) => t.city === city).length})
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredTheaters.length}</span> of {theaters.length} venues
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500">Loading theaters network...</p>
        </div>
      ) : filteredTheaters.length === 0 ? (
        <div className="card text-center py-16">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No theaters found</h3>
          <p className="text-sm text-gray-500 mt-1">Try changing your search or filter parameters.</p>
        </div>
      ) : (
        /* Theaters Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTheaters.map((t) => {
            const rows = t.seatingLayout?.rows || 10;
            const cols = t.seatingLayout?.cols || 10;
            const screenPos = t.seatingLayout?.screenPosition || 'top';
            const totalCapacity = rows * cols;

            return (
              <div
                key={t._id}
                className="card group hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden !p-0 border border-gray-200/80 dark:border-gray-700"
              >
                {/* Theater Image or Banner */}
                {t.image && (
                  <div className="h-32 w-full overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                      {t.screens} {t.screens === 1 ? 'Screen' : 'Screens'}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {t.city}
                    </span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                        {t.name}
                      </h3>
                      {!t.image && (
                        <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-0.5 rounded font-medium">
                          {t.city}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      {t.address}
                    </p>

                    {/* Amenities */}
                    {t.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {t.amenities.map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 text-[11px] px-2 py-0.5 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Seating Layout Specs */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700/80">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Armchair className="w-3.5 h-3.5 text-primary-500" /> Seating Capacity
                        </span>
                        <span className="text-primary-600 dark:text-primary-400 font-bold">{totalCapacity} seats</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[11px]">
                        <span>Grid: {rows} Rows × {cols} Columns</span>
                        <span className="capitalize">Screen: {screenPos}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => openEdit(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit Seating & Details
                      </button>
                      <button
                        onClick={() => handleDelete(t._id, t.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete Theater"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Theater Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editId ? 'Edit Theater & Seating Layout' : 'Add New Theater'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure venue details, screen orientation, and custom row names.
                </p>
              </div>
              <button
                onClick={() => setModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Section 1: Venue Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-primary-500" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Theater Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AMB Cinemas"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad or Visakhapatnam"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Address *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarath City Capital Mall, Gachibowli Rd, Kondapur"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Screens
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={form.screens}
                      onChange={(e) => setForm({ ...form, screens: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amenities (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="IMAX, Dolby Atmos, 4K Laser, Recliner Seats, Food Court"
                      value={form.amenities}
                      onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Seating Layout Configuration */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-primary-500" /> Seating Layout & Screen Orientation
                  </h3>
                  <button
                    type="button"
                    onClick={resetRowNames}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Row Names
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number of Rows (1 - 26)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="26"
                      value={form.seatingLayout?.rows || 10}
                      onChange={(e) => handleRowsChange(e.target.value)}
                      className="input-field text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Columns per Row (1 - 30)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={form.seatingLayout?.cols || 10}
                      onChange={(e) => handleColsChange(e.target.value)}
                      className="input-field text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Screen View From End
                    </label>
                    <select
                      value={form.seatingLayout?.screenPosition || 'top'}
                      onChange={(e) => handleScreenPositionChange(e.target.value)}
                      className="input-field text-sm font-medium"
                    >
                      <option value="top">Screen at Top (Standard)</option>
                      <option value="bottom">Screen at Bottom</option>
                    </select>
                  </div>
                </div>

                {/* Individual Row Names Editor */}
                <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Row Names / Labels (Edit individually)
                    </label>
                    <span className="text-[11px] text-gray-500">
                      {form.seatingLayout?.rows} rows total
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                    {Array.from({ length: form.seatingLayout?.rows || 10 }).map((_, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 w-5 text-right font-mono">
                          {rIdx + 1}:
                        </span>
                        <input
                          type="text"
                          maxLength={12}
                          value={form.seatingLayout?.rowNames?.[rIdx] || String.fromCharCode(65 + rIdx)}
                          onChange={(e) => handleRowNameChange(rIdx, e.target.value)}
                          className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-primary-500 text-center font-semibold"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Mini Seating Layout Preview */}
                <div className="bg-gray-900 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3 border-b border-gray-800 pb-2">
                    <span className="flex items-center gap-1.5 text-gray-200 font-medium">
                      <Monitor className="w-4 h-4 text-primary-400" /> Interactive Layout Preview
                    </span>
                    <span>
                      Total Capacity:{' '}
                      <strong className="text-emerald-400 font-bold">
                        {(form.seatingLayout?.rows || 10) * (form.seatingLayout?.cols || 10)} Seats
                      </strong>
                    </span>
                  </div>

                  <div className="py-2 flex flex-col items-center">
                    {/* Top Screen */}
                    {form.seatingLayout?.screenPosition === 'top' && (
                      <div className="w-3/4 mb-4 text-center">
                        <div className="h-1.5 bg-gradient-to-r from-primary-400 via-white to-primary-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] mb-1" />
                        <span className="text-[10px] tracking-widest text-gray-400 uppercase font-bold">
                          SCREEN (TOP)
                        </span>
                      </div>
                    )}

                    {/* Seat Grid Mini Representation */}
                    <div className="space-y-1 max-w-full overflow-x-auto px-2 py-1">
                      {Array.from({ length: form.seatingLayout?.rows || 10 }).map((_, rIdx) => {
                        const rowName = form.seatingLayout?.rowNames?.[rIdx] || String.fromCharCode(65 + rIdx);
                        const colsCount = form.seatingLayout?.cols || 10;
                        return (
                          <div key={rIdx} className="flex items-center gap-2 justify-center">
                            <span className="w-8 text-[11px] font-mono text-gray-400 text-right truncate">
                              {rowName}
                            </span>
                            <div className="flex gap-1">
                              {Array.from({ length: colsCount }).map((_, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="w-4 h-4 bg-emerald-700/80 rounded-t-sm text-[8px] flex items-center justify-center text-white/70"
                                  title={`Row ${rowName}, Seat ${cIdx + 1}`}
                                >
                                  {colsCount <= 14 ? cIdx + 1 : ''}
                                </div>
                              ))}
                            </div>
                            <span className="w-8 text-[11px] font-mono text-gray-400 text-left truncate">
                              {rowName}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Screen */}
                    {form.seatingLayout?.screenPosition === 'bottom' && (
                      <div className="w-3/4 mt-4 text-center">
                        <div className="h-1.5 bg-gradient-to-r from-primary-400 via-white to-primary-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] mb-1" />
                        <span className="text-[10px] tracking-widest text-gray-400 uppercase font-bold">
                          SCREEN (BOTTOM)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
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
                  {editId ? 'Save Changes' : 'Create Theater'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Theaters;
