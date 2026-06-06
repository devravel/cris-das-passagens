export const REI_DA_COPA_PERMISSIONS = {
  participants: {
    read: "rei_da_copa.participants.read",
    export: "rei_da_copa.participants.export",
  },
  keywords: {
    read: "rei_da_copa.keywords.read",
    validate: "rei_da_copa.keywords.validate",
  },
  ranking: {
    read: "rei_da_copa.ranking.read",
    manage: "rei_da_copa.ranking.manage",
  },
  settings: {
    read: "rei_da_copa.settings.read",
    manage: "rei_da_copa.settings.manage",
  },
} as const;

export type ReiDaCopaPermission =
  | (typeof REI_DA_COPA_PERMISSIONS.participants)[keyof typeof REI_DA_COPA_PERMISSIONS.participants]
  | (typeof REI_DA_COPA_PERMISSIONS.keywords)[keyof typeof REI_DA_COPA_PERMISSIONS.keywords]
  | (typeof REI_DA_COPA_PERMISSIONS.ranking)[keyof typeof REI_DA_COPA_PERMISSIONS.ranking]
  | (typeof REI_DA_COPA_PERMISSIONS.settings)[keyof typeof REI_DA_COPA_PERMISSIONS.settings];

const ADMIN_PERMISSIONS = new Set<ReiDaCopaPermission>([
  REI_DA_COPA_PERMISSIONS.participants.read,
  REI_DA_COPA_PERMISSIONS.participants.export,
  REI_DA_COPA_PERMISSIONS.keywords.read,
  REI_DA_COPA_PERMISSIONS.keywords.validate,
  REI_DA_COPA_PERMISSIONS.ranking.read,
  REI_DA_COPA_PERMISSIONS.ranking.manage,
  REI_DA_COPA_PERMISSIONS.settings.read,
  REI_DA_COPA_PERMISSIONS.settings.manage,
]);

export function hasReiDaCopaPermission(permission: ReiDaCopaPermission): boolean {
  return ADMIN_PERMISSIONS.has(permission);
}

export function assertReiDaCopaPermission(permission: ReiDaCopaPermission): void {
  if (!hasReiDaCopaPermission(permission)) {
    throw new Error("Permissão insuficiente para esta operação.");
  }
}
