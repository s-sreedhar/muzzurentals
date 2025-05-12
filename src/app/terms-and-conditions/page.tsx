import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms and Conditions | Muzzu Rentals",
  description: "Read our terms and conditions for using our services.",
}

export default function TermsAndConditions() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Back to Home Button */}
        <div className="mb-8 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-gray-300 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </Link>
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing or using the Muzzu Rentals website and services, you agree to be bound by these Terms and
                  Conditions. If you do not agree with any part of these terms, you must not use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Rental Services</h2>
                <p className="text-gray-700 mb-4">
                  Muzzu Rentals provides camera and photography equipment rental services. All equipment remains the property
                  of Muzzu Rentals or its partners at all times.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Eligibility</h2>
                <p className="text-gray-700 mb-4">
                  To rent equipment, you must be at least 18 years old and provide valid identification and payment
                  information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Rental Period and Fees</h2>
                <p className="text-gray-700 mb-4">
                  Rental periods are calculated in 24-hour increments from the time of checkout. Late returns will incur
                  additional charges as specified in our pricing policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Equipment Condition and Responsibility</h2>
                <p className="text-gray-700 mb-4">
                  Renters are responsible for the equipment during the rental period and must return it in the same
                  condition as received, normal wear and tear excepted. You will be charged for any damage or loss.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Cancellations and Refunds</h2>
                <p className="text-gray-700 mb-4">
                  Cancellation policies vary depending on the rental period and timing. Please refer to our{" "}
                  <Link href="/cancellation-refund" className="text-blue-600 hover:underline">
                    Cancellation & Refund Policy
                  </Link>{" "}
                  for details.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  Muzzu Rentals is not liable for any indirect, incidental, or consequential damages arising from the use of
                  our services or equipment.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Governing Law</h2>
                <p className="text-gray-700 mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to
                  its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Contact Information</h2>
                <p className="text-gray-700">
                  For any questions regarding these Terms and Conditions, please contact us at{" "}
                  <Link href="mailto:legal@muzzurentals.com" className="text-blue-600 hover:underline">
                    legal@muzzurentals.com
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
