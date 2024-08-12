import React, { useState } from 'react';

const QuantityInput = ({ count, unit, onChange }) => {
    const units = ['', 'g', 'Kg', 'mL', 'L'];

    const handleQuantityChange = (e) => {
        onChange({ count: Number(e.target.value), unit: unit });
    };

    const handleUnitChange = (e) => {
        onChange({ count: count, unit: e.target.value });
    };

    return (
        <div className="flex items-center space-x-4">
            <input
                type="number"
                value={count}
                onChange={handleQuantityChange}
                className="border border-gray-300 p-2 rounded-md w-24"
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
                className="border border-gray-300 p-2 rounded-md"
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