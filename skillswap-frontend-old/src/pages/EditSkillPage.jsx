import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSkillById, updateSkill } from '../services/skillService';

const CATEGORIES = ['Technology', 'Music', 'Art', 'Language', 'Sports', 'Cooking', 'Other'];

export default function EditSkillPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: '',
    customCategory: '',
    description: '',
    instructorName: '',
    experienceYears: '',
    location: '',
  });

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const data = await getSkillById(id);
        const isCustomCategory = !CATEGORIES.includes(data.category);

        setForm({
          title: data.title,
          category: isCustomCategory ? 'Other' : data.category,
          customCategory: isCustomCategory ? data.category : '',
          description: data.description,
          instructorName: data.instructorName,
          experienceYears: data.experienceYears,
          location: data.location,
        });
      } catch (err) {
        setError('Failed to load skill.');
      } finally {
        setFetching(false);
      }
    };
    fetchSkill();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.category) return 'Category is required';

    if (form.category === 'Other' && !form.customCategory.trim()) {
      return 'Please specify your category';
    }
    if (!form.description.trim()) return 'Description is required';
    if (!form.instructorName.trim()) return 'Instructor name is required';
    if (form.experienceYears === '' || form.experienceYears < 0) return 'Valid experience years required';
    if (!form.location.trim()) return 'Location is required';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      setError('');
      const skillData = {
        ...form,
        category: form.category === 'Other'
          ? form.customCategory.trim()
          : form.category,
        experienceYears: parseInt(form.experienceYears),
      };

      delete skillData.customCategory;

      await updateSkill(id, skillData);
      setSuccess('Skill updated successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Failed to update skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-lg">
      Loading skill...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Skill</h1>
        </div>

        {/* Error / Success */}
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">{success}</div>}

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {form.category === 'Other' && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Specify Category
              </label>

              <input
                name="customCategory"
                value={form.customCategory}
                onChange={handleChange}
                placeholder="e.g. Photography, Finance, Dance..."
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Instructor Name</label>
            <input
              name="instructorName"
              value={form.instructorName}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Experience Years</label>
            <input
              name="experienceYears"
              type="number"
              min="0"
              max="50"
              value={form.experienceYears}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-yellow-500 text-white font-semibold py-2.5 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Skill'}
          </button>
        </div>
      </div>
    </div>
  );
}