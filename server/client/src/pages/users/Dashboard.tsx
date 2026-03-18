import { FormEvent, useEffect, useState } from "react";
import { Alert, Success } from "../../components/index.ts";
import { getEvents } from "../../controllers/CalendarEventsController.ts";
import { getPosts as getReminderPosts } from "../../controllers/ReminderPostsController.ts";
import { getPosts as getShoppingPosts } from "../../controllers/ShoppingPostsController.ts";
import { deleteUserAccount, listUsers, updateUser, updateUserAccess } from "../../controllers/UsersController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useTheme } from "../../contexts/ThemeContext.tsx";
import { useErrorHandler } from "../../hooks/index.ts";
import { ManagedUser, UserRole } from "../../types/index.ts";
import { canUserWrite, getUserRole, getUserRoleLabel, isUserAdmin } from "../../utils/permissions.ts";

interface ProfileStats {
  shoppingLists: number;
  shoppingItems: number;
  openTasks: number;
  overdueTasks: number;
  upcomingEvents: number;
  nextEventLabel: string;
}

const EMPTY_STATS: ProfileStats = {
  shoppingLists: 0,
  shoppingItems: 0,
  openTasks: 0,
  overdueTasks: 0,
  upcomingEvents: 0,
  nextEventLabel: "Aucun evenement a venir",
};

const getBooleanFromString = (bool: string | null): boolean => bool === "true";

