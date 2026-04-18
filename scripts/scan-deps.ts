/**
 * Dependency Deduplication Scanner
 *
 * Scans all package.json files in the monorepo workspace to identify:
 * - Duplicate dependencies across modules
 * - Version conflicts between modules
 * - Catalog usage and coverage statistics
 * - Dependencies that could be hoisted to root
 * - Actionable recommendations for deduplication
 *
 * Usage:
 *   pnpm tsx scripts/scan-deps.ts
 *   pnpm tsx scripts/scan-deps.ts --json        # JSON output
 *   pnpm tsx scripts/scan-deps.ts --summary      # Summary only
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface DepEntry {
  /** The package that declares this dependency */
  packageName: string;
  /** Relative path to the package.json */
  packagePath: string;
  /** "dependencies" | "devDependencies" | "peerDependencies" */
  depType: 'dependencies' | 'devDependencies' | 'peerDependencies';
  /** Version range string (raw from package.json) */
  version: string;
  /** Resolved version if using catalog: protocol */
  resolvedVersion: string;
  /** Whether this entry uses catalog protocol */
  usesCatalog: boolean;
  /** Catalog name if using named catalog */
  catalogName?: string;
}

interface DuplicateReport {
  /** The dependency name */
  dep: string;
  /** All locations where it appears */
  entries: DepEntry[];
  /** Unique resolved version strings */
  versions: string[];
  /** Whether there is a version conflict (based on resolved versions) */
  hasConflict: boolean;
  /** Recommended version (highest semver floor) */
  recommendedVersion: string;
  /** Severity: high (5+ uses), medium (3-4), low (2) */
  severity: 'high' | 'medium' | 'low';
  /** How many entries use catalog protocol */
  catalogCount: number;
  /** How many entries use explicit (non-catalog) versions */
  explicitCount: number;
}

interface CatalogStats {
  /** Total entries defined in default catalog */
  defaultEntries: number;
  /** Named catalogs and their entry counts */
  namedCatalogs: Record<string, number>;
  /** Number of package.json deps using catalog: protocol */
  catalogUsages: number;
  /** Number of deps that COULD use catalog but don't */
  missedOpportunities: number;
  /** Coverage: percentage of eligible deps using catalog */
  coveragePercent: number;
}

interface ScanResult {
  /** Timestamp of the scan */
  timestamp: string;
  /** Total package.json files scanned */
  totalPackages: number;
  /** Total unique external dependencies found */
  totalUniqueDeps: number;
  /** Total dependency instances across all packages */
  totalInstances: number;
  /** Dependencies appearing in 2+ packages */
  duplicates: DuplicateReport[];
  /** Dependencies only in one package (not candidates for dedup) */
  singleUse: number;
  /** Catalog usage statistics */
  catalog: CatalogStats;
  /** Summary statistics */
  summary: {
    totalDuplicateInstances: number;
    instancesSaveable: number;
    versionConflicts: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
  };
  /** Actionable recommendations */
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT_DIR = path.resolve(import.meta.dirname ?? __dirname, '..');

/** Workspace package names (internal, not external deps) */
const WORKSPACE_NAMES = new Set<string>();

/** Default catalog: dep name → version */
const defaultCatalog = new Map<string, string>();

/** Named catalogs: catalog name → (dep name → version) */
const namedCatalogs = new Map<string, Map<string, string>>();

function readPackageJson(relPath: string): PackageJson | null {
  const fullPath = path.join(ROOT_DIR, relPath, 'package.json');
  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw) as PackageJson;
  } catch {
    return null;
  }
}

/**
 * Parse pnpm-workspace.yaml to extract workspace package paths, catalog
 * definitions, and named catalogs. Uses a simple line-by-line parser so we
 * don't need a yaml dependency.
 *
 * Returns the list of workspace-relative package paths (always includes '.'
 * for root).
 */
