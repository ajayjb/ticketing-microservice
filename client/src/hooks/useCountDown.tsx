import React, { useEffect } from "react";

const useCountDown = ({ expiresAt }: { expiresAt: string }) => {
  const [timeRemaining, setTimeRemaining] = React.useState({
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();

      if (diff < 0) {
        clearInterval(interval);
        setTimeRemaining({ minutes: 0, seconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setTimeRemaining({ minutes, seconds });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [expiresAt]);

  return timeRemaining;
};

export default useCountDown;
