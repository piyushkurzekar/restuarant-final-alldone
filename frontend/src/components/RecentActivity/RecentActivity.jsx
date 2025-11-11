import React from 'react';
import styles from './RecentActivity.module.css';

const RecentActivity = () => {
  const activities = [
    { text: "Mr. Sharma", time: "2 hours ago", color: "green" },
    { text: "Mr. Gupta", time: "3 hours ago", color: "blue" },
    { text: "Mr. Mehta", time: "9 hours ago", color: "orange" },
  ];

  return (
    <div className={`${styles.mainCard} card rounded-4 p-4`}>
      <ul className={styles.activityList}>
        {activities.map((item, idx) => (
          <li key={idx} style={{ "--bullet-color": item.color }}>
            {item.text}
            <span>{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
