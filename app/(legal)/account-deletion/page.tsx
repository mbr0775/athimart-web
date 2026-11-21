import type { Metadata } from "next";
import Link from "@/components/navigation/navigation-link";
import { getPrivacyContact } from "@/lib/legal/privacy-contact";

export const metadata: Metadata = {
  title: "Request account deletion",
  description: "Request deletion of your AthiMart Customer or AthiMart Seller account and associated data.",
  alternates: { canonical: "/account-deletion" },
};

export default function AccountDeletionPage() {
  const email = getPrivacyContact();

  return (
    <>
      <h1>Request account deletion</h1>
      <p>
        Use this page to request deletion of your AthiMart Customer or AthiMart Seller account
        and its associated data. You can request deletion without installing or opening either app.
      </p>
      <h2>How to submit a request</h2>
      {email ? (
        <>
          <p>
            Email <a href={`mailto:${email}?subject=AthiMart%20account%20deletion`}>{email}</a> from the
            email address registered to your account. Include the app you use and, if you sell on AthiMart,
            your shop name. Keep passwords and verification codes private.
          </p>
          <p>
            We may verify that you own the account before processing the request. If you use the same
            AthiMart account for shopping and selling, deleting it affects both apps.
          </p>
        </>
      ) : (
        <p>The email channel for account-deletion requests is being set up.</p>
      )}
      <h2>What happens to your data</h2>
      <p>
        We delete the account and associated personal data, including profile information and
        saved addresses. Records required for legal obligations, unresolved disputes, fraud prevention
        or security may be retained for those purposes. See the <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </>
  );
}
