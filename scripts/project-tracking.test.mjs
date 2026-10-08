import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildReports, run, trackedFiles, validateProject } from './project-tracking.mjs';
import { progressIllustration } from './project-illustrations.mjs';

const files = ['AGENTS.md', 'docs/DECISIONS.md', 'src/example.js'];
const readme = '# Fixture\n\nBefore\n<!-- PROJECT:START -->\nOld\n<!-- PROJECT:END -->\nAfter\n';
function fixture() {
  return {
    schemaVersion: 1, name: 'Fixture', reviewedOn: '2026-10-08', activeTask: null,
    milestones: [{ id: 'A', name: 'Small milestone', goal: 'A tested result.' }],
    baseline: [{ branch: 'main', sha: 'a'.repeat(40), role: 'Dated evidence only' }],
    owners: [{ prefix: 'src/', owner: 'Feature', rule: 'No cross-feature imports' }],
    capabilities: [{ name: 'Example', status: 'partial', scope: 'fixture', limits: 'Not production', evidence: ['docs/DECISIONS.md'] }],
    releaseGates: [{ name: 'Release approval', result: 'not_tested', evidence: [] }], notes: ['No private data.'],
    tasks: [{ id: 'T1', milestone: 'A', title: 'Example task', scope: 'One change', excludes: 'Production', class: 'feature', authorization: 'pending', status: 'planned', dependsOn: [], paths: ['src/example.js'], guidance: ['AGENTS.md'], docsReviewed: [], delivery: { stage: 'not_started', branch: null }, acceptance: [{ id: 'AC1', description: 'Observable acceptance', result: 'not_tested', evidence: [] }] }],
  };
}
function verified(project = fixture()) {
  const task = project.tasks[0];
  Object.assign(task, { status: 'verified', authorization: 'approved', verifiedOn: '2026-10-08', docsReviewed: ['AGENTS.md'], delivery: { stage: 'working_branch', branch: 'feature/example' } });
  task.acceptance[0] = { ...task.acceptance[0], result: 'pass', evidence: ['docs/DECISIONS.md'] };
  return project;
}
const rejects = (p, pattern) => assert.match(validateProject(p, files).join('\n'), pattern);

