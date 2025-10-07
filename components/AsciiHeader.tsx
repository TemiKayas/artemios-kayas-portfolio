'use client';

export default function AsciiHeader() {
  return (
    <div className="ascii-header-container">
      <pre className="ascii-name text-[6px] sm:text-[7px] md:text-[9px] lg:text-[10px] leading-none select-none">
{`
    _             _                 _                  _  __
   / \\   _ __ ___| |_  ___  _ __ ___(_)___  ___  ___  | |/ /  __ _ _   _  __ _  ___
  / _ \\ | '__/ _ \\ __|/ _ \\| '_ \` _ \\| / _ \\/ __|/ _ \\ | ' /  / _\` | | | |/ _\` |/ __|
 / ___ \\| | |  __/ |_|  __/| | | | | | | (_) \\__ \\  __/ | . \\ | (_| | |_| | (_| |\\__ \\
/_/   \\_\\_|  \\___|\\__|\\___|_| |_| |_|_|\\___/|___/\\___| |_|\\_\\ \\__,_|\\__, |\\__,_||___/
                                                                     |___/
`}
      </pre>

      <div className="ascii-title">
        <pre className="ascii-border text-[8px] sm:text-[9px] md:text-[11px] lg:text-xs leading-none select-none">
{`╔═══════════════════════════════════════════════════════════════╗
║          Software Engineer & Creative Developer               ║
╚═══════════════════════════════════════════════════════════════╝`}
        </pre>
      </div>
    </div>
  );
}
