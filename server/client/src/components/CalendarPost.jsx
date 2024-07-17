import { Post, PriorityFlag } from "../components";

/* eslint-disable react/prop-types */
const CalendarPost = ({ post, onUpdate, onDelete }) => {
  return (
    <Post
      post={post}
      onUpdate={onUpdate}
      onDelete={onDelete}
      body={<PriorityFlag className="text-sm mt-4" priorityColor={post.priorityColor} isCreated={true}></PriorityFlag>}
    />
  );
};

export default CalendarPost;
