"use client";


import type {
  CategoryOption,
} from "./product-form-types";



interface Props {

  categories: CategoryOption[];

  selectedCategory: string;

  selectedSubcategory: string;

  onCategoryChange: (
    value: string
  ) => void;

  onSubcategoryChange: (
    value: string
  ) => void;

  errors?: Record<string,string>;

}





export default function ProductCategoryFields({

  categories,

  selectedCategory,

  selectedSubcategory,

  onCategoryChange,

  onSubcategoryChange,

  errors = {},

}: Props) {



  const currentCategory =
    categories.find(
      (category) =>
        category.name === selectedCategory
    );



  return (

    <section
      className="
        space-y-5
      "
    >


      <div>

        <p
          className="
            athimart-label
          "
        >
          Category
        </p>

      </div>





      <div
        className="
          grid
          gap-5
          md:grid-cols-2
        "
      >


        {/* Category */}


        <div>


          <label
            className="
              text-sm
              font-medium
            "
          >
            Category *
          </label>



          <select

            name="category"

            value={selectedCategory}

            onChange={(event)=>
              onCategoryChange(
                event.target.value
              )
            }

            className="
              mt-2
              w-full
              rounded-lg
              border
              px-4
              py-3
            "

          >


            <option value="">
              Select category
            </option>



            {
              categories.map(
                (category)=>(

                  <option

                    key={category.name}

                    value={category.name}

                  >

                    {category.name}

                  </option>

                )
              )
            }


          </select>



          {
            errors.category && (

              <p
                className="
                  mt-1
                  text-xs
                  text-red-600
                "
              >
                {errors.category}
              </p>

            )
          }



        </div>







        {/* Subcategory */}


        <div>


          <label
            className="
              text-sm
              font-medium
            "
          >
            Subcategory *
          </label>





          <select


            name="subCategory"


            value={selectedSubcategory}


            onChange={(event)=>

              onSubcategoryChange(
                event.target.value
              )

            }



            className="
              mt-2
              w-full
              rounded-lg
              border
              px-4
              py-3
            "


          >



            <option value="">
              Select subcategory
            </option>




            {
              currentCategory?.subcategories?.map(

                (subcategory)=>(


                  <option

                    key={subcategory.name}

                    value={subcategory.name}

                  >

                    {subcategory.name}

                  </option>


                )

              )

            }



          </select>





          {
            errors.subCategory && (

              <p
                className="
                  mt-1
                  text-xs
                  text-red-600
                "
              >
                {errors.subCategory}
              </p>

            )
          }



        </div>




      </div>



    </section>

  );

}