// components/home/shop-category-section.tsx

import Link from "next/link";

const categories = [
  {
    title: "Electronics",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    href: "/category/electronics",
  },
  {
    title: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050",
    href: "/category/fashion",
  },
  {
    title: "Home & Living",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013",
    href: "/category/home-living",
  },
  {
    title: "Beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    href: "/category/beauty",
  },
  {
    title: "Fitness & Sports",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    href: "/category/fitness",
  },
  {
    title: "Vehicles",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
    href: "/category/vehicles",
  },
];


export default function ShopCategorySection() {
  return (
    <section className="bg-[#f8f5ed] py-20">

      <div className="mx-auto max-w-[1400px] px-6">

        {/* Heading */}

        <div className="mb-14 text-center">

          <h2
            className="
              text-4xl
              md:text-5xl
              font-serif
              text-[#303024]
            "
          >
            Shop by Category
          </h2>

          <p
            className="
              mt-4
              text-[#66645a]
              text-lg
            "
          >
            Explore everything you need from AthiMart
          </p>

        </div>


        {/* Category Cards */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-8
          "
        >

          {categories.map((category) => (

            <Link
              key={category.title}
              href={category.href}
              className="
                group
                block
              "
            >

              {/* Image */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[32px]
                  aspect-[4/4]
                  bg-gray-200
                "
              >

                <img
                  src={category.image}
                  alt={category.title}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition
                    duration-700
                    group-hover:scale-105
                  "
                />

              </div>


              {/* Text */}

              <div
                className="
                  pt-6
                  text-center
                "
              >

                <h3
                  className="
                    text-3xl
                    font-serif
                    text-[#303024]
                  "
                >
                  {category.title}
                </h3>


                <p
                  className="
                    mt-3
                    text-[#777267]
                    text-base
                  "
                >
                  Shop Collection
                </p>


              </div>


            </Link>

          ))}

        </div>


      </div>

    </section>
  );
}