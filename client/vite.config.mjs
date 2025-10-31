import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ replace YOUR_GITHUB_USERNAME and YOUR_REPO_NAME
export default defineConfig({
  plugins: [react()],
  base: "/surprisevista-fullstack/", // 👈 your GitHub repo name here
});
