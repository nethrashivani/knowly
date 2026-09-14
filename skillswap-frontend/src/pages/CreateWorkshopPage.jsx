import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createWorkshop } from '../services/workshopService';

export default function CreateWorkshopPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || '/workshops';
  const isSkillFlow = returnTo.startsWith('/skills/');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    hour: '',
    minute: '',
    period: 'AM',
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

  const validateTime = () => {
    const hour = Number(formData.hour);
    const minute = Number(formData.minute);

    if (!/^\d{1,2}$/.test(formData.hour)) {
      return 'Please enter a valid hour between 1 and 12.';
    }

    if (hour < 1 || hour > 12) {
      return 'Invalid hour. Please enter a value between 1 and 12.';
    }

    if (!/^\d{2}$/.test(formData.minute)) {
      return 'Please enter minutes as two digits, for example 05 or 30.';
    }

    if (minute < 0 || minute > 59) {
      return 'Invalid minutes. Please enter a value between 00 and 59.';
    }

    return null;
  };

  const convertTo24Hour = () => {
    let hour = Number(formData.hour);

    if (formData.period === 'AM') {
      if (hour === 12) {
        hour = 0;
      }
    } else {
      if (hour !== 12) {
        hour += 12;
      }
    }

    return `${String(hour).padStart(2, '0')}:${formData.minute}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date) {
      setError('Please select a workshop date.');
      return;
    }

    const timeError = validateTime();

    if (timeError) {
      setError(timeError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const time24Hour = convertTo24Hour();

      const dateTime = `${formData.date}T${time24Hour}`;

      await createWorkshop({
        title: formData.title,
        description: formData.description,
        dateTime: dateTime,
        location: formData.location,
        capacity: Number(formData.capacity)
      });

      navigate(returnTo);
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
          onClick={() => navigate(returnTo)}
          className="text-blue-600 mb-4"
        >
          {isSkillFlow
            ? '← Back to Skill'
            : '← Back to Workshops'}
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

          {/* Workshop Title */}
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

          {/* Description */}
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

          {/* Date */}
          <div>
            <label className="block font-medium mb-1">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block font-medium mb-1">
              Time
            </label>

            <div className="flex flex-wrap items-center gap-2">

              {/* Hour */}
              <input
                type="text"
                name="hour"
                value={formData.hour}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');

                  if (value.length <= 2) {
                    setFormData((prev) => ({
                      ...prev,
                      hour: value
                    }));
                  }
                }}
                placeholder="HH"
                inputMode="numeric"
                maxLength="2"
                required
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center"
              />

              <span className="text-xl font-semibold text-gray-500">
                :
              </span>

              {/* Minutes */}
              <input
                type="text"
                name="minute"
                value={formData.minute}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');

                  if (value.length <= 2) {
                    setFormData((prev) => ({
                      ...prev,
                      minute: value
                    }));
                  }
                }}
                placeholder="MM"
                inputMode="numeric"
                maxLength="2"
                required
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center"
              />

              {/* AM / PM */}
              <select
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>

            </div>

            <p className="text-xs text-gray-500 mt-1">
              Enter hour from 1–12 and minutes from 00–59.
            </p>
          </div>

          {/* Location */}
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

          {/* Capacity */}
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

          {/* Submit */}
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