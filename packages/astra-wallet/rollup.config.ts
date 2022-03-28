import typescript from "@rollup/plugin-typescript";

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: "./src/index.ts",
  output: {
    dir: "dist",
    format: "cjs",
  },
  plugins: [typescript()],
};
