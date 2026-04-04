import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur-sm">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6">
        <Link to="/" className="flex items-center gap-2 justify-self-start">
          <Play aria-hidden="true" className="h-5 w-5 fill-[#f6821f] text-[#f6821f]" />
          <span className="text-sm font-semibold tracking-tight text-white">Flux</span>
        </Link>

        {title ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium text-white">{title}</span>
            {subtitle ? <span className="shrink-0 text-xs text-[#71717a]">{subtitle}</span> : null}
          </div>
        ) : (
          <div />
        )}

        <nav className="flex items-center gap-4 justify-self-end">
          <Link
            to="/"
            className="text-xs font-medium text-[#a1a1aa] transition-colors hover:text-white"
          >
            Browse
          </Link>
        </nav>
      </div>
    </header>
  );
}
