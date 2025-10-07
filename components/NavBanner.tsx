'use client';

import Link from 'next/link';

export default function NavBanner() {
  return (
    <nav className="nav-banner">
      <pre className="nav-banner-ascii text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] leading-none select-none">
{`╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                          |                        |                           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}
      </pre>
      <div className="nav-links">
        <Link href="/" className="nav-link nav-link-home">Home</Link>
        <Link href="/projects" className="nav-link nav-link-projects">Projects</Link>
        <Link href="/about" className="nav-link nav-link-about">About</Link>
      </div>
    </nav>
  );
}
