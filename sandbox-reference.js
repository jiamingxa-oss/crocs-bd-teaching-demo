window.CROCS_SANDBOX_REFERENCE = Object.freeze({
  metadata: Object.freeze({
    schema: 'CROCS_SANDBOX_REFERENCE_PLAYBACK_V0_1',
    modelVersion: 'CROCS_COMPETITIVE_ENTERPRISE_MODEL_V0_1',
    parameterBaselineVersion: 'CROCS_SANDBOX_ECONOMIC_PARAMETERS_V0_1',
    visibleYears: 6,
    continuationYears: 2,
    carbonAuthority: 'CROCS_CORE_GOVERNED_SAMPLE_REFERENCES',
    note: 'Public teaching trial only. Product Carbon and Offset inputs are controlled teaching reference signals; this file is not Carbon Truth authority.'
  }),
  balanced: Object.freeze([
    Object.freeze({year:2027,pcf:1.000,marketShare:0.300738,revenue:360.885004,operatingCashFlow:71.915783,reductionBudget:28,capabilityBudget:22,annualCashContribution:16.666692,carbonPrice:93.733333,carbonCashOutflow:5.249067,cash:166.666692,debt:0,capability:0.419875,status:'SOLVENT'}),
    Object.freeze({year:2028,pcf:0.960,marketShare:0.291679,revenue:350.015255,operatingCashFlow:71.230203,reductionBudget:28,capabilityBudget:22,annualCashContribution:14.345678,carbonPrice:131.133333,carbonCashOutflow:6.8845,cash:181.01237,debt:0,capability:0.47958,status:'SOLVENT'}),
    Object.freeze({year:2029,pcf:0.910,marketShare:0.283837,revenue:340.604308,operatingCashFlow:70.480428,reductionBudget:25,capabilityBudget:18,annualCashContribution:18.491084,carbonPrice:183.456,carbonCashOutflow:8.989344,cash:199.503454,debt:0,capability:0.519068,status:'SOLVENT'}),
    Object.freeze({year:2030,pcf:0.860,marketShare:0.276516,revenue:331.819809,operatingCashFlow:69.11888,reductionBudget:22,capabilityBudget:15,annualCashContribution:20.441049,carbonPrice:256.655467,carbonCashOutflow:11.677824,cash:219.944503,debt:0,capability:0.54584,status:'SOLVENT'}),
    Object.freeze({year:2031,pcf:0.820,marketShare:0.267128,revenue:320.553664,operatingCashFlow:66.470306,reductionBudget:18,capabilityBudget:12,annualCashContribution:21.389723,carbonPrice:359.061547,carbonCashOutflow:15.080583,cash:241.334226,debt:0,capability:0.562084,status:'SOLVENT'}),
    Object.freeze({year:2032,pcf:0.790,marketShare:0.254677,revenue:305.612733,operatingCashFlow:62.257779,reductionBudget:15,capabilityBudget:10,annualCashContribution:17.918168,carbonPrice:502.327573,carbonCashOutflow:19.339612,cash:259.252394,debt:0,capability:0.572177,status:'SOLVENT'})
  ]),
  debrief: Object.freeze({
    balancedEnterpriseValueIncludingContinuation:124.252344,
    conservativeEnterpriseValueIncludingContinuation:86.181989,
    balancedAdvantagePercent:44.18,
    aggressiveDefaultYear:2029,
    aggressiveDefaultRound:3,
    aggressiveClosingDebt:180,
    conservativeYear6AnnualContribution:-18.1277,
    balancedYear6AnnualContribution:17.9182
  })
});

