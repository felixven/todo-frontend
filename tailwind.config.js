/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#f4f7ff",100:"#e9efff",200:"#c9d7ff",300:"#a9bfff",
          400:"#7896ff",500:"#4b6bff",600:"#2f51eb",700:"#2741bf",
          800:"#203594",900:"#162564"
        },
        status: {
          todo: "#2563eb", // 藍（一般/待處理）
          inprogress: "#06b6d4", // 青（進行中）
          completed: "#16a34a", // 綠（已完成）
          reviewed: "#7c3aed", // 紫（已審核）
          overdue: "#dc2626", // 紅（逾期）
          wasoverdue: "#f97316"  // 橘（曾逾期）
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
