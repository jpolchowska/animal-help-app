"use client";

import VolunteerTasks from "./VolunteerTasks";
import MyTasks from "./MyTasks";
import styles from "./Volunteer.module.css";

export default function VolunteerView() {
  return (
    <section className={styles.container}>
      <VolunteerTasks />
      <MyTasks />
    </section>
  );
}