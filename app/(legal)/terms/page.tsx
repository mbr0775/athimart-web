import type { Metadata } from "next";
import Link from "next/link";
import { getPrivacyContact } from "@/lib/legal/privacy-contact";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for using AthiMart Customer, AthiMart Seller and the AthiMart marketplace.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const email = getPrivacyContact();

  return (
    <>
      <h1>Terms &amp; Conditions</h1>
      <p>These terms govern use of the AthiMart marketplace, AthiMart Customer and AthiMart Seller.</p>
      <h2>Accounts</h2>
      <p>Provide accurate information, keep your sign-in details private, and use your own account. Seller tools require an approved seller account.</p>
      <h2>Orders and returns</h2>
      <p>
        Check the seller, selected product variant, price, delivery details and total before placing an order.
        Product availability and delivery options are shown during shopping and checkout.
        See the <Link href="/returns">Returns Policy</Link> for eligibility and return options.
        Your applicable consumer rights continue to apply.
      </p>
      <h2>Seller listings</h2>
      <p>
        Sellers must keep prices, inventory, product descriptions, availability and fulfillment information accurate.
        Only offer lawful products you are authorized to sell, and use customer information solely as needed to fulfill
        orders or resolve marketplace issues.
      </p>
      <h2>Posts, listings and messages</h2>
      <p>
        Share content only when you have permission to do so. Harassment, threats, hateful or sexually exploitative content,
        scams, counterfeit listings, spam, and publishing someone else’s private information without permission are prohibited.
        Use available reporting controls to flag abuse. AthiMart may review reports, remove violating content and restrict
        accounts that misuse the marketplace.
      </p>
      <h2>Privacy and account deletion</h2>
      <p>
        Read the <Link href="/privacy">Privacy Policy</Link> to see how information is handled.
        You can <Link href="/account-deletion">request account deletion</Link>.
        {email && <> For questions about these terms, email <a href={`mailto:${email}`}>{email}</a>.</>}
      </p>
    </>
  );
}
