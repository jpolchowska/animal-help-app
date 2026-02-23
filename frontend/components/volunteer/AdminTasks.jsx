"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { authFetch } from "@/utils/api";
import styles from "./Volunteer.module.css";

export default function AdminVolunteer() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const tasksRef = useRef(null);

  const [errors, setErrors] = useState({});

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
    time_from: "",
    time_to: ""
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    time_from: "",
    time_to: ""
  });

  function scrollToTasks() {
    tasksRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  /* ================= VALIDATION ================= */

  function validateTask(task) {
    const newErrors = {};

    if (!task.title || task.title.trim().length < 3) {
      newErrors.title = "Tytuł musi mieć co najmniej 3 znaki";
    }

    if (!task.date) {
      newErrors.date = "Data jest wymagana";
    }

    if (task.time_from && task.time_to) {
      if (task.time_from >= task.time_to) {
        newErrors.time = "Godzina zakończenia musi być później";
      }
    }

    return newErrors;
  }

  /* ================= FETCH ================= */

  useEffect(() => {
    authFetch("http://localhost:3001/tasks")
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  /* ================= CREATE ================= */

  async function addTask() {
    const validationErrors = validateTask(newTask);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const res = await authFetch("http://localhost:3001/tasks", {
      method: "POST",
      body: JSON.stringify(newTask)
    });

    const data = await res.json();

    setTasks(prev => [...prev, { id: data.id, ...newTask }]);

    setNewTask({
      title: "",
      description: "",
      date: "",
      time_from: "",
      time_to: ""
    });

    setShowCreateForm(false);
  }

  /* ================= EDIT ================= */

  function startEdit(task) {
    setEditingId(task.id);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      date: task.date || "",
      time_from: task.time_from || "",
      time_to: task.time_to || ""
    });
    setErrors({});
  }

  async function saveEdit(id) {
    const validationErrors = validateTask(editForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    await authFetch(`http://localhost:3001/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(editForm)
    });

    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, ...editForm } : t))
    );

    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setErrors({});
  }

  /* ================= DELETE ================= */

  async function removeTask(id) {
    await authFetch(`http://localhost:3001/tasks/${id}`, {
      method: "DELETE"
    });

    setTasks(prev => prev.filter(t => t.id !== id));
  }

  /* ================= VIEW ================= */

  const visibleTasks = selectedDate
    ? tasks.filter(t => t.date === selectedDate)
    : tasks;

  return (
    <section>
      <div className={styles.header}>
        <h2>Wolontariat</h2>
      </div>

      {loading && <div className={styles.loading}>Ładowanie…</div>}

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
            title:
              t.title.length > 20
                ? t.title.slice(0, 20) + "…"
                : t.title,
            date: t.date,
            backgroundColor: "rgba(30, 58, 138, 0.08)",
            borderColor: "rgba(30, 58, 138, 0.3)",
            textColor: "#1e3a8a"
          }))}
          headerToolbar={{
            left: "",
            center: "title",
            right: "prev,next"
          }}
          dateClick={info => {
            setSelectedDate(info.dateStr);
            scrollToTasks();
          }}
          dayCellClassNames={arg => {
            const y = arg.date.getFullYear();
            const m = String(arg.date.getMonth() + 1).padStart(2, "0");
            const d = String(arg.date.getDate()).padStart(2, "0");
            const localDate = `${y}-${m}-${d}`;
            return localDate === selectedDate ? ["active"] : [];
          }}
        />
      </div>

      <button
        className={styles.primary}
        onClick={() => setShowCreateForm(prev => !prev)}
      >
        + Dodaj zadanie
      </button>

      <button
        className={`${styles.secondary} ${
          selectedDate ? styles.secondaryActive : ""
        }`}
        onClick={() => {
          setSelectedDate(null);
          scrollToTasks();
        }}
        disabled={!selectedDate}
      >
        <i
          className={`fa-solid ${
            selectedDate ? "fa-arrow-left" : "fa-list"
          } ${styles.icon}`}
        />
        Wszystkie zadania
      </button>

      {/* ===== CREATE FORM ===== */}
      {showCreateForm && (
        <div className={styles.createFormWrapper}>
          <div className={styles.formColumn}>
            <input
              placeholder="Tytuł zadania"
              value={newTask.title}
              onChange={e =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            {errors.title && (
              <small className={styles.error}>{errors.title}</small>
            )}

            <textarea
              placeholder="Opis zadania (opcjonalnie)"
              value={newTask.description}
              onChange={e =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />

            <div className={styles.row}>
              <input
                type="date"
                value={newTask.date}
                onChange={e =>
                  setNewTask({ ...newTask, date: e.target.value })
                }
              />
              <input
                type="time"
                value={newTask.time_from}
                onChange={e =>
                  setNewTask({ ...newTask, time_from: e.target.value })
                }
              />
              <input
                type="time"
                value={newTask.time_to}
                onChange={e =>
                  setNewTask({ ...newTask, time_to: e.target.value })
                }
              />
            </div>

            {(errors.date || errors.time) && (
              <small className={styles.error}>
                {errors.date || errors.time}
              </small>
            )}

            <div className={styles.row}>
              <button className={styles.primary} onClick={addTask}>
                Zapisz
              </button>
              <button
                className={styles.primary}
                onClick={() => setShowCreateForm(false)}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tasksHeader}>
        <h3>
          {selectedDate
            ? `Zadania na: ${formatPolishDate(selectedDate)}`
            : "Wszystkie zadania"}
        </h3>
      </div>

      {/* ===== TASKS ===== */}
      <div className={styles.tasksSection} ref={tasksRef}>
        {visibleTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-regular fa-calendar-xmark" />
            <p>Brak zadań tego dnia</p>
          </div>
        ) : (
          visibleTasks.map(t => (
            <div key={t.id} className={styles.card}>
              {editingId === t.id ? (
                <div className={styles.formColumn}>
                  <input
                    value={editForm.title}
                    onChange={e =>
                      setEditForm({
                        ...editForm,
                        title: e.target.value
                      })
                    }
                  />
                  {errors.title && (
                    <small className={styles.error}>{errors.title}</small>
                  )}

                  <textarea
                    value={editForm.description}
                    onChange={e =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value
                      })
                    }
                  />

                  <div className={styles.row}>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          date: e.target.value
                        })
                      }
                    />
                    <input
                      type="time"
                      value={editForm.time_from}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          time_from: e.target.value
                        })
                      }
                    />
                    <input
                      type="time"
                      value={editForm.time_to}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          time_to: e.target.value
                        })
                      }
                    />
                  </div>

                  {(errors.date || errors.time) && (
                    <small className={styles.error}>
                      {errors.date || errors.time}
                    </small>
                  )}

                  <div className={styles.row}>
                    <button
                      className={styles.primary}
                      onClick={() => saveEdit(t.id)}
                    >
                      Zapisz
                    </button>
                    <button
                      className={styles.primary}
                      onClick={cancelEdit}
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <strong>{t.title}</strong>
                    {t.description && <p>{t.description}</p>}
                    <div className={styles.meta}>
                      <span className={styles.dateBadge}>
                        {formatPolishDate(t.date)}
                      </span>

                      {t.time_from && (
                        <span className={styles.time}>
                          {t.time_from}–{t.time_to}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.row}>
                    <button
                      className={styles.primary}
                      onClick={() => startEdit(t)}
                    >
                      Edytuj
                    </button>
                    <button
                      className={styles.delete}
                      onClick={() => removeTask(t.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function formatPolishDate(dateStr) {
  const date = new Date(dateStr);
  const formatted = date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long"
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}