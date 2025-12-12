
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sv: {
          purple: "#6B21A8",
          orange: "#FF6F3C",
          pink: "#FFD7E2",
          slate: "#0f172a"
        }
      },
      fontFamily: {
        body: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 8px 24px rgba(16,24,40,0.06)",
        medium: "0 12px 32px rgba(16,24,40,0.08)",
        strong: "0 20px 50px rgba(16,24,40,0.12)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        shimmer: {
          "100%": { backgroundPosition: "-100% 0" }
        }
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out both",
        shimmer: "shimmer 1.4s infinite ease-in-out"
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms")  // ensures forms look premium
  ]
};
