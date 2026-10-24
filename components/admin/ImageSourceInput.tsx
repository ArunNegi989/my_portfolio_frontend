"use client";

import { CheckCircle2, ImageUp, Link2, RefreshCw, Trash2, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { checkImageFile, createLocalImage, formatBytes, getLocalImage, IMAGE_ACCEPT, isBlobUrl, isExpiredLocalImage, releaseLocalImage, validateImageSrc, type LocalImage } from "@/lib/admin/localImages";
import { cx } from "@/lib/utils";
import ui from "./admin.module.css";
import fieldStyles from "./fields.module.css";
import styles from "./ImageSourceInput.module.css";

type Source = "url" | "upload";

interface ImageSourceInputProps {
  label: string;
  /** The image src: a URL, a site path, or a blob: URL for a file picked in this session. */
  value: string;
  onChange: (src: string) => void;
  error?: string;
  placeholder?: string;
}

/**
 * Image URL or a local file, one active at a time. The URL draft and the picked file are kept
 * separately so switching tabs restores each without one overwriting the other. Picked files are
 * previewed through an object URL and are never uploaded anywhere.
 */
export function ImageSourceInput({ label, value, onChange, error, placeholder = "https://example.com/image.jpg" }: ImageSourceInputProps) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<Source>(isBlobUrl(value) ? "upload" : "url");
  const [urlDraft, setUrlDraft] = useState(isBlobUrl(value) ? "" : value);
  const [upload, setUpload] = useState<LocalImage | null>(getLocalImage(value) ?? null);
  const uploadRef = useRef(upload);
  const [fileError, setFileError] = useState<string>();
  const [picked, setPicked] = useState(false);

  // Free the picked file when the field goes away, unless it was saved.
  useEffect(() => () => releaseLocalImage(uploadRef.current?.url), []);

  function keepUpload(next: LocalImage | null) {
    if (uploadRef.current && uploadRef.current.url !== next?.url) releaseLocalImage(uploadRef.current.url);
    uploadRef.current = next;
    setUpload(next);
  }

  function switchTo(next: Source) {
    if (next === source) return;
    setSource(next);
    setFileError(undefined);
    setPicked(false);
    if (next === "url") onChange(urlDraft);
    else if (upload) onChange(upload.url);
    // Upload tab with no file yet: the current URL stays active until a file is chosen.
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) return setFileError(problem);
    setFileError(undefined);
    const image = createLocalImage(file);
    keepUpload(image);
    setPicked(true);
    onChange(image.url);
  }

  function remove() {
    keepUpload(null);
    setPicked(false);
    onChange("");
  }

  const openPicker = () => fileRef.current?.click();
  const active = isBlobUrl(value) ? (isExpiredLocalImage(value) ? null : "upload") : value ? "url" : null;
  const expired = isExpiredLocalImage(value) ? (validateImageSrc(value) as string) : undefined;
  const message = fileError ?? error ?? expired;
  const errorId = `${id}-error`;
  const noteId = `${id}-note`;

  return (
    <div className={styles.root} role="group" aria-labelledby={`${id}-label`}>
      <div className={styles.head}>
        <span id={`${id}-label`} className={fieldStyles.label}>
          {label}
        </span>
        {active && <span className={cx(styles.badge, active === "upload" && styles.badgeUpload)}>{active === "upload" ? "Using uploaded file" : "Using URL"}</span>}
      </div>

      <div className={styles.switcher} role="radiogroup" aria-label={`${label} source`}>
        <button type="button" role="radio" aria-checked={source === "url"} className={cx(styles.option, source === "url" && styles.optionActive)} onClick={() => switchTo("url")}>
          <Link2 size={14} aria-hidden="true" /> Image URL
        </button>
        <button type="button" role="radio" aria-checked={source === "upload"} className={cx(styles.option, source === "upload" && styles.optionActive)} onClick={() => switchTo("upload")}>
          <ImageUp size={14} aria-hidden="true" /> Upload Image
        </button>
      </div>

      {source === "url" ? (
        <input
          className={fieldStyles.input}
          type="url"
          inputMode="url"
          aria-label={`${label} URL`}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          placeholder={placeholder}
          value={urlDraft}
          onChange={(e) => {
            setUrlDraft(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : upload ? (
        <div className={cx(styles.file, message && styles.invalid)}>
          <div className={styles.fileMeta}>
            <span className={styles.fileName} title={upload.name}>
              {upload.name}
            </span>
            <span className={styles.fileSize}>{formatBytes(upload.size)}</span>
          </div>
          <div className={styles.fileActions}>
            <button type="button" className={ui.btn} onClick={openPicker} aria-describedby={noteId}>
              <RefreshCw size={14} aria-hidden="true" /> Replace Image
            </button>
            <button type="button" className={cx(ui.btn, ui.btnDanger)} onClick={remove}>
              <Trash2 size={14} aria-hidden="true" /> Remove Image
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={cx(styles.upload, message && styles.invalid)} onClick={openPicker} aria-describedby={message ? `${noteId} ${errorId}` : noteId}>
          <Upload size={18} aria-hidden="true" />
          <span className={styles.uploadText}>
            <strong>Upload Image</strong>
            <span>JPG, PNG, WEBP or GIF · max 5 MB</span>
          </span>
        </button>
      )}
      <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className={styles.hiddenInput} onChange={onFile} tabIndex={-1} aria-hidden="true" />

      {source === "upload" && (
        <p id={noteId} className={fieldStyles.hint}>
          {!upload && active === "url" ? "The image URL stays in use until you choose a file. " : ""}
          Picked files preview in this browser tab only. They are not uploaded and are lost after a page reload.
        </p>
      )}
      {picked && upload && !message && (
        <p className={styles.success} role="status">
          <CheckCircle2 size={14} aria-hidden="true" /> Image selected. Save to use it in this session.
        </p>
      )}
      {message && (
        <p id={errorId} className={fieldStyles.error} role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
