import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="setup">
      <span className="eyebrow">404 / NOT FOUND</span>
      <h1>
        This page
        <br />
        is off the map.
      </h1>
      <Link className="button primary" href="/">
        Back home ↗
      </Link>
    </main>
  );
}
