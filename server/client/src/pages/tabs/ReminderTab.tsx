import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Alert, Success } from "../../components/index.ts";
import {
  createPost,
  deletePost,
  getPosts,
  ReminderPostPayload,
  reorderPosts,
  updatePost,
} from "../../controllers/ReminderPostsController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { ReminderPost } from "../../types/index.ts";
import { canUserWrite, isUserAdmin } from "../../utils/permissions.ts";

const STATUS_OPTIONS: Array<{ value: ReminderPost["status"]; label: string }> = [
  { value: "todo", label: "A faire" },
  { value: "doing", label: "En cours" },
  { value: "done", label: "Termine" },
];

const COLUMN_ID_PREFIX = "reminder-column-";

const EMPTY_EDITOR: ReminderPostPayload = {
  title: "",
  body: "",
  status: "todo",
  dueDate: "",
};

const normalizeDueDate = (dueDate?: string | Date | null): string => {
  if (!dueDate) {
    return "";
  }

  const parsedDate = dueDate instanceof Date ? dueDate : new Date(dueDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
};

const toPayload = (post: ReminderPost): ReminderPostPayload => ({
  title: post.title,
  body: post.body || "",
  status: post.status || "todo",
  dueDate: normalizeDueDate(post.dueDate),
  sortOrder: post.sortOrder,
});

const compareByManualOrder = (a: ReminderPost, b: ReminderPost): number => {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
};

const getColumnId = (status: ReminderPost["status"]): string => `${COLUMN_ID_PREFIX}${status}`;

const isColumnId = (id: string): boolean => id.startsWith(COLUMN_ID_PREFIX);

const getStatusFromColumnId = (columnId: string): ReminderPost["status"] =>
  columnId.replace(COLUMN_ID_PREFIX, "") as ReminderPost["status"];

const getStatusLabel = (status: ReminderPost["status"]): string =>
  STATUS_OPTIONS.find((option) => option.value === status)?.label || "A faire";

const formatDueDate = (dueDate?: string | Date | null): string => {
  if (!dueDate) {
    return "Sans echeance";
  }

  const parsedDate = dueDate instanceof Date ? dueDate : new Date(dueDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sans echeance";
  }

  return parsedDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface ReminderTaskCardProps {
  post: ReminderPost;
  canManage: boolean;
  onEdit: (post: ReminderPost) => void;
  onDelete: (postId: string) => void;
}

const ReminderTaskCardContent = ({ post, canManage, onEdit, onDelete, dragHandle }: ReminderTaskCardProps & {
  dragHandle?: ReactNode;
}) => {
  return (
    <>
      <div className="reminder-task-top">
        <div className="reminder-task-summary">
          <span className={`reminder-status-badge status-${post.status}`}>{getStatusLabel(post.status || "todo")}</span>
          <div className="reminder-task-meta">
            <span>{post.username}</span>
            <span className="meta-separator">|</span>
            <span>{formatDueDate(post.dueDate)}</span>
          </div>
        </div>

        {dragHandle}
      </div>

      <h3>{post.title}</h3>

      {post.body ? (
        <p className="reminder-task-body">{post.body}</p>
      ) : (
        <p className="reminder-task-body muted-copy">Aucune note ajoutee.</p>
      )}

      {canManage && (
        <div className="reminder-task-actions">
          <button type="button" className="ghost-button" onClick={() => onEdit(post)}>
            Modifier
          </button>
          <button type="button" className="danger-button" onClick={() => onDelete(post._id)}>
            Supprimer
          </button>
        </div>
      )}
    </>
  );
};

const SortableReminderCard = ({ post, canManage, onEdit, onDelete }: ReminderTaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post._id,
    disabled: !canManage,
    data: {
      type: "post",
      postId: post._id,
      status: post.status || "todo",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = canManage ? (
    <button
      type="button"
      className="reminder-drag-handle"
      title="Glisser pour deplacer"
      aria-label={`Deplacer ${post.title}`}
      {...attributes}
      {...listeners}
    >
      <i className="fa-solid fa-grip-lines"></i>
    </button>
  ) : null;

  return (
    <article ref={setNodeRef} style={style} className={`reminder-task-card status-${post.status} ${isDragging ? "is-dragging" : ""}`}>
      <ReminderTaskCardContent post={post} canManage={canManage} onEdit={onEdit} onDelete={onDelete} dragHandle={dragHandle} />
    </article>
  );
};

const ReminderColumn = ({
  status,
  label,
  posts,
  canManagePost,
  onEdit,
  onDelete,
}: {
  status: ReminderPost["status"];
  label: string;
  posts: ReminderPost[];
  canManagePost: (post: ReminderPost) => boolean;
  onEdit: (post: ReminderPost) => void;
  onDelete: (postId: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: getColumnId(status),
    data: {
      type: "column",
      status,
    },
  });

  return (
    <section className={`reminder-column column-${status} ${isOver ? "is-over" : ""}`}>
      <div className="reminder-column-head">
        <div>
          <p className="eyebrow">Statut</p>
          <h2>{label}</h2>
        </div>
        <span className="reminder-column-count">{posts.length}</span>
      </div>

      <div ref={setNodeRef} className={`reminder-column-list ${isOver ? "is-over" : ""}`}>
        <SortableContext items={posts.map((post) => post._id)} strategy={verticalListSortingStrategy}>
          {posts.length === 0 ? (
            <div className="reminder-column-empty">Deposez une tache ici.</div>
          ) : (
            posts.map((post) => (
              <SortableReminderCard
                key={post._id}
                post={post}
                canManage={canManagePost(post)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
};

const ReminderTab = () => {
  const { reminderPosts, setReminderPosts } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const canWrite = canUserWrite(user);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<ReminderPostPayload>(EMPTY_EDITOR);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const latestLoadRequestRef = useRef(0);
  const reminderVersionRef = useRef(0);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 160,
        tolerance: 8,
      },
    })
  );

  const loadReminderPosts = async (expectedVersion: number = reminderVersionRef.current) => {
    const requestId = ++latestLoadRequestRef.current;
    const data = await getPosts();

    if (requestId !== latestLoadRequestRef.current || expectedVersion !== reminderVersionRef.current) {
      return;
    }

    const orderedPosts = [...data.posts].sort(compareByManualOrder);
    setReminderPosts(orderedPosts);
  };

  useEffect(() => {
    loadReminderPosts().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Erreur lors du chargement des taches");
    });
  }, []);

  const updateEditor = <K extends keyof ReminderPostPayload>(key: K, value: ReminderPostPayload[K]) => {
    setEditor((previousState) => ({
      ...previousState,
      [key]: value,
    }));
  };

  const resetEditor = () => {
    setEditor(EMPTY_EDITOR);
    setEditingId(null);
  };

  const handleEdit = (post: ReminderPost) => {
    if (!canWrite) {
      return;
    }

    setEditingId(post._id);
    setEditor(toPayload(post));
  };

  const canManagePost = (post: ReminderPost): boolean => {
    return canWrite && (post.user === user.id || isUserAdmin(user));
  };

  const handleSubmit = async () => {
    if (!canWrite) {
      return;
    }

    await handleAsyncOperation(async () => {
      if (editingId) {
        const response = await updatePost(editingId, editor);
        await loadReminderPosts();
        if (response.success) {
          setSuccess(response.success);
        }
      } else {
        const response = await createPost(editor);
        await loadReminderPosts();
        if (response.success) {
          setSuccess(response.success);
        }
      }

      resetEditor();
    }, null);
  };

  const handleDelete = async (postId: string) => {
    if (!canWrite) {
      return;
    }

    if (!confirm("Confirmer la suppression de cette tache ?")) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await deletePost(postId);
      await loadReminderPosts();
      if (response.success) {
        setSuccess(response.success);
      }
    }, null);
  };

  const buildReorderedPosts = (
    currentPosts: ReminderPost[],
    activeId: string,
    overId: string
  ): { nextPosts: ReminderPost[]; activePost: ReminderPost | null; destinationStatus: ReminderPost["status"] | null } => {
    const orderedPosts = [...currentPosts].sort(compareByManualOrder);
    const activePost = orderedPosts.find((post) => post._id === activeId);

    if (!activePost) {
      return { nextPosts: orderedPosts, activePost: null, destinationStatus: null };
    }

    const sourceStatus = activePost.status || "todo";
    const postsByStatusMap: Record<ReminderPost["status"], ReminderPost[]> = {
      todo: orderedPosts.filter((post) => post._id !== activeId && (post.status || "todo") === "todo"),
      doing: orderedPosts.filter((post) => post._id !== activeId && (post.status || "todo") === "doing"),
      done: orderedPosts.filter((post) => post._id !== activeId && (post.status || "todo") === "done"),
    };

    if (isColumnId(overId)) {
      const destinationStatus = getStatusFromColumnId(overId);
      postsByStatusMap[destinationStatus].push({ ...activePost, status: destinationStatus });

      const nextPosts = STATUS_OPTIONS.flatMap((option) => postsByStatusMap[option.value]).map((post, index) => ({
        ...post,
        sortOrder: index,
      }));

      return { nextPosts, activePost, destinationStatus };
    }

    const overPost = orderedPosts.find((post) => post._id === overId);

    if (!overPost) {
      return { nextPosts: orderedPosts, activePost, destinationStatus: sourceStatus };
    }

    const destinationStatus = overPost.status || "todo";

    if (destinationStatus === sourceStatus) {
      const sourcePosts = orderedPosts.filter((post) => (post.status || "todo") === sourceStatus);
      const activeIndex = sourcePosts.findIndex((post) => post._id === activeId);
      const overIndex = sourcePosts.findIndex((post) => post._id === overId);

      if (activeIndex === -1 || overIndex === -1) {
        return { nextPosts: orderedPosts, activePost, destinationStatus };
      }

      postsByStatusMap[sourceStatus] = arrayMove(sourcePosts, activeIndex, overIndex);
    } else {
      const destinationPosts = postsByStatusMap[destinationStatus];
      const overIndex = destinationPosts.findIndex((post) => post._id === overId);
      const insertIndex = overIndex === -1 ? destinationPosts.length : overIndex;
      destinationPosts.splice(insertIndex, 0, { ...activePost, status: destinationStatus });
    }

    const nextPosts = STATUS_OPTIONS.flatMap((option) => postsByStatusMap[option.value]).map((post, index) => ({
      ...post,
      sortOrder: index,
    }));

    return { nextPosts, activePost, destinationStatus };
  };

  const orderedPosts = [...reminderPosts].sort(compareByManualOrder);
  const postsByStatus: Record<ReminderPost["status"], ReminderPost[]> = {
    todo: [],
    doing: [],
    done: [],
  };

  orderedPosts.forEach((post) => {
    postsByStatus[post.status || "todo"].push(post);
  });

  const todoCount = postsByStatus.todo.length;
  const doingCount = postsByStatus.doing.length;
  const doneCount = postsByStatus.done.length;
  const activeDragPost = activeDragId ? orderedPosts.find((post) => post._id === activeDragId) || null : null;

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const activePost = orderedPosts.find((post) => post._id === activeId);

    if (!activePost || !canManagePost(activePost)) {
      setActiveDragId(null);
      return;
    }

    setActiveDragId(activeId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    const activeId = String(event.active.id);
    setActiveDragId(null);

    if (!overId || activeId === overId) {
      return;
    }

    const { nextPosts, activePost, destinationStatus } = buildReorderedPosts(orderedPosts, activeId, overId);

    if (!activePost || !destinationStatus) {
      return;
    }

    const hasChanged =
      nextPosts.map((post) => post._id).join(",") !== orderedPosts.map((post) => post._id).join(",") ||
      (activePost.status || "todo") !== destinationStatus;

    if (!hasChanged) {
      return;
    }

    const previousPosts = orderedPosts;
    const nextReminderVersion = reminderVersionRef.current + 1;
    reminderVersionRef.current = nextReminderVersion;
    setReminderPosts(nextPosts);

    await handleAsyncOperation(async () => {
      if ((activePost.status || "todo") !== destinationStatus) {
        await updatePost(activePost._id, {
          ...toPayload(activePost),
          status: destinationStatus,
        });
      }

      await reorderPosts(nextPosts.map((post) => post._id));
      await loadReminderPosts(nextReminderVersion);
      setSuccess("Tache deplacee");
    }, null).catch(async () => {
      setReminderPosts(previousPosts);
      await loadReminderPosts(nextReminderVersion).catch(() => undefined);
    });
  };

  return (
    <section className="card reminder-card-shell">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <div className="reminder-hero">
        <div>
          <h1 className="title reminder-title">Liste de taches partagee</h1>
        </div>

        <div className="reminder-stats">
          <div className="reminder-stat">
            <span className="reminder-stat-value">{todoCount}</span>
            <span className="reminder-stat-label">A faire</span>
          </div>
          <div className="reminder-stat">
            <span className="reminder-stat-value">{doingCount}</span>
            <span className="reminder-stat-label">En cours</span>
          </div>
          <div className="reminder-stat">
            <span className="reminder-stat-value">{doneCount}</span>
            <span className="reminder-stat-label">Termine</span>
          </div>
        </div>
      </div>

      <div className="reminder-layout">
        <aside className="reminder-editor">
          <div className="reminder-panel-head">
            <div>
              <p className="eyebrow">Edition</p>
              <h2>{editingId ? "Modifier la tache" : "Nouvelle tache"}</h2>
            </div>
            {editingId && (
              <button className="ghost-button" onClick={resetEditor}>
                Annuler
              </button>
            )}
          </div>

          <div className="reminder-form-grid">
            <label className="reminder-field">
              <span>Titre</span>
              <input
                className="input"
                disabled={!canWrite}
                value={editor.title}
                onChange={(event) => updateEditor("title", event.target.value)}
                placeholder="Ex: appeler le plombier"
              />
            </label>

            <label className="reminder-field">
              <span>Notes</span>
              <textarea
                className="input reminder-textarea"
                disabled={!canWrite}
                value={editor.body}
                onChange={(event) => updateEditor("body", event.target.value)}
                placeholder="Infos utiles, pieces a prevoir, contraintes..."
                rows={5}
              />
            </label>

            <div className="reminder-form-row">
              <label className="reminder-field">
                <span>Statut</span>
                <select
                  className="input"
                  disabled={!canWrite}
                  value={editor.status}
                  onChange={(event) => updateEditor("status", event.target.value as ReminderPost["status"])}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="reminder-field">
                <span>Echeance</span>
                <input
                  type="date"
                  className="input compact-native-date-input"
                  disabled={!canWrite}
                  value={editor.dueDate || ""}
                  onChange={(event) => updateEditor("dueDate", event.target.value)}
                />
              </label>
            </div>

            <button className="btn" onClick={handleSubmit} disabled={!canWrite}>
              {editingId ? "Mettre a jour la tache" : "Ajouter a la liste"}
            </button>
          </div>
        </aside>

        <div className="reminder-board">
          {orderedPosts.length === 0 ? (
            <div className="reminder-empty-state">
              <i className="fa-solid fa-list-check"></i>
              <p>Aucune tache pour le moment.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <p className="reminder-order-hint">Glissez une carte pour changer son ordre ou la faire passer dans une autre colonne.</p>

              <div className="reminder-board-columns">
                {STATUS_OPTIONS.map((column) => (
                  <ReminderColumn
                    key={column.value}
                    status={column.value}
                    label={column.label}
                    posts={postsByStatus[column.value]}
                    canManagePost={canManagePost}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {typeof document !== "undefined"
                ? createPortal(
                    <DragOverlay zIndex={999}>
                      {activeDragPost ? (
                        <article className={`reminder-task-card status-${activeDragPost.status} drag-overlay`}>
                          <ReminderTaskCardContent
                            post={activeDragPost}
                            canManage={false}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </article>
                      ) : null}
                    </DragOverlay>,
                    document.body
                  )
                : null}
            </DndContext>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReminderTab;
