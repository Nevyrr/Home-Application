import Post from "./Post";

/* eslint-disable react/prop-types */
const ShoppingPost = ({ post, onUpdate, onDelete }) => {
  return (

    <Post
      post={post}
      onUpdate={onUpdate}
      onDelete={onDelete}
      children={<div>
        <img src={post.imageURL} />
        <p className="shopping-post-body-count">{post.count}</p>
      </div>}
    />
  );
};

export default ShoppingPost;
