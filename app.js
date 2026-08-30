/* global document, history, location, window */

const panels = {
  evidence: {
    title: '查看数据依据',
    body: `<h3>数据来源</h3><p>BD Appendix B 教材案例；获治理的 Core 验证输出。</p><h3>规则来源</h3><p>BD Teaching Story Mode v0.1、BD Demo v0.2 Read-only Interaction Spec 与 CROCS C-R-O-C-S 阶段规则。</p><h3>治理证据</h3><ul><li>BD_REFERENCE_SCENARIO_END_TO_END_VALIDATION_REPORT.md</li><li>REDUCTION_CORE_END_TO_END_VALIDATION_REPORT.md</li><li>OFFSET_CORE_END_TO_END_VALIDATION_REPORT.md</li><li>Communication Core tests</li><li>stimulation-bd-end-to-end.test.ts</li></ul><h3>置信限制</h3><p>教材展示值与 Core 精确传播值属于不同精度层；未解决证据保持 UNRESOLVED，不推断为零。</p>`,
  },
  'exact-reduction': {
    title: '系统精确值',
    body: `<span class="badge fact">GOVERNED EXACT VALUE</span><div class="exact"><p><small>Carbon Out After</small><strong>311.97675 t</strong></p><p><small>Operating Carbon Net After</small><strong>94.92325 t</strong></p></div><p>教材使用展示 / 舍入粒度；CROCS Core 保留精确传播粒度。两层不会静默替换。</p>`,
  },
  'exact-offset': {
    title: '抵碳系统精确值',
    body: `<span class="badge fact">GOVERNED EXACT VALUE</span><div class="exact"><p><small>Offset Requirement</small><strong>94.92325 t</strong></p><p><small>Closing balance</small><strong>4.97175 t</strong></p><p><small>Neutrality status</small><strong>ACHIEVED_SURPLUS</strong></p></div>`,
  },
  'why-commitment': {
    title: '为什么先确碳？',
    body: `<p>责任从可见、可追溯的边界、来源、碳形成、分配开始。先建立事实基线，再谈行动与主张。</p>`,
  },
  'why-reduction': {
    title: '为什么区分两个变化？',
    body: `<p>19.600 t 是企业实际减排事实。产品与销售转移传播后，经营净额变化是另一项结果；二者不可互换。</p>`,
  },
  'why-offset': {
    title: '为什么减排与抵碳分开？',
    body: `<p>抵碳结算减排后的剩余经营责任，不重写实际减排事实，也不从 C1 / C2 产品碳中扣除资源。</p>`,
  },
  'why-communication': {
    title: '为什么披露不能改事实？',
    body: `<p>披露可以针对政府、投资者和消费者选择重点，但输入必须是冻结的 Carbon Truth，并经过核验、批准与发布。</p>`,
  },
  'why-stimulation': {
    title: '为什么结果被 WITHHELD？',
    body: `<p>目前只解决 Carbon Outcome。其他效益证据未解决，因此综合结果不能发布；WITHHELD 不是失败，缺失也不是零。</p>`,
  },
  'why-feedback': {
    title: '为什么需要下一个周期？',
    body: `<p>企业持续经营，责任与证据也会变化。反馈快照是重新确认责任的证据，不会自动生成下一次 Commitment 决策。</p>`,
  },
};

const ccm = {
  commitment: [
    ['111', '企业碳边界'],
    ['112', '企业运营边界'],
    ['121', '碳管理决策系统'],
    ['131', '原材料碳管理系统'],
    ['133', '电力与能源采购系统'],
    ['141', '企业低碳生产管理系统'],
    ['151', '供应链上下游碳分配系统'],
    ['152', '企业内部碳责任分配系统'],
    ['161', '碳盘查系统'],
  ],
  reduction: [
    ['211', '碳核算系统 · PARTIAL_CORE'],
    ['221', '碳减排实施监控系统 · PARTIAL_CORE'],
  ],
  offset: [
    ['311', '碳抵消方案评估系统'],
    ['321', 'CCUS和碳汇管理系统'],
    ['331', '碳交易系统 · NOT IMPLEMENTED'],
    ['341', '碳抵消核算系统 · NOT IMPLEMENTED'],
  ],
  communication: [
    ['411', '碳信息管理查询系统'],
    ['412', '产品碳足迹系统'],
    ['421', '碳审计系统'],
    ['431', '碳信息可视化系统'],
    ['432', '碳报告报表系统'],
  ],
  stimulation: [
    ['511', '碳效益评估分析系统 · PARTIAL_CORE'],
    ['521', '碳效益孪生模拟系统 · NOT IMPLEMENTED'],
  ],
  feedback: [
    ['511', '治理评估与反馈'],
    ['521', 'NOT IMPLEMENTED · Continuous Cycle ≠ Digital Twin'],
  ],
};

