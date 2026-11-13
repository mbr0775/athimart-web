"use client";


import type {
  AdminEditableProduct,
} from "@/lib/products/admin-product-edit-service";



interface Props {

  product: AdminEditableProduct;

  errors?: Record<string,string>;

}



export default function ProductDescription({

  product,

  errors = {},

}: Props) {


  return (

    <section
      className="
        space-y-4
      "
    >


      <div>

        <p
          className="
            athimart-label
          "
        >
          Product Description
        </p>


        <p
          className="
            mt-1
            text-xs
            text-[var(--text-soft)]
          "
        >
          Describe your product details.
        </p>


      </div>




      <div>


        <label
          className="
            text-sm
            font-medium
          "
        >
          Description
        </label>


        <textarea

          name="description"

          defaultValue={
            product.description ?? ""
          }

          rows={6}

          className="
            mt-2
            w-full
            rounded-xl
            border
            px-4
            py-3
           border-[var(--border)] bg-[var(--surface)] focus:border-[var(--brand-hover)]"

          placeholder="Enter product description"

        />



        {
          errors.description && (

            <p
              className="
                mt-1
                text-xs
                text-red-600
              "
            >

              {errors.description}

            </p>

          )
        }


      </div>




    </section>

  );

}