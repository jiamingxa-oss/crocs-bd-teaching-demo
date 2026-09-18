/* global document */

const roles = {
  CEO: {
    name: 'CEO · 总经理',
    insight: '关注企业总体方向、现金安全与长期竞争力之间的平衡。',
  },
  CFO: {
    name: 'CFO · 财务负责人',
    insight: '关注现金、当期经营结果、投资支出与碳合规成本之间的资源约束。',
  },
  COO: {
    name: 'COO · 运营负责人',
    insight: '关注生产、设备、流程与能力投入能否真正转化为后续经营活动。',
  },
  CCO: {
    name: 'CCO · 碳管理负责人',
    insight: '关注 Carbon Truth、证据、减排与抵碳边界，以及治理一致性。',
  },
  CMO: {
    name: 'CMO · 市场负责人',
    insight: '关注产品碳、绿色市场机会、披露可信度与声誉的经济实现路径。',
  },
};

const rounds = [
  {
    no: 1,
    stage: 'COMMITMENT / 确碳',
    short: '接管企业',
    title: '接管BD汽车：先决定怎么经营，再承担碳责任',
    question: '资源有限。团队首先要形成企业经营姿态与碳管理承诺。',
    prompt: '本轮不是算碳，而是明确企业准备如何经营与配置资源。',
    leads: ['CEO', 'CFO', 'CCO'],
    slots: [
      ['D1', 'Initial Strategic Commitment', '初始战略承诺'],
      ['D2', 'Initial Resource Posture', '初始资源姿态'],
    ],
    resource: '战略承诺与资源姿态',
    market: '尚未进入市场竞争决策。',
    actualReduction: '尚未发生',
  },
  {
    no: 2,
    stage: 'COMMITMENT / 确碳',
    short: '碳事实危机',
    title: '数据出现冲突：你看到的数字，能不能直接当成碳事实？',
    question: '缺失、冲突与证据不足同时出现。团队必须先决定如何处理不确定性。',
    prompt: '选择本轮需要正式讨论的确碳决策议题。',
    leads: ['CCO', 'CFO'],
    slots: [
      ['D3', 'Data Uncertainty Response', '数据不确定性响应'],
      ['D4', 'Data / Evidence Remediation Priority', '数据与证据整改优先级'],
    ],
    resource: '数据 / 证据投入与现金',
    market: '市场暂不替代事实治理。',
    actualReduction: '尚未发生',
  },
  {
    no: 3,
    stage: 'REDUCTION / 减碳',
    short: '减排投资',
    title: '钱该花在哪里，能力什么时候才会变成真正的减排？',
    question: '现金、投资强度、技术组合和实现周期发生正面冲突。',
    prompt: '选择一个减排决策议题进入团队讨论；预览不会替你给出策略答案。',
    leads: ['COO', 'CFO', 'CCO'],
    slots: [
      ['D5', 'Reduction Investment Intensity', '减排投资强度'],
      ['D6', 'Reduction Portfolio', '减排组合'],
      ['D7', 'Investment Horizon', '投资期限'],
    ],
    resource: '投资支出、流动性与长期能力',
    market: '减排尚需经过活动事实与 Carbon Resolver。',
    actualReduction: '教材路径 19.600 t',
  },
  {
    no: 4,
    stage: 'REDUCTION / 减碳',
    short: '低碳竞争',
    title: '产品碳开始进入市场：低碳能力能不能换来订单？',
    question: '产品结构、产能与绿色市场机会必须同时考虑。',
    prompt: '本轮把产品与市场选择放到同一个经营问题里。',
    leads: ['CMO', 'COO', 'CCO'],
    slots: [
      ['D8', 'Product / Production Mix', '产品与生产组合'],
      ['D9', 'Market Targeting', '市场目标选择'],
      ['D10', 'Remaining Reduction Commitment', '剩余减排承诺'],
    ],
    resource: '产能、库存与市场机会',
    market: '绿色订单资格需要产品碳、证据与可供给能力。',
    actualReduction: '教材路径 19.600 t',
  },
  {
    no: 5,
    stage: 'OFFSET / 抵碳',
    short: '抵碳诱惑',
    title: '已经减过以后：买抵消，还是继续保留现金和减排能力？',
    question: '抵碳可以改善碳头寸，但不能改写 Actual Reduction。',
    prompt: '选择本轮的抵碳 / 碳资产决策议题。',
    leads: ['CFO', 'CCO', 'CEO'],
    slots: [
      ['D11', 'Offset Intensity', '抵碳强度'],
      ['D12', 'Carbon Asset Buffer', '碳资产缓冲'],
    ],
    resource: '碳资产现金流与剩余流动性',
    market: 'Offset ≠ Reduction；碳资产决策进入经营约束。',
    actualReduction: '教材路径 19.600 t',
  },
  {
    no: 6,
    stage: 'COMMUNICATION / 披碳',
    short: '披露与声誉',
    title: '有了事实以后：说什么、怎么说、什么时候说？',
    question: '传播可以创造认知与机会，但证据边界不能被营销覆盖。',
    prompt: '披碳由 WHAT × HOW/WHERE × WHEN × EVIDENCE × INTENSITY 共同构成。',
    leads: ['CMO', 'CCO', 'CFO'],
    slots: [
      ['D13', 'WHAT Disclosure', '披露什么'],
      ['D14', 'HOW / WHERE', '如何 / 在哪里披露'],
      ['D15', 'WHEN', '何时披露'],
      ['D16', 'Evidence × Communication Intensity', '证据 × 传播强度'],
    ],
    resource: '传播成本、证据与可信度',
    market: 'Reputation 只能经市场认知 / 准入 / 订单路径实现价值。',
    actualReduction: '教材路径 19.600 t',
  },
  {
    no: 7,
    stage: 'COMMUNICATION / 披碳',
    short: '核验与后果',
    title: '披露被核验：被标记不等于已经违规',
    question: '团队要在核验、纠正、信誉与市场后果之间做出治理响应。',
    prompt: '选择核验 / 披露纠正决策议题。FLAG 仍然不是 VIOLATION。',
    leads: ['CCO', 'CMO', 'CEO'],
    slots: [
      ['D17', 'Verification / Audit Response', '核验 / 审计响应'],
      ['D18', 'Disclosure Correction / Crisis', '披露纠正 / 危机响应'],
    ],
    resource: '核验整改成本与信任风险',
    market: 'SUPPORTED / FLAGGED / AMBIGUOUS 必须与已确认违规分开。',
    actualReduction: '教材路径 19.600 t',
  },
  {
    no: 8,
    stage: 'STIMULATION / 激碳',
    short: '激碳与下一周期',
    title: '这一轮结束了：企业真正学到了什么，下一周期承诺什么？',
    question:
      '经营、减排、产品碳、抵碳依赖、披露、能力与真诚度必须分维度复盘。',
    prompt:
      '形成 Next-cycle Strategic Priority 与 Next-cycle Commitment Ambition。',
    leads: ['CEO', 'CFO', 'COO', 'CCO', 'CMO'],
    slots: [
      ['D19', 'Next-cycle Strategic Priority', '下一周期战略优先级'],
      ['D20', 'Next-cycle Commitment Ambition', '下一周期承诺雄心'],
    ],
    resource: '跨周期承诺与能力延续',
    market: 'Next Commitment 是新决策，不是 Feedback 的自动复制。',
    actualReduction: '教材路径 19.600 t',
  },
];

