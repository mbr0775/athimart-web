"use server";

import { createClient } from "@/lib/supabase/server";

export interface CheckoutCartItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutSubmission {
  items: CheckoutCartItemInput[];

  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;

  shippingCity: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;

  paymentMethod?: string;
}

export interface CheckoutOrderResult {
  orderId: string;
  orderNumber: string;
  status: string;

  itemsCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;

  countryCode: string;
  currencyCode: string;
}

export type CheckoutActionResult =
  | {
      success: true;
      order: CheckoutOrderResult;
    }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "VALIDATION_ERROR"
        | "CHECKOUT_ERROR";
      message: string;
    };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function toFiniteNumber(
  value: unknown
): number | null {
  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return null;
  }

  const numberValue =
    Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

/**
 * Only return checkout messages that are safe
 * and useful for the customer.
 */
function getSafeCheckoutErrorMessage(
  errorMessage: string
): string {
  const message =
    errorMessage.trim();

  const exactSafeMessages = [
    "You must sign in before placing an order.",
    "This account cannot currently place orders.",
    "Please enter a valid customer name.",
    "The customer name is too long.",
    "Please enter a valid phone number.",
    "The phone number is too long.",
    "Please enter a valid delivery address.",
    "The delivery address is too long.",
    "Please enter a valid city.",
    "The city name is too long.",
    "The current checkout supports Sri Lanka only.",
    "The selected payment method is not currently supported.",
    "Invalid shopping cart.",
    "Invalid shopping cart item.",
    "Invalid product identifier.",
    "Invalid product quantity.",
    "A product quantity cannot exceed 1000.",
    "Your shopping cart is empty.",
    "The shopping cart contains too many items.",
    "A product in your cart no longer exists.",
  ];

  if (
    exactSafeMessages.includes(
      message
    )
  ) {
    return message;
  }

  const safePrefixes = [
    "Product ",
    "Only ",
    "The seller for product ",
  ];

  if (
    safePrefixes.some(
      (prefix) =>
        message.startsWith(prefix)
    )
  ) {
    return message;
  }

  return "We could not place your order. Please review your cart and try again.";
}

function validateCheckoutSubmission(
  input: unknown
):
  | {
      valid: true;
      data: Required<
        Omit<
          CheckoutSubmission,
          "items"
        >
      > & {
        items: CheckoutCartItemInput[];
      };
    }
  | {
      valid: false;
      message: string;
    } {
  if (!isRecord(input)) {
    return {
      valid: false,
      message:
        "Invalid checkout information.",
    };
  }

  const shippingName =
    normalizeText(
      input.shippingName
    );

  const shippingPhone =
    normalizeText(
      input.shippingPhone
    );

  const shippingAddressLine1 =
    normalizeText(
      input.shippingAddressLine1
    );

  const shippingAddressLine2 =
    normalizeText(
      input.shippingAddressLine2
    );

  const shippingCity =
    normalizeText(
      input.shippingCity
    );

  const shippingState =
    normalizeText(
      input.shippingState
    );

  const shippingPostalCode =
    normalizeText(
      input.shippingPostalCode
    );

  const shippingCountry =
    normalizeText(
      input.shippingCountry
    ) || "Sri Lanka";

  const paymentMethod =
    normalizeText(
      input.paymentMethod
    ) || "Cash on Delivery";

  if (
    shippingName.length < 2 ||
    shippingName.length > 120
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid customer name.",
    };
  }

  if (
    shippingPhone.length < 7 ||
    shippingPhone.length > 30
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid phone number.",
    };
  }

  if (
    shippingAddressLine1.length <
      5 ||
    shippingAddressLine1.length >
      200
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid delivery address.",
    };
  }

  if (
    shippingAddressLine2.length >
    200
  ) {
    return {
      valid: false,
      message:
        "Address line 2 is too long.",
    };
  }

  if (
    shippingCity.length < 2 ||
    shippingCity.length > 100
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid city.",
    };
  }

  if (
    shippingState.length > 100
  ) {
    return {
      valid: false,
      message:
        "The province or district is too long.",
    };
  }

  if (
    shippingPostalCode.length >
    30
  ) {
    return {
      valid: false,
      message:
        "The postal code is too long.",
    };
  }

  if (
    shippingCountry.toLowerCase() !==
      "sri lanka" &&
    shippingCountry.toLowerCase() !==
      "lk"
  ) {
    return {
      valid: false,
      message:
        "The current checkout supports Sri Lanka only.",
    };
  }

  if (
    paymentMethod !==
    "Cash on Delivery"
  ) {
    return {
      valid: false,
      message:
        "The selected payment method is not currently supported.",
    };
  }

  if (
    !Array.isArray(
      input.items
    ) ||
    input.items.length === 0
  ) {
    return {
      valid: false,
      message:
        "Your shopping cart is empty.",
    };
  }

  if (
    input.items.length > 100
  ) {
    return {
      valid: false,
      message:
        "The shopping cart contains too many items.",
    };
  }

  const normalizedItems:
    CheckoutCartItemInput[] = [];

  for (
    const rawItem of input.items
  ) {
    if (!isRecord(rawItem)) {
      return {
        valid: false,
        message:
          "Invalid shopping cart item.",
      };
    }

    const productId =
      normalizeText(
        rawItem.productId
      );

    const quantity =
      rawItem.quantity;

    if (
      !UUID_PATTERN.test(
        productId
      )
    ) {
      return {
        valid: false,
        message:
          "Invalid product identifier.",
      };
    }

    if (
      typeof quantity !==
        "number" ||
      !Number.isInteger(
        quantity
      ) ||
      quantity < 1 ||
      quantity > 1000
    ) {
      return {
        valid: false,
        message:
          "Invalid product quantity.",
      };
    }

    normalizedItems.push({
      productId,
      quantity,
    });
  }

  return {
    valid: true,

    data: {
      items:
        normalizedItems,

      shippingName,
      shippingPhone,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingPostalCode,

      shippingCountry:
        "Sri Lanka",

      paymentMethod:
        "Cash on Delivery",
    },
  };
}

