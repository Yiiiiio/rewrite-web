import type { HistoryEntry } from "../hooks/useRewrite";
import type { RewriteLevel } from "../types";

const LEVEL_LABEL: Record<RewriteLevel, string> = {
  light: "轻度",
  balance: "平衡",
  heavy: "重度"
};

type Props = {
  entries: HistoryEntry[];
};

export function HistoryPanel({ entries }: Props) {
  return (
    <aside className="history-panel">
      <header>
        <h2>改写历史</h2>
        <p>最近 10 次改写记录，仅保存在本地。</p>
      </header>
      {entries.length === 0 && (
        <p className="placeholder">暂无历史记录，完成首个改写后即可查看。</p>
      )}
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} className="history-entry">
            <div className="history-meta">
              <span className="chip">{LEVEL_LABEL[entry.level]}</span>
              <time>{new Date(entry.createdAt).toLocaleString()}</time>
            </div>
            <div className="history-body">
              <p>
                <strong>原文</strong>
                <span>{entry.originalPreview}...</span>
              </p>
              <p>
                <strong>改写</strong>
                <span>{entry.resultPreview}...</span>
              </p>
            </div>
            <span className="history-stats">
              字数 {entry.wordCount} · 任务 {entry.id.slice(0, 8)}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

