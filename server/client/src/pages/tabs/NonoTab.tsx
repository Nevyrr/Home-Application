import { ReactNode, useEffect, useMemo, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { Alert, OverviewHero, Success } from "../../components/index.ts";
import {
  addBottleEntry,
  addWeightEntry,
  deleteBottleEntry,
  deleteWeightEntry,
  getNonoData,
  updateAdministrativeReminder,
  updateCheckupDate,
  updateCheckupReminder,
  updateNonoNotes,
  updateVaccineDate,
  updateVaccineReminder,
  updateVitaminReminder,
} from "../../controllers/NonoController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { Nono, NonoBottleEntry, NonoWeightEntry } from "../../types/index.ts";
import { canUserWrite } from "../../utils/permissions.ts";

registerLocale("fr", fr);

const DEFAULT_NONO_BIRTH_DATE = "18/03/2026";
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_BOTTLE_CHART_POINTS = 50;

interface NonoScheduleCardProps {
  title: string;
  icon: string;
  accentClass: string;
  description?: string;
  primaryLabel: string;
  primaryValue: string;
  onPrimaryChange: (date: string) => Promise<void>;
  secondaryLabel?: string;
  secondaryValue?: string;
  onSecondaryChange?: (date: string) => Promise<void>;
  disabled?: boolean;
}

interface WeightChartProps {
  entries: NonoWeightEntry[];
}

interface DailyBottleChartEntry {
  date: string;
  amountMl: number;
  bottleCount: number;
}

interface BottleChartProps {
  entries: DailyBottleChartEntry[];
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

const parseStoredDate = (dateString?: string | null): Date | null => {
  if (!dateString) {
    return null;
  }

  const [day, month, year] = dateString.split("/");

  if (!day || !month || !year) {
    return null;
  }

  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const parseDayEntryDate = (dateString?: string | null): Date | null => {
  if (!dateString) {
    return null;
  }

  const parsedDate = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const parsePreciseTimestamp = (timestamp?: string | null): Date | null => {
  if (!timestamp) {
    return null;
  }

  const parsedDate = new Date(timestamp);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const toStoredDate = (date: Date | null): string => {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
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

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

const getTimestampMs = (timestamp?: string | null): number => parsePreciseTimestamp(timestamp)?.getTime() || 0;

const getDayMs = (dateString?: string | null): number => parseDayEntryDate(dateString)?.getTime() || 0;

const getBottleEntryDate = (entry?: NonoBottleEntry | null): string => {
  if (entry?.date) {
    return entry.date;
  }

  const parsedTimestamp = parsePreciseTimestamp(entry?.timestamp);
  return parsedTimestamp ? toDateInputValue(parsedTimestamp) : "";
};

const getBottleEntryDayMs = (entry?: NonoBottleEntry | null): number => getDayMs(getBottleEntryDate(entry));

const compareBottleEntries = (leftEntry: NonoBottleEntry, rightEntry: NonoBottleEntry): number => {
  const dayDifference = getBottleEntryDayMs(rightEntry) - getBottleEntryDayMs(leftEntry);

  if (dayDifference !== 0) {
    return dayDifference;
  }

  return getTimestampMs(rightEntry.timestamp) - getTimestampMs(leftEntry.timestamp);
};

const aggregateBottleEntriesByDay = (entries: NonoBottleEntry[]): DailyBottleChartEntry[] => {
  const groupedEntries = new Map<string, DailyBottleChartEntry>();

  entries.forEach((entry) => {
    const date = getBottleEntryDate(entry);

    if (!date) {
      return;
    }

    const currentDay = groupedEntries.get(date);

    if (currentDay) {
      currentDay.amountMl += entry.amountMl;
      currentDay.bottleCount += 1;
      return;
    }

    groupedEntries.set(date, {
      date,
      amountMl: entry.amountMl,
      bottleCount: 1,
    });
  });

  return [...groupedEntries.values()].sort((a, b) => getDayMs(b.date) - getDayMs(a.date));
};

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
    { label: "RDV pediatre", date: nono.checkupReminder || nono.checkupDate },
    { label: "Vaccin", date: nono.vaccineReminder || nono.vaccineDate },
    { label: "Vitamine", date: nono.vitaminReminder },
    { label: "Demarches", date: nono.administrativeReminder },
  ]
    .map((entry) => ({
      ...entry,
      parsedDate: parseStoredDate(entry.date),
    }))
    .filter((entry): entry is { label: string; date: string; parsedDate: Date } => Boolean(entry.parsedDate));

  if (entries.length === 0) {
    return null;
  }

  const today = startOfDay(new Date());
  const upcoming = entries
    .filter((entry) => startOfDay(entry.parsedDate).getTime() >= today.getTime())
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())[0];

  if (upcoming) {
    return {
      label: upcoming.label,
      date: upcoming.date,
      overdue: false,
    };
  }

  const latestOverdue = entries.sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())[0];

  return {
    label: latestOverdue.label,
    date: latestOverdue.date,
    overdue: true,
  };
};

const getScheduleSortMeta = (dateValues: Array<string | undefined>): { bucket: number; sortValue: number } => {
  const parsedDates = dateValues
    .map((dateValue) => parseStoredDate(dateValue))
    .filter((date): date is Date => Boolean(date))
    .map((date) => startOfDay(date).getTime());

  if (parsedDates.length === 0) {
    return { bucket: 2, sortValue: Number.POSITIVE_INFINITY };
  }

  const todayTimestamp = startOfDay(new Date()).getTime();
  const upcomingDates = parsedDates.filter((timestamp) => timestamp >= todayTimestamp).sort((a, b) => a - b);

  if (upcomingDates.length > 0) {
    return { bucket: 0, sortValue: upcomingDates[0] };
  }

  const closestPastDate = [...parsedDates].sort((a, b) => b - a)[0];
  return { bucket: 1, sortValue: -closestPastDate };
};

const BottleChart = ({ entries }: BottleChartProps) => {
  if (entries.length === 0) {
    return <p className="nono-chart-empty">Ajoutez un premier biberon pour afficher la courbe des quantites par jour.</p>;
  }

  const orderedEntries = [...entries].sort((a, b) => getDayMs(a.date) - getDayMs(b.date));
  const values = orderedEntries.map((entry) => entry.amountMl);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const lowerBound = minValue === maxValue ? Math.max(0, minValue - 20) : minValue;
  const upperBound = minValue === maxValue ? maxValue + 20 : maxValue;
  const range = Math.max(upperBound - lowerBound, 1);
  const pointEntries = orderedEntries.map((entry, index) => {
    const x = orderedEntries.length === 1 ? 50 : (index / (orderedEntries.length - 1)) * 100;
    const y = 88 - ((entry.amountMl - lowerBound) / range) * 58;
    return { entry, x, y };
  });
  const pointRadius = pointEntries.length > 40 ? 1.05 : pointEntries.length > 24 ? 1.25 : 1.6;
  const pointShadowRadius = pointRadius + 0.7;
  const lineStrokeWidth = pointEntries.length > 40 ? 1.2 : pointEntries.length > 24 ? 1.45 : 1.8;
  const linePoints = pointEntries.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${pointEntries[0].x},92 ${linePoints} ${pointEntries[pointEntries.length - 1].x},92`;
  const tickValues = [upperBound, lowerBound + range / 2, lowerBound].map((value) => Math.round(value));
  const axisEntries = pickAxisEntries(orderedEntries);

  return (
    <div className="nono-chart-shell">
      <div className="nono-chart-plot">
        <svg
          className="nono-bottle-chart"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label="Courbe des quantites de biberons par jour"
        >
          <defs>
            <linearGradient id="nono-bottle-chart-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(99, 167, 235, 0.35)" />
              <stop offset="100%" stopColor="rgba(99, 167, 235, 0.04)" />
            </linearGradient>
          </defs>

          {tickValues.map((tickValue, index) => {
            const y = 88 - ((tickValue - lowerBound) / range) * 58;
            return <line key={`${tickValue}-${index}`} x1="0" x2="100" y1={y} y2={y} className="nono-chart-grid-line" />;
          })}

          <polygon points={areaPoints} className="nono-chart-area" />
          <polyline points={linePoints} className="nono-chart-line" strokeWidth={lineStrokeWidth} />

          {pointEntries.map((point) => (
            <g key={point.entry.date}>
              <title>
                {`${formatDayDisplay(point.entry.date)} : ${point.entry.amountMl} mL${point.entry.bottleCount > 1 ? ` (${point.entry.bottleCount} biberons)` : ""}`}
              </title>
              <circle cx={point.x} cy={point.y} r={pointShadowRadius} className="nono-chart-point-shadow" />
              <circle cx={point.x} cy={point.y} r={pointRadius} className="nono-chart-point" />
            </g>
          ))}
        </svg>

        <div className="nono-chart-y-axis">
          {tickValues.map((tickValue, index) => (
            <span key={`label-${tickValue}-${index}`}>{tickValue} mL</span>
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
        <svg className="nono-bottle-chart nono-weight-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Courbe du poids">
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

const NonoScheduleCard = ({
  title,
  icon,
  accentClass,
  description,
  primaryLabel,
  primaryValue,
  onPrimaryChange,
  secondaryLabel,
  secondaryValue,
  onSecondaryChange,
  disabled = false,
}: NonoScheduleCardProps) => (
  <article className={`nono-schedule-card ${accentClass}`}>
    <div className="nono-schedule-head">
      <span className="nono-schedule-icon">
        <i className={`fa-solid ${icon}`}></i>
      </span>
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
    </div>

    <div className="nono-date-stack">
      <label className="nono-field">
        <span>{primaryLabel}</span>
        <DatePicker
          selected={parseStoredDate(primaryValue)}
          onChange={(date: Date | null) => onPrimaryChange(toStoredDate(date))}
          locale="fr"
          dateFormat="P"
          disabled={disabled}
          isClearable
          placeholderText="Choisir une date"
          className="input compact-date-input"
          wrapperClassName="compact-date-picker"
          calendarClassName="theme-datepicker"
          popperClassName="theme-datepicker-popper"
        />
      </label>

      {secondaryLabel && onSecondaryChange && (
        <label className="nono-field">
          <span>{secondaryLabel}</span>
          <DatePicker
            selected={parseStoredDate(secondaryValue)}
            onChange={(date: Date | null) => onSecondaryChange(toStoredDate(date))}
            locale="fr"
            dateFormat="P"
            disabled={disabled}
            isClearable
            placeholderText="Choisir une date"
            className="input compact-date-input"
            wrapperClassName="compact-date-picker"
            calendarClassName="theme-datepicker"
            popperClassName="theme-datepicker-popper"
          />
        </label>
      )}
    </div>
  </article>
);

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
  const [bottleAmountDraft, setBottleAmountDraft] = useState("90");
  const [bottleDateDraft, setBottleDateDraft] = useState(() => toDateInputValue(new Date()));
  const [weightDraft, setWeightDraft] = useState("");
  const [weightDateDraft, setWeightDateDraft] = useState(() => toDateInputValue(new Date()));
  const canWrite = canUserWrite(user);

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

  const bottleEntries = useMemo(
    () => [...(nono.bottleEntries || [])].sort(compareBottleEntries),
    [nono.bottleEntries]
  );
  const weightEntries = useMemo(
    () => [...(nono.weightEntries || [])].sort((a, b) => getDayMs(b.date) - getDayMs(a.date)),
    [nono.weightEntries]
  );
  const bottleChartEntries = useMemo(
    () => aggregateBottleEntriesByDay(bottleEntries).slice(0, MAX_BOTTLE_CHART_POINTS).reverse(),
    [bottleEntries]
  );

  const latestWeight = weightEntries[0];
  const recentBottleEntries = bottleEntries;
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
      secondaryLabel: "Rappel",
      secondaryValue: nono.checkupReminder,
      onSecondaryChange: (date: string) => saveDate(updateCheckupReminder, date),
      sortDates: [nono.checkupReminder, nono.checkupDate],
    },
    {
      key: "vaccine",
      title: "Vaccin",
      icon: "fa-syringe",
      accentClass: "accent-apricot",
      primaryLabel: "Date du vaccin",
      primaryValue: nono.vaccineDate,
      onPrimaryChange: (date: string) => saveDate(updateVaccineDate, date),
      secondaryLabel: "Rappel",
      secondaryValue: nono.vaccineReminder,
      onSecondaryChange: (date: string) => saveDate(updateVaccineReminder, date),
      sortDates: [nono.vaccineReminder, nono.vaccineDate],
    },
    {
      key: "vitamin",
      title: "Vitamine",
      icon: "fa-prescription-bottle-medical",
      accentClass: "accent-mint",
      primaryLabel: "Prochain rappel",
      primaryValue: nono.vitaminReminder,
      onPrimaryChange: (date: string) => saveDate(updateVitaminReminder, date),
      sortDates: [nono.vitaminReminder],
    },
    {
      key: "administrative",
      title: "Demarches",
      icon: "fa-folder-open",
      accentClass: "accent-lilac",
      primaryLabel: "Prochaine relance",
      primaryValue: nono.administrativeReminder,
      onPrimaryChange: (date: string) => saveDate(updateAdministrativeReminder, date),
      sortDates: [nono.administrativeReminder],
    },
  ]
    .map((card, index) => ({
      ...card,
      index,
      sortMeta: getScheduleSortMeta(card.sortDates),
    }))
    .sort((leftCard, rightCard) => {
      if (leftCard.sortMeta.bucket !== rightCard.sortMeta.bucket) {
        return leftCard.sortMeta.bucket - rightCard.sortMeta.bucket;
      }

      if (leftCard.sortMeta.sortValue !== rightCard.sortMeta.sortValue) {
        return leftCard.sortMeta.sortValue - rightCard.sortMeta.sortValue;
      }

      return leftCard.index - rightCard.index;
    });
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

  const handleAddBottle = async () => {
    if (!canWrite) {
      return;
    }

    const amountMl = Number(bottleAmountDraft);
    const parsedDate = parseDateInput(bottleDateDraft);

    await handleAsyncOperation(async () => {
      if (!Number.isFinite(amountMl) || amountMl <= 0) {
        throw new Error("Indiquez une quantite de biberon valide");
      }

      if (!parsedDate || !bottleDateDraft) {
        throw new Error("Indiquez une date valide pour le biberon");
      }

      const response = await addBottleEntry(amountMl, bottleDateDraft);
      await loadNono();
      setBottleDateDraft(toDateInputValue(new Date()));
      if (response.success) {
        setSuccess(response.success);
      }
    }, null).catch(() => undefined);
  };

  const handleDeleteBottle = async (entryId?: string) => {
    if (!canWrite || !entryId) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await deleteBottleEntry(entryId);
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
            <h2>Biberons et poids</h2>
          </div>
        </div>

        <div className="nono-tracker-grid">
          <NonoTrackerPanel
            title="Biberons"
            icon="fa-bottle-water"
            accentClass="accent-sky"
            panelClassName="nono-bottle-panel"
            chartTitle="Evolution des biberons par jour"
            canWrite={canWrite}
            submitLabel="Ajouter le biberon"
            onSubmit={() => {
              void handleAddBottle();
            }}
            formFields={
              <div className="nono-form-grid">
                <label className="nono-field">
                  <span>Quantite (mL)</span>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={bottleAmountDraft}
                    disabled={!canWrite}
                    onChange={(event) => setBottleAmountDraft(event.target.value)}
                  />
                </label>

                <label className="nono-field">
                  <span>Jour du biberon</span>
                  <input
                    className="input compact-native-date-input"
                    type="date"
                    value={bottleDateDraft}
                    disabled={!canWrite}
                    onChange={(event) => setBottleDateDraft(event.target.value)}
                  />
                </label>
              </div>
            }
            history={{
              title: "Derniers biberons",
              hasEntries: recentBottleEntries.length > 0,
              emptyMessage: "Aucun biberon enregistre pour le moment.",
              children: (
                <ul className="nono-history-list">
                  {recentBottleEntries.map((entry, index) => (
                    <li key={entry._id || `${getBottleEntryDate(entry)}-${entry.amountMl}-${index}`} className="nono-history-item">
                      <div className="nono-history-main">
                        <strong>{entry.amountMl} mL</strong>
                        <span>{formatDayDisplay(getBottleEntryDate(entry))}</span>
                      </div>
                      <button
                        className="icon-button nono-history-delete"
                        type="button"
                        title="Supprimer le biberon"
                        aria-label="Supprimer le biberon"
                        disabled={!canWrite || !entry._id}
                        onClick={() => void handleDeleteBottle(entry._id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              ),
            }}
            chart={<BottleChart entries={bottleChartEntries} />}
          />

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
          {scheduleCards.map(({ key, sortDates: _sortDates, sortMeta: _sortMeta, index: _index, ...card }) => (
            <NonoScheduleCard key={key} {...card} disabled={!canWrite} />
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
