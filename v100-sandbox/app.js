/* global document, localStorage, fetch */

const DRAFT_STORAGE_KEY = 'crocs-teaching-v100-phase-a-drafts';

const state = {
  projection: null,
  activeWorkspace: 'BUSINESS_DECISION',
  drafts: readDrafts(),
};

void start();

async function start() {
  try {
    const response = await fetch('./projection.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Projection data could not be loaded.');
    state.projection = await response.json();
    renderShell();
  } catch (error) {
    renderFatal(error instanceof Error ? error.message : String(error));
  }
}

function renderShell() {
  const projection = requireProjection();
  document.getElementById('phase-banner').textContent = projection.phaseBanner;
  document.getElementById('source-head').textContent =
    'Source baseline · ' + shortRef(projection.sourceHead);

  renderNavigation();
  renderTeachingEvidence();
  renderModelStatus();
  renderWorkspace();

  document
    .getElementById('reset-drafts')
    .addEventListener('click', resetDrafts);
  document
    .getElementById('open-evidence')
    .addEventListener('click', openEvidenceDialog);
}

function renderNavigation() {
  const projection = requireProjection();
  const nav = document.getElementById('workspace-nav');
  nav.replaceChildren();

  projection.workspaces.forEach((workspace, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'workspace-button';
    button.dataset.workspace = workspace.id;
    if (workspace.id === state.activeWorkspace)
      button.setAttribute('aria-current', 'page');
    button.innerHTML =
      '<small>0' +
      String(index + 1) +
      ' · ' +
      escapeHtml(workspace.id) +
      '</small>' +
      escapeHtml(workspace.title);
    button.addEventListener('click', () => {
      state.activeWorkspace = workspace.id;
      renderNavigation();
      renderWorkspace();
      document.getElementById('workspace').focus({ preventScroll: true });
    });
    nav.append(button);
  });
}

function renderWorkspace() {
  const workspace = currentWorkspace();
  document.getElementById('workspace-id').textContent = workspace.id;
  document.getElementById('workspace-title').textContent = workspace.title;
  document.getElementById('workspace-question').textContent =
    workspace.question;

  const worstStatus = deriveWorstStatus(workspace.slots);
  const badge = document.getElementById('workspace-status');
  badge.textContent = worstStatus;
  badge.className = 'status-badge status-' + worstStatus;

  renderDecisions(workspace);
  renderFacts(workspace);
  renderAuthority(workspace);
}

function renderDecisions(workspace) {
  const list = document.getElementById('decision-list');
  list.replaceChildren();

  workspace.slots.forEach((slot) => {
    const card = document.createElement('article');
    card.className = 'decision-card';
    card.dataset.slot = slot.id;

    const header = document.createElement('header');
    const title = document.createElement('h4');
    title.innerHTML =
      '<span class="slot-id">' +
      escapeHtml(slot.id) +
      '</span>' +
      escapeHtml(slot.name);
    const status = statusBadge(slot.captureStatus);
    header.append(title, status);

    const note = document.createElement('p');
    note.textContent = slotNote(slot);

    const controls = document.createElement('div');
    controls.className = 'control-grid';
    renderSlotControls(slot, controls);

    const actions = document.createElement('div');
    actions.className = 'draft-actions';

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'primary';
    save.textContent =
      slot.captureStatus === 'CONFORMANCE_DRIFT'
        ? '保存草稿（不执行）'
        : '保存 UI 草稿';
    save.addEventListener('click', () => saveDraft(slot, card));

    const saved = document.createElement('span');
    saved.className = 'draft-note';
    saved.dataset.draftStatus = slot.id;
    saved.textContent = draftStatusText(slot.id);

    actions.append(save, saved);
    card.append(header, note, controls, actions);
    list.append(card);

    restoreDraftControls(slot, card);
  });
}

