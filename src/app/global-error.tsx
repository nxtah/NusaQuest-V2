'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <main>
          <p>Something went wrong.</p>
          <button onClick={() => reset()}>Try again</button>
        </main>
      </body>
    </html>
  );
}
