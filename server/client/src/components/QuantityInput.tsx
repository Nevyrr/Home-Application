import React from "react";

interface QuantityInputProps {
  count: number;
  unit: string;
  onChange: (data: { count: number; unit: string }) => void;
  disabled?: boolean;
}

const QuantityInput = ({ count, unit, onChange, disabled = false }: QuantityInputProps) => {
    const units = ["", "u", "g", "Kg", "mL", "L"];

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ count: Number(e.target.value), unit: unit });
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
                placeholder="Count"
                min="0"
                max="99"
                step="1"
                title="Enter a number between 1 and 99"
            />
            <select
                value={unit}
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

