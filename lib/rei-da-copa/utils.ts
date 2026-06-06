const BRAZIL_PHONE_DIGITS_REGEX = /^\d{10,13}$/;
const BRAZILIAN_MOBILE_PHONE_DIGITS_REGEX = /^\d{11}$/;
const INSTAGRAM_HANDLE_REGEX = /^[a-z0-9._]{1,30}$/;

export function normalizeParticipantPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("55") && digits.length >= 12) {
    return digits.slice(2);
  }

  return digits;
}

export function formatParticipantPhoneForDisplay(phone: string): string {
  const digits = normalizeParticipantPhone(phone);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return digits;
}

export function isValidParticipantPhone(phone: string): boolean {
  return BRAZIL_PHONE_DIGITS_REGEX.test(normalizeParticipantPhone(phone));
}

export function isValidBrazilianMobilePhone(phone: string): boolean {
  const digits = normalizeParticipantPhone(phone);

  return (
    BRAZILIAN_MOBILE_PHONE_DIGITS_REGEX.test(digits) && digits.charAt(2) === "9"
  );
}

export function normalizeParticipantInstagram(instagram: string): string {
  return instagram.trim().replace(/^@+/, "").toLowerCase();
}

export function formatParticipantInstagramForDisplay(instagram: string): string {
  const handle = normalizeParticipantInstagram(instagram);
  return handle ? `@${handle}` : "";
}

export function isValidParticipantInstagram(instagram: string): boolean {
  return INSTAGRAM_HANDLE_REGEX.test(normalizeParticipantInstagram(instagram));
}

export function normalizeParticipantName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeKeyword(keyword: string): string {
  return keyword.trim().replace(/\s+/g, " ");
}

export function normalizeKeywordForLookup(keyword: string): string {
  return normalizeKeyword(keyword).toLocaleLowerCase("pt-BR");
}
