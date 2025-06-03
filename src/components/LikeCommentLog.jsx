import React, { useEffect, useRef, useState } from 'react';
import PullToRefresh from 'react-pull-to-refresh';
import '../styles/workout.css';

const handleRefresh = async () => {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 5);
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 5);

  await fetchWorkoutsInRange(
    fromDate.toISOString().split('T')[0],
    toDate.toISOString().split('T')[0]
  );
};

const LikeCommentLog = ({ workoutId }) => {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/likes/${workoutId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ like: !liked })
      });
      setLiked(!liked);
      setLikes(l => l + (liked ? -1 : 1));
    } catch (err) {
      console.error('Error liking workout:', err);
    }
  };

  const handleComment = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${workoutId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ comment })
      });
      setComment('');
      setShowComment(false);
    } catch (err) {
      console.error('Error commenting:', err);
    }
  };

  return (
    <div className="interaction-bar">
      <button onClick={handleLike} className={`like-btn ${liked ? 'liked' : ''}`}>
        ❤️ {likes}
      </button>
      <button onClick={() => setShowComment(!showComment)} className="comment-btn">
        💬 Comment
      </button>
      {showComment && (
        <div className="comment-box">
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Type your comment..." />
          <button onClick={handleComment}>Post</button>
        </div>
      )}
    </div>
  );
};

export default LikeCommentLog;
