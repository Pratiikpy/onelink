import type { Metadata } from "next";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { Logo, LogoMark } from "@/components/onelink/logo";

export const metadata: Metadata = {
  title: "Brand kit",
  description:
    "OneLink brand kit — logo, color, typography, spacing, elevation, motion, iconography, and voice.",
};

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      <main className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Brand kit · v1
          </p>
          <h1 className="mt-6 font-display text-5xl font-semibold tracking-[-0.04em] md:text-[64px] md:leading-[1.05]">
            The OneLink design system.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
            Editorial Apple-minimal. Hairlines, near-black on off-white,
            two-stop elevation, calm motion. Designed to make a USDC payment
            feel like a Stripe receipt — quiet, precise, and confident.
          </p>
        </Reveal>

        {/* Logo */}
        <Section title="Logo">
          <p>
            The OneLink mark is two interlocking arcs forming a chain-link
            &ldquo;O&rdquo;. Monoline, optically centered inside a soft squircle, drawn in{" "}
            <span className="font-mono">currentColor</span> so it inherits the
            surface it sits on.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SwatchCard label="Mark · 24px">
              <LogoMark size={24} />
            </SwatchCard>
            <SwatchCard label="Mark · 48px">
              <LogoMark size={48} />
            </SwatchCard>
            <SwatchCard label="Mark · 96px">
              <LogoMark size={96} />
            </SwatchCard>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SwatchCard label="Lockup">
              <Logo size={32} />
            </SwatchCard>
            <SwatchCard label="Stacked">
              <Logo size={48} variant="stacked" />
            </SwatchCard>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SwatchCard label="On dark" tone="invert">
              <span className="text-background">
                <Logo size={32} />
              </span>
            </SwatchCard>
            <SwatchCard label="Mark, no frame" tone="dot">
              <LogoMark size={32} withFrame={false} />
            </SwatchCard>
          </div>
        </Section>

        {/* Color */}
        <Section title="Color">
          <p>
            Token names map 1:1 to Tailwind colors. Values are{" "}
            <span className="font-mono">oklch</span> for perceptual uniformity
            and consistent contrast across the system.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ColorCard
              token="background"
              oklch="0.985 0.002 95"
              hex="#fbfbf8"
              role="Page background"
              swatchClass="bg-background"
            />
            <ColorCard
              token="foreground"
              oklch="0.16 0.004 260"
              hex="#0d0f12"
              role="Body text · primary fills"
              swatchClass="bg-foreground"
              dark
            />
            <ColorCard
              token="surface"
              oklch="1 0 0"
              hex="#ffffff"
              role="Cards · sticky bars"
              swatchClass="bg-surface"
            />
            <ColorCard
              token="muted"
              oklch="0.965 0.003 95"
              hex="#f3f3f0"
              role="Quiet panels"
              swatchClass="bg-muted"
            />
            <ColorCard
              token="muted-foreground"
              oklch="0.46 0.006 260"
              hex="#6b6e75"
              role="Secondary text"
              swatchClass="bg-muted-foreground"
              dark
            />
            <ColorCard
              token="hairline"
              oklch="0.16 0.004 260 / 0.07"
              hex="rgba(13,15,18,0.07)"
              role="Borders · dividers"
              swatchClass="border border-hairline bg-background"
            />
            <ColorCard
              token="success"
              oklch="0.42 0.06 158"
              hex="#2d6857"
              role="Verified · paid"
              swatchClass="bg-success"
              dark
            />
            <ColorCard
              token="warning"
              oklch="0.74 0.13 70"
              hex="#d29447"
              role="Processing"
              swatchClass="bg-warning"
              dark
            />
            <ColorCard
              token="destructive"
              oklch="0.55 0.2 25"
              hex="#cd3a2c"
              role="Failed · cancel"
              swatchClass="bg-destructive"
              dark
            />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <p>
            Two display faces and one mono. <span className="font-mono">Inter Tight</span> for
            headlines, <span className="font-mono">Inter</span> for body, and{" "}
            <span className="font-mono">JetBrains Mono</span> for hashes,
            addresses, and labels.
          </p>
          <div className="mt-8 space-y-6">
            <TypeCard
              token="text-display-1"
              value="clamp(2.5rem, 11vw, 5.5rem)"
              tracking="-0.04em"
              sample="Get paid in USDC."
              displayClass="font-display text-display-1 font-semibold tracking-[-0.04em]"
            />
            <TypeCard
              token="text-display-2"
              value="clamp(2rem, 7vw, 2.75rem)"
              tracking="-0.035em"
              sample="One link. Verified."
              displayClass="font-display text-display-2 font-semibold tracking-[-0.035em]"
            />
            <TypeCard
              token="h2"
              value="44px / 1.05"
              tracking="-0.03em"
              sample="A payment link, and the proof it landed."
              displayClass="font-display text-4xl font-semibold tracking-[-0.03em] md:text-[44px]"
            />
            <TypeCard
              token="body"
              value="17px / 1.55"
              tracking="-0.012em"
              sample="OneLink turns an invoice into a single shareable URL. Settled on Arc, verified on-chain, in under 30 seconds."
              displayClass="text-[17px] leading-relaxed text-muted-foreground"
            />
            <TypeCard
              token="mono / eyebrow"
              value="11px / uppercase / tracking 0.22em"
              tracking="0.22em"
              sample="LIVE ON ARC TESTNET · USDC NATIVE"
              displayClass="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
            />
            <TypeCard
              token="mono / hash"
              value="13px / tabular-nums"
              tracking="normal"
              sample="0x6b921b06d601e88cf1cdb0ea1eb5237cd89dc722"
              displayClass="font-mono text-[13px] tabular-nums break-all"
            />
          </div>
        </Section>

        {/* Spacing & Radius */}
        <Section title="Spacing & radius">
          <p>
            A 4-step scale, plus the Tailwind defaults. Radius tokens cluster
            around <span className="font-mono">0.625rem</span> for the system{" "}
            <span className="font-mono">--radius</span>.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["sm", "8px"],
              ["md", "12px"],
              ["lg", "16px"],
              ["xl", "20px"],
              ["2xl", "24px"],
              ["3xl", "28px"],
            ].map(([name, px]) => (
              <div
                key={name}
                className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface p-6"
              >
                <div
                  className="h-16 w-16 bg-foreground"
                  style={{ borderRadius: `var(--radius)` }}
                />
                <div className="text-center">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    rounded-{name}
                  </p>
                  <p className="mt-1 font-mono text-[12px]">{px}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Elevation */}
        <Section title="Elevation">
          <p>
            Two stops only. Use sparingly — primary settlement card uses{" "}
            <span className="font-mono">card-lift</span>, everything else uses{" "}
            <span className="font-mono">card-elev</span> or no shadow.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline bg-surface p-7 card-elev">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                card-elev
              </p>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
                Quiet lift.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Default for cards on hover and sticky elements.
              </p>
            </div>
            <div className="rounded-2xl border border-hairline bg-surface p-7 card-lift">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                card-lift
              </p>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
                Primary card.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Reserved for the receipt + checkout amount card.
              </p>
            </div>
          </div>
        </Section>

        {/* Motion */}
        <Section title="Motion">
          <p>
            Calm, never bouncy. Three duration tokens, one easing. No parallax,
            no spring, no overshoot.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["dur-fast", "160ms", "Hover, focus, button press"],
              ["dur-base", "240ms", "Sheet, dropdown, tab"],
              ["dur-slow", "420ms", "Page transitions, reveal"],
            ].map(([name, value, role]) => (
              <div
                key={name}
                className="rounded-xl border border-hairline bg-surface p-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {name}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight">
                  {value}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">{role}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-hairline bg-muted/40 p-5 text-sm text-muted-foreground">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
              Easing
            </p>
            <p className="mt-2 font-mono text-[13px]">
              cubic-bezier(0.22, 1, 0.36, 1)
            </p>
            <p className="mt-2 text-xs">
              The ease-out-soft curve used for every motion in the system.
            </p>
          </div>
        </Section>

        {/* Iconography */}
        <Section title="Iconography">
          <p>
            Lucide React, 1.5px stroke weight, sized in 0.25rem multiples.
            Never stroke 2.0 — it makes the system feel chunky.
          </p>
        </Section>

        {/* Voice */}
        <Section title="Voice">
          <ul className="mt-2 space-y-3 text-base text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">
                Calm, exact, never salesy.
              </strong>{" "}
              No exclamation marks unless absolutely earned.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Show, don&apos;t hype.
              </strong>{" "}
              Every claim links to its evidence.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Specific numbers.
              </strong>{" "}
              &ldquo;Under 30 seconds&rdquo; not &ldquo;fast.&rdquo;
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Honest about scope.
              </strong>{" "}
              We name what we don&apos;t support.
            </li>
          </ul>
        </Section>
      </main>

      <MarketingFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="mt-20 border-t border-hairline pt-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </Reveal>
  );
}