const ccmPanel = (items) => ({
  title: 'CCM 系统能力',
  body: `<p class="panel-note">能力映射 ≠ 已交付企业应用。CCM 编号不是学习顺序。</p><div class="ccm-list">${items.map(([id, name]) => `<p><b>${id}</b><span>${name}</span><small>DEMO_ONLY</small></p>`).join('')}</div><p>来源：CCM_TO_CROCS_CAPABILITY_TRACEABILITY_V0_1.md。企业应用与外部集成状态按能力矩阵解释。</p>`,
});
Object.entries(ccm).forEach(([key, items]) => {
  panels[`ccm-${key}`] = ccmPanel(items);
});
panels['ccm-all'] = ccmPanel(
  Object.values(ccm)
    .flat()
    .filter(
      (item, index, all) => all.findIndex(([id]) => id === item[0]) === index,
    ),
);

const views = [...document.querySelectorAll('.view')];
const cycleNav = document.querySelector('.cycle-nav');
const controls = document.querySelector('.story-controls');
const progress = document.querySelector('#progress');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
let current = 1;

function showView(number, updateHash = true) {
  const target = Math.max(1, Math.min(8, Number(number)));
  current = target;
  views.forEach((view) => {
    view.classList.toggle('active', Number(view.dataset.view) === target);
  });
  cycleNav.hidden = target === 1;
  controls.hidden = target === 1 || target === 8;
  document.querySelectorAll('.cycle-nav button').forEach((button) => {
    const active =
      Number(button.dataset.view) === target ||
      (target === 8 && Number(button.dataset.view) === 7);
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  progress.textContent = `${Math.min(target, 7)} / 7`;
  previous.disabled = target <= 2;
  next.textContent = target === 7 ? '进入驾驶舱 →' : '下一步 →';
  if (updateHash) history.replaceState(null, '', `#view-${target}`);
  const heading = document.querySelector(`#view-${target} h1`);
  heading?.setAttribute('tabindex', '-1');
  heading?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view], [data-view-link]');
  if (viewButton) {
    event.preventDefault();
    showView(viewButton.dataset.view || viewButton.dataset.viewLink);
  }
  const panelButton = event.target.closest('[data-panel]');
  if (panelButton) openPanel(panelButton.dataset.panel);
});
previous.addEventListener('click', () => showView(current - 1));
next.addEventListener('click', () => showView(current + 1));

const drawer = document.querySelector('.drawer');
const backdrop = document.querySelector('.backdrop');
const drawerTitle = document.querySelector('#drawer-title');
const drawerContent = document.querySelector('#drawer-content');
let opener;
function openPanel(id) {
  const panel = panels[id];
  if (!panel) return;
  opener = document.activeElement;
  drawerTitle.textContent = panel.title;
  drawerContent.innerHTML = panel.body;
  drawer.hidden = false;
  backdrop.hidden = false;
  document.body.classList.add('panel-open');
  drawer.querySelector('.close').focus();
}
function closePanel() {
  drawer.hidden = true;
  backdrop.hidden = true;
  document.body.classList.remove('panel-open');
  opener?.focus();
}
drawer.querySelector('.close').addEventListener('click', closePanel);
backdrop.addEventListener('click', closePanel);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !drawer.hidden) closePanel();
  if (event.key === 'Tab' && !drawer.hidden) {
    const focusable = [
      ...drawer.querySelectorAll(
        "button, [href], [tabindex]:not([tabindex='-1'])",
      ),
    ];
    if (!focusable.length) return;
    const first = focusable[0],
      last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

const initial = Number(location.hash.match(/view-(\d)/)?.[1] || 1);
showView(initial, false);