const formatEventLabel = (value: Date): string =>
  value.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const Dashboard = () => {
  const { user, setUser } = useApp();
  const { theme } = useTheme();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const [profileForm, setProfileForm] = useState({
    name: user.name || "",
    email: user.email || "",
  });
  const [stats, setStats] = useState<ProfileStats>(EMPTY_STATS);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState<boolean>(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    setProfileForm({
      name: user.name || "",
      email: user.email || "",
    });
  }, [user.email, user.name]);

  useEffect(() => {
    let isMounted = true;

    const loadProfileStats = async () => {
      setIsLoadingStats(true);

      try {
        const [shoppingData, reminderData, calendarData] = await Promise.all([
          getShoppingPosts(),
          getReminderPosts(),
          getEvents(),
        ]);

        if (!isMounted) {
          return;
        }

        const shoppingLists = shoppingData.posts.length;
        const shoppingItems = shoppingData.posts.reduce((total, day) => total + day.shoppingList.length, 0);
        const openTasks = reminderData.posts.filter((post) => post.status !== "done").length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueTasks = reminderData.posts.filter((post) => {
          if (post.status === "done" || !post.dueDate) {
            return false;
          }

          const dueDate = new Date(post.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return !Number.isNaN(dueDate.getTime()) && dueDate < today;
        }).length;

        const upcomingEvents = calendarData.events
          .map((event) => new Date(event.date))
          .filter((eventDate) => !Number.isNaN(eventDate.getTime()) && eventDate >= new Date())
          .sort((a, b) => a.getTime() - b.getTime());

        setStats({
          shoppingLists,
          shoppingItems,
          openTasks,
          overdueTasks,
          upcomingEvents: upcomingEvents.length,
          nextEventLabel: upcomingEvents[0] ? formatEventLabel(upcomingEvents[0]) : "Aucun evenement a venir",
        });
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Impossible de charger le profil");
        }
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    };

    void loadProfileStats();

    return () => {
      isMounted = false;
    };
  }, [setError]);

  const isAdmin = isUserAdmin(user);
  const canWrite = canUserWrite(user);

  useEffect(() => {
    if (!isAdmin) {
      setManagedUsers([]);
      return;
    }

    let isMounted = true;

    const loadManagedUsers = async () => {
      setIsLoadingUsers(true);

      try {
        const users = await listUsers();

        if (isMounted) {
          setManagedUsers(users);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Impossible de charger les comptes");
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    };

    void loadManagedUsers();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, setError]);

  const displayName = user.name?.trim() || "Utilisateur";
  const displayEmail = user.email?.trim() || "Aucune adresse email";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");
  const roleLabel = getUserRoleLabel(user);
  const themeLabel = theme === "dark" ? "Sombre" : "Clair";
  const notificationsEnabled = getBooleanFromString(user.receiveEmail);
  const isProfileDirty =
    profileForm.name.trim() !== (user.name || "") || profileForm.email.trim() !== (user.email || "");

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canWrite) {
      setError("Ce compte est en lecture seule");
      return;
    }

    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();

    if (!trimmedName || !trimmedEmail) {
      setError("Le nom et l'email sont obligatoires");
      return;
    }

    setIsSavingProfile(true);

    try {
      await handleAsyncOperation(async () => {
        await updateUser({ name: trimmedName, email: trimmedEmail });
        setUser({
          ...user,
          name: trimmedName,
          email: trimmedEmail,
        });
        setProfileForm({
          name: trimmedName,
          email: trimmedEmail,
        });
      }, "Profil mis a jour");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCheckboxMailChange = async () => {
    if (!canWrite) {
      setError("Ce compte est en lecture seule");
      return;
    }

    const nextValue = !notificationsEnabled;
    const previousUser = user;

    setIsUpdatingNotifications(true);
    setUser({
      ...user,
      receiveEmail: nextValue ? "true" : "false",
    });

    try {
      await handleAsyncOperation(async () => {
        await updateUser({ receiveEmail: nextValue });
      }, nextValue ? "Notifications email activees" : "Notifications email desactivees");
    } catch {
      setUser(previousUser);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleManagedUserAccessChange = async (managedUser: ManagedUser, role: UserRole) => {
    setUpdatingUserId(managedUser.id);

    try {
      await handleAsyncOperation(async () => {
        const updatedUser = await updateUserAccess(managedUser.id, role);

        if (updatedUser) {
          setManagedUsers((currentUsers) =>
            currentUsers.map((currentUser) => (currentUser.id === managedUser.id ? updatedUser : currentUser))
          );
        }
      }, "Niveau d'acces mis a jour");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleManagedUserDelete = async (managedUser: ManagedUser) => {
    if (!confirm(`Supprimer le compte de ${managedUser.email} ?`)) {
      return;
    }

    setDeletingUserId(managedUser.id);

    try {
      await handleAsyncOperation(async () => {
        await deleteUserAccount(managedUser.id);
        setManagedUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== managedUser.id));
      }, "Compte supprime");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <section className="card profile-shell">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <div className="profile-hero">
        <div className="profile-avatar">{initials || "U"}</div>

        <div className="profile-copy">
          <p className="eyebrow">Compte</p>
          <h1 className="title profile-title">Profil utilisateur</h1>
          <p className="profile-subtitle">Retrouve tes informations, tes preferences et un resume rapide de ton espace.</p>
        </div>

        <div className="profile-meta">
          <span className="profile-pill">{roleLabel}</span>
          <span className="profile-pill">Theme {themeLabel.toLowerCase()}</span>
        </div>
      </div>

      {!canWrite && (
        <div className="profile-lock-banner">
          <strong>Compte en lecture seule</strong>
          <p>Les champs de modification sont desactives sur les pages de l'application pour ce compte.</p>
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-main">
          <section className="profile-panel">
            <div className="profile-panel-head">
              <div>
                <p className="eyebrow">Identite</p>
                <h2>Informations du compte</h2>
              </div>
            </div>

            <div className="profile-summary-grid">
              <div className="profile-summary-card">
                <span className="profile-summary-label">Nom actuel</span>
                <strong className="profile-summary-value">{displayName}</strong>
              </div>
              <div className="profile-summary-card">
                <span className="profile-summary-label">Email</span>
                <strong className="profile-summary-value profile-summary-value-email" title={displayEmail}>
                  {displayEmail}
                </strong>
              </div>
              <div className="profile-summary-card">
                <span className="profile-summary-label">Notifications</span>
                <strong className="profile-summary-value">{notificationsEnabled ? "Activees" : "Desactivees"}</strong>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <label className="profile-field">
                <span>Nom</span>
                <input
                  className="input"
                  value={profileForm.name}
                  disabled={!canWrite || isSavingProfile}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ton nom"
                />
              </label>

              <label className="profile-field">
                <span>Email</span>
                <input
                  type="email"
                  className="input"
                  value={profileForm.email}
                  disabled={!canWrite || isSavingProfile}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Adresse email"
                />
              </label>

              <div className="profile-form-actions">
                <button className="btn profile-save-button" disabled={!canWrite || !isProfileDirty || isSavingProfile}>
                  {isSavingProfile ? "Enregistrement..." : "Mettre a jour le profil"}
                </button>
              </div>
            </form>
          </section>

          {isAdmin && (
            <section className="profile-panel">
              <div className="profile-panel-head">
                <div>
                  <p className="eyebrow">Administration</p>
                  <h2>Gestion des comptes</h2>
                </div>
                <span className="profile-pill">{managedUsers.length} compte(s)</span>
              </div>

              <p className="profile-admin-copy">
                Les admins voient tous les comptes. Tu peux passer un membre en admin, readonly ou writable, puis supprimer les comptes non-admin.
              </p>

              {isLoadingUsers ? (
                <p className="profile-loading-copy">Chargement des comptes...</p>
              ) : (
                <div className="profile-user-list">
                  {managedUsers.map((managedUser) => {
                    const isCurrentUser = managedUser.id === user.id;
                    const currentRole = getUserRole(managedUser);

                    return (
                      <article key={managedUser.id} className={`profile-user-card ${managedUser.isAdmin ? "is-admin" : ""}`}>
                        <div className="profile-user-copy">
                          <strong>{managedUser.name}</strong>
                          <p>{managedUser.email}</p>
                        </div>

                        <div className="profile-user-controls">
                          <span className="profile-pill">{getUserRoleLabel(managedUser)}</span>

                          <label className="profile-user-field">
                            <span>Acces</span>
                            <select
                              className="input"
                              value={currentRole}
                              disabled={isCurrentUser || updatingUserId === managedUser.id}
                              onChange={(event) =>
                                void handleManagedUserAccessChange(
                                  managedUser,
                                  event.target.value as UserRole
                                )
                              }
                            >
                              <option value="admin">Admin</option>
                              <option value="writable">Writable</option>
                              <option value="readonly">Readonly</option>
                            </select>
                          </label>

                          <button
                            type="button"
                            className="danger-button"
                            disabled={managedUser.isAdmin || isCurrentUser || deletingUserId === managedUser.id}
                            onClick={() => void handleManagedUserDelete(managedUser)}
                          >
                            {deletingUserId === managedUser.id ? "Suppression..." : "Supprimer"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="profile-side">
          <section className="profile-panel">
            <div className="profile-panel-head">
              <div>
                <p className="eyebrow">Preferences</p>
                <h2>Communication</h2>
              </div>
            </div>

            <label className={`profile-toggle-card ${!canWrite ? "is-disabled" : ""}`}>
              <div>
                <strong>Recevoir les emails de l'application</strong>
                <p>Active un rappel par email quand l'application envoie des notifications utiles.</p>
              </div>
              <input
                className="checkbox-theme"
                type="checkbox"
                checked={notificationsEnabled}
                disabled={!canWrite || isUpdatingNotifications}
                onChange={handleCheckboxMailChange}
              />
            </label>
          </section>

          <section className="profile-panel">
            <div className="profile-panel-head">
              <div>
                <p className="eyebrow">Vue d'ensemble</p>
                <h2>Resume du foyer</h2>
              </div>
            </div>

            {isLoadingStats ? (
              <p className="profile-loading-copy">Chargement des statistiques...</p>
            ) : (
              <>
                <div className="profile-stats-grid">
                  <article className="profile-stat-card">
                    <span className="profile-stat-value">{stats.shoppingLists}</span>
                    <span className="profile-stat-label">Listes shopping</span>
                  </article>
                  <article className="profile-stat-card">
                    <span className="profile-stat-value">{stats.shoppingItems}</span>
                    <span className="profile-stat-label">Articles a acheter</span>
                  </article>
                  <article className="profile-stat-card">
                    <span className="profile-stat-value">{stats.openTasks}</span>
                    <span className="profile-stat-label">Taches ouvertes</span>
                  </article>
                  <article className="profile-stat-card">
                    <span className="profile-stat-value">{stats.overdueTasks}</span>
                    <span className="profile-stat-label">Taches en retard</span>
                  </article>
                </div>

                <div className="profile-highlight-card">
                  <span className="profile-summary-label">Prochain evenement</span>
                  <strong>{stats.nextEventLabel}</strong>
                  <p>{stats.upcomingEvents} evenement(s) a venir dans le calendrier</p>
                </div>
              </>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
};

export default Dashboard;
