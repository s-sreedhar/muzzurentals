// components/WhatsappFloatingIcon.tsx

'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsappFloatingIcon() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 0.85, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    });
  }, [controls]);

  return (
    <motion.a
      href="https://wa.me/+919876543210" // Replace with your WhatsApp number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg"
      animate={controls}
      title="Chat on WhatsApp"
    >
      <FaWhatsapp size={28} />
    </motion.a>
  );
}
