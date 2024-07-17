import React, { useState, useEffect } from 'react';

export function getCssColor(priority) {
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

const PriorityFlag = ({ handlePriorityChangeCb, priorityColor=0, isCreated=false }) => {
  const [priority, setPriority] = useState(priorityColor);

  useEffect(() => {
    // If the flag was already created, we take priorityColor Props has the new priorityColor
    if (isCreated) {
      setPriority(priorityColor);
    }
  });

  const handlePriorityChange = () => {
    if (handlePriorityChangeCb !== undefined) {
      const newPriority = (priority + 1) % 4;
      setPriority(newPriority); // Alterne entre 4 niveaux de priorité
      handlePriorityChangeCb(newPriority);
    }
  };

  const getColor = () => {
    switch (priority) {
      case 1:
        return 'green';
      case 2:
        return 'yellow';
      case 3:
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className='fa-regular fa-flag cursor-pointer priority-flag'
      onClick={handlePriorityChange}
      style={{
        color: getColor(),
      }}
    />
  );
};

export default PriorityFlag;