#!/usr/bin/env node
/**
 * Generate a Typedoc documentation coverage badge.
 * Generates docs/coverage.svg from docs/coverage.json.
 * The JSON is produced by typedoc-plugin-coverage
 * with --coverageOutputType json.
 */

const fs = require('fs');
const path = require('path');
const { generateBadge } = require('./badge.cjs');

const coveragePath = path.join(__dirname, '..', 'docs', 'coverage.json');
const outputPath = path.join(__dirname, '..', 'docs', 'coverage.svg');

let data;
try {
  data = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
} catch (err) {
  console.error(`Error reading ${coveragePath}: ${err.message}`);
  process.exit(1);
}

const pct = Math.round(data.percent);

generateBadge({ label: 'Docs', message: `${pct}%`, value: pct, output: outputPath });