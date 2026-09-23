const LIFECYCLE = ['DRAFT', 'PREVIEW', 'CONFIRMED', 'LOCKED'];
const TITLES = ['经营', '确碳', '减碳', '抵碳', '披碳', '激碳'];
export function campusItems(workspaces, state) {
  return workspaces.map((workspace, index) => ({
    id: workspace.id,
    title: TITLES[index],
    index,
    canNavigate: index <= state.unlocked,
    status:
      index > state.unlocked
        ? 'LOCKED'
        : index === state.active
          ? 'ACTIVE'
          : 'AVAILABLE',
    lifecycle: LIFECYCLE[state.lifecycle[index]],
  }));
}
export function factPresentation(fact) {
  return {
    ...fact,
    displayValue:
      fact.value == null ? `${fact.status} · 待权威结果` : String(fact.value),
  };
}
export function decisionContext(projection, id) {
  for (const workspace of projection.workspaces) {
    const slot = workspace.slots.find((item) => item.id === id);
    if (slot) return { workspace: workspace.id, slot };
  }
  return null;
}

// The shell passes its existing state and render function; no new state store.
export function createG1Callbacks(doc, state, render) {
  return {
    navigate(index) {
      if (index > state.unlocked) return;
      state.active = index;
      render();
    },
    openDecision(id) {
      doc.querySelector('#g1-decision-detail').open = true;
      const detail = doc.querySelector(`#g1-control-${id}`);
      const target =
        id === 'D6'
          ? (doc.querySelector('#sim-ui2-content input[type="checkbox"]') ??
            detail)
          : detail;
      if (target) {
        target.scrollIntoView({ block: 'center' });
        (target.disabled ? detail : target)?.focus();
      }
    },
  };
}

