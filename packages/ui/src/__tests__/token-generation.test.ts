/**
 * Token Generation Tests
 *
 * Validates that the Style Dictionary build (`pnpm tokens:build`) correctly
 * generates platform-specific outputs from the canonical JSON tokens in
 * `tokens/`.
 *
 * Two output targets are tested:
 *   1. TypeScript modules (React Native / mobile) → `src/tokens/*.ts`
 *   2. CSS custom properties (Web)                → `src/styles/_tokens.css`
 *
 * Strategy:
 *   - Read the SOT source JSON files.
 *   - Run the generation script.
 *   - Read & parse the generated outputs.
 *   - Assert values match the source of truth.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── Paths ─────────────────────────────────────────────────────────────────

const UI_ROOT = path.resolve(__dirname, '..', '..');
const TOKENS_DIR = path.join(UI_ROOT, 'tokens');
const GENERATED_TS_DIR = path.join(UI_ROOT, 'src', 'tokens');
const GENERATED_CSS_PATH = path.join(UI_ROOT, 'src', 'styles', '_tokens.css');

// ─── Source JSON loaders ───────────────────────────────────────────────────

function loadSourceJson(filename: string): Record<string, unknown> {
  const raw = fs.readFileSync(path.join(TOKENS_DIR, filename), 'utf-8');
  return JSON.parse(raw);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Parse a CSS dimension string ('4px') to a plain number. */
function dimToNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v) || 0;
  return 0;
}

/** Extract all CSS custom property declarations from a CSS string. */
function parseCssVars(css: string): Map<string, string> {
  const vars = new Map<string, string>();
  const regex = /--([a-zA-Z0-9_-]+)\s*:\s*(.+?)\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(css)) !== null) {
    vars.set(`--${match[1]}`, match[2]);
  }
  return vars;
}

// ─── Run build before tests ────────────────────────────────────────────────

beforeAll(() => {
  // Run token generation from the UI package root
  execSync('pnpm tokens:build', { cwd: UI_ROOT, stdio: 'pipe' });
});

// ════════════════════════════════════════════════════════════════════════════
//  1. GENERATED FILES EXIST
// ════════════════════════════════════════════════════════════════════════════

