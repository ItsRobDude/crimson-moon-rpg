import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { narrativeStateRegistry, SCENE_STATE_SCHEMA } from '../data/narrativeSafety.js';
import { scenes } from '../data/scenes.js';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');

const registryNotePath = path.join(projectRoot, 'notes', 'narrative_state_registry.md');
const registryNote = fs.readFileSync(registryNotePath, 'utf8');
const gameSource = fs.readFileSync(path.join(projectRoot, 'game.js'), 'utf8');

const used = {
    flags: new Map(),
    sceneMemory: new Map()
};

const noteRows = {
    flags: new Map(),
    sceneMemory: new Map()
};

function addUse(kind, key, source) {
    if (!key || typeof key !== 'string') return;
    if (kind === 'sceneMemory' && key.startsWith('ui_')) return;

    if (!used[kind].has(key)) {
        used[kind].set(key, new Set());
    }
    used[kind].get(key).add(source);
}

function addFlagValue(value, source) {
    if (Array.isArray(value)) {
        value.forEach((key) => addFlagValue(key, source));
        return;
    }
    addUse('flags', value, source);
}

function addSceneMemoryValue(value, source) {
    if (Array.isArray(value)) {
        value.forEach((entry) => addSceneMemoryValue(entry, source));
        return;
    }
    if (typeof value === 'string') {
        addUse('sceneMemory', value, source);
        return;
    }
    if (value && typeof value === 'object') {
        addUse('sceneMemory', value.key, source);
    }
}

function walkAuthoredNode(node, source) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
        node.forEach((entry) => walkAuthoredNode(entry, source));
        return;
    }

    if (node.type === 'flag') {
        addUse('flags', node.flagId, source);
    }

    if (node.setFlag) {
        addUse('flags', node.setFlag, source);
    }

    if (node.requires) {
        addFlagValue(node.requires.flag, source);
        addFlagValue(node.requires.notFlag, source);
        addSceneMemoryValue(node.requires.sceneMemory, source);
        addSceneMemoryValue(node.requires.notSceneMemory, source);
    }

    Object.values(node).forEach((value) => walkAuthoredNode(value, source));
}

walkAuthoredNode(scenes, 'data/scenes.js');

