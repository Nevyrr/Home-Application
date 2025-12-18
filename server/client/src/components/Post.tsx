import { ReactNode } from "react";
import { useAuth } from "../hooks/index.ts";
import { PriorityFlag } from "../components/index.ts";

interface PostProps {
  post: {
    _id: string;
    user: string;
    username: string;
    title: string;
    priorityColor: number;
    createdAt?: string;
    [key: string]: unknown;
  };
  onUpdate: (post: unknown) => void;
  onDelete: (id: string) => void;
  children: ReactNode;
}

const Post = ({ post, onUpdate, onDelete, children }: PostProps) => {
  const { user } = useAuth();

  return (
    <div className="my-2 relative post">
      <div className="flex items-start justify-evenly post-title items-center">
        <PriorityFlag className="text-sm mt-4" priorityColor={post.priorityColor} isCreated={true}></PriorityFlag>
        <div className="w-1/2 text-center">
          <h2 className="post-title-input">{post.title}</h2>
          <p className="text-[10px] text-slate-500">{post.username}</p>
          <p className="text-[10px] text-slate-500">{new Date(post.createdAt || "").toLocaleDateString()}</p>
        </div>
        <div className="mx-2 post-body">
          {children}
        </div>

        <div className="flex items-center gap-2 post-buttons">
          {(user.id === post.user || user.isAdmin === "true") && (
            <div>
              <button
                className="fa-solid fa-pen-to-square nav-link text-green-500 hover:bg-green-200"
                title="Update"
                onClick={() => onUpdate(post)}
              ></button>
              <button
                className="fa-solid fa-trash-can nav-link text-red-500 hover:bg-red-200"
                title="Delete"
                onClick={() => onDelete(post._id)}
              ></button>
            </div>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-indigo-50 via-indigo-600/70 to-indigo-50 my-3.5"></div>
    </div>
  );
};

export default Post;

