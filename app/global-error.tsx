"use client";

import { useEffect } from "react";

/**
 * Root-level crash boundary. Unlike app/error.tsx (a route-segment boundary),
 * this catches failures in the root layout itself — Providers / wagmi init,
 * font loading — and must render its own <html>/<body>. globals.css is NOT
 * applied here, so everything is styled inline against the v2 brand tokens.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBFBF8",
          color: "#101114",
          padding: 24,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div
            aria-hidden
            style={{
              width: 48,
              height: 48,
              margin: "0 auto",
              borderRadius: 14,
              background: "#1E50E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 100 100"
              fill="none"
              stroke="#ffffff"
              strokeWidth="9"
              strokeLinecap="round"
            >
              <path d="M 74.4 20.9 A 38 38 0 1 1 25.6 20.9" />
            </svg>
          </div>
          <p
            style={{
              marginTop: 24,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#5a5d65",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              marginTop: 12,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            OneLink hit an unexpected error
          </h1>
          <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.5, color: "#5a5d65" }}>
            The app failed to start this page. Try again, or reload OneLink.
          </p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                height: 44,
                padding: "0 20px",
                borderRadius: 12,
                border: "none",
                background: "#1E50E5",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* Hard navigation, not <Link>: a root-layout crash needs a full
                page reload to re-initialize the providers that failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                height: 44,
                padding: "0 20px",
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 12,
                border: "1px solid rgba(16,17,20,0.12)",
                color: "#101114",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
