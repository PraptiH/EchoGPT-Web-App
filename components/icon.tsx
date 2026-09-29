type IconProps = { name: string; size?: number; className?: string };

export function Icon({ name, size = 20, className }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "chat":
      return (
        <svg {...props}>
          <path d="M8 10h8M8 14h5" />
          <path d="M7 19.5 4 21V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7z" />
        </svg>
      );
    case "columns":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="7" height="16" rx="1.5" />
          <rect x="14" y="4" width="7" height="16" rx="1.5" />
        </svg>
      );
    case "image":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.4" />
          <path d="m7 16 3.2-3.2a1 1 0 0 1 1.4 0L16 17" />
        </svg>
      );
    case "video":
      return (
        <svg {...props}>
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="m16 10 5-2v8l-5-2z" />
        </svg>
      );
    case "brief":
      return (
        <svg {...props}>
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "doc":
      return (
        <svg {...props}>
          <path d="M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5z" />
          <path d="M14 3.5V9h5M8 13h8M8 17h6" />
        </svg>
      );
    case "tasks":
      return (
        <svg {...props}>
          <path d="m5 7 1.5 1.5L10 5" />
          <path d="m5 13 1.5 1.5L10 11" />
          <path d="M13 7h6M13 13h6M13 18h6M5 18h2" />
        </svg>
      );
    case "grid":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
        </svg>
      );
    case "plug":
      return (
        <svg {...props}>
          <path d="M9 7v4M15 7v4" />
          <path d="M8 11h8v2a4 4 0 0 1-8 0zM12 17v4" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
        </svg>
      );
    case "moon":
      return (
        <svg {...props}>
          <path d="M16 3.5A8 8 0 1 0 20.5 14 6.5 6.5 0 0 1 16 3.5z" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "mic":
      return (
        <svg {...props}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
        </svg>
      );
    case "paperclip":
      return (
        <svg {...props}>
          <path d="m8 12.5 6.2-6.2a3 3 0 0 1 4.2 4.2l-7.4 7.4a4.5 4.5 0 0 1-6.4-6.4l7-7" />
        </svg>
      );
    case "copy":
      return (
        <svg {...props}>
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <path d="M5 7h14M9 7V5h6v2M8 7l.8 12h6.4L16 7" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 12 5 5L20 7" />
        </svg>
      );
    case "panel":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 4v16" />
        </svg>
      );
    case "spark":
      return (
        <svg {...props}>
          <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7V20a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...props}>
          <path d="m9 7 5 5-5 5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
