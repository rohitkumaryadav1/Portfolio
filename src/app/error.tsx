'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup">
      <h1>A small interruption.</h1>
      <p>The page could not load. Please try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <a href="mailto:rohitky9910@gmail.com">Contact Rohit</a>
    </main>
  );
}
