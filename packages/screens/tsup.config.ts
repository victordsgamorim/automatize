import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function collectOutputFiles(dir: string, ext: string[]): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        results.push(...collectOutputFiles(full, ext));
      } else if (ext.some((e) => full.endsWith(e))) {
        results.push(full);
      }
    }
  } catch (_e) {
    // dir may not exist yet
  }
  return results;
}

export default defineConfig({
  entry: [
    'src/sign-in/index.ts',
    'src/sign-in/web.ts',
    'src/forgot-password/index.ts',
    'src/forgot-password/web.ts',
    'src/content/index.ts',
    'src/content/web.ts',
    'src/settings/index.ts',
    'src/settings/web.ts',
    'src/client/index.ts',
    'src/client/web.ts',
    'src/client-form/index.ts',
    'src/client-form/web.ts',
    'src/product/index.ts',
    'src/product/web.ts',
    'src/product-form/index.ts',
    'src/product-form/web.ts',
    'src/draft-persistence/index.ts',
    'src/profile/index.ts',
    'src/profile/web.ts',
    'src/technician/index.ts',
    'src/technician/web.ts',
  ],
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
    const files = collectOutputFiles('dist', ['.js', '.mjs']);
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
