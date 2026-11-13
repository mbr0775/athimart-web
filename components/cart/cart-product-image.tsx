"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { CartItem } from "@/types/cart";

interface CartProductImageProps {
  item: Pick<CartItem, "name" | "imageUrl">;
  className: string;
  fallbackClassName: string;
  compact?: boolean;
}

export default function CartProductImage({ item, className, fallbackClassName, compact = false }: CartProductImageProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return (
    <div className={className}>
      {item.imageUrl && failedImage !== item.imageUrl ? (
        // Cart images may be legacy URLs; preserve native image support.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.name} loading="lazy" onError={() => setFailedImage(item.imageUrl)} />
      ) : (
        <div className={fallbackClassName}>
          <ShoppingBag size={compact ? 24 : 35} strokeWidth={1.1} aria-hidden="true" />
          {!compact && <span>Good things inside</span>}
          <span className="sr-only">Product image unavailable</span>
        </div>
      )}
    </div>
  );
}
