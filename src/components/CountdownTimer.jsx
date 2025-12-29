import { useState, useEffect } from 'react';

/**
 * Time Unit Card Component
 */
function TimeCard({ value, label }) {
  const paddedValue = String(value).padStart(2, '0');
  const digits = paddedValue.split('');

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Time Display */}
      <div className="flex gap-0.5">
        {digits.map((digit, index) => (
          <div
            key={index}
            className="w-6 h-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded border border-white/10 flex items-center justify-center shadow-lg relative overflow-hidden"
          >
            {/* Top shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700/30 to-transparent" />
            
            {/* Center line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-black/20" />
            
            {/* Digit */}
            <span className="text-lg font-bold text-white font-mono relative z-10">
              {digit}
            </span>
          </div>
        ))}
      </div>

      {/* Label */}
      <div className="text-[8px] font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

/**
 * Countdown Timer Component
 * @param {number} targetTimestamp - Unix timestamp in seconds
 * @param {boolean} compact - Compact mode (optional)
 */
export function CountdownTimer({ targetTimestamp, compact = false }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (24 * 60 * 60));
      const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((difference % (60 * 60)) / 60);
      const seconds = Math.floor(difference % 60);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  // Compact mode
  if (compact) {
    if (isExpired) {
      return (
        <div className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded">
          <span className="text-xs font-semibold text-amber-400">Ready</span>
        </div>
      );
    }

    const { days, hours, minutes, seconds } = timeLeft;
    return (
      <div className="flex items-center gap-1 text-xs">
        {days > 0 && (
          <>
            <span className="font-bold text-white">{days}</span>
            <span className="text-gray-400">d</span>
          </>
        )}
        <span className="font-bold text-white">{String(hours).padStart(2, '0')}</span>
        <span className="text-gray-400">:</span>
        <span className="font-bold text-white">{String(minutes).padStart(2, '0')}</span>
        <span className="text-gray-400">:</span>
        <span className="font-bold text-white">{String(seconds).padStart(2, '0')}</span>
      </div>
    );
  }

  // Full calendar mode
  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-semibold text-amber-400">Ready</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="inline-flex items-center gap-1.5 p-2 bg-black/30 backdrop-blur-sm border border-white/5 rounded-lg">
      {days > 0 && <TimeCard value={days} label="Days" />}
      <TimeCard value={hours} label="Hours" />
      <TimeCard value={minutes} label="Minutes" />
      <TimeCard value={seconds} label="Seconds" />
    </div>
  );
}
