import type { RewriteLevel } from "../types";

type Props = {
  level: RewriteLevel;
  onChangeLevel: (level: RewriteLevel) => void;
  temperature: number;
  onChangeTemperature: (temperature: number) => void;
  lengthPolicy: "shorter" | "longer" | "keep";
  onChangeLengthPolicy: (
    policy: "shorter" | "longer" | "keep"
  ) => void;
  protectedTerms: string[];
  onChangeProtectedTerms: (terms: string[]) => void;
  keepCitations: boolean;
  onToggleKeepCitations: (value: boolean) => void;
};

const LEVELS: { value: RewriteLevel; label: string; description: string }[] = [
  {
    value: "light",
    label: "轻度",
    description: "修正语法与语气，尽量保持原句式与术语。"
  },
  {
    value: "balance",
    label: "平衡",
    description: "在保持语义一致的前提下进行适度重写与结构微调。"
  },
  {
    value: "heavy",
    label: "重度",
    description: "对表达进行大幅调整，强调原创表达，严格防止事实偏移。"
  }
];

export function SettingsPanel({
  level,
  onChangeLevel,
  temperature,
  onChangeTemperature,
  lengthPolicy,
  onChangeLengthPolicy,
  protectedTerms,
  onChangeProtectedTerms,
  keepCitations,
  onToggleKeepCitations
}: Props) {
  return (
    <aside className="settings-panel">
      <h2>改写参数</h2>

      <section>
        <h3>改写级别</h3>
        <div className="level-options">
          {LEVELS.map((option) => (
            <button
              key={option.value}
              className={level === option.value ? "level active" : "level"}
              onClick={() => onChangeLevel(option.value)}
              type="button"
            >
              <span className="level-title">{option.label}</span>
              <span className="level-desc">{option.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>模型参数</h3>
        <label className="field">
          <span>温度（创造性）</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(event) =>
              onChangeTemperature(Number(event.target.value))
            }
          />
          <span className="field-tip">{temperature.toFixed(1)}</span>
        </label>

        <label className="field">
          <span>篇幅策略</span>
          <select
            value={lengthPolicy}
            onChange={(event) =>
              onChangeLengthPolicy(
                event.target.value as "shorter" | "longer" | "keep"
              )
            }
          >
            <option value="shorter">略短（-10%）</option>
            <option value="keep">保持相近</option>
            <option value="longer">略长（+10%）</option>
          </select>
        </label>

        <label className="field checkbox">
          <input
            type="checkbox"
            checked={keepCitations}
            onChange={(event) => onToggleKeepCitations(event.target.checked)}
          />
          <span>保留引用标记（如 [1]、(Smith, 2021) 等）</span>
        </label>
      </section>

      <section>
        <h3>术语保护</h3>
        <textarea
          className="panel-textarea small"
          placeholder="每行一个术语或专有名词，改写时保持原样。"
          value={protectedTerms.join("\n")}
          onChange={(event) =>
            onChangeProtectedTerms(
              event.target.value
                .split("\n")
                .map((term) => term.trim())
                .filter(Boolean)
            )
          }
        />
      </section>
    </aside>
  );
}

