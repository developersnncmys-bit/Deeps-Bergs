import type { Order } from "@/lib/types";

const today = Date.now();
const DAY = 24 * 60 * 60 * 1000;
const iso = (d: number) => new Date(d).toISOString();

export const orders: Order[] = [
  // Recently placed — awaiting packing
  {
    id: "DBF24011701",
    placedAt: iso(today - 1 * DAY),
    status: "confirmed",
    lines: [
      {
        productId: "p-014",
        variantId: "v2",
        name: "Rosewood Bridal Lehenga",
        image: "/images/new-arrivals/lehenga.png",
        qty: 1,
        price: 168000,
        kind: "buy",
      },
    ],
    address: {
      id: "addr-1",
      name: "Divya Sharma",
      phone: "+91 98765 43210",
      line1: "Flat 402, Lotus Residency",
      line2: "Banjara Hills, Road No. 10",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
      isDefault: true,
    },
    subtotal: 168000,
    shipping: 0,
    discount: 11760,
    tax: 0,
    total: 156240,
    timeline: [
      { at: iso(today - 1 * DAY), status: "placed", note: "Order placed via UPI" },
      { at: iso(today - 1 * DAY + 3 * 60 * 60 * 1000), status: "confirmed", note: "Payment confirmed" },
    ],
  },
  // In-transit rental — shipped
  {
    id: "DBF24011622",
    placedAt: iso(today - 6 * DAY),
    status: "shipped",
    lines: [
      {
        productId: "p-015",
        variantId: "v3",
        name: "Midnight Zardozi Sherwani",
        image: "/images/category/sherwanis.png",
        qty: 1,
        price: 9000,
        kind: "rent",
        rental: {
          startDate: iso(today + 3 * DAY),
          durationDays: 5,
          deposit: 15000,
          returnDate: iso(today + 8 * DAY),
        },
      },
    ],
    address: {
      id: "addr-1",
      name: "Divya Sharma",
      phone: "+91 98765 43210",
      line1: "Flat 402, Lotus Residency",
      line2: "Banjara Hills, Road No. 10",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
    },
    subtotal: 9000,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 24000, // includes 15k deposit
    timeline: [
      { at: iso(today - 6 * DAY), status: "placed" },
      { at: iso(today - 6 * DAY + 2 * 60 * 60 * 1000), status: "confirmed", note: "Payment via Razorpay" },
      { at: iso(today - 4 * DAY), status: "packed", note: "Dry-cleaned, inspected, QC'd" },
      { at: iso(today - 2 * DAY), status: "shipped", note: "Picked up by Shiprocket" },
    ],
    tracking: {
      courier: "Shiprocket · Delhivery",
      awb: "SR42851097",
      url: "https://shiprocket.co/tracking/SR42851097",
    },
  },
  // Delivered — eligible for return window
  {
    id: "DBF24010834",
    placedAt: iso(today - 13 * DAY),
    status: "delivered",
    lines: [
      {
        productId: "p-016",
        variantId: "v1",
        name: "Blush Organza Saree",
        image: "/images/new-arrivals/saree.png",
        qty: 1,
        price: 24500,
        kind: "buy",
      },
      {
        productId: "p-019",
        variantId: "v2",
        name: "Pastel Chikankari Kurta Set",
        image: "/images/category/kurtas-sets.png",
        qty: 1,
        price: 7900,
        kind: "buy",
      },
    ],
    address: {
      id: "addr-1",
      name: "Divya Sharma",
      phone: "+91 98765 43210",
      line1: "Flat 402, Lotus Residency",
      line2: "Banjara Hills, Road No. 10",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
    },
    subtotal: 32400,
    shipping: 0,
    discount: 2268,
    tax: 0,
    total: 30132,
    timeline: [
      { at: iso(today - 13 * DAY), status: "placed" },
      { at: iso(today - 13 * DAY + 60 * 60 * 1000), status: "confirmed" },
      { at: iso(today - 11 * DAY), status: "packed" },
      { at: iso(today - 10 * DAY), status: "shipped", note: "AWB SR42841822" },
      { at: iso(today - 7 * DAY), status: "delivered", note: "Received at doorstep" },
    ],
    tracking: {
      courier: "Shiprocket · BlueDart",
      awb: "SR42841822",
    },
  },
];
