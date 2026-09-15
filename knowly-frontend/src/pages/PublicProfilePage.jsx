import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRatingsForUser } from '../services/ratingService';
import { getUserProfile } from '../services/profileService';
import { getAllSkills } from '../services/skillService';
import { getWorkshopsByTeacher } from '../services/workshopService';
import { expressInterest, removeInterest, isInterested } from '../services/skillInterestService';
import { getUser } from '../services/authService';
import Navbar from '../components/Navbar';

function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [interestedSkills, setInterestedSkills] = useState({});
  const [interestSaving, setInterestSaving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError('');
        const profileData = await getUserProfile(userId);
        setProfile(profileData);
        const [skillData, workshopData, ratingData] = await Promise.all([
          getAllSkills(), getWorkshopsByTeacher(userId), getRatingsForUser(userId)
        ]);
        setSkills(skillData.filter((skill) => String(skill.ownerId) === String(userId) || skill.ownerEmail === profileData.email));
        setWorkshops(workshopData);
        setRatings(ratingData);
        if (currentUser?.email && String(profileData.userId) !== String(currentUser.id)) {
          const statuses = {};
          for (const skill of skillData.filter((item) => String(item.ownerId) === String(userId) || item.ownerEmail === profileData.email)) {
            try { statuses[skill.id] = await isInterested(skill.id); } catch { statuses[skill.id] = false; }
          }
          setInterestedSkills(statuses);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load this profile.');
      } finally { setLoading(false); }
    };
    load();
  }, [userId]);

  const handleInterest = async (skillId) => {
    try {
      setInterestSaving(skillId); setError('');
      if (interestedSkills[skillId]) await removeInterest(skillId);
      else await expressInterest(skillId);
      setInterestedSkills((prev) => ({ ...prev, [skillId]: !prev[skillId] }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update interest.');
    } finally { setInterestSaving(null); }
  };

  const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const formatTime = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'N/A';
  const averageRating = ratings.length ? (ratings.reduce((sum, item) => sum + Number(item.rating), 0) / ratings.length).toFixed(1) : null;
  const featuredReviews = ratings.filter((item) => item.review && item.review.trim()).slice(0, 2);

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="text-center py-24 text-gray-500">Loading profile...</div></div>;
  if (!profile) return <div className="min-h-screen bg-gray-50"><Navbar /><main className="max-w-4xl mx-auto px-4 py-10"><p className="text-red-600">{error || 'Profile not found.'}</p><button type="button" onClick={() => navigate(-1)} className="mt-4 text-blue-600">← Go back</button></main></div>;

  const isOwnProfile = currentUser?.email === profile.email;

  return <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="max-w-5xl mx-auto px-4 py-10">
      <button type="button" onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-blue-600 mb-6">← Back</button>
      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 mb-7">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div><p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Instructor Profile</p><h1 className="text-3xl font-bold text-gray-900 mt-1">{profile.name}</h1><p className="text-gray-500 mt-1">{profile.role}</p></div>
          {averageRating && <div className="bg-blue-50 rounded-xl px-5 py-3 text-center"><p className="text-2xl font-bold text-blue-700">{averageRating} / 5</p><p className="text-xs text-gray-500">{ratings.length} profile review{ratings.length === 1 ? '' : 's'}</p></div>}
        </div>

        {featuredReviews.length > 0 && <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">What learners say</h2>
            {ratings.length > featuredReviews.length && <span className="text-xs text-gray-400">Showing {featuredReviews.length} of {ratings.length}</span>}
          </div>
          <div className="space-y-3">
            {featuredReviews.map((item) => <div key={item.id} className="bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-gray-900">{item.reviewerName}</p>
                <span className="text-blue-600 font-semibold">{item.rating}/5</span>
              </div>
              <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">“{item.review}”</p>
            </div>)}
          </div>
        </div>}

        <div className="grid md:grid-cols-2 gap-5 mt-7"><div><h2 className="font-semibold text-gray-900">About</h2><p className="text-gray-600 mt-2 leading-relaxed">{profile.bio || 'No bio added yet.'}</p></div><div><h2 className="font-semibold text-gray-900">Skills wanted</h2><p className="text-gray-600 mt-2 leading-relaxed">{profile.skillsWanted || 'No skills added yet.'}</p></div></div>
        <p className="text-sm text-gray-500 mt-6">Contact: {profile.email}</p>
        {isOwnProfile && <p className="text-xs text-gray-400 mt-2">This is the public view of your profile. Editing is available from your Profile page.</p>}
      </section>

      <section className="mb-8"><div className="flex items-end justify-between mb-4"><div><p className="text-sm font-semibold text-blue-600">WHAT THEY TEACH</p><h2 className="text-2xl font-bold text-gray-900">Skills Offered</h2></div></div>
        {skills.length === 0 ? <div className="bg-white border rounded-xl p-8 text-gray-500">No skills offered yet.</div> : <div className="grid md:grid-cols-2 gap-5">{skills.map((skill) => <div key={skill.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"><div className="flex justify-between gap-3"><span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">{skill.category}</span><span className="text-xs text-gray-400">{skill.experienceYears} yrs exp</span></div><h3 className="text-xl font-bold text-gray-900 mt-4">{skill.title}</h3><p className="text-gray-600 text-sm mt-2">{skill.description}</p><p className="text-sm text-gray-500 mt-4">Location: {skill.location}</p>{!isOwnProfile && <button type="button" onClick={() => handleInterest(skill.id)} disabled={interestSaving === skill.id} className={`mt-5 w-full py-2.5 rounded-lg text-sm font-medium ${interestedSkills[skill.id] ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}>{interestSaving === skill.id ? 'Saving...' : interestedSkills[skill.id] ? 'Interested' : `I'm Interested in ${skill.title}`}</button>}</div>)}</div>}
      </section>

      <section className="mb-8"><p className="text-sm font-semibold text-blue-600">TEACHING HISTORY</p><h2 className="text-2xl font-bold text-gray-900 mt-1 mb-4">Workshops Conducted</h2>{workshops.length === 0 ? <div className="bg-white border rounded-xl p-8 text-gray-500">No workshops conducted yet.</div> : <div className="space-y-4">{workshops.map((workshop) => <div key={workshop.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"><div><h3 className="text-xl font-bold text-gray-900">{workshop.title}</h3><p className="text-gray-500 text-sm mt-1">{formatDate(workshop.dateTime)} · {formatTime(workshop.dateTime)} · {workshop.location}</p></div><span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">{workshop.roomName || 'Room workshop'}</span></div><p className="text-gray-600 mt-3">{workshop.description}</p><WorkshopReviewSummary workshopId={workshop.id} /></div>)}</div>}</section>

      <section><p className="text-sm font-semibold text-blue-600">FEEDBACK</p><h2 className="text-2xl font-bold text-gray-900 mt-1 mb-4">Reviews About {profile.name}</h2>{ratings.length === 0 ? <div className="bg-white border rounded-xl p-8 text-gray-500">No profile reviews yet.</div> : <div className="space-y-3">{ratings.map((item) => <div key={item.id} className="bg-white border rounded-xl p-5"><div className="flex justify-between gap-3"><p className="font-semibold text-gray-900">{item.reviewerName}</p><span className="text-blue-600 font-semibold">{item.rating}/5</span></div><p className="text-gray-600 mt-2">{item.review || 'No written review.'}</p></div>)}</div>}</section>
    </main>
  </div>;
}

function WorkshopReviewSummary({ workshopId }) {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    import('../services/ratingService').then(({ getRatingsForWorkshop }) => getRatingsForWorkshop(workshopId).then(setReviews).catch(() => setReviews([])));
  }, [workshopId]);
  const average = reviews.length ? (reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length).toFixed(1) : null;
  return <div className="mt-4 pt-4 border-t border-gray-100">{average ? <p className="text-sm font-medium text-blue-700">Workshop rating: {average}/5 · {reviews.length} review{reviews.length === 1 ? '' : 's'}</p> : <p className="text-sm text-gray-400">No workshop reviews yet.</p>}{reviews.length > 0 && <div className="mt-3 space-y-2">{reviews.slice(0, 3).map((review) => <div key={review.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm"><span className="font-medium text-gray-800">{review.reviewerName}</span><span className="text-blue-600 ml-2">{review.rating}/5</span><p className="text-gray-600 mt-1">{review.review}</p></div>)}</div>}</div>;
}

export default PublicProfilePage;
