import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import sveltePreprocess from "svelte-preprocess";
import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";

const production = !process.env.ROLLUP_WATCH;

const envReplace = replace({
  preventAssignment: true,
  values: {
    "process.env.API_BASE_URL": JSON.stringify(
      process.env.API_BASE_URL || "http://localhost:3004/api"
    ),
  },
});

export default [
  {
    input: "src/popup.ts",
    output: {
      sourcemap: !production,
      format: "iife",
      name: "popup",
      file: "dist/popup.js",
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          dev: !production,
        },
      }),
      css({ output: "popup.css" }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),
      envReplace,
      typescript({
        sourceMap: !production,
        inlineSources: !production,
      }),
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  },

  // Background script bundle
  {
    input: "src/scripts/background.ts",
    output: {
      sourcemap: !production,
      format: "iife",
      name: "background",
      file: "dist/background.js",
    },
    plugins: [
      envReplace,
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
      }),
      production && terser(),
    ],
  },

  // Content script bundle
  {
    input: "src/scripts/content.ts",
    output: {
      sourcemap: !production,
      format: "iife",
      name: "content",
      file: "dist/content.js",
    },
    plugins: [
      envReplace,
      svelte({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          dev: !production,
        },
      }),
      css({ output: "content.css" }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
      }),
      production && terser(),

      copy({
        targets: [
          { src: "public/*", dest: "dist" },
          { src: "src/app.html", dest: "dist", rename: "popup.html" },
        ],
      }),
    ],
  },
];
