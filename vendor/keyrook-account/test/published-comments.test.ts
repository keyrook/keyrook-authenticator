import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * Every product ships this package as source, and its readers have none of
 * this repository's documents, milestones, migrations, server settings or
 * tests. So a comment in src/ says what the code does, never where in the
 * working notes it came from. Its tests, here, keep their pointers.
 */
const SRC = resolve(import.meta.dirname, '../src');

const POINTERS: [string, RegExp][] = [
  ['a document', /\bdocs\/[\w.-]+/],
  ['a milestone', /\b[FSU]\d{1,2}\b/],
  ['a migration', /\bmigrations? \d+/i],
  ['a server setting', /\bAUTHX_\w+/],
  ['a date', /\b\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4}\b/],
  ['a path in this repository', /\b(?:packages|apps|kit|test)\/[\w.-]+/],
  ['the project’s rules', /CLAUDE\.md|project's rules/],
];

/**
 * Every comment in a file, as TypeScript reads it, so a string or a regular
 * expression that looks like one is not taken for one. Each comment sits in
 * the trivia before some token, the end of the file's included; a JSDoc node
 * is skipped, since its own text is that trivia.
 */
function commentsOf(name: string, text: string): string[] {
  const file = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true);
  const found = new Map<number, string>();
  const visit = (node: ts.Node) => {
    for (const child of node.getChildren(file)) {
      if (ts.isJSDoc(child)) continue;
      const at = child.getFullStart();
      const ranges = [...(ts.getLeadingCommentRanges(text, at) ?? []), ...(ts.getTrailingCommentRanges(text, at) ?? [])];
      for (const range of ranges) found.set(range.pos, text.slice(range.pos, range.end));
      visit(child);
    }
  };
  visit(file);
  return [...found.values()];
}

function pointersIn(name: string, text: string): string[] {
  const offenders: string[] = [];
  for (const comment of commentsOf(name, text)) {
    for (const [what, rule] of POINTERS) {
      const match = comment.match(rule);
      if (match) offenders.push(`${name}: ${what}, "${match[0]}"`);
    }
  }
  return offenders;
}

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

describe('the published comments', () => {
  it('point at nothing a reader of the source does not have', () => {
    const files = sources(SRC);
    expect(files.map((path) => relative(SRC, path))).toContain(join('sync', 'protocol.ts'));
    const offenders = files.flatMap((path) => pointersIn(relative(SRC, path), readFileSync(path, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('are found wherever a comment can sit', () => {
    const planted = [
      '/** Seals it (docs/family.md, Keys). */\nexport const a = 1;',
      'export const b = 2; // a server from before migration 11',
      "export type C =\n  | 'c'\n  /** Back in with help (F9). */\n  | 'd';",
      'export interface E {\n  e: string;\n  /* while `AUTHX_ORGS` is off */\n}',
      "export const f = 'f';\n// frozen on 29 October 2026\n",
      "export const g = (s: string) => s.replace(/\\//g, '_'); /* packages/account/test/g.test.ts */",
      'export function h() {\n  return 1;\n  // they are in the project\'s rules\n}',
    ];
    for (const text of planted) expect(pointersIn('planted.ts', text), text).not.toEqual([]);
  });

  it('are told apart from strings and regular expressions that look like them', () => {
    const text = [
      "export const label = 'docs/family.md F9 migration 11 AUTHX_ORGS 29 October 2026';",
      'export const rule = /\\/\\/ F9 docs\\/x\\.md/g;',
      'export const path = `packages/account/test/${label}`;',
      '// Says what the code does.',
      '',
    ].join('\n');
    expect(commentsOf('benign.ts', text)).toEqual(['// Says what the code does.']);
    expect(pointersIn('benign.ts', text)).toEqual([]);
  });
});
