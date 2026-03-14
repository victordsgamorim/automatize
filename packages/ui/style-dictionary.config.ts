/**
 * Style Dictionary — Design Token Build Config
 *
 * Reads W3C DTCG JSON tokens from `tokens/` and generates:
 *   • src/tokens/*.ts   — TypeScript modules for React Native
 *   • src/styles/_tokens.css — CSS custom properties for Tailwind v4 / Web
 *
 * Run: pnpm tokens:build
 */
import StyleDictionary from 'style-dictionary';
import type { TransformedToken, Config } from 'style-dictionary/types';

const FILE_HEADER =
  '/* GENERATED — do not edit. Run `pnpm tokens:build` to regenerate. */';
const TS_HEADER = `/**\n * GENERATED — do not edit.\n * Run \`pnpm tokens:build\` to regenerate.\n * Source: packages/ui/tokens/\n */`;

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Parse a CSS dimension string ('4px') to a plain number. */
function dimToNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v) || 0;
  return 0;
}

/**
 * Build a nested plain object from a flat token list.
 * `stripPrefix` removes the first N path segments (e.g. strip 'color' from
 * ['color','brand','600'] to get { brand: { 600: '#...' } }).
 */
function buildNested(
  tokens: TransformedToken[],
  stripPrefix = 0,
  valueFn: (t: TransformedToken) => unknown = (t) => t.$value ?? t.value
): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const token of tokens) {
    const parts = token.path.slice(stripPrefix);
    let node = root as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = valueFn(token);
  }
  return root;
}

/** Pretty-print a value as TypeScript source. */
function toTs(obj: unknown, depth = 0): string {
  const pad = '  '.repeat(depth);
  const pad1 = '  '.repeat(depth + 1);

  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (typeof obj === 'string')
    return `'${obj.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const items = obj.map((v) => `${pad1}${toTs(v, depth + 1)}`);
    return `[\n${items.join(',\n')},\n${pad}]`;
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([key, val]) => {
      // Use bare numeric keys, quote others
      const k = /^\d+$/.test(key)
        ? key
        : /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
          ? key
          : `'${key}'`;
      return `${pad1}${k}: ${toTs(val, depth + 1)},`;
    });
    return `{\n${lines.join('\n')}\n${pad}}`;
  }
  return String(obj);
}

// ─── Custom TypeScript Formats ─────────────────────────────────────────────

StyleDictionary.registerFormat({
  name: 'ts/colors',
  format: ({ dictionary }) => {
    const colorTokens = dictionary.allTokens.filter(
      (t) => t.path[0] === 'color'
    );
    const semanticTokens = dictionary.allTokens.filter(
      (t) => t.path[0] === 'semantic'
    );

    const colors = buildNested(colorTokens, 1);
    const semanticColors = buildNested(semanticTokens, 1);

    return [
      TS_HEADER,
      '',
      `export const colors = ${toTs(colors)} as const;`,
      '',
      '/**',
      ' * Semantic color mappings',
      ' */',
      `export const semanticColors = ${toTs(semanticColors)} as const;`,
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'ts/spacing',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.filter((t) => t.path[0] === 'spacing');
    const spacing = buildNested(tokens, 1, (t) =>
      dimToNumber(t.$value ?? t.value)
    );

    return [
      TS_HEADER,
      '',
      `export const spacing = ${toTs(spacing)} as const;`,
      '',
      'export type SpacingKey = keyof typeof spacing;',
      'export type SpacingValue = (typeof spacing)[SpacingKey];',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'ts/typography',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.filter((t) => t.path[0] === 'font');

    // Build sub-objects
    const familyTokens = tokens.filter((t) => t.path[1] === 'family');
    const sizeTokens = tokens.filter((t) => t.path[1] === 'size');
    const weightTokens = tokens.filter((t) => t.path[1] === 'weight');
    const lineHeightTokens = tokens.filter((t) => t.path[1] === 'lineHeight');
    const letterSpacingTokens = tokens.filter(
      (t) => t.path[1] === 'letterSpacing'
    );

    const typography = {
      fontFamily: buildNested(familyTokens, 2),
      fontSize: buildNested(sizeTokens, 2, (t) =>
        dimToNumber(t.$value ?? t.value)
      ),
      fontWeight: buildNested(weightTokens, 2, (t) =>
        String(t.$value ?? t.value)
      ),
      lineHeight: buildNested(lineHeightTokens, 2),
      letterSpacing: buildNested(letterSpacingTokens, 2, (t) =>
        dimToNumber(t.$value ?? t.value)
      ),
    };

    return [
      TS_HEADER,
      '',
      `export const typography = ${toTs(typography)} as const;`,
      '',
      'export type FontSize = keyof typeof typography.fontSize;',
      'export type FontWeight = keyof typeof typography.fontWeight;',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'ts/shadows',
  format: ({ dictionary }) => {
    const shadowTokens = dictionary.allTokens.filter(
      (t) => t.path[0] === 'shadow'
    );
    const radiusTokens = dictionary.allTokens.filter(
      (t) => t.path[0] === 'radius'
    );

    // Build RN shadow objects from DTCG shadow values
    const shadows: Record<string, unknown> = {};
    for (const token of shadowTokens) {
      const key = token.path[1]; // sm | md | lg
      const val = (token.$value ?? token.value) as Record<string, string>;
      const elevation =
        (token.original?.$extensions as Record<string, unknown>)?.elevation ??
        1;

      // Parse rgba color to extract opacity
      let shadowColor = '#000';
      let shadowOpacity = 0.1;
      const rgbaMatch = String(val.color).match(
        /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/
      );
      if (rgbaMatch) {
        const [, r, g, b, a] = rgbaMatch;
        shadowColor = `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
        shadowOpacity = a !== undefined ? parseFloat(a) : 1;
      }

      shadows[key] = {
        shadowColor,
        shadowOffset: {
          width: dimToNumber(val.offsetX),
          height: dimToNumber(val.offsetY),
        },
        shadowOpacity,
        shadowRadius: dimToNumber(val.blur),
        elevation: Number(elevation),
      };
    }

    // Border radius — plain numbers for RN
    const borderRadius = buildNested(radiusTokens, 1, (t) =>
      dimToNumber(t.$value ?? t.value)
    );

    return [
      TS_HEADER,
      '',
      '/**',
      ' * Border radius tokens',
      ' */',
      `export const borderRadius = ${toTs(borderRadius)} as const;`,
      '',
      '/**',
      ' * Shadow tokens (React Native format)',
      ' */',
      `export const shadows = ${toTs(shadows)} as const;`,
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'ts/barrel',
  format: () => {
    return [
      TS_HEADER,
      '',
      "export * from './colors';",
      "export * from './spacing';",
      "export * from './typography';",
      "export * from './shadows';",
      '',
    ].join('\n');
  },
});