function renderSlotControls(slot, container) {
  switch (slot.kind) {
    case 'single':
      container.classList.add('single');
      container.append(selectControl('selection', '选择', slot.options));
      return;
    case 'multi':
      container.classList.add('single');
      container.append(multiControl(slot.options));
      return;
    case 'compound':
      Object.entries(slot.fields).forEach(([field, options]) => {
        container.append(selectControl(field, humanize(field), options));
      });
      return;
    case 'productionMix':
      container.append(numberControl('c1Production', 'C1 production'));
      container.append(numberControl('c2Production', 'C2 production'));
      return;
    case 'nextCycleAmbition':
      container.append(selectControl('ambition', 'Ambition', slot.options));
      container.append(textControl('target', 'Next-cycle target'));
      container.append(textControl('capabilityGap', 'Capability gap'));
      container.append(textControl('budgetIntent', 'Budget intent'));
      return;
    default:
      container.textContent = 'Unsupported presentation control.';
  }
}

function selectControl(name, labelText, options) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const select = document.createElement('select');
  select.dataset.field = name;
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '请选择';
  select.append(empty);
  options.forEach((option) => {
    const item = document.createElement('option');
    item.value = option;
    item.textContent = humanize(option);
    select.append(item);
  });
  label.append(select);
  return label;
}

function multiControl(options) {
  const wrapper = document.createElement('div');
  wrapper.className = 'checkbox-list';
  options.forEach((option) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = option;
    input.dataset.multi = 'true';
    label.append(input, document.createTextNode(humanize(option)));
    wrapper.append(label);
  });
  return wrapper;
}

function numberControl(name, labelText) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.step = '1';
  input.inputMode = 'decimal';
  input.dataset.field = name;
  label.append(input);
  return label;
}

function textControl(name, labelText) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'text';
  input.dataset.field = name;
  label.append(input);
  return label;
}

function saveDraft(slot, card) {
  const selection = readSlotSelection(slot, card);
  if (selection === null) {
    updateDraftNote(slot.id, '请先完成该决策位的输入。');
    return;
  }

  state.drafts[slot.id] = {
    provenance: 'UI_DRAFT',
    authoritative: false,
    workspace: currentWorkspace().id,
    slotId: slot.id,
    selection,
    captureStatus: slot.captureStatus,
    effectStatus: slot.effectStatus,
  };
  persistDrafts();
  updateDraftNote(
    slot.id,
    slot.id === 'D19' || slot.id === 'D20'
      ? '已保存浏览器草稿；正式 PLAYER_DECISION 仍需领域授权 capture。'
      : '已保存本机 UI_DRAFT；未执行任何业务或碳逻辑。',
  );
}

function readSlotSelection(slot, card) {
  if (slot.kind === 'multi') {
    const values = [
      ...card.querySelectorAll('input[data-multi="true"]:checked'),
    ]
      .map((input) => input.value)
      .filter(Boolean);
    return values.length ? values : null;
  }

  if (slot.kind === 'single') {
    const value = card.querySelector('[data-field="selection"]').value;
    return value || null;
  }

  const fields = {};
  for (const input of card.querySelectorAll('[data-field]')) {
    if (input.value === '') return null;
    fields[input.dataset.field] =
      input.type === 'number' ? Number(input.value) : input.value;
  }
  return Object.keys(fields).length ? fields : null;
}

function restoreDraftControls(slot, card) {
  const draft = state.drafts[slot.id];
  if (!draft) return;

  if (slot.kind === 'multi' && Array.isArray(draft.selection)) {
    for (const input of card.querySelectorAll('input[data-multi="true"]'))
      input.checked = draft.selection.includes(input.value);
  } else if (slot.kind === 'single' && typeof draft.selection === 'string') {
    card.querySelector('[data-field="selection"]').value = draft.selection;
  } else if (
    typeof draft.selection === 'object' &&
    draft.selection !== null &&
    !Array.isArray(draft.selection)
  ) {
    for (const input of card.querySelectorAll('[data-field]')) {
      const value = draft.selection[input.dataset.field];
      if (value !== undefined) input.value = String(value);
    }
  }
}

