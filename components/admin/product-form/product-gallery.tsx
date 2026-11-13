"use client";


import {
  ProductImageUploader,
} from "../product-image-uploader";



export interface ProductGalleryProps {

  initialUrls?: string[];
  allowEmpty?: boolean;

}



export default function ProductGallery({

  initialUrls = [],
  allowEmpty = false,

}: ProductGalleryProps) {


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
          Product Images
        </p>


        <p
          className="
            mt-1
            text-xs
            text-[var(--text-soft)]
          "
        >
          Upload product images displayed in the marketplace.
        </p>


      </div>



      <ProductImageUploader

        initialUrls={initialUrls}

        maximumImages={6}
        allowEmpty={allowEmpty}

      />


    </section>

  );

}
