// The build wrapper validates these paths before Vite loads this configuration.
const env = process.env;
export default {
  base: "./",
  ...(env.BEAD_VITE_CACHE_DIR ? { cacheDir: env.BEAD_VITE_CACHE_DIR } : {}),
  ...(env.BEAD_VITE_OUT_DIR ? { build: { outDir: env.BEAD_VITE_OUT_DIR, emptyOutDir: false } } : {}),
  test: {
    ...(env.BEAD_TEST_RESULTS_DIR ? {
      outputFile: `${env.BEAD_TEST_RESULTS_DIR}/vitest.json`,
      reporters: ["default", "json"],
      coverage: { reportsDirectory: `${env.BEAD_TEST_RESULTS_DIR}/coverage` },
    } : {}),
  },
};
