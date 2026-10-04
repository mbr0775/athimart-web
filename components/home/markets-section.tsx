// components/home/markets-section.tsx

import Image from "next/image";
import Link from "next/link";

const markets = [
  {
    code: "LK",
    title: "Sri Lanka",
    description:
      "Shop products with local pricing, delivery options and marketplace availability.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    href: "/shop?market=lk",
  },
  {
    code: "MV",
    title: "Maldives",
    description:
      "Explore selected products and digital services with Maldives marketplace support.",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
    href: "/shop?market=mv",
  },
];

export default function MarketsSection() {
  return (
    <section
      id="markets"
      className="
        scroll-mt-36
        bg-[#faf7ef]
        py-16
        sm:py-20
        lg:py-24
      "
    >
      <div
        className="
          mx-auto
          max-w-[1400px]
          px-5
          sm:px-8
          lg:px-10
        "
      >
        {/* Heading */}
        <div
          className="
            mx-auto
            mb-12
            w-full
            max-w-5xl
            text-center
            sm:mb-16
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              leading-5
              tracking-[0.2em]
              sm:tracking-[0.3em]
              text-[#9a927f]
              sm:text-xs
            "
          >
            Market Experience
          </p>

          <h2
            className="
              !mt-4
              font-(family-name:--font-display)
              text-3xl
              sm:text-4xl
              font-light
              leading-tight
              text-[#303024]
              sm:text-5xl
            "
          >
            Shop Across Markets
          </h2>

          <p
            className="
              !mx-auto
              !mt-6
              w-full
              max-w-4xl
              px-2
              text-center
              text-sm
              leading-7
              text-[#777267]
              sm:text-base
              sm:leading-8
              lg:text-lg
            "
          >
            AthiMart connects customers across different markets with suitable
            products, pricing and delivery options.
          </p>
        </div>

        {/* Market Cards */}
        <div
          className="
            mx-auto
            grid
            max-w-[1200px]
            gap-6
            sm:gap-8
            md:grid-cols-2
          "
        >
          {markets.map((market) => (
            <Link
              key={market.code}
              data-home-reveal
              href={market.href}
              className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                sm:rounded-[32px]
              "
            >
              {/* Image */}
              <div
                className="
                  relative
                  aspect-square
                  sm:aspect-[1.45/1]
                  overflow-hidden
                "
              >
                <Image
                  src={market.image}
                  alt={market.title}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="
                    object-cover
                    transition
                    duration-700
                    group-hover:scale-105
                  "
                />
              </div>

              {/* Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/85
                  via-black/40
                  to-black/10
                "
              />

              {/* Card Content */}
              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  z-10
                  p-6
                  sm:p-10
                "
              >
                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-white/20
                    px-4
                    py-1
                    text-[10px]
                    tracking-[0.25em]
                    !text-white
                    backdrop-blur
                    sm:text-xs
                  "
                >
                  {market.code}
                </span>

                <h3
                  className="
                    !mt-4
                    font-(family-name:--font-display)
                    text-3xl
                    leading-tight
                    font-light
                    !text-white
                    sm:!mt-5
                    sm:text-5xl
                  "
                >
                  {market.title}
                </h3>

                <p
                  className="
                    !mt-3
                    max-w-md
                    text-xs
                    leading-5
                    !text-white
                    sm:text-sm
                    sm:leading-6
                  "
                >
                  {market.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
