// DCS-008: display labels only; never use translated strings as machine values.
const CHINESE_LABELS = {
  measurementInvestment: '测量投入',
  allocationDriver: '分配依据',
  responsibilityCoverage: '责任覆盖范围',
  'procurement → energy / production → C1 / C2 → sales':
    '采购 → 能源 / 生产 → C1 / C2 → 销售',
  QUALIFICATION_REVIEW_MILESTONE:
    '资格复核节点（QUALIFICATION_REVIEW_MILESTONE）',
  FINAL_STRATEGIC_REVIEW_SCENARIO:
    '最终战略复盘情境（FINAL_STRATEGIC_REVIEW_SCENARIO）',
  'BLOCKED_BY_DESIGN:': '设计边界内暂不可用（BLOCKED_BY_DESIGN）：',
  'CIPI formula': '综合绩效指数公式',
  'D8/D9 归属经营 BUSINESS_DECISION': 'D8/D9 归属经营（BUSINESS_DECISION）',
  D11_UI_DRAFT: 'D11 界面草稿',
  D12_UI_DRAFT: 'D12 界面草稿',
  D13_UI_DRAFT: 'D13 界面草稿',
  D14_UI_DRAFT: 'D14 界面草稿',
  D15_UI_DRAFT: 'D15 界面草稿',
  D16_UI_DRAFT: 'D16 界面草稿',
  D17_UI_DRAFT: 'D17 界面草稿',
  D18_UI_DRAFT: 'D18 界面草稿',
  'Plan:': '计划：',
  'Effect:': '效果：',
  'Explainability:': '解释充分性：',
  ACHIEVED_SURPLUS: '已形成盈余（ACHIEVED_SURPLUS）',
  'CROCS Integrated Performance Index': 'CROCS 综合绩效指数（CIPI）',
  AUTHORIZED: '已授权（AUTHORIZED）',
  OPERATIONAL: '运行中（OPERATIONAL）',
  'Reduction Semantics': '减排语义',
  'Reduction vs Offset': '减排与抵消',
  'Communication Choice': '传播选择',
  'Claim & Evidence': '声明与证据',
  Stimulation: '激碳',
  'Carbon Truth:': '碳事实：',
  'Product Carbon:': '产品碳排放：',
  'Sincerity:': '诚意：',
  FORMAL_REPORT: '正式报告',
  CSR_REPORT: '企业社会责任报告',
  WEBSITE: '网站',
  PRESS_CONFERENCE: '新闻发布会',
  DIRECT_GREEN_CUSTOMER: '直接面向绿色客户',
  SCHEDULED: '按计划安排',
  IMMEDIATE: '立即',
  BEFORE_GREEN_ORDER: '绿色订单之前',
  AFTER_MAJOR_CARBON_ACTION: '重大碳行动之后',
  ASSURED: '已鉴证',
  'CROCS Communication Core': 'CROCS 传播核心',
  CARBON_UNCERTAINTY: '碳数据不确定性',
  SHELL_GOVERNANCE: '界面治理',
  ALLOCATION: '分配',
  CLOSING_BALANCE_TO_SUCCESSOR_OPENING_BALANCE: '期末余额结转至下期期初余额',
  UNRESOLVED_RISKS: '未决风险',
  LEARNER_DRAFT: '学习者草稿',
  Visibility: '可见性',
  Uncertainty: '不确定性',
  Evidence: '证据',
  'Market Share': '市场份额',
  'Continuous Action': '持续行动',
  Verification: '核验',
  'Disclosure Risk': '披露风险',
  'Statement Version': '陈述版本',
  UI_DRAFT_ONLY: '仅界面草稿',
  PHASE9: '阶段 9',
  PHASE10: '阶段 10',
  OPEN: '未决',
  'EXECUTED FACT': '执行事实',
  'Carbon Core authority': '碳核算核心权威依据',
  'tCO2e/vehicle': '吨二氧化碳当量 / 辆（tCO2e/vehicle）',
  'Reduction Semantics:': '减排语义：',
  'Reduction vs Offset:': '减排与抵消：',
  'Communication Choice:': '传播选择：',
  'Claim & Evidence:': '声明与证据：',
  'Stimulation:': '激碳：',
  'D20 requires explicit ambition, target, capability gap and budget intent.':
    'D20 请明确填写承诺水平、目标、能力差距和预算意向。',
  'WITHHELD != FAIL': '暂不作结论 ≠ 失败',
  CHECKED_IN_SOURCE_NOT_GENERATED: '源文件记录，尚未生成发布版本',
  FORMED: '已形成',
  'NOT FORMED': '尚未形成',
  UNDER_IMPLEMENTATION: '实施中（UNDER_IMPLEMENTATION）',

  DRAFT: '草稿（DRAFT）',
  PREVIEW: '预览（PREVIEW）',
  CONFIRMED: '已确认（CONFIRMED）',
  LOCKED: '已锁定（LOCKED）',
  ACTIVE: '进行中（ACTIVE）',
  AVAILABLE: '可查看（AVAILABLE）',
  COMPLETED: '已完成（COMPLETED）',
  VERIFIED: '已核验（VERIFIED）',
  UNRESOLVED: '尚未解决（UNRESOLVED）',
  BLOCKED_POLICY: '规则待批准（BLOCKED_POLICY）',
  BLOCKED_BY_DESIGN: '设计边界内暂不可用（BLOCKED_BY_DESIGN）',
  BLOCKED_MISSING_CONTEXT: '缺少执行上下文（BLOCKED_MISSING_CONTEXT）',
  BLOCKED: '暂不可用（BLOCKED）',
  'READ ONLY': '只读（READ ONLY）',
  READ_ONLY: '只读（READ_ONLY）',
  MISSING_ARTIFACT: '素材待补（MISSING_ARTIFACT）',
  MISSING_PARAMETER: '参数待批准（MISSING_PARAMETER）',
  MISSING_AUTHORITY: '缺少授权依据（MISSING_AUTHORITY）',
  MISSING_INPUT: '缺少输入（MISSING_INPUT）',
  CONTENT_UNAVAILABLE: '正文未提供（CONTENT_UNAVAILABLE）',
  RESOLVED: '已提供（RESOLVED）',
  CAPTURE_ONLY: '仅记录选择（CAPTURE_ONLY）',
  EXECUTABLE_GOVERNED: '可按已批准规则执行（EXECUTABLE_GOVERNED）',
  UI_DRAFT: '界面草稿（UI_DRAFT）',
  CORE_FACT: '核心事实（CORE_FACT）',
  GOVERNED_CORE_EXACT: '权威核心精确结果（GOVERNED_CORE_EXACT）',
  GOVERNED_PROJECTION: '受治理投影（GOVERNED_PROJECTION）',
  GOVERNED_RUNTIME: '受治理运行时（GOVERNED_RUNTIME）',
  GOVERNED_STATUS: '受治理状态（GOVERNED_STATUS）',
  CARBON_CORE_READ_ONLY: '碳核算核心只读（CARBON_CORE_READ_ONLY）',
  READ_ONLY_GOVERNED_PROJECTION:
    '受治理只读投影（READ_ONLY_GOVERNED_PROJECTION）',
  AVAILABLE_READ_ONLY: '可用且只读（AVAILABLE_READ_ONLY）',
  SHELL_STATE: '界面状态（SHELL_STATE）',
  TEACHING_GOVERNANCE: '教学治理（TEACHING_GOVERNANCE）',
  TEACHER_REVIEW_ONLY: '仅由教师评阅（TEACHER_REVIEW_ONLY）',
  EXPLICIT_LEARNER_AUTHORIZATION_REQUIRED:
    '须由学习者明确授权（EXPLICIT_LEARNER_AUTHORIZATION_REQUIRED）',
  REQUIRED_FOR_CLOSING: '结账前必须具备（REQUIRED_FOR_CLOSING）',
  A02_ADAPTER_AVAILABLE: '既有适配器可用（A02_ADAPTER_AVAILABLE）',
  PRODUCTION_AVAILABLE: '正式目录可用（PRODUCTION_AVAILABLE）',
  NOT_APPLICABLE: '不适用（NOT_APPLICABLE）',
  EX_POST_ONLY: '仅用于事后评价（EX_POST_ONLY）',
  PASS: '已通过（PASS）',
  WITHHELD: '暂不作结论（WITHHELD）',
  NOT_FROZEN: '尚未冻结（NOT_FROZEN）',
  PLANNED: '已规划（PLANNED）',
  IN_EXECUTION: '执行中（IN_EXECUTION）',
  PRESERVED_MECHANISM: '既有机制保留（PRESERVED_MECHANISM）',
  BUSINESS_DECISION: '经营（BUSINESS_DECISION）',
  COMMITMENT: '确碳（COMMITMENT）',
  REDUCTION: '减碳（REDUCTION）',
  OFFSET: '抵碳（OFFSET）',
  COMMUNICATION: '披碳（COMMUNICATION）',
  STIMULATION: '激碳（STIMULATION）',
  OPENING: '期初（OPENING）',
  CLOSING: '期末结账（CLOSING）',
  SIX_YEAR_FINAL_REVIEW: '六年总结评阅（SIX_YEAR_FINAL_REVIEW）',
  CEO: '首席执行官（CEO）',
  CFO: '首席财务官（CFO）',
  COO: '首席运营官（COO）',
  CCO: '首席碳管理官（CCO）',
  CMO: '首席营销官（CMO）',
  POSITION: '立场（POSITION）',
  RECOMMENDATION: '建议（RECOMMENDATION）',
  REASON: '理由（REASON）',
  DECISION: '决策（DECISION）',
  IMMEDIATE_EFFECT: '即时效应（IMMEDIATE_EFFECT）',
  LATER_EFFECT: '后续效应（LATER_EFFECT）',
  FINAL_CONSEQUENCE: '最终后果（FINAL_CONSEQUENCE）',
  KNOWLEDGE_ERROR: '知识理解错误（KNOWLEDGE_ERROR）',
  MANAGEMENT_FAILURE: '管理失败（MANAGEMENT_FAILURE）',
  GOVERNANCE_VIOLATION: '治理违规（GOVERNANCE_VIOLATION）',
  LOW: '低（LOW）',
  MODERATE: '适中（MODERATE）',
  HIGH: '高（HIGH）',
  MEDIUM: '中（MEDIUM）',
  SHORT: '短期（SHORT）',
  LONG: '长期（LONG）',
  NONE: '不采用（NONE）',
  BASIC: '基础（BASIC）',
  STANDARD: '标准（STANDARD）',
  DEEP: '深入（DEEP）',
  CONSERVATIVE: '保守（CONSERVATIVE）',
  AMBITIOUS: '进取（AMBITIOUS）',
  REGULAR: '普通市场（REGULAR）',
  GREEN: '绿色市场（GREEN）',
  MIXED: '混合市场（MIXED）',
  PARTIAL: '部分抵碳（PARTIAL）',
  FULL_REMAINING_REQUIREMENT: '覆盖全部剩余需求（FULL_REMAINING_REQUIREMENT）',
  NO_BUFFER: '不设缓冲（NO_BUFFER）',
  LIMITED_BUFFER: '有限缓冲（LIMITED_BUFFER）',
  ROBUST_BUFFER: '充足缓冲（ROBUST_BUFFER）',
  GREEN_POWER_PROCUREMENT: '绿电采购（GREEN_POWER_PROCUREMENT）',
  EQUIPMENT_EFFICIENCY_RETROFIT:
    '设备能效改造（EQUIPMENT_EFFICIENCY_RETROFIT）',
  PROCESS_AND_ENERGY_MANAGEMENT_OPTIMIZATION:
    '工艺与能源管理优化（PROCESS_AND_ENERGY_MANAGEMENT_OPTIMIZATION）',
  FULL_PRODUCTION_LINE_UPGRADE: '全线升级（FULL_PRODUCTION_LINE_UPGRADE）',
  LOW_CARBON_MATERIALS_SUPPLIER_SUBSTITUTION:
    '低碳材料及供应商替代（LOW_CARBON_MATERIALS_SUPPLIER_SUBSTITUTION）',
  ENERGY_EFFICIENCY: '能源效率（ENERGY_EFFICIENCY）',
  EQUIPMENT_OPERATION_EFFICIENCY:
    '设备运行效率（EQUIPMENT_OPERATION_EFFICIENCY）',
  DECARBONIZATION_TECHNOLOGY: '减碳技术（DECARBONIZATION_TECHNOLOGY）',
  PRODUCT_TRACEABILITY: '产品追溯（PRODUCT_TRACEABILITY）',
  ACTIVITY_DATA: '活动数据（ACTIVITY_DATA）',
  DISCLOSURE_EVIDENCE: '披露证据（DISCLOSURE_EVIDENCE）',
  ACTUAL_REDUCTION: '实际减排（ACTUAL_REDUCTION）',
  PRODUCT_CARBON: '产品碳排放（PRODUCT_CARBON）',
  CARBON_NEUTRALITY: '碳中和（CARBON_NEUTRALITY）',
  FUTURE_COMMITMENT: '未来承诺（FUTURE_COMMITMENT）',
  SUBMIT_EXISTING_EVIDENCE: '提交已有证据（SUBMIT_EXISTING_EVIDENCE）',
  OBTAIN_ADDITIONAL_VERIFICATION:
    '获取额外核验（OBTAIN_ADDITIONAL_VERIFICATION）',
  OBTAIN_SUPPLEMENTARY_VERIFICATION:
    '获取补充核验（OBTAIN_SUPPLEMENTARY_VERIFICATION）',
  WITHDRAW_CLAIM: '撤回声明（WITHDRAW_CLAIM）',
  CORRECT_CLAIM: '更正声明（CORRECT_CLAIM）',
  MAINTAIN_WITH_SUPPORTING_EVIDENCE:
    '凭支持证据维持声明（MAINTAIN_WITH_SUPPORTING_EVIDENCE）',
  ACKNOWLEDGE_AND_CORRECT: '承认并更正（ACKNOWLEDGE_AND_CORRECT）',
  RETAIN_WITH_EVIDENCE: '凭证据保留（RETAIN_WITH_EVIDENCE）',
  WITHDRAW_STATEMENT: '撤回陈述（WITHDRAW_STATEMENT）',
  ISSUE_CORRECTION_STATEMENT: '发布更正声明（ISSUE_CORRECTION_STATEMENT）',
  CONTINUE_APPROVED_PLAN: '继续已批准计划（CONTINUE_APPROVED_PLAN）',
  ACCELERATE_APPROVED_PLAN: '加快已批准计划（ACCELERATE_APPROVED_PLAN）',
  HOLD_CURRENT_PLAN: '暂缓当前计划（HOLD_CURRENT_PLAN）',
  STABILIZE_CARBON_TRUTH: '稳固碳事实基础（STABILIZE_CARBON_TRUTH）',
  PRIORITIZE_REAL_REDUCTION: '优先实际减排（PRIORITIZE_REAL_REDUCTION）',
  BUILD_LOW_CARBON_VALUE: '构建低碳价值（BUILD_LOW_CARBON_VALUE）',
  FINANCIAL_RECOVERY: '财务恢复（FINANCIAL_RECOVERY）',
  REPUTATION_REBUILDING: '重建声誉（REPUTATION_REBUILDING）',
  BALANCED_TRANSITION: '平衡转型（BALANCED_TRANSITION）',
  DEEP_REDUCTION: '深度减碳（DEEP_REDUCTION）',
  PRODUCT_LOW_CARBON_LEADERSHIP:
    '低碳产品领先（PRODUCT_LOW_CARBON_LEADERSHIP）',
  LIQUIDITY_PROTECTED: '保障流动性（LIQUIDITY_PROTECTED）',
  DISCIPLINED_DEPLOYMENT: '有序投入（DISCIPLINED_DEPLOYMENT）',
  TRANSFORMATION_CAPACITY: '转型能力（TRANSFORMATION_CAPACITY）',
  REMEDIATE_BEFORE_ACTION: '行动前补正（REMEDIATE_BEFORE_ACTION）',
  PROCEED_WITH_LIMITATION: '在已知限制下继续（PROCEED_WITH_LIMITATION）',
  WITHHOLD_AFFECTED_ACTION: '暂缓受影响行动（WITHHOLD_AFFECTED_ACTION）',
  SUPPORTED: '证据支持（SUPPORTED）',
  FLAGGED: '已标记疑点（FLAGGED）',
  AMBIGUOUS: '尚不明确（AMBIGUOUS）',
  CONFIRMED_VIOLATION: '已确认违规（CONFIRMED_VIOLATION）',
  'GLOBAL KPI SHELL': '全局关键指标框架（GLOBAL KPI SHELL）',
  'ANNUAL RESOURCE / BUSINESS PLAN':
    '年度资源与经营计划（ANNUAL RESOURCE / BUSINESS PLAN）',
  'SAME-YEAR BUDGET REFERENCE': '当年预算参考（SAME-YEAR BUDGET REFERENCE）',
  'MEASUREMENT CONFIDENCE': '测量置信度（MEASUREMENT CONFIDENCE）',
  'ALLOCATION CONFIDENCE': '分配置信度（ALLOCATION CONFIDENCE）',
  'GREEN POWER PROCUREMENT': '绿电采购（GREEN POWER PROCUREMENT）',
  'EQUIPMENT EFFICIENCY RETROFIT':
    '设备能效改造（EQUIPMENT EFFICIENCY RETROFIT）',
  'PROCESS & ENERGY MANAGEMENT':
    '工艺与能源管理（PROCESS & ENERGY MANAGEMENT）',
  'FULL PRODUCTION-LINE UPGRADE': '全线升级（FULL PRODUCTION-LINE UPGRADE）',
  'LOW-CARBON MATERIAL / SUPPLIER':
    '低碳材料与供应商（LOW-CARBON MATERIAL / SUPPLIER）',
  INVESTMENT: '投入（INVESTMENT）',
  CAPABILITY: '能力（CAPABILITY）',
  'ACTUAL REDUCTION': '实际减排（ACTUAL REDUCTION）',
  RESIDUAL: '剩余责任（RESIDUAL）',
  'ALLOWANCE LEDGER': '配额台账（ALLOWANCE LEDGER）',
  'OFFSET LEDGER': '抵消台账（OFFSET LEDGER）',
  'BUY / USE / SELL / BANK':
    '购买 / 使用 / 出售 / 结转（BUY / USE / SELL / BANK）',
  SETTLEMENT: '结算（SETTLEMENT）',
  'FACT LAYER': '事实层（FACT LAYER）',
  'COMMUNICATION LAYER': '传播层（COMMUNICATION LAYER）',
  PUBLICATION: '发布（PUBLICATION）',
  VERIFICATION: '核验（VERIFICATION）',
  CORRECTION: '更正（CORRECTION）',
  'ANNUAL RESULT': '年度结果（ANNUAL RESULT）',
  'CUSTOMER FEEDBACK': '客户反馈（CUSTOMER FEEDBACK）',
  'EMPLOYEE FEEDBACK': '员工反馈（EMPLOYEE FEEDBACK）',
  QUALIFICATION: '资格（QUALIFICATION）',
  'CAUSAL DEBRIEF': '因果复盘（CAUSAL DEBRIEF）',
  'NEXT CYCLE': '下一周期（NEXT CYCLE）',
  'SIX-YEAR FINAL REVIEW': '六年总结评阅（SIX-YEAR FINAL REVIEW）',
  CARBON_FLOW_CONTEXT: '碳流情境（CARBON_FLOW_CONTEXT）',
  MEASUREMENT_CONFIDENCE: '测量置信度（MEASUREMENT_CONFIDENCE）',
  ALLOCATION_CONFIDENCE: '分配置信度（ALLOCATION_CONFIDENCE）',
  RESPONSIBILITY_BASELINE: '碳责任基线（RESPONSIBILITY_BASELINE）',
  PRODUCT_CARBON_RESULTS: '产品碳排放结果（PRODUCT_CARBON_RESULTS）',
  EVIDENCE_PROVENANCE: '证据来源（EVIDENCE_PROVENANCE）',
  ACTUAL_REDUCTION_READ_ONLY: '实际减排只读结果（ACTUAL_REDUCTION_READ_ONLY）',
  RESIDUAL_OR_COMPLIANCE_REQUIREMENT:
    '剩余责任与履约需求（RESIDUAL_OR_COMPLIANCE_REQUIREMENT）',
  ALLOWANCE_LEDGER: '配额台账（ALLOWANCE_LEDGER）',
  OFFSET_LEDGER: '抵消台账（OFFSET_LEDGER）',
  ACQUISITION: '取得（ACQUISITION）',
  APPLICATION: '使用（APPLICATION）',
  SURRENDER: '清缴（SURRENDER）',
  CANCELLATION: '注销（CANCELLATION）',
  EXPIRATION: '到期（EXPIRATION）',
  PURCHASE: '购买（PURCHASE）',
  SALE: '出售（SALE）',
  BANK_CARRY_FORWARD: '结转下期（BANK_CARRY_FORWARD）',
  COMPLIANCE_RECONCILIATION: '履约对账（COMPLIANCE_RECONCILIATION）',
  ASSET_EVIDENCE_PROVENANCE: '碳资产证据来源（ASSET_EVIDENCE_PROVENANCE）',
  ANNUAL_CARBON_ASSET_ACCOUNTING_STATEMENT:
    '年度碳资产核算报表（ANNUAL_CARBON_ASSET_ACCOUNTING_STATEMENT）',
  ANNUAL_CARBON_INFORMATION_DISCLOSURE_REPORT:
    '年度碳信息披露报告（ANNUAL_CARBON_INFORMATION_DISCLOSURE_REPORT）',
  VERIFICATION_AND_DISCLOSURE_STRATEGY:
    '核验与披露策略（VERIFICATION_AND_DISCLOSURE_STRATEGY）',
  VERIFICATION_DISCLOSURE_STRATEGY:
    '核验与披露策略（VERIFICATION_DISCLOSURE_STRATEGY）',
  FORMAL_PUBLICATION: '正式发布（FORMAL_PUBLICATION）',
  ACCOUNTING_STATEMENT: '核算报表（ACCOUNTING_STATEMENT）',
  DISCLOSURE_REPORT: '披露报告（DISCLOSURE_REPORT）',
  CLAIM_ASSESSMENTS: '声明评估（CLAIM_ASSESSMENTS）',
  FOLLOW_UP_HISTORY: '后续处理历史（FOLLOW_UP_HISTORY）',
  COMMUNICATION_EVIDENCE_PROVENANCE:
    '披露证据来源（COMMUNICATION_EVIDENCE_PROVENANCE）',
  ANNUAL_RESULT_OVERVIEW: '年度结果概览（ANNUAL_RESULT_OVERVIEW）',
  ECONOMIC_AND_CARBON_RESULTS: '经济与碳结果（ECONOMIC_AND_CARBON_RESULTS）',
  CUSTOMER_FEEDBACK_CHAIN: '客户反馈链（CUSTOMER_FEEDBACK_CHAIN）',
  EMPLOYEE_FEEDBACK_CHAIN: '员工反馈链（EMPLOYEE_FEEDBACK_CHAIN）',
  QUALIFICATION_STATUS_AND_HISTORY:
    '资格状态与历史（QUALIFICATION_STATUS_AND_HISTORY）',
  CIPI_STATUS: '综合绩效指数状态（CIPI_STATUS）',
  CAUSAL_REVIEW: '因果复盘（CAUSAL_REVIEW）',
  D19_NEXT_CYCLE_STRATEGIC_PRIORITY:
    '下期战略重点（D19_NEXT_CYCLE_STRATEGIC_PRIORITY）',
  D20_NEXT_CYCLE_COMMITMENT_AMBITION:
    '下期承诺水平（D20_NEXT_CYCLE_COMMITMENT_AMBITION）',
  NEXT_CYCLE_DECISION_BUNDLE: '下期决策组合（NEXT_CYCLE_DECISION_BUNDLE）',
  CLOSING_HANDOFF: '期末结转交接（CLOSING_HANDOFF）',
  STRUCTURAL_CONTEXT: '结构情境（STRUCTURAL_CONTEXT）',
  CARBON_CORE: '碳核算核心（CARBON_CORE）',
  READ_ONLY_TEACHING_CONTEXT: '只读教学情境（READ_ONLY_TEACHING_CONTEXT）',
  'NON-AUTHORITATIVE CAPTURE':
    '仅记录草稿，不构成权威结果（NON-AUTHORITATIVE CAPTURE）',
  'STRUCTURAL HOME': '信息分区（STRUCTURAL HOME）',
  'ORDERED PRODUCT BLOCK': '披露流程（ORDERED PRODUCT BLOCK）',
  'MODEL STATUS': '模型状态（MODEL STATUS）',
  'EVIDENCE SOURCE': '证据来源（EVIDENCE SOURCE）',
  'LEARNING EVIDENCE': '学习证据（LEARNING EVIDENCE）',
  'SEPARATE GOVERNED IDENTITY': '分别治理的状态（SEPARATE GOVERNED IDENTITY）',
  'MISSING AUTHORITY / PARAMETER':
    '缺少授权依据或参数（MISSING AUTHORITY / PARAMETER）',
  'CURRENT TEACHING V1': '当前教学版（CURRENT TEACHING V1）',
  'CAPABILITY ≠ EXECUTION READINESS':
    '具备适配能力 ≠ 已满足执行条件（CAPABILITY ≠ EXECUTION READINESS）',
  'CURRENT ANCHOR': '当前教学情境（CURRENT ANCHOR）',
  'READ-ONLY SIX-YEAR ANCHOR TIMELINE':
    '六年情境时间线（只读）（READ-ONLY SIX-YEAR ANCHOR TIMELINE）',
  'A03 AUTHORITY / CLOSING GATE':
    '下期授权与结账条件（A03 AUTHORITY / CLOSING GATE）',
  'OPEN / BLOCKED': '未决 / 暂不可用（OPEN / BLOCKED）',
  'OPEN / BLOCKED_BY_DESIGN':
    '未决 / 设计边界内暂不可用（OPEN / BLOCKED_BY_DESIGN）',
  REJECTED: '未接受（REJECTED）',
  Preview: '预览',
  Explainability: '解释充分性（Explainability）',
  'Carbon Truth': '碳事实（Carbon Truth）',
  'Carbon Core': '碳核算核心（Carbon Core）',
  'Actual Reduction': '实际减排（Actual Reduction）',
  'Enterprise Actual Reduction': '企业实际减排（Enterprise Actual Reduction）',
  'Operating Carbon Net Change': '运营碳净变化（Operating Carbon Net Change）',
  'Operating Carbon Net After':
    '减碳后运营碳净值（Operating Carbon Net After）',
  'Carbon Out After': '减碳后碳流出（Carbon Out After）',
  'C1 Product Carbon After': 'C1 减碳后产品碳排放（C1 Product Carbon After）',
  'C2 Product Carbon After': 'C2 减碳后产品碳排放（C2 Product Carbon After）',
  'Procurement / Carbon In': '采购 / 碳流入（Procurement / Carbon In）',
  'Production / Carbon Add': '生产 / 碳增加（Production / Carbon Add）',
  'Purchased-electricity production carbon':
    '购电生产碳排放（Purchased-electricity production carbon）',
  'Offset Requirement': '抵碳需求（Offset Requirement）',
  'Closing Balance': '期末余额（Closing Balance）',
  'Neutrality Status': '碳中和状态（Neutrality Status）',
  'Economic Benefit': '经济效益（Economic Benefit）',
  'Carbon Outcome': '碳结果（Carbon Outcome）',
  Sincerity: '诚意（Sincerity）',
  'Composite Status': '综合状态（Composite Status）',
  'Initial Strategic Commitment':
    '初始战略承诺（Initial Strategic Commitment）',
  'Initial Resource Posture': '初始资源配置（Initial Resource Posture）',
  'Data / Evidence Remediation Priority':
    '数据与证据补正优先级（Data / Evidence Remediation Priority）',
  'Data Uncertainty Response': '数据不确定性应对（Data Uncertainty Response）',
  'Reduction Investment Intensity':
    '减碳投入强度（Reduction Investment Intensity）',
  'Reduction Portfolio': '减碳项目组合（Reduction Portfolio）',
  'Investment Horizon': '投入期限（Investment Horizon）',
  'Product / Production Mix': '产品与生产组合（Product / Production Mix）',
  'Market Targeting': '目标市场选择（Market Targeting）',
  'Remaining Reduction Commitment':
    '剩余减碳承诺（Remaining Reduction Commitment）',
  'Offset Intensity': '抵碳强度（Offset Intensity）',
  'Carbon Asset Buffer': '碳资产缓冲（Carbon Asset Buffer）',
  'WHAT Disclosure': '披露内容（WHAT Disclosure）',
  'HOW / WHERE': '方式与渠道（HOW / WHERE）',
  WHEN: '时间安排（WHEN）',
  'Evidence × Communication Intensity':
    '证据 × 传播强度（Evidence × Communication Intensity）',
  'Verification / Audit Response':
    '核验与审计回应（Verification / Audit Response）',
  'Disclosure Correction / Crisis':
    '披露更正与危机应对（Disclosure Correction / Crisis）',
  'Next-cycle Strategic Priority':
    '下一周期战略重点（Next-cycle Strategic Priority）',
  'Next-cycle Commitment Ambition':
    '下一周期承诺水平（Next-cycle Commitment Ambition）',
  'Measurement Confidence': '测量置信度（Measurement Confidence）',
  'Allocation Confidence': '分配置信度（Allocation Confidence）',
  'Measurement Investment': '测量投入（Measurement Investment）',
  Investment: '投入（Investment）',
  Capability: '能力（Capability）',
  Allowance: '配额（Allowance）',
  Offset: '抵消（Offset）',
  Profit: '利润（Profit）',
  Revenue: '收入（Revenue）',
  Qualification: '资格（Qualification）',
  Stakeholder: '利益相关方（Stakeholder）',
  Organization: '组织（Organization）',
  'Product Carbon': '产品碳排放（Product Carbon）',
  'Simulation Outcome': '模拟结果（Simulation Outcome）',
  'Fact Layer': '事实层（Fact Layer）',
  'Communication Layer': '传播层（Communication Layer）',
  Plan: '计划（Plan）',
  Effect: '效果（Effect）',
  Missing: '缺失（Missing）',
  Zero: '零（Zero）',
  'C1 Visibility': 'C1 看得见（C1 Visibility）',
  'C2 Allocation': 'C2 分得准（C2 Allocation）',
  'C3 Recognition': 'C3 认得够（C3 Recognition）',
  target: '目标（target）',
  capabilityGap: '能力差距（capabilityGap）',
  budgetIntent: '预算意向（budgetIntent）',
  'Create structural preview': '生成流程预览',
  'Confirm decision shell': '确认本步（界面状态）',
  'Lock confirmed shell': '锁定本步（界面状态）',
  'Advance approved gate': '进入下一工作台',
  'Enter Closing': '进入期末结账',
  'Read previous': '回看上一步',
  'Confirm & lock step': '确认并锁定本步',
  '-- Please select --': '请选择',
  '-- Please select domain --': '请选择领域',
  '-- Please select intensity --': '请选择强度',
  '-- Please select ambition --': '请选择承诺水平',
  '-- Please select evidence --': '请选择证据',
  'Preview D6 portfolio': '预览 D6 项目组合',
  'Locked workbench is read-only.': '已锁定的工作台仅可回看。',
  'requires at least one selection.': '请至少选择一项。',
  'requires explicit learner selection.': '请先明确选择。',
  'selections must be unique.': '选择项不得重复。',
  'uses an unknown active catalog value.': '选择不在当前有效目录内。',
  'uses an unknown catalog value.': '选择不在已批准目录内。',
  'uses an unknown governed catalog value.': '选择不在已批准目录内。',
  'SITUATION → DECISION → CONSEQUENCE': '情境 → 决策 → 后果',
  'LOCKED · reading does not reopen or mutate this workbench':
    '已锁定 · 回看不会重新开放或修改本工作台',
  'current approved shell gate': '当前已批准的界面流程',
  'no executed fact': '尚未形成执行事实',
  'non-authoritative': '不构成权威结果',
  'governed portfolio UI draft': '项目组合草稿',
  'governed Production UI draft': '正式目录选择草稿',
  'governed UI draft': '决策草稿',
  'Annual Carbon Responsibility Baseline · FORMED (shell state only)':
    '年度碳责任基线 · 已形成（仅界面状态）',
  'Annual Carbon Responsibility Baseline · NOT FORMED (not zero)':
    '年度碳责任基线 · 尚未形成（不等于零）',
  'All four learner inputs are mandatory; no default.':
    '四项均须由学习者明确填写，无默认值。',
  'P2 · Commitment governed controls': 'P2 · 确碳决策',
  'P3 · D6 Reduction Portfolio': 'P3 · D6 减碳项目组合',
  'P4 · Offsets governed projection': 'P4 · 抵碳信息与决策',
  'P5 · Communication governed projection': 'P5 · 披碳信息与决策',
  'D3/D4 use governed identities. Measurement Confidence ≠ Allocation Confidence. Missing controls fail closed with null.':
    'D3/D4 遵循既有决策身份。测量置信度 ≠ 分配置信度；缺少授权依据的控件不可用，数值保持缺失。',
  'D5 / D6 / D7 / D10 remain separate. Portfolio selection never creates Actual Reduction.':
    'D5 / D6 / D7 / D10 分别保留。选择项目组合不会直接产生实际减排。',
  'Actual Reduction ≠ Allowance ≠ Offset · Bank = closing → successor opening · Bank ≠ revenue':
    '实际减排 ≠ 配额 ≠ 抵消；结转连接期末余额与下期期初，不是收入。',
  'Fact Layer ≠ Communication Layer · FLAGGED ≠ CONFIRMED_VIOLATION · missing evidence ≠ violation':
    '事实层 ≠ 传播层；标记疑点 ≠ 确认违规；证据缺失 ≠ 违规。',
  'Project economics / effects / timing · MISSING_PARAMETER · value null':
    '项目经济性、效果与时序 · 参数待批准（MISSING_PARAMETER）· 数值缺失',
  'BLOCKED_POLICY · value null · no Production-approved catalog; TEST/FIXTURE is not student-active':
    '规则待批准（BLOCKED_POLICY）· 数值缺失；尚无正式批准目录，测试目录不可供学习者选择。',
  'no Y7 created': '不创建第七年',
  'successor requires this ClosingState reference':
    '下一年度须引用本年度期末状态',
  'context only · no event-engine truth authority':
    '仅作教学情境，不具备事件引擎事实权限',
  'value null': '数值缺失',
  'AI authoritative = false': 'AI 无权作出权威评定',
  'Role guidance:': '角色轮换依据：',
  'Next-cycle authorization:': '下一周期授权：',
  'Adapter capability': '适配器能力',
  execution: '执行状态',
  bundle: '决策组合',
  closing: '期末结账',
  successor: '下一年度',
  catalog: '目录',
  downstream: '下游执行',
  value: '数值',
  authority: '权威依据',
  sources: '来源',
  decisions: '决策',
  'explicit choice': '明确选择',
  'No approved current value; missing is not zero.':
    '暂无已批准的当前值；缺失不等于零。',
  'Separate from Measurement Confidence; no approved current value.':
    '与测量置信度分别治理；暂无已批准的当前值。',
  'C1→C2→C3 shell state only; no percentage or amount.':
    '仅展示 C1→C2→C3 界面状态，不生成百分比或金额。',
  'No governed P2 product-carbon result is available; UI performs no allocation.':
    '暂无 P2 权威产品碳排放结果；界面不执行分配计算。',
  'Structural context only; no new emission boundary.':
    '仅作结构情境，不新增排放边界。',
  'Exact governed artifact/version/context was not supplied; unavailable is not synthesized.':
    '未提供对应的权威对象、版本或上下文；保持不可用，不补造。',
  'No approved rule or parameter is available; no value was inferred.':
    '尚无已批准规则或参数；不推算数值。',
  'Factory-issued Allowance Ledger only; browser creation is prohibited.':
    '仅使用计算工厂出具的配额台账；浏览器不得创建。',
  'Factory-issued Offset Ledger only; never merged with Allowance Ledger.':
    '仅使用计算工厂出具的抵消台账；不与配额台账合并。',
  'Read only; asset settlement cannot modify this value.':
    '只读；碳资产结算不得修改此值。',
  'No quantity, transaction or compliance effect.':
    '不产生数量、交易或履约效应。',
  'Bank is closing balance → successor opening lineage, not a transaction or revenue.':
    '结转记录期末余额到下期期初的来源关系，不是交易或收入。',
  'No exact current compliance authority was supplied.':
    '未提供当前履约的精确权威依据。',
  'No exact reconciled ledgers were supplied.': '未提供精确的已对账台账。',
  'Exact factory evidence is required.': '须提供对应计算工厂的精确证据。',
  'Safety Reserve remains MISSING_PARAMETER; no quantity is inferred.':
    '安全储备参数仍待批准（MISSING_PARAMETER）；不推算数量。',
  'No Production-approved catalog; TEST/FIXTURE catalogs are not active learner choices.':
    '尚无正式批准目录；测试目录不可供学习者选择。',
  'No authoritative PHASE9 settlement object was supplied.':
    '未提供阶段 9 的权威结算对象。',
  'No authoritative PHASE10 settlement object was supplied.':
    '未提供阶段 10 的权威结算对象。',
  'No settled Phase10 object was injected into the static reference.':
    '静态参考未注入阶段 10 的已结算对象。',
  'Finance is separate from read-only Carbon Truth; neither is synthesized.':
    '财务与只读碳事实分别治理；两者均不补造。',
  'Final formula, weights, normalization, thresholds and grades are not approved.':
    '最终公式、权重、归一化、门槛与等级尚未批准。',
  'Incomplete causal links remain missing rather than fabricated.':
    '不完整的因果环节保持缺失，不补造。',
  'Explicit selection only; authorization context is absent.':
    '仅记录明确选择；缺少授权上下文。',
  'Ambition, target, capability gap and budget intent are all explicit.':
    '承诺水平、目标、能力差距和预算意向均须明确填写。',
  'Static BD has no governed learner/team authorization context.':
    '静态 BD 参考不具备受治理的学习者或团队授权上下文。',
  'Available only in Y6.': '仅在第六年可用。',
  'Non-authoritative explicit learner draft only.':
    '仅为学习者明确选择的草稿，不构成权威结果。',
  'These unresolved paths do not become zero.': '这些未决路径不得以零代替。',
  'Confidence is limited to the cited governed references.':
    '可信范围仅限所引用的治理依据。',
  'REQUIRED_FOR_CLOSING until a valid current A03 bundle exists.':
    '在具备当前有效的 A03 决策组合前，保持结账前置要求。',
  'Missing != Zero': '缺失 ≠ 零',
  'Investment != Capability != Actual Reduction': '投入 ≠ 能力 ≠ 实际减排',
  'Plan COMPLETED != Effect VERIFIED': '计划已完成 ≠ 效果已核验',
  'Enterprise Actual Reduction != Operating Carbon Net Change':
    '企业实际减排 ≠ 运营碳净变化',
  'Measurement Confidence != Allocation Confidence': '测量置信度 ≠ 分配置信度',
  'Allowance Ledger != Offset Ledger': '配额台账 ≠ 抵消台账',
  'Banked asset != current-period revenue': '结转资产 ≠ 本期收入',
  'Simulation Outcome != Carbon Truth': '模拟结果 ≠ 碳事实',
  'PLAYER_DECISION != EXECUTED FACT': '学习者决策 ≠ 执行事实',
  'UI_DRAFT != PLAYER_DECISION': '界面草稿 ≠ 正式学习者决策',
  'Reduction != Offset': '减排 ≠ 抵消',
  'Carbon Neutrality != Low-Carbon Product': '碳中和 ≠ 低碳产品',
  'Missing evidence != violation': '证据缺失 ≠ 违规',
  'SUPPORTED != FLAGGED != AMBIGUOUS != CONFIRMED_VIOLATION':
    '证据支持 ≠ 标记疑点 ≠ 尚不明确 ≠ 已确认违规',
  'Factory / Production Line · 情境插画':
    '工厂与生产线 · Factory / Production Line',
  'Enterprise World · 情境插画': '企业世界 · Enterprise World',
  'Governed Fact · 碳事实与证据': '碳事实与证据 · Governed Fact',
  'Meaningful Mistake · 解释与反思': '解释与反思 · Meaningful Mistake',
  'Narrative Event · 交付窗口提前': '情境事件 · 交付窗口提前',
  'Missing ≠ Zero。': '缺失不等于零。',
  'Actual Reduction 由 Carbon Core 计算。投资、项目选择和情境讨论均不产生碳事实。':
    '实际减排由碳核算核心（Carbon Core）计算。投资、项目选择和情境讨论均不产生碳事实。',
  'MIXED dominance 78/81；Profit；Qualification threshold；Stakeholder / Organization / Capability 数值效应；Round 14 smoothing / materiality。':
    '混合市场策略优势观察（MIXED dominance）78/81；利润（Profit）；资格门槛（Qualification threshold）；利益相关方（Stakeholder）、组织（Organization）与能力（Capability）的数值效应；第 14 轮平滑与重要性规则。',
};
const DISPLAY_PATTERN = new RegExp(
  '(?<![A-Za-z0-9_:/.-])(?:' +
    Object.keys(CHINESE_LABELS)
      .sort((a, b) => b.length - a.length)
      .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') +
    ')(?![A-Za-z0-9_:/.-])',
  'g',
);
export function displayText(value) {
  return String(value).replace(DISPLAY_PATTERN, (term) => CHINESE_LABELS[term]);
}

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
    if (text !== undefined) node.textContent = displayText(text);
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
    img.alt = displayText(alt);
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
    q('#g1-dialog-title').textContent = displayText(title);
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
      q('#g1-scene-caption').textContent = displayText(
        factory
          ? 'Factory / Production Line · 情境插画'
          : state.active === 0
            ? 'Enterprise World · 情境插画'
            : '历史场景 · 保留待补',
      );
      const roles = q('#g1-role-portraits');
      if (!roles.children.length)
        for (const role of state.projection.roles) {
          const card = el('div', undefined, 'g1-role');
          picture(`assets/g1/role-${role}.jpg`, `${role} 虚构角色肖像`, card);
          card.append(
            el('b', displayText(role).split('（')[0].replace('首席', '')),
            Object.assign(doc.createElement('small'), { textContent: role }),
          );
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
      q('#g1-current-status').textContent = displayText(
        `${TITLES[state.active]} · ${LIFECYCLE[state.lifecycle[state.active]]}`,
      );
    },
  };
}
