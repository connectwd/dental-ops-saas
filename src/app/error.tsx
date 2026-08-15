"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">
          {error.digest ? `Reference: ${error.digest}` : error.message}
        </p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
