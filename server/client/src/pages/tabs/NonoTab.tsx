import { ReactNode, useEffect, useMemo, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { Alert, OverviewHero, Success } from "../../components/index.ts";
import {
  addBottleEntry,
  addDiaperEntry,
  addWeightEntry,
  deleteBottleEntry,
  deleteDiaperEntry,
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

interface BottleChartProps {
  entries: NonoBottleEntry[];
}

interface WeightChartProps {
  entries: NonoWeightEntry[];
}

interface NonoTrackerHistoryProps {
  title: string;
  hasEntries: boolean;
  emptyMessage: string;
  children: ReactNode;
}

interface NonoTrackerCardProps {
  title: string;
  icon: string;
  accentClass: string;
  panelClassName?: string;
  canWrite: boolean;
  submitLabel: string;
  onSubmit: () => void;
  formFields: ReactNode;
  history: NonoTrackerHistoryProps;
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

const toDateTimeLocalValue = (date: Date): string => {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const parseDateTimeInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
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

const formatDateTimeDisplay = (timestamp?: string | null): string => {
  const parsedDate = parsePreciseTimestamp(timestamp);

  if (!parsedDate) {
    return "A definir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
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

const formatShortChartLabel = (timestamp: string): string => {
  const parsedDate = parsePreciseTimestamp(timestamp);

  if (!parsedDate) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

const formatElapsedDuration = (durationMs: number): string => {
  const totalMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));

  if (totalMinutes < 1) {
    return "moins d'1 min";
  }

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % (24 * 60) % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} j`);
  }

  if (hours > 0) {
    parts.push(`${hours} h`);
  }

  if (minutes > 0 && days === 0) {
    parts.push(`${minutes} min`);
  }

  return parts.slice(0, 2).join(" ");
};

const formatElapsedSince = (timestamp?: string | null): string => {
  const parsedDate = parsePreciseTimestamp(timestamp);

  if (!parsedDate) {
    return "Aucun enregistrement";
  }

  const diffMs = Date.now() - parsedDate.getTime();

  if (diffMs < 0) {
    return `Dans ${formatElapsedDuration(Math.abs(diffMs))}`;
  }

  return `Il y a ${formatElapsedDuration(diffMs)}`;
};

const getTimestampMs = (timestamp?: string | null): number => parsePreciseTimestamp(timestamp)?.getTime() || 0;

const getDayMs = (dateString?: string | null): number => parseDayEntryDate(dateString)?.getTime() || 0;

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
    { label: "Rendez-vous pediatre", date: nono.checkupReminder || nono.checkupDate },
    { label: "Vaccin", date: nono.vaccineReminder || nono.vaccineDate },
    { label: "Vitamine / ordonnance", date: nono.vitaminReminder },
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
    return <p className="nono-chart-empty">Ajoutez un premier biberon pour afficher la courbe des quantites.</p>;
  }

  const orderedEntries = [...entries].sort((a, b) => getTimestampMs(a.timestamp) - getTimestampMs(b.timestamp));
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
  const linePoints = pointEntries.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${pointEntries[0].x},92 ${linePoints} ${pointEntries[pointEntries.length - 1].x},92`;
  const tickValues = [upperBound, lowerBound + range / 2, lowerBound].map((value) => Math.round(value));
  const axisEntries = [
    orderedEntries[0],
    orderedEntries[Math.floor((orderedEntries.length - 1) / 2)],
    orderedEntries[orderedEntries.length - 1],
  ];

  return (
    <div className="nono-chart-shell">
      <div className="nono-chart-plot">
        <svg className="nono-bottle-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Courbe des quantites de biberons">
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
          <polyline points={linePoints} className="nono-chart-line" />

          {pointEntries.map((point) => (
            <g key={`${point.entry.timestamp}-${point.entry.amountMl}`}>
              <circle cx={point.x} cy={point.y} r="2.3" className="nono-chart-point-shadow" />
              <circle cx={point.x} cy={point.y} r="1.6" className="nono-chart-point" />
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
          <span key={`${entry.timestamp}-${index}`}>{formatShortChartLabel(entry.timestamp)}</span>
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
  const axisEntries = [
    orderedEntries[0],
    orderedEntries[Math.floor((orderedEntries.length - 1) / 2)],
    orderedEntries[orderedEntries.length - 1],
  ];

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
          className="input"
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
            className="input"
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

const NonoTrackerCard = ({
  title,
  icon,
  accentClass,
  panelClassName = "",
  canWrite,
  submitLabel,
  onSubmit,
  formFields,
  history,
}: NonoTrackerCardProps) => (
  <article className={`nono-schedule-card ${accentClass} nono-tracker-card ${panelClassName}`.trim()}>
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
  </article>
);

const NonoTab = () => {
  const { nono, setNono } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const [notesDraft, setNotesDraft] = useState("");
  const [bottleAmountDraft, setBottleAmountDraft] = useState("90");
  const [bottleTimestampDraft, setBottleTimestampDraft] = useState(() => toDateTimeLocalValue(new Date()));
  const [diaperTimestampDraft, setDiaperTimestampDraft] = useState(() => toDateTimeLocalValue(new Date()));
  const [diaperHasPoopDraft, setDiaperHasPoopDraft] = useState(false);
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
    () => [...(nono.bottleEntries || [])].sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp)),
    [nono.bottleEntries]
  );
  const diaperEntries = useMemo(
    () => [...(nono.diaperEntries || [])].sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp)),
    [nono.diaperEntries]
  );
  const weightEntries = useMemo(
    () => [...(nono.weightEntries || [])].sort((a, b) => getDayMs(b.date) - getDayMs(a.date)),
    [nono.weightEntries]
  );

  const latestPoop = diaperEntries.find((entry) => entry.hasPoop);
  const latestWeight = weightEntries[0];
  const chartEntries = bottleEntries.slice(0, 12).reverse();
  const recentBottleEntries = bottleEntries;
  const recentDiaperEntries = diaperEntries;
  const weightChartEntries = weightEntries.slice(0, 12).reverse();
  const recentWeightEntries = weightEntries;
  const scheduleCards = [
    {
      key: "checkup",
      title: "Rendez-vous pediatre",
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
      title: "Vitamine / ordonnance",
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
    const timestamp = parseDateTimeInput(bottleTimestampDraft);

    await handleAsyncOperation(async () => {
      if (!Number.isFinite(amountMl) || amountMl <= 0) {
        throw new Error("Indiquez une quantite de biberon valide");
      }

      if (!timestamp) {
        throw new Error("Indiquez une heure valide pour le biberon");
      }

      const response = await addBottleEntry(amountMl, timestamp.toISOString());
      await loadNono();
      setBottleTimestampDraft(toDateTimeLocalValue(new Date()));
      if (response.success) {
        setSuccess(response.success);
      }
    }, null).catch(() => undefined);
  };

  const handleAddDiaper = async () => {
    if (!canWrite) {
      return;
    }

    const timestamp = parseDateTimeInput(diaperTimestampDraft);

    await handleAsyncOperation(async () => {
      if (!timestamp) {
        throw new Error("Indiquez une heure valide pour le changement de couche");
      }

      const response = await addDiaperEntry(timestamp.toISOString(), diaperHasPoopDraft);
      await loadNono();
      setDiaperTimestampDraft(toDateTimeLocalValue(new Date()));
      setDiaperHasPoopDraft(false);
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

  const handleDeleteDiaper = async (entryId?: string) => {
    if (!canWrite || !entryId) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await deleteDiaperEntry(entryId);
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
    {
      label: "Depuis dernier caca",
      value: latestPoop ? formatElapsedSince(latestPoop.timestamp) : "Aucun",
      note: latestPoop
        ? `Dernier caca le ${formatDateTimeDisplay(latestPoop.timestamp)}`
        : "Cochez l'option lors d'un changement de couche",
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
      />

      <div className="nono-layout">
        <div className="nono-main">
          <section className="nono-panel">
            <div className="nono-panel-head">
              <div>
                <p className="eyebrow">Sante et suivi</p>
                <h2>Les prochaines dates a ne pas rater</h2>
              </div>
            </div>

            <div className="nono-card-grid">
              {scheduleCards.map(({ key, sortDates: _sortDates, sortMeta: _sortMeta, index: _index, ...card }) => (
                <NonoScheduleCard key={key} {...card} disabled={!canWrite} />
              ))}
            </div>
          </section>

        </div>

        <aside className="nono-side">
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
        </aside>
      </div>

      <section className="nono-panel">
        <div className="nono-panel-head">
          <div>
            <p className="eyebrow">Suivi quotidien</p>
            <h2>Biberons, couches et poids</h2>
          </div>
        </div>

        <div className="nono-tracker-grid">
          <div className="nono-tracker-top-grid">
            <NonoTrackerCard
              title="Biberons"
              icon="fa-bottle-water"
              accentClass="accent-sky"
              panelClassName="nono-bottle-panel"
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
                    <span>Heure du biberon</span>
                    <input
                      className="input"
                      type="datetime-local"
                      value={bottleTimestampDraft}
                      disabled={!canWrite}
                      onChange={(event) => setBottleTimestampDraft(event.target.value)}
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
                      <li key={entry._id || `${entry.timestamp}-${entry.amountMl}-${index}`} className="nono-history-item">
                        <div className="nono-history-main">
                          <strong>{entry.amountMl} mL</strong>
                          <span>{formatDateTimeDisplay(entry.timestamp)}</span>
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
            />

            <NonoTrackerCard
              title="Poids"
              icon="fa-weight-scale"
              accentClass="accent-mint"
              panelClassName="nono-weight-panel"
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
                      className="input"
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
            />

            <NonoTrackerCard
              title="Couches"
              icon="fa-baby"
              accentClass="accent-rose"
              canWrite={canWrite}
              submitLabel="Enregistrer la couche"
              onSubmit={() => {
                void handleAddDiaper();
              }}
              formFields={
                <div className="nono-diaper-row">
                  <label className="nono-field">
                    <span>Heure du changement</span>
                    <input
                      className="input"
                      type="datetime-local"
                      value={diaperTimestampDraft}
                      disabled={!canWrite}
                      onChange={(event) => setDiaperTimestampDraft(event.target.value)}
                    />
                  </label>

                  <label className="nono-toggle-card">
                    <div className="nono-toggle-copy">
                      <span className="nono-toggle-label">Avec caca</span>
                      <small className="nono-toggle-hint">A cocher si la couche contient des selles</small>
                    </div>
                    <input
                      className="checkbox-theme"
                      type="checkbox"
                      checked={diaperHasPoopDraft}
                      disabled={!canWrite}
                      onChange={(event) => setDiaperHasPoopDraft(event.target.checked)}
                    />
                  </label>
                </div>
              }
              history={{
                title: "Derniers changes",
                hasEntries: recentDiaperEntries.length > 0,
                emptyMessage: "Aucune couche enregistree pour le moment.",
                children: (
                  <ul className="nono-history-list">
                    {recentDiaperEntries.map((entry, index) => (
                      <li key={entry._id || `${entry.timestamp}-${index}`} className="nono-history-item">
                        <div className="nono-history-main">
                          <strong>{entry.hasPoop ? "Avec caca" : "Sans caca"}</strong>
                          <span>{formatDateTimeDisplay(entry.timestamp)}</span>
                        </div>
                        <button
                          className="icon-button nono-history-delete"
                          type="button"
                          title="Supprimer la couche"
                          aria-label="Supprimer la couche"
                          disabled={!canWrite || !entry._id}
                          onClick={() => void handleDeleteDiaper(entry._id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                ),
              }}
            />
          </div>

          <div className="nono-tracker-bottom-grid">
            <article className="nono-schedule-card accent-sky nono-tracker-card nono-chart-panel">
              <div className="nono-schedule-head">
                <span className="nono-schedule-icon">
                  <i className="fa-solid fa-chart-line"></i>
                </span>
                <div>
                  <h3>Evolution des biberons</h3>
                </div>
              </div>

              <BottleChart entries={chartEntries} />
            </article>

            <article className="nono-schedule-card accent-mint nono-tracker-card nono-chart-panel nono-weight-panel">
              <div className="nono-schedule-head">
                <span className="nono-schedule-icon">
                  <i className="fa-solid fa-chart-line"></i>
                </span>
                <div>
                  <h3>Evolution du poids</h3>
                </div>
              </div>

              <WeightChart entries={weightChartEntries} />
            </article>
          </div>
        </div>
      </section>
    </section>
  );
};

export default NonoTab;
