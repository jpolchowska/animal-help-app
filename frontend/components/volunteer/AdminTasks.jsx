"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./Volunteer.module.css";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
    time_from: "",
    time_to: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    date: "",
    time_from: "",
    time_to: ""
  });

  useEffect(() => {
    authFetch("http://localhost:3001/tasks")
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));
  }, []);

  async function add() {
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
  }

  async function remove(id) {
    await authFetch(`http://localhost:3001/tasks/${id}`, {
      method: "DELETE"
    });

    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditTask({
      title: task.title || "",
      description: task.description || "",
      date: task.date || "",
      time_from: task.time_from || "",
      time_to: task.time_to || ""
    });
  }

  async function saveEdit(id) {
    await authFetch(`http://localhost:3001/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(editTask)
    });

    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, ...editTask } : t))
    );

    setEditingId(null);
    setEditTask({
      title: "",
      description: "",
      date: "",
      time_from: "",
      time_to: ""
    });
  }

  return (
    <section>
      <div className={styles.header}>
        <h2>Wolontariat</h2>
      </div>
      <div className={styles.formColumn}>
        <input
          placeholder="Tytuł zadania"
          value={newTask.title}
          onChange={e =>
            setNewTask({ ...newTask, title: e.target.value })
          }
        />

        <textarea
          placeholder="Opis zadania"
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

        <button className={styles.primary} onClick={add}>
          Dodaj zadanie
        </button>
      </div>

      {tasks.map(t => (
        <div key={t.id} className={styles.card}>
          {editingId === t.id ? (
            <div className={styles.formColumn}>
              <input
                value={editTask.title}
                onChange={e =>
                  setEditTask({ ...editTask, title: e.target.value })
                }
              />

              <textarea
                value={editTask.description}
                onChange={e =>
                  setEditTask({
                    ...editTask,
                    description: e.target.value
                  })
                }
              />

              <div className={styles.row}>
                <input
                  type="date"
                  value={editTask.date}
                  onChange={e =>
                    setEditTask({ ...editTask, date: e.target.value })
                  }
                />
                <input
                  type="time"
                  value={editTask.time_from}
                  onChange={e =>
                    setEditTask({
                      ...editTask,
                      time_from: e.target.value
                    })
                  }
                />
                <input
                  type="time"
                  value={editTask.time_to}
                  onChange={e =>
                    setEditTask({
                      ...editTask,
                      time_to: e.target.value
                    })
                  }
                />
              </div>

              <div className={styles.row}>
                <button
                  className={styles.primary}
                  onClick={() => saveEdit(t.id)}
                >
                  Zapisz
                </button>

                <button
                  className={styles.primary}
                  onClick={() => setEditingId(null)}
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
                {(t.date || t.time_from) && (
                  <small>
                    {t.date} {t.time_from}–{t.time_to}
                  </small>
                )}
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
                  onClick={() => remove(t.id)}
                >
                  Usuń
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}