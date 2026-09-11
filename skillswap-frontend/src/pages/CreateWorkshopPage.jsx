import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkshop } from '../services/workshopService';

export default function CreateWorkshopPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    capacity: 10
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      await createWorkshop({
        ...formData,
        capacity: Number(formData.capacity),
        dateTime: formData.dateTime
      });

      navigate('/workshops');
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create workshop.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">

        <button
          onClick={() => navigate('/workshops')}
          className="text-blue-600 mb-4"
        >
          ← Back to Workshops
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Create Workshop
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block font-medium mb-1">
              Workshop Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g. Java Basics"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Describe what participants will learn..."
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g. Chennai"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Workshop'}
          </button>

        </form>
      </div>
    </div>
  );
}