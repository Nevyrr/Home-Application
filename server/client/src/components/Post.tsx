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
    <div className="relative post">
      <div className="flex items-center justify-between post-title items-center gap-3">
        <PriorityFlag className="text-xs" priorityColor={post.priorityColor} isCreated={true}></PriorityFlag>
        <div className="flex-1 text-left min-w-0 ml-1">
          <h2 className="post-title-input text-sm font-medium truncate">{post.title}</h2>
          <div className="flex gap-2 text-[9px] text-slate-500">
            <span>{post.username}</span>
            <span>•</span>
            <span>{new Date(post.createdAt || "").toLocaleDateString()}</span>
          </div>
        </div>
        <div className="post-body flex-shrink-0">
          {children}
        </div>

        <div className="flex items-center gap-1 post-buttons">
          {(user.id === post.user || user.isAdmin === "true") && (
            <>
              <button
                className="fa-solid fa-pen-to-square text-xs p-1.5 rounded hover:bg-green-500/20 text-green-600 transition-colors"
                title="Update"
                onClick={() => onUpdate(post)}
              ></button>
              <button
                className="fa-solid fa-trash-can text-xs p-1.5 rounded hover:bg-red-500/20 text-red-600 transition-colors"
                title="Delete"
                onClick={() => onDelete(post._id)}
              ></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;

