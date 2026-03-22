import { useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { Alert, ImageUpload, OverviewHero, Success } from "../../components/index.ts";
import {
  getTacoData,
  updateAntiPuceDate,
  updateAntiPuceReminder,
  updateAnnualVaccineDate,
  updateAnnualVaccineReminder,
  updateVermifugeDate,
  updateVermifugeReminder,
} from "../../controllers/TacoController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { Taco } from "../../types/index.ts";
import { canUserWrite } from "../../utils/permissions.ts";

registerLocale("fr", fr);

const DEFAULT_TACO_BIRTH_DATE = "07/08/2022";

interface TacoScheduleCardProps {
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

const toStoredDate = (date: Date | null): string => {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDisplayDate = (dateString?: string | null): string => dateString || "A definir";

const formatYearCount = (years: number): string => `${years} an${years > 1 ? "s" : ""}`;

const formatPetAge = (birthDate: string): string => {
  const parsedBirthDate = parseStoredDate(birthDate || DEFAULT_TACO_BIRTH_DATE);

  if (!parsedBirthDate) {
    return "A renseigner";
  }

  const today = startOfDay(new Date());
  const birthDay = startOfDay(parsedBirthDate);

  if (birthDay.getTime() > today.getTime()) {
    return "Date invalide";
  }

  let years = today.getFullYear() - birthDay.getFullYear();
  let months = today.getMonth() - birthDay.getMonth();
  let days = today.getDate() - birthDay.getDate();

  if (days < 0) {
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalMonths = years * 12 + months;

  if (years <= 0) {
    return `${Math.max(totalMonths, 0)} mois`;
  }

  if (months === 0) {
    return formatYearCount(years);
  }

  return `${formatYearCount(years)} ${months} mois`;
};

const formatWeight = (weightKg?: number | null): string => {
  if (typeof weightKg !== "number" || Number.isNaN(weightKg)) {
    return "A renseigner";
  }

  return `${weightKg.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} kg`;
};

const getNextMilestone = (taco: Taco): { label: string; date: string; overdue: boolean } | null => {
  const entries = [
    { label: "Vermifuge", date: taco.vermifugeReminder || taco.vermifugeDate },
    { label: "Anti-puce", date: taco.antiPuceReminder || taco.antiPuceDate },
    { label: "Vaccin annuel", date: taco.annualVaccineReminder || taco.annualVaccineDate },
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

const TacoScheduleCard = ({
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
}: TacoScheduleCardProps) => (
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

const TacoTab = () => {
  const { taco, setTaco } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const canWrite = canUserWrite(user);

  const loadTaco = async () => {
    const data = await getTacoData();
    setTaco(data);
  };

  useEffect(() => {
    loadTaco().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Erreur lors du chargement de l'espace Taco");
    });
  }, []);

  const saveDate = async (
    updater: (date: string) => Promise<{ success?: string }>,
    date: string
  ) => {
    if (!canWrite) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await updater(date);
      await loadTaco();
      if (response.success) {
        setSuccess(response.success);
      }
    }, null);
  };

  const nextMilestone = getNextMilestone(taco);
  const scheduleCards = [
    {
      key: "vermifuge",
      title: "Vermifuge",
      icon: "fa-capsules",
      accentClass: "accent-sky",
      primaryLabel: "Date du traitement",
      primaryValue: taco.vermifugeDate,
      onPrimaryChange: (date: string) => saveDate(updateVermifugeDate, date),
      secondaryLabel: "Rappel",
      secondaryValue: taco.vermifugeReminder,
      onSecondaryChange: (date: string) => saveDate(updateVermifugeReminder, date),
      sortDates: [taco.vermifugeReminder, taco.vermifugeDate],
    },
    {
      key: "anti-puce",
      title: "Anti-puce",
      icon: "fa-bug",
      accentClass: "accent-apricot",
      primaryLabel: "Date d'application",
      primaryValue: taco.antiPuceDate,
      onPrimaryChange: (date: string) => saveDate(updateAntiPuceDate, date),
      secondaryLabel: "Rappel",
      secondaryValue: taco.antiPuceReminder,
      onSecondaryChange: (date: string) => saveDate(updateAntiPuceReminder, date),
      sortDates: [taco.antiPuceReminder, taco.antiPuceDate],
    },
    {
      key: "vaccine",
      title: "Vaccin annuel",
      icon: "fa-syringe",
      accentClass: "accent-mint",
      primaryLabel: "Date du vaccin",
      primaryValue: taco.annualVaccineDate,
      onPrimaryChange: (date: string) => saveDate(updateAnnualVaccineDate, date),
      secondaryLabel: "Rappel",
      secondaryValue: taco.annualVaccineReminder,
      onSecondaryChange: (date: string) => saveDate(updateAnnualVaccineReminder, date),
      sortDates: [taco.annualVaccineReminder, taco.annualVaccineDate],
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
  const heroStats = [
    {
      label: "Age",
      value: formatPetAge(taco.birthDate),
      note: taco.birthDate ? `Ne le ${formatDisplayDate(taco.birthDate)}` : "Ajoutez sa date de naissance",
    },
    {
      label: "Poids",
      value: formatWeight(taco.weightKg),
      note: "Derniere mesure enregistree",
    },
    {
      label: "Prochaine echeance",
      value: nextMilestone ? nextMilestone.label : "Aucune",
      valueClassName: nextMilestone?.overdue ? "is-overdue" : undefined,
      note: nextMilestone
        ? `${nextMilestone.overdue ? "En retard depuis" : "Le"} ${formatDisplayDate(nextMilestone.date)}`
        : "Ajoutez un premier rappel",
    },
  ];

  return (
    <section className="card nono-shell">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <OverviewHero
        eyebrow="Suivi compagnon"
        title="TACO"
        badgeIcon="fa-dog"
        stats={heroStats}
        className="taco-hero"
        badgeClassName="taco-badge"
      />

      <div className="nono-layout">
        <div className="nono-main">
          <section className="nono-panel">
            <div className="nono-panel-head">
              <div>
                <p className="eyebrow">Sante et prevention</p>
                <h2>Les soins a suivre pour Taco</h2>
              </div>
            </div>

            <div className="nono-card-grid">
              {scheduleCards.map(({ key, sortDates: _sortDates, sortMeta: _sortMeta, index: _index, ...card }) => (
                <TacoScheduleCard key={key} {...card} disabled={!canWrite} />
              ))}
            </div>
          </section>
        </div>

        <aside className="nono-side">
          <section className="nono-panel">
            <div className="nono-panel-head">
              <div>
                <p className="eyebrow">Documents</p>
                <h2>Ordonnances et pieces utiles</h2>
              </div>
            </div>

            <ImageUpload canWrite={canWrite} />
          </section>
        </aside>
      </div>
    </section>
  );
};

export default TacoTab;
