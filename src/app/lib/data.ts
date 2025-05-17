import type { Camera } from "./types"
// import canon77d1 from "@/assets/canon77d1.jpg"
export const cameras: Camera[] = [
  {
    id: "canon-eos-77d",
    name: "Canon EOS 77d",
    brand: "Canon",
    category: "Mirrorless",
    description:
      "Semi Professional",
    "pricing":{"halfDay":400,    "fullDay9hrs":800,  "fullDay24hrs":1200},
    image: "https://res.cloudinary.com/dplxayvvy/image/upload/v1746452354/canond771_gs787z.jpg",
    available: true,
    isNew: true,
    specs: [
      "24 MP Clarity",
      "Touch and Flip Display",
      "Semi-Professional",
      "MIC Support",
      "WiFi Support",
      "44 Focus",
      "5.76M-Dot OLED EVF",
    ],
    included: [
      "Canon EOS R5 Body",
      "RF 24-70mm f/2.8L IS USM Lens",
      "2x Battery Packs",
      "Battery Charger",
      "64GB CFexpress Card",
      "Camera Bag",
    ],
  },
  {
    "id": "canon-eos-750d",
    "name": "Canon EOS 750d",
    "brand": "Canon",
    "category": "Mirrorless",
    "description": "Semi Professional",
    "pricing":{"halfDay":350,    "fullDay9hrs":650,  "fullDay24hrs":1000},
    "image": "https://res.cloudinary.com/dplxayvvy/image/upload/v1746863477/canon_770d_r31ibv.jpg",
    "available": true,
    "isNew": true,
    "specs": [
      "24 MP Clarity",
      "Touch and Flip Display",
      "Semi-Professional",
      "MIC Support",
      "WiFi Support",
      "44 Focus",
      "Best for YouTube and Social Media",
      "5.76M-Dot OLED EVF"
    ],
    "included": [
      "Canon EOS R5 Body",
      "Lens",
      "1x Battery Pack",
      "Neck Strap",
      "Lens Cap",
      "Battery Charger",
      "64GB CFexpress Card",
      "Camera Bag"
    ]
  },
  {
    "id": "canon-eos-1200d",
    "name": "Canon EOS 1200d",
    "brand": "Canon",
    "category": "Mirrorless",
    "description": "Semi Professional",
    "pricing":{"halfDay":0,    "fullDay9hrs":400,  "fullDay24hrs":650},
    "image": "https://res.cloudinary.com/dplxayvvy/image/upload/v1746863646/canon_1200d_hhtqar.jpg",
    "available": true,
    "isNew": true,
    "specs": [
      "18 MP Clarity",
      "Big Display",
      "Best for Beginners",
      "Photo and Video"
    ],
    "included": [
      "Canon EOS R5 Body",
      "Lens",
      "1x Battery Pack",
      "Neck Strap",
      "Lens Cap",
      "Battery Charger",
      "64GB CFexpress Card",
      "Camera Bag"
    ]
  }
]