import Post from "./Post.tsx";
import { ShoppingPost as ShoppingPostType } from "../types/index.ts";

interface ShoppingPostProps {
  post: ShoppingPostType;
  onUpdate: (post: ShoppingPostType) => void;
  onDelete: (id: string) => void;
}

const ShoppingPost = ({ post, onUpdate, onDelete }: ShoppingPostProps) => {
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

