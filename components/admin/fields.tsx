"use client";

/* eslint-disable @next/next/no-img-element -- admin previews show arbitrary URLs, including hosts not configured for next/image */
import { ArrowDown, ArrowUp, ImageOff, Plus, Trash2, X } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { validateImageSrc } from "@/lib/admin/media";
import { move, newId } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import type { ImageAsset } from "@/types/content";
import ui from "./admin.module.css";
import styles from "./fields.module.css";
import { ImageSourceInput } from "./ImageSourceInput";

export { ImageSourceInput };

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  counter?: { value: number; max: number };
}

/** Label + control + hint + accessible error message. */
export function Field({ label, hint, error, children, counter }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {counter && (
          <span className={cx(styles.counter, counter.value > counter.max && styles.counterOver)}>
            {counter.value}/{counter.max}
          </span>
        )}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; error?: string; counterMax?: number };

export function TextInput({ label, hint, error, counterMax, className, ...rest }: TextInputProps) {
  const length = typeof rest.value === "string" ? rest.value.length : undefined;
  return (
    <Field label={label} hint={hint} error={error} counter={counterMax && length !== undefined ? { value: length, max: counterMax } : undefined}>
      {({ id, describedBy, invalid }) => (
        <input id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={cx(styles.input, className)} {...rest} />
      )}
    </Field>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: ReactNode; error?: string; counterMax?: number };

export function TextArea({ label, hint, error, counterMax, className, ...rest }: TextAreaProps) {
  const length = typeof rest.value === "string" ? rest.value.length : undefined;
  return (
    <Field label={label} hint={hint} error={error} counter={counterMax && length !== undefined ? { value: length, max: counterMax } : undefined}>
      {({ id, describedBy, invalid }) => (
        <textarea id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={cx(styles.input, styles.textarea, className)} {...rest} />
      )}
    </Field>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: ReactNode; error?: string; options: Array<{ value: string; label: string }> };

export function Select({ label, hint, error, options, className, ...rest }: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <select id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={cx(styles.input, className)} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Toggle({ label, description, checked, onChange, disabled }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <div className={styles.toggleRow}>
      <div>
        <label htmlFor={id} className={styles.toggleLabel}>
          {label}
        </label>
        {description && <p className={styles.hint}>{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cx(styles.switch, checked && styles.switchOn)}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.switchThumb} />
      </button>
    </div>
  );
}

/** Editable list of strings with add, remove and reorder (goals, features, tags, responsibilities…). */
export function ListEditor({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline = false,
  error,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  error?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, v]);
    setDraft("");
  };
  const groupId = useId();
  return (
    <div className={styles.field} role="group" aria-labelledby={groupId}>
      <span id={groupId} className={styles.label}>
        {label}
      </span>
      {value.length > 0 && (
        <ol className={styles.list}>
          {value.map((item, i) => (
            <li key={`${i}-${item.slice(0, 12)}`} className={styles.listItem}>
              {multiline ? (
                <textarea
                  aria-label={`${label} item ${i + 1}`}
                  className={cx(styles.input, styles.listInput)}
                  rows={2}
                  value={item}
                  onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
                />
              ) : (
                <input
                  aria-label={`${label} item ${i + 1}`}
                  className={cx(styles.input, styles.listInput)}
                  value={item}
                  onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
                />
              )}
              <div className={styles.listActions}>
                <button type="button" className={ui.iconBtn} onClick={() => onChange(move(value, i, -1))} disabled={i === 0} aria-label={`Move item ${i + 1} up`}>
                  <ArrowUp size={14} aria-hidden="true" />
                </button>
                <button type="button" className={ui.iconBtn} onClick={() => onChange(move(value, i, 1))} disabled={i === value.length - 1} aria-label={`Move item ${i + 1} down`}>
                  <ArrowDown size={14} aria-hidden="true" />
                </button>
                <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove item ${i + 1}`}>
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className={styles.addRow}>
        <input
          className={styles.input}
          value={draft}
          placeholder={placeholder ?? "Add an item and press Enter"}
          aria-label={`Add to ${label}`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className={ui.btn} onClick={add} disabled={!draft.trim()}>
          <Plus size={15} aria-hidden="true" /> Add
        </button>
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Image preview that reports load failures instead of showing a broken image. */
export function ImagePreview({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const valid = src && validateImageSrc(src) === true;
  if (!valid || failed === src) {
    const reason = "Preview unavailable — check the URL";
    return (
      <div className={cx(styles.preview, styles.previewEmpty, className)} role="img" aria-label={src ? "Image failed to load" : "No image"}>
        <ImageOff size={22} aria-hidden="true" />
        <span>{src ? reason : "No image yet"}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={cx(styles.preview, className)} onError={() => setFailed(src)} loading="lazy" />;
}

/** Image URL or uploaded file, plus alt text, with live preview. */
export function ImageUrlField({ label, value, onChange, error }: { label: string; value: ImageAsset; onChange: (v: ImageAsset) => void; error?: string }) {
  const srcCheck = value.src ? validateImageSrc(value.src) : true;
  return (
    <div className={styles.imageField}>
      <ImagePreview src={value.src} alt={value.alt} />
      <div className={styles.imageInputs}>
        <ImageSourceInput label={label} value={value.src} onChange={(src) => onChange({ ...value, src })} error={error ?? (srcCheck === true ? undefined : srcCheck)} />
        <TextInput label="Alt text" value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} placeholder="Describe the image for screen readers" />
      </div>
    </div>
  );
}

/** Add, edit, reorder and remove gallery images; each one is a URL or an uploaded file. */
export function GalleryEditor({ value, onChange }: { value: ImageAsset[]; onChange: (v: ImageAsset[]) => void }) {
  // Stable row keys so each row's URL draft / picked file follows its image when reordering.
  const [keys, setKeys] = useState(() => value.map((_, i) => `img-${i}`));
  const rowKeys = keys.length === value.length ? keys : value.map((_, i) => keys[i] ?? `img-extra-${i}`);

  function update(next: ImageAsset[], nextKeys: string[]) {
    setKeys(nextKeys);
    onChange(next);
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>Gallery images ({value.length})</span>
      <ol className={styles.gallery}>
        {value.map((image, i) => (
          <li key={rowKeys[i]} className={styles.galleryItem}>
            <ImagePreview src={image.src} alt={image.alt} className={styles.galleryPreview} />
            <div className={styles.galleryInputs}>
              <ImageSourceInput
                label={`Gallery image ${i + 1}`}
                value={image.src}
                onChange={(src) => onChange(value.map((img, j) => (j === i ? { ...img, src } : img)))}
                error={image.src && validateImageSrc(image.src) !== true ? (validateImageSrc(image.src) as string) : undefined}
              />
              <input
                className={styles.input}
                aria-label={`Gallery image ${i + 1} alt text`}
                value={image.alt}
                placeholder="Alt text"
                onChange={(e) => onChange(value.map((img, j) => (j === i ? { ...img, alt: e.target.value } : img)))}
              />
            </div>
            <div className={styles.listActions}>
              <button type="button" className={ui.iconBtn} onClick={() => update(move(value, i, -1), move(rowKeys, i, -1))} disabled={i === 0} aria-label={`Move image ${i + 1} up`}>
                <ArrowUp size={14} aria-hidden="true" />
              </button>
              <button type="button" className={ui.iconBtn} onClick={() => update(move(value, i, 1), move(rowKeys, i, 1))} disabled={i === value.length - 1} aria-label={`Move image ${i + 1} down`}>
                <ArrowDown size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cx(ui.iconBtn, ui.iconBtnDanger)}
                onClick={() => update(value.filter((_, j) => j !== i), rowKeys.filter((_, j) => j !== i))}
                aria-label={`Remove image ${i + 1}`}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className={ui.btn} onClick={() => update([...value, { src: "", alt: "" }], [...rowKeys, newId("img")])} style={{ justifySelf: "start" }}>
        <Plus size={15} aria-hidden="true" /> Add image
      </button>
      <p className={styles.hint}>Each image can use a URL or a file from this computer (JPG, PNG, WEBP or GIF, max 5 MB). Files upload as soon as you pick them; save the project to keep the change.</p>
    </div>
  );
}
