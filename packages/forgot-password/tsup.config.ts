import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts', 'src/web.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: 'dist',
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
  onSuccess: async () => {
    const files = [
      'dist/index.js',
      'dist/index.mjs',
      'dist/web.js',
      'dist/web.mjs',
    ];
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        if (!content.startsWith('"use client"')) {
          writeFileSync(file, `"use client";\n${content}`);
        }
      } catch (_e) {
        // File may not exist
      }
    }
  },
});
