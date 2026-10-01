"use client";


import {
  ProductImageUploader,
} from "../product-image-uploader";



export interface ProductGalleryProps {

  initialUrls?: string[];

}



export default function ProductGallery({

  initialUrls = [],

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
            text-gray-500
          "
        >
          Upload product images displayed in the marketplace.
        </p>


      </div>



      <ProductImageUploader

        initialUrls={initialUrls}

        maximumImages={6}

      />


    </section>

  );

}