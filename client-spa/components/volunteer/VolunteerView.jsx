"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js";
import interactionPlugin from "@fullcalendar/interaction/index.js";
import { authFetch } from "@/utils/api";
import VolunteerTasks from "./VolunteerTasks";
import MyTasks from "./MyTasks";
import styles from "./Volunteer.module.css";
import { API_URL } from "@/utils/config";

export default function VolunteerView() {
  const [tasks,           setTasks]           = useState([]);
  const [signedUpTaskIds, setSignedUpTaskIds] = useState(new Set());
  const [selectedDate,    setSelectedDate]    = useState(null);
  const tasksRef = useRef(null);

  useEffect(() => {
    authFetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    authFetch(`${API_URL}/signups/my`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSignedUpTaskIds(new Set(data.map(s => s.task_id)));
        }
      });
  }, []);

  return (
    <section>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Wolontariat</h1>
          <p className={styles.pageSubtitle}>Przeglądaj zadania i zarządzaj swoim kalendarzem.</p>
        </div>
      </div>

      <div className={styles.calendarWrap}>
        <div className={styles.calendar}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            firstDay={1}
            height="auto"
            fixedWeekCount={false}
            showNonCurrentDates={false}
            dayMaxEvents={3}
            events={tasks.map(t => ({
              id: t.id,
              title: t.title.length > 22 ? t.title.slice(0, 22) + "…" : t.title,
              date: t.date,
            }))}
            headerToolbar={{ left: "", center: "title", right: "prev,next" }}
            dateClick={info => {
              setSelectedDate(info.dateStr);
              tasksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            dayCellClassNames={arg => {
              const y = arg.date.getFullYear();
              const m = String(arg.date.getMonth() + 1).padStart(2, "0");
              const d = String(arg.date.getDate()).padStart(2, "0");
              return `${y}-${m}-${d}` === selectedDate ? ["active"] : [];
            }}
          />
        </div>
      </div>

      <div ref={tasksRef}>
        <VolunteerTasks selectedDate={selectedDate} signedUpTaskIds={signedUpTaskIds} />
        <MyTasks />
      </div>
    </section>
  );
}
