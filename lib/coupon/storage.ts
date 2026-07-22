"use client";

import { COUPON_APPLY_LOCK_HOURS } from "@/config/coupon";
import type { CouponDiscountTypeValue } from "@/lib/coupon/schemas";

const STORAGE_KEYS = {
  code: "couponCode",
  name: "couponName",
  discountLabel: "couponDiscountLabel",
  discountType: "couponDiscountType",
  appliedAt: "couponAppliedAt",
} as const;

export type StoredCoupon = {
  code: string;
  name: string;
  discountLabel: string;
  discountType: CouponDiscountTypeValue;
  appliedAt: string;
};

function hoursToMs(hours: number) {
  return hours * 60 * 60 * 1000;
}

function isWithinLockPeriod(timestamp: string, lockHours: number) {
  const appliedTime = new Date(timestamp).getTime();

  if (Number.isNaN(appliedTime)) {
    return false;
  }

  return Date.now() - appliedTime < hoursToMs(lockHours);
}

function isCouponDiscountType(value: string | null): value is CouponDiscountTypeValue {
  return value === "PERCENTAGE" || value === "FIXED" || value === "CUSTOM";
}

export function getStoredCoupon(): StoredCoupon | null {
  if (typeof window === "undefined") {
    return null;
  }

  const code = window.localStorage.getItem(STORAGE_KEYS.code);
  const name = window.localStorage.getItem(STORAGE_KEYS.name);
  const discountLabel = window.localStorage.getItem(STORAGE_KEYS.discountLabel);
  const discountTypeRaw = window.localStorage.getItem(STORAGE_KEYS.discountType);
  const appliedAt = window.localStorage.getItem(STORAGE_KEYS.appliedAt);

  if (!code || !name || !discountLabel || !appliedAt) {
    return null;
  }

  if (!isWithinLockPeriod(appliedAt, COUPON_APPLY_LOCK_HOURS)) {
    clearStoredCoupon();
    return null;
  }

  // Cupons salvos antes do tipo personalizado não tinham discountType.
  const discountType: CouponDiscountTypeValue = isCouponDiscountType(discountTypeRaw)
    ? discountTypeRaw
    : "PERCENTAGE";

  return { code, name, discountLabel, discountType, appliedAt };
}

export function hasActiveStoredCoupon() {
  return getStoredCoupon() !== null;
}

export function saveStoredCoupon(coupon: {
  code: string;
  name: string;
  discountLabel: string;
  discountType: CouponDiscountTypeValue;
}) {
  const appliedAt = new Date().toISOString();

  window.localStorage.setItem(STORAGE_KEYS.code, coupon.code);
  window.localStorage.setItem(STORAGE_KEYS.name, coupon.name);
  window.localStorage.setItem(STORAGE_KEYS.discountLabel, coupon.discountLabel);
  window.localStorage.setItem(STORAGE_KEYS.discountType, coupon.discountType);
  window.localStorage.setItem(STORAGE_KEYS.appliedAt, appliedAt);
}

export function clearStoredCoupon() {
  window.localStorage.removeItem(STORAGE_KEYS.code);
  window.localStorage.removeItem(STORAGE_KEYS.name);
  window.localStorage.removeItem(STORAGE_KEYS.discountLabel);
  window.localStorage.removeItem(STORAGE_KEYS.discountType);
  window.localStorage.removeItem(STORAGE_KEYS.appliedAt);
  window.localStorage.removeItem("couponUsedRecords");
}
