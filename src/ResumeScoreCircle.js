import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function ResumeScoreCircle({ percentage }) {
  // Determine stroke color based on percentage
  let strokeColor = '#f44336'; // red by default
  if (percentage > 80) {
    strokeColor = '#4caf50'; // green
  } else if (percentage > 65) {
    strokeColor = '#ffeb3b'; // yellow
  }

  return (
    <div style={{ width: 120, height: 120 }}>
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        strokeWidth={8}
        styles={buildStyles({
          textSize: '24px',
          pathColor: strokeColor,
          textColor: '#fff',
          trailColor: '#333',
          pathTransitionDuration: 0.5,
          // To make the stroke coverage exactly correspond to the percentage:
          // path length is automatically handled by the library
        })}
      />
    </div>
  );
}

export default ResumeScoreCircle;
