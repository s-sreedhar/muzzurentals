// src/lib/razorpay.ts
export async function loadRazorpay() {
  if (typeof window !== 'undefined') {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        resolve(window.Razorpay);
      };
      script.onerror = () => {
        resolve(null);
      };
      document.body.appendChild(script);
    });
  }
  return null;
}