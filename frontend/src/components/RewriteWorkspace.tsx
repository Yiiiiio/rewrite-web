import type { RewriteResponse } from "../types";
import { Spinner } from "./Spinner";
import { clsx } from "clsx";

type Props = {
  originalText: string;
  onChangeOriginal: (value: string) => void;
  onSubmitRewrite: () => void;
  rewriteResult: RewriteResponse | null;
  isLoading: boolean;
  onReset: () => void;
};

export function RewriteWorkspace({
  originalText,
  onChangeOriginal,
  onSubmitRewrite,
  rewriteResult,
  isLoading,
  onReset
}: Props) {
  const disableRewrite = !originalText.trim() || isLoading;
  return (
    <div className="rewrite-workspace">
      <div className="workspace-toolbar">
        <button
          className="btn primary"
          onClick={onSubmitRewrite}
          disabled={disableRewrite}
        >
          {isLoading ? "改写中..." : "一键改写"}
        </button>
        <button className="btn ghost" onClick={onReset} disabled={isLoading}>
          清空结果
        </button>
        <span className="toolbar-meta">
          字数：{originalText.trim().split(/\s+/).filter(Boolean).length} |{" "}
          估算 Tokens：≈
          {Math.ceil(originalText.length / 4)}
        </span>
      </div>

      <div className="workspace-grid">
        <div className="panel">
          <h2>原文输入</h2>
          <textarea
            className="panel-textarea"
            placeholder="粘贴或输入需要改写的文本..."
            value={originalText}
            onChange={(event) => onChangeOriginal(event.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className={clsx("panel", "panel-result")}>
          <div className="panel-header">
            <h2>改写结果</h2>
            {rewriteResult && (
              <div className="result-meta">
                {rewriteResult.taskId && (
                  <span>任务 ID: {rewriteResult.taskId}</span>
                )}
                <span>耗时: {rewriteResult.metrics.latencyMs} ms</span>
                <span>字数: {rewriteResult.metrics.wordCount}</span>
              </div>
            )}
          </div>
          <div className="panel-result-body">
            {isLoading && <Spinner />}
            {!isLoading && rewriteResult && (
              <>
                <pre className="result-text">{rewriteResult.rewrittenText}</pre>
                {rewriteResult.warnings.length > 0 && (
                  <ul className="warning-list">
                    {rewriteResult.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {!isLoading && !rewriteResult && (
              <p className="placeholder">
                改写完成后将在此显示结果与提示信息。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

