'use client';

import Link from 'next/link';

const navItems = [
  { name: 'Home', href: '/', position: 'left' },
  { name: 'Projects', href: '/projects', position: 'center' },
];

const decorativeClouds = [
  { position: 'far-left' },
  { position: 'far-right' },
  { position: 'mid-left' },
];

export default function CloudNav() {
  return (
    <>
      {/* Moon for About page - top right */}
      <Link href="/about" className="moon-button">
        <pre className="moon-ascii text-[8px] sm:text-[10px] md:text-xs lg:text-sm leading-none select-none">
{`    ╭─────╮
   ╱ ░░░░░ ╲
  │ ░▒░░▒░░ │
  │ ░░▒░░░▒ │
  │ ░▒░░▒░░ │
   ╲ ░░░░░ ╱
    ╰─────╯`}
        </pre>
        <div className="moon-text">About</div>
      </Link>

      <nav className="cloud-nav">
        {/* Decorative clouds */}
        {decorativeClouds.map((cloud, index) => (
          <div
            key={`decorative-${index}`}
            className={`decorative-cloud ${cloud.position}`}
            style={{
              ['--delay' as any]: `${index * 0.3}s`,
            }}
          >
            <pre className="cloud-ascii-large text-[8px] sm:text-[10px] md:text-xs leading-none select-none">
{`      .-~~~-.
    .'       '.
   /  ∼    ∼  \\
  |   ∼  ∼   ∼ |
  |  ∼   ∼  ∼  |
   \\  ∼   ∼   /
    '.       .'
      '-...-'`}
            </pre>
          </div>
        ))}

        {/* Navigation clouds */}
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            href={item.href}
            className={`cloud-button ${item.position}`}
            style={{
              ['--delay' as any]: `${index * 0.25}s`,
            }}
          >
            <div className="cloud-text">{item.name}</div>
            <pre className="cloud-ascii-large text-[8px] sm:text-[10px] md:text-xs leading-none select-none">
{`      .-~~~-.
    .'       '.
   /  ∼    ∼  \\
  |   ∼  ∼   ∼ |
  |  ∼   ∼  ∼  |
   \\  ∼   ∼   /
    '.       .'
      '-...-'`}
            </pre>
          </Link>
        ))}
      </nav>
    </>
  );
}
