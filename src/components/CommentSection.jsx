import React, { useEffect, useState } from 'react';
import { Comment, Form, Button } from 'semantic-ui-react';

const CommentSection = ({ date, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeModalOpen, setLikeModalOpen] = useState(false);
  const [likeList, setLikeList] = useState([]);

  if (!date) return null;

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}`);
      if (res.status === 200) {
        const data = await res.json();
        if (data.length === 0) {
          setComments([
            {
              _id: 'coach-sandeep-local',
              text: "Let’s crush it today, warriors! 💥 Drop your scores – Coach Sandeep",
              user: {
                _id: "coach_sandeep_001",
                name: "Coach Sandeep",
                avatar: "https://res.cloudinary.com/dzfo713ey/image/upload/v1750674793/dungenz_profiles/gksyszwbkqrj427n4lji.png"
              },
              createdAt: new Date().toISOString(),
              likes: [],
              replies: [],
            },
          ]);
        } else {
          setComments(data);
        }
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("❌ Comment fetch error:", err);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const fallbackUser = {
      _id: user?.id || 'anonymous',
      name: user?.name || 'Unknown',
      avatar: user?.avatar || '',
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}`, {
        method: 'POST',
        headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({ text: newComment, user: fallbackUser })
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data);
        setNewComment('');
      }
    } catch (err) {
      console.error("❌ Comment post failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}/${commentId}/like`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: user.id,
        name: user.name,
        avatar: user.avatar
      })
    });
    fetchComments(); // Refresh comments
  };

  const handleDelete = async (commentId) => {
    if (commentId === 'coach-sandeep-local') return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchComments();
      else console.error("Delete failed:", await res.text());
    } catch (err) {
      console.error("❌ Delete comment failed:", err);
    }
  };

  const handleReply = async (commentId, text) => {
    if (!user?.name || !text.trim()) return;

    const fallbackUser = {
      _id: user?.id || 'anonymous',
      name: user?.name || 'Unknown',
      avatar: user?.avatar || '',
    };

    await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}/${commentId}/reply`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text, user: fallbackUser })
    });
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [date]);

  const AvatarOrInitials = ({ user }) => {
    if (user?.avatar) {
      const baseURL = process.env.REACT_APP_API_BASE_URL?.replace(/\/api$/, '');
      const fullURL = user.avatar.startsWith('http')
        ? user.avatar
        : `${baseURL}${user.avatar}`;
      return <Comment.Avatar src={fullURL} />;
    }
    const initials = (user?.name || 'U').slice(0, 2).toUpperCase();
    return <div className="avatar-initials-circle">{initials}</div>;
  };

  return (
    <div className="comment-zone-wrapper">
      <Form className="comment-zone" reply onSubmit={(e) => { e.preventDefault(); handleAddComment(); }} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Form.Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Log your workout result here"
          style={{ flex: 1, marginRight: '0.5rem' }}
        />
        <Button
          color="red"
          icon="send"
          type="submit"
          loading={isSubmitting}
          style={{ margin: 0, marginBottom: '15px' }}
        />
      </Form>

      {comments.length > 0 && (
        <Comment.Group threaded className="no-min-height-comment">
          {comments.slice().reverse().map((c) => (
            <Comment key={c._id}>
              <AvatarOrInitials user={c.user} />
              <Comment.Content>
                <Comment.Author as='span'>
                  {c.user?.name || 'Unknown'}
                  {(c._id !== 'coach-sandeep-local') &&
                    (c.user?._id === user?.id || user?.role === 'superadmin') && (
                      <span
                        onClick={() => handleDelete(c._id)}
                        style={{
                          marginLeft: '10px',
                          cursor: 'pointer',
                          color: 'gray',
                          fontSize: '14px',
                        }}
                        title="Delete your comment"
                      >
                        🗑️
                      </span>
                    )}
                </Comment.Author>
                <Comment.Metadata>
                  <div>{new Date(c.createdAt).toLocaleTimeString()}</div>
                </Comment.Metadata>
                <Comment.Text>{c.text}</Comment.Text>
                <Comment.Actions>
                  <Comment.Action onClick={() => handleLike(c._id)}>❤️</Comment.Action>
                  <span
                    style={{ marginLeft: '8px', color: '#aaa', cursor: 'pointer' }}
                    onClick={() => {
                      setLikeList(c.likes || []);
                      setLikeModalOpen(true);
                    }}
                  >
                    {c.likes?.length || 0}
                  </span>
                </Comment.Actions>
                {c.replies?.map((r, idx) => (
                  <Comment.Group key={idx}>
                    <Comment>
                      <AvatarOrInitials user={r.user} />
                      <Comment.Content>
                        <Comment.Author>{r.user?.name || 'Unknown'}</Comment.Author>
                        <Comment.Text>{r.text}</Comment.Text>
                      </Comment.Content>
                    </Comment>
                  </Comment.Group>
                ))}
              </Comment.Content>
            </Comment>
          ))}
        </Comment.Group>
      )}

      {/* ❤️ Like Modal */}
      {likeModalOpen && (
  <div
    style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a1a',
      color: '#fff',
      borderRadius: '10px',
      padding: '15px',
      zIndex: 1000,
      width: '90%',
      maxWidth: '300px',
      boxShadow: '0 0 10px rgba(0,0,0,0.4)'
    }}
    onClick={() => setLikeModalOpen(false)}
  >
    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>❤️ Liked by</div>
    {likeList.length === 0 ? (
  <div>No likes yet.</div>
) : (
  likeList.map((u, idx) => (
    <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid #333' }}>
      {u?.name || 'Unknown User'}
    </div>
  ))
)}
    <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa', textAlign: 'center' }}>
      Tap to close
    </div>
  </div>
)}
    </div>
  );
};

export default CommentSection;
