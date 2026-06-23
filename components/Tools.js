"use client";

const tools = [
  {
    title: "מחירון נדל\"ן",
    desc: "בדקו מחירי עסקאות אמיתיים ומגמות מחירים בכל רחוב ושכונה.",
    icon: (
      <path
        d="M4 19V9m5 10V5m5 14v-7m5 7V8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "מידע על שכונות",
    desc: "בתי ספר, תחבורה, ביקושים ואיכות חיים – כל הנתונים לפני שקונים.",
    icon: (
      <path
        d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "הערכת שווי דירה",
    desc: "קבלו הערכת שווי מיידית לדירה שלכם על בסיס עסקאות אזוריות.",
    icon: (
      <path
        d="M3 11.5 12 4l9 7.5M5 10v9h14v-9M9.5 19v-5h5v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Tools() {
  return (
    <section className="container-px py-16">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
          הכלים שיעזרו לכם להחליט
        </h2>
        <p className="mt-2 text-ink-soft">
          כל המידע במקום אחד, חינם וללא התחייבות
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {tools.map((t) => (
          <div
            key={t.title}
            className="rounded-xl2 border border-black/5 bg-white p-7 text-center shadow-card transition-shadow hover:shadow-cardHover"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                {t.icon}
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-bold text-ink">{t.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              {t.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