export async function createCheckoutOrder(
  input: CheckoutSubmission
): Promise<CheckoutActionResult> {
  const validation =
    validateCheckoutSubmission(
      input
    );

  if (!validation.valid) {
    return {
      success: false,
      code:
        "VALIDATION_ERROR",
      message:
        validation.message,
    };
  }

  const supabase =
    await createClient();

  /*
   * Verify the authenticated user on the
   * server before allowing the mutation.
   */
  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return {
      success: false,
      code:
        "UNAUTHENTICATED",
      message:
        "Please sign in before placing your order.",
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_checkout_order",
    {
      p_items:
        validation.data.items,

      p_shipping_name:
        validation.data
          .shippingName,

      p_shipping_phone:
        validation.data
          .shippingPhone,

      p_shipping_address_line1:
        validation.data
          .shippingAddressLine1,

      p_shipping_address_line2:
        validation.data
          .shippingAddressLine2 ||
        null,

      p_shipping_city:
        validation.data
          .shippingCity,

      p_shipping_state:
        validation.data
          .shippingState ||
        null,

      p_shipping_postal_code:
        validation.data
          .shippingPostalCode ||
        null,

      p_shipping_country:
        validation.data
          .shippingCountry,

      p_payment_method:
        validation.data
          .paymentMethod,
    }
  );

  if (error) {
    console.error(
      "Checkout RPC failed:",
      {
        userId:
          user.id,
        code:
          error.code,
        message:
          error.message,
        details:
          error.details,
        hint:
          error.hint,
      }
    );

    return {
      success: false,
      code:
        "CHECKOUT_ERROR",
      message:
        getSafeCheckoutErrorMessage(
          error.message
        ),
    };
  }

  if (!isRecord(data)) {
    console.error(
      "Checkout RPC returned an invalid response:",
      data
    );

    return {
      success: false,
      code:
        "CHECKOUT_ERROR",
      message:
        "The order was not completed correctly. Please try again.",
    };
  }

  const orderId =
    normalizeText(
      data.orderId
    );

  const orderNumber =
    normalizeText(
      data.orderNumber
    );

  const status =
    normalizeText(
      data.status
    );

  const countryCode =
    normalizeText(
      data.countryCode
    );

  const currencyCode =
    normalizeText(
      data.currencyCode
    );

  const itemsCount =
    toFiniteNumber(
      data.itemsCount
    );

  const subtotal =
    toFiniteNumber(
      data.subtotal
    );

  const deliveryFee =
    toFiniteNumber(
      data.deliveryFee
    );

  const total =
    toFiniteNumber(
      data.total
    );

  if (
    !orderId ||
    !orderNumber ||
    !status ||
    !countryCode ||
    !currencyCode ||
    itemsCount === null ||
    subtotal === null ||
    deliveryFee === null ||
    total === null
  ) {
    console.error(
      "Checkout RPC response is incomplete:",
      data
    );

    return {
      success: false,
      code:
        "CHECKOUT_ERROR",
      message:
        "Your order response was incomplete. Please check your account before trying again.",
    };
  }

  return {
    success: true,

    order: {
      orderId,
      orderNumber,
      status,

      itemsCount:
        Math.trunc(
          itemsCount
        ),

      subtotal,
      deliveryFee,
      total,

      countryCode,
      currencyCode,
    },
  };
}