// Presentation only. State and all mutations remain owned by the existing shell.
export function mountG1(doc, { getState, navigate, openDecision }) {
  const q = (selector) => doc.querySelector(selector);
  const el = (tag, text, className) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const button = (text, action, className) => {
    const node = el('button', text, className);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  };
  function picture(src, alt, parent) {
    const img = el('img');
    img.alt = alt;
    img.addEventListener(
      'error',
      () => {
        const fallback = el(
          'span',
          `${alt || '场景'} · 图片暂不可用`,
          'g1-asset-fallback',
        );
        img.replaceWith(fallback);
      },
      { once: true },
    );
    img.src = src;
    parent.append(img);
    return img;
  }
  function scene(kind) {
    const root = el('div', undefined, 'g1-illustration');
    root.setAttribute('role', 'img');
    root.setAttribute(
      'aria-label',
      kind === 'factory'
        ? '工厂与生产线插画，情境展示'
        : '企业园区插画，情境展示',
    );
    for (let i = 0; i < 6; i++) picture(`assets/g1/${kind}-${i}.jpg`, '', root);
    return root;
  }
  let opener;
  const dialog = q('#g1-dialog');
  function close() {
    dialog.close();
  }
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus();
  });
  function show(title, build) {
    opener = doc.activeElement;
    q('#g1-dialog-title').textContent = title;
    const content = q('#g1-dialog-content');
    content.replaceChildren();
    build(content);
    dialog.showModal();
    q('#g1-close').focus();
  }
  q('#g1-close').addEventListener('click', close);
  function note(root, title, text) {
    const card = el('article', undefined, 'g1-note');
    card.append(el('h3', title), el('p', text));
    root.append(card);
    return card;
  }
  function world() {
    show('企业世界 · Enterprise World', (root) => {
      const map = el('div', undefined, 'g1-world');
      map.append(scene('campus'));
      const items = el('div', undefined, 'g1-campus-items');
      const state = getState();
      for (const item of campusItems(state.projection.workspaces, state)) {
        const control = button(
          `${item.title} · ${item.status} / ${item.lifecycle}`,
          () => {
            if (
              !campusItems(getState().projection.workspaces, getState())[
                item.index
              ].canNavigate
            )
              return;
            close();
            navigate(item.index);
          },
        );
        control.disabled = !item.canNavigate;
        if (item.index === state.active)
          control.setAttribute('aria-current', 'page');
        items.append(control);
      }
      map.append(items);
      root.append(
        map,
        el('p', '按年度工作台顺序推进。已锁定的历史决策只能回看。'),
      );
    });
  }
  function facts() {
    show('Governed Fact · 碳事实与证据', (root) => {
      const state = getState();
      const workspace = state.projection.workspaces[state.active];
      if (!workspace.facts.length)
        note(
          root,
          'UNRESOLVED',
          '当前工作台尚无已绑定的权威结果。Missing ≠ Zero。',
        );
      for (const raw of workspace.facts) {
        const fact = factPresentation(raw);
        const card = note(
          root,
          fact.label,
          `${fact.displayValue}${fact.unit ? ` ${fact.unit}` : ''}`,
        );
        card.append(
          el('p', `${fact.status} · ${fact.provenance}`),
          el('p', `来源：${fact.sourceReference}`),
          el('p', '逐项因子与证据绑定：当前视图未提供。'),
        );
      }
      note(
        root,
        '只读事实',
        'Actual Reduction 由 Carbon Core 计算。投资、项目选择和情境讨论均不产生碳事实。',
      );
    });
  }
  function reflection() {
    show('Meaningful Mistake · 解释与反思', (root) => {
      const p = getState().projection;
      const chain = el('div', undefined, 'g1-chain');
      for (const stage of p.interaction.meaningfulMistake.chain)
        note(chain, stage, '待关联教学证据 · 不推断缺失后果');
      root.append(chain);
      note(root, '反馈分类', p.feedbackCategories.join(' / '));
      note(root, 'Explainability 0–4', '由教师依据证据审阅；不自动评分。');
      note(
        root,
        '知识卡',
        p.knowledgeCards.map((k) => `${k.id} · ${k.contentStatus}`).join(' / '),
      );
    });
  }
  function narrative() {
    show('Narrative Event · 交付窗口提前', (root) => {
      root.append(scene('factory'));
      note(
        root,
        'COO · 工厂经理 / 工程师',
        '围绕交付窗口提前，讨论生产安排与减排项目的取舍。',
      );
      note(
        root,
        '讨论情境',
        '返回既有决策与事实核查。此情境不改变生产量、成本、减排量或结算结果。',
      );
    });
  }
  function authority() {
    show('权限、来源与未决项', (root) => {
      const p = getState().projection;
      for (const text of p.semanticGuards) note(root, '治理边界', text);
      for (const text of p.openPolicyReferences)
        note(root, 'OPEN / BLOCKED', text);
      note(
        root,
        '仍未决',
        'MIXED dominance 78/81；Profit；Qualification threshold；Stakeholder / Organization / Capability 数值效应；Round 14 smoothing / materiality。',
      );
      note(
        root,
        'DCS-006 · 已批准',
        'D6 保留 A01 当前五类选项；四个历史图标仅为历史证据，不作映射。D8/D9 归属经营 BUSINESS_DECISION；工厂入口仅作只读关联。此修订不解除其他规则与参数的未决状态。',
      );
      note(
        root,
        '素材来源',
        'G1 独立情境素材 · Figma 35:2 · g1-assets.json。历史六场景 MISSING_ARTIFACT 证据保留。',
      );
      note(root, '数据基线', p.dataBaselineHead);
      note(
        root,
        '实现版本',
        p.implementationHead ?? p.implementationHeadStatus,
      );
    });
  }
  function decision(id) {
    if (id === 'D5' || id === 'D6') {
      openDecision(id);
      return;
    }
    const context = decisionContext(getState().projection, id);
    show(`${id} · 决策详情`, (root) => {
      if (!context) {
        note(root, 'UNRESOLVED', '没有已绑定的决策身份。');
        return;
      }
      note(
        root,
        context.slot.name,
        `${context.slot.captureStatus} / ${context.slot.effectStatus}`,
      );
      note(root, '现有投影归属', context.workspace);
      note(
        root,
        '输入边界',
        id === 'D8'
          ? 'c1Production / c2Production；当前浏览器无已绑定执行输入。'
          : (context.slot.options ?? []).join(' / '),
      );
      note(root, '权限', '仅查看既有身份与状态，不创建草稿或执行规则。');
    });
  }
  q('#g1-open-world').addEventListener('click', world);
  q('#g1-open-authority').addEventListener('click', authority);
  let priorWorkspace = null;
  return {
    update() {
      const state = getState();
      const factory =
        state.projection.workspaces[state.active].id === 'REDUCTION';
      const sceneRoot = q('#g1-scene');
      if (priorWorkspace !== state.active) {
        sceneRoot.replaceChildren();
        if (factory || state.active === 0)
          sceneRoot.append(scene(factory ? 'factory' : 'campus'));
        else
          note(
            sceneRoot,
            TITLES[state.active],
            '原场景素材尚不可用 · MISSING_ARTIFACT',
          );
        if (factory) {
          const hotspots = el('div', undefined, 'g1-hotspots');
          for (const [id, name] of [
            ['D5', '投资强度'],
            ['D6', '项目组合'],
            ['D8', '生产安排'],
          ])
            hotspots.append(
              button(
                `${id} · ${name}`,
                () => decision(id),
                `g1-hotspot g1-hotspot-${id}`,
              ),
            );
          sceneRoot.append(hotspots);
        }
        priorWorkspace = state.active;
      }
      q('#g1-scene-caption').textContent = factory
        ? 'Factory / Production Line · 情境插画'
        : state.active === 0
          ? 'Enterprise World · 情境插画'
          : '历史场景 · 保留待补';
      const roles = q('#g1-role-portraits');
      if (!roles.children.length)
        for (const role of state.projection.roles) {
          const card = el('div', undefined, 'g1-role');
          picture(`assets/g1/role-${role}.jpg`, `${role} 虚构角色肖像`, card);
          card.append(el('b', role));
          roles.append(card);
        }
      const rail = q('#g1-task-rail');
      rail.replaceChildren();
      if (factory)
        for (const [id, title] of [
          ['D5', '投资强度'],
          ['D6', '项目组合'],
          ['D8', '生产安排'],
          ['D9', '市场目标'],
        ])
          rail.append(
            button(`${id} · ${title} →`, () => decision(id), 'g1-task'),
          );
      rail.append(
        button('碳事实与证据 →', facts, 'g1-task'),
        button('解释与反思 →', reflection, 'g1-task'),
      );
      if (factory)
        rail.append(
          button('情境事件 · 交付窗口提前 →', narrative, 'g1-task g1-event'),
        );
      q('#g1-current-status').textContent =
        `${TITLES[state.active]} · ${LIFECYCLE[state.lifecycle[state.active]]}`;
    },
  };
}
