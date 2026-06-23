"use client";

export default function CtaBand() {
  return (
    <section className="container-px py-8">
      <div className="overflow-hidden rounded-xl2 bg-gradient-to-l from-teal-700 to-teal-500 px-8 py-10 text-center text-white sm:px-12 sm:text-right">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              יש לכם דירה למכירה או להשכרה?
            </h2>
            <p className="mt-2 text-white/90">
              פרסמו בחינם ותגיעו לאלפי קונים ושוכרים פוטנציאליים כבר היום.
            </p>
          </div>
          <a
            href="#"
            className="shrink-0 rounded-full bg-white px-7 py-3 text-[15px] font-bold text-teal-700 transition-transform hover:scale-105"
          >
            פרסום דירה בחינם
          </a>
        </div>
      </div>
    </section>
  );
}
