import type { PackageCategoryValue } from "@/lib/package/constants";

/** Pacotes legados sem categoria contam como nacionais até serem editados no admin. */
export function packageMatchesCategory(
  packageCategory: PackageCategoryValue | null,
  filter: PackageCategoryValue,
): boolean {
  if (packageCategory === filter) {
    return true;
  }

  return packageCategory == null && filter === "NATIONAL";
}