function renderFacts(workspace) {
  const list = document.getElementById('fact-list');
  list.replaceChildren();

  if (!workspace.facts.length) {
    const empty = document.createElement('article');
    empty.className = 'fact-card';
    empty.innerHTML =
      '<strong>本工作区没有新增 Carbon Truth</strong>' +
      '<small>决策意图不会自动制造事实。请继续查看后续受治理工作区。</small>';
    list.append(empty);
    return;
  }

  workspace.facts.forEach((fact) => {
    const card = document.createElement('article');
    card.className = 'fact-card';

    const label = document.createElement('small');
    label.textContent = fact.label;

    const value = document.createElement('strong');
    value.textContent =
      fact.status === 'UNRESOLVED'
        ? 'UNRESOLVED'
        : fact.value + (fact.unit ? ' ' + fact.unit : '');

    const meta = document.createElement('div');
    meta.className = 'fact-meta';
    meta.append(statusBadge(fact.status), smallTag(fact.provenance));

    const source = document.createElement('small');
    source.textContent = 'Source · ' + fact.sourceReference;

    card.append(label, value, meta, source);
    list.append(card);
  });
}

function renderAuthority(workspace) {
  const list = document.getElementById('authority-list');
  list.replaceChildren();

  workspace.slots.forEach((slot) => {
    const item = document.createElement('article');
    item.className = 'authority-item';
    const title = document.createElement('b');
    title.textContent = slot.id + ' · ' + slot.effectStatus;
    const note = document.createElement('span');
    note.textContent = slotNote(slot);
    item.append(title, note);
    list.append(item);
  });
}

function renderTeachingEvidence() {
  const projection = requireProjection();

  const roles = document.getElementById('role-list');
  projection.roles.forEach((role) => roles.append(chip(role)));

  const feedback = document.getElementById('feedback-list');
  projection.feedbackCategories.forEach((item) => feedback.append(chip(item)));

  const expressions = document.getElementById('role-expression-list');
  projection.interaction.roleExpressionFields.forEach((item) =>
    expressions.append(chip(item)),
  );
  document.getElementById('role-rotation-status').textContent =
    'Role rotation · ' +
    projection.interaction.roleRotation.trigger +
    ' · annualPhaseMapping = null · ' +
    projection.interaction.roleRotation.status;

  const mistake = document.getElementById('mistake-chain');
  projection.interaction.meaningfulMistake.chain.forEach((item, index) => {
    const span = document.createElement('span');
    span.textContent = (index > 0 ? '→ ' : '') + humanize(item);
    mistake.append(span);
  });

  document.getElementById('explainability-status').textContent =
    '0–4 · ' +
    projection.interaction.explainability.authority +
    ' · AI authoritative = ' +
    String(projection.interaction.explainability.aiAuthoritative);

  document.getElementById('next-cycle-authorization').textContent =
    'D19: ' +
    projection.interaction.nextCycleAuthorization.D19 +
    ' · D20: ' +
    projection.interaction.nextCycleAuthorization.D20;

  const knowledge = document.getElementById('knowledge-list');
  projection.knowledgeCards.forEach((card) => {
    const row = document.createElement('div');
    row.className = 'knowledge-card';
    row.innerHTML =
      '<span><b>' +
      escapeHtml(card.id) +
      '</b> · ' +
      escapeHtml(card.title) +
      '</span><span>' +
      escapeHtml(card.contentStatus) +
      '</span>';
    knowledge.append(row);
  });
}

function renderModelStatus() {
  const projection = requireProjection();
  const validation = document.getElementById('validation-list');
  Object.entries(projection.validation).forEach(([key, status]) => {
    const item = document.createElement('div');
    item.className = 'validation-card';
    item.append(document.createTextNode(key + ' · '), statusBadge(status));
    validation.append(item);
  });

  const policies = document.getElementById('open-policy-list');
  projection.openPolicyReferences.forEach((ref) => {
    const item = document.createElement('div');
    item.className = 'policy-card';
    item.textContent = ref + ' · OPEN';
    policies.append(item);
  });
}

