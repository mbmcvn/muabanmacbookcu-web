import { useState } from "react";
import { choices } from "./quiz-questions";
import { designBranch, developmentBranch, specializedBranch, videoBranch, type BranchChoice } from "./quiz-branches";
import type { DesignWorkload, DevelopmentWorkload, MainUse, QuizAnswers, SpecializedWorkload, VideoWorkload } from "./quiz-types";
import { branchIllustration, usageIllustration } from "./_lib/quiz-illustrations";
import { shouldShowSpecializedSoftwareField } from "./quiz-state";
import { QuizIllustration } from "./QuizIllustration";

interface Preview {
  src: string;
  alt: string;
}

function InlineBranch<T extends VideoWorkload | DesignWorkload | DevelopmentWorkload | SpecializedWorkload>({ prompt, support, choices, selected, onSelect, onPreview }: {
  prompt: string;
  support?: string;
  choices: BranchChoice<T>[];
  selected?: T;
  onSelect: (value: T) => void;
  onPreview: (value?: T) => void;
}) {
  return (
    <div className="usage-branch">
      <p>{prompt}</p>
      {support && <small className="usage-branch-support">{support}</small>}
      <div className="usage-branch-options" role="radiogroup">
        {choices.map((choice) => (
          <button
            type="button"
            key={choice.value}
            className="usage-branch-option"
            role="radio"
            aria-checked={selected === choice.value}
            data-selected={selected === choice.value}
            onClick={() => onSelect(choice.value)}
            onMouseEnter={() => onPreview(choice.value)}
            onMouseLeave={() => onPreview(undefined)}
            onFocus={() => onPreview(choice.value)}
            onBlur={() => onPreview(undefined)}
          >
            <strong>{choice.label}</strong>
            <small>{choice.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function selectedLabel<T extends string>(choices: BranchChoice<T>[], value: T): string {
  return choices.find((choice) => choice.value === value)?.label ?? value;
}

function getSelectedChildPreview(answers: QuizAnswers): Preview | undefined {
  for (const use of [...answers.uses].reverse()) {
    if (use === "video" && answers.videoWorkload) {
      const src = branchIllustration("video", answers.videoWorkload);
      if (src) return { src, alt: `${selectedLabel(videoBranch.choices, answers.videoWorkload)} trên MacBook` };
    }
    if (use === "design" && answers.designWorkload) {
      const src = branchIllustration("design", answers.designWorkload);
      if (src) return { src, alt: `${selectedLabel(designBranch.choices, answers.designWorkload)} trên MacBook` };
    }
  }
  return undefined;
}

export function UsageQuestion({
  answers,
  onToggle,
  onVideoWorkload,
  onDesignWorkload,
  onDevelopmentWorkload,
  onSpecializedWorkload,
  onSpecializedSoftware,
}: {
  answers: QuizAnswers;
  onToggle: (value: MainUse) => void;
  onVideoWorkload: (value: VideoWorkload) => void;
  onDesignWorkload: (value: DesignWorkload) => void;
  onDevelopmentWorkload: (value: DevelopmentWorkload) => void;
  onSpecializedWorkload: (value: SpecializedWorkload) => void;
  onSpecializedSoftware: (value: string) => void;
}) {
  const [hovered, setHovered] = useState<MainUse>();
  const [focused, setFocused] = useState<MainUse>();
  const [branchPreview, setBranchPreview] = useState<Preview>();
  const [editing, setEditing] = useState<{ video?: boolean; design?: boolean; development?: boolean; specialized?: boolean }>({});

  const selectedChildPreview = getSelectedChildPreview(answers);
  const preview = hovered
    ? usageIllustration(hovered)
    : focused
      ? usageIllustration(focused)
      : branchPreview
        ? branchPreview
        : selectedChildPreview ?? usageIllustration(answers.uses.at(-1));

  const setVideoPreview = (value?: VideoWorkload) => {
    const src = value ? branchIllustration("video", value) : undefined;
    setBranchPreview(src && value ? { src, alt: `${selectedLabel(videoBranch.choices, value)} trên MacBook` } : undefined);
  };
  const setDesignPreview = (value?: DesignWorkload) => {
    const src = value ? branchIllustration("design", value) : undefined;
    setBranchPreview(src && value ? { src, alt: `${selectedLabel(designBranch.choices, value)} trên MacBook` } : undefined);
  };
  const setUsagePreview = (use: MainUse, active: boolean) => {
    setBranchPreview(active ? usageIllustration(use) : undefined);
  };

  return (
    <div className="usage-layout">
      <div className="quiz-options usage-options" role="group" aria-label="Nhu cầu sử dụng chính">
        {choices.uses.map((choice) => {
          const selected = answers.uses.includes(choice.value);
          const isVideo = choice.value === "video";
          const isDesign = choice.value === "design";
          const isDevelopment = choice.value === "development";
          const isSpecialized = choice.value === "specialized";
          const videoComplete = isVideo && Boolean(answers.videoWorkload);
          const designComplete = isDesign && Boolean(answers.designWorkload);
          const developmentComplete = isDevelopment && Boolean(answers.developmentWorkload);
          const specializedComplete = isSpecialized && Boolean(answers.specializedWorkload);
          const expanded = selected && (
            (isVideo && (!videoComplete || editing.video))
            || (isDesign && (!designComplete || editing.design))
            || (isDevelopment && (!developmentComplete || editing.development))
            || (isSpecialized && (!specializedComplete || editing.specialized))
          );
          return (
            <div className="usage-option-group" data-expanded={expanded} key={choice.value}>
              <button
                type="button"
                className="quiz-option"
                aria-pressed={selected}
                data-selected={selected}
                onClick={() => onToggle(choice.value)}
                onMouseEnter={() => setHovered(choice.value)}
                onMouseLeave={() => setHovered(undefined)}
                onFocus={() => setFocused(choice.value)}
                onBlur={() => setFocused(undefined)}
              >
                <span className="quiz-option-marker" aria-hidden="true">{selected ? "✓" : ""}</span>
                <span><strong>{choice.label}</strong></span>
              </button>

              {selected && isVideo && videoComplete && !editing.video && (
                <button
                  type="button"
                  className="usage-branch-summary"
                  onClick={() => { setVideoPreview(answers.videoWorkload); setEditing((current) => ({ ...current, video: true })); }}
                  onMouseEnter={() => setVideoPreview(answers.videoWorkload)}
                  onMouseLeave={() => setBranchPreview(undefined)}
                  onFocus={() => setVideoPreview(answers.videoWorkload)}
                  onBlur={() => setBranchPreview(undefined)}
                >
                  <span>Đã chọn: <strong>{selectedLabel(videoBranch.choices, answers.videoWorkload!)}</strong></span>
                  <small>Thay đổi</small>
                </button>
              )}
              {selected && isVideo && (!videoComplete || editing.video) && (
                <InlineBranch
                  {...videoBranch}
                  selected={answers.videoWorkload}
                  onPreview={setVideoPreview}
                  onSelect={(value) => { onVideoWorkload(value); setVideoPreview(value); setEditing((current) => ({ ...current, video: false })); }}
                />
              )}

              {selected && isDesign && designComplete && !editing.design && (
                <button
                  type="button"
                  className="usage-branch-summary"
                  onClick={() => { setDesignPreview(answers.designWorkload); setEditing((current) => ({ ...current, design: true })); }}
                  onMouseEnter={() => setDesignPreview(answers.designWorkload)}
                  onMouseLeave={() => setBranchPreview(undefined)}
                  onFocus={() => setDesignPreview(answers.designWorkload)}
                  onBlur={() => setBranchPreview(undefined)}
                >
                  <span>Đã chọn: <strong>{selectedLabel(designBranch.choices, answers.designWorkload!)}</strong></span>
                  <small>Thay đổi</small>
                </button>
              )}
              {selected && isDesign && (!designComplete || editing.design) && (
                <InlineBranch
                  {...designBranch}
                  selected={answers.designWorkload}
                  onPreview={setDesignPreview}
                  onSelect={(value) => { onDesignWorkload(value); setDesignPreview(value); setEditing((current) => ({ ...current, design: false })); }}
                />
              )}

              {selected && isDevelopment && developmentComplete && !editing.development && (
                <button
                  type="button"
                  className="usage-branch-summary"
                  onClick={() => setEditing((current) => ({ ...current, development: true }))}
                  onMouseEnter={() => setUsagePreview("development", true)}
                  onMouseLeave={() => setUsagePreview("development", false)}
                  onFocus={() => setUsagePreview("development", true)}
                  onBlur={() => setUsagePreview("development", false)}
                >
                  <span>Đã chọn: <strong>{selectedLabel(developmentBranch.choices, answers.developmentWorkload!)}</strong></span>
                  <small>Thay đổi</small>
                </button>
              )}
              {selected && isDevelopment && (!developmentComplete || editing.development) && (
                <InlineBranch
                  {...developmentBranch}
                  selected={answers.developmentWorkload}
                  onPreview={(value) => setUsagePreview("development", Boolean(value))}
                  onSelect={(value) => { onDevelopmentWorkload(value); setEditing((current) => ({ ...current, development: false })); }}
                />
              )}

              {selected && isSpecialized && specializedComplete && !editing.specialized && (
                <button
                  type="button"
                  className="usage-branch-summary"
                  onClick={() => setEditing((current) => ({ ...current, specialized: true }))}
                  onMouseEnter={() => setUsagePreview("specialized", true)}
                  onMouseLeave={() => setUsagePreview("specialized", false)}
                  onFocus={() => setUsagePreview("specialized", true)}
                  onBlur={() => setUsagePreview("specialized", false)}
                >
                  <span>Đã chọn: <strong>{selectedLabel(specializedBranch.choices, answers.specializedWorkload!)}</strong></span>
                  <small>Thay đổi</small>
                </button>
              )}
              {selected && isSpecialized && (!specializedComplete || editing.specialized) && (
                <InlineBranch
                  {...specializedBranch}
                  selected={answers.specializedWorkload}
                  onPreview={(value) => setUsagePreview("specialized", Boolean(value))}
                  onSelect={(value) => { onSpecializedWorkload(value); setEditing((current) => ({ ...current, specialized: false })); }}
                />
              )}
              {isSpecialized && shouldShowSpecializedSoftwareField(answers) && (
                <label className="quiz-field usage-software-field">
                  <span>Bạn đang dùng phần mềm nào?</span>
                  <small>Nhập tên nếu nhớ. MBMC sẽ kiểm tra cách chạy phù hợp trước khi chốt máy.</small>
                  <input
                    value={answers.specializedSoftware ?? ""}
                    onChange={(event) => onSpecializedSoftware(event.target.value)}
                    placeholder="Ví dụ: Revit, 3ds Max…"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
      <aside className="usage-preview" aria-live="polite">
        <QuizIllustration key={preview.src} src={preview.src} alt={preview.alt} className="usage-preview-image" sizes="(max-width: 720px) calc(100vw - 4rem), 20rem" />
      </aside>
    </div>
  );
}
