'use client';

import { useEffect } from 'react';

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Global Error:', error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          fontFamily: "'Lexend', 'Segoe UI', system-ui, sans-serif",
          background: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '640px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(17, 24, 39, 0.08)',
            boxShadow: '0 1px 2px rgba(17, 24, 39, 0.05)',
            padding: '64px 40px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '9999px',
              background: '#f9fafb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              fontSize: '40px',
              fontWeight: 800,
              color: '#9ca3af',
            }}
          >
            !
          </div>
          <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#27427f' }}>
            Something went wrong
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 800, color: '#111827' }}>
            Please try again
          </h1>
          <p style={{ margin: '0 auto 32px', maxWidth: '448px', color: '#6b7280', fontSize: '15px' }}>
            This is usually temporary — a brief network issue while loading the page.
          </p>
          {error?.digest ? (
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af' }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              style={{
                border: 0,
                borderRadius: '12px',
                background: '#27427f',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                borderRadius: '12px',
                background: 'rgba(39,66,127,0.06)',
                color: '#27427f',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px 24px',
                textDecoration: 'none',
              }}
            >
              Go to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
