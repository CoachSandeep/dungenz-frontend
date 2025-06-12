import React, { useEffect, useState } from 'react';
import { Comment, Form, Button } from 'semantic-ui-react';

const CommentSection = ({ date, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              text: "Let’s crush it today, warriors! 💥 Drop your scores  – Coach Sandeep",
              user: {
                _id: "coach_sandeep_001",
                name: "Coach Sandeep",
                avatar: "/avatars/coach_sandeep.png"
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
        headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    fetchComments();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, user: fallbackUser })
    });
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [date]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const els = document.querySelectorAll('.ui.comments, iframe');
      els.forEach(el => {
        el.style.minHeight = '0px';
        el.style.border = 'none';
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const AvatarOrInitials = ({ user }) => {
    if (user?.avatar) return <Comment.Avatar src={user.avatar} />;
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
                  <Comment.Action onClick={() => handleLike(c._id)}>
                    ❤️ {c.likes?.length || 0}
                  </Comment.Action>
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
    </div>
  );
};

export default CommentSection;
