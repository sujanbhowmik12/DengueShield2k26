"use client";

import { useEffect, useState } from "react";
import { Bell, Flame, Info, TriangleAlert, X } from "lucide-react";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.notifications) setNotifications(d.notifications);
      })
      .catch(() => {});
  }, []);

  const activeNotifs = notifications.filter(n => !dismissed.includes(n.id));

  if (activeNotifs.length === 0) return null;

  return (
    <div className="notif-bar-container">
      {activeNotifs.map((n) => {
        const icon = n.severity === "critical"
          ? <TriangleAlert size={16} className="notif-icon critical" />
          : n.type === "hotspot"
          ? <Flame size={16} className="notif-icon hotspot" />
          : <Info size={16} className="notif-icon info" />;

        return (
          <div key={n.id} className={`notif-banner ${n.severity}`}>
            <div className="notif-content">
              {icon}
              <span className="notif-title"><b>{n.title}:</b></span>
              <span className="notif-msg">{n.message}</span>
            </div>
            <button
              type="button"
              className="notif-dismiss"
              onClick={() => setDismissed(prev => [...prev, n.id])}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
