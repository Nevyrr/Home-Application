import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { Alert, OverviewHero, OverviewHighlightsPanel, Success } from "../../components/index.ts";
import {
  getNonoData,
  updateAdministrativeReminder,
  updateBirthDate,
  updateCheckupDate,
  updateCheckupReminder,
  updateNonoNotes,
  updateVaccineDate,
  updateVaccineReminder,
  updateVitaminReminder,
} from "../../controllers/NonoController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { Nono } from "../../types/index.ts";
import { canUserWrite } from "../../utils/permissions.ts";

registerLocale("fr", fr);

const DEFAULT_NONO_BIRTH_DATE = "18/03/2026";

interface NonoScheduleCardProps {
  title: string;
  icon: string;
  accentClass: string;
  description: string;
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

  const diffInDays = Math.floor((today.getTime() - birthDay.getTime()) / (1000 * 60 * 60 * 24));

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
        <p>{description}</p>
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

const NonoTab = () => {
  const { nono, setNono } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const [notesDraft, setNotesDraft] = useState("");
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
    }, null);
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
    }, null);
  };

  const nextMilestone = getNextMilestone(nono);
  const filledItemsCount = [
    nono.birthDate,
    nono.checkupDate,
    nono.checkupReminder,
    nono.vaccineDate,
    nono.vaccineReminder,
    nono.vitaminReminder,
    nono.administrativeReminder,
  ].filter(Boolean).length;
  const heroStats = [
    {
      label: "Age",
      value: formatBabyAge(nono.birthDate),
      note: nono.birthDate ? `Ne le ${formatDisplayDate(nono.birthDate)}` : "Ajoutez sa date de naissance",
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
      label: "Reperes enregistres",
      value: `${filledItemsCount}/7`,
      note: nono.notes ? "Pense-bete rempli" : "Pense-bete a completer",
    },
  ];
  const highlightItems = [
    {
      label: "Date de naissance",
      value: formatDisplayDate(nono.birthDate),
      note: "Repere fixe pour calculer son age",
    },
    {
      label: "Age actuel",
      value: formatBabyAge(nono.birthDate),
      note: "Calcule a partir de sa date de naissance",
    },
    {
      label: "Pense-bete",
      value: nono.notes ? "Renseigne" : "Vide",
      note: nono.notes ? "Des notes utiles sont enregistrees" : "Ajoutez vos questions ou rappels utiles",
    },
    {
      label: "Point d'attention",
      value: nextMilestone ? nextMilestone.label : "Aucun rappel programme",
      note: nextMilestone ? formatDisplayDate(nextMilestone.date) : "Ajoutez une date importante",
      className: "wide",
    },
  ];

  return (
    <section className="card nono-shell">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <OverviewHero
        eyebrow="Suivi bebe"
        title="NONO"
        subtitle="Un espace simple pour centraliser les dates qui comptent vraiment: rendez-vous, vaccins, vitamine, demarches et pense-bete. Les dates medicales restent a adapter avec votre pediatre."
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
              <NonoScheduleCard
                title="Rendez-vous pediatre"
                icon="fa-user-doctor"
                accentClass="accent-sky"
                description="Pour les consultations, controles ou bilans a venir."
                primaryLabel="Date du rendez-vous"
                primaryValue={nono.checkupDate}
                onPrimaryChange={(date) => saveDate(updateCheckupDate, date)}
                secondaryLabel="Rappel"
                secondaryValue={nono.checkupReminder}
                onSecondaryChange={(date) => saveDate(updateCheckupReminder, date)}
                disabled={!canWrite}
              />

              <NonoScheduleCard
                title="Vaccin"
                icon="fa-syringe"
                accentClass="accent-apricot"
                description="Une case simple pour noter la prochaine date et le rappel."
                primaryLabel="Date du vaccin"
                primaryValue={nono.vaccineDate}
                onPrimaryChange={(date) => saveDate(updateVaccineDate, date)}
                secondaryLabel="Rappel"
                secondaryValue={nono.vaccineReminder}
                onSecondaryChange={(date) => saveDate(updateVaccineReminder, date)}
                disabled={!canWrite}
              />

              <NonoScheduleCard
                title="Vitamine / ordonnance"
                icon="fa-prescription-bottle-medical"
                accentClass="accent-mint"
                description="Pratique pour anticiper un renouvellement ou un passage a la pharmacie."
                primaryLabel="Prochain rappel"
                primaryValue={nono.vitaminReminder}
                onPrimaryChange={(date) => saveDate(updateVitaminReminder, date)}
                disabled={!canWrite}
              />

              <NonoScheduleCard
                title="Demarches"
                icon="fa-folder-open"
                accentClass="accent-lilac"
                description="Mutuelle, mode de garde, papiers, relances ou toute date d'organisation."
                primaryLabel="Prochaine relance"
                primaryValue={nono.administrativeReminder}
                onPrimaryChange={(date) => saveDate(updateAdministrativeReminder, date)}
                disabled={!canWrite}
              />
            </div>
          </section>
        </div>

        <aside className="nono-side">
          <OverviewHighlightsPanel eyebrow="Vue rapide" title="Infos du moment" items={highlightItems}>
            <label className="nono-field">
              <span>Date de naissance</span>
              <DatePicker
                selected={parseStoredDate(nono.birthDate)}
                onChange={(date: Date | null) => saveDate(updateBirthDate, toStoredDate(date))}
                locale="fr"
                dateFormat="P"
                disabled={!canWrite}
                isClearable
                placeholderText="Choisir une date"
                className="input"
                calendarClassName="theme-datepicker"
                popperClassName="theme-datepicker-popper"
              />
            </label>
          </OverviewHighlightsPanel>

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
              <button className="btn" onClick={handleSaveNotes} disabled={!canWrite}>
                Enregistrer le pense-bete
              </button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default NonoTab;
