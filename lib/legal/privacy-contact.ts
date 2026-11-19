import "server-only";

export function getPrivacyContact() {
  const email = process.env.ATHIMART_PRIVACY_EMAIL?.trim();
  return email && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)
    ? email
    : null;
}
