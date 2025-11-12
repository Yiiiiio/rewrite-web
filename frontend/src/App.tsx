import { useState } from "react";
import { RewriteWorkspace } from "./components/RewriteWorkspace";
import { SettingsPanel } from "./components/SettingsPanel";
import { useRewrite } from "./hooks/useRewrite";
import { HistoryPanel } from "./components/HistoryPanel";

export default function App() {
  const [originalText, setOriginalText] = useState("");
  const [activeLevel, setActiveLevel] = useState<"light" | "balance" | "heavy">(
    "balance"
  );
  const [protectedTerms, setProtectedTerms] = useState<string[]>([]);
  const rewrite = useRewrite();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Paperrewrite</h1>
        </div>
        <span className="badge beta">Beta</span>
      </header>

      <main className="app-main">
        <section className="workspace-section">
          <SettingsPanel
            level={activeLevel}
            onChangeLevel={setActiveLevel}
            temperature={rewrite.config.temperature}
            onChangeTemperature={(temperature) =>
              rewrite.setConfig((prev) => ({ ...prev, temperature }))
            }
            lengthPolicy={rewrite.config.lengthPolicy}
            onChangeLengthPolicy={(lengthPolicy) =>
              rewrite.setConfig((prev) => ({ ...prev, lengthPolicy }))
            }
            protectedTerms={protectedTerms}
            onChangeProtectedTerms={setProtectedTerms}
            keepCitations={rewrite.config.keepCitations}
            onToggleKeepCitations={(keepCitations) =>
              rewrite.setConfig((prev) => ({ ...prev, keepCitations }))
            }
          />

          <RewriteWorkspace
            originalText={originalText}
            onChangeOriginal={setOriginalText}
            onSubmitRewrite={() =>
              rewrite.mutate({
                originalText,
                level: activeLevel,
                protectedTerms,
                temperature: rewrite.config.temperature,
                lengthPolicy: rewrite.config.lengthPolicy,
                keepCitations: rewrite.config.keepCitations
              })
            }
            rewriteResult={rewrite.data}
            isLoading={rewrite.isLoading}
            onReset={() => rewrite.reset()}
          />
        </section>
        <aside className="history-wrapper">
          <HistoryPanel entries={rewrite.history} />
        </aside>
      </main>
    </div>
  );
}

