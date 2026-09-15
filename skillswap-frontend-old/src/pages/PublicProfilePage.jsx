import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getRatingsForUser,
  createRating
} from '../services/ratingService';
import { getAllSkills } from '../services/skillService';
import { getUser } from '../services/authService';

function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState([]);

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Load profile
        const profileResponse = await fetch(
          `http://localhost:8080/api/profile/user/${userId}`
        );

        if (!profileResponse.ok) {
          throw new Error(
            `Profile request failed: ${profileResponse.status}`
          );
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);

        // 2. Load ratings
        try {
          const ratingsData = await getRatingsForUser(userId);
          setRatings(ratingsData);
        } catch (err) {
          console.error('Ratings failed:', err);
          setRatings([]);
        }

        // 3. Load skills
        try {
          const skillsData = await getAllSkills();

          setSkills(
            skillsData.filter(
              (skill) => skill.ownerEmail === profileData.email
            )
          );
        } catch (err) {
          console.error('Skills failed:', err);
          setSkills([]);
        }

      } catch (err) {
        console.error('Profile failed:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const newRating = await createRating({
        ratedUserId: Number(userId),
        rating: Number(rating),
        review
      });

      setRatings((prev) => [...prev, newRating]);
      setRating(5);
      setReview('');

    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to submit rating.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error && !profile) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  const currentUser = getUser();

  const isOwnProfile =
    currentUser?.email === profile.email;

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce(
            (sum, item) => sum + Number(item.rating),
            0
          ) / ratings.length
        ).toFixed(1)
      : null;

  return (
    <div>
      <button onClick={() => navigate('/')}>
        Back to Home
      </button>

      <h1>{profile.name}'s Profile</h1>

      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>

      <h2>About</h2>
      <p>
        {profile.bio || 'No bio added yet.'}
      </p>

      <h2>Skills Wanted</h2>
      <p>
        {profile.skillsWanted || 'No skills added yet.'}
      </p>

      <h2>Skills Offered</h2>

      {skills.length === 0 ? (
        <p>No skills offered yet.</p>
      ) : (
        <ul>
          {skills.map((skill) => (
            <li key={skill.id}>
              {skill.title} — {skill.category}
            </li>
          ))}
        </ul>
      )}

      <h2>Ratings & Reviews</h2>

      {averageRating ? (
        <p>
          Average Rating: {averageRating} / 5
        </p>
      ) : (
        <p>No ratings yet.</p>
      )}

      {ratings.length > 0 && (
        <ul>
          {ratings.map((item) => (
            <li key={item.id}>
              <strong>{item.reviewerName}</strong>
              {' — '}
              {item.rating}/5
              <br />
              {item.review}
            </li>
          ))}
        </ul>
      )}

      {!isOwnProfile && (
        <div>
          <h2>Rate {profile.name}</h2>

          {error && <p>{error}</p>}

          <form onSubmit={handleRatingSubmit}>
            <label>Rating</label>

            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Bad</option>
            </select>

            <br />

            <label>Review</label>
            <br />

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="4"
              maxLength="1000"
              placeholder="Write your review..."
            />

            <br />

            <button type="submit" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PublicProfilePage;