import Post from "./Post.tsx";
import { format } from 'date-fns';
import { CalendarEvent } from "../types/index.ts";

interface CalendarPostProps {
  post: CalendarEvent;
  onUpdate: (post: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

const CalendarPost = ({ post, onUpdate, onDelete }: CalendarPostProps) => {
  const date = typeof post.date === 'string' ? new Date(post.date) : post.date;
  const formattedDate = format(date, 'HH:mm'); // Format en 24 heures
  return (
    <Post
      post={post}
      onUpdate={onUpdate}
      onDelete={onDelete}
      children={<div>
        <p className="text-lg font-bold text-indigo-600">{formattedDate}</p>
        {post.duration !== null && post.duration !== "" && (
          <p className="text-lg font-bold text-indigo-600">{'(' + post.duration + ')'}</p>
        )}
      </div>}
    />
  );
};

export default CalendarPost;

