// app/(seller)/seller/products/actions.ts

"use server";

import {
  revalidatePath,
} from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentSeller } from "@/lib/auth/seller";
import { getProductImagePaths } from "@/lib/storage/product-image-storage";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getValidProductId(
  productId: string
): string {
  const cleanedProductId =
    productId.trim();

  if (
    !UUID_PATTERN.test(
      cleanedProductId
    )
  ) {
    throw new Error(
      "Invalid product ID."
    );
  }

  return cleanedProductId;
}

function revalidateSellerProductPages(
  productId?: string
): void {
  revalidatePath(
    "/seller"
  );

  revalidatePath(
    "/seller/products"
  );

  if (productId) {
    revalidatePath(
      `/seller/products/${productId}/edit`
    );
  }

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    "/shop"
  );

  revalidatePath(
    "/",
    "layout"
  );
}

/**
 * Activate or deactivate a product belonging
 * to the currently authenticated seller.
 */
export async function setProductActive(
  productId: string,
  nextActiveState: boolean,
  formData: FormData
): Promise<void> {
  void formData;

  const { user } =
    await getCurrentSeller();

  const cleanedProductId =
    getValidProductId(
      productId
    );

  const supabase =
    await createClient();

  const {
    data: existingProduct,
    error: lookupError,
  } = await supabase
    .from("products")
    .select(
      "id, vendor_id"
    )
    .eq(
      "id",
      cleanedProductId
    )
    .eq(
      "vendor_id",
      user.id
    )
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Unable to verify the product: ${lookupError.message}`
    );
  }

  if (!existingProduct) {
    throw new Error(
      "The selected product does not exist or does not belong to your seller account."
    );
  }

  const {
    data: updatedProduct,
    error: updateError,
  } = await supabase
    .from("products")
    .update({
      is_active:
        nextActiveState,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      cleanedProductId
    )
    .eq(
      "vendor_id",
      user.id
    )
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(
      `Unable to change product status: ${updateError.message}`
    );
  }

  if (!updatedProduct) {
    throw new Error(
      "The product status was not updated."
    );
  }

  revalidateSellerProductPages(
    cleanedProductId
  );

  redirect(
    nextActiveState
      ? "/seller/products?statusChanged=activated"
      : "/seller/products?statusChanged=deactivated"
  );
}

/**
 * Permanently delete a product belonging
 * to the currently authenticated seller.
 *
 * The form must submit:
 *
 * confirmation=DELETE
 */
export async function deleteProduct(
  productId: string,
  formData: FormData
): Promise<void> {
  const { user } =
    await getCurrentSeller();

  const cleanedProductId =
    getValidProductId(
      productId
    );

  const confirmation =
    formData.get(
      "confirmation"
    );

  if (
    confirmation !==
    "DELETE"
  ) {
    throw new Error(
      "Product deletion was not confirmed."
    );
  }

  const supabase =
    await createClient();

  /*
   * Verify seller ownership and read images
   * before deleting the product record.
   */
  const {
    data: existingProduct,
    error: lookupError,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      image_urls,
      vendor_id
    `)
    .eq(
      "id",
      cleanedProductId
    )
    .eq(
      "vendor_id",
      user.id
    )
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Unable to verify the product: ${lookupError.message}`
    );
  }

  if (!existingProduct) {
    throw new Error(
      "The selected product does not exist or does not belong to your seller account."
    );
  }

  const imageUrls =
    Array.isArray(
      existingProduct.image_urls
    )
      ? existingProduct.image_urls.filter(
          (
            imageUrl
          ): imageUrl is string =>
            typeof imageUrl ===
              "string" &&
            imageUrl.trim().length >
              0
        )
      : [];

  const imagePaths =
    getProductImagePaths(
      imageUrls
    );

  /*
   * Delete only when vendor_id matches the
   * authenticated seller.
   */
  const {
    data: deletedProduct,
    error: deleteError,
  } = await supabase
    .from("products")
    .delete()
    .eq(
      "id",
      cleanedProductId
    )
    .eq(
      "vendor_id",
      user.id
    )
    .select("id")
    .maybeSingle();

  if (deleteError) {
    throw new Error(
      `Unable to delete product: ${deleteError.message}`
    );
  }

  if (!deletedProduct) {
    throw new Error(
      "The product was not deleted."
    );
  }

  /*
   * Remove recognized AthiMart image files
   * after the database record is deleted.
   */
  if (
    imagePaths.length > 0
  ) {
    const {
      error: imageRemovalError,
    } = await supabase.storage
      .from(
        "product-images"
      )
      .remove(
        imagePaths
      );

    if (imageRemovalError) {
      console.error(
        "AthiMart seller deleted-product image cleanup failed:",
        imageRemovalError.message
      );
    }
  }

  revalidateSellerProductPages(
    cleanedProductId
  );

  redirect(
    "/seller/products?deleted=1"
  );
}