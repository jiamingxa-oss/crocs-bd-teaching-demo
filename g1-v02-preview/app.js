import { mountG1, createG1Callbacks, displayText } from './g1-view.js?v=ee6bac3793f4dd92bc949d67faba0a75e3ebf8b7b72402eda055da756e2f2491';
import {
  buildSimUi2BrowserDraft,
  buildSimUi3ProductionBrowserDraft,
  formatGovernedBrowserValue,
} from './sim-ui2-browser-draft.js';

/* global document, fetch, crypto, TextEncoder, Option */
const LIFECYCLE = ['DRAFT', 'PREVIEW', 'CONFIRMED', 'LOCKED'];
const P2_STAGES = ['C1 看得见', 'C2 分得准', 'C3 认得够'];
const WORKBENCHES = [
  [
    'P1',
    'BUSINESS_DECISION',
    '经营 · Business',
    'takeover',
    'CEO',
    [
      'GLOBAL KPI SHELL',
      'ANNUAL RESOURCE / BUSINESS PLAN',
      'SAME-YEAR BUDGET REFERENCE',
    ],
  ],
  [
    'P2',
    'COMMITMENT',
    '确碳 · Commitment',
    'commitment',
    'CCO',
    [
      'C1 看得见 · VISIBILITY',
      'C2 分得准 · ALLOCATION',
      'C3 认得够 · RECOGNITION',
      'MEASUREMENT CONFIDENCE',
      'ALLOCATION CONFIDENCE',
    ],
  ],
  [
    'P3',
    'REDUCTION',
    '减碳 · Reduction',
    'reduction',
    'COO',
    [
      'GREEN POWER PROCUREMENT',
      'EQUIPMENT EFFICIENCY RETROFIT',
      'PROCESS & ENERGY MANAGEMENT',
      'FULL PRODUCTION-LINE UPGRADE',
      'LOW-CARBON MATERIAL / SUPPLIER',
      'INVESTMENT',
      'CAPABILITY',
      'ACTUAL REDUCTION',
    ],
  ],
  [
    'P4',
    'OFFSET',
    '抵碳 · Offsets',
    'offset',
    'CCO + CFO',
    [
      'RESIDUAL',
      'ALLOWANCE LEDGER',
      'OFFSET LEDGER',
      'BUY / USE / SELL / BANK',
      'SETTLEMENT',
    ],
  ],
  [
    'P5',
    'COMMUNICATION',
    '披碳 · Communication',
    'communication',
    'CEO / CCO / CMO',
    [
      'FACT LAYER',
      'COMMUNICATION LAYER',
      'PUBLICATION',
      'VERIFICATION',
      'CORRECTION',
    ],
  ],
  [
    'P6',
    'STIMULATION',
    '激碳 · Stimulation',
    'stimulation',
    'CMO → CEO',
    [
      'ANNUAL RESULT',
      'CUSTOMER FEEDBACK',
      'EMPLOYEE FEEDBACK',
      'QUALIFICATION',
      'CAUSAL DEBRIEF',
      'NEXT CYCLE',
      'SIX-YEAR FINAL REVIEW',
    ],
  ],
];
const state = {
  projection: null,
  active: 0,
  unlocked: 0,
  year: 1,
  lifecycle: WORKBENCHES.map(() => 0),
  p2: 0,
  uiDrafts: {},
  d6Selection: new Set(),
  draftSequence: 0,
};
let g1;
void start();
async function start() {
  const response = await fetch('./projection.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Governed projection could not be loaded.');
  state.projection = await response.json();
  g1 = mountG1(document, {
    getState: () => state,
    ...createG1Callbacks(document, state, render),
  });
  bind();
  render();
}
function bind() {
  document.querySelector('#advance').addEventListener('click', advance);
  document.querySelector('#back').addEventListener('click', () => {
    if (state.active > 0) {
      state.active -= 1;
      render();
    }
  });
  document
    .querySelector('#confirm-p2-substage')
    .addEventListener('click', () => {
      if (state.p2 < 3) {
        state.p2 += 1;
        render();
      }
    });
  document
    .querySelector('#open-evidence')
    .addEventListener('click', openEvidence);
}
function render() {
  const d = WORKBENCHES[state.active];
  const w = state.projection.workspaces.find((item) => item.id === d[1]);
  setText('#year-label', `第 ${state.year} 年 / 共 6 年`);
  setText('#flow-label', d[2].split(' · ')[0]);
  setText('#scene-index', d[0]);
  setText('#scene-title', d[2]);
  setText('#role-lead', d[4]);
  const art = document.querySelector('#scene-art');
  art.dataset.sceneAsset = d[3];
  art.dataset.sceneLabel = d[2].split(' · ')[0];
  art.setAttribute('aria-label', `${d[2]}情境占位，已批准素材待补`);
  setText('#workspace-code', `${d[0]} · 情境 → 决策 → 后果`);
  document
    .querySelector('#workspace-code')
    .append(` · ${d[2].split(' · ')[1]}`);
  setText('#workspace-title', `${d[2].split(' · ')[0]}工作台`);
  setText('#lifecycle', LIFECYCLE[state.lifecycle[state.active]]);
  renderNav();
  renderCards('#structural-homes', d[5], 'STRUCTURAL HOME');
  renderDecisions(w);
  renderTeaching(w);
  renderP2();
  renderSimUi2();
  renderSimUi3();
  renderSimUi4();
  document.querySelector('#back').disabled = state.active === 0;
  const locked = state.lifecycle[state.active] === 3;
  const p2Pending =
    state.active === 1 && state.p2 < 3 && state.lifecycle[1] >= 2;
  setText(
    '#gate-status',
    p2Pending
      ? `暂不能锁定：请先在确碳工作台确认 ${P2_STAGES[state.p2]}，依次完成 C1 → C2 → C3。`
      : locked
        ? 'LOCKED · reading does not reopen or mutate this workbench'
        : `${d[0]} · ${LIFECYCLE[state.lifecycle[state.active]]} · current approved shell gate`,
  );
  setText('#advance', lifecycleAction());
  document.querySelector('#advance').disabled = p2Pending;
  g1.update();
}
function renderSimUi4() {
  const panel = document.querySelector('#sim-ui4-panel');
  panel.hidden = state.active !== 5;
  if (panel.hidden) return;
  const ui4 = state.projection.simUi4;
  const content = document.querySelector('#sim-ui4-content');
  content.replaceChildren();
  renderGovernedHomes(content, ui4.informationHomes);
  const anchor = ui4.currentAnchor;
  content.append(
    card(
      `${anchor.primaryWorkbench} · decisions ${anchor.decisionSlotIds.join(' / ')} · context only · no event-engine truth authority`,
      `CURRENT ANCHOR · ${anchor.anchorId}`,
    ),
    card(
      ui4.anchors.map((item) => `Y${item.year} ${item.anchorId}`).join(' → '),
      'READ-ONLY SIX-YEAR ANCHOR TIMELINE',
    ),
    decisionControl('D19', ui4.captureCatalog.D19),
    d20Control(ui4),
    card(
      `${ui4.authorizationStatus} · bundle ${ui4.bundleStatus} · closing ${ui4.closingStatus} · successor ${ui4.successorStatus}`,
      'A03 AUTHORITY / CLOSING GATE',
    ),
    card(
      `${ui4.cipi.status} / ${ui4.cipi.usage} · value null · ${ui4.cipi.limitation}`,
      ui4.cipi.identity,
    ),
  );
}
function d20Control(ui4) {
  const root = card(
    'All four learner inputs are mandatory; no default.',
    'D20 UI_DRAFT',
  );
  const ambition = explicitSelect(
    ui4.captureCatalog.D20,
    '-- Please select ambition --',
  );
  ambition.setAttribute('aria-label', 'D20 承诺水平（ambition）');
  const inputs = ['target', 'capabilityGap', 'budgetIntent'].map((name) => {
    const input = document.createElement('input');
    input.name = name;
    input.placeholder = displayText(name);
    input.setAttribute('aria-label', `D20 ${displayText(name)}`);
    return input;
  });
  const button = document.createElement('button');
  const output = document.createElement('output');
  button.type = 'button';
  button.textContent = displayText('Preview D20');
  button.addEventListener('click', async () => {
    await captureBrowserDraft(
      'D20',
      {
        ambition: ambition.value,
        target: inputs[0].value,
        capabilityGap: inputs[1].value,
        budgetIntent: inputs[2].value,
      },
      output,
    );
  });
  const saved = state.uiDrafts.D20;
  if (saved) {
    ambition.value = saved.selection.ambition;
    inputs.forEach((input) => {
      input.value = saved.selection[input.name];
    });
    showDraft(output, saved);
  }
  const locked = state.lifecycle[5] === 3;
  ambition.disabled = locked;
  inputs.forEach((input) => {
    input.disabled = locked;
  });
  button.disabled = locked;
  root.append(ambition, ...inputs, button, output);
  return root;
}
function renderSimUi3() {
  const panel = document.querySelector('#sim-ui3-panel');
  panel.hidden = state.active !== 3 && state.active !== 4;
  if (panel.hidden) return;
  const ui3 = state.projection.simUi3;
  const content = document.querySelector('#sim-ui3-content');
  content.replaceChildren();
  if (state.active === 3) {
    setText('#sim-ui3-title', 'P4 · Offsets governed projection');
    setText(
      '#sim-ui3-boundary',
      'Actual Reduction ≠ Allowance ≠ Offset · Bank = closing → successor opening · Bank ≠ revenue',
    );
    renderGovernedHomes(content, ui3.offset.informationHomes);
    content.append(
      decisionControl('D11', ui3.offset.captureCatalog.D11),
      decisionControl('D12', ui3.offset.captureCatalog.D12),
    );
  } else {
    setText('#sim-ui3-title', 'P5 · Communication governed projection');
    setText(
      '#sim-ui3-boundary',
      'Fact Layer ≠ Communication Layer · FLAGGED ≠ CONFIRMED_VIOLATION · missing evidence ≠ violation',
    );
    renderCardsInto(
      content,
      ui3.communication.productBlocks,
      'ORDERED PRODUCT BLOCK',
    );
    renderCardsInto(
      content,
      [
        `Adapter capability · ${ui3.communication.adapterCapability}`,
        `D17 execution · ${ui3.communication.executionReadiness.D17}`,
        `D18 execution · ${ui3.communication.executionReadiness.D18}`,
      ],
      'CAPABILITY ≠ EXECUTION READINESS',
    );
    renderGovernedHomes(content, ui3.communication.informationHomes);
    content.append(
      multiDecisionControl('D13', ui3.communication.captureCatalog.D13),
      communicationCatalogControl('D14', ui3.communication),
      communicationCatalogControl('D15', ui3.communication),
      communicationCatalogControl('D16', ui3.communication),
      decisionControl('D17', ui3.communication.captureCatalog.D17),
      decisionControl('D18', ui3.communication.captureCatalog.D18),
    );
  }
}
function renderGovernedHomes(content, homes) {
  homes.forEach((home) =>
    content.append(
      card(
        `${home.status} · value ${formatGovernedBrowserValue(home.value)} · authority ${home.authority} · ${home.limitation} · sources ${home.sourceReferences.join(', ')}`,
        home.homeId,
      ),
    ),
  );
}
function blockedCatalogControl(slotId) {
  return card(
    'BLOCKED_POLICY · value null · no Production-approved catalog; TEST/FIXTURE is not student-active',
    `${slotId} UI_DRAFT`,
  );
}
function communicationCatalogControl(slotId, communication) {
  if (communication.productionCatalogStatus[slotId] !== 'PRODUCTION_AVAILABLE')
    return blockedCatalogControl(slotId);
  if (slotId !== 'D16')
    return productionDecisionControl(
      slotId,
      communication.captureCatalog[slotId],
      communication,
    );
  const root = card(
    'D16 governed Production UI draft',
    'NON-AUTHORITATIVE CAPTURE',
  );
  const evidence = explicitSelect(
    communication.captureCatalog.D16_EVIDENCE,
    '-- Please select evidence --',
  );
  const intensity = explicitSelect(
    communication.captureCatalog.D16_INTENSITY,
    '-- Please select intensity --',
  );
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = displayText('Preview D16');
  const output = document.createElement('output');
  const saved = state.uiDrafts.D16;
  if (saved) {
    evidence.value = saved.selection.evidence;
    intensity.value = saved.selection.intensity;
    showDraft(output, saved);
  }
  evidence.disabled =
    intensity.disabled =
    button.disabled =
      isCurrentWorkbenchLocked();
  button.addEventListener(
    'click',
    () =>
      void captureProductionBrowserDraft(
        'D16',
        { evidence: evidence.value, intensity: intensity.value },
        communication,
        output,
      ),
  );
  root.append(evidence, intensity, button, output);
  return root;
}
function explicitSelect(options, placeholder) {
  const select = document.createElement('select');
  select.append(new Option(displayText(placeholder), ''));
  options.forEach((option) =>
    select.append(new Option(displayText(option), option)),
  );
  return select;
}
function productionDecisionControl(slotId, options, communication) {
  const root = card(
    `${slotId} governed Production UI draft`,
    'NON-AUTHORITATIVE CAPTURE',
  );
  const select = explicitSelect(options, '-- Please select --');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = displayText(`Preview ${slotId}`);
  const output = document.createElement('output');
  const saved = state.uiDrafts[slotId];
  if (saved) {
    select.value = saved.selection;
    showDraft(output, saved);
  }
  select.disabled = button.disabled = isCurrentWorkbenchLocked();
  button.addEventListener(
    'click',
    () =>
      void captureProductionBrowserDraft(
        slotId,
        select.value,
        communication,
        output,
      ),
  );
  root.append(select, button, output);
  return root;
}
async function captureProductionBrowserDraft(
  slotId,
  selection,
  communication,
  output,
) {
  try {
    if (isCurrentWorkbenchLocked())
      throw new Error('Locked workbench is read-only.');
    const workspace = state.projection.workspaces.find(
      (item) => item.id === 'COMMUNICATION',
    );
    const slot = workspace.slots.find((item) => item.id === slotId);
    const draft = await buildSimUi3ProductionBrowserDraft({
      draftId: `browser:${slotId}:${String(state.draftSequence + 1)}`,
      slotId,
      selection,
      captureStatus: slot.captureStatus,
      effectStatus: slot.effectStatus,
      contextReference:
        communication.productionCatalogProvenance[
          slotId === 'D16' ? 'D16_EVIDENCE' : slotId
        ].contextReference,
      catalogs: communication.productionCatalogProvenance,
      sha256,
    });
    state.draftSequence += 1;
    state.uiDrafts[slotId] = draft;
    showDraft(output, draft);
  } catch (error) {
    output.textContent = displayText(`REJECTED · ${error.message}`);
  }
}
function multiDecisionControl(slotId, options) {
  const root = card(`${slotId} governed UI draft`, 'NON-AUTHORITATIVE CAPTURE');
  const selected = new Set(
    Array.isArray(state.uiDrafts[slotId]?.selection)
      ? state.uiDrafts[slotId].selection
      : [],
  );
  options.forEach((option) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = option;
    input.checked = selected.has(option);
    input.disabled = isCurrentWorkbenchLocked();
    input.addEventListener('change', () =>
      input.checked ? selected.add(option) : selected.delete(option),
    );
    label.append(input, displayText(option));
    root.append(label);
  });
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = displayText(`Preview ${slotId}`);
  button.disabled = isCurrentWorkbenchLocked();
  const output = document.createElement('output');
  if (state.uiDrafts[slotId]) showDraft(output, state.uiDrafts[slotId]);
  button.addEventListener(
    'click',
    () => void captureBrowserDraft(slotId, [...selected], output),
  );
  root.append(button, output);
  return root;
}
function renderNav() {
  const nav = document.querySelector('#workspace-nav');
  nav.replaceChildren();
  WORKBENCHES.forEach((item, index) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = displayText(`${item[0]} ${item[2].split(' · ')[0]}`);
    b.disabled = index > state.unlocked;
    if (index === state.active) b.setAttribute('aria-current', 'page');
    b.addEventListener('click', () => {
      state.active = index;
      render();
    });
    nav.append(b);
  });
}
function renderDecisions(workspace) {
  const list = document.querySelector('#decision-list');
  list.replaceChildren();
  workspace.slots.forEach((slot) => {
    const el = card(slot.name, slot.id);
    el.className = 'decision-card';
    const badge = document.createElement('span');
    const productionStatus =
      workspace.id === 'COMMUNICATION' &&
      ['D14', 'D15', 'D16'].includes(slot.id)
        ? state.projection.simUi3.communication.productionCatalogStatus[slot.id]
        : null;
    badge.textContent = displayText(
      productionStatus === 'PRODUCTION_AVAILABLE'
        ? `${productionStatus} · downstream ${state.projection.simUi3.communication.productionDownstreamReadiness[slot.id]}`
        : blockedStatus(slot.effectStatus),
    );
    el.append(badge);
    const draft = document.createElement('small');
    draft.textContent = displayText('UI_DRAFT · no executed fact');
    el.append(draft);
    list.append(el);
  });
}
function renderTeaching(workspace) {
  renderChips('#role-list', state.projection.roles);
  renderChips(
    '#role-expression-list',
    state.projection.interaction.roleExpressionFields,
  );
  setText(
    '#role-rotation-status',
    `Role guidance: ${state.projection.interaction.roleRotation.status} · ${state.projection.interaction.roleRotation.trigger}`,
  );
  renderCards(
    '#fact-list',
    workspace.facts.map(
      (f) => `${f.label}: ${f.value ?? f.status}${f.unit ? ' ' + f.unit : ''}`,
    ),
    'READ ONLY',
  );
  renderChips(
    '#mistake-chain',
    state.projection.interaction.meaningfulMistake.chain,
  );
  setText(
    '#explainability-status',
    `Explainability: ${state.projection.interaction.explainability.authority}; AI authoritative = ${String(state.projection.interaction.explainability.aiAuthoritative)}`,
  );
  setText(
    '#next-cycle-authorization',
    `Next-cycle authorization: D19 / D20 = ${state.projection.interaction.nextCycleAuthorization.D19}`,
  );
  renderCards(
    '#validation-list',
    Object.entries(state.projection.validation).map(([k, v]) => `${k}: ${v}`),
    'MODEL STATUS',
  );
  renderCards(
    '#open-policy-list',
    state.projection.openPolicyReferences,
    'OPEN / BLOCKED_BY_DESIGN',
  );
  const p = state.projection;
  document.querySelector('#provenance').innerHTML =
    `<dt>数据基线</dt><dd>${escapeHtml(p.dataBaselineHead)}</dd><dt>设计依据</dt><dd>${escapeHtml(p.designAuthorityReference)}</dd><dt>实现版本</dt><dd>${escapeHtml(p.implementationHead ?? p.implementationHeadStatus)}</dd>`;
}
function renderP2() {
  const panel = document.querySelector('#p2-gate');
  panel.hidden = state.active !== 1;
  if (panel.hidden) return;
  const statuses =
    state.p2 === 0
      ? ['ACTIVE', 'LOCKED', 'LOCKED']
      : state.p2 === 1
        ? ['CONFIRMED', 'ACTIVE', 'LOCKED']
        : state.p2 === 2
          ? ['CONFIRMED', 'CONFIRMED', 'ACTIVE']
          : ['CONFIRMED', 'CONFIRMED', 'CONFIRMED'];
  const labels = ['C1 Visibility', 'C2 Allocation', 'C3 Recognition'];
  const container = document.querySelector('#p2-substages');
  container.replaceChildren();
  labels.forEach((label, index) => {
    const el = card(label, statuses[index]);
    el.dataset.status = statuses[index];
    container.append(el);
  });
  setText(
    '#p2-baseline-status',
    state.p2 === 3
      ? 'Annual Carbon Responsibility Baseline · FORMED (shell state only)'
      : 'Annual Carbon Responsibility Baseline · NOT FORMED (not zero)',
  );
  document.querySelector('#confirm-p2-substage').disabled = state.p2 === 3;
  setText(
    '#confirm-p2-substage',
    state.p2 === 3 ? '三个子阶段已确认' : `确认 ${P2_STAGES[state.p2]}`,
  );
  setText(
    '#p2-guidance',
    state.p2 === 3
      ? 'C1 → C2 → C3 已确认，可继续底部流程；子阶段确认不代表生成碳事实。'
      : `当前待确认：${P2_STAGES[state.p2]}。请依次完成三个子阶段，再锁定确碳工作台。`,
  );
}
function renderSimUi2() {
  const panel = document.querySelector('#sim-ui2-panel');
  panel.hidden = state.active !== 1 && state.active !== 2;
  if (panel.hidden) return;
  const ui2 = state.projection.simUi2;
  const content = document.querySelector('#sim-ui2-content');
  content.replaceChildren();
  if (state.active === 1) {
    setText('#sim-ui2-title', 'P2 · Commitment governed controls');
    setText(
      '#sim-ui2-boundary',
      'D3/D4 use governed identities. Measurement Confidence ≠ Allocation Confidence. Missing controls fail closed with null.',
    );
    renderP2InformationHomes(content, ui2);
    renderCardsInto(
      content,
      Object.entries(ui2.commitment.blockedControls).map(
        ([item, blocked]) =>
          `${item} · ${blocked.reason} · value ${String(blocked.value)}`,
      ),
      'MISSING AUTHORITY / PARAMETER',
    );
    content.append(
      decisionControl('D3', ui2.commitment.captureCatalog.D3),
      structuredD4Control(ui2.commitment.captureCatalog),
    );
  } else {
    setText('#sim-ui2-title', 'P3 · D6 Reduction Portfolio');
    setText(
      '#sim-ui2-boundary',
      'D5 / D6 / D7 / D10 remain separate. Portfolio selection never creates Actual Reduction.',
    );
    ui2.reduction.d6.activePortfolioItems.forEach((item) => {
      const el = card(item, 'CURRENT TEACHING V1 · D6');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('aria-label', displayText(item));
      input.checked = state.d6Selection.has(item);
      input.disabled = isCurrentWorkbenchLocked();
      input.addEventListener('change', () => {
        if (input.checked) state.d6Selection.add(item);
        else state.d6Selection.delete(item);
      });
      el.prepend(input);
      content.append(el);
    });
    renderCardsInto(
      content,
      [
        `Plan: ${ui2.reduction.planLifecycle.join(' → ')}`,
        `Effect: ${ui2.reduction.effectLifecycle.join(' → ')}`,
        'Project economics / effects / timing · MISSING_PARAMETER · value null',
        'Actual Reduction · READ ONLY · Carbon Core authority',
      ],
      'SEPARATE GOVERNED IDENTITY',
    );
    content.append(
      decisionControl('D5', ui2.reduction.captureCatalog.D5),
      d6Control(),
      decisionControl('D7', ui2.reduction.captureCatalog.D7),
      decisionControl('D10', ui2.reduction.captureCatalog.D10),
    );
  }
}
function renderP2InformationHomes(content, ui2) {
  ui2.commitment.informationHomes.forEach((home) => {
    const shell =
      home.homeId === 'RESPONSIBILITY_BASELINE'
        ? ` · ${state.p2 === 3 ? 'FORMED' : 'NOT FORMED'}`
        : '';
    content.append(
      card(
        `${home.status}${shell} · value ${String(home.value)} · ${home.limitation} · sources ${home.sourceReferences.join(', ')}`,
        home.homeId,
      ),
    );
  });
}
function decisionControl(slotId, options) {
  const root = card(`${slotId} governed UI draft`, 'NON-AUTHORITATIVE CAPTURE');
  root.id = `g1-control-${slotId}`;
  root.tabIndex = -1;
  const select = document.createElement('select');
  select.setAttribute('aria-label', `${slotId} 明确选择`);
  select.append(new Option('请选择', ''));
  options.forEach((option) =>
    select.append(
      new Option(
        slotId === 'D7' && option === 'MEDIUM'
          ? '中期（MEDIUM）'
          : displayText(option),
        option,
      ),
    ),
  );
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = displayText(`Preview ${slotId}`);
  const output = document.createElement('output');
  const saved = state.uiDrafts[slotId];
  if (saved) {
    select.value = saved.selection;
    showDraft(output, saved);
  }
  select.disabled = isCurrentWorkbenchLocked();
  button.disabled = isCurrentWorkbenchLocked();
  button.addEventListener(
    'click',
    () => void captureBrowserDraft(slotId, select.value, output),
  );
  root.append(select, button, output);
  return root;
}
function structuredD4Control(catalog) {
  const root = card('D4 governed UI draft', 'NON-AUTHORITATIVE CAPTURE');
  const domain = document.createElement('select');
  const intensity = document.createElement('select');
  domain.append(new Option('请选择领域', ''));
  intensity.append(new Option('请选择强度', ''));
  catalog.D4_DOMAIN.forEach((option) =>
    domain.append(new Option(displayText(option), option)),
  );
  catalog.D4_INTENSITY.forEach((option) =>
    intensity.append(new Option(displayText(option), option)),
  );
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = displayText('Preview D4');
  const output = document.createElement('output');
  const saved = state.uiDrafts.D4;
  if (saved) {
    domain.value = saved.selection.domain;
    intensity.value = saved.selection.intensity;
    showDraft(output, saved);
  }
  domain.disabled = isCurrentWorkbenchLocked();
  intensity.disabled = isCurrentWorkbenchLocked();
  button.disabled = isCurrentWorkbenchLocked();
  button.addEventListener(
    'click',
    () =>
      void captureBrowserDraft(
        'D4',
        { domain: domain.value, intensity: intensity.value },
        output,
      ),
  );
  root.append(domain, intensity, button, output);
  return root;
}
function d6Control() {
  const root = card(
    'D6 governed portfolio UI draft',
    'NON-AUTHORITATIVE CAPTURE',
  );
  root.id = 'g1-control-D6';
  root.tabIndex = -1;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = displayText('Preview D6 portfolio');
  const output = document.createElement('output');
  const saved = state.uiDrafts.D6;
  if (saved) showDraft(output, saved);
  button.disabled = isCurrentWorkbenchLocked();
  button.addEventListener(
    'click',
    () => void captureBrowserDraft('D6', [...state.d6Selection], output),
  );
  root.append(button, output);
  return root;
}
async function captureBrowserDraft(slotId, selection, output) {
  try {
    if (isCurrentWorkbenchLocked())
      throw new Error('Locked workbench is read-only.');
    const workspace = state.projection.workspaces.find((item) =>
      item.slots.some((slot) => slot.id === slotId),
    );
    const slot = workspace?.slots.find((item) => item.id === slotId);
    if (!slot) throw new Error(`Unknown governed slot ${slotId}`);
    const ui2 = state.projection.simUi2;
    const catalog = {
      ...ui2.commitment.captureCatalog,
      ...ui2.reduction.captureCatalog,
      ...state.projection.simUi3.offset.captureCatalog,
      ...state.projection.simUi3.communication.captureCatalog,
      ...state.projection.simUi4.captureCatalog,
    };
    const draftId = `browser:${slotId}:${String(state.draftSequence + 1)}`;
    const draft = await buildSimUi2BrowserDraft({
      draftId,
      slotId,
      selection,
      workspace: workspace.id,
      captureStatus: slot.captureStatus,
      effectStatus: slot.effectStatus,
      catalog,
      sha256,
    });
    state.draftSequence += 1;
    state.uiDrafts[slotId] = draft;
    if (slotId === 'D6') state.d6Selection = new Set(draft.selection);
    showDraft(output, draft);
  } catch (error) {
    output.textContent = displayText(`REJECTED · ${error.message}`);
  }
}
function showDraft(output, draft) {
  const admission = draft.catalogAdmissionStatus
    ? ` · catalog ${draft.catalogAdmissionStatus} · downstream ${draft.downstreamExecutionReadiness}`
    : '';
  output.textContent = displayText(
    `${draft.slotId} · ${draft.captureStatus} / ${draft.effectStatus}${admission} · UI_DRAFT · non-authoritative · ${draft.reference} · no executed fact`,
  );
}
function isCurrentWorkbenchLocked() {
  return state.lifecycle[state.active] === 3;
}
async function sha256(value) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
function advance() {
  const current = state.lifecycle[state.active];
  if (current < 3) {
    state.lifecycle[state.active] = current + 1;
    render();
    return;
  }
  if (state.active < 5) {
    state.unlocked = Math.max(state.unlocked, state.active + 1);
    state.active += 1;
    render();
    return;
  }
  setText(
    '#gate-status',
    state.year === 6
      ? 'SIX_YEAR_FINAL_REVIEW · no Y7 created'
      : 'CLOSING · successor requires this ClosingState reference',
  );
  document.querySelector('#advance').disabled = true;
}
function lifecycleAction() {
  const current = LIFECYCLE[state.lifecycle[state.active]];
  if (current === 'DRAFT') return 'Create structural preview';
  if (current === 'PREVIEW') return 'Confirm decision shell';
  if (current === 'CONFIRMED') return 'Lock confirmed shell';
  return state.active === 5 ? 'Enter Closing' : 'Advance approved gate';
}
function openEvidence() {
  const content = document.querySelector('#evidence-content');
  content.replaceChildren();
  renderCardsInto(
    content,
    state.projection.evidenceReferences,
    'EVIDENCE SOURCE',
  );
  renderCardsInto(
    content,
    state.projection.knowledgeCards.map(
      (k) => `${k.id} ${k.title}: ${k.contentStatus}`,
    ),
    'LEARNING EVIDENCE',
  );
  document.querySelector('#evidence-dialog').showModal();
}
function blockedStatus(status) {
  return status === 'UNRESOLVED' || status === 'BLOCKED_POLICY'
    ? 'BLOCKED_BY_DESIGN'
    : status;
}
function renderCards(selector, names, kind) {
  const root = document.querySelector(selector);
  root.replaceChildren();
  renderCardsInto(root, names, kind);
}
function renderCardsInto(root, names, kind) {
  names.forEach((name) => root.append(card(name, kind)));
}
function renderChips(selector, names) {
  const root = document.querySelector(selector);
  root.replaceChildren();
  names.forEach((name) => {
    const span = document.createElement('span');
    span.textContent = displayText(name);
    root.append(span);
  });
}
function card(name, kind) {
  const el = document.createElement('article');
  const small = document.createElement('small');
  small.textContent = displayText(kind);
  const strong = document.createElement('b');
  strong.textContent = displayText(name);
  el.append(small, strong);
  return el;
}
function setText(selector, value) {
  document.querySelector(selector).textContent = displayText(value);
}
function escapeHtml(value) {
  const el = document.createElement('span');
  el.textContent = String(value);
  return el.innerHTML;
}
