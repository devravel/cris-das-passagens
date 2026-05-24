const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_DASHBOARD_PATH = "/admin";
const REDIRECT_PARAM_KEY = "redirectTo";

export function buildAdminLoginRedirect(destinationPathname: string) {
  const redirectTarget =
    destinationPathname.startsWith("/admin") &&
    destinationPathname !== ADMIN_LOGIN_PATH
      ? destinationPathname
      : ADMIN_DASHBOARD_PATH;

  const params = new URLSearchParams({
    [REDIRECT_PARAM_KEY]: redirectTarget,
  });

  return `${ADMIN_LOGIN_PATH}?${params.toString()}`;
}

export function getSafeAdminRedirectTarget(redirectTo: string | null) {
  if (!redirectTo) {
    return ADMIN_DASHBOARD_PATH;
  }

  if (!redirectTo.startsWith("/")) {
    return ADMIN_DASHBOARD_PATH;
  }

  if (redirectTo.startsWith("//")) {
    return ADMIN_DASHBOARD_PATH;
  }

  if (!redirectTo.startsWith("/admin")) {
    return ADMIN_DASHBOARD_PATH;
  }

  if (redirectTo === ADMIN_LOGIN_PATH) {
    return ADMIN_DASHBOARD_PATH;
  }

  return redirectTo;
}

export const adminAuthPaths = {
  login: ADMIN_LOGIN_PATH,
  dashboard: ADMIN_DASHBOARD_PATH,
  redirectParamKey: REDIRECT_PARAM_KEY,
} as const;
