// 📦 Required Packages
import React from 'react';
import Frame from 'react-frame-component';
import CommentSection from './CommentSection';

const SandboxedCommentSection = ({ date, user }) => {
  return (
    <Frame
      style={{ width: '100%', border: 'none', minHeight: '200px' }}
      head={
        <>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.css"
          />
          <style>{`
            body {
              margin: 0;
              font-family: 'Poppins', sans-serif;
              background: transparent;
            }
          `}</style>
        </>
      }
    >
      <div style={{ padding: '1rem' }}>
        <CommentSection date={date} user={user} />
      </div>
    </Frame>
  );
};

export default SandboxedCommentSection;
