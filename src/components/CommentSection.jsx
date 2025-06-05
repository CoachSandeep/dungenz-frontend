// 🧠 Daily Comments UI Component - GenZ Style

import React, { useEffect, useState } from 'react';
import '../styles/CommentSection.css';

const CommentSection = ({ date, user }) => {
    if (!date) return null; // 🛑 Block everything if no date
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}`)
    const data = await res.json();
    setComments(data);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment, user })
    });
    const data = await res.json();
    setComments(data);
    setNewComment('');
  };

  const handleLike = async (commentId) => {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}/${commentId}/like`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id })
    });
    fetchComments();
  };

  const handleReply = async (commentId, text) => {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}/${commentId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, user })
    });
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [date]);

  return (
    <div className="comment-section-genz">
      <h4 className="comment-heading">💬 Log your Results</h4>
      <form onSubmit={handleAddComment} className="comment-form">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="comment-input-bar"
        />
      </form>
      <div className="comment-list">
        {comments.map((c) => (
          <div className="comment-item" key={c._id}>
           <div className="avatar-initials">
  {getInitials(c?.user?.name || 'Unknown')}
</div>
            <div className="comment-body">
              <div className="comment-meta">
                <span className="comment-name">{c?.user?.name || 'Unknown'}</span>
                <span className="comment-likes">❤️ {c.likes.length}</span>
              </div>
              <div className="comment-text">{c.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const ReplyBox = ({ commentId, onReply }) => {
  const [reply, setReply] = useState('');

  const submit = () => {
    if (reply.trim()) {
      onReply(commentId, reply);
      setReply('');
    }
  };

  return (
    <div className="reply-box">
      <input
        type="text"
        placeholder="Reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />
      <button onClick={submit}>↩️</button>
    </div>
  );
};

export default CommentSection;
