import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    // Integration tests hit a real Postgres — don't run them in parallel
    // against the same database to avoid cross-test interference.
    fileParallelism: false,
  },
});
