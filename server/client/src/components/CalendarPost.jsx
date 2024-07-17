import { Post, PriorityFlag } from "../components";

/* eslint-disable react/prop-types */
const CalendarPost = ({ post, onUpdate, onDelete, userId }) => {
  return (
    <Post
      post={post}
      userId={userId}
      onUpdate={onUpdate}
      onDelete={onDelete}
      body={<PriorityFlag className="text-sm mt-4" priorityColor={post.priorityColor}></PriorityFlag>}
    />
  );
};

export default CalendarPost;
