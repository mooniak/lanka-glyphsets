#!/usr/bin/env node
/**
 * CLI tool for Lanka Glyphsets
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'node:fs';
import chalk from 'chalk';
import { createRegistry } from '../core/registry.js';
import { getUniqueGlyphNames, formatGlyphAnalysis } from '../analyzers/text-glyphs.js';
import { formatAsTxt, formatAsJson, formatGlyphsAsJson } from '../formatters/txt.js';
import { formatAsGlyphData } from '../formatters/glyphdata.js';
import {
  buildSharedData,
  formatSharedDataAsJson,
  formatSharedDataAsJsModule,
} from '../formatters/shared-data.js';
import { loadGlyphsetsCumulative } from '../core/parser.js';
import { SCRIPTS, composeName, resolveScript } from '../core/scripts.js';
import {
  generateAllGlyphs,
  generateBaseGlyphs,
  generateConsonantSignCombinations,
  generateConjuncts,
  generateConjunctSignCombinations,
  generateTouchingClusters,
  getGeneratedCounts,
} from '../generators/index.js';
import type { Command as CommanderCommand } from 'commander';
import type { GlyphsetLevel, GeneratedGlyph, Script } from '../types/index.js';

// Single source of truth for the version — read from package.json so it stays in
// step with `npm version` bumps instead of being hardcoded here.
const pkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
) as { version: string };

const program = new Command();

program
  .name('glyphsets')
  .description('Lanka Glyphsets CLI - Tools for Sinhala and Tamil font development')
  .version(pkg.version);

/**
 * Resolve --script and --level for a command. Tamil has levels 0-2, Sinhala 0-3;
 * a level left at its default is clamped to the script's highest, so
 * `glyph-data --script tamil` means "all of Tamil".
 */
function resolveRun(
  options: { script?: string; level?: string },
  command: CommanderCommand
): { script: Script; level: GlyphsetLevel } {
  let script: Script;
  try {
    script = resolveScript(options.script);
  } catch (err) {
    console.error(chalk.red(`Error: ${(err as Error).message}`));
    process.exit(1);
  }
  const max = SCRIPTS[script].maxLevel;
  let level = parseInt(options.level ?? '1', 10);
  if (command.getOptionValueSource('level') === 'default') level = Math.min(level, max);
  if (Number.isNaN(level) || level < 0 || level > max) {
    console.error(chalk.red(`Error: Level must be between 0 and ${max}`));
    process.exit(1);
  }
  return { script, level: level as GlyphsetLevel };
}

const SCRIPT_OPTION: [string, string, string] = [
  '-s, --script <name>', 'Script: sinhala or tamil', 'sinhala',
];
program
  .command('list')
  .description('List glyph names from glyphsets')
  .option('-l, --level <number>', 'Glyphset level 0-3 (cumulative)', '1')
  .option('-c, --category <name>', 'Filter by category name')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <type>', 'Output format: txt, json, json-full', 'txt')
  .option('--no-namespace', 'Exclude namespace prefix from glyph names')
  .option(...SCRIPT_OPTION)
  .action(async (options, command) => {
    const { script, level } = resolveRun(options, command);

    const registry = createRegistry(level, script);

    let glyphs = options.category
      ? registry.getByCategory(options.category)
      : registry.getAll();

    if (glyphs.length === 0) {
      if (options.category) {
        console.error(chalk.yellow(`No glyphs found in category: ${options.category}`));
        console.log(chalk.dim('Available categories:'));
        for (const cat of registry.getCategories()) {
          console.log(chalk.dim(`  - ${cat}`));
        }
      } else {
        console.error(chalk.yellow('No glyphs found'));
      }
      process.exit(0);
    }

    let output: string;
    switch (options.format) {
      case 'json':
        output = formatAsJson(glyphs, options.namespace);
        break;
      case 'json-full':
        output = formatGlyphsAsJson(glyphs);
        break;
      default:
        output = formatAsTxt(glyphs, options.namespace);
    }

    if (options.output) {
      writeFileSync(options.output, output + '\n');
      console.log(chalk.green(`✓ Written ${glyphs.length} glyph names to ${options.output}`));
    } else {
      console.log(output);
    }
  });

