import { useAuth } from "../hooks/index.ts";
import { ShoppingPost as ShoppingPostType } from "../types/index.ts";
import PriorityFlag, { getPriorityLabel } from "./PriorityFlag.tsx";
import { canUserWrite, isUserAdmin } from "../utils/permissions.ts";

interface ShoppingPostProps {
  post: ShoppingPostType;
  onUpdate: (post: ShoppingPostType) => void;
  onDelete: (id: string) => void;
}

const ShoppingPost = ({ post, onUpdate, onDelete }: ShoppingPostProps) => {
  const { user } = useAuth();
  const normalizedUnit = post.unit === "u" ? "" : post.unit ?? "";
  const quantityLabel = `${post.count} ${normalizedUnit}`.trim();
  const canManagePost = canUserWrite(user) && (user.id === post.user || isUserAdmin(user));
  const priorityLabel = getPriorityLabel(post.priorityColor);
  const createdLabel = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <article className={`shopping-item shopping-priority-${post.priorityColor}`}>
      <div className="shopping-item-top">
        <div className="shopping-item-main">
          <h3 className="shopping-item-title">
            <span className="shopping-item-title-text">{post.title}</span>
            <span className="shopping-item-title-qty">{quantityLabel}</span>
          </h3>
        </div>

        {createdLabel && (
          <span className="shopping-item-inline-date">
            <i className="fa-regular fa-clock"></i>
            <span className="shopping-item-meta-copy">{createdLabel}</span>
          </span>
        )}

        {canManagePost && (
          <div className="shopping-item-actions">
            <button type="button" className="shopping-item-action edit" title="Modifier l'article" onClick={() => onUpdate(post)}>
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" className="shopping-item-action delete" title="Supprimer l'article" onClick={() => onDelete(post._id)}>
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        )}
      </div>

      <div className="shopping-item-meta">
        <span className="shopping-item-meta-pill shopping-item-priority-pill">
          <PriorityFlag className="shopping-item-meta-flag" priorityColor={post.priorityColor} isCreated={true} />
          {priorityLabel}
        </span>
        <span className="shopping-item-meta-pill shopping-item-meta-data">
          <i className="fa-regular fa-user"></i>
          <span className="shopping-item-meta-copy">{post.username}</span>
        </span>
        {createdLabel && (
          <span className="shopping-item-meta-pill shopping-item-meta-data shopping-item-meta-date">
            <i className="fa-regular fa-clock"></i>
            <span className="shopping-item-meta-copy">{createdLabel}</span>
          </span>
        )}
      </div>
    </article>
  );
};

export default ShoppingPost;

