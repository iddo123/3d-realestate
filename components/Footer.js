"use client";

const columns = [
  {
    title: "חיפוש נכסים",
    links: ["דירות למכירה", "דירות להשכרה", "פרויקטים חדשים", "נכסים מסחריים", "בתי קרקע"],
  },
  {
    title: "כלים ומידע",
    links: ["מחירון נדל\"ן", "מידע על שכונות", "הערכת שווי", "מגזין רגבים", "מדריכים"],
  },
  {
    title: "ערים מובילות",
    links: ["תל אביב", "ירושלים", "חיפה", "רמת גן", "באר שבע"],
  },
  {
    title: "רגבים",
    links: ["אודות", "צרו קשר", "פרסום באתר", "דרושים", "תנאי שימוש"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-ink text-white/80">
      <div className="container-px py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1 text-2xl font-extrabold text-white">
              <span>רגבים</span>
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal" />
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              הפלטפורמה החכמה לנדל"ן בישראל – נתונים, מחירים ושקיפות בכל עסקה.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-[15px] font-bold text-white">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/60 transition-colors hover:text-teal"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} רגבים – כל הזכויות שמורות. אתר הדגמה.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-teal">תנאי שימוש</a>
            <a href="#" className="hover:text-teal">מדיניות פרטיות</a>
            <a href="#" className="hover:text-teal">נגישות</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
