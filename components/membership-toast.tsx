"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const MembershipToast = () => {
  useEffect(() => {
    // Delay toast to avoid React state update during render
    const timeout = setTimeout(() => {
      toast(
        "Important update! We're introducing a membership fee. But good news – if you join today, you'll receive up to 10GB in rewards!",
        {
          action: {
            label: "Join Now",
            onClick: () => (window.location.href = "/join"),
          },
          duration: 30000,
        }
      );
    }, 100); // Small delay ensures it's not called in the render phase

    return () => clearTimeout(timeout); // Cleanup on unmount
  }, []);

  return null;
};

export default MembershipToast;
