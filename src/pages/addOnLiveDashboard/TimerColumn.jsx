import React, { useState, useEffect } from 'react';

const TimerColumn = ({ initialTime = 0 }) => {
  const [timeElapsed, setTimeElapsed] = useState(initialTime); // Start from 0 seconds
  const maxTime = 3600; // 1 hour limit

  useEffect(() => {
    if (timeElapsed >= maxTime) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= maxTime) {
          clearInterval(timer);
          return maxTime;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeElapsed]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = maxTime - timeElapsed;

  return (
    <span style={{ 
      color: remainingTime < 600 ? '#ff4d4f' : 'inherit', 
      fontWeight: remainingTime < 600 ? 'bold' : 'normal' 
    }}>
      {formatTime(timeElapsed)}
    </span>
  );
};

export default TimerColumn;
