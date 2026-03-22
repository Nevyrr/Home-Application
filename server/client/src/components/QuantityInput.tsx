import React from "react";

interface QuantityInputProps {
  count: number;
  unit: string;
  onChange: (data: { count: number; unit: string }) => void;
  disabled?: boolean;
}

const QuantityInput = ({ count, unit, onChange, disabled = false }: QuantityInputProps) => {
    const units = ["", "g", "Kg", "mL", "L"];
    const normalizedUnit = unit === "u" ? "" : unit;

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextCount = Number(e.target.value);
        const safeCount = Number.isFinite(nextCount) ? Math.min(999, Math.max(0, nextCount)) : 0;
        onChange({ count: safeCount, unit: normalizedUnit });
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ count: count, unit: e.target.value });
    };

    return (
        <div className="quantity-input-row">
            <input
                type="number"
                value={count}
                disabled={disabled}
                onChange={handleQuantityChange}
                className="input quantity-input-count"
                placeholder="Qt"
                min="0"
                max="999"
                step="1"
                inputMode="numeric"
                title="Entrez un nombre entre 0 et 999"
            />
            <select
                value={normalizedUnit}
                disabled={disabled}
                onChange={handleUnitChange}
                className="input quantity-input-unit"
            >
                {units.map((unitOption) => (
                    <option key={unitOption} value={unitOption}>
                        {unitOption}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default QuantityInput;

