// components/home/why-athimart-section.tsx

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Easy discovery",
    description:
      "Browse organised categories, subcategories and detailed product pages.",
  },
  {
    number: "02",
    title: "Shared platform",
    description:
      "Access connected marketplace information through mobile and web.",
  },
  {
    number: "03",
    title: "Live information",
    description:
      "View current prices, product images and marketplace availability.",
  },
];

export default function WhyAthiMartSection() {
  return (
    <section
      id="why-athimart"
      className="
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
            max-w-4xl
            text-center
          "
        >
          <p
            className="
              text-xs
              uppercase
              tracking-[0.35em]
              text-[#9a927f]
            "
          >
            Connected Commerce
          </p>

          <h2
            className="
              !mt-5
              font-[var(--font-display)]
              text-4xl
              font-light
              leading-tight
              text-[#303024]
              sm:text-5xl
            "
          >
            Why AthiMart
          </h2>

          <p
            className="
              !mx-auto
              !mt-6
              max-w-3xl
              text-center
              text-base
              leading-8
              text-[#777267]
              sm:text-lg
            "
          >
            AthiMart connects customers, sellers and marketplace
            operations through one connected platform.
          </p>
        </div>

        {/* Feature Cards */}
        <div
          className="
            mx-auto
            mt-16
            grid
            max-w-[1200px]
            gap-6
            md:grid-cols-3
          "
        >
          {features.map((item) => (
            <article
              key={item.number}
              className="
                rounded-[28px]
                border
                border-[#e7e0d2]
                bg-white
                p-8
                transition
                duration-300
                hover:-translate-y-1
              "
            >
              <span
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-[#303024]
                  text-sm
                  tracking-[0.2em]
                  !text-white
                "
              >
                {item.number}
              </span>

              <h3
                className="
                  !mt-8
                  text-xl
                  font-medium
                  text-[#303024]
                "
              >
                {item.title}
              </h3>

              <p
                className="
                  !mt-4
                  text-sm
                  leading-7
                  text-[#777267]
                "
              >
                {item.description}
              </p>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div
          className="
            mt-14
            text-center
          "
        >
          <Link
            href="/shop"
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              bg-[#303024]
              px-8
              py-3
              text-sm
              !text-white
              transition
              hover:opacity-90
            "
          >
            <span className="!text-white">Start Shopping</span>

            <ArrowRight className="h-5 w-5 !text-white" />
          </Link>
        </div>
      </div>
    </section>
  );
}