function parseWorkspaceYaml(): string[] {
  const wsPath = path.join(ROOT_DIR, 'pnpm-workspace.yaml');
  let content: string;
  try {
    content = fs.readFileSync(wsPath, 'utf-8');
  } catch {
    return ['.']; // fallback: root only
  }

  const workspacePackages: string[] = ['.'];
  const lines = content.split('\n');
  let section:
    | 'none'
    | 'packages'
    | 'default-catalog'
    | 'named-catalogs'
    | 'named-entry' = 'none';
  let currentNamedCatalog = '';

  for (const line of lines) {
    const trimmed = line.trimEnd();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Detect top-level sections
    if (/^packages:/.test(trimmed)) {
      section = 'packages';
      continue;
    }
    if (/^catalog:/.test(trimmed)) {
      section = 'default-catalog';
      continue;
    }
    if (/^catalogs:/.test(trimmed)) {
      section = 'named-catalogs';
      continue;
    }

    // Inside packages list (2-space indent, YAML list items)
    if (section === 'packages' && /^ {2}- /.test(line)) {
      const pkgMatch = line.match(
        /^ {2}- '([^']+)'|^ {2}- "([^"]+)"|^ {2}- (\S+)/
      );
      if (pkgMatch) {
        const pkgPath = (
          pkgMatch[1] ??
          pkgMatch[2] ??
          pkgMatch[3] ??
          ''
        ).trim();
        if (pkgPath) {
          workspacePackages.push(pkgPath);
        }
      }
      continue;
    }

    // Inside default catalog (2-space indent)
    if (section === 'default-catalog' && /^ {2}\S/.test(line)) {
      const match = line.match(
        /^ {2}(?:'([^']+)'|"([^"]+)"|(\S+)):\s*(?:'([^']*)'|"([^"]*)"|(.+))$/
      );
      if (match) {
        const depName = match[1] ?? match[2] ?? match[3] ?? '';
        const version = (match[4] ?? match[5] ?? match[6] ?? '').trim();
        if (depName && version) {
          defaultCatalog.set(depName, version);
        }
      }
      continue;
    }

    // Inside named catalogs — detect catalog name (2-space indent)
    if (
      (section === 'named-catalogs' || section === 'named-entry') &&
      /^ {2}\S/.test(line)
    ) {
      const nameMatch = line.match(/^ {2}(\w[\w-]*):$/);
      if (nameMatch) {
        currentNamedCatalog = nameMatch[1]!;
        namedCatalogs.set(currentNamedCatalog, new Map());
        section = 'named-entry';
      }
      continue;
    }

    // Inside a named catalog entry (4-space indent)
    if (section === 'named-entry' && /^ {4}\S/.test(line)) {
      const match = line.match(
        /^ {4}(?:'([^']+)'|"([^"]+)"|(\S+)):\s*(?:'([^']*)'|"([^"]*)"|(.+))$/
      );
      if (match) {
        const depName = match[1] ?? match[2] ?? match[3] ?? '';
        const version = (match[4] ?? match[5] ?? match[6] ?? '').trim();
        const catalog = namedCatalogs.get(currentNamedCatalog);
        if (depName && version && catalog) {
          catalog.set(depName, version);
        }
      }
      continue;
    }

    // If we hit a non-indented line, reset section
    if (/^\S/.test(trimmed)) {
      section = 'none';
    }
  }

  return workspacePackages;
}

/**
 * Resolve a version string. If it uses catalog: protocol, look up the actual version.
 * Returns { resolved, usesCatalog, catalogName }.
 */
