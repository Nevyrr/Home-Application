import React, { useState } from 'react';

interface QuantityInputProps {
  count: number;
  unit: string;
  onChange: (data: { count: number; unit: string }) => void;
}

const QuantityInput = ({ count, unit, onChange }: QuantityInputProps) => {
    const units = ['', 'g', 'Kg', 'mL', 'L'];

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ count: Number(e.target.value), unit: unit });
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ count: count, unit: e.target.value });
    };

    return (
        <div className="flex items-center space-x-4">
            <input
                type="number"
                value={count}
                onChange={handleQuantityChange}
                className="input w-24"
                placeholder="Count"
                min="0"
                max="99"
                step="1"
                title="Enter a number between 1 and 99"
            />
            <select
                value={unit}
                placeholder="unit"
                onChange={handleUnitChange}
                className="input"
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

