import Post from "./Post";

/* eslint-disable react/prop-types */
const ShoppingPost = ({ post, onUpdate, onDelete }) => {
  return (

    <Post
      post={post}
      onUpdate={onUpdate}
      onDelete={onDelete}
      children={<p className="shopping-post-body-count">{post.count}</p>}
    />
  );
};

export default ShoppingPost;
