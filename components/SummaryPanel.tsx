"use client";

import type { SummaryResult } from "@/lib/summary";
import styles from "./SummaryPanel.module.css";

interface SummaryPanelProps {
  result: SummaryResult | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function SummaryPanel({ result, loading, error, onClose }: SummaryPanelProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>总体点评</span>
          <button className={styles.close} onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        {loading && <p className={styles.loading}>正在整理这段讲话的总体点评…</p>}

        {!loading && error && <p className={styles.error}>{error}</p>}

        {!loading && result && (
          <div className={styles.sections}>
            <section className={styles.section}>
              <span className={`${styles.sectionLabel} ${styles.good}`}>做得好的地方</span>
              <p className={styles.sectionText}>{result.strengths}</p>
            </section>
            <section className={styles.section}>
              <span className={`${styles.sectionLabel} ${styles.improve}`}>可以改进</span>
              <p className={styles.sectionText}>{result.improvements}</p>
            </section>
            <section className={styles.section}>
              <span className={styles.sectionLabel}>内容总结</span>
              <p className={styles.sectionText}>{result.summary}</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
