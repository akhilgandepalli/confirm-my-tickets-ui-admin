import { useEffect, useState } from 'react';
import api from '../utils/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings').then((res) => setBookings(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="text-left py-3 px-4">Booking ID</th>
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4">Movie</th>
              <th className="text-left py-3 px-4">Theater</th>
              <th className="text-left py-3 px-4">Seats</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium text-primary-600">{b.bookingId}</td>
                <td className="py-3 px-4">{b.user?.name}<br /><span className="text-xs text-gray-400">{b.user?.email}</span></td>
                <td className="py-3 px-4">{b.show?.movie?.title}</td>
                <td className="py-3 px-4">{b.show?.theater?.name}</td>
                <td className="py-3 px-4">{b.seats?.join(', ')}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span>
                </td>
                <td className="py-3 px-4 text-right font-medium">₹{b.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="text-center py-8 text-gray-500">No bookings yet</p>}
      </div>
    </div>
  );
};

export default Bookings;
