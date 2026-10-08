import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderProjectReports } from './project-report-layout.mjs';

const STATES = ['planned', 'in_progress', 'ready_for_review', 'verified', 'blocked'];
const DELIVERY = ['not_started', 'working_branch', 'pr_open', 'merged', 'deployed_verified'];
const RESULTS = ['not_tested', 'pass', 'fail'];
const CLASSES = ['documentation', 'infrastructure', 'presentation', 'interaction', 'data', 'feature'];
const validPath = value => typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.startsWith('/') && !value.split('/').some(x => ['', '..', '.'].includes(x));
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function trackedFiles(root) {
  // Use the Git index, not a recursive scan through dependencies/private files.
  return execFileSync('git', ['ls-files', '-z', '--cached'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean).sort();
}

export function validateProject(project, files) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  const nonempty = value => typeof value === 'string' && value.trim().length > 0;
  const array = value => Array.isArray(value) && value.length > 0;
  const local = (value, label) => require(validPath(value) && files.includes(value), `${label}: missing tracked path ${value}`);
  const reference = (value, label) => {
    if (typeof value !== 'string') return require(false, `${label}: invalid evidence reference`);
    if (value.startsWith('https://')) {
      try { const url = new URL(value); require(!!url.hostname && !url.username && !url.password, `${label}: invalid URL`); }
      catch { require(false, `${label}: invalid URL`); }
    } else local(value.split('#')[0], label);
  };
  if (!project || typeof project !== 'object') return ['Registry must be an object'];
  require(project.schemaVersion === 1, 'Unsupported registry schemaVersion');
  require(nonempty(project.name), 'Project name is required');
  require(validDate(project.reviewedOn), 'reviewedOn must be a real YYYY-MM-DD date');
  for (const key of ['milestones', 'tasks', 'capabilities', 'baseline', 'owners', 'releaseGates', 'notes']) require(array(project[key]), `${key} must be a nonempty array`);
  if (errors.length) return errors;
  const ids = new Map();
  const milestones = new Set();
  for (const milestone of project.milestones) {
    require(nonempty(milestone.id) && !milestones.has(milestone.id), `Duplicate/invalid milestone ${milestone.id}`);
    milestones.add(milestone.id);
    require(nonempty(milestone.name) && nonempty(milestone.goal), `Milestone ${milestone.id}: name and goal required`);
  }
  for (const base of project.baseline) {
    require(nonempty(base.branch) && /^[a-f0-9]{40}$/.test(base.sha || ''), 'Baseline needs branch and full commit SHA');
    require(nonempty(base.role), `Baseline ${base.branch}: role required`);
  }
  for (const owner of project.owners) {
    require(nonempty(owner.prefix) && nonempty(owner.owner) && nonempty(owner.rule), 'Ownership entry needs prefix, owner and rule');
    require(files.some(file => file.startsWith(owner.prefix)), `Ownership prefix has no tracked files: ${owner.prefix}`);
  }
  for (const capability of project.capabilities) {
    require(nonempty(capability.name) && nonempty(capability.scope) && nonempty(capability.limits), 'Capability needs name, scope and limits');
    require(['working', 'partial', 'planned', 'experimental'].includes(capability.status), `Capability ${capability.name}: invalid status`);
    require(array(capability.evidence), `Capability ${capability.name}: evidence required`);
    for (const ref of capability.evidence || []) reference(ref, `Capability ${capability.name}`);
  }
  for (const task of project.tasks) {
    require(/^[A-Z][A-Z0-9-]*$/.test(task.id || '') && !ids.has(task.id), `Duplicate/invalid task ID ${task.id}`);
    ids.set(task.id, task);
    require(nonempty(task.title) && nonempty(task.scope) && nonempty(task.excludes), `${task.id}: title, scope and exclusions required`);
    require(milestones.has(task.milestone), `${task.id}: unknown milestone`);
    require(STATES.includes(task.status), `${task.id}: invalid status`);
    require(CLASSES.includes(task.class), `${task.id}: invalid change class`);
    require(['approved', 'pending'].includes(task.authorization), `${task.id}: invalid authorization`);
    require(task.status === 'planned' || task.authorization === 'approved', `${task.id}: work started without recorded authorization`);
    require(Array.isArray(task.dependsOn), `${task.id}: dependsOn must be an array`);
    require(array(task.paths) && array(task.guidance), `${task.id}: paths and guidance required`);
    for (const file of [...(task.paths || []), ...(task.guidance || [])]) local(file, task.id);
    require(Array.isArray(task.docsReviewed), `${task.id}: docsReviewed must be an array`);
    for (const file of task.docsReviewed || []) {
      local(file, task.id);
      require((task.guidance || []).includes(file), `${task.id}: reviewed doc not declared in guidance: ${file}`);
    }
    require(task.delivery && DELIVERY.includes(task.delivery.stage), `${task.id}: invalid delivery stage`);
    if (task.status !== 'planned') require(nonempty(task.delivery?.branch), `${task.id}: working branch required`);
    if (task.delivery?.stage === 'pr_open') reference(task.delivery.pr, `${task.id} PR`);
    if (['merged', 'deployed_verified'].includes(task.delivery?.stage)) require(/^[a-f0-9]{40}$/.test(task.delivery.mergeSha || ''), `${task.id}: merge SHA required`);
    if (task.delivery?.stage === 'deployed_verified') {
      require(/^[a-f0-9]{40}$/.test(task.delivery.deployedSha || ''), `${task.id}: deployed SHA required`);
      reference(task.delivery.deploymentEvidence, `${task.id} deployment`);
    }
    require(!(task.status === 'planned' && task.delivery?.stage !== 'not_started'), `${task.id}: planned task cannot claim delivery`);
    require(task.status === 'planned' || task.delivery?.stage !== 'not_started', `${task.id}: started work must record a delivery stage`);
    require(!['merged', 'deployed_verified'].includes(task.delivery?.stage) || task.status === 'verified', `${task.id}: delivery requires verified work`);
    require(task.status !== 'blocked' || nonempty(task.blocker), `${task.id}: blocked task needs a reason`);
    require(array(task.acceptance), `${task.id}: acceptance criteria required`);
    const criteria = new Set();
    for (const criterion of task.acceptance || []) {
      require(nonempty(criterion.id) && !criteria.has(criterion.id), `${task.id}: duplicate/invalid criterion ID`);
      criteria.add(criterion.id);
      require(nonempty(criterion.description) && RESULTS.includes(criterion.result) && Array.isArray(criterion.evidence), `${task.id}/${criterion.id}: invalid criterion`);
      require(criterion.result !== 'pass' || array(criterion.evidence), `${task.id}/${criterion.id}: pass requires evidence`);
      for (const ref of criterion.evidence || []) reference(ref, `${task.id}/${criterion.id}`);
    }
    if (task.status === 'verified') {
      require(validDate(task.verifiedOn), `${task.id}: verifiedOn required`);
      require(task.acceptance.every(x => x.result === 'pass'), `${task.id}: all criteria must pass before verification`);
      require(task.guidance.every(file => task.docsReviewed.includes(file)), `${task.id}: affected guidance has not been reviewed`);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) return require(false, `Dependency cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    const task = ids.get(id);
    for (const dependency of task?.dependsOn || []) {
      require(ids.has(dependency), `${id}: missing dependency ${dependency}`);
      if (ids.has(dependency)) {
        if (['in_progress', 'ready_for_review', 'verified'].includes(task.status)) require(ids.get(dependency).status === 'verified', `${id}: dependency ${dependency} is not verified`);
        visit(dependency);
      }
    }
    visiting.delete(id); visited.add(id);
  }
  for (const id of ids.keys()) visit(id);
  if (project.activeTask !== null) require(ids.has(project.activeTask) && ids.get(project.activeTask).status === 'in_progress', 'activeTask must identify an in-progress task');
  const active = project.tasks.filter(task => task.status === 'in_progress');
  require(active.length <= 1 && (active.length === 0 || project.activeTask === active[0].id), 'Record exactly one activeTask for in-progress work on this branch');
  for (const gate of project.releaseGates) {
    require(nonempty(gate.name) && RESULTS.includes(gate.result) && Array.isArray(gate.evidence), 'Invalid release gate');
    require(gate.result !== 'pass' || array(gate.evidence), `${gate.name}: gate pass requires evidence`);
    for (const ref of gate.evidence || []) reference(ref, gate.name);
  }
  return errors;
}

export function buildReports(project, files, readme) {
  return renderProjectReports(project, files, readme);
}

export function run(root, check) {
  const project = JSON.parse(fs.readFileSync(path.join(root, 'project/tasks.json'), 'utf8'));
  const files = trackedFiles(root);
  const errors = validateProject(project, files);
  if (errors.length) throw new Error(errors.join('\n'));
  const reports = buildReports(project, files, fs.readFileSync(path.join(root, 'README.md'), 'utf8'));
  const stale = [];
  for (const [file, expected] of reports) {
    const target = path.join(root, file);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== expected) stale.push(file);
    } else { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, expected); }
  }
  if (stale.length) throw new Error(`Stale reports: ${stale.join(', ')}. Run node scripts/project-tracking.mjs and include the outputs.`);
  return `Project tracking ${check ? 'check' : 'generation'} passed: ${project.tasks.length} tasks, ${files.length} tracked files, ${reports.size} reports.`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/project-tracking.mjs [--check]');
    console.log(run(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), args.includes('--check')));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
