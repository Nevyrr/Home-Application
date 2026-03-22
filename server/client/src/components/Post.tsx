import { ReactNode } from "react";
import { useAuth } from "../hooks/index.ts";
import { PriorityFlag } from "../components/index.ts";
import { canUserWrite, isUserAdmin } from "../utils/permissions.ts";

interface BasePost {
  _id: string;
  user: string;
  username: string;
  title: string;
  priorityColor: number;
  createdAt?: string;
}

interface PostProps<TPost extends BasePost> {
  post: TPost;
  onUpdate: (post: TPost) => void;
  onDelete: (id: string) => void;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  meta?: ReactNode;
  hideMeta?: boolean;
}

const Post = <TPost extends BasePost>({
  post,
  onUpdate,
  onDelete,
  children,
  className = "",
  titleClassName = "",
  bodyClassName = "",
  meta,
  hideMeta = false,
}: PostProps<TPost>) => {
  const { user } = useAuth();
  const canManagePost = canUserWrite(user) && (user.id === post.user || isUserAdmin(user));
  const postClassName = ["relative", "post", className].filter(Boolean).join(" ");
  const computedTitleClassName = ["post-title-input", "truncate", "text-sm", "font-medium", titleClassName]
    .filter(Boolean)
    .join(" ");
  const computedBodyClassName = ["post-body", "flex-shrink-0", bodyClassName].filter(Boolean).join(" ");

  const defaultMeta = (
    <>
      <span>{post.username}</span>
      <span>|</span>
      <span>{new Date(post.createdAt || "").toLocaleDateString()}</span>
    </>
  );

  return (
    <div className={postClassName}>
      <div className="post-title flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:items-center">
        <PriorityFlag className="text-xs" priorityColor={post.priorityColor} isCreated={true}></PriorityFlag>

        <div className="ml-1 min-w-0 flex-1 text-left">
          <h2 className={computedTitleClassName}>{post.title}</h2>
          {!hideMeta && <div className="post-meta flex flex-wrap gap-2 text-[9px] text-slate-500">{meta || defaultMeta}</div>}
        </div>

        <div className={computedBodyClassName}>
          {children}
        </div>

        <div className="post-buttons ml-auto flex items-center gap-1">
          {canManagePost && (
            <>
              <button
                className="fa-solid fa-pen-to-square rounded p-1.5 text-xs text-green-600 transition-colors hover:bg-green-500/20"
                title="Modifier"
                onClick={() => onUpdate(post)}
              ></button>
              <button
                className="fa-solid fa-trash-can rounded p-1.5 text-xs text-red-600 transition-colors hover:bg-red-500/20"
                title="Supprimer"
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
