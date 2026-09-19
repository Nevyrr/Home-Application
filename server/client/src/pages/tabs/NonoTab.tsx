import { compareDueDates, parseStoredDate, startOfDay } from "../../utils/dateUtils.ts";
import ScheduleCard from "../../components/ScheduleCard.tsx";
import { updateCare } from "../../controllers/CareController.ts";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Alert, OverviewHero, Success } from "../../components/index.ts";
import {
  addWeightEntry,
  deleteWeightEntry,
  getNonoData,
  updateCheckupDate,
  updateNonoNotes,
  updateVaccineDate,
} from "../../controllers/NonoController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { Nono, NonoWeightEntry } from "../../types/index.ts";
import { canUserWrite } from "../../utils/permissions.ts";

const DEFAULT_NONO_BIRTH_DATE = "18/03/2026";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface WeightChartProps {
  entries: NonoWeightEntry[];
}

interface NonoTrackerHistoryProps {
  title: string;
  hasEntries: boolean;
  emptyMessage: string;
  children: ReactNode;
}

interface NonoTrackerPanelProps {
  title: string;
  icon: string;
  accentClass: string;
  panelClassName?: string;
  chartTitle: string;
  canWrite: boolean;
  submitLabel: string;
  onSubmit: () => void;
  formFields: ReactNode;
  history: NonoTrackerHistoryProps;
  chart: ReactNode;
}