for (const match of gameSource.matchAll(/\bgameState\.flags\.([a-zA-Z0-9_]+)/g)) {
    addUse('flags', match[1], 'game.js');
}
for (const match of gameSource.matchAll(/\bflagId:\s*['"]([a-zA-Z0-9_]+)['"]/g)) {
    addUse('flags', match[1], 'game.js');
}
for (const match of gameSource.matchAll(/\bsetFlag:\s*['"]([a-zA-Z0-9_]+)['"]/g)) {
    addUse('flags', match[1], 'game.js');
}
for (const match of gameSource.matchAll(/\b(?:getSceneMemory|setSceneMemory)\(\s*['"]([a-zA-Z0-9_]+)['"]/g)) {
    addUse('sceneMemory', match[1], 'game.js');
}

function parseNoteTable(kind, heading) {
    const headingIndex = registryNote.indexOf(`## ${heading}`);
    if (headingIndex === -1) return;

    const nextHeadingIndex = registryNote.indexOf('\n## ', headingIndex + 1);
    const section = registryNote.slice(headingIndex, nextHeadingIndex === -1 ? undefined : nextHeadingIndex);

    section.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\|\s*`([^`]+)`\s*\|(.+)\|$/);
        if (!match) return;

        const cells = match[2].split('|').map((cell) => cell.trim());
        if (cells.length < 5) return;

        noteRows[kind].set(match[1], {
            owner: cells[0],
            thread: cells[1],
            meaning: cells[2],
            revealSensitivity: cells[3],
            semantics: cells[4]
        });
    });
}

parseNoteTable('flags', 'Flags');
parseNoteTable('sceneMemory', 'Scene Memory');

function findMismatches(kind, registryKeys) {
    const registryKeySet = new Set(registryKeys);
    const noteMissing = [];
    const jsMissing = [];

    [...used[kind].keys()].sort().forEach((key) => {
        const sources = [...used[kind].get(key)].sort().join(', ');
        const entry = { key, sources };

        if (!registryKeySet.has(key)) {
            jsMissing.push(entry);
        }
        if (!registryNote.includes(`\`${key}\``)) {
            noteMissing.push(entry);
        }
    });

    return { jsMissing, noteMissing };
}

const mismatches = {
    flags: findMismatches('flags', Object.keys(narrativeStateRegistry.flags)),
    sceneMemory: findMismatches('sceneMemory', Object.keys(narrativeStateRegistry.sceneMemory))
};

function isFilledString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function findInvalidRegistryEntries(kind) {
    const invalid = [];
    const requiredFields = ['owner', 'thread', 'meaning', 'revealSensitivity', 'semantics'];
    const registryEntries = narrativeStateRegistry[kind];
    const validSensitivity = new Set(SCENE_STATE_SCHEMA.spoilerSensitivity);
    const validSemantics = new Set(SCENE_STATE_SCHEMA.rewardSemantics);

    [...used[kind].keys()].sort().forEach((key) => {
        const entry = registryEntries[key];
        if (!entry) return;

        const problems = [];
        requiredFields.forEach((field) => {
            if (!isFilledString(entry[field])) {
                problems.push(`missing ${field}`);
            }
        });
        if (!Array.isArray(entry.allowedValues) || entry.allowedValues.length === 0) {
            problems.push('missing allowedValues');
        }
        if (isFilledString(entry.revealSensitivity) && !validSensitivity.has(entry.revealSensitivity)) {
            problems.push(`invalid revealSensitivity ${entry.revealSensitivity}`);
        }
        if (isFilledString(entry.semantics) && !validSemantics.has(entry.semantics)) {
            problems.push(`invalid semantics ${entry.semantics}`);
        }

        if (problems.length > 0) {
            invalid.push({ key, sources: problems.join(', ') });
        }
    });

    return invalid;
}

function findInvalidNoteRows(kind) {
    const invalid = [];
    const validSensitivity = new Set(SCENE_STATE_SCHEMA.spoilerSensitivity);
    const validSemantics = new Set(SCENE_STATE_SCHEMA.rewardSemantics);

    [...used[kind].keys()].sort().forEach((key) => {
        const row = noteRows[kind].get(key);
        if (!row) return;

        const problems = [];
        ['owner', 'thread', 'meaning', 'revealSensitivity', 'semantics'].forEach((field) => {
            if (!isFilledString(row[field])) {
                problems.push(`missing ${field}`);
            }
        });
        if (isFilledString(row.revealSensitivity) && !validSensitivity.has(row.revealSensitivity)) {
            problems.push(`invalid sensitivity ${row.revealSensitivity}`);
        }
        if (isFilledString(row.semantics) && !validSemantics.has(row.semantics)) {
            problems.push(`invalid semantics ${row.semantics}`);
        }

        if (problems.length > 0) {
            invalid.push({ key, sources: problems.join(', ') });
        }
    });

    return invalid;
}

function printGroup(label, entries) {
    if (entries.length === 0) return;
    console.log(label);
    entries.forEach(({ key, sources }) => {
        console.log(`  ${key} used in ${sources}`);
    });
}

let hasMismatch = false;

[
    ['Flags missing from data/narrativeSafety.js:', mismatches.flags.jsMissing],
    ['Flags missing from notes/narrative_state_registry.md:', mismatches.flags.noteMissing],
    ['Scene-memory keys missing from data/narrativeSafety.js:', mismatches.sceneMemory.jsMissing],
    ['Scene-memory keys missing from notes/narrative_state_registry.md:', mismatches.sceneMemory.noteMissing],
    ['Flags with incomplete or invalid data/narrativeSafety.js classification:', findInvalidRegistryEntries('flags')],
    ['Scene-memory keys with incomplete or invalid data/narrativeSafety.js classification:', findInvalidRegistryEntries('sceneMemory')],
    ['Flags with incomplete or invalid notes/narrative_state_registry.md classification:', findInvalidNoteRows('flags')],
    ['Scene-memory keys with incomplete or invalid notes/narrative_state_registry.md classification:', findInvalidNoteRows('sceneMemory')]
].forEach(([label, entries]) => {
    if (entries.length > 0) {
        hasMismatch = true;
        printGroup(label, entries);
    }
});

if (hasMismatch) {
    process.exitCode = 1;
} else {
    console.log('No narrative state registry drift found.');
}
