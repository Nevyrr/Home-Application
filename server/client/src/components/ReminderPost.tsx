import Post from "./Post.tsx";
import { ReminderPost as ReminderPostType } from "../types/index.ts";

interface ReminderPostProps {
  post: ReminderPostType;
  onUpdate: (post: ReminderPostType) => void;
  onDelete: (id: string) => void;
}

const ReminderPost = ({ post, onUpdate, onDelete }: ReminderPostProps) => {
  return (
    <Post
      post={post}
      onUpdate={onUpdate}
      onDelete={onDelete}
      children={<textarea
        value={post.body}
        readOnly
        rows={5}
        cols={100}
        className="mt-4 resize-none p-4 border border-gray-300 rounded-2xl shadow-lg text-base cursor-default"
      />}
    />
  );
};

export default ReminderPost;

