import { useEffect, useState } from "react";
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

const STATUS_OPTIONS: Array<{ value: ReminderPost["status"]; label: string }> = [
  { value: "todo", label: "A faire" },
  { value: "doing", label: "En cours" },
  { value: "done", label: "Termine" },
];

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

const ReminderTab = () => {
  const { reminderPosts, setReminderPosts } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<ReminderPostPayload>(EMPTY_EDITOR);

  const loadReminderPosts = async () => {
    const data = await getPosts();
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
    setEditingId(post._id);
    setEditor(toPayload(post));
  };

  const canManagePost = (post: ReminderPost): boolean => {
    return post.user === user.id || user.isAdmin === "true";
  };

  const handleSubmit = async () => {
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

  const handleStatusChange = async (post: ReminderPost, status: ReminderPost["status"]) => {
    await handleAsyncOperation(async () => {
      const response = await updatePost(post._id, {
        ...toPayload(post),
        status,
      });
      await loadReminderPosts();
      if (response.success) {
        setSuccess(response.success);
      }
    }, null);
  };

  const handleMove = async (postId: string, direction: "up" | "down") => {
    const orderedPosts = [...reminderPosts].sort(compareByManualOrder);
    const currentIndex = orderedPosts.findIndex((post) => post._id === postId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= orderedPosts.length) {
      return;
    }

    const nextPosts = [...orderedPosts];
    const [movedPost] = nextPosts.splice(currentIndex, 1);
    nextPosts.splice(targetIndex, 0, movedPost);

    await handleAsyncOperation(async () => {
      await reorderPosts(nextPosts.map((post) => post._id));
      await loadReminderPosts();
      setSuccess("Ordre des taches mis a jour");
    }, null);
  };

  const orderedPosts = [...reminderPosts].sort(compareByManualOrder);
  const todoCount = reminderPosts.filter((post) => post.status === "todo").length;
  const doingCount = reminderPosts.filter((post) => post.status === "doing").length;
  const doneCount = reminderPosts.filter((post) => post.status === "done").length;

  return (
    <section className="card reminder-card-shell">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <div className="reminder-hero">
        <div>
          <h1 className="title reminder-title">Todo list partagee</h1>
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
                value={editor.title}
                onChange={(event) => updateEditor("title", event.target.value)}
                placeholder="Ex: appeler le plombier"
              />
            </label>

            <label className="reminder-field">
              <span>Notes</span>
              <textarea
                className="input reminder-textarea"
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
                  className="input"
                  value={editor.dueDate || ""}
                  onChange={(event) => updateEditor("dueDate", event.target.value)}
                />
              </label>
            </div>

            <button className="btn" onClick={handleSubmit}>
              {editingId ? "Mettre a jour la tache" : "Ajouter a la todo list"}
            </button>
          </div>
        </aside>

        <div className="reminder-board">
          <div className="reminder-task-list">
            {orderedPosts.length === 0 ? (
              <div className="reminder-empty-state">
                <i className="fa-solid fa-list-check"></i>
                <p>Aucune tache pour le moment.</p>
              </div>
            ) : (
              orderedPosts.map((post, index) => {
                const canManage = canManagePost(post);

                return (
                  <article key={post._id} className={`reminder-task-card status-${post.status}`}>
                    <div className="reminder-task-top">
                      <div className="reminder-rank-badge">{index + 1}</div>
                      <div className="reminder-task-main">
                        <div className="reminder-task-meta">
                          <span>{post.username}</span>
                          <span className="meta-separator">|</span>
                          <span>{formatDueDate(post.dueDate)}</span>
                        </div>
                        <h3>{post.title}</h3>
                        {post.body ? <p>{post.body}</p> : <p className="muted-copy">Aucune note ajoutee.</p>}
                      </div>

                      <div className="reminder-status-stack">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            className={`status-chip ${post.status === option.value ? "active" : ""}`}
                            disabled={!canManage}
                            onClick={() => handleStatusChange(post, option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {canManage && (
                      <div className="reminder-task-actions">
                        <button
                          className="icon-button"
                          onClick={() => handleMove(post._id, "up")}
                          disabled={index === 0}
                          title="Monter"
                        >
                          <i className="fa-solid fa-arrow-up"></i>
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleMove(post._id, "down")}
                          disabled={index === orderedPosts.length - 1}
                          title="Descendre"
                        >
                          <i className="fa-solid fa-arrow-down"></i>
                        </button>
                        <button className="ghost-button" onClick={() => handleEdit(post)}>
                          Modifier
                        </button>
                        <button className="danger-button" onClick={() => handleDelete(post._id)}>
                          Supprimer
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReminderTab;
