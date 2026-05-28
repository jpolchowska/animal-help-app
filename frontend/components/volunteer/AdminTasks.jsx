"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { authFetch } from "@/utils/api";
import styles from "./Volunteer.module.css";

function formatPolishDate(dateStr) {
  const date = new Date(dateStr);
  const formatted = date.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function AdminTasks() {
  const [tasks,          setTasks]          = useState([]);
  const [selectedDate,   setSelectedDate]   = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId,      setEditingId]      = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [errors,         setErrors]         = useState({});
  const tasksRef = useRef(null);

  const emptyForm = { title: "", description: "", date: "", time_from: "", time_to: "" };
  const [newTask,  setNewTask]  = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  function scrollToTasks() { tasksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  function validateTask(task) {
    const e = {};
    if (!task.title || task.title.trim().length < 3) e.title = "Tytuł musi mieć co najmniej 3 znaki";
    if (!task.date) e.date = "Data jest wymagana";
    if (task.time_from && task.time_to && task.time_from >= task.time_to) e.time = "Godzina zakończenia musi być później";
    return e;
  }

  useEffect(() => {
    authFetch("http://localhost:3001/tasks")
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function addTask() {
    const errs = validateTask(newTask);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const res  = await authFetch("http://localhost:3001/tasks", { method: "POST", body: JSON.stringify(newTask) });
    const data = await res.json();
    setTasks(prev => [...prev, { id: data.id, ...newTask }]);
    setNewTask(emptyForm);
    setShowCreateForm(false);
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditForm({ title: task.title || "", description: task.description || "", date: task.date || "", time_from: task.time_from || "", time_to: task.time_to || "" });
    setErrors({});
  }

  async function saveEdit(id) {
    const errs = validateTask(editForm);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    await authFetch(`http://localhost:3001/tasks/${id}`, { method: "PUT", body: JSON.stringify(editForm) });
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...editForm } : t)));
    setEditingId(null);
  }

  async function removeTask(id) {
    await authFetch(`http://localhost:3001/tasks/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const visibleTasks = selectedDate ? tasks.filter(t => t.date === selectedDate) : tasks;

  return (
    <section>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Wolontariat</h1>
          <p className={styles.pageSubtitle}>Zarządzaj zadaniami i kalendarzem wolontariuszy.</p>
        </div>
      </div>


      {/* Calendar */}
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
            editable
            events={tasks.map(t => ({
              id: t.id,
              title: t.title.length > 22 ? t.title.slice(0, 22) + "…" : t.title,
              date: t.date,
            }))}
            headerToolbar={{ left: "", center: "title", right: "prev,next" }}
            dateClick={info => { setSelectedDate(info.dateStr); scrollToTasks(); }}
            dayCellClassNames={arg => {
              const y = arg.date.getFullYear();
              const m = String(arg.date.getMonth() + 1).padStart(2, "0");
              const d = String(arg.date.getDate()).padStart(2, "0");
              return `${y}-${m}-${d}` === selectedDate ? ["active"] : [];
            }}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div>
        <button className={styles.btnAdd} onClick={() => setShowCreateForm(p => !p)}>
          <i className="fa-solid fa-plus" /> Dodaj zadanie
        </button>
        <button
          className={styles.btnSecondary}
          onClick={() => { setSelectedDate(null); scrollToTasks(); }}
          disabled={!selectedDate}
        >
          <i className={`fa-solid ${selectedDate ? "fa-arrow-left" : "fa-list"}`} />
          Wszystkie zadania
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className={styles.formCard}>
          <input placeholder="Tytuł zadania" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
          {errors.title && <p className={styles.fieldError}>{errors.title}</p>}
          <textarea placeholder="Opis zadania (opcjonalnie)" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
          <div className={styles.formRow}>
            <input type="date" value={newTask.date} onChange={e => setNewTask({ ...newTask, date: e.target.value })} />
            <input type="time" value={newTask.time_from} onChange={e => setNewTask({ ...newTask, time_from: e.target.value })} />
            <input type="time" value={newTask.time_to}   onChange={e => setNewTask({ ...newTask, time_to:   e.target.value })} />
          </div>
          {(errors.date || errors.time) && <p className={styles.fieldError}>{errors.date || errors.time}</p>}
          <div className={styles.formBtns}>
            <button className={styles.btnPrimary} onClick={addTask}>Zapisz</button>
            <button className={styles.btnSecondary} onClick={() => setShowCreateForm(false)}>Anuluj</button>
          </div>
        </div>
      )}

      {/* Tasks header */}
      <div className={styles.tasksHeader} ref={tasksRef}>
        <p className={styles.tasksTitle}>
          {selectedDate ? `Zadania: ${formatPolishDate(selectedDate)}` : "Wszystkie zadania"}
        </p>
      </div>

      {/* Tasks list */}
      <div>
        {visibleTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-regular fa-calendar-xmark" />
            <p>Brak zadań{selectedDate ? " tego dnia" : ""}</p>
          </div>
        ) : visibleTasks.map(t => (
          <div key={t.id} className={styles.card}>
            {editingId === t.id ? (
              <div className={styles.formCard} style={{ margin: 0, boxShadow: "none", border: "none", padding: 0, flex: 1 }}>
                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                {errors.title && <p className={styles.fieldError}>{errors.title}</p>}
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                <div className={styles.formRow}>
                  <input type="date" value={editForm.date}      onChange={e => setEditForm({ ...editForm, date:      e.target.value })} />
                  <input type="time" value={editForm.time_from}  onChange={e => setEditForm({ ...editForm, time_from: e.target.value })} />
                  <input type="time" value={editForm.time_to}    onChange={e => setEditForm({ ...editForm, time_to:   e.target.value })} />
                </div>
                {(errors.date || errors.time) && <p className={styles.fieldError}>{errors.date || errors.time}</p>}
                <div className={styles.formBtns}>
                  <button className={styles.btnPrimary}   onClick={() => saveEdit(t.id)}>Zapisz</button>
                  <button className={styles.btnSecondary} onClick={() => setEditingId(null)}>Anuluj</button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.cardBody}>
                  <p className={styles.cardTitle}>{t.title}</p>
                  {t.description && <p className={styles.cardDesc}>{t.description}</p>}
                  <div className={styles.cardMeta}>
                    {t.date      && <span className={styles.dateBadge}>{formatPolishDate(t.date)}</span>}
                    {t.time_from && <span className={styles.timeBadge}>{t.time_from}–{t.time_to}</span>}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.btnSecondary} onClick={() => startEdit(t)}>Edytuj</button>
                  <button className={styles.btnDanger}    onClick={() => removeTask(t.id)}>Usuń</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
