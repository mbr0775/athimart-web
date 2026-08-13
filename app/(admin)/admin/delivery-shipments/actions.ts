// app/(admin)/admin/delivery-shipments/actions.ts

"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

import {
  getCurrentAdmin,
} from "@/lib/auth/admin";
import {
  createClient,
} from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ShipmentGenerationResponse {
  created: boolean;

  orderId: string;
  orderNumber: string;
  orderStatus: string;

  shipmentCount: number;
  orderItemCount: number;

  shipments: unknown[];
}

function normalizeText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizePositiveInteger(
  value: unknown
): number | null {
  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  if (
    !Number.isInteger(
      parsedValue
    ) ||
    parsedValue < 0
  ) {
    return null;
  }

  return parsedValue;
}

function parseShipmentGenerationResponse(
  value: unknown
): ShipmentGenerationResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  const orderId =
    normalizeText(
      value.orderId
    );

  const orderNumber =
    normalizeText(
      value.orderNumber
    );

  const orderStatus =
    normalizeText(
      value.orderStatus
    );

  const shipmentCount =
    normalizePositiveInteger(
      value.shipmentCount
    );

  const orderItemCount =
    normalizePositiveInteger(
      value.orderItemCount
    );

  const shipments =
    Array.isArray(
      value.shipments
    )
      ? value.shipments
      : null;

  if (
    value.created !== true ||
    !UUID_PATTERN.test(
      orderId
    ) ||
    !orderNumber ||
    !orderStatus ||
    shipmentCount === null ||
    orderItemCount === null ||
    shipments === null
  ) {
    return null;
  }

  return {
    created: true,
    orderId,
    orderNumber,
    orderStatus,
    shipmentCount,
    orderItemCount,
    shipments,
  };
}

function getShipmentGenerationErrorCode(
  message: string
): string {
  const normalizedMessage =
    message
      .trim()
      .toLowerCase();

  if (
    normalizedMessage.includes(
      "selected order could not be found"
    )
  ) {
    return "order-not-found";
  }

  if (
    normalizedMessage.includes(
      "completed or cancelled order"
    )
  ) {
    return "order-closed";
  }

  if (
    normalizedMessage.includes(
      "does not contain any order items"
    )
  ) {
    return "order-empty";
  }

  if (
    normalizedMessage.includes(
      "already been generated"
    )
  ) {
    return "shipments-exist";
  }

  if (
    normalizedMessage.includes(
      "only an administrator"
    )
  ) {
    return "admin-required";
  }

  return "generation-failed";
}

function refreshShipmentPages() {
  revalidatePath(
    "/admin"
  );

  revalidatePath(
    "/admin/delivery-shipments"
  );
}

/**
 * Generate delivery shipments for one order.
 *
 * The database RPC groups order items by vendor,
 * creates the shipment records and links each
 * order item to the correct shipment.
 */
export async function generateDeliveryShipments(
  formData: FormData
): Promise<never> {
  const {
    user,
  } =
    await getCurrentAdmin();

  const orderId =
    normalizeText(
      formData.get(
        "orderId"
      )
    );

  if (
    !UUID_PATTERN.test(
      orderId
    )
  ) {
    redirect(
      "/admin/delivery-shipments?error=invalid-order"
    );
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_delivery_shipments_for_order",
    {
      p_order_id:
        orderId,
    }
  );

  if (error) {
    console.error(
      "Generating AthiMart delivery shipments failed:",
      {
        administratorUserId:
          user.id,

        orderId,

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

    const errorCode =
      getShipmentGenerationErrorCode(
        error.message
      );

    redirect(
      `/admin/delivery-shipments?error=${encodeURIComponent(
        errorCode
      )}`
    );
  }

  const response =
    parseShipmentGenerationResponse(
      data
    );

  if (
    !response ||
    response.orderId !==
      orderId ||
    response.shipmentCount < 1
  ) {
    console.error(
      "Shipment-generation RPC returned an invalid response:",
      {
        administratorUserId:
          user.id,

        orderId,

        response:
          data,
      }
    );

    redirect(
      "/admin/delivery-shipments?error=invalid-response"
    );
  }

  refreshShipmentPages();

  const parameters =
    new URLSearchParams({
      generated: "1",

      order:
        response.orderNumber,

      shipments:
        String(
          response.shipmentCount
        ),

      items:
        String(
          response.orderItemCount
        ),
    });

  redirect(
    `/admin/delivery-shipments?${parameters.toString()}`
  );
}