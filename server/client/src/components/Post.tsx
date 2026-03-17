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
      <div className="post-title flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:items-center">
        <PriorityFlag className="text-xs" priorityColor={post.priorityColor} isCreated={true}></PriorityFlag>

        <div className="ml-1 min-w-0 flex-1 text-left">
          <h2 className="post-title-input truncate text-sm font-medium">{post.title}</h2>
          <div className="flex flex-wrap gap-2 text-[9px] text-slate-500">
            <span>{post.username}</span>
            <span>|</span>
            <span>{new Date(post.createdAt || "").toLocaleDateString()}</span>
          </div>
        </div>

        <div className="post-body flex-shrink-0">
          {children}
        </div>

        <div className="post-buttons ml-auto flex items-center gap-1">
          {(user.id === post.user || user.isAdmin === "true") && (
            <>
              <button
                className="fa-solid fa-pen-to-square rounded p-1.5 text-xs text-green-600 transition-colors hover:bg-green-500/20"
                title="Update"
                onClick={() => onUpdate(post)}
              ></button>
              <button
                className="fa-solid fa-trash-can rounded p-1.5 text-xs text-red-600 transition-colors hover:bg-red-500/20"
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
