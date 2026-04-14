import { useEffect, useState } from "react";
import "./top-loading-bar.css";

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="top-loading-bar" style={{ width: `${progress}%` }}></div>
  );
};

export default LoadingBar;
