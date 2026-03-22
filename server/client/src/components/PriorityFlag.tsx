import { useState, useEffect } from 'react';

export function getCssColor(priority: number): string {
  switch (priority) {
    case 1:
      return 'bg-green-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-red-500';
    default:
      return 'bg-neutral-400';
  }
}

export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1:
      return "Faible";
    case 2:
      return "A prevoir";
    case 3:
      return "Urgent";
    default:
      return "Essentiel";
  }
}

interface PriorityFlagProps {
  handlePriorityChangeCb?: (priority: number) => void;
  priorityColor?: number;
  isCreated?: boolean;
  className?: string;
}

const PriorityFlag = ({ handlePriorityChangeCb, priorityColor = 0, isCreated = false, className = "" }: PriorityFlagProps) => {
  const [priority, setPriority] = useState<number>(priorityColor);
  const isInteractive = typeof handlePriorityChangeCb === "function";
  const priorityLabel = getPriorityLabel(priority);
  const priorityToneClass = `priority-tone-${priority}`;

  useEffect(() => {
    if (isCreated) {
      setPriority(priorityColor);
    }
  }, [priorityColor, isCreated]);

  const handlePriorityChange = () => {
    if (handlePriorityChangeCb !== undefined) {
      const newPriority = (priority + 1) % 4;
      setPriority(newPriority); // Alterne entre 4 niveaux de priorité
      handlePriorityChangeCb(newPriority);
    }
  };

  if (isInteractive) {
    return (
      <button
        type="button"
        className={`priority-flag priority-chip ${priorityToneClass} ${className}`.trim()}
        onClick={handlePriorityChange}
        title={`Priorite ${priorityLabel}. Cliquer pour changer.`}
        aria-label={`Priorite ${priorityLabel}. Cliquer pour changer.`}
      >
        <span className={`priority-dot priority-${priority}`}></span>
        <span className="priority-chip-label">{priorityLabel}</span>
      </button>
    );
  }

  return (
    <span
      className={`priority-flag priority-indicator ${priorityToneClass} ${className}`.trim()}
      title={`Priorite ${priorityLabel}`}
      aria-label={`Priorite ${priorityLabel}`}
    >
      <span className={`priority-dot priority-${priority}`}></span>
    </span>
  );
};

export default PriorityFlag;

