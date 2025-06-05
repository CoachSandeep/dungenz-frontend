// 🧠 Daily Comments UI Component - GenZ Style

import React, { useEffect, useState } from 'react';
import '../styles/CommentSection.css';

const CommentSection = ({ date, user }) => {
    if (!date) return null; // 🛑 Block everything if no date
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    const res = await fetch(`${API_BASE}/api/comments/${date}`)
    const data = await res.json();
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(`${API_BASE}/api/comments/${date}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment, user })
    });
    const data = await res.json();
    setComments(data);
    setNewComment('');
  };

  const handleLike = async (commentId) => {
    await fetch(`${API_BASE}/api/comments/${date}/${commentId}/like`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id })
    });
    fetchComments();
  };

  const handleReply = async (commentId, text) => {
    await fetch(`${API_BASE}/api/comments/${date}/${commentId}/reply`, {
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
    <div className="comment-box">
      <h3>💬 Community Buzz</h3>
      <div className="comment-input">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Drop your thoughts..."
        />
        <button onClick={handleAddComment}>Send</button>
      </div>
      <div className="comment-list">
        {comments.map((c) => (
          <div className="comment" key={c._id}>
            <img src={c.user.avatar} alt="avatar" className="avatar" />
            <div className="bubble">
              <div className="meta">
                <strong>{c.user.name}</strong>
                <span onClick={() => handleLike(c._id)}>❤️ {c.likes.length}</span>
              </div>
              <div className="text">{c.text}</div>
              <div className="replies">
                {c.replies.map((r, idx) => (
                  <div className="reply" key={idx}>
                    <strong>{r.user.name}</strong>: {r.text}
                  </div>
                ))}
                <ReplyBox commentId={c._id} onReply={handleReply} />
              </div>
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
