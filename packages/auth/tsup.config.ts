import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/storage/implementations/webTokenStorage.ts',
    'src/storage/implementations/mobileTokenStorage.ts'
  ],
  format: ['cjs', 'esm'],
  dts: false, // Skip DTS generation due to pre-existing Supabase type errors
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
