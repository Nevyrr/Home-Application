import { useAuth } from "../hooks/index.ts";
import { ShoppingPost as ShoppingPostType } from "../types/index.ts";
import PriorityFlag from "./PriorityFlag.tsx";
import { canUserWrite, isUserAdmin } from "../utils/permissions.ts";

interface ShoppingPostProps {
  post: ShoppingPostType;
  onUpdate: (post: ShoppingPostType) => void;
  onDelete: (id: string) => void;
}

const ShoppingPost = ({ post, onUpdate, onDelete }: ShoppingPostProps) => {
  const { user } = useAuth();
  const quantityLabel = `${post.count} ${post.unit ?? ""}`.trim();
  const canManagePost = canUserWrite(user) && (user.id === post.user || isUserAdmin(user));
  const priorityLabel = (() => {
    switch (post.priorityColor) {
      case 1:
        return "Priorite basse";
      case 2:
        return "A prevoir";
      case 3:
        return "Urgent";
      default:
        return "Essentiel";
    }
  })();
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
          <div className="shopping-item-priority">
            <PriorityFlag className="shopping-item-flag" priorityColor={post.priorityColor} isCreated={true} />
            <span className="shopping-item-priority-copy">{priorityLabel}</span>
          </div>

          <h3 className="shopping-item-title">{post.title}</h3>
        </div>

        <div className="shopping-item-qty-panel">
          <span className="shopping-item-qty-label">Quantite</span>
          <span className="shopping-item-qty">{quantityLabel}</span>
        </div>

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
        <span className="shopping-item-meta-pill">
          <i className="fa-regular fa-user"></i>
          {post.username}
        </span>
        {createdLabel && (
          <span className="shopping-item-meta-pill">
            <i className="fa-regular fa-clock"></i>
            {createdLabel}
          </span>
        )}
      </div>
    </article>
  );
};

export default ShoppingPost;

