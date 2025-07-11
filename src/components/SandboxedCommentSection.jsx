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
            .semantic-zone .ui.comments {
                min-height: 0 !important;
                padding-bottom: 0 !important;
                margin-bottom: 0 !important;
              }

            .comment-zone input::placeholder {
                color: #999 !important; /* or #ccc or anything darker than default */
                opacity: 1 !important;
              }
              
              /* Prevent mobile zoom on focus */
              .comment-zone input[type="text"] {
                font-size: 16px; /* 16px prevents zoom on iOS */
              }

              .comment-zone-wrapper .no-min-height-comment {
                min-height: 0 !important;
                border: none !important;
                padding-bottom: 0 !important;
                margin-bottom: 0 !important;
              }

              .comment-zone-wrapper {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              .comment-zone-wrapper .ui.comments {
                padding: 0 !important;
                margin: 0 !important;
                min-height: 0 !important;
                border: none !important;
              }
              
              .comment-zone-wrapper iframe {
                display: none !important;
              }

              .avatar-initials-circle {
                width: 35px;
                height: 35px;
                background-color: #ff2c2c;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                text-transform: uppercase;
                margin-right: 10px;
              }

          `}</style>
        </>
      }
    >
      <div >
        <CommentSection date={date} user={user} />
      </div>
    </Frame>
  );
};

export default SandboxedCommentSection;
