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
            .field{
                width:100%;
            }
            .comment-zone:empty {
                min-height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              
            .comment-zone input::placeholder {
                color: #999 !important; /* or #ccc or anything darker than default */
                opacity: 1 !important;
              }
              
              /* Prevent mobile zoom on focus */
              .comment-zone input[type="text"] {
                font-size: 16px; /* 16px prevents zoom on iOS */
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
