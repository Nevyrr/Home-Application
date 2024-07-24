import Post from "./Post";

/* eslint-disable react/prop-types */
const ReminderPost = ({ post, onUpdate, onDelete }) => {
  return (
    <Post
      post={post}
      onUpdate={onUpdate}
      onDelete={onDelete}
      children={<textarea
        value={post.body}
        readOnly
        rows="5"
        cols="100"
        className="mt-4 resize-none p-4 border border-gray-300 rounded-2xl shadow-lg text-base cursor-default"
      />}
    />
  );
};

export default ReminderPost;
