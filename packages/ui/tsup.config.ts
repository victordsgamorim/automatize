import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/index.ts', 'src/tokens/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: 'dist',
  esbuildOptions(options) {
    // Preserve use client directives
    options.banner = {
      js: '"use client";',
    };
  },
  onSuccess: async () => {
    // Ensure 'use client' is at the top of dist files
    const files = [
      'dist/index.js',
      'dist/index.mjs',
      'dist/tokens/index.js',
      'dist/tokens/index.mjs',
    ];
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        if (!content.startsWith('"use client"')) {
          writeFileSync(file, `"use client";\n${content}`);
        }
      } catch (e) {
        // File may not exist
      }
    }
  },
});
