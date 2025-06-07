import React, { useEffect, useState } from 'react';
import { Comment, Form, Button, Header } from 'semantic-ui-react';

const CommentSection = ({ date, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  if (!date) return null;

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}`);
      
      if (res.status === 200) {
        const data = await res.json();
        setComments(data);
      } else {
        // 🔕 No comments or not modified
        setComments([]);  // ✅ explicitly set to empty
      }
    } catch (err) {
      console.error("❌ Comment fetch error:", err);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const fallbackUser = {
      _id: user?.id || 'anonymous',
      name: user?.name || 'Unknown',
      avatar: user?.avatar || '',
    };

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment, user: fallbackUser })
    });

    const data = await res.json();
    setComments(data);
    setNewComment('');
  };

  const handleLike = async (commentId) => {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}/${commentId}/like`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    fetchComments();
  };

  const handleReply = async (commentId, text) => {
    if (!user?.name) return;

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

  const AvatarOrInitials = ({ user }) => {
    if (user?.avatar) {
      return <Comment.Avatar src={user.avatar} />;
    }
    const initials = (user?.name || 'U').slice(0, 2).toUpperCase();
    return (
      <div className="avatar-initials-circle">
        {initials}
      </div>
    );
  };

  return (
    <div className="comment-zone-wrapper">
      <Form className="comment-zone" reply onSubmit={handleAddComment} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Form.Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Log your workout result here"
          style={{ flex: 1, marginRight: '0.5rem' }}
        />
        <Button
          color="red"
          icon="send"
          onClick={handleAddComment}
          type="submit"
          style={{ margin: 0, marginBottom: '15px' }}
        />
      </Form>

      {comments.length > 0 ? (
        <Comment.Group as="div" threaded className="no-min-height">
          {comments.slice().reverse().map((c) => (
            <Comment key={c._id}>
              <AvatarOrInitials user={c.user} />
              <Comment.Content>
                <Comment.Author as='span'>{c.user?.name || 'Unknown'}</Comment.Author>
                <Comment.Metadata>
                  <div>{new Date(c.createdAt).toLocaleTimeString()}</div>
                </Comment.Metadata>
                <Comment.Text>{c.text}</Comment.Text>
                <Comment.Actions>
                  <Comment.Action onClick={() => handleLike(c._id)}>
                    ❤️ {c.likes.length}
                  </Comment.Action>
                </Comment.Actions>
                {c.replies.map((r, idx) => (
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
      ) : null}
    </div>
  );
};

export default CommentSection;
