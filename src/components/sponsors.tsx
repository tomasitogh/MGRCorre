const SPONSORS = [
  {
    name: "Springbok Fit",
    logo: (
      <svg className="h-7 w-auto text-slate-500 dark:text-slate-400 fill-current" viewBox="0 0 120 30">
        <path d="M10 20 L25 5 L40 20 L30 20 L25 15 L20 20 Z" />
        <text x="48" y="20" className="font-extrabold text-[13px] tracking-wider font-sans">SPRINGBOK</text>
      </svg>
    )
  },
  {
    name: "Apex Sports",
    logo: (
      <svg className="h-7 w-auto text-slate-500 dark:text-slate-400 fill-current" viewBox="0 0 120 30">
        <polygon points="10,22 22,6 34,22" />
        <polygon points="20,22 28,12 36,22" />
        <text x="42" y="20" className="font-black text-[14px] font-sans">APEX</text>
      </svg>
    )
  },
  {
    name: "Globex Run",
    logo: (
      <svg className="h-7 w-auto text-slate-500 dark:text-slate-400 fill-current" viewBox="0 0 120 30">
        <circle cx="20" cy="15" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="20" cy="15" r="5" />
        <text x="38" y="20" className="font-bold text-[14px] font-sans">GLOBEX</text>
      </svg>
    )
  },
  {
    name: "Initech Athletics",
    logo: (
      <svg className="h-7 w-auto text-slate-500 dark:text-slate-400 fill-current" viewBox="0 0 120 30">
        <rect x="10" y="7" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <line x1="20" y1="7" x2="20" y2="23" stroke="currentColor" strokeWidth="2" />
        <text x="38" y="20" className="font-bold text-[13px] tracking-wide font-sans">INITECH</text>
      </svg>
    )
  },
  {
    name: "Acme Corp",
    logo: (
      <svg className="h-7 w-auto text-slate-500 dark:text-slate-400 fill-current" viewBox="0 0 120 30">
        <path d="M10 22 L20 8 L30 22 L20 17 Z" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="36" y="20" className="font-extrabold text-[15px] font-mono">ACME</text>
      </svg>
    )
  },
  {
    name: "SouthAir",
    logo: (
      <svg className="h-7 w-auto text-slate-500 dark:text-slate-400 fill-current" viewBox="0 0 120 30">
        <path d="M10 15 Q20 5 30 15 T50 15" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <text x="48" y="20" className="font-bold text-[14px] font-sans">SOUTHAIR</text>
      </svg>
    )
  }
];

export function Sponsors() {
  // Duplicate the list of sponsors to create a seamless infinite scrolling effect
  const marqueeItems = [...SPONSORS, ...SPONSORS];

  return (
    <div className="w-full py-6 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-muted/30 overflow-hidden space-y-3">
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Sponsors de la carrera
      </p>
      
      <div className="relative w-full flex items-center overflow-hidden">
        {/* Fade overlay left */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-950/20 z-10 pointer-events-none" />
        
        {/* Scrolling list */}
        <div className="flex animate-marquee gap-12 items-center whitespace-nowrap">
          {marqueeItems.map((sponsor, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center min-w-[120px] transition-opacity hover:opacity-80"
            >
              {sponsor.logo}
            </div>
          ))}
        </div>

        {/* Fade overlay right */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50/50 to-transparent dark:from-slate-950/20 z-10 pointer-events-none" />
      </div>
    </div>
  );
}
