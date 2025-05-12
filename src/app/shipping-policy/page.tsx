import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Shipping Policy | Muzzu Rentals",
  description: "Learn about our shipping methods and delivery timelines.",
}

export default function ShippingPolicy() {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Shipping Methods</h2>
                <p className="text-gray-700 mb-4">
                  We offer several shipping options to meet your needs:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>Standard Delivery (3-5 business days)</li>
                  <li>Express Delivery (1-2 business days)</li>
                  <li>Same-Day Delivery (available in select locations)</li>
                  <li>Store Pickup (available at our Gudur location)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Delivery Areas</h2>
                <p className="text-gray-700 mb-4">
                  We currently ship to all major cities and towns in Andhra Pradesh and Telangana. For deliveries outside
                  these areas, please contact us for availability and additional shipping charges.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Shipping Costs</h2>
                <p className="text-gray-700 mb-4">
                  Shipping costs vary depending on:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>The shipping method selected</li>
                  <li>The destination</li>
                  <li>The weight and size of the equipment</li>
                  <li>Insurance requirements</li>
                </ul>
                <p className="text-gray-700">
                  Shipping costs will be displayed during checkout before you complete your order.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Delivery Times</h2>
                <p className="text-gray-700 mb-4">
                  Delivery times are estimates and begin from the time your order is shipped, not necessarily from the
                  date you place the order. Delivery times may vary due to:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                  <li>Processing time (typically 1 business day)</li>
                  <li>Shipping carrier delays</li>
                  <li>Weather conditions</li>
                  <li>Customs clearance (for international shipments)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Tracking Your Order</h2>
                <p className="text-gray-700 mb-4">
                  Once your order has shipped, you will receive a confirmation email with tracking information. You can
                  track your package using the provided tracking number on the carrier&apos;s website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Damaged or Lost Shipments</h2>
                <p className="text-gray-700 mb-4">
                  All shipments are insured. If your equipment arrives damaged or if the shipment is lost, please contact
                  us immediately at <span className="font-medium">muzameelpatan123@gmail.com</span> or call us at{" "}
                  <span className="font-medium">+91 93925 53149</span>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">7. International Shipping</h2>
                <p className="text-gray-700">
                  We currently do not offer international shipping. For special requests, please contact our customer
                  service team.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
