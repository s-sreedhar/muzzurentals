import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Muzzu Rentals",
  description: "Learn about our cancellation and refund policies.",
};

export default function CancellationRefund() {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cancellation & Refund Policy
              </h1>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  1. Cancellation Policy
                </h2>
                <p className="text-gray-700 mb-4">
                  You may cancel your rental reservation under the following
                  conditions:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>
                    <strong>More than 48 hours before rental start:</strong>{" "}
                    Full refund minus any processing fees (if applicable)
                  </li>
                  <li>
                    <strong>24-48 hours before rental start:</strong> 50% of
                    rental fee will be charged as cancellation fee
                  </li>
                  <li>
                    <strong>Less than 24 hours before rental start:</strong> No
                    refund will be provided
                  </li>
                </ul>
                <p className="text-gray-700">
                  To cancel a reservation, please contact us at{" "}
                  <Link
                    href="mailto:muzameelpatan123@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    muzameelpatan123@gmail.com
                  </Link>{" "}
                  or call us at{" "}
                  <span className="font-medium">+91 93925 53149</span>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  2. Refund Policy
                </h2>
                <p className="text-gray-700 mb-4">
                  Refunds will be credited to the original method of payment
                  within 7-10 business days after cancellation approval. The
                  following conditions apply:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>Processing fees (if any) are non-refundable</li>
                  <li>
                    Shipping charges are non-refundable if the order has already
                    been shipped
                  </li>
                  <li>
                    Refunds for damaged equipment claims will be processed after
                    inspection
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  3. Early Returns
                </h2>
                <p className="text-gray-700 mb-4">
                  If you return equipment earlier than the scheduled return
                  date:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>No partial refunds will be given for early returns</li>
                  <li>The full rental period will be charged</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  4. Equipment Issues
                </h2>
                <p className="text-gray-700 mb-4">
                  If you receive defective or damaged equipment:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>
                    Contact us immediately (within 2 hours of receiving the
                    equipment)
                  </li>
                  <li>Do not attempt to repair the equipment yourself</li>
                  <li>
                    We will arrange for replacement equipment or issue a full
                    refund
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  5. Force Majeure
                </h2>
                <p className="text-gray-700 mb-4">
                  In cases of natural disasters, extreme weather conditions, or
                  other events beyond our control that prevent the fulfillment
                  of your rental, we will work with you to reschedule or provide
                  a full refund.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  6. Contact Us
                </h2>
                <p className="text-gray-700">
                  For any questions regarding cancellations or refunds, please
                  contact us at{" "}
                  <Link
                    href="mailto:muzameelpatan123@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    muzameelpatan123@gmail.com
                  </Link>{" "}
                  or call us at{" "}
                  <span className="font-medium">+91 93925 53149</span>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}