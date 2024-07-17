import Post from "./Post";

/* eslint-disable react/prop-types */
const ShoppingPost = ({ post, onDelete }) => {
  return (

    <Post
      post={post}
      onDelete={onDelete}
      body={<p className="text-sm mt-4">{post.body}</p>}
    />
  );
};

export default ShoppingPost;