function openEvidenceDialog() {
  const projection = requireProjection();
  const dialog = document.getElementById('evidence-dialog');
  const content = document.getElementById('evidence-content');
  content.replaceChildren();

  const overview = document.createElement('div');
  overview.className = 'evidence-entry';
  overview.innerHTML =
    '<b>Projection authority</b><p>' +
    escapeHtml(projection.sourceReference) +
    '</p><code>' +
    escapeHtml(projection.sourceHead) +
    '</code>';
  content.append(overview);

  const sources = new Set();
  projection.workspaces.forEach((workspace) =>
    workspace.facts.forEach((fact) => sources.add(fact.sourceReference)),
  );
  projection.evidenceReferences?.forEach((source) => sources.add(source));
  [...sources].forEach((source) => {
    const item = document.createElement('div');
    item.className = 'evidence-entry';
    item.innerHTML =
      '<b>Evidence / source</b><p><code>' + escapeHtml(source) + '</code></p>';
    content.append(item);
  });

  const limits = document.createElement('div');
  limits.className = 'evidence-entry';
  limits.innerHTML =
    '<b>Current limitation</b>' +
    '<p>A1 Scale-200 governed adapter remains UNRESOLVED; A3 production remains BLOCKED_POLICY; some A4 paths remain UNRESOLVED; D17/D18 direct execution remains CONFORMANCE_DRIFT.</p>';
  content.append(limits);

  if (typeof dialog.showModal === 'function') dialog.showModal();
}

function resetDrafts() {
  state.drafts = {};
  persistDrafts();
  renderWorkspace();
}

function currentWorkspace() {
  const projection = requireProjection();
  const workspace = projection.workspaces.find(
    (item) => item.id === state.activeWorkspace,
  );
  if (!workspace) throw new Error('Unknown workspace.');
  return workspace;
}

function deriveWorstStatus(slots) {
  const priority = [
    'CONFORMANCE_DRIFT',
    'BLOCKED_POLICY',
    'UNRESOLVED',
    'CAPTURE_ONLY',
    'EXECUTABLE_GOVERNED',
  ];
  return (
    priority.find((status) =>
      slots.some(
        (slot) => slot.captureStatus === status || slot.effectStatus === status,
      ),
    ) || 'CAPTURE_ONLY'
  );
}

function slotNote(slot) {
  switch (slot.effectStatus) {
    case 'CONFORMANCE_DRIFT':
      return '已恢复批准目录，但当前 v1 直接执行边界存在一致性漂移；本页只保存 UI_DRAFT。';
    case 'BLOCKED_POLICY':
      return '决策目录已批准；依赖的生产策略/参数仍 OPEN，因此后果保持 BLOCKED_POLICY。';
    case 'UNRESOLVED':
      return '决策目录已批准；v1 执行映射尚无充分治理依据，因此保持 UNRESOLVED。';
    case 'EXECUTABLE_GOVERNED':
      return '已有治理边界可执行。';
    case 'CAPTURE_ONLY':
    default:
      return '本阶段只保留决策意图/草稿，不制造数值后果。';
  }
}

function statusBadge(status) {
  const span = document.createElement('span');
  span.className = 'status-badge status-' + status;
  span.textContent = status;
  return span;
}

function smallTag(text) {
  const span = document.createElement('span');
  span.className = 'tag draft';
  span.textContent = text;
  return span;
}

function chip(text) {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

function updateDraftNote(slotId, text) {
  const target = document.querySelector('[data-draft-status="' + slotId + '"]');
  if (target) target.textContent = text;
}

function draftStatusText(slotId) {
  return state.drafts[slotId]
    ? '已存在本机 UI_DRAFT；未形成正式执行结果。'
    : '尚未保存草稿。';
}

function readDrafts() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistDrafts() {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state.drafts));
  } catch {
    // Browser storage is convenience only; failure must not affect governed data.
  }
}

function requireProjection() {
  if (!state.projection) throw new Error('Projection not loaded.');
  return state.projection;
}

function renderFatal(message) {
  document.body.innerHTML =
    '<main style="padding:2rem;font-family:system-ui"><h1>Phase-A projection unavailable</h1><p>' +
    escapeHtml(message) +
    '</p><p>No fallback data was invented.</p></main>';
}

function humanize(value) {
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function shortRef(value) {
  return value.length > 12 ? value.slice(0, 12) : value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
