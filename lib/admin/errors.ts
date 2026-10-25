import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError, errorMessage } from "@/lib/api/client";

type Toast = (message: string, kind?: "success" | "error" | "info") => void;

/**
 * Shows a failed save: field-level messages from the API go onto the matching form fields
 * (when a form is given), and a toast summarises the problem. `mapField` translates API field
 * paths to form paths, e.g. "items.2.url" → "links.2.url" for screens that save whole lists.
 */
export function reportSaveError<T extends FieldValues>(err: unknown, toast: Toast, setError?: UseFormSetError<T>, mapField: (field: string) => string = (f) => f) {
  if (setError && err instanceof ApiError) {
    for (const issue of err.details) {
      if (issue.field) setError(mapField(issue.field) as Path<T>, { type: "server", message: issue.message });
    }
  }
  toast(errorMessage(err, "Couldn't save. Please try again."), "error");
}
