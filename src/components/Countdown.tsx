'use client';

import { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/lib/pricing';

interface CountdownProps {
  targetDate: Date;
  label?: string;
}

export function Countdown({ targetDate, label }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeRemaining.total === 0) {
    return (
      <div className="text-center">
        <p className="text-xl font-bold text-red-400">Tempo esgotado!</p>
      </div>
    );
  }

  const timeUnits = [
    { value: timeRemaining.days, label: 'Dias' },
    { value: timeRemaining.hours, label: 'Horas' },
    { value: timeRemaining.minutes, label: 'Min' },
    { value: timeRemaining.seconds, label: 'Seg' },
  ];

  return (
    <div className="w-full">
      {label && (
        <p className="text-center text-sm md:text-base text-gray-300 mb-3">{label}</p>
      )}
      <div className="flex justify-center gap-2 md:gap-4">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-2 md:p-4 min-w-[50px] md:min-w-[70px]">
                <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-400 mt-1">{unit.label}</span>
            </div>
            {index < timeUnits.length - 1 && (
              <span className="text-2xl md:text-4xl font-bold text-purple-400 mx-1 md:mx-2 self-start mt-2 md:mt-4">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
