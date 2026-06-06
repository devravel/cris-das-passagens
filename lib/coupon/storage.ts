"use client";

import {
  COUPON_APPLY_LOCK_HOURS,
  COUPON_REUSE_LOCK_HOURS,
} from "@/config/coupon";

const STORAGE_KEYS = {
  code: "couponCode",
  name: "couponName",
  discountLabel: "couponDiscountLabel",
  appliedAt: "couponAppliedAt",
  usedRecords: "couponUsedRecords",
} as const;

type CouponUsedRecord = {
  code: string;
  usedAt: string;
};

export type StoredCoupon = {
  code: string;
  name: string;
  discountLabel: string;
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

function readUsedRecords(): CouponUsedRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.usedRecords);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CouponUsedRecord[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (record) =>
        typeof record?.code === "string" && typeof record?.usedAt === "string",
    );
  } catch {
    return [];
  }
}

function writeUsedRecords(records: CouponUsedRecord[]) {
  window.localStorage.setItem(STORAGE_KEYS.usedRecords, JSON.stringify(records));
}

export function getStoredCoupon(): StoredCoupon | null {
  if (typeof window === "undefined") {
    return null;
  }

  const code = window.localStorage.getItem(STORAGE_KEYS.code);
  const name = window.localStorage.getItem(STORAGE_KEYS.name);
  const discountLabel = window.localStorage.getItem(STORAGE_KEYS.discountLabel);
  const appliedAt = window.localStorage.getItem(STORAGE_KEYS.appliedAt);

  if (!code || !name || !discountLabel || !appliedAt) {
    return null;
  }

  if (!isWithinLockPeriod(appliedAt, COUPON_APPLY_LOCK_HOURS)) {
    clearStoredCoupon();
    return null;
  }

  return { code, name, discountLabel, appliedAt };
}

export function hasActiveStoredCoupon() {
  return getStoredCoupon() !== null;
}

export function saveStoredCoupon(coupon: {
  code: string;
  name: string;
  discountLabel: string;
}) {
  const appliedAt = new Date().toISOString();

  window.localStorage.setItem(STORAGE_KEYS.code, coupon.code);
  window.localStorage.setItem(STORAGE_KEYS.name, coupon.name);
  window.localStorage.setItem(STORAGE_KEYS.discountLabel, coupon.discountLabel);
  window.localStorage.setItem(STORAGE_KEYS.appliedAt, appliedAt);
}

export function clearStoredCoupon() {
  window.localStorage.removeItem(STORAGE_KEYS.code);
  window.localStorage.removeItem(STORAGE_KEYS.name);
  window.localStorage.removeItem(STORAGE_KEYS.discountLabel);
  window.localStorage.removeItem(STORAGE_KEYS.appliedAt);
}

export function hasRecentlyUsedCoupon(code: string) {
  const normalizedCode = code.toUpperCase();
  const records = readUsedRecords();

  return records.some(
    (record) =>
      record.code.toUpperCase() === normalizedCode &&
      isWithinLockPeriod(record.usedAt, COUPON_REUSE_LOCK_HOURS),
  );
}

export function recordCouponUsage(code: string) {
  const normalizedCode = code.toUpperCase();
  const records = readUsedRecords().filter(
    (record) =>
      !(
        record.code.toUpperCase() === normalizedCode &&
        isWithinLockPeriod(record.usedAt, COUPON_REUSE_LOCK_HOURS)
      ),
  );

  records.push({
    code: normalizedCode,
    usedAt: new Date().toISOString(),
  });

  writeUsedRecords(records);
  clearStoredCoupon();
}
