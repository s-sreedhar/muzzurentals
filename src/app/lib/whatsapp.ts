"use server"

// WhatsApp Business API integration
export async function sendWhatsAppMessage(
  phoneNumber: string,
  orderDetails: {
    orderId: string
    total: number
    items: Array<{ name: string; quantity: number }>
    userName: string
  },
) {
  try {
    // Format the phone number (remove any non-numeric characters and ensure it has country code)
    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Create the message template with order details
    // const message = createOrderConfirmationMessage(orderDetails)

    // Meta WhatsApp Business API endpoint
    const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: "order_confirmation",
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "text",
                  text: orderDetails.orderId,
                },
              ],
            },
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: orderDetails.userName,
                },
                {
                  type: "text",
                  text: `$${orderDetails.total.toFixed(2)}`,
                },
                {
                  type: "text",
                  text: formatOrderItems(orderDetails.items),
                },
              ],
            },
          ],
        },
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      }
    } else {
      console.error("WhatsApp API error:", data)
      return {
        success: false,
        error: data.error?.message || "Failed to send WhatsApp message",
      }
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return {
      success: false,
      error: "An error occurred while sending the WhatsApp message",
    }
  }
}

// Helper function to format phone number
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "")

  // Ensure it has the country code (add +91 for India if not present)
  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    return `91${cleaned}`
  }

  return cleaned
}

// Helper function to format order items for WhatsApp message
function formatOrderItems(items: Array<{ name: string; quantity: number }>): string {
  return items.map((item) => `${item.name} (${item.quantity})`).join(", ")
}

// Alternative implementation using direct text message instead of template
export async function sendWhatsAppTextMessage(phoneNumber: string, message: string) {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber)

    const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      }
    } else {
      console.error("WhatsApp API error:", data)
      return {
        success: false,
        error: data.error?.message || "Failed to send WhatsApp message",
      }
    }
  } catch (error) {
    console.error("Error sending WhatsApp text message:", error)
    return {
      success: false,
      error: "An error occurred while sending the WhatsApp message",
    }
  }
}

// Create a simple order confirmation message

// function createOrderConfirmationMessage(orderDetails: {
//   orderId: string
//   total: number
//   items: Array<{ name: string; quantity: number }>
//   userName: string
// }): string {
//   const itemsList = orderDetails.items.map((item) => `• ${item.name} (Qty: ${item.quantity})`).join("\n")

//   return `🎉 *Order Confirmed!* 🎉

// Hello ${orderDetails.userName},

// Your order #${orderDetails.orderId} has been confirmed. Thank you for choosing CameraRent!

// *Order Details:*
// ${itemsList}

// *Total Amount:* $${orderDetails.total.toFixed(2)}

// Your rental equipment will be ready for pickup or delivery as per your selected option. We'll send you another message with tracking details soon.

// If you have any questions, please reply to this message or call us at +91 98765 43210.

// Thank you for your business!

// *CameraRent Team*`
// }
