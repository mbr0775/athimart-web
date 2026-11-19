import type { Metadata } from "next";
import Link from "next/link";
import { getPrivacyContact } from "@/lib/legal/privacy-contact";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AthiMart Customer and AthiMart Seller use personal information and handle privacy requests.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const email = getPrivacyContact();

  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        This policy applies to the AthiMart marketplace at www.athimart.com and to the
        AthiMart Customer and AthiMart Seller apps operated by AthiMart.
      </p>
      <h2>Information we collect and use</h2>
      <ul>
        <li><strong>Accounts.</strong> Email, profile details, and sign-in information are used to create and protect your account. If you choose Google sign-in, we receive account information such as your name and email from Google.</li>
        <li><strong>Orders and delivery.</strong> Contact details, delivery addresses, cart and order information are used to process purchases, arrange delivery, and resolve order issues.</li>
        <li><strong>Seller activity.</strong> Seller application and shop details, product listings, photos you select, inventory, and order activity are used to review seller access and operate the seller workspace.</li>
        <li><strong>Marketplace activity.</strong> Posts, comments, messages, reports, and appeal submissions are used to provide the features you use and respond to support or moderation requests.</li>
        <li><strong>Technical information.</strong> Session cookies keep you signed in. When Google Analytics is enabled on the website, it records information such as pages visited, device and browser information, and interactions. The seller app opens the seller website inside the app.</li>
      </ul>
      <h2>Who receives information</h2>
      <p>
        We use Supabase for account authentication, data and file storage, and Vercel to host the website.
        Google receives information when you use Google sign-in or access website pages with Google Analytics enabled.
        Sellers and delivery partners receive the order and contact details they need to fulfill an order.
        Shop profiles, listings and public posts can be visible to other users. Conversation participants can read messages
        sent to them, and authorized staff may review submissions to resolve reports or provide support.
      </p>
      <h2>Security and retention</h2>
      <p>
        AthiMart uses HTTPS, authenticated sessions and role-based access to restrict access to account and seller information.
        We keep records as needed to operate your account and fulfill orders. After account deletion, some order and transaction
        records may be retained where needed for legal obligations, dispute resolution, security or fraud prevention.
      </p>
      <h2>Access, correction and deletion</h2>
      <p>
        You can update your profile from your account. To close your account and request deletion of associated data,
        follow the <Link href="/account-deletion">account deletion instructions</Link>.
        {email && <> For privacy questions or to request access or correction, email <a href={`mailto:${email}`}>{email}</a>.</>}
      </p>
    </>
  );
}
