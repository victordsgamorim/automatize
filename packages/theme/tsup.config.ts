import { defineConfig } from 'tsup';
import { writeFileSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
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
  async onSuccess() {
    // Ensure 'use client' is at the top of all dist JS files
    const distDir = 'dist';
    const files = readdirSync(distDir).filter(
      (f) => f.endsWith('.js') || f.endsWith('.mjs')
    );
    for (const file of files) {
      const filePath = join(distDir, file);
      const content = readFileSync(filePath, 'utf-8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(filePath, `"use client";\n${content}`);
      }
    }
  },
});
