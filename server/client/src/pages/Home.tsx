import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, OverviewHero } from "../components/index.ts";
import { getNonoData } from "../controllers/NonoController.ts";
import { getPosts as getReminderPosts } from "../controllers/ReminderPostsController.ts";
import { getPosts as getShoppingPosts } from "../controllers/ShoppingPostsController.ts";
import { getTacoData } from "../controllers/TacoController.ts";
import { useApp } from "../contexts/AppContext.tsx";
import type { ReminderPost } from "../types/index.ts";
import { parseStoredDate, startOfDay } from "../utils/dateUtils.ts";
import "../style/home.css";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const parseTaskDate = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
};

const formatLongDate = (date: Date): string =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

const formatRelativeDate = (date: Date): string => {
  const today = startOfDay(new Date());
  const days = Math.round((startOfDay(date).getTime() - today.getTime()) / DAY_IN_MS);

  if (days < -1) return `En retard de ${Math.abs(days)} jours`;
  if (days === -1) return "En retard d’un jour";
  if (days === 0) return "Aujourd’hui";
  if (days === 1) return "Demain";
  return `Dans ${days} jours`;
};

const priorityLabels = ["Normale", "À surveiller", "Importante", "Urgente"];

const Home = () => {
  const {
    user,
    shoppingItems,
    setShoppingItems,
    reminderPosts,
    setReminderPosts,
    taco,
    setTaco,
    nono,
    setNono,
  } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        getShoppingPosts(),
        getReminderPosts(),
        getTacoData(),
        getNonoData(),
      ]);

      if (!active) return;

      const [shoppingResult, reminderResult, tacoResult, nonoResult] = results;
      if (shoppingResult.status === "fulfilled") setShoppingItems(shoppingResult.value.posts);
      if (reminderResult.status === "fulfilled") setReminderPosts(reminderResult.value.posts);
      if (tacoResult.status === "fulfilled") setTaco(tacoResult.value);
      if (nonoResult.status === "fulfilled") setNono(nonoResult.value);

      if (results.some((result) => result.status === "rejected")) {
        setError("Certaines informations n’ont pas pu être chargées. Réessaie dans un instant.");
      } else {
        setError(null);
      }
      setLoading(false);
    };

    void loadOverview();
    return () => {
      active = false;
    };
  }, [setNono, setReminderPosts, setShoppingItems, setTaco]);

  const today = startOfDay(new Date());
  const actionableTasks = useMemo(
    () => reminderPosts
      .filter((post) => {
        const dueDate = parseTaskDate(post.dueDate);
        return post.status !== "done" && dueDate && dueDate.getTime() <= today.getTime();
      })
      .sort((left, right) => {
        const dateDifference = (parseTaskDate(left.dueDate)?.getTime() || 0) - (parseTaskDate(right.dueDate)?.getTime() || 0);
        return dateDifference || right.priorityColor - left.priorityColor;
      }),
    [reminderPosts, today.getTime()]
  );

  const shoppingSummary = useMemo(() => shoppingItems
    .map((list) => ({
      id: list._id,
      name: list.name,
      items: list.shoppingList.filter((item) => !item.checked),
    }))
    .filter((list) => list.items.length > 0), [shoppingItems]);
  const shoppingCount = shoppingSummary.reduce((total, list) => total + list.items.length, 0);

  const careItems = useMemo(() => [
    { id: "taco-vermifuge", owner: "Coco", label: "Vermifuge", date: taco.vermifugeReminder, icon: "fa-capsules", path: "/taco" },
    { id: "taco-antipuce", owner: "Coco", label: "Anti-puces", date: taco.antiPuceReminder, icon: "fa-shield-dog", path: "/taco" },
    { id: "taco-vaccine", owner: "Coco", label: "Vaccin annuel", date: taco.annualVaccineReminder, icon: "fa-syringe", path: "/taco" },
    { id: "nono-checkup", owner: "Nono", label: "RDV pédiatre", date: nono.checkupDate, icon: "fa-user-doctor", path: "/nono" },
    { id: "nono-vaccine", owner: "Nono", label: "Vaccin", date: nono.vaccineReminder, icon: "fa-syringe", path: "/nono" },
  ]
    .map((item) => ({ ...item, parsedDate: parseStoredDate(item.date) }))
    .filter((item): item is typeof item & { parsedDate: Date } => Boolean(item.parsedDate))
    .sort((left, right) => left.parsedDate.getTime() - right.parsedDate.getTime()), [nono, taco]);

  const nextCare = careItems[0];
  const overdueTasks = actionableTasks.filter((post) => {
    const date = parseTaskDate(post.dueDate);
    return date && date.getTime() < today.getTime();
  }).length;

  const heroStats = [
    {
      label: "À faire",
      value: actionableTasks.length,
      note: overdueTasks > 0 ? `${overdueTasks} en retard` : "Pour aujourd’hui",
      valueClassName: overdueTasks > 0 ? "is-overdue" : undefined,
    },
    {
      label: "Courses",
      value: shoppingCount,
      note: shoppingCount === 1 ? "Article à acheter" : "Articles à acheter",
    },
    {
      label: "Prochain soin",
      value: nextCare?.label || "Aucun",
      note: nextCare ? `${nextCare.owner} · ${formatRelativeDate(nextCare.parsedDate)}` : "Tout est à jour",
      valueClassName: nextCare && nextCare.parsedDate.getTime() < today.getTime() ? "is-overdue" : undefined,
    },
  ];

  return (
    <section className="card home-shell">
      {error && <Alert msg={error} setMsg={setError} />}

      <OverviewHero
        eyebrow={formatLongDate(today)}
        title={`Bonjour${user.name ? ` ${user.name}` : ""}`}
        subtitle="Voici ce qui mérite ton attention aujourd’hui."
        badgeIcon="fa-house"
        stats={heroStats}
        className="home-hero"
      />

      {loading ? (
        <div className="home-loading" role="status">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Chargement de la journée…</span>
        </div>
      ) : (
        <div className="home-grid">
          <section className="home-panel home-panel-tasks">
            <div className="home-panel-head">
              <div>
                <p className="eyebrow">Aujourd’hui</p>
                <h2>À faire</h2>
              </div>
              <Link to="/reminders" className="home-panel-link">Voir les tâches</Link>
            </div>

            {actionableTasks.length > 0 ? (
              <ul className="home-list">
                {actionableTasks.slice(0, 5).map((post: ReminderPost) => {
                  const dueDate = parseTaskDate(post.dueDate)!;
                  return (
                    <li key={post._id} className="home-list-item">
                      <span className={`home-item-icon priority-${post.priorityColor}`}><i className="fa-solid fa-check"></i></span>
                      <div className="home-item-copy">
                        <strong>{post.title}</strong>
                        <span>{formatRelativeDate(dueDate)}{post.dueTime ? ` · ${post.dueTime}` : ""}</span>
                      </div>
                      <span className="home-item-meta">{priorityLabels[post.priorityColor] || priorityLabels[0]}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="home-empty"><i className="fa-solid fa-mug-hot"></i><p>Rien d’urgent aujourd’hui.</p></div>
            )}
          </section>

          <section className="home-panel">
            <div className="home-panel-head">
              <div>
                <p className="eyebrow">Santé</p>
                <h2>Prochaines échéances</h2>
              </div>
            </div>

            {careItems.length > 0 ? (
              <ul className="home-list">
                {careItems.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <Link to={item.path} className="home-list-item home-list-link">
                      <span className="home-item-icon care"><i className={`fa-solid ${item.icon}`}></i></span>
                      <div className="home-item-copy">
                        <strong>{item.label}</strong>
                        <span>{item.owner} · {formatDate(item.parsedDate)}</span>
                      </div>
                      <span className={`home-date-pill ${item.parsedDate.getTime() < today.getTime() ? "is-overdue" : ""}`}>
                        {formatRelativeDate(item.parsedDate)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="home-empty"><i className="fa-solid fa-heart-circle-check"></i><p>Aucune échéance renseignée.</p></div>
            )}
          </section>

          <section className="home-panel home-panel-shopping">
            <div className="home-panel-head">
              <div>
                <p className="eyebrow">À acheter</p>
                <h2>Courses</h2>
              </div>
              <Link to="/shopping" className="home-panel-link">Ouvrir les courses</Link>
            </div>

            {shoppingCount > 0 ? (
              <div className="home-shopping-lists">
                {shoppingSummary.slice(0, 4).map((list) => (
                  <div key={list.id} className="home-shopping-list">
                    <div>
                      <strong>{list.name}</strong>
                      <span>{list.items.length} article{list.items.length > 1 ? "s" : ""}</span>
                    </div>
                    <p>{list.items.slice(0, 3).map((item) => item.title).join(", ")}{list.items.length > 3 ? "…" : ""}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-empty"><i className="fa-solid fa-basket-shopping"></i><p>La liste de courses est vide.</p></div>
            )}
          </section>
        </div>
      )}
    </section>
  );
};

export default Home;