// ─── Custom CSS Format (with header) ───────────────────────────────────────

StyleDictionary.registerFormat({
  name: 'css/tokens',
  format: ({ dictionary, options }) => {
    const outputRef = options?.outputReferences ?? false;
    const lines: string[] = [FILE_HEADER, '', ':root {'];

    for (const token of dictionary.allTokens) {
      // Skip light/dark semantic tokens — those are handled in globals.css
      if (
        token.path[0] === 'semantic' &&
        (token.path[1] === 'light' || token.path[1] === 'dark')
      ) {
        continue;
      }

      const name = token.path.join('-');
      let value: string;

      // References resolved at build time to actual values
      value = String(token.$value ?? token.value);

      // Shadow values need special CSS formatting
      if (
        token.$type === 'shadow' &&
        typeof (token.$value ?? token.value) === 'object'
      ) {
        const sv = (token.$value ?? token.value) as Record<string, string>;
        value = `${sv.offsetX} ${sv.offsetY} ${sv.blur} ${sv.spread} ${sv.color}`;
      }

      lines.push(`  --${name}: ${value};`);
    }

    lines.push('}', '');
    return lines.join('\n');
  },
});

// ─── Build ─────────────────────────────────────────────────────────────────

const config: Config = {
  source: ['tokens/**/*.json'],
  usesDtcg: true,
  platforms: {
    js: {
      buildPath: 'src/tokens/',
      files: [
        {
          destination: 'colors.ts',
          format: 'ts/colors',
          filter: (token) =>
            token.path[0] === 'color' || token.path[0] === 'semantic',
        },
        {
          destination: 'spacing.ts',
          format: 'ts/spacing',
          filter: (token) => token.path[0] === 'spacing',
        },
        {
          destination: 'typography.ts',
          format: 'ts/typography',
          filter: (token) => token.path[0] === 'font',
        },
        {
          destination: 'shadows.ts',
          format: 'ts/shadows',
          filter: (token) =>
            token.path[0] === 'shadow' || token.path[0] === 'radius',
        },
        {
          destination: 'index.ts',
          format: 'ts/barrel',
        },
      ],
    },
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [
        {
          destination: '_tokens.css',
          format: 'css/tokens',
          options: { outputReferences: true },
        },
      ],
    },
  },
};

async function build() {
  const sd = new StyleDictionary(config);
  await sd.buildAllPlatforms();

  console.log('\n✅ Design tokens built successfully.');
  console.log('   • src/tokens/*.ts        (React Native)');
  console.log('   • src/styles/_tokens.css  (Web / Tailwind v4)');
}

build().catch((err) => {
  console.error('❌ Token build failed:', err);
  process.exit(1);
});
