"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  const handleRetry = () => {
    // prefer Next.js router.refresh when available, otherwise fall back to full reload
    try {
      // router.refresh exists in next/navigation on App Router
      // @ts-ignore
      if (typeof router.refresh === "function") router.refresh();
      else window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center py-16 px-4">
      <main className="max-w-3xl w-full bg-light-surface dark:bg-dark-surface shadow-lg rounded-2xl p-8 border border-light-divider dark:border-dark-divider">
        <header className="flex items-center gap-4">
          <div className="flex-none p-3 rounded-md bg-error-DEFAULT/10">
            <svg
              className="w-10 h-10 text-error-DEFAULT"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-light-heading dark:text-dark-heading">Something went wrong</h1>
            <p className="mt-1 text-sm text-light-subheading dark:text-dark-subheading">An unexpected error occurred. You can try to reload the page or return to the homepage.</p>
          </div>
        </header>

        <section className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="flex-1">
            <div className="text-sm text-light-subheading dark:text-dark-subheading">
              If this keeps happening, it might be a server-side issue or a temporary connectivity problem. If possible, try again in a few moments.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Retry
              </button>

              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-light-divider dark:border-dark-divider rounded-md text-sm text-light-heading dark:text-dark-heading hover:bg-gray-50"
              >
                Go to homepage
              </Link>

              <Link
                href="/status"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm text-info-DEFAULT hover:bg-info-DEFAULT/10"
              >
                System status
              </Link>
            </div>

            <div className="mt-6 text-xs text-light-subheading dark:text-dark-subheading">
              Need help? Contact support at <a className="underline" href="mailto:support@solopreneur.local">support@solopreneur.local</a>
            </div>
          </div>

          <aside className="w-full md:w-40 text-right md:text-left">
            <div className="text-4xl font-extrabold text-error-DEFAULT">500</div>
            <div className="mt-1 text-xs text-light-subheading dark:text-dark-subheading">Server error</div>
          </aside>
        </section>
      </main>
    </div>
  );
}