const roundNav = document.querySelector('#round-nav');
const roleTabs = document.querySelector('#role-tabs');
const optionRoot = document.querySelector('#decision-options');
const lockButton = document.querySelector('#lock-preview');
let currentRound = 1;
let activeRole = 'CEO';
let selectedSlot = null;
let previewLocked = false;

function roundData() {
  return rounds[currentRound - 1];
}

function renderRoundNav() {
  roundNav.innerHTML = rounds
    .map(
      (round) => `
        <button class="round-button ${round.no === currentRound ? 'active' : ''}" data-round="${round.no}" aria-current="${round.no === currentRound ? 'step' : 'false'}">
          <span class="round-number">R${round.no}</span>
          <span class="round-copy"><b>${round.short}</b><small>${round.stage}</small></span>
        </button>`,
    )
    .join('');
}

function renderRoles() {
  const data = roundData();
  roleTabs.innerHTML = Object.keys(roles)
    .map(
      (role) =>
        `<button class="role-tab ${role === activeRole ? 'active' : ''} ${data.leads.includes(role) ? 'lead' : ''}" data-role="${role}" role="tab" aria-selected="${role === activeRole}">${role}</button>`,
    )
    .join('');
  const info = roles[activeRole];
  document.querySelector('#active-role-name').textContent = info.name;
  document.querySelector('#active-role-insight').textContent =
    data.leads.includes(activeRole)
      ? `${info.insight} 本轮为正式 Lead Role。`
      : `${info.insight} 本轮可参与讨论，但不是必须提交正式立场的 Lead Role。`;
}

