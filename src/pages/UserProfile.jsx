import React, { useEffect, useState } from 'react';
import './../styles/UserProfile.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: '', email: '', photo: '', bio: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const baseURL = process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, [token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('bio', profile.bio);
      formData.append('profileImage', file); // ✅ THIS IS IMPORTANT

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setStatus('✅ Profile updated');
      } else {
        setStatus('❌ Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error occurred');
    }
  };

  return (
    <div className="profile-container">
      <h2>🧍 Your Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <label>Name</label>
        <input type="text" name="name" value={profile.name} onChange={handleChange} />

        <label>Bio</label>
        <textarea name="bio" rows={3} value={profile.bio || ''} onChange={handleChange} />

        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
{profile.photo && (
  <div style={{ textAlign: 'center' }}>
    <img src={profile.photo} alt="profile" className="preview-img" />
  </div>
)}

        <button type="submit">💾 Save</button>
      </form>
      <p>{status}</p>

      {(profile.bio || profile.profileImage) && (
  <div className="profile-preview-box">
    {profile.bio && (
      <div className="bio-preview">
        <h4>📝 Bio Preview:</h4>
        <p>{profile.bio}</p>
      </div>
    )}

    {profile.profileImage && (
      <div className="photo-preview">
        <h4>🖼️ Profile Picture Preview:</h4>
        <img
          src={`${baseURL}${user.profileImage}`}
          alt="profile"
          className="zen-avatar"
        />
      </div>
    )}
  </div>
)}

    </div>
  );
};

export default ProfilePage;

