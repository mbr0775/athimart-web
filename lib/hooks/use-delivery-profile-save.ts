"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveDeliveryDetails } from "@/app/(store)/account/profile-actions";
import type { DeliveryDetails, DeliveryDetailsResult } from "@/types/delivery-details";

export function useDeliveryProfileSave(initialDetails: DeliveryDetails) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const sequence = useRef(0);
  const lastSaved = useRef(JSON.stringify(initialDetails));
  const queue = useRef<Promise<DeliveryDetailsResult | null>>(Promise.resolve(null));
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const save = useCallback((details: DeliveryDetails) => {
    const version = ++sequence.current;
    const fingerprint = JSON.stringify(details);
    setStatus("saving");
    setMessage("Saving your details…");
    // Serialize saves so an older field blur cannot overwrite newer edits.
    const task = queue.current.then(async (): Promise<DeliveryDetailsResult> => {
      let result: DeliveryDetailsResult;
      try {
        result = fingerprint === lastSaved.current ? { success: true, details } : await saveDeliveryDetails(details);
      } catch {
        result = { success: false, code: "SAVE_ERROR", message: "Your details couldn't be saved. Please try again." };
      }
      if (result.success) lastSaved.current = fingerprint;
      if (mounted.current && version === sequence.current) {
        setStatus(result.success ? "saved" : "error");
        setMessage(result.success ? "Saved to your profile. Ready for your next checkout." : result.message);
      }
      return result;
    });
    queue.current = task;
    return task;
  }, []);

  const waitForPendingSaves = useCallback(() => queue.current, []);
  return { save, waitForPendingSaves, status, message };
}
