"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import defaultPortfolioData from "@/data/portfolioData";
import CvDownloadButton from "./cv/CvDownloadButton";

const STORAGE_KEY = "react-dev-portfolio-data";

function pretty(data) {
  return JSON.stringify(data, null, 2);
}

function readPortfolioDataFromStorage() {
  if (typeof window === "undefined") {
    return defaultPortfolioData;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return defaultPortfolioData;
  }

  try {
    return JSON.parse(saved);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultPortfolioData;
  }
}

function subscribePortfolioData(callback) {
  if (typeof window === "undefined") {
    return () => { };
  }

  const onChange = () => callback();
  window.addEventListener("storage", onChange);
  window.addEventListener("portfolio-storage-change", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("portfolio-storage-change", onChange);
  };
}

function getServerSnapshot() {
  return defaultPortfolioData;
}

export default function PortfolioPage() {
  const data = useSyncExternalStore(
    subscribePortfolioData,
    readPortfolioDataFromStorage,
    getServerSnapshot
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [jsonValue, setJsonValue] = useState(() => pretty(defaultPortfolioData));
  const [error, setError] = useState("");

  const profileLine = useMemo(() => {
    return `${data?.site?.location} | ${data?.site?.yearsOfExperience} | ${data?.site?.availability}`;
  }, [data?.site]);

  const saveData = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new Event("portfolio-storage-change"));
      setError("");
    } catch {
      setError("Invalid JSON. Please fix formatting before saving.");
    }
  };

  const resetData = () => {
    setJsonValue(pretty(defaultPortfolioData));
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("portfolio-storage-change"));
    setError("");
  };

  const openEditor = () => {
    setJsonValue(pretty(data));
    setIsEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <p className="text-lg font-semibold">{data?.site?.developerName}</p>
          <CvDownloadButton data={data} />
          {/* <button
            onClick={openEditor}
            className="rounded-md border border-cyan-400/60 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/10"
          >
            Edit Portfolio
          </button> */}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
        <section className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="mb-2 text-cyan-300">{data?.site?.role}</p>
            <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
              {data?.site?.tagline}
            </h1>
            <p className="text-slate-300">{profileLine}</p>
            <div className="mt-4 inline-block rounded-full border border-cyan-300/40 bg-cyan-500/10 px-4 py-1 text-sm text-cyan-200">
              {data?.site?.brand}
            </div>
            <p className="mt-4 text-sm text-slate-300">{data?.site?.address}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {data?.socialLinks?.map((item) => (
                <a
                  key={item?.label}
                  href={item?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm hover:border-cyan-300 hover:text-cyan-300"
                >
                  {item?.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <img
              src={data?.site?.image}
              alt={`${data?.site?.developerName} profile`}
              className="h-full w-full object-cover rounded-2xl border border-white/20"
            />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:col-span-3">
            <h2 className="mb-3 text-2xl font-semibold">About</h2>
            <p className="text-slate-300">{data?.about?.summary}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
              {data?.about?.highlights?.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:col-span-2">
            <h2 className="mb-3 text-2xl font-semibold">Skills</h2>
            <div className="space-y-4">
              {data?.skills?.map((skillGroup) => (
                <div key={skillGroup?.group}>
                  <h3 className="font-semibold text-cyan-300">{skillGroup?.group}</h3>
                  <p className="text-sm text-slate-300">{skillGroup?.items?.join(" | ")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Projects</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {data?.projects?.map((project) => (
              <article
                key={project?.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold">{project?.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{project?.description}</p>
                <p className="mt-4 text-xs text-cyan-300">{project?.tech?.join(" • ")}</p>
                <a
                  href={project?.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm text-cyan-300 hover:underline"
                >
                  View Project
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Experience</h2>
            <div className="space-y-4">
              {data?.experience?.map((job) => (
                <article key={`${job?.company}-${job?.period}`}>
                  <h3 className="font-semibold">
                    {job?.role} - {job?.company}
                  </h3>
                  <p className="text-sm text-cyan-300">{job?.period}</p>
                  <p className="mt-1 text-sm text-slate-300">{job?.impact}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
            <p className="text-slate-300">{data?.contact?.message}</p>
            <p className="mt-4 text-sm text-slate-200">Email: {data?.contact?.email}</p>
            <p className="mt-1 text-sm text-slate-200">Phone: {data?.contact?.phone}</p>
            <p className="mt-1 text-sm text-slate-200">Address: {data?.site?.address}</p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Education</h2>
            <div className="space-y-4">
              {data?.education?.map((item) => (
                <article key={`${item?.degree}-${item?.institution}`}>
                  <h3 className="font-semibold">{item?.degree}</h3>
                  <p className="text-sm text-slate-300">{item?.institution}</p>
                  <p className="text-sm text-cyan-300">{item?.result}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Certifications</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
              {data?.certifications?.map((cert, index) => (
                <li key={index}>
                  <a
                    href={cert?.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-300 hover:underline"
                  >
                    {cert?.title}
                  </a>
                  <span className="text-xs text-gray-500 ml-2">
                    ({cert?.organization})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-xl border border-white/20 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit All Portfolio Data (JSON)</h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="rounded-md border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <textarea
              value={jsonValue}
              onChange={(event) => setJsonValue(event?.target?.value)}
              className="min-h-0 flex-1 rounded-md border border-white/20 bg-slate-950 p-4 font-mono text-sm outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={saveData}
                className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Save Changes
              </button>
              <button
                onClick={resetData}
                className="rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
              >
                Reset Default
              </button>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
