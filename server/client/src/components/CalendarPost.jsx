import Post from "./Post";
import { format } from 'date-fns';

/* eslint-disable react/prop-types */
const CalendarPost = ({ post, onUpdate, onDelete }) => {
  const formattedDate = format(post.date, 'HH:mm'); // Format en 24 heures
  return (
    <Post
      post={post}
      onUpdate={onUpdate}
      onDelete={onDelete}
      children={<div>
        <p className="text-lg font-bold text-indigo-600">{formattedDate}</p>
        {post.duration !== null && (
          <p className="text-lg font-bold text-indigo-600">{'(' + post.duration + ')'}</p>
        )}
      </div>}
    />
  );
};

export default CalendarPost;
