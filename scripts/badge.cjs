#!/usr/bin/env node
/**
 * Generate a coverage-style badge SVG using badge-maker.
 *
 * Usage (CLI):
 *   node scripts/badge.cjs --label "Lines" \
 *     --message "100%" --value 100 --output path/to/badge.svg
 *   node scripts/badge.cjs --label "Docs" \
 *     --message "23%" --color "#994941" --output path/to/badge.svg
 *
 * Usage (module):
 *   const { generateBadge } = require('./badge.cjs');
 *   generateBadge({
 *     label: 'Lines', message: '100%', value: 100, output: 'badge.svg'
 *   });
 */

const fs = require('fs');
const path = require('path');
const { makeBadge } = require('badge-maker');

// ---------------------------------------------------------------------------
// Colour tiers
// ---------------------------------------------------------------------------
const TIER_THRESHOLDS = [
  [90, '#4fc921'], // pass
  [70, '#e2b337'], // warn
  [0, '#994941'],  // fail
];

/**
 * Map a 0–100 numeric value to a tier colour hex.
 * @param {number} value
 * @returns {string} hex colour
 */
const valueToColour = (value) => {
  for (const [threshold, colour] of TIER_THRESHOLDS) {
    if (value >= threshold) return colour;
  }
  return '#994941'; // fallback (shouldn't be reached)
};

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * Generate a badge SVG and write it to disk.
 * @param {{
 *   label: string,
 *   message: string,
 *   output: string,
 *   value?: number,
 *   color?: string
 * }} opts
 */
const generateBadge = ({ label, message, output, value, color } = {}) => {
  const colour = color || (value !== undefined ? valueToColour(value) : '#555');

  const svg = makeBadge({
    style: 'flat',
    label,
    message,
    color: colour,
    labelColor: '#555',
  });

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, svg);
  console.log(`✓ Generated ${output} (${label}: ${message})`);
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  const opts = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--label':      opts.label   = args[++i]; break;
      case '--message':    opts.message = args[++i]; break;
      case '--output':     opts.output  = args[++i]; break;
      case '--value':      opts.value   = Number(args[++i]); break;
      case '--color':      opts.color   = args[++i]; break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        process.exit(1);
    }
  }

  if (!opts.label || !opts.message || !opts.output) {
    console.error('Usage: node badge.cjs --label <label> --message <message> --output <path> [--value <0-100> | --color <hex>]');
    process.exit(1);
  }

  if (opts.value === undefined && opts.color === undefined) {
    console.error('Either --value or --color is required');
    process.exit(1);
  }

  try {
    generateBadge(opts);
  } catch (err) {
    console.error(`Error generating badge: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { generateBadge, valueToColour };