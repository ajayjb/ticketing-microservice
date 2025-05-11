// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // your entry file
  format: ['esm', 'cjs'],  // output both module formats
  dts: true,               // generate .d.ts files
  sourcemap: true,         // optional, for debugging
  clean: true,             // clean output before build
  target: 'es2022',        // or 'es2020', depending on your Node version
})
