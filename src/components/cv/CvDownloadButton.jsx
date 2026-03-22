"use client";

import { useCallback, useState } from "react";

export default function CvDownloadButton({ data }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [{ pdf }, { default: CvPdfDocument, getPdfFileName }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./CvPdfDocument"),
      ]);

      const blob = await pdf(<CvPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getPdfFileName(data);
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("CV PDF error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        msg
          ? `Could not create PDF: ${msg}`
          : "Could not create PDF. Try again or use Chrome/Edge."
      );
    } finally {
      setLoading(false);
    }
  }, [data]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Preparing PDF…" : "Download CV (PDF)"}
      </button>
      {error ? (
        <p className="max-w-sm text-right text-xs leading-snug text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
