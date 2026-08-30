#!/usr/bin/env node
/**
 * Generate vitest coverage badge SVGs.
 * Reads coverage/coverage-summary.json and writes one SVG per category
 * to coverage/.
 */

const fs = require('fs');
const path = require('path');
const { generateBadge } = require('./badge.cjs');

// ---------------------------------------------------------------------------
// Read coverage summary
// ---------------------------------------------------------------------------
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
let total;

try {
  const data = fs.readFileSync(coveragePath, 'utf-8');
  const summary = JSON.parse(data);
  total = summary.total;
} catch (err) {
  console.error(`Error reading ${coveragePath}: ${err.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Generate badges
// ---------------------------------------------------------------------------
const outDir = path.join(__dirname, '..', 'coverage');

const getLabel = (category) => category.charAt(0).toUpperCase() + category.slice(1);

Object.keys(total).forEach((category) => {
  if (category === 'branchesTrue') return;

  const { pct } = total[category];
  const value = Math.round(pct);
  const label = getLabel(category);
  const output = path.join(outDir, `${category}.svg`);

  generateBadge({ label, message: `${value}%`, value, output });
});

console.log('\nGenerated badge SVGs in coverage/');