program
  .command('categories')
  .description('List available glyph categories')
  .option('-l, --level <number>', 'Glyphset level 0-3 (cumulative)', '1')
  .option(...SCRIPT_OPTION)
  .action((options, command) => {
    const { script, level } = resolveRun(options, command);
    const registry = createRegistry(level, script);

    console.log(chalk.bold(`Categories in Level ${level}:`));
    for (const category of registry.getCategories()) {
      const count = registry.getByCategory(category).length;
      console.log(`  ${category} (${count} glyphs)`);
    }
  });

program
  .command('info')
  .description('Show glyphset information')
  .option('-l, --level <number>', 'Glyphset level 0-3', '1')
  .option(...SCRIPT_OPTION)
  .action((options, command) => {
    const { script, level } = resolveRun(options, command);
    const registry = createRegistry(level, script);

    console.log(chalk.bold('Lanka Glyphsets Info'));
    console.log(chalk.dim('─'.repeat(40)));
    if (script !== 'sinhala') console.log(`Script: ${script}`);
    console.log(`Level: ${level} (cumulative from 0)`);
    console.log(`Total glyphs: ${registry.size}`);
    console.log();
    console.log(chalk.bold('Glyphs by category:'));
    for (const category of registry.getCategories()) {
      const count = registry.getByCategory(category).length;
      console.log(`  ${category}: ${count}`);
    }
  });

program
  .command('generate')
  .description('Generate all glyph combinations from YAML definitions')
  .option('-l, --level <number>', 'Glyphset level 0-3 (cumulative)', '1')
  .option('-t, --type <type>', 'Type: all, base, signs, conjuncts, conjunct-signs, touching', 'all')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <type>', 'Output format: txt, json', 'txt')
  .option('--no-namespace', 'Exclude namespace suffix from glyph names')
  .option(...SCRIPT_OPTION)
  .action((options, command) => {
    const { script, level } = resolveRun(options, command);
    const namespace = SCRIPTS[script].namespace;
    let glyphs: GeneratedGlyph[];

    switch (options.type) {
      case 'base':
        glyphs = generateBaseGlyphs(level, namespace, script);
        break;
      case 'signs':
        glyphs = generateConsonantSignCombinations(level, namespace, script);
        break;
      case 'conjuncts':
        glyphs = generateConjuncts(level, namespace, script);
        break;
      case 'conjunct-signs':
        glyphs = generateConjunctSignCombinations(level, namespace, script);
        break;
      case 'touching':
        glyphs = generateTouchingClusters(level, namespace, script);
        break;
      default:
        glyphs = generateAllGlyphs(level, namespace, script);
    }

    // Format output
    const names = glyphs.map(g => options.namespace ? g.fullName : g.name);
    let output: string;

    if (options.format === 'json') {
      output = JSON.stringify(
        glyphs.map(g => ({
          name: options.namespace ? g.fullName : g.name,
          type: g.type,
          sequence: g.sequence,
          // Tamil only: other spellings, and how else the standard lets the form be met
          ...(g.sequences && { sequences: g.sequences }),
          ...(g.alternate && {
            alternate: options.namespace ? composeName(g.alternate, SCRIPTS[script]) : g.alternate,
          }),
          ...(g.canonical !== undefined && { canonical: g.canonical }),
          ...(g.level !== undefined && { level: g.level }),
        })),
        null,
        2
      );
    } else {
      output = names.join('\n');
    }

    if (options.output) {
      writeFileSync(options.output, output + '\n');
      console.log(chalk.green(`✓ Written ${glyphs.length} generated glyph names to ${options.output}`));
    } else {
      console.log(output);
    }
  });

program
  .command('generate-info')
  .description('Show counts of generated glyph types')
  .option('-l, --level <number>', 'Glyphset level 0-3 (cumulative)', '1')
  .option(...SCRIPT_OPTION)
  .action((options, command) => {
    const { script, level } = resolveRun(options, command);
    const counts = getGeneratedCounts(level, undefined, script);

    console.log(chalk.bold(`Generated Glyph Counts (Level ${level})`));
    console.log(chalk.dim('─'.repeat(40)));
    console.log(`Base consonants:     ${counts.base}`);
    console.log(`Consonant + signs:   ${counts.consonantSign}`);
    console.log(`Conjuncts:           ${counts.conjuncts}`);
    console.log(`Conjunct + signs:    ${counts.conjunctSign}`);
    console.log(`Touching clusters:   ${counts.touchingClusters}`);
    console.log(chalk.dim('─'.repeat(40)));
    console.log(chalk.bold(`Total:               ${counts.total}`));
  });

