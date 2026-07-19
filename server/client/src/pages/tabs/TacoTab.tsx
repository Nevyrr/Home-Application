import { compareDueDates, parseStoredDate, startOfDay } from "../../utils/dateUtils.ts";
import ScheduleCard from "../../components/ScheduleCard.tsx";
import { updateCare } from "../../controllers/CareController.ts";
import { useEffect } from "react";
import { Alert, ImageUpload, OverviewHero, Success } from "../../components/index.ts";
import {
  getTacoData,
  updateAntiPuceDate,
  updateAnnualVaccineDate,
  updateVermifugeDate,
} from "../../controllers/TacoController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { Taco } from "../../types/index.ts";
import { canUserWrite } from "../../utils/permissions.ts";

const DEFAULT_TACO_BIRTH_DATE = "07/08/2022";

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
    { label: "Vermifuge", date: taco.vermifugeReminder },
    { label: "Anti-puce", date: taco.antiPuceReminder },
    { label: "Vaccin annuel", date: taco.annualVaccineReminder },
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

const TacoTab = () => {
  const { taco, setTaco } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const canWrite = canUserWrite(user);

  const saveCare = async (care: string, intervalMonths: number, date?: string) => {
    if (!canWrite) return;
    const response = await updateCare("taco", care, intervalMonths, date);
    setTaco((current) => ({ ...current, ...response.record }));
  };

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
    }, null).catch(() => undefined);
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
      recurrence: {
        intervalMonths: taco.vermifugeIntervalMonths,
        onSave: (months: number, date?: string) => saveCare("vermifuge", months, date),
      },
      dueDate: taco.vermifugeReminder,
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
      recurrence: {
        intervalMonths: taco.antiPuceIntervalMonths,
        onSave: (months: number, date?: string) => saveCare("antipuce", months, date),
      },
      dueDate: taco.antiPuceReminder,
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
      recurrence: {
        intervalMonths: taco.annualVaccineIntervalMonths,
        onSave: (months: number, date?: string) => saveCare("vaccine", months, date),
      },
      dueDate: taco.annualVaccineReminder,
    },
  ]
    .sort((leftCard, rightCard) => compareDueDates(leftCard.dueDate, rightCard.dueDate));
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
              {scheduleCards.map(({ key, dueDate: _dueDate, ...card }) => (
                <ScheduleCard key={key} {...card} disabled={!canWrite} />
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
