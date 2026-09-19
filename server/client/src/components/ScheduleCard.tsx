import { parseStoredDate, toStoredDate } from "../utils/dateUtils.ts";
import { useEffect, useId, useRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("fr", fr);

interface ScheduleCardProps {
  title: string;
  icon: string;
  accentClass: string;
  description?: string;
  primaryLabel: string;
  primaryValue: string;
  onPrimaryChange: (date: string) => Promise<void>;
  secondaryValue?: string;
  disabled?: boolean;
  recurrence?: {
    intervalMonths?: number | null;
    onSave: (intervalMonths: number, date?: string) => Promise<void>;
  };
}

const ScheduleCard = ({
  title,
  icon,
  accentClass,
  description,
  primaryLabel,
  primaryValue,
  onPrimaryChange,
  secondaryValue,
  disabled = false,
  recurrence,
}: ScheduleCardProps) => {
  const [intervalDraft, setIntervalDraft] = useState(String(recurrence?.intervalMonths ?? ""));
  const [pending, setPending] = useState<"interval" | "care" | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const saving = useRef<Promise<void> | null>(null);
  const careRequested = useRef(false);
  const hintId = useId();
  const months = Number(intervalDraft);
  const validInterval = intervalDraft.trim() !== "" && Number.isInteger(months) && months >= 1 && months <= 1200;
  const intervalChanged = months !== recurrence?.intervalMonths;

  useEffect(() => {
    setIntervalDraft(String(recurrence?.intervalMonths ?? ""));
  }, [recurrence?.intervalMonths]);

  const saveRecurrence = async (given: boolean) => {
    if (disabled || careRequested.current || !recurrence || !validInterval) return;
    if (!given && (saving.current || !intervalChanged)) return;
    if (given) careRequested.current = true;
    setPending(given ? "care" : "interval");

    // A click after leaving the interval field must still record the care.
    const previousSave = saving.current;
    const operation = (async () => {
      await previousSave;
      setError("");
      setStatus("");
      try {
        await recurrence.onSave(months, given ? toStoredDate(new Date()) : undefined);
        setStatus(given ? "Soin enregistré, prochaine échéance mise à jour." : "Intervalle enregistré.");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Impossible d'enregistrer le soin");
      }
    })();
    saving.current = operation;
    await operation;
    if (saving.current === operation) {
      saving.current = null;
      setPending(null);
    }
    if (given) careRequested.current = false;
  };

  return (
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
            disabled={disabled || pending !== null}
            isClearable
            placeholderText="Choisir une date"
            className="input compact-date-input"
            wrapperClassName="compact-date-picker"
            calendarClassName="theme-datepicker"
            popperClassName="theme-datepicker-popper"
          />
        </label>

        {recurrence && (
          <div className="care-recurrence">
            <label className="nono-field">
              <span>Intervalle entre deux soins (mois)</span>
              <input
                className="input care-interval-input"
                type="number"
                inputMode="numeric"
                min="1"
                max="1200"
                step="1"
                value={intervalDraft}
                placeholder="À définir"
                disabled={disabled || pending !== null}
                aria-describedby={intervalDraft !== "" && !validInterval ? hintId : undefined}
                aria-invalid={intervalDraft !== "" && !validInterval}
                onBlur={() => void saveRecurrence(false)}
                onChange={(event) => {
                  setIntervalDraft(event.target.value);
                  setError("");
                  setStatus("");
                }}
              />
            </label>
            {intervalDraft !== "" && !validInterval && (
              <p id={hintId} className="care-hint">Saisissez un nombre entier de 1 à 1200 mois.</p>
            )}
            {secondaryValue && (
              <p className="care-hint">Prochaine échéance : <strong>{secondaryValue}</strong></p>
            )}
            <div className="care-actions">
              <button type="button" className="btn nono-submit" disabled={disabled || pending === "care" || !validInterval}
                onClick={() => void saveRecurrence(true)}>
                {pending === "care" ? "Enregistrement…" : "Soin effectué"}
              </button>
            </div>
            {error && <p className="care-error" role="alert">{error}</p>}
            {status && <p className="care-hint" role="status">{status}</p>}
          </div>
        )}
      </div>
    </article>
  );
};

export default ScheduleCard;
