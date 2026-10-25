"use client";

import { CheckCircle2, ImageUp, Link2, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent } from "react";
import { errorMessage } from "@/lib/api/client";
import { checkImageFile, formatBytes, IMAGE_ACCEPT, isUploadedFile, uploadImage } from "@/lib/admin/media";
import { cx } from "@/lib/utils";
import ui from "./admin.module.css";
import fieldStyles from "./fields.module.css";
import styles from "./ImageSourceInput.module.css";

type Source = "url" | "upload";

interface UploadInfo {
  name: string;
  size?: number;
  url: string;
}

interface ImageSourceInputProps {
  label: string;
  /** The image src: a URL (including uploaded files) or a site path. */
  value: string;
  onChange: (src: string) => void;
  error?: string;
  placeholder?: string;
}

const fileNameOf = (url: string) => decodeURIComponent(url.split("/").pop() || url);

/**
 * Image URL or an uploaded file, one active at a time. Picking a file uploads it straight away
 * (admin-only endpoint, validated on the server) and stores the returned URL in the field.
 * The URL draft is kept separately so switching tabs restores it.
 */
export function ImageSourceInput({ label, value, onChange, error, placeholder = "https://example.com/image.jpg" }: ImageSourceInputProps) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadedInitially = isUploadedFile(value);
  const [source, setSource] = useState<Source>(uploadedInitially ? "upload" : "url");
  const [urlDraft, setUrlDraft] = useState(uploadedInitially ? "" : value);
  const [upload, setUpload] = useState<UploadInfo | null>(uploadedInitially ? { name: fileNameOf(value), url: value } : null);
  const [fileError, setFileError] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  function switchTo(next: Source) {
    if (next === source || uploading) return;
    setSource(next);
    setFileError(undefined);
    setJustUploaded(false);
    if (next === "url") onChange(urlDraft);
    else if (upload) onChange(upload.url);
    // Upload tab with no file yet: the current URL stays active until a file is uploaded.
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) return setFileError(problem);
    setFileError(undefined);
    setJustUploaded(false);
    setUploading(true);
    try {
      const media = await uploadImage(file);
      setUpload({ name: file.name, size: file.size, url: media.url });
      setJustUploaded(true);
      onChange(media.url);
    } catch (err) {
      setFileError(errorMessage(err, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    setUpload(null);
    setJustUploaded(false);
    onChange("");
  }

  const openPicker = () => fileRef.current?.click();
  const active = value ? (upload && value === upload.url ? "upload" : "url") : null;
  const message = fileError ?? error;
  const errorId = `${id}-error`;
  const noteId = `${id}-note`;

  return (
    <div className={styles.root} role="group" aria-labelledby={`${id}-label`} aria-busy={uploading || undefined}>
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
      ) : uploading ? (
        <div className={styles.file} role="status">
          <div className={styles.fileMeta}>
            <span className={styles.fileName}>
              <Loader2 size={14} aria-hidden="true" className={styles.spin} /> Uploading…
            </span>
          </div>
        </div>
      ) : upload ? (
        <div className={cx(styles.file, message && styles.invalid)}>
          <div className={styles.fileMeta}>
            <span className={styles.fileName} title={upload.name}>
              {upload.name}
            </span>
            {upload.size !== undefined && <span className={styles.fileSize}>{formatBytes(upload.size)}</span>}
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

      {source === "upload" && !upload && active === "url" && (
        <p id={noteId} className={fieldStyles.hint}>
          The image URL stays in use until you upload a file.
        </p>
      )}
      {justUploaded && upload && !message && (
        <p className={styles.success} role="status">
          <CheckCircle2 size={14} aria-hidden="true" /> Image uploaded. Save to use it on the site.
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
