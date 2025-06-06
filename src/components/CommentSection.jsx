import React, { useEffect, useState } from 'react';
import { Comment, Form, Button, Header, Icon } from 'semantic-ui-react';

const CommentSection = ({ date, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  if (!date) return null;

  const fetchComments = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}`);
    const data = await res.json();
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const fallbackUser = {
      _id: user?._id || 'anonymous',
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
    // if (!user?._id) return;
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${date}/${commentId}/like`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id })
    });
    fetchComments();
  };

  const handleReply = async (commentId, text) => {
    if (!user?.name) return;

    const fallbackUser = {
      _id: user?._id || 'anonymous',
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
    <Comment.Group threaded>
      <Header as='h3' dividing>
        <Icon name="users" color="red" /> Community Buzz
      </Header>

      {comments.map((c) => (
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
            {/* <ReplyBox commentId={c._id} onReply={handleReply} /> */}
          </Comment.Content>
        </Comment>
      ))}

      <Form reply onSubmit={handleAddComment}>
        <Form.Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
        />
        <Button icon='paper plane' content='Send' primary />
      </Form>
    </Comment.Group>
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
    <Form reply>
      <Form.Input
        placeholder="Reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        action={{
          icon: 'reply',
          onClick: submit
        }}
      />
    </Form>
  );
};

export default CommentSection;
