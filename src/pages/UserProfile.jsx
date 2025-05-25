import React, { useEffect, useState } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '', age: '', gender: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          age: data.age || '',
          gender: data.gender || '',
        });
        setPreview(data.profileImage ? `${process.env.REACT_APP_API_BASE_URL}${data.profileImage}` : null);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    data.append('age', formData.age);
    data.append('gender', formData.gender);
    if (image) data.append('profileImage', image);

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: data,
    });

    if (res.ok) {
      alert('✅ Profile updated!');
    } else {
      alert('❌ Failed to update profile.');
    }
  };

  return (
    <div className="profile-container">
      <h2>👤 Your Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-image-preview">
          {preview && <img src={preview} alt="Preview" />}
          <input type="file" onChange={handleImageChange} />
        </div>

        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Short Bio" />
        <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Age" />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <button type="submit">💾 Save Profile</button>
      </form>
    </div>
  );
};

export default UserProfile;
