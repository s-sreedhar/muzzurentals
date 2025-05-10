import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | Muzzu Rentals",
  description: "Learn about how we protect your personal information.",
}

export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
                <p className="text-gray-700 mb-4">
                  Welcome to Muzzu Rentals. We are committed to protecting your privacy and ensuring the security of your
                  personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                  information when you visit our website or use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
                <p className="text-gray-700 mb-4">We may collect the following types of information:</p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>Personal identification information (Name, email address, phone number, etc.)</li>
                  <li>Payment information (processed securely through our payment gateway)</li>
                  <li>Device and usage information (IP address, browser type, pages visited)</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">We use the information we collect for various purposes:</p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To process your transactions</li>
                  <li>To communicate with you</li>
                  <li>To improve our website and services</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal data against
                  unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
                <p className="text-gray-700 mb-4">
                  You have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>The right to access your personal data</li>
                  <li>The right to request correction of inaccurate data</li>
                  <li>The right to request deletion of your data</li>
                  <li>The right to object to processing of your data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Changes to This Policy</h2>
                <p className="text-gray-700 mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                  Privacy Policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <Link href="mailto:privacy@muzzurentals.com" className="text-blue-600 hover:underline">
                    privacy@muzzurentals.com
                  </Link>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}