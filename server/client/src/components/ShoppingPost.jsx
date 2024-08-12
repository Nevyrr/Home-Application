import Post from "./Post";

/* eslint-disable react/prop-types */
const ShoppingPost = ({ post, onUpdate, onDelete }) => {
  return (

    <Post
      post={post}
      onUpdate={onUpdate}
      onDelete={onDelete}
      children={<div>
        <p className="shopping-post-body-count">{post.count + " " + (post.unit ?? "")}</p>
      </div>}
    />
  );
};

export default ShoppingPost;
