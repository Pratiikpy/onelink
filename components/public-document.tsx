import Link from "next/link";
import { Footer } from "@/components/footer";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function PublicDocument({
  eyebrow,
  title,
  introduction,
  sections,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: Section[];
}) {
  return (
    <div className="mx-auto max-w-[1080px]">
      <section className="max-w-[760px]">
        <p className="mono-label text-[12px]">{eyebrow}</p>
        <h1 className="mt-6 text-balance text-[48px] font-medium leading-[1] tracking-[-0.045em] sm:text-[72px]">
          {title}
        </h1>
        <p className="mt-7 text-[18px] leading-8 text-white/58 sm:text-[21px]">{introduction}</p>
      </section>

      <div className="mt-14 grid gap-4 sm:mt-20">
        {sections.map((section) => (
          <section key={section.title} className="surface rounded-[24px] p-6 sm:p-9">
            <h2 className="text-[25px] font-medium tracking-tight sm:text-[30px]">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 max-w-[820px] text-[16px] leading-7 text-white/57 sm:text-[18px]">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-5 grid gap-3 text-[16px] leading-7 text-white/62 sm:text-[18px]">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-[10px] size-1.5 shrink-0 rounded-full bg-lime" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-4 rounded-[24px] border border-lime/20 bg-lime/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-[20px] font-medium">Create a verified testnet payment link</p>
          <p className="mt-2 text-[15px] text-white/52">Settlement routes and limitations remain visible before payment.</p>
        </div>
        <Link
          href="/create"
          className="inline-flex h-14 shrink-0 items-center justify-center rounded-[16px] bg-lime px-7 text-[17px] font-medium text-ink"
        >
          Create link
        </Link>
      </div>

      <Footer />
    </div>
  );
}
