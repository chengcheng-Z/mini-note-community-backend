import type { ReactNode } from "react";
import styles from "./WaterfallGrid.module.css";

export default function WaterfallGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
