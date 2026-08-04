// app/(admin)/admin/products/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { getProductImagePaths } from "@/lib/storage/product-image-storage";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate and clean a product UUID.
 */
function getValidProductId(
  productId: string
): string {
  const cleanProductId =
    productId.trim();

  if (
    !UUID_PATTERN.test(
      cleanProductId
    )
  ) {
    throw new Error(
      "Invalid product ID."
    );
  }

  return cleanProductId;
}

/**
 * Refresh pages that display product data.
 */
function revalidateProductPages(
  productId?: string
): void {
  revalidatePath(
    "/admin/products"
  );

  if (productId) {
    revalidatePath(
      `/admin/products/${productId}/edit`
    );
  }

  revalidatePath("/shop");

  revalidatePath(
    "/",
    "layout"
  );
}

/**
 * Activate or deactivate one product.
 */
export async function setProductActive(
  productId: string,
  nextActiveState: boolean,
  formData: FormData
): Promise<void> {
  void formData;

  await getCurrentAdmin();

  const cleanProductId =
    getValidProductId(
      productId
    );

  const athimartClient =
    await createClient();

  const {
    data: updatedProduct,
    error: updateError,
  } = await athimartClient
    .from("products")
    .update({
      is_active:
        nextActiveState,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      cleanProductId
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
      "The product was not updated. Check the AthiMart admin product update policy."
    );
  }

  revalidateProductPages(
    cleanProductId
  );

  redirect(
    nextActiveState
      ? "/admin/products?statusChanged=activated"
      : "/admin/products?statusChanged=deactivated"
  );
}

/**
 * Permanently delete one product and clean
 * its recognized image files.
 *
 * The submitted form must include:
 *
 * confirmation=DELETE
 */
export async function deleteProduct(
  productId: string,
  formData: FormData
): Promise<void> {
  await getCurrentAdmin();

  const cleanProductId =
    getValidProductId(
      productId
    );

  const confirmation =
    formData.get(
      "confirmation"
    );

  if (
    confirmation !== "DELETE"
  ) {
    throw new Error(
      "Product deletion was not confirmed."
    );
  }

  const athimartClient =
    await createClient();

  /*
   * Read the product and its image URLs
   * before deleting the product record.
   */
  const {
    data: existingProduct,
    error: lookupError,
  } = await athimartClient
    .from("products")
    .select(
      "id, name, image_urls"
    )
    .eq(
      "id",
      cleanProductId
    )
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Unable to verify the product: ${lookupError.message}`
    );
  }

  if (!existingProduct) {
    throw new Error(
      "The selected product no longer exists."
    );
  }

  const existingImageUrls =
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

  /*
   * Only recognized product image paths
   * are returned.
   *
   * External URLs, seller-post paths and
   * unknown folder structures are ignored.
   */
  const productImagePaths =
    getProductImagePaths(
      existingImageUrls
    );

  /*
   * Delete the product record first.
   *
   * Image files are not removed if the
   * AthiMart database deletion fails.
   */
  const {
    data: deletedProduct,
    error: deleteError,
  } = await athimartClient
    .from("products")
    .delete()
    .eq(
      "id",
      cleanProductId
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
      "The product was not deleted. Check the AthiMart admin product delete policy."
    );
  }

  /*
   * The AthiMart database record has been
   * deleted successfully.
   *
   * Permanently remove its recognized image
   * files from the AthiMart server.
   */
  if (
    productImagePaths.length >
    0
  ) {
    const {
      error: imageRemovalError,
    } = await athimartClient.storage
      .from("product-images")
      .remove(
        productImagePaths
      );

    /*
     * Do not reverse a successful product
     * deletion if image cleanup encounters
     * a temporary problem.
     */
    if (imageRemovalError) {
      console.error(
        "AthiMart deleted-product image cleanup failed:",
        imageRemovalError.message
      );
    }
  }

  revalidateProductPages(
    cleanProductId
  );

  redirect(
    "/admin/products?deleted=1"
  );
}