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
      children={<div className="calendar-post-timing">
        <p className="calendar-post-time">{formattedDate}</p>
        {post.duration !== null && post.duration !== "" && (
          <p className="calendar-post-duration">{'(' + post.duration + ')'}</p>
        )}
      </div>}
    />
  );
};

export default CalendarPost;