function resolveVersion(
  depName: string,
  version: string
): { resolved: string; usesCatalog: boolean; catalogName?: string } {
  if (version === 'catalog:' || version === 'catalog:default') {
    const resolved = defaultCatalog.get(depName);
    return {
      resolved: resolved ?? `[MISSING from catalog: ${depName}]`,
      usesCatalog: true,
      catalogName: 'default',
    };
  }

  const namedMatch = version.match(/^catalog:(\w[\w-]*)$/);
  if (namedMatch) {
    const catalogName = namedMatch[1];
    const catalog = namedCatalogs.get(catalogName);
    const resolved = catalog?.get(depName);
    return {
      resolved:
        resolved ?? `[MISSING from catalog:${catalogName} for ${depName}]`,
      usesCatalog: true,
      catalogName,
    };
  }

  return { resolved: version, usesCatalog: false };
}

/**
 * Parse a semver-ish version string and extract the base version.
 */
function extractBaseVersion(version: string): string {
  return version.replace(/^[\^~>=<\s]+/, '').split(' ')[0] ?? version;
}

/**
 * Compare two semver strings and return the "higher" one.
 */
function pickHigherVersion(a: string, b: string): string {
  const partsA = extractBaseVersion(a).split('.').map(Number);
  const partsB = extractBaseVersion(b).split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const va = partsA[i] ?? 0;
    const vb = partsB[i] ?? 0;
    if (va > vb) return a;
    if (vb > va) return b;
  }
  return a;
}

