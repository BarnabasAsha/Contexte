import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import sveltePreprocess from "svelte-preprocess";
import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

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