program
  .command('text-glyphs')
  .description('Extract unique glyph names needed to render Sinhala or Tamil text')
  .option('-i, --input <file>', 'Read text from a file')
  .option('-t, --text <string>', 'Text to analyze')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <type>', 'Output format: txt, names, json', 'txt')
  .option(...SCRIPT_OPTION)
  .action((options) => {
    let script: Script;
    try {
      script = resolveScript(options.script);
    } catch (err) {
      console.error(chalk.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
    let text: string;

    if (options.text) {
      text = options.text;
    } else if (options.input) {
      text = readFileSync(options.input, 'utf-8');
    } else {
      // Read from stdin
      try {
        text = readFileSync(0, 'utf-8');
      } catch {
        console.error(chalk.red('Error: Provide text via -t, -i, or stdin'));
        process.exit(1);
      }
    }

    if (!text.trim()) {
      console.error(chalk.yellow('No text provided'));
      process.exit(0);
    }

    let output: string;

    switch (options.format) {
      case 'names': {
        // Just glyph names, one per line (no grouping)
        const glyphs = getUniqueGlyphNames(text, script);
        output = glyphs
          .filter(g => g.type !== 'space')
          .map(g => g.name)
          .join('\n');
        break;
      }
      case 'json': {
        const glyphs = getUniqueGlyphNames(text, script);
        output = JSON.stringify(
          glyphs.filter(g => g.type !== 'space'),
          null,
          2
        );
        break;
      }
      default:
        output = formatGlyphAnalysis(text, script);
    }

    if (options.output) {
      writeFileSync(options.output, output + '\n');
      const count = getUniqueGlyphNames(text, script).filter(g => g.type !== 'space').length;
      console.log(chalk.green(`✓ Written ${count} unique glyph names to ${options.output}`));
    } else {
      console.log(output);
    }
  });

program
  .command('glyph-data')
  .description('Generate GlyphData.xml for Glyphs app from YAML definitions')
  .option('-l, --level <number>', 'Glyphset level 0-3 (cumulative)', '3')
  .option('-o, --output <file>', 'Output file path')
  .option(...SCRIPT_OPTION)
  .action((options, command) => {
    const { script, level } = resolveRun(options, command);

    const glyphs = loadGlyphsetsCumulative(level, script);
    const xml = formatAsGlyphData(glyphs, SCRIPTS[script].namespace, script);

    if (options.output) {
      writeFileSync(options.output, xml);
      console.log(chalk.green(`✓ Written ${glyphs.length} glyphs to ${options.output}`));
    } else {
      process.stdout.write(xml);
    }
  });

program
  .command('export-json')
  .description('Export shared inventory (conjunct/touch maps, letters) for the browser tools')
  .option('-l, --level <number>', 'Glyphset level 0-3 (cumulative)', '3')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <type>', 'Output format: json or js (browser+Node module)', 'json')
  .option(...SCRIPT_OPTION)
  .action((options, command) => {
    const { script, level } = resolveRun(options, command);

    // Auto-detect the module format from a .js output path unless overridden.
    let format = options.format as string;
    if (!process.argv.includes('-f') && !process.argv.includes('--format') &&
        options.output && options.output.endsWith('.js')) {
      format = 'js';
    }
    if (format !== 'json' && format !== 'js') {
      console.error(chalk.red("Error: format must be 'json' or 'js'"));
      process.exit(1);
    }

    const glyphs = loadGlyphsetsCumulative(level, script);
    const data = buildSharedData(glyphs);
    const out = format === 'js'
      ? formatSharedDataAsJsModule(data, script)
      : formatSharedDataAsJson(data);

    if (options.output) {
      writeFileSync(options.output, out);
      const conj = data.conjunctPairs.length;
      const touch = data.touchPairs.length;
      console.log(chalk.green(
        `✓ Wrote shared data (${conj} conjunct pairs, ${touch} touch pairs) to ${options.output}`
      ));
    } else {
      process.stdout.write(out);
    }
  });

program.parse();