describe('Generated files existence', () => {
  const expectedTsFiles = [
    'colors.ts',
    'spacing.ts',
    'typography.ts',
    'shadows.ts',
    'index.ts',
  ];

  it.each(expectedTsFiles)(
    'should generate TypeScript module: %s',
    (filename) => {
      const filePath = path.join(GENERATED_TS_DIR, filename);
      expect(fs.existsSync(filePath), `${filename} should exist`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }
  );

  it('should generate CSS file: _tokens.css', () => {
    expect(fs.existsSync(GENERATED_CSS_PATH)).toBe(true);
    const content = fs.readFileSync(GENERATED_CSS_PATH, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  2. GENERATED FILE HEADERS
// ════════════════════════════════════════════════════════════════════════════

describe('Generated file headers', () => {
  it('TypeScript files should contain the "GENERATED — do not edit" header', () => {
    const tsFiles = [
      'colors.ts',
      'spacing.ts',
      'typography.ts',
      'shadows.ts',
      'index.ts',
    ];
    for (const file of tsFiles) {
      const content = fs.readFileSync(
        path.join(GENERATED_TS_DIR, file),
        'utf-8'
      );
      expect(content).toContain('GENERATED');
      expect(content).toContain('do not edit');
    }
  });

  it('CSS file should contain the "GENERATED — do not edit" header', () => {
    const content = fs.readFileSync(GENERATED_CSS_PATH, 'utf-8');
    expect(content).toContain('GENERATED');
    expect(content).toContain('do not edit');
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  3. MOBILE / React Native (TypeScript modules)
// ════════════════════════════════════════════════════════════════════════════

describe('Mobile (TypeScript) — colors.ts', () => {
  const sourceColor = loadSourceJson('color.json');
  const colorData = sourceColor['color'] as Record<
    string,
    Record<string, Record<string, string>>
  >;
  const _semanticData = sourceColor['semantic'] as Record<string, unknown>;

  let fileContent: string;

  beforeAll(() => {
    fileContent = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'colors.ts'),
      'utf-8'
    );
  });

  it('should export `colors` as const', () => {
    expect(fileContent).toContain('export const colors =');
    expect(fileContent).toContain('as const');
  });

  it('should export `semanticColors` as const', () => {
    expect(fileContent).toContain('export const semanticColors =');
  });

  describe('color palettes match source JSON', () => {
    const palettes = [
      'neutral',
      'brand',
      'success',
      'error',
      'warning',
      'info',
    ];

    it.each(palettes)(
      'palette "%s" should have all shades with correct values',
      (palette) => {
        const shades = colorData[palette];
        for (const [shade, shadeObj] of Object.entries(shades)) {
          if (shade.startsWith('$')) continue;
          const expectedValue = (shadeObj as Record<string, string>)['$value'];
          // The generated TS contains the value as a string literal
          expect(fileContent).toContain(expectedValue);
        }
      }
    );
  });

  describe('semantic colors resolve references correctly', () => {
    it('should resolve semantic.primary to color.brand.600', () => {
      const expected = (colorData['brand']['600'] as Record<string, string>)[
        '$value'
      ];
      expect(fileContent).toContain(`primary: '${expected}'`);
    });

    it('should resolve semantic.destructive to color.error.600', () => {
      const expected = (colorData['error']['600'] as Record<string, string>)[
        '$value'
      ];
      expect(fileContent).toContain(`destructive: '${expected}'`);
    });

    it('should resolve semantic.success to color.success.600', () => {
      const expected = (colorData['success']['600'] as Record<string, string>)[
        '$value'
      ];
      expect(fileContent).toContain(`success: '${expected}'`);
    });
  });

  it('should include light and dark theme semantic tokens', () => {
    expect(fileContent).toMatch(/light:\s*\{/);
    expect(fileContent).toMatch(/dark:\s*\{/);
  });
});

describe('Mobile (TypeScript) — spacing.ts', () => {
  const sourceSpacing = loadSourceJson('spacing.json');
  const spacingData = sourceSpacing['spacing'] as Record<string, unknown>;

  let fileContent: string;

  beforeAll(() => {
    fileContent = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'spacing.ts'),
      'utf-8'
    );
  });

  it('should export `spacing` as const', () => {
    expect(fileContent).toContain('export const spacing =');
    expect(fileContent).toContain('as const');
  });

  it('should export SpacingKey and SpacingValue types', () => {
    expect(fileContent).toContain('export type SpacingKey');
    expect(fileContent).toContain('export type SpacingValue');
  });

  it('should convert dimension strings to numeric values', () => {
    for (const [key, val] of Object.entries(spacingData)) {
      if (key.startsWith('$')) continue;
      const raw = (val as Record<string, string>)['$value'];
      const expected = dimToNumber(raw);
      // The TS output should contain `key: numericValue`
      expect(fileContent).toContain(`${key}: ${expected}`);
    }
  });

  it('spacing 4 should equal 16 (4px × 4 base)', () => {
    expect(fileContent).toContain('4: 16');
  });
});

describe('Mobile (TypeScript) — typography.ts', () => {
  const sourceTypo = loadSourceJson('typography.json');
  const fontData = sourceTypo['font'] as Record<string, unknown>;

  let fileContent: string;

  beforeAll(() => {
    fileContent = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'typography.ts'),
      'utf-8'
    );
  });

  it('should export `typography` as const', () => {
    expect(fileContent).toContain('export const typography =');
    expect(fileContent).toContain('as const');
  });

  it('should export FontSize and FontWeight types', () => {
    expect(fileContent).toContain('export type FontSize');
    expect(fileContent).toContain('export type FontWeight');
  });

  it('should contain font family values', () => {
    const families = fontData['family'] as Record<
      string,
      Record<string, string>
    >;
    for (const [key, val] of Object.entries(families)) {
      if (key.startsWith('$')) continue;
      // Font family string should appear in the output
      const familyString = val['$value'];
      // At least a portion of the family value should exist
      expect(fileContent).toContain(familyString.split(',')[0].trim());
    }
  });

  it('should convert font sizes to numbers', () => {
    const sizes = fontData['size'] as Record<string, Record<string, string>>;
    for (const [key, val] of Object.entries(sizes)) {
      if (key.startsWith('$')) continue;
      const expected = dimToNumber(val['$value']);
      expect(fileContent).toContain(`${expected}`);
    }
  });

  it('should convert font weights to strings', () => {
    const weights = fontData['weight'] as Record<
      string,
      Record<string, unknown>
    >;
    for (const [key, val] of Object.entries(weights)) {
      if (key.startsWith('$')) continue;
      const expected = String(val['$value']);
      expect(fileContent).toContain(`'${expected}'`);
    }
  });

  it('should include lineHeight values', () => {
    expect(fileContent).toContain('lineHeight');
    expect(fileContent).toContain('1.25');
    expect(fileContent).toContain('1.5');
    expect(fileContent).toContain('1.75');
  });

  it('should include letterSpacing values as numbers', () => {
    expect(fileContent).toContain('letterSpacing');
    expect(fileContent).toContain('-0.5');
    expect(fileContent).toContain('0.5');
  });
});

describe('Mobile (TypeScript) — shadows.ts', () => {
  const sourceShadow = loadSourceJson('shadow.json');
  const sourceRadius = loadSourceJson('radius.json');
  const shadowData = sourceShadow['shadow'] as Record<string, unknown>;
  const radiusData = sourceRadius['radius'] as Record<string, unknown>;

  let fileContent: string;

  beforeAll(() => {
    fileContent = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'shadows.ts'),
      'utf-8'
    );
  });

  it('should export `shadows` as const', () => {
    expect(fileContent).toContain('export const shadows =');
    expect(fileContent).toContain('as const');
  });

  it('should export `borderRadius` as const', () => {
    expect(fileContent).toContain('export const borderRadius =');
  });

  describe('shadow tokens contain React Native properties', () => {
    const sizes = ['sm', 'md', 'lg'];

    it.each(sizes)('shadow "%s" should have RN shadow properties', (_size) => {
      // The shadow block for this size should contain RN-specific keys
      expect(fileContent).toContain('shadowColor');
      expect(fileContent).toContain('shadowOffset');
      expect(fileContent).toContain('shadowOpacity');
      expect(fileContent).toContain('shadowRadius');
      expect(fileContent).toContain('elevation');
    });
  });

  it('shadow elevation values should match JSON $extensions', () => {
    for (const [key, val] of Object.entries(shadowData)) {
      if (key.startsWith('$')) continue;
      const extensions = (val as Record<string, unknown>)[
        '$extensions'
      ] as Record<string, unknown>;
      const expectedElevation = extensions?.elevation;
      if (expectedElevation !== undefined) {
        expect(fileContent).toContain(`elevation: ${expectedElevation}`);
      }
    }
  });

  it('border radius values should be numeric and match source', () => {
    for (const [key, val] of Object.entries(radiusData)) {
      if (key.startsWith('$')) continue;
      const raw = (val as Record<string, string>)['$value'];
      const expected = dimToNumber(raw);
      expect(fileContent).toContain(`${key}: ${expected}`);
    }
  });
});

describe('Mobile (TypeScript) — index.ts barrel', () => {
  let fileContent: string;

  beforeAll(() => {
    fileContent = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'index.ts'),
      'utf-8'
    );
  });

  it('should re-export colors', () => {
    expect(fileContent).toContain("export * from './colors'");
  });

  it('should re-export spacing', () => {
    expect(fileContent).toContain("export * from './spacing'");
  });

  it('should re-export typography', () => {
    expect(fileContent).toContain("export * from './typography'");
  });

  it('should re-export shadows', () => {
    expect(fileContent).toContain("export * from './shadows'");
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  4. WEB (CSS custom properties)
// ════════════════════════════════════════════════════════════════════════════

describe('Web (CSS) — _tokens.css', () => {
  let cssContent: string;
  let cssVars: Map<string, string>;

  beforeAll(() => {
    cssContent = fs.readFileSync(GENERATED_CSS_PATH, 'utf-8');
    cssVars = parseCssVars(cssContent);
  });

  it('should wrap variables in a :root block', () => {
    expect(cssContent).toContain(':root {');
  });

  describe('CSS color tokens match source JSON', () => {
    const sourceColor = loadSourceJson('color.json');
    const colorData = sourceColor['color'] as Record<
      string,
      Record<string, Record<string, string>>
    >;
    const palettes = [
      'neutral',
      'brand',
      'success',
      'error',
      'warning',
      'info',
    ];

    it.each(palettes)(
      'all "%s" shades should be present as CSS vars',
      (palette) => {
        const shades = colorData[palette];
        for (const [shade, shadeObj] of Object.entries(shades)) {
          if (shade.startsWith('$')) continue;
          const varName = `--color-${palette}-${shade}`;
          const expectedValue = (shadeObj as Record<string, string>)[
            '$value'
          ].toLowerCase();
          expect(cssVars.has(varName), `Missing CSS var: ${varName}`).toBe(
            true
          );
          expect(cssVars.get(varName)).toBe(expectedValue);
        }
      }
    );
  });

  describe('CSS semantic tokens', () => {
    it('should contain --semantic-primary', () => {
      expect(cssVars.has('--semantic-primary')).toBe(true);
    });

    it('should contain --semantic-destructive', () => {
      expect(cssVars.has('--semantic-destructive')).toBe(true);
    });

    it('should contain --semantic-success', () => {
      expect(cssVars.has('--semantic-success')).toBe(true);
    });

    it('should contain --semantic-warning', () => {
      expect(cssVars.has('--semantic-warning')).toBe(true);
    });

    it('should contain --semantic-info', () => {
      expect(cssVars.has('--semantic-info')).toBe(true);
    });

    it('should NOT contain light/dark semantic tokens (handled in globals.css)', () => {
      const lightDarkVars = [...cssVars.keys()].filter(
        (k) =>
          k.startsWith('--semantic-light-') || k.startsWith('--semantic-dark-')
      );
      expect(lightDarkVars).toEqual([]);
    });
  });

  describe('CSS spacing tokens match source JSON', () => {
    const sourceSpacing = loadSourceJson('spacing.json');
    const spacingData = sourceSpacing['spacing'] as Record<string, unknown>;

    it('should have all spacing values as CSS custom properties', () => {
      for (const [key, val] of Object.entries(spacingData)) {
        if (key.startsWith('$')) continue;
        const varName = `--spacing-${key}`;
        const expectedValue = (val as Record<string, string>)['$value'];
        expect(cssVars.has(varName), `Missing CSS var: ${varName}`).toBe(true);
        expect(cssVars.get(varName)).toBe(expectedValue.toLowerCase());
      }
    });
  });

  describe('CSS radius tokens match source JSON', () => {
    const sourceRadius = loadSourceJson('radius.json');
    const radiusData = sourceRadius['radius'] as Record<string, unknown>;

    it('should have all radius values as CSS custom properties', () => {
      for (const [key, val] of Object.entries(radiusData)) {
        if (key.startsWith('$')) continue;
        const varName = `--radius-${key}`;
        const expectedValue = (val as Record<string, string>)['$value'];
        expect(cssVars.has(varName), `Missing CSS var: ${varName}`).toBe(true);
        expect(cssVars.get(varName)).toBe(expectedValue.toLowerCase());
      }
    });
  });

  describe('CSS shadow tokens match source JSON', () => {
    const sourceShadow = loadSourceJson('shadow.json');
    const shadowData = sourceShadow['shadow'] as Record<string, unknown>;

    it('should have all shadow values as CSS custom properties', () => {
      for (const [key] of Object.entries(shadowData)) {
        if (key.startsWith('$')) continue;
        const varName = `--shadow-${key}`;
        expect(cssVars.has(varName), `Missing CSS var: ${varName}`).toBe(true);

        // Verify the shadow value is a valid CSS shadow string
        const shadowValue = cssVars.get(varName) ?? '';
        expect(shadowValue).toMatch(/\d+px/); // contains at least one dimension
        expect(shadowValue).toMatch(/rgba?\(/); // contains a color
      }
    });

    it('shadow CSS values should contain correct offset/blur from source', () => {
      for (const [key, val] of Object.entries(shadowData)) {
        if (key.startsWith('$')) continue;
        const shadowVal = (val as Record<string, Record<string, string>>)[
          '$value'
        ];
        const varName = `--shadow-${key}`;
        const cssValue = cssVars.get(varName) ?? '';

        // The CSS value should contain the offsetX, offsetY, blur, spread
        expect(cssValue).toContain(shadowVal['offsetX']);
        expect(cssValue).toContain(shadowVal['offsetY']);
        expect(cssValue).toContain(shadowVal['blur']);
        expect(cssValue).toContain(shadowVal['spread']);
      }
    });
  });

  describe('CSS typography tokens match source JSON', () => {
    const sourceTypo = loadSourceJson('typography.json');
    const fontData = sourceTypo['font'] as Record<string, unknown>;

    it('should have font-family CSS vars', () => {
      expect(cssVars.has('--font-family-sans')).toBe(true);
      expect(cssVars.has('--font-family-mono')).toBe(true);
    });

    it('should have all font-size CSS vars with correct values', () => {
      const sizes = fontData['size'] as Record<string, Record<string, string>>;
      for (const [key, val] of Object.entries(sizes)) {
        if (key.startsWith('$')) continue;
        const varName = `--font-size-${key}`;
        expect(cssVars.has(varName), `Missing CSS var: ${varName}`).toBe(true);
        expect(cssVars.get(varName)).toBe(val['$value'].toLowerCase());
      }
    });

    it('should have all font-weight CSS vars with correct values', () => {
      const weights = fontData['weight'] as Record<
        string,
        Record<string, unknown>
      >;
      for (const [key, val] of Object.entries(weights)) {
        if (key.startsWith('$')) continue;
        const varName = `--font-weight-${key}`;
        expect(cssVars.has(varName), `Missing CSS var: ${varName}`).toBe(true);
        expect(cssVars.get(varName)).toBe(String(val['$value']));
      }
    });

    it('should have lineHeight CSS vars', () => {
      expect(cssVars.has('--font-lineHeight-tight')).toBe(true);
      expect(cssVars.has('--font-lineHeight-normal')).toBe(true);
      expect(cssVars.has('--font-lineHeight-relaxed')).toBe(true);
    });

    it('should have letterSpacing CSS vars', () => {
      expect(cssVars.has('--font-letterSpacing-tight')).toBe(true);
      expect(cssVars.has('--font-letterSpacing-normal')).toBe(true);
      expect(cssVars.has('--font-letterSpacing-wide')).toBe(true);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  5. CROSS-PLATFORM CONSISTENCY
// ════════════════════════════════════════════════════════════════════════════

describe('Cross-platform consistency (TS ↔ CSS)', () => {
  let tsColors: string;
  let cssVars: Map<string, string>;

  beforeAll(() => {
    tsColors = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'colors.ts'),
      'utf-8'
    );
    const css = fs.readFileSync(GENERATED_CSS_PATH, 'utf-8');
    cssVars = parseCssVars(css);
  });

  it('every palette color in TS should have a matching CSS custom property', () => {
    const sourceColor = loadSourceJson('color.json');
    const colorData = sourceColor['color'] as Record<
      string,
      Record<string, Record<string, string>>
    >;

    for (const [palette, shades] of Object.entries(colorData)) {
      if (palette.startsWith('$')) continue;
      for (const [shade, shadeObj] of Object.entries(shades)) {
        if (shade.startsWith('$')) continue;
        const expected = (shadeObj as Record<string, string>)['$value'];
        const cssVar = `--color-${palette}-${shade}`;

        // TS file has the value
        expect(tsColors).toContain(expected);
        // CSS file has the variable (case-insensitive match on hex)
        expect(cssVars.get(cssVar)?.toUpperCase()).toBe(expected.toUpperCase());
      }
    }
  });

  it('spacing numeric values in TS should correspond to dimension strings in CSS', () => {
    const sourceSpacing = loadSourceJson('spacing.json');
    const spacingData = sourceSpacing['spacing'] as Record<string, unknown>;
    const tsSpacing = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'spacing.ts'),
      'utf-8'
    );

    for (const [key, val] of Object.entries(spacingData)) {
      if (key.startsWith('$')) continue;
      const raw = (val as Record<string, string>)['$value'];
      const numericValue = dimToNumber(raw);

      // TS has numeric value
      expect(tsSpacing).toContain(`${key}: ${numericValue}`);
      // CSS has dimension string
      expect(cssVars.get(`--spacing-${key}`)).toBe(raw.toLowerCase());
    }
  });

  it('border radius numeric values in TS should correspond to dimension strings in CSS', () => {
    const sourceRadius = loadSourceJson('radius.json');
    const radiusData = sourceRadius['radius'] as Record<string, unknown>;
    const tsShadows = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'shadows.ts'),
      'utf-8'
    );

    for (const [key, val] of Object.entries(radiusData)) {
      if (key.startsWith('$')) continue;
      const raw = (val as Record<string, string>)['$value'];
      const numericValue = dimToNumber(raw);

      // TS has numeric value
      expect(tsShadows).toContain(`${key}: ${numericValue}`);
      // CSS has dimension string
      expect(cssVars.get(`--radius-${key}`)).toBe(raw.toLowerCase());
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  6. TOKEN COMPLETENESS (no source token left behind)
// ════════════════════════════════════════════════════════════════════════════

describe('Token completeness', () => {
  it('all color tokens from source should appear in the generated TS output', () => {
    const sourceColor = loadSourceJson('color.json');
    const tsContent = fs.readFileSync(
      path.join(GENERATED_TS_DIR, 'colors.ts'),
      'utf-8'
    );
    const colorData = sourceColor['color'] as Record<
      string,
      Record<string, Record<string, string>>
    >;

    let tokenCount = 0;
    for (const [palette, shades] of Object.entries(colorData)) {
      if (palette.startsWith('$')) continue;
      for (const [shade, shadeObj] of Object.entries(shades)) {
        if (shade.startsWith('$')) continue;
        tokenCount++;
        const value = (shadeObj as Record<string, string>)['$value'];
        expect(tsContent).toContain(value);
      }
    }
    // Sanity: make sure we actually checked a reasonable number of tokens
    expect(tokenCount).toBeGreaterThan(50);
  });

  it('all spacing tokens from source should appear in the generated CSS output', () => {
    const sourceSpacing = loadSourceJson('spacing.json');
    const cssContent = fs.readFileSync(GENERATED_CSS_PATH, 'utf-8');
    const spacingData = sourceSpacing['spacing'] as Record<string, unknown>;
    const cssVars = parseCssVars(cssContent);

    let tokenCount = 0;
    for (const [key] of Object.entries(spacingData)) {
      if (key.startsWith('$')) continue;
      tokenCount++;
      expect(cssVars.has(`--spacing-${key}`)).toBe(true);
    }
    expect(tokenCount).toBeGreaterThan(10);
  });

  it('all radius tokens from source should appear in the generated CSS output', () => {
    const sourceRadius = loadSourceJson('radius.json');
    const cssContent = fs.readFileSync(GENERATED_CSS_PATH, 'utf-8');
    const radiusData = sourceRadius['radius'] as Record<string, unknown>;
    const cssVars = parseCssVars(cssContent);

    let tokenCount = 0;
    for (const [key] of Object.entries(radiusData)) {
      if (key.startsWith('$')) continue;
      tokenCount++;
      expect(cssVars.has(`--radius-${key}`)).toBe(true);
    }
    expect(tokenCount).toBeGreaterThanOrEqual(5);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  7. IDEMPOTENCY — running build twice produces identical output
// ════════════════════════════════════════════════════════════════════════════

describe('Idempotency', () => {
  it('running tokens:build twice should produce identical outputs', () => {
    // First build already happened in beforeAll. Capture current state.
    const tsBefore = [
      'colors.ts',
      'spacing.ts',
      'typography.ts',
      'shadows.ts',
      'index.ts',
    ].map((f) => fs.readFileSync(path.join(GENERATED_TS_DIR, f), 'utf-8'));
    const cssBefore = fs.readFileSync(GENERATED_CSS_PATH, 'utf-8');

    // Run build again
    execSync('pnpm tokens:build', { cwd: UI_ROOT, stdio: 'pipe' });

    const tsAfter = [
      'colors.ts',
      'spacing.ts',
      'typography.ts',
      'shadows.ts',
      'index.ts',
    ].map((f) => fs.readFileSync(path.join(GENERATED_TS_DIR, f), 'utf-8'));
    const cssAfter = fs.readFileSync(GENERATED_CSS_PATH, 'utf-8');

    for (let i = 0; i < tsBefore.length; i++) {
      expect(tsAfter[i]).toBe(tsBefore[i]);
    }
    expect(cssAfter).toBe(cssBefore);
  });
});
