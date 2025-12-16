"use client";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  country: string;
  text: string;
  avatar: string;
  rating: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Michael R.",
    role: "Crypto & Indices Trader",
    country: "United Kingdom",
    text: "ApexGlobalEarnings gives me a clean way to separate my active trading from my short-term investment plans. Payouts have been smooth and the dashboard is straightforward.",
    avatar: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6",
    rating: 5,
  },
  {
    id: 2,
    name: "Sophia L.",
    role: "Passive Investor",
    country: "United Arab Emirates",
    text: "I use the Standard and Professional plans to grow idle capital. Being able to see daily ROI credited and track everything in one place gives me real confidence.",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    rating: 5,
  },
  {
    id: 3,
    name: "Daniel K.",
    role: "Affiliate Partner",
    country: "Nigeria",
    text: "The referral system is one of the best I have used. Level 1 and Level 2 commissions are clearly visible and the reporting makes it easy to understand my earnings.",
    avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126",
    rating: 4,
  },
  {
    id: 4,
    name: "Elena V.",
    role: "Premium Member",
    country: "Spain",
    text: "Moving to the Premium Members plan has significantly boosted my returns. The team is responsive and the structure of each plan is transparent.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    rating: 5,
  },
  {
    id: 5,
    name: "James T.",
    role: "VIP Client",
    country: "Singapore",
    text: "I appreciate how ApexGlobalEarnings combines aggressive ROI structures with clear risk communication. The VIP tier support has been excellent so far.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    rating: 5,
  },
  {
    id: 6,
    name: "Aisha M.",
    role: "Long-Term Investor",
    country: "Qatar",
    text: "The platform helps me diversify my exposure beyond simple spot holdings. I especially like the clarity around plan duration and expected returns.",
    avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7",
    rating: 4,
  },
];

export default function Testimonials() {
  // duplicate list so marquee can loop seamlessly
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-black border-t border-gray-900/70"
      aria-label="Client testimonials"
    >
      {/* ---------- BACKGROUND IMAGE + OVERLAY ---------- */}
      <div className="absolute inset-0">
        <img
          src="/testimonials-bg.jpg"
          alt="Satisfied investors using trading platform"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/85 to-bg/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,133,0.14),_transparent_55%)]" />
      </div>

      {/* ---------- FOREGROUND CONTENT ---------- */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto page-padding py-14 md:py-16 lg:py-20">
        {/* Header */}
        <div className="max-w-2xl mb-8 md:mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-accentGold mb-3">
            Client Testimonials
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight mb-3">
            Trusted by{" "}
            <span className="text-accentGold">traders and investors</span> across
            multiple markets.
          </h2>
          <p className="text-sm sm:text-base text-gray-200/90">
            Hear from clients using ApexGlobalEarnings to manage active trading,
            short-term investment plans and referral income in a single, unified
            environment.
          </p>
        </div>

        {/* Marquee row */}
        <div className="relative overflow-hidden">
          <div className="testimonials-track flex gap-4 sm:gap-5 lg:gap-6 pb-2">
            {marqueeItems.map((t, index) => (
              <article
                key={`${t.id}-${index}`}
                className="min-w-[260px] sm:min-w-[280px] lg:min-w-[320px] max-w-xs card-glow bg-black/70 border border-gray-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
              >
                {/* Profile */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-accentGold/60 bg-black/60 flex-shrink-0">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-50">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {t.role} · {t.country}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-[11px]">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          "text-[12px] " +
                          (i < t.rating ? "text-accentGold" : "text-gray-600")
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-400 ml-1">
                    {t.rating}.0 / 5.0 rating
                  </span>
                </div>

                {/* Text */}
                <p className="text-[12px] sm:text-[13px] text-gray-200/90 leading-relaxed">
                  “{t.text}”
                </p>

                {/* Tag */}
                <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>Verified ApexGlobalEarnings client experience.</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