function severityFromCount(count: number): 'high' | 'medium' | 'low' {
  if (count >= 5) return 'high';
  if (count >= 3) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// Core scanner
// ---------------------------------------------------------------------------

function scan(): ScanResult {
  // Parse workspace file: discovers packages + loads catalogs in one pass
  const workspacePackages = parseWorkspaceYaml();

  const allDeps = new Map<string, DepEntry[]>();
  let totalInstances = 0;
  let catalogUsages = 0;

  // First pass: collect workspace names
  for (const pkgPath of workspacePackages) {
    const pkg = readPackageJson(pkgPath);
    if (pkg?.name) {
      WORKSPACE_NAMES.add(pkg.name);
    }
  }

  // Second pass: collect all external dependencies
  for (const pkgPath of workspacePackages) {
    const pkg = readPackageJson(pkgPath);
    if (!pkg) continue;

    const depTypes = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
    ] as const;

    for (const depType of depTypes) {
      const deps = pkg[depType];
      if (!deps) continue;

      for (const [depName, version] of Object.entries(deps)) {
        // Skip workspace references (internal packages)
        if (version.startsWith('workspace:') || WORKSPACE_NAMES.has(depName)) {
          continue;
        }

        totalInstances++;

        const { resolved, usesCatalog, catalogName } = resolveVersion(
          depName,
          version
        );

        if (usesCatalog) catalogUsages++;

        const entry: DepEntry = {
          packageName: pkg.name ?? pkgPath,
          packagePath: pkgPath,
          depType,
          version,
          resolvedVersion: resolved,
          usesCatalog,
          catalogName,
        };

        const existing = allDeps.get(depName);
        if (existing) {
          existing.push(entry);
        } else {
          allDeps.set(depName, [entry]);
        }
      }
    }
  }

  // Build duplicate reports
  const duplicates: DuplicateReport[] = [];
  let singleUse = 0;

  for (const [dep, entries] of allDeps) {
    if (entries.length < 2) {
      singleUse++;
      continue;
    }

    // Use resolved versions for conflict detection
    const versions = [...new Set(entries.map((e) => e.resolvedVersion))];
    const hasConflict = versions.length > 1;

    let recommendedVersion = versions[0];
    for (const v of versions.slice(1)) {
      recommendedVersion = pickHigherVersion(recommendedVersion, v);
    }

    const catalogCount = entries.filter((e) => e.usesCatalog).length;
    const explicitCount = entries.length - catalogCount;

    duplicates.push({
      dep,
      entries,
      versions,
      hasConflict,
      recommendedVersion,
      severity: severityFromCount(entries.length),
      catalogCount,
      explicitCount,
    });
  }

  // Sort: high severity first, then by instance count descending
  duplicates.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const sDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sDiff !== 0) return sDiff;
    return b.entries.length - a.entries.length;
  });

  // Statistics
  const totalDuplicateInstances = duplicates.reduce(
    (sum, d) => sum + d.entries.length,
    0
  );
  const instancesSaveable = duplicates.reduce(
    (sum, d) => sum + (d.entries.length - 1),
    0
  );
  const versionConflicts = duplicates.filter((d) => d.hasConflict).length;

  // Catalog stats
  const missedOpportunities = duplicates.reduce(
    (sum, d) => sum + d.explicitCount,
    0
  );
  const totalEligible = catalogUsages + missedOpportunities;
  const coveragePercent =
    totalEligible > 0 ? Math.round((catalogUsages / totalEligible) * 100) : 0;

  const catalogStats: CatalogStats = {
    defaultEntries: defaultCatalog.size,
    namedCatalogs: Object.fromEntries(
      [...namedCatalogs.entries()].map(([name, m]) => [name, m.size])
    ),
    catalogUsages,
    missedOpportunities,
    coveragePercent,
  };

  // Recommendations
  const recommendations: string[] = [];

  // Version conflicts
  const conflicts = duplicates.filter((d) => d.hasConflict);
  for (const c of conflicts) {
    recommendations.push(
      `CONFLICT: "${c.dep}" has ${c.versions.length} different resolved versions: ` +
        `${c.versions.join(', ')}. Recommend standardizing to ${c.recommendedVersion}.`
    );
  }

  // Deps with mixed catalog/explicit usage
  const mixedUsage = duplicates.filter(
    (d) => d.catalogCount > 0 && d.explicitCount > 0
  );
  for (const m of mixedUsage) {
    const explicitPkgs = m.entries
      .filter((e) => !e.usesCatalog)
      .map((e) => e.packageName);
    recommendations.push(
      `MIGRATE: "${m.dep}" uses catalog in ${m.catalogCount} packages but explicit versions in: ${explicitPkgs.join(', ')}. ` +
        `Update these to use catalog: protocol.`
    );
  }

  // Deps that could benefit from catalog
  const noCatalog = duplicates.filter((d) => d.catalogCount === 0);
  if (noCatalog.length > 0) {
    recommendations.push(
      `CATALOG: ${noCatalog.length} duplicated dependencies don't use catalog: ` +
        `${noCatalog.map((d) => d.dep).join(', ')}. Consider adding to pnpm-workspace.yaml catalog.`
    );
  }

  // CLI-only devDeps that could be root-only
  const cliOnlyDeps = ['eslint', 'typescript'];
  for (const cliDep of cliOnlyDeps) {
    const dup = duplicates.find((d) => d.dep === cliDep);
    if (dup && dup.entries.length > 2) {
      const childCount = dup.entries.filter(
        (e) => e.packagePath !== '.'
      ).length;
      if (childCount > 0) {
        recommendations.push(
          `INFO: "${cliDep}" appears in ${childCount} child packages plus root. ` +
            `These are CLI tools — consider hoisting to root-only if feasible.`
        );
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    totalPackages: workspacePackages.length,
    totalUniqueDeps: allDeps.size,
    totalInstances,
    duplicates,
    singleUse,
    catalog: catalogStats,
    summary: {
      totalDuplicateInstances,
      instancesSaveable,
      versionConflicts,
      highSeverity: duplicates.filter((d) => d.severity === 'high').length,
      mediumSeverity: duplicates.filter((d) => d.severity === 'medium').length,
      lowSeverity: duplicates.filter((d) => d.severity === 'low').length,
    },
    recommendations,
  };
}

// ---------------------------------------------------------------------------
// Output formatters
// ---------------------------------------------------------------------------

function printTable(result: ScanResult): void {
  const { summary, duplicates, recommendations, catalog } = result;

  console.log('\n========================================');
  console.log('  DEPENDENCY DEDUPLICATION SCAN REPORT');
  console.log('========================================\n');

  console.log(`Scanned:         ${result.totalPackages} packages`);
  console.log(`Unique deps:     ${result.totalUniqueDeps}`);
  console.log(`Total instances: ${result.totalInstances}`);
  console.log(`Single-use:      ${result.singleUse}`);
  console.log(
    `Duplicated:      ${duplicates.length} deps (${summary.totalDuplicateInstances} instances)`
  );
  console.log(`Conflicts:       ${summary.versionConflicts}`);
  console.log(
    `Severity:        ${summary.highSeverity} high, ${summary.mediumSeverity} medium, ${summary.lowSeverity} low\n`
  );

  // Catalog stats
  console.log('--- CATALOG COVERAGE ---\n');
  console.log(`Default catalog entries: ${catalog.defaultEntries}`);
  const namedEntries = Object.entries(catalog.namedCatalogs);
  if (namedEntries.length > 0) {
    for (const [name, count] of namedEntries) {
      console.log(`Named catalog "${name}": ${count} entries`);
    }
  }
  console.log(`Catalog usages:         ${catalog.catalogUsages} references`);
  console.log(
    `Explicit (non-catalog): ${catalog.missedOpportunities} references in duplicated deps`
  );
  console.log(`Catalog coverage:       ${catalog.coveragePercent}%\n`);

  // Detailed table
  console.log('--- DUPLICATED DEPENDENCIES ---\n');

  for (const dup of duplicates) {
    const conflictTag = dup.hasConflict ? ' [VERSION CONFLICT]' : '';
    const severityTag = `[${dup.severity.toUpperCase()}]`;
    const catalogTag =
      dup.catalogCount === dup.entries.length
        ? ' [ALL CATALOG]'
        : dup.catalogCount > 0
          ? ` [${dup.catalogCount}/${dup.entries.length} CATALOG]`
          : '';

    console.log(
      `${severityTag} ${dup.dep} (${dup.entries.length} instances)${conflictTag}${catalogTag}`
    );

    if (dup.hasConflict) {
      console.log(`  Resolved versions: ${dup.versions.join(' | ')}`);
      console.log(`  Recommended: ${dup.recommendedVersion}`);
    } else {
      console.log(`  Version: ${dup.versions[0]}`);
    }

    console.log('  Used in:');
    for (const e of dup.entries) {
      const typeLabel =
        e.depType === 'dependencies'
          ? 'dep'
          : e.depType === 'devDependencies'
            ? 'dev'
            : 'peer';
      const catalogLabel = e.usesCatalog
        ? ` (catalog${e.catalogName && e.catalogName !== 'default' ? ':' + e.catalogName : ''})`
        : '';
      console.log(
        `    - ${e.packageName} (${typeLabel}) @ ${e.resolvedVersion}${catalogLabel}`
      );
    }
    console.log('');
  }

  // Recommendations
  if (recommendations.length > 0) {
    console.log('--- RECOMMENDATIONS ---\n');
    for (const rec of recommendations) {
      console.log(`  * ${rec}`);
    }
    console.log('');
  }
}

function printSummary(result: ScanResult): void {
  const { summary, catalog } = result;
  console.log('\n--- DEPENDENCY SCAN SUMMARY ---\n');
  console.log(`Packages scanned:     ${result.totalPackages}`);
  console.log(`Duplicated deps:      ${result.duplicates.length}`);
  console.log(`Version conflicts:    ${summary.versionConflicts}`);
  console.log(`Catalog coverage:     ${catalog.coveragePercent}%`);
  console.log(
    `Severity breakdown:   ${summary.highSeverity}H / ${summary.mediumSeverity}M / ${summary.lowSeverity}L`
  );

  if (result.recommendations.length > 0) {
    console.log(`\nTop recommendations:`);
    for (const rec of result.recommendations.slice(0, 5)) {
      console.log(`  * ${rec}`);
    }
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const summaryMode = args.includes('--summary');

const result = scan();

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else if (summaryMode) {
  printSummary(result);
} else {
  printTable(result);
}
