import { existsSync, readFileSync } from 'node:fs';

const requirements = [
  {
    path: 'docs/AGENT-OPERATING-MODEL.md',
    headings: ['Assignment gate', 'Work unit', 'Handoff protocol', 'Integration protocol', 'Collision rule', 'Automated coordination gate'],
    tokens: ['PROPOSED', 'ASSIGNED', 'IN_PROGRESS', 'HANDOFF_READY', 'INTEGRATED', 'CLOSED', 'BLOCKED', 'git worktree list', 'last verified SHA', 'staging SHA'],
  },
  {
    path: 'docs/AGENT-TASK-TEMPLATE.md',
    headings: ['Identity', 'Objective', 'Base and workspace', 'Ownership', 'Dependencies and collision check', 'Contract and data impact', 'Acceptance criteria', 'Verification', 'Stop conditions', 'Specialist handoff', 'Integrator acceptance'],
    tokens: ['Task/Issue:', 'Integration base SHA:', 'Agent branch:', 'Agent worktree:', 'Depends on:', 'Collision review:', 'Checks not executed and why:', 'Last verified SHA/tree:', 'Staging SHA or `NOT_DEPLOYED`:'],
  },
  {
    path: '.github/ISSUE_TEMPLATE/agent-task.md',
    headings: ['Objective', 'Task identity and owner', 'Base and workspace', 'Ownership', 'Dependencies and collision check', 'Contract and data impact', 'Acceptance criteria', 'Required verification', 'Stop conditions / escalation', 'Handoff evidence', 'Integrator acceptance'],
    tokens: ['Task ID:', 'Integration base SHA:', 'Agent branch:', 'Agent worktree:', 'Depends on:', 'Collision review:', 'Checks not executed:', 'Last verified SHA/tree:', 'Staging SHA or `NOT_DEPLOYED`:'],
  },
  {
    path: '.github/PULL_REQUEST_TEMPLATE.md',
    headings: ['Tarea y alcance', 'Comportamiento', 'Ownership y colisiones', 'Verificacion', 'Datos y recuperacion', 'Riesgos y desconocidos', 'Aprobacion'],
    tokens: ['Issue/tarea:', 'SHA base de integración:', 'Checks no ejecutados y motivo:', 'Último SHA/árbol verificado:', 'SHA de staging o `NOT_DEPLOYED`:'],
  },
];

const normalize = value => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[`*_]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const errors = [];
for (const requirement of requirements) {
  if (!existsSync(requirement.path)) {
    errors.push(`${requirement.path}: missing file`);
    continue;
  }
  const content = readFileSync(requirement.path, 'utf8');
  const headings = new Set(
    [...content.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map(match => normalize(match[1])),
  );
  for (const heading of requirement.headings) {
    if (!headings.has(normalize(heading))) errors.push(`${requirement.path}: missing heading "${heading}"`);
  }
  const normalizedContent = normalize(content);
  for (const token of requirement.tokens) {
    if (!normalizedContent.includes(normalize(token))) errors.push(`${requirement.path}: missing required field "${token}"`);
  }
}

const requiredLinks = {
  'AGENTS.md': ['docs/AGENT-OPERATING-MODEL.md', 'docs/DEFINITION-OF-DONE.md', 'docs/AGENT-TASK-TEMPLATE.md'],
  '.github/copilot-instructions.md': ['AGENTS.md', 'docs/AGENT-OPERATING-MODEL.md'],
};

for (const [path, links] of Object.entries(requiredLinks)) {
  if (!existsSync(path)) {
    errors.push(`${path}: missing file`);
    continue;
  }
  const content = readFileSync(path, 'utf8');
  for (const link of links) {
    if (!content.includes(link)) errors.push(`${path}: missing canonical reference ${link}`);
  }
}

if (errors.length) {
  console.error('Agent coordination validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Agent coordination validation passed (${requirements.length} templates, ${Object.keys(requiredLinks).length} instruction files).`);
}