test('planned task passes; generation is deterministic and preserves surrounding README', () => {
  const p = fixture(); assert.deepEqual(validateProject(p, files), []);
  const reports = buildReports(p, files, readme);
  assert.deepEqual([...reports], [...buildReports(p, files, readme)]);
  assert.match(reports.get('README.md'), /^# Fixture\n\nBefore/);
  assert.ok(reports.get('README.md').endsWith('After\n'));
});
test('one completion refreshes all progress views without claiming deployment', () => {
  const p = verified(); assert.deepEqual(validateProject(p, files), []);
  const reports = buildReports(p, files, readme);
  for (const file of ['README.md', 'docs/STATUS.md', 'docs/ROADMAP.md']) assert.match(reports.get(file), /1 \/ 1 tracked tasks verified/);
  assert.match(reports.get('docs/STATUS.md'), /working branch/);
  assert.doesNotMatch(reports.get('docs/NEXT_TASK.md').split('## Dependency-ready tasks')[1].split('## Blockers')[0], /Example task/);
});
test('illustrations follow registry counts and retain accessible titles', () => {
  const p = fixture();
  const before = progressIllustration(p);
  const after = progressIllustration(verified(p));
  assert.match(before, /0 of 1 tracked tasks verified/);
  assert.match(after, /1 of 1 tracked tasks verified/);
  assert.notEqual(before, after);
  assert.match(after, /<title id="title">/);
  assert.match(after, /not whole-product completion/);
  assert.equal(after, progressIllustration(p));
  p.milestones[0].name = 'Names & <tags>';
  assert.match(progressIllustration(p), /Names &amp; &lt;tags&gt;/);
});
test('progress pages keep detail discoverable with explicit status labels', () => {
  const reports = buildReports(fixture(), files, readme);
  assert.match(reports.get('docs/ROADMAP.md'), /<details>/);
  assert.match(reports.get('docs/ROADMAP.md'), /Observable acceptance/);
  assert.match(reports.get('docs/STATUS.md'), /○ Planned|○ Not tested/);
  assert.match(reports.get('docs/FILE_MAP.md'), /\[src\/example.js\]\(\.\.\/src\/example.js\)/);
  assert.match(reports.get('docs/FILE_MAP.md'), /Feature · 1 files/);
});
test('verification requires acceptance evidence, results and guidance review', () => {
  const p = verified(); p.tasks[0].acceptance[0].evidence = []; rejects(p, /pass requires evidence/);
  p.tasks[0].acceptance[0].result = 'not_tested'; rejects(p, /all criteria must pass/);
  p.tasks[0].docsReviewed = []; rejects(p, /guidance has not been reviewed/);
});
test('missing dependency and dependency cycles are rejected', () => {
  const p = fixture(); p.tasks[0].dependsOn = ['UNKNOWN']; rejects(p, /missing dependency/);
  p.tasks[0].dependsOn = ['T1']; rejects(p, /Dependency cycle/);
});
test('review-ready and verified work cannot bypass unfinished dependencies', () => {
  const p = verified(); p.tasks.push({ ...structuredClone(fixture().tasks[0]), id: 'T2' }); p.tasks[0].dependsOn = ['T2'];
  rejects(p, /dependency T2 is not verified/);
  p.tasks[0].status = 'in_progress'; p.activeTask = 'T1'; rejects(p, /dependency T2 is not verified/);
});
test('in-progress work needs an active task and verified work cannot claim not started', () => {
  const p = verified(); p.tasks[0].status = 'in_progress'; rejects(p, /exactly one activeTask/);
  const q = verified(); q.tasks[0].delivery.stage = 'not_started'; rejects(q, /started work must record/);
});
test('pending authorization does not permit work or active task assignment', () => {
  const p = fixture(); p.tasks[0].status = 'in_progress'; p.tasks[0].delivery = { stage: 'working_branch', branch: 'feature/test' }; rejects(p, /without recorded authorization/);
  const q = fixture(); q.activeTask = 'T1'; rejects(q, /activeTask/);
});
test('untracked and escaping guidance/evidence paths fail validation', () => {
  const p = verified(); p.tasks[0].acceptance[0].evidence = ['../private/file.md']; rejects(p, /missing tracked path/);
  p.tasks[0].guidance = ['docs/missing.md']; rejects(p, /missing tracked path/);
});
test('delivery records cannot claim a merge or deployment without evidence', () => {
  const p = verified(); p.tasks[0].delivery.stage = 'deployed_verified'; rejects(p, /merge SHA required/); rejects(p, /deployed SHA required/); rejects(p, /invalid evidence/);
  p.tasks[0].status = 'ready_for_review'; rejects(p, /delivery requires verified/);
  const q = fixture(); q.tasks[0].delivery.stage = 'pr_open'; rejects(q, /planned task cannot claim delivery/);
});
test('unsupported schemas, enum values, duplicate IDs and invalid dates fail', () => {
  const p = fixture(); p.schemaVersion = 2; rejects(p, /Unsupported/);
  const q = fixture(); q.tasks.push(structuredClone(q.tasks[0])); rejects(q, /Duplicate/);
  const r = fixture(); r.tasks[0].status = 'done'; rejects(r, /invalid status/);
  const s = verified(); s.tasks[0].verifiedOn = '2026-02-30'; rejects(s, /verifiedOn/);
});
test('blocked tasks need reasons and release gate passes need evidence', () => {
  const p = fixture(); Object.assign(p.tasks[0], { status: 'blocked', authorization: 'approved', delivery: { stage: 'working_branch', branch: 'feature/test' } }); rejects(p, /blocked task needs/);
  p.releaseGates[0].result = 'pass'; rejects(p, /gate pass requires evidence/);
});
test('missing and repeated README markers fail before replacement', () => {
  assert.throws(() => buildReports(fixture(), files, '# README'), /exactly one ordered/);
  assert.throws(() => buildReports(fixture(), files, readme + '<!-- PROJECT:START -->'), /exactly one ordered/);
});
test('Git fixture: staged file map, all stale reports, read-only check and regeneration', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rogue-tracking-test-'));
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  const write = (file, content) => { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), content); };
  try {
    git(['init', '-q']);
    for (const file of files) write(file, 'fixture\n');
    write('README.md', readme); write('project/tasks.json', JSON.stringify(fixture()));
    for (const file of ['docs/STATUS.md', 'docs/ROADMAP.md', 'docs/NEXT_TASK.md', 'docs/FILE_MAP.md']) write(file, '');
    git(['add', '.']); write('private-untracked.txt', 'PRIVATE_FIXTURE'); write('node_modules/dependency.js', 'DEPENDENCY');
    const source = fs.readFileSync(path.join(root, 'src/example.js'), 'utf8');
    assert.match(run(root, false), /generation passed/); assert.match(run(root, true), /check passed/);
    const map = fs.readFileSync(path.join(root, 'docs/FILE_MAP.md'), 'utf8');
    assert.doesNotMatch(map, /private-untracked|dependency.js/);
    for (const file of ['README.md', 'docs/STATUS.md', 'docs/ROADMAP.md', 'docs/NEXT_TASK.md', 'docs/FILE_MAP.md', 'docs/assets/milestone-progress.svg', 'docs/assets/local-data-flow.svg', 'docs/assets/verification-flow.svg']) {
      const correct = fs.readFileSync(path.join(root, file), 'utf8');
      const stale = file === 'README.md' ? correct.replace('<!-- PROJECT:START -->', '<!-- PROJECT:START -->\nSTALE') : correct + '\nSTALE\n';
      fs.writeFileSync(path.join(root, file), stale);
      assert.throws(() => run(root, true), /Stale reports/);
      assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), stale);
      run(root, false);
    }
    write('src/new.js', 'new file'); git(['add', 'src/new.js']);
    assert.ok(trackedFiles(root).includes('src/new.js')); assert.throws(() => run(root, true), /Stale reports/);
    run(root, false); assert.match(fs.readFileSync(path.join(root, 'docs/FILE_MAP.md'), 'utf8'), /src\/new.js/);
    const p = verified(); write('project/tasks.json', JSON.stringify(p)); assert.throws(() => run(root, true), /Stale reports/);
    run(root, false); assert.match(run(root, true), /check passed/);
    assert.equal(fs.readFileSync(path.join(root, 'src/example.js'), 'utf8'), source);
    assert.equal(fs.readFileSync(path.join(root, 'private-untracked.txt'), 'utf8'), 'PRIVATE_FIXTURE');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