function renderDecisionOptions() {
  const data = roundData();
  optionRoot.innerHTML = data.slots
    .map(
      ([id, name, zh]) =>
        `<button class="decision-option ${selectedSlot?.[0] === id ? 'selected' : ''}" data-slot="${id}"><b>${id} · ${zh}</b><small>${name}</small></button>`,
    )
    .join('');
  document.querySelector('#draft-decision').textContent = selectedSlot
    ? `${selectedSlot[0]} · ${selectedSlot[2]}`
    : '尚未选择';
  lockButton.disabled = !selectedSlot || previewLocked;
  lockButton.textContent = previewLocked
    ? '本轮预览已锁定'
    : '锁定本轮预览决策 →';
}

function setUnresolvedResult() {
  document.querySelector('#result-decision').textContent = selectedSlot
    ? `${selectedSlot[0]} · ${selectedSlot[2]}`
    : '待选择';
  document.querySelector('#business-change').textContent = 'UNRESOLVED';
  document.querySelector('#carbon-change').textContent = 'UNRESOLVED';
  document.querySelector('#after-state').textContent = 'UNRESOLVED';
}

function renderRound() {
  const data = roundData();
  selectedSlot = null;
  previewLocked = false;
  if (!data.leads.includes(activeRole)) activeRole = data.leads[0];

  document.querySelector('#round-kicker').textContent =
    `ROUND ${data.no} · ${data.stage}`;
  document.querySelector('#round-title').textContent = data.title;
  document.querySelector('#round-question').textContent = data.question;
  document.querySelector('#round-counter').textContent = `${data.no} / 8`;
  document.querySelector('#round-phase').textContent = 'DECISION COLLECTION';
  document.querySelector('#resource-hint').textContent = data.resource;
  document.querySelector('#market-note').textContent = data.market;
  document.querySelector('#decision-prompt').textContent = data.prompt;
  document.querySelector('#actual-reduction').textContent =
    data.actualReduction;

  renderRoundNav();
  renderRoles();
  renderDecisionOptions();
  setUnresolvedResult();
}

roundNav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-round]');
  if (!button) return;
  currentRound = Number(button.dataset.round);
  renderRound();
  document
    .querySelector('.mission-card')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });
});

roleTabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-role]');
  if (!button) return;
  activeRole = button.dataset.role;
  renderRoles();
});

optionRoot.addEventListener('click', (event) => {
  const button = event.target.closest('[data-slot]');
  if (!button || previewLocked) return;
  selectedSlot =
    roundData().slots.find(([id]) => id === button.dataset.slot) ?? null;
  document.querySelector('#role-position').textContent = selectedSlot
    ? '议题已选定'
    : '待提出';
  document.querySelector('#role-recommendation').textContent = selectedSlot
    ? `围绕 ${selectedSlot[0]} 形成建议`
    : '请选择本轮方案';
  renderDecisionOptions();
  setUnresolvedResult();
});

lockButton.addEventListener('click', () => {
  if (!selectedSlot) return;
  previewLocked = true;
  document.querySelector('#round-phase').textContent =
    'PREVIEW DECISION LOCKED';
  document.querySelector('#result-decision').textContent =
    `${selectedSlot[0]} · ${selectedSlot[2]}`;
  document.querySelector('#business-change').textContent = 'AWAITING EXECUTION';
  document.querySelector('#carbon-change').textContent = 'AWAITING RESOLVER';
  document.querySelector('#after-state').textContent = 'NOT COMMITTED';
  renderDecisionOptions();
});

renderRound();