const parseDayEntryDate = (dateString?: string | null): Date | null => {
  if (!dateString) {
    return null;
  }

  const parsedDate = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const toDateInputValue = (date: Date): string => {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const parseDateInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  return parseDayEntryDate(value);
};

const formatDisplayDate = (dateString?: string | null): string => dateString || "A definir";

const formatDayCount = (days: number): string => `${days} jour${days > 1 ? "s" : ""}`;

const formatYearCount = (years: number): string => `${years} an${years > 1 ? "s" : ""}`;

const formatBabyAge = (birthDate: string): string => {
  const parsedBirthDate = parseStoredDate(birthDate || DEFAULT_NONO_BIRTH_DATE);

  if (!parsedBirthDate) {
    return "A renseigner";
  }

  const today = startOfDay(new Date());
  const birthDay = startOfDay(parsedBirthDate);

  if (birthDay.getTime() > today.getTime()) {
    return "Date invalide";
  }

  const diffInDays = Math.floor((today.getTime() - birthDay.getTime()) / DAY_IN_MS);

  let years = today.getFullYear() - birthDay.getFullYear();
  let months = today.getMonth() - birthDay.getMonth();
  let days = today.getDate() - birthDay.getDate();

  if (days < 0) {
    const daysInPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += daysInPreviousMonth;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalMonths = years * 12 + months;

  if (totalMonths === 0) {
    return formatDayCount(diffInDays);
  }

  if (totalMonths < 6) {
    return days > 0 ? `${totalMonths} mois ${formatDayCount(days)}` : `${totalMonths} mois`;
  }

  if (years === 0) {
    return `${totalMonths} mois`;
  }

  if (months === 0) {
    return formatYearCount(years);
  }

  return `${formatYearCount(years)} ${months} mois`;
};

const formatDayDisplay = (dateString?: string | null): string => {
  const parsedDate = parseDayEntryDate(dateString);

  if (!parsedDate) {
    return "A definir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
};

const formatShortDayLabel = (dateString: string): string => {
  const parsedDate = parseDayEntryDate(dateString);

  if (!parsedDate) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsedDate);
};

const getDayMs = (dateString?: string | null): number => parseDayEntryDate(dateString)?.getTime() || 0;

const pickAxisEntries = <T,>(entries: T[]): T[] => {
  if (entries.length <= 3) {
    return entries;
  }

  return [0, Math.floor((entries.length - 1) / 2), entries.length - 1]
    .map((index) => entries[index])
    .filter((entry, index, array) => array.indexOf(entry) === index);
};

const formatWeightKg = (weightKg?: number | null): string => {
  if (typeof weightKg !== "number" || Number.isNaN(weightKg)) {
    return "A definir";
  }

  return `${weightKg.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
  })} kg`;
};

const getNextMilestone = (nono: Nono): { label: string; date: string; overdue: boolean } | null => {
  const entries = [
    { label: "RDV pediatre", date: nono.checkupDate },
    { label: "Vaccin", date: nono.vaccineReminder },
  ]
    .map((entry) => ({
      ...entry,
      parsedDate: parseStoredDate(entry.date),
    }))
    .filter((entry): entry is { label: string; date: string; parsedDate: Date } => Boolean(entry.parsedDate));

  if (entries.length === 0) {
    return null;
  }

  const next = entries.sort((left, right) => compareDueDates(left.date, right.date))[0];
  return {
    label: next.label,
    date: next.date,
    overdue: startOfDay(next.parsedDate).getTime() < startOfDay(new Date()).getTime(),
  };
};

const WeightChart = ({ entries }: WeightChartProps) => {
  if (entries.length === 0) {
    return <p className="nono-chart-empty">Ajoutez une premiere pesee pour afficher la courbe du poids.</p>;
  }

  const orderedEntries = [...entries].sort((a, b) => getDayMs(a.date) - getDayMs(b.date));
  const values = orderedEntries.map((entry) => entry.weightKg);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const lowerBound = minValue === maxValue ? Math.max(0, minValue - 0.2) : minValue;
  const upperBound = minValue === maxValue ? maxValue + 0.2 : maxValue;
  const range = Math.max(upperBound - lowerBound, 0.001);
  const pointEntries = orderedEntries.map((entry, index) => {
    const x = orderedEntries.length === 1 ? 50 : (index / (orderedEntries.length - 1)) * 100;
    const y = 88 - ((entry.weightKg - lowerBound) / range) * 58;
    return { entry, x, y };
  });
  const linePoints = pointEntries.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${pointEntries[0].x},92 ${linePoints} ${pointEntries[pointEntries.length - 1].x},92`;
  const tickValues = [upperBound, lowerBound + range / 2, lowerBound].map((value) =>
    Number(value.toFixed(3))
  );
  const axisEntries = pickAxisEntries(orderedEntries);

  return (
    <div className="nono-chart-shell">
      <div className="nono-chart-plot">
        <svg className="nono-weight-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Courbe du poids">
          <defs>
            <linearGradient id="nono-weight-chart-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(77, 182, 141, 0.35)" />
              <stop offset="100%" stopColor="rgba(77, 182, 141, 0.04)" />
            </linearGradient>
          </defs>

          {tickValues.map((tickValue, index) => {
            const y = 88 - ((tickValue - lowerBound) / range) * 58;
            return <line key={`${tickValue}-${index}`} x1="0" x2="100" y1={y} y2={y} className="nono-chart-grid-line" />;
          })}

          <polygon points={areaPoints} className="nono-weight-chart-area" />
          <polyline points={linePoints} className="nono-weight-chart-line" />

          {pointEntries.map((point) => (
            <g key={`${point.entry.date}-${point.entry.weightKg}`}>
              <circle cx={point.x} cy={point.y} r="2.3" className="nono-weight-chart-point-shadow" />
              <circle cx={point.x} cy={point.y} r="1.6" className="nono-weight-chart-point" />
            </g>
          ))}
        </svg>

        <div className="nono-chart-y-axis">
          {tickValues.map((tickValue, index) => (
            <span key={`weight-${tickValue}-${index}`}>{tickValue.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 3 })} kg</span>
          ))}
        </div>
      </div>

      <div className="nono-chart-axis">
        {axisEntries.map((entry, index) => (
          <span key={`${entry.date}-${index}`}>{formatShortDayLabel(entry.date)}</span>
        ))}
      </div>
    </div>
  );
};

const NonoTrackerHistory = ({ title, hasEntries, emptyMessage, children }: NonoTrackerHistoryProps) => (
  <div className="nono-history">
    <h3>{title}</h3>
    <div className="nono-history-body">
      {hasEntries ? children : <p className="nono-history-empty">{emptyMessage}</p>}
    </div>
  </div>
);

const NonoTrackerPanel = ({
  title,
  icon,
  accentClass,
  panelClassName = "",
  chartTitle,
  canWrite,
  submitLabel,
  onSubmit,
  formFields,
  history,
  chart,
}: NonoTrackerPanelProps) => (
  <article className={`nono-schedule-card ${accentClass} nono-tracker-panel ${panelClassName}`.trim()}>
    <div className="nono-tracker-panel-grid">
      <div className="nono-tracker-panel-main">
        <div className="nono-schedule-head">
          <span className="nono-schedule-icon">
            <i className={`fa-solid ${icon}`}></i>
          </span>
          <div>
            <h3>{title}</h3>
          </div>
        </div>

        <form
          className="nono-date-stack nono-tracker-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {formFields}

          <button className="btn nono-submit" type="submit" disabled={!canWrite}>
            {submitLabel}
          </button>
        </form>

        <NonoTrackerHistory {...history} />
      </div>

      <div className="nono-tracker-panel-chart">
        <div className="nono-schedule-head">
          <span className="nono-schedule-icon">
            <i className="fa-solid fa-chart-line"></i>
          </span>
          <div>
            <h3>{chartTitle}</h3>
          </div>
        </div>

        {chart}
      </div>
    </div>
  </article>
);

const NonoTab = () => {
  const { nono, setNono } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const [notesDraft, setNotesDraft] = useState("");
  const [weightDraft, setWeightDraft] = useState("");
  const [weightDateDraft, setWeightDateDraft] = useState(() => toDateInputValue(new Date()));
  const canWrite = canUserWrite(user);

  const saveCare = async (care: string, intervalMonths: number, date?: string) => {
    if (!canWrite) return;
    const response = await updateCare("nono", care, intervalMonths, date);
    setNono((current) => ({ ...current, ...response.record }));
  };

  const loadNono = async () => {
    const data = await getNonoData();
    setNono(data);
  };

  useEffect(() => {
    loadNono().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Erreur lors du chargement de l'espace Nono");
    });
  }, []);

  useEffect(() => {
    setNotesDraft(nono.notes || "");
  }, [nono.notes]);

  const weightEntries = useMemo(
    () => [...(nono.weightEntries || [])].sort((a, b) => getDayMs(b.date) - getDayMs(a.date)),
    [nono.weightEntries]
  );
  const latestWeight = weightEntries[0];
  const weightChartEntries = weightEntries.slice(0, 12).reverse();
  const recentWeightEntries = weightEntries;
  const scheduleCards = [
    {
      key: "checkup",
      title: "RDV pediatre",
      icon: "fa-user-doctor",
      accentClass: "accent-sky",
      primaryLabel: "Date du rendez-vous",
      primaryValue: nono.checkupDate,
      onPrimaryChange: (date: string) => saveDate(updateCheckupDate, date),
      dueDate: nono.checkupDate,
    },
    {
      key: "vaccine",
      title: "Vaccin",
      icon: "fa-syringe",
      accentClass: "accent-apricot",
      primaryLabel: "Date du vaccin",
      primaryValue: nono.vaccineDate,
      onPrimaryChange: (date: string) => saveDate(updateVaccineDate, date),
      secondaryValue: nono.vaccineReminder,
      recurrence: {
        intervalMonths: nono.vaccineIntervalMonths,
        onSave: (months: number, date?: string) => saveCare("vaccine", months, date),
      },
      dueDate: nono.vaccineReminder,
    },
  ]
    .sort((leftCard, rightCard) => compareDueDates(leftCard.dueDate, rightCard.dueDate));
  const nextMilestone = getNextMilestone(nono);

  const saveDate = async (
    updater: (date: string) => Promise<{ success?: string }>,
    date: string
  ) => {
    if (!canWrite) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await updater(date);
      await loadNono();
      if (response.success) {
        setSuccess(response.success);
      }
    }, null).catch(() => undefined);
  };

  const handleSaveNotes = async () => {
    if (!canWrite) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await updateNonoNotes(notesDraft);
      await loadNono();
      if (response.success) {
        setSuccess(response.success);
      }
    }, null).catch(() => undefined);
  };

  const handleAddWeight = async () => {
    if (!canWrite) {
      return;
    }

    const parsedWeightKg = Number(weightDraft.replace(",", "."));
    const parsedDate = parseDateInput(weightDateDraft);

    await handleAsyncOperation(async () => {
      if (!Number.isFinite(parsedWeightKg) || parsedWeightKg <= 0) {
        throw new Error("Indiquez un poids valide en kg");
      }

      if (!parsedDate || !weightDateDraft) {
        throw new Error("Indiquez une date valide pour le poids");
      }

      const response = await addWeightEntry(weightDateDraft, parsedWeightKg);
      await loadNono();
      setWeightDateDraft(toDateInputValue(new Date()));
      setWeightDraft("");
      if (response.success) {
        setSuccess(response.success);
      }
    }, null).catch(() => undefined);
  };

  const handleDeleteWeight = async (entryId?: string) => {
    if (!canWrite || !entryId) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await deleteWeightEntry(entryId);
      await loadNono();
      if (response.success) {
        setSuccess(response.success);
      }
    }, null).catch(() => undefined);
  };

  const heroStats = [
    {
      label: "Age",
      value: formatBabyAge(nono.birthDate),
      note: `Date de naissance: ${formatDisplayDate(nono.birthDate)}`,
    },
    {
      label: "Poids",
      value: latestWeight ? formatWeightKg(latestWeight.weightKg) : "A definir",
      note: latestWeight ? `Pesee du ${formatDayDisplay(latestWeight.date)}` : "Ajoutez une premiere pesee",
    },
    {
      label: "Prochaine echeance",
      value: nextMilestone ? nextMilestone.label : "Aucune",
      valueClassName: nextMilestone?.overdue ? "is-overdue" : undefined,
      note: nextMilestone
        ? `${nextMilestone.overdue ? "En retard depuis" : "Le"} ${formatDisplayDate(nextMilestone.date)}`
        : "Ajoutez une premiere date",
    },
  ];

  return (
    <section className="card nono-shell">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <OverviewHero
        eyebrow="Suivi bebe"
        title="NONO"
        badgeIcon="fa-baby"
        stats={heroStats}
        className="nono-dashboard-hero"
      />

      <section className="nono-panel nono-schedule-panel">
        <div className="nono-panel-head">
          <div>
            <p className="eyebrow">Suivi quotidien</p>
            <h2>Suivi du poids</h2>
          </div>
        </div>

        <div className="nono-tracker-grid">
          <NonoTrackerPanel
            title="Poids"
            icon="fa-weight-scale"
            accentClass="accent-mint"
            panelClassName="nono-weight-panel"
            chartTitle="Evolution du poids"
            canWrite={canWrite}
            submitLabel="Ajouter le poids"
            onSubmit={() => {
              void handleAddWeight();
            }}
            formFields={
              <div className="nono-form-grid">
                <label className="nono-field">
                  <span>Poids exact (kg)</span>
                  <input
                    className="input"
                    type="text"
                    inputMode="decimal"
                    value={weightDraft}
                    disabled={!canWrite}
                    onChange={(event) => setWeightDraft(event.target.value)}
                    placeholder="Ex: 4.325"
                  />
                </label>

                <label className="nono-field">
                  <span>Date de la pesee</span>
                  <input
                    className="input compact-native-date-input"
                    type="date"
                    value={weightDateDraft}
                    disabled={!canWrite}
                    onChange={(event) => setWeightDateDraft(event.target.value)}
                  />
                </label>
              </div>
            }
            history={{
              title: "Dernieres pesees",
              hasEntries: recentWeightEntries.length > 0,
              emptyMessage: "Aucune pesee enregistree pour le moment.",
              children: (
                <ul className="nono-history-list">
                  {recentWeightEntries.map((entry, index) => (
                    <li key={entry._id || `${entry.date}-${entry.weightKg}-${index}`} className="nono-history-item">
                      <div className="nono-history-main">
                        <strong>{formatWeightKg(entry.weightKg)}</strong>
                        <span>{formatDayDisplay(entry.date)}</span>
                      </div>
                      <button
                        className="icon-button nono-history-delete"
                        type="button"
                        title="Supprimer le poids"
                        aria-label="Supprimer le poids"
                        disabled={!canWrite || !entry._id}
                        onClick={() => void handleDeleteWeight(entry._id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              ),
            }}
            chart={<WeightChart entries={weightChartEntries} />}
          />
        </div>
      </section>

      <section className="nono-panel">
        <div className="nono-panel-head">
          <div>
            <p className="eyebrow">Santé et suivi</p>
            <h2>Les prochaines dates à ne pas rater</h2>
          </div>
        </div>

        <div className="nono-card-grid">
          {scheduleCards.map(({ key, dueDate: _dueDate, ...card }) => (
            <ScheduleCard key={key} {...card} disabled={!canWrite} />
          ))}
        </div>
      </section>

      <section className="nono-panel">
        <div className="nono-panel-head">
          <div>
            <p className="eyebrow">Pense-bete</p>
            <h2>Questions et notes utiles</h2>
          </div>
        </div>

        <textarea
          className="input nono-notes"
          value={notesDraft}
          disabled={!canWrite}
          onChange={(event) => setNotesDraft(event.target.value)}
          rows={7}
          placeholder="Ex: questions pour le prochain rendez-vous, choses a acheter, infos a transmettre a la nounou..."
        />

        <div className="nono-note-actions">
          <p className="nono-note-hint">Astuce: gardez ici les questions a poser plutot que de les chercher au dernier moment.</p>
          <button className="btn" onClick={() => void handleSaveNotes()} disabled={!canWrite}>
            Enregistrer le pense-bete
          </button>
        </div>
      </section>
    </section>
  );
};

export default NonoTab;
