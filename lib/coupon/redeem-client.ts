type RedeemCouponPayload = {
  code: string;
  packageTitle: string;
};

export function redeemCouponInBackground({ code, packageTitle }: RedeemCouponPayload) {
  const payload = JSON.stringify({ code, packageTitle });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(
      "/api/coupons/redeem",
      new Blob([payload], { type: "application/json" }),
    );

    if (sent) {
      return;
    }
  }

  void fetch("/api/coupons/redeem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  });
}