function SwatchCard({
  label,
  children,
  tone = "default",
}: {
  label: string;
  children: React.ReactNode;
  tone?: "default" | "invert" | "dot";
}) {
  const cls =
    tone === "invert"
      ? "bg-foreground"
      : tone === "dot"
      ? "bg-muted"
      : "bg-surface";
  return (
    <div className={`rounded-xl border border-hairline ${cls} flex flex-col items-center gap-4 p-8`}>
      <div className="grid h-24 place-items-center">{children}</div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function ColorCard({
  token,
  oklch,
  hex,
  role,
  swatchClass,
  dark,
}: {
  token: string;
  oklch: string;
  hex: string;
  role: string;
  swatchClass: string;
  dark?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
      <div className={`grid h-20 place-items-center ${swatchClass}`}>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
            dark ? "text-background" : "text-muted-foreground"
          }`}
        >
          {token}
        </span>
      </div>
      <div className="space-y-1 p-4 text-xs">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {role}
        </p>
        <p className="font-mono">{oklch}</p>
        <p className="font-mono text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

function TypeCard({
  token,
  value,
  tracking,
  sample,
  displayClass,
}: {
  token: string;
  value: string;
  tracking: string;
  sample: string;
  displayClass: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {token}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground/70">
          {value} · tracking {tracking}
        </p>
      </div>
      <p className={`mt-5 ${displayClass}`}>{sample}</p>
    </div>
  );
}
