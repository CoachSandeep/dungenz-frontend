import React, { useEffect, useState } from 'react';
import './../styles/UserProfile.css';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImageHelper'; // You will need to create this util

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: '', email: '', photo: '', bio: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

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
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setShowCrop(true);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('bio', profile.bio);

      if (file && croppedAreaPixels && preview) {
        const croppedFile = await getCroppedImg(preview, croppedAreaPixels);
        formData.append('profileImage', croppedFile);
      }

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        setStatus('✅ Profile updated');
        setShowCrop(false);
        setPreview(null);
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

        {showCrop && preview && (
          <div className="crop-container">
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {profile.photo && !showCrop && (
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
                src={`${baseURL}${profile.profileImage}`}
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
