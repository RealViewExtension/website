#!/usr/bin/env node
// Pull src/changelog.json from the extension repository and write one
// src/content/updates/<version>.md for every version that does not have a
// file yet. Existing files are never touched, so edits made here survive.
//
//   npm run sync-updates            # fetch from GitHub
//   npm run sync-updates -- ../src/changelog.json   # or read a local copy

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const SOURCE =
  process.argv[2] ??
  'https://raw.githubusercontent.com/RealViewExtension/RealViewExtension/main/src/changelog.json';
const OUT_DIR = new URL('../src/content/updates/', import.meta.url);

async function load() {
  if (/^https?:/.test(SOURCE)) {
    const res = await fetch(SOURCE);
    if (!res.ok) throw new Error(`${SOURCE}: HTTP ${res.status}`);
    return res.json();
  }
  return JSON.parse(await readFile(SOURCE, 'utf8'));
}

// RealView's versioning: a middle-number bump is a feature, a third-number
// bump is a fix. Compared against the entry released just before this one.
function kindOf(entry, previous) {
  if (!previous) return 'feature';
  const [, mid] = entry.version.split('.').map(Number);
  const [, prevMid] = previous.version.split('.').map(Number);
  return mid > prevMid ? 'feature' : 'fix';
}

function titleOf(entry) {
  const first = entry.changes[0] ?? `Version ${entry.version}`;
  const sentence = first.split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, '');
  return sentence.length > 70 ? `Version ${entry.version}` : sentence;
}

function render(entry, kind) {
  const title = titleOf(entry).replace(/"/g, '\\"');
  const body = entry.changes.map((line) => `- ${line}`).join('\n');
  return `---\nversion: "${entry.version}"\ndate: ${entry.date}\nkind: ${kind}\ntitle: "${title}"\n---\n\n${body}\n`;
}

const entries = await load(); // newest first
await mkdir(OUT_DIR, { recursive: true });
let written = 0;
for (let i = 0; i < entries.length; i++) {
  const entry = entries[i];
  const file = new URL(`${entry.version}.md`, OUT_DIR);
  try {
    await access(file);
    continue; // already published, leave alone
  } catch {}
  await writeFile(file, render(entry, kindOf(entry, entries[i + 1])));
  console.log(`wrote src/content/updates/${entry.version}.md`);
  written++;
}
console.log(written ? `${written} new update(s)` : 'nothing new');
