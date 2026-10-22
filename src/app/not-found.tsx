import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-content not-found">
      <h1>A little detour.</h1>
      <p>This page isn’t here, but your next discovery is.</p>
      <Link href="/" className="button primary">
        Back to your little home
      </Link>
    </div>
  );
}