(function () {
  'use strict';

  const envelopes = Object.freeze({
    EXTREME_CONSERVATIVE: Object.freeze({
      label: '偏保守参考包络',
      pcf: Object.freeze([1, 0.995, 0.99, 0.985, 0.98, 0.975, 0.97, 0.965]),
      demand: Object.freeze([18, 20, 22, 24, 26, 28, 30, 32]),
      reduction: Object.freeze([2, 2, 2, 2, 2, 2]),
      capability: Object.freeze([2, 2, 2, 2, 2, 2])
    }),
    BALANCED_REFERENCE: Object.freeze({
      label: '平衡参考包络',
      pcf: Object.freeze([1, 0.96, 0.91, 0.86, 0.82, 0.79, 0.77, 0.75]),
      demand: Object.freeze([16, 15, 14, 13, 12, 11, 11, 10]),
      reduction: Object.freeze([28, 28, 25, 22, 18, 15]),
      capability: Object.freeze([22, 22, 18, 15, 12, 10])
    }),
    EXTREME_AGGRESSIVE: Object.freeze({
      label: '偏激进参考包络',
      pcf: Object.freeze([1, 0.91, 0.82, 0.74, 0.68, 0.64, 0.61, 0.59]),
      demand: Object.freeze([15, 12, 9, 7, 6, 5, 5, 4]),
      reduction: Object.freeze([110, 105, 90, 70, 50, 35]),
      capability: Object.freeze([95, 90, 75, 60, 40, 30])
    })
  });

  const chapter = Object.freeze([
    ['接管 BD：第一次真正管理碳', '经营环境总体稳定。你要在维持连续经营的同时建立自己的碳管理路径。'],
    ['压力来了：过去的选择开始产生后果', '碳市场和能源成本上升，低碳产品偏好增强。你上一年的投入开始影响今天。'],
    ['低碳是成本，还是能力？', '绿色技术成本下降、披露要求收紧。你需要判断低碳能力能否转化为经营优势。'],
    ['路径开始分化', '前三年的决策已经进入企业状态。现在再改变方向，成本和机会都与过去不同。'],
    ['过去的投入开始兑现或反噬', '能力、碳成本、市场位置和融资压力继续累积。单看当期利润已经不足以判断经营质量。'],
    ['六年经营收官', '这是最后一个可决策年度。系统随后会自动观察两个隐藏继续经营期，检验你的路径是否可持续。']
  ]);

  const priceIndex = Object.freeze({ LOW: 0.95, BASE: 1, PREMIUM: 1.08 });
  const years = Object.freeze([2027, 2028, 2029, 2030, 2031, 2032]);
  const initialState = Object.freeze({cash:150,debt:0,capability:0.35,reputation:0.5,quality:0.02});

  let progressionRound = 0;
  let state = {...initialState};
  let enterpriseValue = 0;
  let priorEnvelope = 'BALANCED_REFERENCE';
  let defaultYear = null;
  let frozen = false;
  let visibleResults = [];
  let decisions = [];
  let continuationResults = [];

  function q(selector) { return document.querySelector(selector); }
  function qa(selector) { return [...document.querySelectorAll(selector)]; }
  function clamp(value, low, high) { return Math.min(high, Math.max(low, value)); }
  function round6(value) { return Math.round((value + Number.EPSILON) * 1000000) / 1000000; }
  function fmt(value, digits = 1) { return Number(value).toFixed(digits); }

  function selectedText(groupSelector) {
    const selected = q(`${groupSelector} .choice.selected`);
    return selected ? selected.textContent.trim() : '';
  }

  function setSingle(groupSelector, text) {
    const group = q(groupSelector);
    if (!group) return;
    [...group.querySelectorAll('.choice')].forEach(button => {
      button.classList.toggle('selected', button.textContent.trim() === text);
    });
  }

  function projectChoices() {
    const block = qa('.block').find(item => item.querySelector('h4')?.textContent.includes('Reduction'));
    if (!block) return [];
    return [...block.querySelectorAll('.choices .choice.selected')].map(button => button.textContent.trim());
  }

  function offsetCoverage() {
    const block = qa('.block').find(item => item.querySelector('h4')?.textContent.includes('Offset'));
    const slider = block?.querySelector('input[type=range]');
    return slider ? Number(slider.value) / 100 : 0.9;
  }

  function communicationChoice() {
    const block = qa('.block').find(item => item.querySelector('h4')?.textContent.includes('Communication'));
    return block?.querySelector('select')?.value ?? '';
  }

  function journalValue() {
    return q('textarea')?.value.trim() ?? '';
  }

  function readDecision() {
    return Object.freeze({
      commitment: selectedText('[data-single="commitment"]'),
      pricing: selectedText('[data-single="price"]') || 'BASE',
      reductionBudget: Number(q('#rRange')?.value ?? 0),
      capabilityBudget: Number(q('#cRange')?.value ?? 0),
      projects: Object.freeze(projectChoices()),
      offsetCoverage: offsetCoverage(),
      assetPolicy: selectedText('[data-single="asset"]'),
      communication: communicationChoice(),
      evaluationFocus: selectedText('[data-single="eval"]'),
      decisionJournal: journalValue()
    });
  }

  function prototype(envelope, roundIndex) {
    const source = envelopes[envelope];
    return {
      reductionBudget: source.reduction[Math.min(roundIndex, 5)],
      capabilityBudget: source.capability[Math.min(roundIndex, 5)]
    };
  }

  function distance(decision, candidate) {
    const r = (decision.reductionBudget - candidate.reductionBudget) / 120;
    const c = (decision.capabilityBudget - candidate.capabilityBudget) / 100;
    return r * r + c * c;
  }

  function deriveEnvelope(decision, roundIndex) {
    let selected = 'BALANCED_REFERENCE';
    let best = distance(decision, prototype(selected, roundIndex));
    ['EXTREME_CONSERVATIVE', 'EXTREME_AGGRESSIVE'].forEach(candidate => {
      const d = distance(decision, prototype(candidate, roundIndex));
      if (d < best) {
        selected = candidate;
        best = d;
      }
    });
    return selected;
  }

  function competitor(roundIndex, id) {
    if (id === 'CE') return {price:'LOW',pcf:Math.max(0.78,1.08-0.04*roundIndex),reputation:0.42,quality:-0.02};
    return {price:'PREMIUM',pcf:Math.max(0.55,0.86-0.045*roundIndex),reputation:0.6,quality:0.1};
  }

  function utility(price, pcf, reputation, quality, greenPreference) {
    return -4 * (priceIndex[price] - 1) - 1.8 * greenPreference * pcf + 0.5 * reputation + 0.8 * quality;
  }

  function resolveYear(roundIndex, decision, selectedEnvelope, publishedEnvelope, openingState, continuation) {
    const pcf = envelopes[publishedEnvelope].pcf[roundIndex];
    const firmDemand = envelopes[selectedEnvelope].demand[roundIndex];
    const greenPreference = Math.min(1, 0.25 + 0.14 * roundIndex);
    const ce = competitor(roundIndex, 'CE');
    const fg = competitor(roundIndex, 'FG');
    const ownUtility = utility(decision.pricing, pcf, openingState.reputation, openingState.quality, greenPreference);
    const ceUtility = utility(ce.price, ce.pcf, ce.reputation, ce.quality, greenPreference);
    const fgUtility = utility(fg.price, fg.pcf, fg.reputation, fg.quality, greenPreference);
    const ownDemand = Math.exp(ownUtility);
    const share = ownDemand / (Math.exp(-1.2) + ownDemand + Math.exp(ceUtility) + Math.exp(fgUtility));
    const sales = 1200 * share;
    const revenue = sales * priceIndex[decision.pricing];
    const effectiveVariableCost = 0.74 * (1 - 0.14 * openingState.capability);
    const operatingCashFlow = revenue - sales * effectiveVariableCost - 35;
    const reductionBudget = continuation ? 0 : decision.reductionBudget;
    const capabilityBudget = continuation ? 0 : decision.capabilityBudget;
    const investment = reductionBudget + capabilityBudget;
    const closingCapability = clamp(0.975 * openingState.capability + 0.0055 * capabilityBudget * (1 - openingState.capability), 0, 1);
    const baseCarbonPrice = 100 * Math.pow(1.4, roundIndex);
    const marketFactor = clamp(1 + 0.1 * ((firmDemand + 40) / 150 - 1), 0.9, 1.25);
    const carbonPrice = baseCarbonPrice * marketFactor;
    const carbonCashOutflow = firmDemand * carbonPrice * 0.0035;
    const financingCost = openingState.debt * 0.08;
    const preFinancingCash = openingState.cash + operatingCashFlow - investment - carbonCashOutflow - financingCost;
    const availableDebt = Math.max(0, 180 - openingState.debt);
    const financingNeed = Math.max(0, -preFinancingCash);
    const financingDraw = Math.min(financingNeed, availableDebt);
    const closingDebt = openingState.debt + financingDraw;
    const cashAfterFinancing = preFinancingCash + financingDraw;
    const shortfall = Math.max(0, -cashAfterFinancing);
    const closingCash = Math.max(0, cashAfterFinancing);
    const status = shortfall > 0 ? 'DEFAULT_BANKRUPT' : financingDraw > 0 ? 'FINANCED' : 'SOLVENT';
    const annualCashContribution = operatingCashFlow - investment - carbonCashOutflow - financingCost;
    const discountedContribution = annualCashContribution / Math.pow(1.08, roundIndex);

    return Object.freeze({
      year: 2027 + roundIndex,
      round: roundIndex + 1,
      continuation,
      decision,
      selectedEnvelope,
      publishedEnvelope,
      pcf: round6(pcf),
      marketShare: round6(share),
      revenue: round6(revenue),
      operatingCashFlow: round6(operatingCashFlow),
      investment: round6(investment),
      carbonPrice: round6(carbonPrice),
      carbonCashOutflow: round6(carbonCashOutflow),
      financingCost: round6(financingCost),
      financingDraw: round6(financingDraw),
      liquidityShortfall: round6(shortfall),
      annualCashContribution: round6(annualCashContribution),
      discountedContribution: round6(discountedContribution),
      closingState: Object.freeze({cash:round6(closingCash),debt:round6(closingDebt),capability:round6(closingCapability),reputation:openingState.reputation,quality:openingState.quality}),
      status
    });
  }

  function currentPcfReference(roundIndex) {
    const envelope = roundIndex === 0 ? 'BALANCED_REFERENCE' : priorEnvelope;
    return envelopes[envelope].pcf[roundIndex];
  }

  function setControlsDisabled(disabled) {
    qa('.decision-grid button, .decision-grid input, .decision-grid select, .decision-grid textarea').forEach(control => {
      control.disabled = disabled;
    });
    const load = q('#loadRefBtn');
    if (load) load.disabled = disabled;
  }

  function loadBalanced(roundIndex, showToast) {
    const ref = envelopes.BALANCED_REFERENCE;
    if (q('#rRange')) q('#rRange').value = ref.reduction[roundIndex];
    if (q('#cRange')) q('#cRange').value = ref.capability[roundIndex];
    if (q('#rBudget')) q('#rBudget').textContent = ref.reduction[roundIndex];
    if (q('#cBudget')) q('#cBudget').textContent = ref.capability[roundIndex];
    setSingle('[data-single="commitment"]', '平衡管理');
    setSingle('[data-single="price"]', 'BASE');
    if (showToast) toast('已载入本年的平衡参考起点。你仍可以在提交前自由调整。');
  }

  function clearResult(roundIndex) {
    q('#resultYear').textContent = years[roundIndex];
    ['rev','ocf','annual','cash','debt','cap','carbonCash','cont'].forEach(id => { q(`#${id}`).textContent = '—'; });
    q('#annual').className = '';
    q('#cont').className = '';
    q('#carbonPrice').textContent = '待决策';
    q('#pcf').textContent = fmt(currentPcfReference(roundIndex), 2);
    q('#share').textContent = '待决策';
    q('#heroStatus').textContent = 'DECISION';
    q('#whyMarket').textContent = `进入 ${years[roundIndex]} 年时，你已知的产品碳参考指数为 ${fmt(currentPcfReference(roundIndex),2)}；本年价格与竞争者将共同决定销量。`;
    q('#whyCapability').textContent = `期初 Capability Index 为 ${fmt(state.capability,3)}。你今天的能力投入主要影响后续年度。`;
    q('#whyFinance').textContent = `期初现金 ${fmt(state.cash,1)}，债务 ${fmt(state.debt,1)}。投资必须由经营现金与有限融资能力承担。`;
  }

  function renderResult(result) {
    q('#resultYear').textContent = result.year;
    q('#carbonPrice').textContent = fmt(result.carbonPrice,1);
    q('#pcf').textContent = fmt(result.pcf,2);
    q('#share').textContent = fmt(result.marketShare*100,1)+'%';
    q('#heroStatus').textContent = result.status;
    q('#rev').textContent = fmt(result.revenue,1);
    q('#ocf').textContent = fmt(result.operatingCashFlow,1);
    q('#annual').textContent = (result.annualCashContribution>=0?'+':'')+fmt(result.annualCashContribution,1);
    q('#annual').className = result.annualCashContribution>=0?'good':'danger';
    q('#cash').textContent = fmt(result.closingState.cash,1);
    q('#debt').textContent = fmt(result.closingState.debt,1);
    q('#cap').textContent = fmt(result.closingState.capability,3);
    q('#carbonCash').textContent = fmt(result.carbonCashOutflow,2);
    q('#cont').textContent = result.status==='DEFAULT_BANKRUPT'?'STOPPED':'ALLOWED';
    q('#cont').className = result.status==='DEFAULT_BANKRUPT'?'danger':'good';
    q('#whyMarket').textContent = `本年进入市场的产品碳参考指数为 ${fmt(result.pcf,2)}；叠加你的 ${result.decision.pricing} 定价和竞争者行为，市场份额为 ${fmt(result.marketShare*100,1)}%。`;
    q('#whyCapability').textContent = `你的能力投入形成期末 Capability Index ${fmt(result.closingState.capability,3)}。它不会直接加分，而会进入下一年的成本状态。`;
    q('#whyFinance').textContent = `经营现金流 ${fmt(result.operatingCashFlow,1)}，投资 ${fmt(result.investment,1)}，碳现金流出 ${fmt(result.carbonCashOutflow,2)}，期末现金 ${fmt(result.closingState.cash,1)}。`;
    const panelSmall = q('.result-panel .panel-head small');
    if (panelSmall) panelSmall.textContent = `你的本年投入组合更接近“${envelopes[result.selectedEnvelope].label}”。这是解释标签，不是你的决策，也不是得分。`;
    const panelTag = q('.result-panel .panel-head .tag');
    if (panelTag) panelTag.textContent = 'YOUR RESULT';
  }

  function updateTimeline() {
    qa('#years .year').forEach((button, index) => {
      button.disabled = index !== progressionRound;
      button.classList.toggle('active', index === progressionRound);
      if (visibleResults[index]) button.textContent = `${years[index]} ✓`;
      else button.textContent = String(years[index]);
    });
  }

  function openRound(roundIndex) {
    progressionRound = roundIndex;
    frozen = false;
    q('#heroYear').textContent = years[roundIndex];
    const [title, brief] = chapter[roundIndex];
    q('.hero h1').innerHTML = `${title}<br><span style="font-size:.56em;font-weight:700;opacity:.88">${brief}</span>`;
    q('#decisionStatus').textContent = 'DRAFT';
    setControlsDisabled(false);
    loadBalanced(roundIndex, false);
    clearResult(roundIndex);
    const freezeBtn = q('#freezeBtn');
    freezeBtn.disabled = false;
    freezeBtn.textContent = `提交并冻结 ${years[roundIndex]} 决策`;
    const nextBtn = q('#trialNextBtn');
    if (nextBtn) nextBtn.style.display = 'none';
    updateTimeline();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function freezeAndResolve() {
    if (frozen || defaultYear !== null) return;
    const decision = readDecision();
    const selectedEnvelope = deriveEnvelope(decision, progressionRound);
    const publishedEnvelope = progressionRound === 0 ? 'BALANCED_REFERENCE' : priorEnvelope;
    const result = resolveYear(progressionRound, decision, selectedEnvelope, publishedEnvelope, state, false);
    decisions[progressionRound] = decision;
    visibleResults[progressionRound] = result;
    enterpriseValue = round6(enterpriseValue + result.discountedContribution);
    state = {...result.closingState};
    priorEnvelope = selectedEnvelope;
    frozen = true;
    setControlsDisabled(true);
    q('#decisionStatus').textContent = 'RESULT READY';
    q('#freezeBtn').disabled = true;
    q('#freezeBtn').textContent = '本年决策已冻结';
    renderResult(result);
    updateTimeline();

    if (result.status === 'DEFAULT_BANKRUPT') {
      defaultYear = result.year;
      q('#heroStatus').textContent = 'DEFAULT_BANKRUPT';
      toast(`你的企业在 ${result.year} 年出现无法由剩余债务容量覆盖的流动性缺口，正常经营终止。`);
      finishTrial(true);
      return;
    }

    if (progressionRound < 5) {
      const next = q('#trialNextBtn');
      next.textContent = `进入 ${years[progressionRound+1]} 年 →`;
      next.style.display = '';
      toast(`${result.year} 年结果已生成。你的决策已冻结，并已进入下一年度的企业状态。`);
    } else {
      finishTrial(false);
    }
  }

  function runContinuation() {
    continuationResults = [];
    let continuationState = {...state};
    const lastDecision = decisions[5];
    if (!lastDecision) return;
    for (let roundIndex = 6; roundIndex < 8; roundIndex += 1) {
      const continuationDecision = {...lastDecision,reductionBudget:0,capabilityBudget:0,projects:[]};
      const result = resolveYear(roundIndex, continuationDecision, priorEnvelope, priorEnvelope, continuationState, true);
      continuationResults.push(result);
      enterpriseValue = round6(enterpriseValue + result.discountedContribution);
      continuationState = {...result.closingState};
      if (result.status === 'DEFAULT_BANKRUPT') {
        defaultYear = result.year;
        break;
      }
    }
  }

  function finishTrial(bankrupt) {
    if (!bankrupt && visibleResults.length >= 6) runContinuation();
    const debrief = q('.debrief');
    if (!debrief) return;
    const completed = visibleResults.filter(Boolean).length;
    const last = visibleResults.filter(Boolean).at(-1);
    const pathLabels = visibleResults.filter(Boolean).map(result => envelopes[result.selectedEnvelope].label.replace('参考包络','')).join(' → ');
    debrief.innerHTML = `
      <h3>你的六年经营复盘</h3>
      <div class="debrief-card"><strong>${bankrupt?'经营因流动性约束终止':'你已经完成可决策经营期'}</strong><span>${bankrupt?`你完成了 ${completed} 个年度，在 ${defaultYear} 年触发 DEFAULT_BANKRUPT。`:`系统已继续观察 2033–2034 两个隐藏经营期，用来检验你留下的状态是否还能创造价值。`}</span></div>
      <div class="stress">
        <div class="stress-card"><b>你的经营价值</b><span>折现年度现金贡献</span><strong class="${enterpriseValue>=0?'good':'danger'}">${fmt(enterpriseValue,2)}</strong><small>教学经济评价，不是 Carbon Truth</small></div>
        <div class="stress-card"><b>最终可见年度现金</b><span>${last?last.year:'—'} 年</span><strong>${last?fmt(last.closingState.cash,1):'—'}</strong><small>债务 ${last?fmt(last.closingState.debt,1):'—'}</small></div>
        <div class="stress-card"><b>最终能力</b><span>Capability Index</span><strong>${last?fmt(last.closingState.capability,3):'—'}</strong><small>${bankrupt?'经营已终止':'能力继续进入隐藏经营期'}</small></div>
      </div>
      <div class="debrief-card"><strong>你的决策路径</strong><span>${pathLabels || '尚未形成'}</span></div>
      <div class="debrief-card"><strong>先不要找“标准答案”</strong><span>回看哪一年开始出现现金、能力、产品碳参考、市场份额之间的权衡。下一次重新经营时，再尝试改变其中一两个关键判断。</span></div>`;
    q('.footer-note').textContent = 'CROCS Teaching Sandbox v0.5 · Playable deterministic trial · Public teaching surface · Not Carbon Truth authority';
    const next = q('#trialNextBtn');
    if (next) next.style.display = 'none';
    qa('#years .year').forEach(button => button.disabled = true);
  }

  function resetTrial() {
    progressionRound = 0;
    state = {...initialState};
    enterpriseValue = 0;
    priorEnvelope = 'BALANCED_REFERENCE';
    defaultYear = null;
    frozen = false;
    visibleResults = [];
    decisions = [];
    continuationResults = [];
    const debrief = q('.debrief');
    if (debrief) debrief.innerHTML = `<h3>你的经营复盘</h3><div class="debrief-card"><strong>复盘会在经营过程中逐步形成</strong><span>系统不会提前告诉你哪条路线“正确”。你完成六年经营后，再比较现金、能力、市场与碳成本是怎样一起变化的。</span></div>`;
    openRound(0);
    toast('新的六年经营已开始。请按自己的判断做第一年决策。');
  }

  function toast(message) {
    const t = q('#toast');
    const text = q('#toastText');
    if (!t || !text) return;
    text.textContent = message;
    t.classList.add('show');
    clearTimeout(window.__crocsToastTimer);
    window.__crocsToastTimer = setTimeout(() => t.classList.remove('show'), 4200);
  }

  function rewriteSurface() {
    document.title = 'CROCS 企业碳管理经营沙盘 · v0.5 试玩';
    const logoSmall = q('.logo small');
    if (logoSmall) logoSmall.textContent = 'PLAYABLE TRIAL · v0.5';
    const tag = q('.headline .tag');
    if (tag) tag.textContent = 'LIVE TRIAL';
    const sideFoot = q('.side-foot');
    if (sideFoot) sideFoot.innerHTML = '你现在进入六年可试玩经营。动态产品碳与 Offset 市场输入来自有限的受控教学参考包络；本页面不是 Carbon Truth authority。<br><br><a href="index.html">返回 Story Mode</a>';
    const heroP = q('.hero p');
    if (heroP) heroP.textContent = '现在由你经营 BD。你每年提交并冻结一次决策，系统用冻结的底层模型计算市场、成本、碳价、现金、融资和下一年状态。先按自己的判断做，不需要寻找“标准答案”。';
    const submitSmall = q('.submitbar small');
    if (submitSmall) submitSmall.textContent = '本试玩版中，定价与 Reduction / Capability 投入进入冻结经济模型；其他 CROCS 决策会被记录，但不会被用来伪造或重算 Carbon Truth。';
    const truthBanner = q('.truth-banner');
    if (truthBanner) truthBanner.innerHTML = '<strong>硬边界：</strong>你看到的动态 Product Carbon / Offset 数值是受控教学参考信号，用于市场与成本试运行。本页不会根据滑块自行计算 Product Carbon Truth、Actual Reduction、Carbon Out、Operating Carbon Net 或 Offset Truth。';
    const resultTitle = q('.result-panel .panel-head h3');
    if (resultTitle) resultTitle.innerHTML = '你的年度经营结果 · <span id="resultYear">2027</span>';
    const resultSmall = q('.result-panel .panel-head small');
    if (resultSmall) resultSmall.textContent = '提交并冻结本年决策后，结果才会生成。';
    const mechanismTitle = q('.mechanism h3');
    if (mechanismTitle) mechanismTitle.textContent = '你需要理解的 7 条关键机制';
    const reset = q('#resetBtn');
    if (reset) reset.textContent = '重新开始';
    const load = q('#loadRefBtn');
    if (load) load.textContent = '载入平衡参考起点';
    const next = document.createElement('button');
    next.id = 'trialNextBtn';
    next.className = 'ghost';
    next.style.display = 'none';
    q('.submitbar')?.insertBefore(next, q('.submitbar small'));
    next.onclick = () => {
      if (progressionRound < 5 && frozen) openRound(progressionRound + 1);
    };
  }

  function attachHandlers() {
    const freezeBtn = q('#freezeBtn');
    if (freezeBtn) freezeBtn.onclick = freezeAndResolve;
    const loadRef = q('#loadRefBtn');
    if (loadRef) loadRef.onclick = () => { if (!frozen) loadBalanced(progressionRound, true); };
    const reset = q('#resetBtn');
    if (reset) reset.onclick = resetTrial;
    qa('#years .year').forEach(button => { button.onclick = () => {}; });
  }

  window.addEventListener('load', () => {
    rewriteSurface();
    attachHandlers();
    resetTrial();
  });
})();
