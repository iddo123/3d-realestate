"use client";

const navLinks = [
  { label: "למכירה", href: "#" },
  { label: "להשכרה", href: "#" },
  { label: "פרויקטים חדשים", href: "#" },
  { label: "מחירון", href: "#" },
  { label: "אזורים", href: "#" },
  { label: "מגזין", href: "#" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="container-px flex h-16 items-center justify-between gap-4">
        {/* Logo + nav (RTL: start side is the right) */}
        <div className="flex items-center gap-7">
          <a href="#" className="flex items-center gap-1 text-2xl font-extrabold text-ink">
            <span>רגבים</span>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal" />
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-ink-soft transition-colors hover:text-teal"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-[15px] font-medium text-ink-soft transition-colors hover:text-teal sm:block"
          >
            כניסה / הרשמה
          </a>
          <a
            href="#"
            className="rounded-full bg-teal px-5 py-2 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-600"
          >
            פרסום דירה
          </a>
        </div>
      </div>
    </header>
  );
}
