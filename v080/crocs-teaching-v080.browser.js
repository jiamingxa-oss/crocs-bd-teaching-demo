"use strict";
(() => {
  // packages/simulation-core/src/deterministic-hash.ts
  function deterministicSha256(value) {
    const canonical = canonicalize(value);
    const hostProcess = globalThis.process;
    const nodeCrypto = hostProcess?.getBuiltinModule ? hostProcess.getBuiltinModule("node:crypto") : void 0;
    return nodeCrypto?.createHash("sha256").update(canonical).digest("hex") ?? sha256(new TextEncoder().encode(canonical));
  }
  var roundConstants = Object.freeze([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  function sha256(input) {
    const bitLength = input.length * 8;
    const byteLength = Math.ceil((input.length + 9) / 64) * 64;
    const data = new Uint8Array(byteLength);
    data.set(input);
    data[input.length] = 128;
    const view = new DataView(data.buffer);
    view.setUint32(byteLength - 8, Math.floor(bitLength / 4294967296), false);
    view.setUint32(byteLength - 4, bitLength >>> 0, false);
    const hash = [
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ];
    const words = new Uint32Array(64);
    for (let offset = 0; offset < byteLength; offset += 64) {
      for (let i = 0; i < 16; i += 1)
        words[i] = view.getUint32(offset + i * 4, false);
      for (let i = 16; i < 64; i += 1) {
        const a2 = words[i - 15];
        const b2 = words[i - 2];
        const s0 = rotate(a2, 7) ^ rotate(a2, 18) ^ a2 >>> 3;
        const s1 = rotate(b2, 17) ^ rotate(b2, 19) ^ b2 >>> 10;
        words[i] = words[i - 16] + s0 + words[i - 7] + s1 >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = hash;
      for (let i = 0; i < 64; i += 1) {
        const sum1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
        const choice = e & f ^ ~e & g;
        const t1 = h + sum1 + choice + roundConstants[i] + words[i] >>> 0;
        const sum0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
        const majority = a & b ^ a & c ^ b & c;
        const t2 = sum0 + majority >>> 0;
        h = g;
        g = f;
        f = e;
        e = d + t1 >>> 0;
        d = c;
        c = b;
        b = a;
        a = t1 + t2 >>> 0;
      }
      const next = [a, b, c, d, e, f, g, h];
      for (let i = 0; i < 8; i += 1) hash[i] = hash[i] + next[i] >>> 0;
    }
    return hash.map((word) => word.toString(16).padStart(8, "0")).join("");
  }
  function rotate(value, count) {
    return value >>> count | value << 32 - count;
  }
  function canonicalize(value) {
    if (value === void 0) return "undefined";
    if (value === null) return "null";
    if (typeof value === "string" || typeof value === "boolean")
      return JSON.stringify(value);
    if (typeof value === "number") {
      if (!Number.isFinite(value))
        throw new TypeError("Deterministic values must use finite numbers.");
      return JSON.stringify(value);
    }
    if (Array.isArray(value))
      return `[${value.map((item) => canonicalize(item)).join(",")}]`;
    if (typeof value === "object") {
      const record = value;
      const entries = Object.entries(record).sort(
        ([left], [right]) => left.localeCompare(right)
      );
      return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(",")}}`;
    }
    throw new TypeError(`Unsupported deterministic value type: ${typeof value}.`);
  }

  // packages/domain-kernel/src/domain-error.ts
  var DomainError = class extends Error {
    code;
    details;
    constructor(code, message, details = {}) {
      super(message);
      this.name = new.target.name;
      this.code = code;
      this.details = Object.freeze({ ...details });
    }
  };
  var InvalidIdentifierError = class extends DomainError {
    constructor(kind2, value) {
      super("INVALID_IDENTIFIER", `${kind2} must be a non-blank identifier.`, {
        kind: kind2,
        value
      });
    }
  };
  var InvalidValidityPeriodError = class extends DomainError {
    constructor(message) {
      super("INVALID_VALIDITY_PERIOD", message);
    }
  };

  // packages/domain-kernel/src/identifier.ts
  var Identifier = class _Identifier {
    kind;
    value;
    constructor(kind2, value) {
      this.kind = kind2;
      this.value = value;
      Object.freeze(this);
    }
    static create(kind2, value) {
      const normalized = value.trim();
      if (normalized.length === 0) {
        throw new InvalidIdentifierError(kind2, value);
      }
      return new _Identifier(kind2, normalized);
    }
    equals(other) {
      return this.kind === other.kind && this.value === other.value;
    }
    toString() {
      return this.value;
    }
  };
  var createEnterpriseId = (value) => Identifier.create("Enterprise", value);
  var createReportingEntityId = (value) => Identifier.create("ReportingEntity", value);
  var createReportingEntityVersionId = (value) => Identifier.create("ReportingEntityVersion", value);
  var createReportingEntityMembershipId = (value) => Identifier.create("ReportingEntityMembership", value);
  var createFacilityId = (value) => Identifier.create("Facility", value);
  var createActorId = (value) => Identifier.create("Actor", value);

  // packages/domain-kernel/src/validity-period.ts
  var ValidityPeriod = class _ValidityPeriod {
    #validFromTime;
    #validToTime;
    constructor(validFromTime, validToTime) {
      this.#validFromTime = validFromTime;
      this.#validToTime = validToTime;
      Object.freeze(this);
    }
    static create(validFrom, validTo) {
      const validFromTime = validFrom.getTime();
      const validToTime = validTo?.getTime();
      if (!Number.isFinite(validFromTime)) {
        throw new InvalidValidityPeriodError(
          "validFrom must be a valid instant."
        );
      }
      if (validToTime !== void 0 && !Number.isFinite(validToTime)) {
        throw new InvalidValidityPeriodError("validTo must be a valid instant.");
      }
      if (validToTime !== void 0 && validToTime <= validFromTime) {
        throw new InvalidValidityPeriodError(
          "validTo must be strictly after validFrom."
        );
      }
      return new _ValidityPeriod(validFromTime, validToTime);
    }
    get validFrom() {
      return new Date(this.#validFromTime);
    }
    get validTo() {
      return this.#validToTime === void 0 ? void 0 : new Date(this.#validToTime);
    }
    contains(other) {
      const thisEnd = this.#validToTime ?? Number.POSITIVE_INFINITY;
      const otherEnd = other.#validToTime ?? Number.POSITIVE_INFINITY;
      return this.#validFromTime <= other.#validFromTime && thisEnd >= otherEnd;
    }
    containsInstant(instant) {
      const time = instant.getTime();
      if (!Number.isFinite(time)) {
        return false;
      }
      return time >= this.#validFromTime && (this.#validToTime === void 0 || time < this.#validToTime);
    }
    overlaps(other) {
      const thisEnd = this.#validToTime ?? Number.POSITIVE_INFINITY;
      const otherEnd = other.#validToTime ?? Number.POSITIVE_INFINITY;
      return this.#validFromTime < otherEnd && other.#validFromTime < thisEnd;
    }
    equals(other) {
      return this.#validFromTime === other.#validFromTime && this.#validToTime === other.#validToTime;
    }
  };

  // packages/simulation-core/src/simulation-error.ts
  var simulationFoundationErrorCode = "CARBON_SIMULATION_FOUNDATION_INVALID";
  function simulationInvalid(message, details = {}) {
    return new DomainError(simulationFoundationErrorCode, message, details);
  }
  function nonBlank(value, field) {
    const normalized = value.trim();
    if (normalized.length === 0)
      throw simulationInvalid(`${field} must be non-blank.`, { field });
    return normalized;
  }
  function positiveSafeInteger(value, field) {
    if (!Number.isSafeInteger(value) || value <= 0)
      throw simulationInvalid(`${field} must be a positive safe integer.`, {
        field,
        value
      });
    return value;
  }
  function nonNegativeFinite(value, field) {
    if (!Number.isFinite(value) || value < 0)
      throw simulationInvalid(`${field} must be a non-negative finite number.`, {
        field,
        value
      });
    return value;
  }
  function unitInterval(value, field) {
    if (!Number.isFinite(value) || value < 0 || value > 1)
      throw simulationInvalid(`${field} must be between 0 and 1.`, {
        field,
        value
      });
    return value;
  }

  // packages/simulation-core/src/teaching-v080-business.ts
  var teachingV080CapabilityKeys = [
    "ENERGY_EFFICIENCY",
    "EQUIPMENT_EFFICIENCY",
    "PROCESS_REDUCTION",
    "CARBON_MANAGEMENT",
    "DATA",
    "DISCLOSURE"
  ];
  function createBusinessStateV080(input) {
    const cash = nonNegativeFinite(input.cash, "cash");
    const liquidityReserve = nonNegativeFinite(
      input.liquidityReserve,
      "liquidityReserve"
    );
    const committedFutureOutflow = nonNegativeFinite(
      input.committedFutureOutflow ?? 0,
      "committedFutureOutflow"
    );
    const financingObligation = nonNegativeFinite(
      input.financingObligation ?? 0,
      "financingObligation"
    );
    const production = normalizeProduction({
      c1Production: input.c1Production ?? 0,
      c2Production: input.c2Production ?? 0,
      c1Inventory: input.c1Inventory ?? 0,
      c2Inventory: input.c2Inventory ?? 0,
      productionCapacity: input.productionCapacity
    });
    return Object.freeze({
      cash,
      liquidityReserve,
      roundRevenue: 0,
      simulationOperatingProfit: 0,
      operatingCost: 0,
      investmentSpend: 0,
      carbonComplianceCost: 0,
      dataEvidenceCost: 0,
      carbonAssetBufferCashOutflow: 0,
      availableDiscretionaryCash: calculateAvailableDiscretionaryCash({
        cash,
        liquidityReserve,
        committedFutureOutflow,
        financingObligation
      }),
      ...production,
      committedFutureOutflow,
      financingObligation
    });
  }
  function resolveBusinessRoundV080(input) {
    const opening = normalizeBusinessState(input.opening);
    const roundRevenue = nonNegativeFinite(input.roundRevenue, "roundRevenue");
    const operatingCost = nonNegativeFinite(input.operatingCost, "operatingCost");
    const investmentSpend = nonNegativeFinite(
      input.investmentSpend,
      "investmentSpend"
    );
    const carbonComplianceCost = nonNegativeFinite(
      input.carbonComplianceCost,
      "carbonComplianceCost"
    );
    const dataEvidenceCost = nonNegativeFinite(
      input.dataEvidenceCost,
      "dataEvidenceCost"
    );
    const carbonAssetBufferCashOutflow = nonNegativeFinite(
      input.carbonAssetBufferCashOutflow,
      "carbonAssetBufferCashOutflow"
    );
    const newCommittedFutureOutflow = nonNegativeFinite(
      input.newCommittedFutureOutflow ?? 0,
      "newCommittedFutureOutflow"
    );
    const voluntaryCashAllocation = investmentSpend + dataEvidenceCost + carbonAssetBufferCashOutflow;
    if (voluntaryCashAllocation > opening.availableDiscretionaryCash)
      throw simulationInvalid(
        "Voluntary Wave 2 spending cannot exceed opening available discretionary cash.",
        {
          voluntaryCashAllocation,
          availableDiscretionaryCash: opening.availableDiscretionaryCash
        }
      );
    const simulationOperatingProfit = roundRevenue - operatingCost - carbonComplianceCost - dataEvidenceCost;
    const cashChange = simulationOperatingProfit - investmentSpend - carbonAssetBufferCashOutflow;
    const cash = opening.cash + cashChange;
    if (cash < 0)
      throw simulationInvalid(
        "Wave 2 business resolution produced a cash shortfall; scenario remediation is required because active financing is not authorized.",
        { openingCash: opening.cash, cashChange }
      );
    const committedFutureOutflow = opening.committedFutureOutflow + newCommittedFutureOutflow;
    const production = normalizeProduction({
      c1Production: input.c1Production,
      c2Production: input.c2Production,
      c1Inventory: input.c1Inventory,
      c2Inventory: input.c2Inventory,
      productionCapacity: input.productionCapacity
    });
    const closing = Object.freeze({
      cash,
      liquidityReserve: opening.liquidityReserve,
      roundRevenue,
      simulationOperatingProfit,
      operatingCost,
      investmentSpend,
      carbonComplianceCost,
      dataEvidenceCost,
      carbonAssetBufferCashOutflow,
      availableDiscretionaryCash: calculateAvailableDiscretionaryCash({
        cash,
        liquidityReserve: opening.liquidityReserve,
        committedFutureOutflow,
        financingObligation: opening.financingObligation
      }),
      ...production,
      committedFutureOutflow,
      financingObligation: opening.financingObligation
    });
    const payload = Object.freeze({
      provenance: "SIMULATION_OUTCOME",
      opening,
      closing,
      cashChange,
      voluntaryCashAllocation
    });
    return Object.freeze({
      ...payload,
      reference: `business-v080:${deterministicSha256(payload)}`
    });
  }
  function validateProductionMixV080(input) {
    const production = normalizeProduction({
      ...input,
      c1Inventory: 0,
      c2Inventory: 0
    });
    return Object.freeze({
      c1Production: production.c1Production,
      c2Production: production.c2Production
    });
  }
  function createCapabilityStateV080(input) {
    return Object.freeze({
      energyEfficiency: capabilityIndex(
        input.energyEfficiency,
        "energyEfficiency"
      ),
      equipmentEfficiency: capabilityIndex(
        input.equipmentEfficiency,
        "equipmentEfficiency"
      ),
      processReduction: capabilityIndex(
        input.processReduction,
        "processReduction"
      ),
      carbonManagement: capabilityIndex(
        input.carbonManagement,
        "carbonManagement"
      ),
      data: capabilityIndex(input.data, "data"),
      disclosure: capabilityIndex(input.disclosure, "disclosure")
    });
  }
  function applyAuthorizedCapabilityGainV080(input) {
    const opening = createCapabilityStateV080(input.opening);
    if (!teachingV080CapabilityKeys.includes(input.capability))
      throw simulationInvalid("Unknown v0.8 capability.", {
        capability: input.capability
      });
    const authorizedGain = nonNegativeFinite(
      input.authorizedGain,
      "authorizedGain"
    );
    const before = capabilityValue(opening, input.capability);
    const after = before + authorizedGain;
    if (after > 100)
      throw simulationInvalid(
        "Authorized capability gain would exceed the frozen 0-100 capability range.",
        { capability: input.capability, before, authorizedGain }
      );
    const closing = createCapabilityStateV080(
      replaceCapability(opening, input.capability, after)
    );
    const payload = Object.freeze({
      provenance: "SIMULATION_OUTCOME",
      capability: input.capability,
      before,
      authorizedGain,
      after,
      sourceParameterReference: nonBlank(
        input.sourceParameterReference,
        "sourceParameterReference"
      ),
      opening,
      closing
    });
    return Object.freeze({
      ...payload,
      reference: `capability-v080:${deterministicSha256(payload)}`
    });
  }
  function normalizeBusinessState(state) {
    const production = normalizeProduction(state);
    const normalized = Object.freeze({
      cash: nonNegativeFinite(state.cash, "cash"),
      liquidityReserve: nonNegativeFinite(
        state.liquidityReserve,
        "liquidityReserve"
      ),
      roundRevenue: nonNegativeFinite(state.roundRevenue, "roundRevenue"),
      simulationOperatingProfit: finiteNumber(
        state.simulationOperatingProfit,
        "simulationOperatingProfit"
      ),
      operatingCost: nonNegativeFinite(state.operatingCost, "operatingCost"),
      investmentSpend: nonNegativeFinite(
        state.investmentSpend,
        "investmentSpend"
      ),
      carbonComplianceCost: nonNegativeFinite(
        state.carbonComplianceCost,
        "carbonComplianceCost"
      ),
      dataEvidenceCost: nonNegativeFinite(
        state.dataEvidenceCost,
        "dataEvidenceCost"
      ),
      carbonAssetBufferCashOutflow: nonNegativeFinite(
        state.carbonAssetBufferCashOutflow,
        "carbonAssetBufferCashOutflow"
      ),
      availableDiscretionaryCash: nonNegativeFinite(
        state.availableDiscretionaryCash,
        "availableDiscretionaryCash"
      ),
      ...production,
      committedFutureOutflow: nonNegativeFinite(
        state.committedFutureOutflow,
        "committedFutureOutflow"
      ),
      financingObligation: nonNegativeFinite(
        state.financingObligation,
        "financingObligation"
      )
    });
    const expectedAvailable = calculateAvailableDiscretionaryCash(normalized);
    if (normalized.availableDiscretionaryCash !== expectedAvailable)
      throw simulationInvalid(
        "BusinessStateV080 available discretionary cash is inconsistent with its protected obligations.",
        {
          actual: normalized.availableDiscretionaryCash,
          expected: expectedAvailable
        }
      );
    return normalized;
  }
  function normalizeProduction(input) {
    const c1Production = nonNegativeFinite(input.c1Production, "c1Production");
    const c2Production = nonNegativeFinite(input.c2Production, "c2Production");
    const productionCapacity = nonNegativeFinite(
      input.productionCapacity,
      "productionCapacity"
    );
    if (c1Production + c2Production > productionCapacity)
      throw simulationInvalid("C1 + C2 production cannot exceed capacity.", {
        c1Production,
        c2Production,
        productionCapacity
      });
    return Object.freeze({
      c1Production,
      c2Production,
      c1Inventory: nonNegativeFinite(input.c1Inventory, "c1Inventory"),
      c2Inventory: nonNegativeFinite(input.c2Inventory, "c2Inventory"),
      productionCapacity
    });
  }
  function calculateAvailableDiscretionaryCash(input) {
    return Math.max(
      0,
      input.cash - input.liquidityReserve - input.committedFutureOutflow - input.financingObligation
    );
  }
  function capabilityIndex(value, field) {
    if (!Number.isFinite(value) || value < 0 || value > 100)
      throw simulationInvalid(`${field} must be between 0 and 100.`, {
        field,
        value
      });
    return value;
  }
  function capabilityValue(state, capability) {
    switch (capability) {
      case "ENERGY_EFFICIENCY":
        return state.energyEfficiency;
      case "EQUIPMENT_EFFICIENCY":
        return state.equipmentEfficiency;
      case "PROCESS_REDUCTION":
        return state.processReduction;
      case "CARBON_MANAGEMENT":
        return state.carbonManagement;
      case "DATA":
        return state.data;
      case "DISCLOSURE":
        return state.disclosure;
    }
  }
  function replaceCapability(state, capability, value) {
    switch (capability) {
      case "ENERGY_EFFICIENCY":
        return { ...state, energyEfficiency: value };
      case "EQUIPMENT_EFFICIENCY":
        return { ...state, equipmentEfficiency: value };
      case "PROCESS_REDUCTION":
        return { ...state, processReduction: value };
      case "CARBON_MANAGEMENT":
        return { ...state, carbonManagement: value };
      case "DATA":
        return { ...state, data: value };
      case "DISCLOSURE":
        return { ...state, disclosure: value };
    }
  }
  function finiteNumber(value, field) {
    if (!Number.isFinite(value))
      throw simulationInvalid(`${field} must be finite.`, { field, value });
    return value;
  }

  // packages/simulation-core/src/teaching-v080-bd-reference-catalog.ts
  var teachingV080BdReferenceScenarioVersion = "BD_TEXTBOOK_REFERENCE_SCENARIO_V1";
  var teachingV080BdReductionProjectIds = [
    "SOLAR_ENERGY_SHARE",
    "DECARBONIZATION_TECHNOLOGY",
    "EQUIPMENT_OPERATION_EFFICIENCY",
    "LOW_CARBON_SALES_LOGISTICS"
  ];
  var teachingV080BdReductionReferenceProjects = Object.freeze([
    project(
      "SOLAR_ENERGY_SHARE",
      "PRODUCTION_ELECTRICITY",
      "Increase solar-energy share in manufacturing",
      0.14
    ),
    project(
      "DECARBONIZATION_TECHNOLOGY",
      "PRODUCTION_MATERIAL_PROCESS",
      "Develop and use decarbonization technology",
      0.02
    ),
    project(
      "EQUIPMENT_OPERATION_EFFICIENCY",
      "PRODUCTION_EQUIPMENT_OPERATION",
      "Improve equipment operating efficiency",
      0.01
    ),
    project(
      "LOW_CARBON_SALES_LOGISTICS",
      "SALES_TRANSPORT_AND_EXHIBITION",
      "Low-carbon adjustment to sales transport and exhibition",
      0.03
    )
  ]);
  function project(projectId, activityDomain, title, referenceReductionRatio) {
    return Object.freeze({
      provenance: "P1_SCENARIO_FACT",
      projectId,
      activityDomain,
      title,
      referenceReductionRatio,
      sourceReference: "BD_APPENDIX_B_TABLE_B6_B7",
      scenarioVersion: teachingV080BdReferenceScenarioVersion
    });
  }

  // packages/simulation-core/src/teaching-v080-parameters.ts
  var teachingV080ParameterClasses = [
    "P0_STRUCTURAL_INVARIANT",
    "P1_SCENARIO_FACT",
    "P2_SIMULATION_PARAMETER",
    "P3_INSTRUCTOR_SETTING"
  ];
  var ParameterRegistryV080 = class _ParameterRegistryV080 {
    constructor(entriesById) {
      this.entriesById = entriesById;
      Object.freeze(this);
    }
    static empty() {
      return new _ParameterRegistryV080(/* @__PURE__ */ new Map());
    }
    get size() {
      return this.entriesById.size;
    }
    register(input) {
      const parameterId = nonBlank(input.parameterId, "parameterId");
      if (this.entriesById.has(parameterId))
        throw simulationInvalid(
          "ParameterRegistryV080 parameterId must be unique.",
          {
            parameterId
          }
        );
      validateParameterValue(input.value, parameterId);
      assertParameterClass(input.parameterClass);
      const calibrationEligible = input.parameterClass === "P2_SIMULATION_PARAMETER";
      const calibrationVersion = optionalNonBlank(
        input.calibrationVersion,
        "calibrationVersion"
      );
      if (calibrationEligible && calibrationVersion === void 0)
        throw simulationInvalid(
          "P2 simulation parameters require a calibrationVersion.",
          { parameterId }
        );
      if (!calibrationEligible && calibrationVersion !== void 0)
        throw simulationInvalid(
          "Only P2 simulation parameters may carry a calibrationVersion.",
          { parameterId, parameterClass: input.parameterClass }
        );
      const normalized = Object.freeze({
        parameterId,
        name: nonBlank(input.name, "name"),
        value: input.value,
        unit: optionalNonBlank(input.unit, "unit"),
        parameterClass: input.parameterClass,
        source: nonBlank(input.source, "source"),
        scenarioVersion: nonBlank(input.scenarioVersion, "scenarioVersion"),
        calibrationVersion,
        notes: optionalNonBlank(input.notes, "notes"),
        calibrationEligible
      });
      const entry = Object.freeze({
        ...normalized,
        reference: `parameter:${deterministicSha256(normalized)}`
      });
      const next = new Map(this.entriesById);
      next.set(parameterId, entry);
      return new _ParameterRegistryV080(next);
    }
    get(parameterId) {
      return this.entriesById.get(nonBlank(parameterId, "parameterId"));
    }
    require(parameterId) {
      const normalized = nonBlank(parameterId, "parameterId");
      const entry = this.entriesById.get(normalized);
      if (entry === void 0)
        throw simulationInvalid(
          "ParameterRegistryV080 parameter was not found.",
          {
            parameterId: normalized
          }
        );
      return entry;
    }
    list() {
      return Object.freeze(
        [...this.entriesById.values()].sort(
          (left, right) => left.parameterId.localeCompare(right.parameterId)
        )
      );
    }
    isCalibrationEligible(parameterId) {
      return this.require(parameterId).calibrationEligible;
    }
  };
  function assertParameterClass(value) {
    if (!teachingV080ParameterClasses.includes(value))
      throw simulationInvalid("Unknown v0.8 parameter class.", { value });
  }
  function validateParameterValue(value, parameterId) {
    if (typeof value === "number" && !Number.isFinite(value))
      throw simulationInvalid("Parameter value must be finite.", {
        parameterId,
        value
      });
  }
  function optionalNonBlank(value, field) {
    return value === void 0 ? void 0 : nonBlank(value, field);
  }

  // packages/simulation-core/src/teaching-v080-round-contract.ts
  var teachingV080DecisionSlotContracts = Object.freeze([
    slot("D1", 1, "COMMITMENT", "Initial Strategic Commitment"),
    slot("D2", 1, "COMMITMENT", "Initial Resource Posture"),
    slot("D3", 2, "COMMITMENT", "Data Uncertainty Response"),
    slot("D4", 2, "COMMITMENT", "Data / Evidence Remediation Priority"),
    slot("D5", 3, "REDUCTION", "Reduction Investment Intensity"),
    slot("D6", 3, "REDUCTION", "Reduction Portfolio"),
    slot("D7", 3, "REDUCTION", "Investment Horizon"),
    slot("D8", 4, "REDUCTION", "Product / Production Mix"),
    slot("D9", 4, "REDUCTION", "Market Targeting"),
    slot("D10", 4, "REDUCTION", "Remaining Reduction Commitment"),
    slot("D11", 5, "OFFSET", "Offset Intensity"),
    slot("D12", 5, "OFFSET", "Carbon Asset Buffer"),
    slot("D13", 6, "COMMUNICATION", "WHAT Disclosure"),
    slot("D14", 6, "COMMUNICATION", "HOW / WHERE"),
    slot("D15", 6, "COMMUNICATION", "WHEN"),
    slot("D16", 6, "COMMUNICATION", "Evidence \xD7 Communication Intensity"),
    slot("D17", 7, "COMMUNICATION", "Verification / Audit Response"),
    slot("D18", 7, "COMMUNICATION", "Disclosure Correction / Crisis"),
    slot("D19", 8, "STIMULATION", "Next-cycle Strategic Priority"),
    slot("D20", 8, "STIMULATION", "Next-cycle Commitment Ambition")
  ]);
  function teachingV080DecisionSlotsForRound(round) {
    if (!Number.isSafeInteger(round) || round < 1 || round > 8)
      throw simulationInvalid(
        "v0.8 decision-slot round must be an integer 1-8.",
        {
          round
        }
      );
    return Object.freeze(
      teachingV080DecisionSlotContracts.filter((item) => item.round === round)
    );
  }
  function requireTeachingV080DecisionSlot(slotId) {
    const contract = teachingV080DecisionSlotContracts.find(
      (item) => item.slotId === slotId
    );
    if (contract === void 0)
      throw simulationInvalid("Unknown frozen v0.8 decision slot.", { slotId });
    return contract;
  }
  function slot(slotId, round, stage, name) {
    return Object.freeze({ slotId, round, stage, name });
  }

  // packages/simulation-core/src/teaching-v080-execution-policy.ts
  var teachingV080DecisionExecutionPolicyVersion = "CROCS_TEACHING_SIM_V080_DECISION_EXECUTION_POLICY_V1";
  var teachingV080RemainingReductionResponses = [
    "HOLD_CURRENT_PLAN",
    "CONTINUE_APPROVED_PLAN",
    "ACCELERATE_APPROVED_PLAN"
  ];
  var teachingV080VerificationResponses = [
    "SUBMIT_EXISTING_EVIDENCE",
    "OBTAIN_ADDITIONAL_VERIFICATION",
    "ACKNOWLEDGE_AND_CORRECT"
  ];
  var teachingV080DisclosureCorrectionResponses = [
    "CORRECT_CLAIM",
    "WITHDRAW_CLAIM",
    "MAINTAIN_WITH_SUPPORTING_EVIDENCE"
  ];
  var teachingV080DisclosureContentKinds = [
    "ACTUAL_REDUCTION",
    "PRODUCT_CARBON",
    "OFFSET",
    "CARBON_NEUTRALITY",
    "FUTURE_COMMITMENT"
  ];
  var teachingV080AllowedActionClassesBySlot = Object.freeze({
    D1: Object.freeze(["INTENT_ONLY"]),
    D2: Object.freeze(["INTENT_ONLY"]),
    D3: Object.freeze(["INTENT_ONLY"]),
    D4: Object.freeze(["RESOURCE_ALLOCATION"]),
    D5: Object.freeze(["RESOURCE_ALLOCATION"]),
    D6: Object.freeze(["RESOURCE_ALLOCATION", "CARBON_GOVERNED_ACTION"]),
    D7: Object.freeze(["RESOURCE_ALLOCATION"]),
    D8: Object.freeze(["BUSINESS_OPERATION", "CARBON_GOVERNED_ACTION"]),
    D9: Object.freeze(["BUSINESS_OPERATION"]),
    D10: Object.freeze(["RESOURCE_ALLOCATION"]),
    D11: Object.freeze(["CARBON_GOVERNED_ACTION"]),
    D12: Object.freeze([
      "RESOURCE_ALLOCATION",
      "CARBON_GOVERNED_ACTION"
    ]),
    D13: Object.freeze(["COMMUNICATION_ACTION"]),
    D14: Object.freeze(["COMMUNICATION_ACTION"]),
    D15: Object.freeze(["COMMUNICATION_ACTION"]),
    D16: Object.freeze(["COMMUNICATION_ACTION"]),
    D17: Object.freeze(["COMMUNICATION_ACTION"]),
    D18: Object.freeze(["COMMUNICATION_ACTION"]),
    D19: Object.freeze(["NEXT_CYCLE_DECISION"]),
    D20: Object.freeze(["NEXT_CYCLE_DECISION"])
  });
  var PlayerDecisionRecordV080 = class _PlayerDecisionRecordV080 {
    constructor(provenance, decisionId, slotId, round, selectionCode, rationale, reference) {
      this.provenance = provenance;
      this.decisionId = decisionId;
      this.slotId = slotId;
      this.round = round;
      this.selectionCode = selectionCode;
      this.rationale = rationale;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      const contract = requireTeachingV080DecisionSlot(input.slotId);
      if (input.round !== contract.round)
        throw simulationInvalid(
          "v0.8 player decision round must match the frozen D-slot contract.",
          {
            slotId: input.slotId,
            expectedRound: contract.round,
            actualRound: input.round
          }
        );
      const payload = Object.freeze({
        provenance: "PLAYER_DECISION",
        decisionId: nonBlank(input.decisionId, "decisionId"),
        slotId: input.slotId,
        round: input.round,
        selectionCode: nonBlank(input.selectionCode, "selectionCode"),
        rationale: optionalNonBlank2(input.rationale, "rationale")
      });
      return new _PlayerDecisionRecordV080(
        payload.provenance,
        payload.decisionId,
        payload.slotId,
        payload.round,
        payload.selectionCode,
        payload.rationale,
        `player-decision-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var P2ActionEffectPackV080 = class _P2ActionEffectPackV080 {
    constructor(packId, parameters, reference) {
      this.packId = packId;
      this.reference = reference;
      this.parameters = Object.freeze([...parameters]);
      Object.freeze(this);
    }
    #nominal = true;
    parameters;
    static create(input) {
      if (!(input.registry instanceof ParameterRegistryV080))
        throw simulationInvalid(
          "P2 action effect pack requires a genuine ParameterRegistryV080."
        );
      if (input.parameterIds.length === 0)
        throw simulationInvalid("P2 action effect pack requires parameters.");
      const ids = uniqueNonBlank(input.parameterIds, "parameterIds");
      const parameters = ids.map((parameterId) => {
        const parameter3 = input.registry.require(parameterId);
        if (parameter3.parameterClass !== "P2_SIMULATION_PARAMETER" || !parameter3.calibrationEligible || parameter3.calibrationVersion === void 0)
          throw simulationInvalid(
            "Every action-effect parameter must be a versioned P2 simulation parameter.",
            {
              parameterId,
              parameterClass: parameter3.parameterClass
            }
          );
        return parameter3;
      });
      const payload = Object.freeze({
        packId: nonBlank(input.packId, "packId"),
        policyVersion: teachingV080DecisionExecutionPolicyVersion,
        parameterReferences: Object.freeze(
          parameters.map((parameter3) => parameter3.reference)
        )
      });
      return new _P2ActionEffectPackV080(
        payload.packId,
        parameters,
        `action-effect-pack-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var AuthorizedActionPackageV080 = class _AuthorizedActionPackageV080 {
    constructor(provenance, policyVersion, decision, actionClasses, effectPack, directCarbonTruthAllowed, reference) {
      this.provenance = provenance;
      this.policyVersion = policyVersion;
      this.decision = decision;
      this.effectPack = effectPack;
      this.directCarbonTruthAllowed = directCarbonTruthAllowed;
      this.reference = reference;
      this.actionClasses = Object.freeze([...actionClasses]);
      Object.freeze(this);
    }
    #nominal = true;
    actionClasses;
    static authorize(input) {
      if (!(input.decision instanceof PlayerDecisionRecordV080))
        throw simulationInvalid(
          "Player decision record was structurally forged."
        );
      input.decision.assertGenuine();
      if (input.effectPack !== void 0) {
        if (!(input.effectPack instanceof P2ActionEffectPackV080))
          throw simulationInvalid("Action effect pack was structurally forged.");
        input.effectPack.assertGenuine();
      }
      if ((input.decision.slotId === "D1" || input.decision.slotId === "D2") && input.effectPack !== void 0)
        throw simulationInvalid(
          "D1/D2 are intent/resource-posture constraints and cannot directly carry numerical effect packs."
        );
      const actionClasses = teachingV080AllowedActionClassesBySlot[input.decision.slotId];
      const payload = Object.freeze({
        provenance: "PLAYER_DECISION",
        policyVersion: teachingV080DecisionExecutionPolicyVersion,
        decisionReference: input.decision.reference,
        actionClasses,
        effectPackReference: input.effectPack?.reference,
        directCarbonTruthAllowed: false
      });
      return new _AuthorizedActionPackageV080(
        payload.provenance,
        payload.policyVersion,
        input.decision,
        actionClasses,
        input.effectPack,
        payload.directCarbonTruthAllowed,
        `authorized-action-package-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ForwardCommitmentDisclosureV080 = class _ForwardCommitmentDisclosureV080 {
    constructor(provenance, sourceDecisionReference, statement, evidenceReferences, reference) {
      this.provenance = provenance;
      this.sourceDecisionReference = sourceDecisionReference;
      this.statement = statement;
      this.reference = reference;
      this.evidenceReferences = Object.freeze([...evidenceReferences]);
      Object.freeze(this);
    }
    #nominal = true;
    evidenceReferences;
    static create(input) {
      const payload = Object.freeze({
        provenance: "PLAYER_DECISION",
        sourceDecisionReference: nonBlank(
          input.sourceDecisionReference,
          "sourceDecisionReference"
        ),
        statement: nonBlank(input.statement, "statement"),
        evidenceReferences: uniqueNonBlank(
          input.evidenceReferences ?? [],
          "evidenceReferences"
        )
      });
      return new _ForwardCommitmentDisclosureV080(
        payload.provenance,
        payload.sourceDecisionReference,
        payload.statement,
        payload.evidenceReferences,
        `forward-commitment-disclosure-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function createDisclosureContentSelectionV080(input) {
    if (input.contentKinds.length === 0)
      throw simulationInvalid(
        "D13 WHAT requires at least one disclosure content."
      );
    const contentKinds = uniqueDisclosureContentKinds(input.contentKinds);
    const selectsFuture = contentKinds.includes("FUTURE_COMMITMENT");
    if (selectsFuture && input.forwardCommitment === void 0)
      throw simulationInvalid(
        "FUTURE_COMMITMENT content requires a genuine PLAYER_DECISION-backed forward commitment."
      );
    if (!selectsFuture && input.forwardCommitment !== void 0)
      throw simulationInvalid(
        "Forward commitment cannot be attached unless FUTURE_COMMITMENT is selected."
      );
    if (input.forwardCommitment !== void 0) {
      if (!(input.forwardCommitment instanceof ForwardCommitmentDisclosureV080))
        throw simulationInvalid(
          "Forward commitment disclosure was structurally forged."
        );
      input.forwardCommitment.assertGenuine();
    }
    const coreClaimTypes = Object.freeze(
      contentKinds.flatMap((kind2) => {
        switch (kind2) {
          case "ACTUAL_REDUCTION":
            return ["REDUCTION_OUTCOME"];
          case "PRODUCT_CARBON":
            return ["PRODUCT_CARBON"];
          case "OFFSET":
            return ["OFFSET_OUTCOME"];
          case "CARBON_NEUTRALITY":
            return ["CARBON_NEUTRALITY"];
          case "FUTURE_COMMITMENT":
            return [];
        }
      })
    );
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      contentKinds,
      coreClaimTypes,
      forwardCommitmentReference: input.forwardCommitment?.reference
    });
    return Object.freeze({
      provenance: payload.provenance,
      contentKinds,
      coreClaimTypes,
      forwardCommitment: input.forwardCommitment,
      reference: `disclosure-content-selection-v080:${deterministicSha256(payload)}`
    });
  }
  function assertRemainingReductionResponseV080(value) {
    if (!teachingV080RemainingReductionResponses.includes(value))
      throw simulationInvalid("Unknown D10 remaining-reduction response.", {
        value
      });
    return value;
  }
  function assertVerificationResponseV080(value) {
    if (!teachingV080VerificationResponses.includes(value))
      throw simulationInvalid("Unknown D17 verification response.", { value });
    return value;
  }
  function assertDisclosureCorrectionResponseV080(value) {
    if (!teachingV080DisclosureCorrectionResponses.includes(value))
      throw simulationInvalid("Unknown D18 disclosure correction response.", {
        value
      });
    return value;
  }
  function uniqueNonBlank(values2, field) {
    const normalized = values2.map(
      (value, index) => nonBlank(value, `${field}[${String(index)}]`)
    );
    if (new Set(normalized).size !== normalized.length)
      throw simulationInvalid(`${field} must not contain duplicates.`);
    return Object.freeze(normalized);
  }
  function uniqueDisclosureContentKinds(values2) {
    for (const value of values2)
      if (!teachingV080DisclosureContentKinds.includes(value))
        throw simulationInvalid("Unknown D13 disclosure content.", { value });
    if (new Set(values2).size !== values2.length)
      throw simulationInvalid("D13 disclosure content must be unique.");
    return Object.freeze([...values2]);
  }
  function optionalNonBlank2(value, field) {
    return value === void 0 ? void 0 : nonBlank(value, field);
  }

  // packages/carbon-core/src/communication-decision.ts
  var disclosureClaimTypes = [
    "CARBON_INVENTORY",
    "REDUCTION_OUTCOME",
    "PRODUCT_CARBON",
    "OFFSET_OUTCOME",
    "CARBON_NEUTRALITY"
  ];
  var disclosureClaimAuthority = Symbol(
    "communication-disclosure-claim-authority"
  );

  // packages/carbon-core/src/communication-publication.ts
  var VerificationSnapshot = class _VerificationSnapshot {
    constructor(disclosureVersionId, verifierReference, verifiedAt, sourceIntegrity, claimConsistency, completeness, overallResult) {
      this.disclosureVersionId = disclosureVersionId;
      this.verifierReference = verifierReference;
      this.sourceIntegrity = sourceIntegrity;
      this.claimConsistency = claimConsistency;
      this.completeness = completeness;
      this.overallResult = overallResult;
      this.verifiedAt = copyDate(verifiedAt, "verifiedAt");
      Object.freeze(this);
    }
    #nominal = true;
    verifiedAt;
    static verify(input, sourceBundle, selection, claimSet) {
      sourceBundle.assertGenuine();
      selection.assertGenuine();
      claimSet.assertGenuine();
      const expectedVersion = sourceBundle.disclosureVersionId.value;
      const machineSourceIntegrity = verifySourceIntegrity(sourceBundle);
      const machineClaimConsistency = verifyClaimConsistency(
        sourceBundle,
        selection,
        claimSet
      );
      const machineCompleteness = verifyCompleteness(sourceBundle, claimSet);
      const sourceIntegrity = combineCheck(
        input.sourceIntegrity,
        machineSourceIntegrity
      );
      const claimConsistency = combineCheck(
        input.claimConsistency,
        machineClaimConsistency
      );
      const completeness = combineCheck(input.completeness, machineCompleteness);
      const overallResult = sourceIntegrity === "PASS" && claimConsistency === "PASS" && completeness === "PASS" ? "VERIFIED" : "REJECTED";
      return new _VerificationSnapshot(
        expectedVersion,
        nonBlank2(input.verifierReference, "verifierReference"),
        input.verifiedAt,
        sourceIntegrity,
        claimConsistency,
        completeness,
        overallResult
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var PublicationSnapshot = class _PublicationSnapshot {
    constructor(disclosureVersionId, publicationReference, publishedAt, decisionReference, claimIds, claimTypes) {
      this.disclosureVersionId = disclosureVersionId;
      this.publicationReference = publicationReference;
      this.decisionReference = decisionReference;
      this.publishedAt = copyDate(publishedAt, "publishedAt");
      this.claimIds = Object.freeze([...claimIds]);
      this.claimTypes = Object.freeze([...claimTypes]);
      Object.freeze(this);
    }
    #nominal = true;
    publishedAt;
    claimIds;
    claimTypes;
    static issue(input) {
      input.sourceBundle.assertGenuine();
      input.selection.assertGenuine();
      input.claimSet.assertGenuine();
      input.verification.assertGenuine();
      const version = input.sourceBundle.disclosureVersionId.value;
      if (input.selection.disclosureVersionId !== version || input.claimSet.disclosureVersionId !== version || input.verification.disclosureVersionId !== version)
        throw cb3Error(
          "CARBON_COMMUNICATION_CB3_VERSION_MISMATCH",
          "Publication inputs must bind the exact same disclosure version."
        );
      if (input.verification.overallResult !== "VERIFIED")
        throw cb3Error(
          "CARBON_COMMUNICATION_CB3_NOT_VERIFIED",
          "Only a VERIFIED disclosure may be published."
        );
      nonBlank2(input.approvalReference, "approvalReference");
      const claimIds = input.claimSet.claims.map((claim) => claim.claimId);
      const claimTypes = uniqueClaimTypes(
        input.claimSet.claims.map((claim) => claim.claimType)
      );
      if (claimIds.length === 0)
        throw cb3Error(
          "CARBON_COMMUNICATION_CB3_CLAIMS_REQUIRED",
          "Published disclosure must contain at least one governed claim."
        );
      return new _PublicationSnapshot(
        version,
        nonBlank2(input.publicationReference, "publicationReference"),
        input.publishedAt,
        input.selection.decisionReference,
        claimIds,
        claimTypes
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function verifySourceIntegrity(sourceBundle) {
    if (sourceBundle.sourceSnapshots.length === 0) return "FAIL";
    const keys2 = /* @__PURE__ */ new Set();
    for (const snapshot of sourceBundle.sourceSnapshots) {
      snapshot.assertGenuine();
      if (keys2.has(snapshot.sourceKey)) return "FAIL";
      keys2.add(snapshot.sourceKey);
      if (!snapshot.reportingEntityVersionId.equals(
        sourceBundle.reportingEntityVersionId
      ) || !snapshot.accountingContextId.equals(sourceBundle.accountingContextId) || snapshot.unit !== sourceBundle.reportingMassUnit || snapshot.gasBasis !== sourceBundle.carbonGasBasis)
        return "FAIL";
    }
    return "PASS";
  }
  function verifyClaimConsistency(sourceBundle, selection, claimSet) {
    const version = sourceBundle.disclosureVersionId.value;
    if (selection.disclosureVersionId !== version || claimSet.disclosureVersionId !== version || claimSet.decisionReference !== selection.decisionReference)
      return "FAIL";
    const bundleKeys = new Set(
      sourceBundle.sourceSnapshots.map((snapshot) => snapshot.sourceKey)
    );
    for (const claim of claimSet.claims) {
      claim.assertGenuine();
      if (claim.disclosureVersionId !== version || claim.supportingTruthKeys.length === 0 || claim.supportingTruthKeys.some((key) => !bundleKeys.has(key)))
        return "FAIL";
    }
    return "PASS";
  }
  function verifyCompleteness(sourceBundle, claimSet) {
    if (claimSet.claims.length === 0) return "FAIL";
    const snapshotByKey = new Map(
      sourceBundle.sourceSnapshots.map((snapshot) => [
        snapshot.sourceKey,
        snapshot
      ])
    );
    for (const claim of claimSet.claims) {
      const supporting = claim.supportingTruthKeys.map((key) => snapshotByKey.get(key)).filter(
        (snapshot) => snapshot !== void 0
      );
      if (supporting.length !== claim.supportingTruthKeys.length) return "FAIL";
      if (claim.claimType === "PRODUCT_CARBON") {
        if (claim.subjectRef === void 0) return "FAIL";
        const hasExactProductResult = supporting.some(
          (snapshot) => snapshot.sourceRole === "CURRENT" && snapshot.factKind === "PRODUCT_CARBON_RESULT" && snapshot.subjectRef === claim.subjectRef
        );
        if (!hasExactProductResult) return "FAIL";
      }
      if (claim.claimType === "CARBON_NEUTRALITY") {
        if (!neutralitySupportComplete(supporting)) return "FAIL";
      }
    }
    return "PASS";
  }
  function neutralitySupportComplete(snapshots) {
    const hasCurrentOperatingNet = snapshots.some(
      (snapshot) => snapshot.sourceRole === "CURRENT" && snapshot.factKind === "OPERATING_CARBON_NET"
    );
    const requiredKinds = [
      "ENTERPRISE_ACTUAL_REDUCTION",
      "OFFSET_REQUIREMENT",
      "OFFSET_RESOURCE",
      "OFFSET_PERIOD_NET_RESOURCES",
      "OFFSET_CLOSING_BALANCE",
      "CARBON_NEUTRALITY_RESULT"
    ];
    return hasCurrentOperatingNet && requiredKinds.every(
      (kind2) => snapshots.some((snapshot) => snapshot.factKind === kind2)
    );
  }
  function combineCheck(declared, machine) {
    return declared === "PASS" && machine === "PASS" ? "PASS" : "FAIL";
  }
  function uniqueClaimTypes(values2) {
    return Object.freeze([...new Set(values2)]);
  }
  function copyDate(value, field) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime()))
      throw cb3Error(
        "CARBON_COMMUNICATION_CB3_DATE_INVALID",
        `${field} must be a valid Date.`
      );
    return new Date(value.getTime());
  }
  function nonBlank2(value, field) {
    const normalized = value.trim();
    if (normalized.length === 0)
      throw cb3Error(
        "CARBON_COMMUNICATION_CB3_REFERENCE_REQUIRED",
        `${field} must be nonblank.`
      );
    return normalized;
  }
  function cb3Error(code, message) {
    return new DomainError(code, message);
  }

  // packages/carbon-core/src/reporting-period.ts
  var isoDateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  function assertIsoDateOnly(value, field) {
    const match = isoDateOnlyPattern.exec(value);
    if (match === null) {
      throw invalidReportingPeriod(
        `${field} must use the ISO YYYY-MM-DD date-only format.`,
        { field, value }
      );
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const daysInMonth = [
      31,
      isLeapYear(year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31
    ];
    const maximumDay = daysInMonth[month - 1];
    if (year === 0 || month < 1 || month > 12 || maximumDay === void 0 || day < 1 || day > maximumDay) {
      throw invalidReportingPeriod(`${field} must be a valid calendar date.`, {
        field,
        value
      });
    }
  }
  function invalidReportingPeriod(message, details) {
    return new DomainError("CARBON_REPORTING_PERIOD_INVALID", message, details);
  }
  var ReportingPeriod = class _ReportingPeriod {
    startDate;
    endDate;
    periodType;
    calendarReference;
    baseYearRole;
    constructor(startDate, endDate, metadata2) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.periodType = normalizeMetadata(
        metadata2.periodType ?? "Custom",
        "periodType"
      );
      this.calendarReference = normalizeOptionalMetadata(
        metadata2.calendarReference,
        "calendarReference"
      );
      this.baseYearRole = normalizeOptionalMetadata(
        metadata2.baseYearRole,
        "baseYearRole"
      );
      Object.freeze(this);
    }
    static create(startDate, endDate, metadata2 = {}) {
      assertIsoDateOnly(startDate, "startDate");
      assertIsoDateOnly(endDate, "endDate");
      if (endDate < startDate) {
        throw invalidReportingPeriod(
          "Reporting period endDate cannot be before startDate.",
          { startDate, endDate }
        );
      }
      return new _ReportingPeriod(startDate, endDate, metadata2);
    }
    includes(date) {
      assertIsoDateOnly(date, "date");
      return this.startDate <= date && date <= this.endDate;
    }
    overlaps(other) {
      return this.startDate <= other.endDate && other.startDate <= this.endDate;
    }
  };
  function normalizeMetadata(value, field) {
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw invalidReportingPeriod(`${field} must be non-blank.`, {
        field,
        value
      });
    }
    return normalized;
  }
  function normalizeOptionalMetadata(value, field) {
    return value === void 0 ? void 0 : normalizeMetadata(value, field);
  }

  // packages/carbon-core/src/communication-disclosure.ts
  var sourceBundleAuthority = Symbol("communication-source-bundle-authority");

  // packages/carbon-core/src/communication-presentation.ts
  var BD_COMMUNICATION_TABLE_PROFILE_V1 = Object.freeze({
    profileId: "BD_COMMUNICATION_TABLE_PROFILE_V1",
    version: "1"
  });
  var BD_COMMUNICATION_DISPLAY_RULE_V1 = Object.freeze({
    displayRuleId: "BD_COMMUNICATION_DISPLAY_RULE_V1",
    version: "1",
    percentageDecimals: 2,
    indexDecimals: 2,
    roundingMode: "HALF_UP",
    massAndIntensityMode: "EXACT"
  });

  // packages/carbon-core/src/exact-decimal.ts
  var exactDecimalPattern = /^(0|[1-9]\d*)(?:\.(\d+))?$/;
  var ExactDecimal = class _ExactDecimal {
    #coefficient;
    #scale;
    constructor(coefficient, scale) {
      let normalizedCoefficient = coefficient;
      let normalizedScale = scale;
      while (normalizedScale > 0 && normalizedCoefficient % 10n === 0n) {
        normalizedCoefficient /= 10n;
        normalizedScale -= 1;
      }
      this.#coefficient = normalizedCoefficient;
      this.#scale = normalizedScale;
      Object.freeze(this);
    }
    static parse(value, errorCode = "CARBON_DECIMAL_INVALID", subject = "Quantity value") {
      const normalized = value.trim();
      const match = exactDecimalPattern.exec(normalized);
      if (match === null) {
        throw new DomainError(
          errorCode,
          `${subject} must be a nonnegative base-10 decimal string without exponent notation.`,
          { value }
        );
      }
      const integerPart = match[1];
      if (integerPart === void 0) {
        throw new DomainError(
          errorCode,
          `${subject} could not be parsed as a base-10 decimal string.`,
          { value }
        );
      }
      const fractionPart = match[2] ?? "";
      return new _ExactDecimal(
        BigInt(`${integerPart}${fractionPart}`),
        fractionPart.length
      );
    }
    shiftByPowerOfTen(exponent) {
      if (!Number.isSafeInteger(exponent)) {
        throw new DomainError(
          "CARBON_DECIMAL_SHIFT_INVALID",
          "Decimal shift exponent must be a safe integer.",
          { exponent }
        );
      }
      if (exponent >= 0) {
        return new _ExactDecimal(
          this.#coefficient * 10n ** BigInt(exponent),
          this.#scale
        );
      }
      return new _ExactDecimal(this.#coefficient, this.#scale - exponent);
    }
    compare(other) {
      const commonScale = Math.max(this.#scale, other.#scale);
      const left = this.#coefficient * 10n ** BigInt(commonScale - this.#scale);
      const right = other.#coefficient * 10n ** BigInt(commonScale - other.#scale);
      return left < right ? -1 : left > right ? 1 : 0;
    }
    multiply(other) {
      return new _ExactDecimal(
        this.#coefficient * other.#coefficient,
        this.#scale + other.#scale
      );
    }
    add(other) {
      const scale = Math.max(this.#scale, other.#scale);
      return new _ExactDecimal(
        this.#coefficient * 10n ** BigInt(scale - this.#scale) + other.#coefficient * 10n ** BigInt(scale - other.#scale),
        scale
      );
    }
    subtractNonnegative(other) {
      const scale = Math.max(this.#scale, other.#scale);
      const coefficient = this.#coefficient * 10n ** BigInt(scale - this.#scale) - other.#coefficient * 10n ** BigInt(scale - other.#scale);
      if (coefficient < 0n) {
        throw new DomainError(
          "CARBON_DECIMAL_NEGATIVE_RESULT",
          "Exact nonnegative subtraction cannot produce a negative result."
        );
      }
      return new _ExactDecimal(coefficient, scale);
    }
    divideFinite(other) {
      if (other.#coefficient === 0n) {
        throw new DomainError(
          "CARBON_DECIMAL_DIVIDE_BY_ZERO",
          "Cannot divide by zero."
        );
      }
      let numerator = this.#coefficient * 10n ** BigInt(other.#scale);
      let denominator = other.#coefficient * 10n ** BigInt(this.#scale);
      const divisor = greatestCommonDivisor(numerator, denominator);
      numerator /= divisor;
      denominator /= divisor;
      let twos = 0;
      let fives = 0;
      while (denominator % 2n === 0n) {
        denominator /= 2n;
        twos += 1;
      }
      while (denominator % 5n === 0n) {
        denominator /= 5n;
        fives += 1;
      }
      if (denominator !== 1n) {
        throw new DomainError(
          "CARBON_DECIMAL_NON_FINITE_DIVISION",
          "Division must have an exact finite base-10 result; Core does not round."
        );
      }
      const scale = Math.max(twos, fives);
      const coefficient = numerator * 2n ** BigInt(scale - twos) * 5n ** BigInt(scale - fives);
      return new _ExactDecimal(coefficient, scale);
    }
    toString() {
      const digits = this.#coefficient.toString();
      if (this.#scale === 0) {
        return digits;
      }
      if (digits.length <= this.#scale) {
        return `0.${"0".repeat(this.#scale - digits.length)}${digits}`;
      }
      const decimalPosition = digits.length - this.#scale;
      return `${digits.slice(0, decimalPosition)}.${digits.slice(decimalPosition)}`;
    }
  };
  function greatestCommonDivisor(left, right) {
    while (right !== 0n) [left, right] = [right, left % right];
    return left;
  }

  // packages/carbon-core/src/unit.ts
  var unitCodes = Object.freeze([
    "g",
    "kg",
    "t",
    "Wh",
    "kWh",
    "MWh",
    "mL",
    "L",
    "m3",
    "m",
    "km",
    "item"
  ]);
  var unitDefinitions = {
    g: { dimension: "MASS", powerToBaseUnit: 0 },
    kg: { dimension: "MASS", powerToBaseUnit: 3 },
    t: { dimension: "MASS", powerToBaseUnit: 6 },
    Wh: { dimension: "ENERGY", powerToBaseUnit: 0 },
    kWh: { dimension: "ENERGY", powerToBaseUnit: 3 },
    MWh: { dimension: "ENERGY", powerToBaseUnit: 6 },
    mL: { dimension: "VOLUME", powerToBaseUnit: 0 },
    L: { dimension: "VOLUME", powerToBaseUnit: 3 },
    m3: { dimension: "VOLUME", powerToBaseUnit: 6 },
    m: { dimension: "DISTANCE", powerToBaseUnit: 0 },
    km: { dimension: "DISTANCE", powerToBaseUnit: 3 },
    item: { dimension: "COUNT", powerToBaseUnit: 0 }
  };
  function requireUnitDefinition(unit) {
    const definition = unitDefinitions[unit];
    if (definition === void 0) {
      throw new DomainError(
        "CARBON_UNIT_UNKNOWN",
        "Unit code is not supported.",
        {
          unit
        }
      );
    }
    return definition;
  }
  function unitDimensionOf(unit) {
    return requireUnitDefinition(unit).dimension;
  }
  function areUnitsCompatible(left, right) {
    return unitDimensionOf(left) === unitDimensionOf(right);
  }
  function convertExactUnitValue(value, from, to) {
    const source2 = requireUnitDefinition(from);
    const target = requireUnitDefinition(to);
    if (source2.dimension !== target.dimension) {
      throw new DomainError(
        "CARBON_UNIT_INCOMPATIBLE",
        "Unit conversion requires matching physical dimensions.",
        {
          from,
          fromDimension: source2.dimension,
          to,
          toDimension: target.dimension
        }
      );
    }
    return value.shiftByPowerOfTen(
      source2.powerToBaseUnit - target.powerToBaseUnit
    );
  }
  function assertMassUnit(unit) {
    if (unitDimensionOf(unit) !== "MASS") {
      throw new DomainError(
        "CARBON_QUANTITY_UNIT_INVALID",
        "CarbonQuantity accepts mass units only.",
        { unit }
      );
    }
  }

  // packages/carbon-core/src/activity-quantity.ts
  var ActivityQuantity = class _ActivityQuantity {
    value;
    unit;
    #decimal;
    constructor(decimal, unit) {
      this.#decimal = decimal;
      this.value = decimal.toString();
      this.unit = unit;
      Object.freeze(this);
    }
    static create(value, unit) {
      unitDimensionOf(unit);
      if (value.trim().startsWith("-")) {
        throw new DomainError(
          "CARBON_QUANTITY_NEGATIVE",
          "ActivityQuantity cannot be negative.",
          { value }
        );
      }
      return new _ActivityQuantity(ExactDecimal.parse(value), unit);
    }
    convertTo(targetUnit) {
      const converted = convertExactUnitValue(
        this.#decimal,
        this.unit,
        targetUnit
      );
      return new _ActivityQuantity(converted, targetUnit);
    }
  };

  // packages/carbon-core/src/gas-basis.ts
  var greenhouseGasCodes = Object.freeze([
    "CO2",
    "CH4",
    "N2O",
    "HFCS",
    "PFCS",
    "SF6",
    "NF3"
  ]);
  var carbonGasBasisCodes = Object.freeze([
    ...greenhouseGasCodes,
    "CO2E"
  ]);
  function assertCarbonGasBasis(gasBasis) {
    if (!carbonGasBasisCodes.includes(gasBasis)) {
      throw new DomainError(
        "CARBON_GAS_BASIS_INVALID",
        "Carbon gas basis is not supported.",
        { gasBasis }
      );
    }
  }

  // packages/carbon-core/src/carbon-quantity.ts
  var CarbonQuantity = class _CarbonQuantity {
    value;
    unit;
    gasBasis;
    #decimal;
    constructor(decimal, unit, gasBasis) {
      this.#decimal = decimal;
      this.value = decimal.toString();
      this.unit = unit;
      this.gasBasis = gasBasis;
      Object.freeze(this);
    }
    static create(value, unit, gasBasis) {
      assertMassUnit(unit);
      assertCarbonGasBasis(gasBasis);
      if (value.trim().startsWith("-")) {
        throw new DomainError(
          "CARBON_QUANTITY_NEGATIVE",
          "CarbonQuantity cannot be negative.",
          { value }
        );
      }
      return new _CarbonQuantity(ExactDecimal.parse(value), unit, gasBasis);
    }
    convertTo(targetUnit) {
      assertMassUnit(targetUnit);
      const converted = convertExactUnitValue(
        this.#decimal,
        this.unit,
        targetUnit
      );
      return new _CarbonQuantity(converted, targetUnit, this.gasBasis);
    }
    add(other) {
      this.assertCompatible(other);
      const normalized = other.convertTo(this.unit);
      return new _CarbonQuantity(
        this.#decimal.add(normalized.#decimal),
        this.unit,
        this.gasBasis
      );
    }
    subtractNonnegative(other) {
      this.assertCompatible(other);
      const normalized = other.convertTo(this.unit);
      return new _CarbonQuantity(
        this.#decimal.subtractNonnegative(normalized.#decimal),
        this.unit,
        this.gasBasis
      );
    }
    multiply(multiplier) {
      return new _CarbonQuantity(
        this.#decimal.multiply(ExactDecimal.parse(multiplier)),
        this.unit,
        this.gasBasis
      );
    }
    divideFinite(divisor) {
      return new _CarbonQuantity(
        this.#decimal.divideFinite(ExactDecimal.parse(divisor)),
        this.unit,
        this.gasBasis
      );
    }
    compare(other) {
      this.assertCompatible(other);
      return this.#decimal.compare(other.convertTo(this.unit).#decimal);
    }
    assertCompatible(other) {
      if (!(other instanceof _CarbonQuantity) || other.gasBasis !== this.gasBasis) {
        throw new DomainError(
          "CARBON_QUANTITY_INCOMPATIBLE",
          "Carbon quantities require an exact matching gas basis."
        );
      }
    }
  };

  // packages/carbon-core/src/offset-truth.ts
  var createOffsetRequirementSnapshotId = (value) => Identifier.create("OffsetRequirementSnapshot", value);
  var createOffsetResourceFactId = (value) => Identifier.create("OffsetResourceFact", value);
  var createOffsetSettlementId = (value) => Identifier.create("OffsetSettlement", value);
  var offsetResourceKinds = [
    "OPENING_BALANCE",
    "FREE_ALLOWANCE",
    "MARKET_ALLOWANCE",
    "CARBON_CREDIT",
    "CARBON_SINK"
  ];
  var offsetResourceMovements = [
    "OPENING",
    "ACQUIRE",
    "DISPOSE"
  ];
  var OffsetRequirementSnapshot = class _OffsetRequirementSnapshot {
    constructor(id, carbonInventoryId, reportingEntityVersionId, accountingContextId, reportingPeriod, operatingCarbonNetAfter, capturedAt) {
      this.id = id;
      this.carbonInventoryId = carbonInventoryId;
      this.reportingEntityVersionId = reportingEntityVersionId;
      this.accountingContextId = accountingContextId;
      this.reportingPeriod = reportingPeriod;
      this.operatingCarbonNetAfter = operatingCarbonNetAfter;
      this.#capturedAtTime = capturedAt.getTime();
      Object.freeze(this);
    }
    #nominal = true;
    #capturedAtTime;
    static capture(input) {
      assertKind(input.id, "OffsetRequirementSnapshot");
      if (input.inventory.status !== "CLOSED")
        throw offsetError(
          "OFFSET_REQUIREMENT_INVENTORY_NOT_CLOSED",
          "Offset requirement must be captured from a CLOSED governed CarbonInventory."
        );
      if (!isValidDate(input.capturedAt))
        throw offsetError(
          "OFFSET_TIMESTAMP_INVALID",
          "capturedAt must be a valid timestamp."
        );
      const operatingBalance = input.inventory.operatingBalance;
      if (operatingBalance.value.startsWith("-"))
        throw offsetError(
          "OFFSET_REQUIREMENT_NEGATIVE",
          "A negative Operating Carbon Net does not create an offset requirement."
        );
      return new _OffsetRequirementSnapshot(
        input.id,
        input.inventory.id,
        input.inventory.context.reportingEntityVersionId,
        input.inventory.context.accountingContextId,
        input.inventory.context.reportingPeriod,
        CarbonQuantity.create(
          operatingBalance.value,
          operatingBalance.unit,
          operatingBalance.gasBasis
        ),
        new Date(input.capturedAt.getTime())
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
    get capturedAt() {
      return new Date(this.#capturedAtTime);
    }
  };
  var OffsetResourceFact = class _OffsetResourceFact {
    constructor(id, resourceKind, movement, quantity, reportingEntityVersionId, accountingContextId, reportingPeriod, resourceLotReference, evidenceReference, occurredAt) {
      this.id = id;
      this.resourceKind = resourceKind;
      this.movement = movement;
      this.quantity = quantity;
      this.reportingEntityVersionId = reportingEntityVersionId;
      this.accountingContextId = accountingContextId;
      this.reportingPeriod = reportingPeriod;
      this.resourceLotReference = resourceLotReference;
      this.evidenceReference = evidenceReference;
      this.#occurredAtTime = occurredAt.getTime();
      Object.freeze(this);
    }
    #nominal = true;
    #occurredAtTime;
    static record(input) {
      assertKind(input.id, "OffsetResourceFact");
      if (!offsetResourceKinds.includes(input.resourceKind))
        throw offsetError(
          "OFFSET_RESOURCE_KIND_INVALID",
          "Unknown resource kind."
        );
      if (!offsetResourceMovements.includes(input.movement))
        throw offsetError(
          "OFFSET_MOVEMENT_INVALID",
          "Unknown resource movement."
        );
      if (input.resourceKind === "OPENING_BALANCE" !== (input.movement === "OPENING"))
        throw offsetError(
          "OFFSET_OPENING_SEMANTICS_INVALID",
          "OPENING_BALANCE and OPENING must be used together and only together."
        );
      if (!(input.quantity instanceof CarbonQuantity))
        throw offsetError("OFFSET_QUANTITY_MISSING", "quantity is required.");
      assertContext(input);
      if (!isValidDate(input.occurredAt))
        throw offsetError(
          "OFFSET_TIMESTAMP_INVALID",
          "occurredAt must be a valid timestamp."
        );
      return new _OffsetResourceFact(
        input.id,
        input.resourceKind,
        input.movement,
        input.quantity,
        input.reportingEntityVersionId,
        input.accountingContextId,
        input.reportingPeriod,
        nonBlank3(input.resourceLotReference, "resourceLotReference"),
        nonBlank3(input.evidenceReference, "evidenceReference"),
        new Date(input.occurredAt.getTime())
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
    get occurredAt() {
      return new Date(this.#occurredAtTime);
    }
  };
  var SignedCarbonQuantity = class _SignedCarbonQuantity {
    constructor(sign, magnitude) {
      this.sign = sign;
      this.magnitude = magnitude;
      Object.freeze(this);
    }
    static difference(minuend, subtrahend) {
      const comparison = minuend.compare(subtrahend);
      if (comparison > 0)
        return new _SignedCarbonQuantity(
          "POSITIVE",
          minuend.subtractNonnegative(subtrahend)
        );
      if (comparison < 0)
        return new _SignedCarbonQuantity(
          "NEGATIVE",
          subtrahend.subtractNonnegative(minuend)
        );
      return new _SignedCarbonQuantity(
        "ZERO",
        minuend.subtractNonnegative(subtrahend)
      );
    }
    get value() {
      return this.sign === "NEGATIVE" ? `-${this.magnitude.value}` : this.magnitude.value;
    }
  };
  var IssuedOffsetSettlementResult = class {
    constructor(openingBalance, acquisitions, disposals, periodNetOffsetResources, availableOffsetResources, closingBalance, disposition) {
      this.openingBalance = openingBalance;
      this.acquisitions = acquisitions;
      this.disposals = disposals;
      this.periodNetOffsetResources = periodNetOffsetResources;
      this.availableOffsetResources = availableOffsetResources;
      this.closingBalance = closingBalance;
      this.disposition = disposition;
      Object.freeze(this);
    }
  };
  var OffsetSettlementAggregate = class _OffsetSettlementAggregate {
    constructor(id, requirement) {
      this.id = id;
      this.requirement = requirement;
    }
    #facts = [];
    #factIds = /* @__PURE__ */ new Set();
    #resourceLots = /* @__PURE__ */ new Set();
    #result;
    static create(input) {
      assertKind(input.id, "OffsetSettlement");
      input.requirement.assertGenuine();
      return new _OffsetSettlementAggregate(input.id, input.requirement);
    }
    get facts() {
      return Object.freeze([...this.#facts]);
    }
    get result() {
      return this.#result;
    }
    register(fact) {
      if (this.#result !== void 0)
        throw offsetError(
          "OFFSET_SETTLEMENT_FINALIZED",
          "A finalized settlement is immutable."
        );
      fact.assertGenuine();
      if (this.#factIds.has(fact.id.value))
        throw offsetError(
          "OFFSET_RESOURCE_DOUBLE_USE",
          "A resource fact may be used only once."
        );
      if (this.#resourceLots.has(fact.resourceLotReference))
        throw offsetError(
          "OFFSET_RESOURCE_DOUBLE_USE",
          "A governed resource lot may be used only once in a settlement."
        );
      if (!fact.reportingEntityVersionId.equals(
        this.requirement.reportingEntityVersionId
      ) || !fact.accountingContextId.equals(this.requirement.accountingContextId) || !sameReportingPeriod(
        fact.reportingPeriod,
        this.requirement.reportingPeriod
      ) || fact.quantity.unit !== this.requirement.operatingCarbonNetAfter.unit || fact.quantity.gasBasis !== this.requirement.operatingCarbonNetAfter.gasBasis)
        throw offsetError(
          "OFFSET_RESOURCE_CONTEXT_MISMATCH",
          "Offset resources must use the requirement ReportingEntityVersion, AccountingContext, ReportingPeriod, carbon unit, and gas basis."
        );
      this.#factIds.add(fact.id.value);
      this.#resourceLots.add(fact.resourceLotReference);
      this.#facts.push(fact);
    }
    finalize() {
      if (this.#result !== void 0) return this.#result;
      const opening = this.#facts.filter((fact) => fact.movement === "OPENING");
      const acquisitions = this.#facts.filter(
        (fact) => fact.movement === "ACQUIRE"
      );
      const disposals = this.#facts.filter((fact) => fact.movement === "DISPOSE");
      if (opening.length !== 1 || acquisitions.length === 0 || disposals.length === 0)
        throw offsetError(
          "OFFSET_RESOURCE_FACTS_INCOMPLETE",
          "Settlement requires exactly one explicit opening fact and explicit acquisition and disposal facts; missing is not zero."
        );
      const zero = CarbonQuantity.create(
        "0",
        this.requirement.operatingCarbonNetAfter.unit,
        this.requirement.operatingCarbonNetAfter.gasBasis
      );
      const sum = (facts) => facts.reduce((total, fact) => total.add(fact.quantity), zero);
      this.#result = calculateSettlement({
        requirement: this.requirement.operatingCarbonNetAfter,
        openingBalance: sum(opening),
        acquisitions: sum(acquisitions),
        disposals: sum(disposals)
      });
      Object.freeze(this.#facts);
      Object.freeze(this);
      return this.#result;
    }
  };
  function calculateSettlement(input) {
    const grossAvailable = input.openingBalance.add(input.acquisitions);
    if (grossAvailable.compare(input.disposals) < 0)
      throw offsetError(
        "OFFSET_RESOURCE_OVER_DISPOSAL",
        "Disposals cannot exceed opening balance plus acquisitions."
      );
    const available = grossAvailable.subtractNonnegative(input.disposals);
    const closing = SignedCarbonQuantity.difference(available, input.requirement);
    return new IssuedOffsetSettlementResult(
      input.openingBalance,
      input.acquisitions,
      input.disposals,
      SignedCarbonQuantity.difference(input.acquisitions, input.disposals),
      available,
      closing,
      closing.sign === "POSITIVE" ? "ACHIEVED_SURPLUS" : closing.sign === "ZERO" ? "ACHIEVED_EXACT" : "SHORTFALL"
    );
  }
  function assertKind(value, expected) {
    if (!(value instanceof Identifier) || value.kind !== expected)
      throw offsetError("OFFSET_IDENTIFIER_INVALID", `Expected ${expected}.`);
  }
  function nonBlank3(value, field) {
    const normalized = value.trim();
    if (normalized.length === 0)
      throw offsetError("OFFSET_VALUE_MISSING", `${field} is required.`);
    return normalized;
  }
  function isValidDate(value) {
    return value instanceof Date && Number.isFinite(value.getTime());
  }
  function assertContext(input) {
    if (!hasIdentifierKind(
      input.reportingEntityVersionId,
      "ReportingEntityVersion"
    ) || !hasIdentifierKind(input.accountingContextId, "CarbonAccountingContext") || !(input.reportingPeriod instanceof ReportingPeriod))
      throw offsetError(
        "OFFSET_RESOURCE_CONTEXT_INVALID",
        "A governed ReportingEntityVersion, AccountingContext, and ReportingPeriod are required."
      );
  }
  function hasIdentifierKind(value, kind2) {
    return value instanceof Identifier && value.kind === kind2;
  }
  function sameReportingPeriod(left, right) {
    return left.startDate === right.startDate && left.endDate === right.endDate && left.periodType === right.periodType && left.calendarReference === right.calendarReference && left.baseYearRole === right.baseYearRole;
  }
  function offsetError(code, message) {
    return new DomainError(code, message);
  }

  // packages/carbon-core/src/classification.ts
  var scopeCodes = Object.freeze([
    "SCOPE_1",
    "SCOPE_2",
    "SCOPE_3"
  ]);
  function assertScopeCode(scope) {
    if (!scopeCodes.includes(scope)) {
      throw new DomainError(
        "CARBON_SCOPE_INVALID",
        "Carbon source scope is not supported.",
        { scope }
      );
    }
  }
  var SourceCategoryCode = class _SourceCategoryCode {
    scope;
    code;
    constructor(scope, code) {
      this.scope = scope;
      this.code = code;
      Object.freeze(this);
    }
    static create(scope, code) {
      assertScopeCode(scope);
      const normalized = code.trim();
      if (normalized.length === 0) {
        throw new DomainError(
          "CARBON_SOURCE_CATEGORY_INVALID",
          "Carbon source category code must be non-blank.",
          { code, scope }
        );
      }
      return new _SourceCategoryCode(scope, normalized);
    }
    equals(other) {
      return this.scope === other.scope && this.code === other.code;
    }
    toString() {
      return `${this.scope}:${this.code}`;
    }
  };

  // packages/carbon-core/src/status.ts
  var measurementTypes = Object.freeze([
    "MEASURED",
    "ESTIMATED",
    "DERIVED",
    "MISSING"
  ]);
  var dataQualityStatuses = Object.freeze([
    "UNASSESSED",
    "ACCEPTABLE",
    "QUALIFIED",
    "REJECTED"
  ]);
  var calculationStatuses = Object.freeze([
    "DRAFT",
    "CALCULATED",
    "FAILED",
    "SUPERSEDED"
  ]);
  var inventoryStatuses = Object.freeze([
    "DRAFT",
    "RECONCILING",
    "RECONCILED",
    "CLOSED",
    "SUPERSEDED"
  ]);

  // packages/carbon-core/src/batch4a-value-objects.ts
  var emissionSourceLifecycleStatuses = Object.freeze([
    "Draft",
    "Registered",
    "Active",
    "Suspended",
    "Retired"
  ]);
  var carbonActivityLifecycleStatuses = Object.freeze([
    "Planned",
    "Occurred",
    "Observed",
    "Recorded",
    "Closed",
    "Cancelled"
  ]);
  var observationLifecycleStatuses = Object.freeze([
    "Created",
    "Captured",
    "Validated",
    "Consumed",
    "Discarded"
  ]);
  function assertBatch4ANonBlank(value) {
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw new DomainError(
        "CARBON_BATCH4A_INVALID_VALUE",
        "Batch 4A text values must be non-blank.",
        { value }
      );
    }
    return normalized;
  }
  function assertBatch4ATimestamp(value) {
    const timestamp = value.getTime();
    if (!Number.isFinite(timestamp)) {
      throw new DomainError(
        "CARBON_BATCH4A_INVALID_VALUE",
        "Batch 4A timestamps must be valid dates."
      );
    }
    return timestamp;
  }
  function assertIdentifierKind(value, kind2, field) {
    if (!(value instanceof Identifier) || value.kind !== kind2) {
      throw new DomainError(
        "CARBON_BATCH4A_INVALID_REFERENCE",
        `${field} must be a ${kind2} identifier.`,
        {
          actualKind: value instanceof Identifier ? value.kind : void 0,
          field
        }
      );
    }
  }
  var EmissionSourceReference = class _EmissionSourceReference {
    constructor(emissionSourceId, reportingEntityVersionId, accountingContextId, sourceCategory) {
      this.emissionSourceId = emissionSourceId;
      this.reportingEntityVersionId = reportingEntityVersionId;
      this.accountingContextId = accountingContextId;
      this.sourceCategory = sourceCategory;
      Object.freeze(this);
    }
    static create(input) {
      assertIdentifierKind(
        input.emissionSourceId,
        "EmissionSource",
        "emissionSourceId"
      );
      assertIdentifierKind(
        input.reportingEntityVersionId,
        "ReportingEntityVersion",
        "reportingEntityVersionId"
      );
      assertIdentifierKind(
        input.accountingContextId,
        "CarbonAccountingContext",
        "accountingContextId"
      );
      if (!(input.sourceCategory instanceof SourceCategoryCode)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_REFERENCE",
          "sourceCategory must be a SourceCategoryCode."
        );
      }
      return new _EmissionSourceReference(
        input.emissionSourceId,
        input.reportingEntityVersionId,
        input.accountingContextId,
        input.sourceCategory
      );
    }
  };
  var CarbonActivityReference = class _CarbonActivityReference {
    constructor(carbonActivityId, emissionSourceReference, activityDefinitionCode, expectedUnit) {
      this.carbonActivityId = carbonActivityId;
      this.emissionSourceReference = emissionSourceReference;
      this.activityDefinitionCode = activityDefinitionCode;
      this.expectedUnit = expectedUnit;
      Object.freeze(this);
    }
    static create(input) {
      assertIdentifierKind(
        input.carbonActivityId,
        "CarbonActivity",
        "carbonActivityId"
      );
      if (!(input.emissionSourceReference instanceof EmissionSourceReference)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_REFERENCE",
          "emissionSourceReference must be an EmissionSourceReference."
        );
      }
      const activityDefinitionCode = assertBatch4ANonBlank(
        input.activityDefinitionCode
      );
      unitDimensionOf(input.expectedUnit);
      return new _CarbonActivityReference(
        input.carbonActivityId,
        input.emissionSourceReference,
        activityDefinitionCode,
        input.expectedUnit
      );
    }
  };
  var ObservationReference = class _ObservationReference {
    constructor(observationId, carbonActivityId) {
      this.observationId = observationId;
      this.carbonActivityId = carbonActivityId;
      Object.freeze(this);
    }
    static create(input) {
      assertIdentifierKind(input.observationId, "Observation", "observationId");
      assertIdentifierKind(
        input.carbonActivityId,
        "CarbonActivity",
        "carbonActivityId"
      );
      return new _ObservationReference(
        input.observationId,
        input.carbonActivityId
      );
    }
  };
  var ActivityOccurrence = class _ActivityOccurrence {
    constructor(kind2, startAt, endAt) {
      this.kind = kind2;
      this.startAt = startAt;
      this.endAt = endAt;
      Object.freeze(this);
    }
    static at(instant) {
      assertBatch4ATimestamp(instant);
      return new _ActivityOccurrence("INSTANT", instant.toISOString(), null);
    }
    static during(period) {
      if (!(period instanceof ValidityPeriod)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_VALUE",
          "Activity occurrence period must be a ValidityPeriod."
        );
      }
      return new _ActivityOccurrence(
        "PERIOD",
        period.validFrom.toISOString(),
        period.validTo?.toISOString() ?? null
      );
    }
  };
  var CapturedObservationFact = class _CapturedObservationFact {
    constructor(measurementType, quantity, expectedUnit, evidenceReferenceIds, capturedAt) {
      this.measurementType = measurementType;
      this.quantity = quantity;
      this.expectedUnit = expectedUnit;
      this.evidenceReferenceIds = evidenceReferenceIds;
      this.#capturedAtValue = new Date(capturedAt.getTime());
      Object.freeze(this);
    }
    #capturedAtValue;
    static create(input) {
      if (!measurementTypes.includes(input.measurementType)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_VALUE",
          "Observation measurement type is not supported.",
          { measurementType: input.measurementType }
        );
      }
      unitDimensionOf(input.expectedUnit);
      assertBatch4ATimestamp(input.capturedAt);
      for (const evidenceReferenceId of input.evidenceReferenceIds) {
        assertIdentifierKind(
          evidenceReferenceId,
          "EvidenceReference",
          "evidenceReferenceIds"
        );
      }
      if (input.measurementType === "MISSING") {
        if (input.quantity !== void 0) {
          throw new DomainError(
            "CARBON_BATCH4A_INVALID_VALUE",
            "Missing observations cannot carry an activity quantity."
          );
        }
      } else {
        if (!(input.quantity instanceof ActivityQuantity)) {
          throw new DomainError(
            "CARBON_BATCH4A_INVALID_VALUE",
            "Measured, estimated, and derived observations require an activity quantity.",
            { measurementType: input.measurementType }
          );
        }
        if (!areUnitsCompatible(input.quantity.unit, input.expectedUnit)) {
          throw new DomainError(
            "CARBON_BATCH4A_INVALID_VALUE",
            "Observation quantity and expected unit must have compatible dimensions.",
            {
              expectedUnit: input.expectedUnit,
              quantityUnit: input.quantity.unit
            }
          );
        }
      }
      return new _CapturedObservationFact(
        input.measurementType,
        input.quantity,
        input.expectedUnit,
        Object.freeze([...input.evidenceReferenceIds]),
        input.capturedAt
      );
    }
    get capturedAt() {
      return new Date(this.#capturedAtValue.getTime());
    }
  };

  // packages/carbon-core/src/batch4b-events.ts
  var batch4BEventTypes = Object.freeze([
    "ActivityDataRecordDrafted",
    "ActivityDataRecordSubmitted",
    "ActivityDataRecordAccepted",
    "ActivityDataRecordRejected",
    "ActivityDataRecordLocked",
    "ActivityDataRecordSuperseded",
    "ActivityDataRecordCorrectionCreated",
    "DataTrustRecordCreated",
    "DataQualityAssessmentAdded",
    "DataQualityAssessmentCompleted",
    "EvidenceLinked",
    "DataTrustValidated",
    "DataTrustArchived",
    "DataLineageRecorded",
    "DataLineageExpanded",
    "DataTrustMarkedNeedsReview",
    "DataTrustVerified"
  ]);
  var keys = {
    ActivityDataRecordDrafted: [
      "carbonActivityId",
      "observationIds",
      "supersedesId"
    ],
    ActivityDataRecordSubmitted: [],
    ActivityDataRecordAccepted: [],
    ActivityDataRecordRejected: ["reason"],
    ActivityDataRecordLocked: [],
    ActivityDataRecordSuperseded: ["successorId"],
    ActivityDataRecordCorrectionCreated: ["predecessorId", "reason"],
    DataTrustRecordCreated: ["activityDataRecordId"],
    DataQualityAssessmentAdded: ["assessmentId", "criterion"],
    DataQualityAssessmentCompleted: ["assessmentId", "outcome"],
    EvidenceLinked: ["evidenceReferenceId"],
    DataTrustValidated: [],
    DataTrustArchived: [],
    DataLineageRecorded: ["reference"],
    DataLineageExpanded: ["reference"],
    DataTrustMarkedNeedsReview: [],
    DataTrustVerified: []
  };
  var Batch4BEvent = class _Batch4BEvent {
    eventId;
    eventType;
    aggregateId;
    actorId;
    schemaVersion = 1;
    payload;
    #occurredAtTime;
    constructor(input) {
      this.eventId = input.eventId;
      this.eventType = input.eventType;
      this.aggregateId = input.aggregateId;
      this.actorId = input.actorId;
      this.#occurredAtTime = input.occurredAt.getTime();
      this.payload = Object.freeze({ ...input.payload });
      Object.freeze(this);
    }
    static create(input) {
      assertEvent(input);
      return new _Batch4BEvent(input);
    }
    get occurredAt() {
      return new Date(this.#occurredAtTime);
    }
  };
  function assertEvent(value) {
    const fail = () => {
      throw new DomainError(
        "CARBON_BATCH4B_EVENT_INVALID",
        "Batch 4B event does not match the frozen runtime contract."
      );
    };
    if (typeof value !== "object" || value === null) fail();
    const input = value;
    if (!(input.eventId instanceof Identifier) || input.eventId.kind !== "CarbonDomainEvent" || !(input.actorId instanceof Identifier) || input.actorId.kind !== "Actor" || !(input.occurredAt instanceof Date) || !Number.isFinite(input.occurredAt.getTime()) || typeof input.eventType !== "string" || !batch4BEventTypes.includes(input.eventType))
      fail();
    const eventType = input.eventType;
    const kind2 = eventType.startsWith("ActivityDataRecord") ? "ActivityDataRecord" : "DataTrust";
    if (!(input.aggregateId instanceof Identifier) || input.aggregateId.kind !== kind2 || typeof input.payload !== "object" || input.payload === null)
      fail();
    const payload = input.payload;
    const actual = Object.keys(payload).sort();
    const expected = [...keys[eventType]].sort();
    if (actual.length !== expected.length || actual.some((key, i) => key !== expected[i]))
      fail();
    if (!validPayload(eventType, payload)) fail();
  }
  var text = (value) => typeof value === "string" && value.trim().length > 0;
  function validPayload(type, p) {
    switch (type) {
      case "ActivityDataRecordDrafted":
        return text(p.carbonActivityId) && Array.isArray(p.observationIds) && p.observationIds.length > 0 && p.observationIds.every(text) && (p.supersedesId === null || text(p.supersedesId));
      case "ActivityDataRecordRejected":
        return text(p.reason);
      case "ActivityDataRecordSuperseded":
        return text(p.successorId);
      case "ActivityDataRecordCorrectionCreated":
        return text(p.predecessorId) && text(p.reason);
      case "DataTrustRecordCreated":
        return text(p.activityDataRecordId);
      case "DataQualityAssessmentAdded":
        return text(p.assessmentId) && text(p.criterion);
      case "DataQualityAssessmentCompleted":
        return text(p.assessmentId) && text(p.outcome);
      case "EvidenceLinked":
        return text(p.evidenceReferenceId);
      case "DataLineageRecorded":
      case "DataLineageExpanded":
        return text(p.reference);
      default:
        return true;
    }
  }

  // packages/carbon-core/src/batch4b-value-objects.ts
  var activityDataRecordStatuses = Object.freeze([
    "Draft",
    "Submitted",
    "Accepted",
    "Rejected",
    "Locked",
    "Superseded"
  ]);
  var dataTrustStatuses = Object.freeze([
    "Created",
    "NeedsReview",
    "Verified",
    "Archived"
  ]);
  var ObservationFactReference = class _ObservationFactReference {
    observationId;
    carbonActivityId;
    measurementType;
    quantity;
    unit;
    evidenceReferenceIds;
    lifecycleStatus;
    #capturedAtTime;
    constructor(input) {
      this.observationId = input.observationReference.observationId;
      this.carbonActivityId = input.observationReference.carbonActivityId;
      this.measurementType = input.fact.measurementType;
      this.quantity = input.fact.quantity;
      this.unit = input.fact.expectedUnit;
      this.evidenceReferenceIds = Object.freeze([
        ...input.fact.evidenceReferenceIds
      ]);
      this.lifecycleStatus = input.lifecycleStatus;
      this.#capturedAtTime = input.fact.capturedAt.getTime();
      Object.freeze(this);
    }
    static create(input) {
      if (!(input.observationReference instanceof ObservationReference)) {
        throw invalidReference("observationReference");
      }
      if (!(input.fact instanceof CapturedObservationFact)) {
        throw invalidReference("fact");
      }
      assertBatch4ATimestamp(input.fact.capturedAt);
      return new _ObservationFactReference(input);
    }
    get capturedAt() {
      return new Date(this.#capturedAtTime);
    }
  };
  var ActivityDataRecordReference = class _ActivityDataRecordReference {
    constructor(activityDataRecordId) {
      this.activityDataRecordId = activityDataRecordId;
      Object.freeze(this);
    }
    static create(id) {
      assertIdentifierKind(id, "ActivityDataRecord", "activityDataRecordId");
      return new _ActivityDataRecordReference(id);
    }
  };
  var ActivityDataRecordAdmissionSnapshot = class _ActivityDataRecordAdmissionSnapshot {
    constructor(activityDataRecordId, status) {
      this.activityDataRecordId = activityDataRecordId;
      this.status = status;
      Object.freeze(this);
    }
    static create(activityDataRecordId, status) {
      assertIdentifierKind(
        activityDataRecordId,
        "ActivityDataRecord",
        "activityDataRecordId"
      );
      if (!activityDataRecordStatuses.includes(status)) {
        throw new DomainError(
          "CARBON_BATCH4B_INVALID_VALUE",
          "status must be a valid ActivityDataRecord status."
        );
      }
      return new _ActivityDataRecordAdmissionSnapshot(
        activityDataRecordId,
        status
      );
    }
  };
  function invalidReference(field) {
    return new DomainError(
      "CARBON_BATCH4B_INVALID_REFERENCE",
      `${field} is not a valid Batch 4B reference.`
    );
  }

  // packages/carbon-core/src/activity-data-record.ts
  var governedSnapshotAuthority = Symbol("governed-calculation-snapshot");
  var ActivityDataRecordCalculationSnapshot = class _ActivityDataRecordCalculationSnapshot {
    constructor(activityDataRecordRef, observationFactRef, activityQuantitySnapshot) {
      this.activityDataRecordRef = activityDataRecordRef;
      this.observationFactRef = observationFactRef;
      this.activityQuantitySnapshot = activityQuantitySnapshot;
      Object.freeze(this);
    }
    static fromOwnedFact(recordId, fact, authority) {
      if (authority !== governedSnapshotAuthority) {
        throw new DomainError(
          "CARBON_BATCH6_UNGOVERNED_QUANTITY",
          "Calculation snapshots may be created only by an ActivityDataRecord."
        );
      }
      if (fact.quantity === void 0) {
        throw new DomainError(
          "CARBON_BATCH6_QUANTITY_MISSING",
          "A calculation quantity must be present; missing data is not zero."
        );
      }
      return new _ActivityDataRecordCalculationSnapshot(
        ActivityDataRecordReference.create(recordId),
        fact,
        ActivityQuantity.create(fact.quantity.value, fact.quantity.unit)
      );
    }
  };
  var ActivityDataRecordAggregate = class _ActivityDataRecordAggregate {
    id;
    carbonActivityId;
    supersedesId;
    #observations;
    #ancestors;
    #events = [];
    #status = "Draft";
    #successorId;
    constructor(input, metadata2, supersedesId, ancestors = []) {
      validateInput(input);
      this.id = input.id;
      this.carbonActivityId = input.carbonActivityId;
      this.#observations = Object.freeze([...input.observations]);
      this.supersedesId = supersedesId;
      this.#ancestors = Object.freeze([...ancestors]);
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType: "ActivityDataRecordDrafted",
          aggregateId: this.id,
          payload: {
            carbonActivityId: this.carbonActivityId.value,
            observationIds: this.#observations.map(
              (item) => item.observationId.value
            ),
            supersedesId: supersedesId?.value ?? null
          }
        })
      );
    }
    static create(input, metadata2) {
      return new _ActivityDataRecordAggregate(input, metadata2);
    }
    get status() {
      return this.#status;
    }
    get observations() {
      return Object.freeze([...this.#observations]);
    }
    get events() {
      return Object.freeze([...this.#events]);
    }
    get successorId() {
      return this.#successorId;
    }
    createCalculationSnapshot(quantityFact) {
      const governedFact = this.#observations.find(
        (fact) => fact === quantityFact
      );
      if (governedFact === void 0) {
        throw new DomainError(
          "CARBON_BATCH6_RECORD_FACT_MISMATCH",
          "The quantity fact must belong to the same ActivityDataRecord."
        );
      }
      return ActivityDataRecordCalculationSnapshot.fromOwnedFact(
        this.id,
        governedFact,
        governedSnapshotAuthority
      );
    }
    submit(metadata2) {
      this.transition(
        "Draft",
        "Submitted",
        "ActivityDataRecordSubmitted",
        metadata2
      );
    }
    accept(metadata2) {
      this.transition(
        "Submitted",
        "Accepted",
        "ActivityDataRecordAccepted",
        metadata2
      );
    }
    reject(reason, metadata2) {
      this.assertStatus("Submitted", "Rejected");
      this.#status = "Rejected";
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType: "ActivityDataRecordRejected",
          aggregateId: this.id,
          payload: { reason: nonBlank4(reason) }
        })
      );
    }
    lock(metadata2) {
      this.transition("Accepted", "Locked", "ActivityDataRecordLocked", metadata2);
    }
    createCorrection(input, metadata2) {
      if (this.#status !== "Accepted" && this.#status !== "Locked" || this.#successorId !== void 0 || input.id.equals(this.id) || this.#ancestors.includes(input.id.value) || !input.carbonActivityId.equals(this.carbonActivityId)) {
        throw supersessionError();
      }
      const reason = nonBlank4(input.reason);
      const successor = new _ActivityDataRecordAggregate(
        input,
        metadata2,
        this.id,
        [...this.#ancestors, this.id.value]
      );
      this.#successorId = successor.id;
      this.#status = "Superseded";
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType: "ActivityDataRecordSuperseded",
          aggregateId: this.id,
          payload: { successorId: successor.id.value }
        })
      );
      successor.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType: "ActivityDataRecordCorrectionCreated",
          aggregateId: successor.id,
          payload: { predecessorId: this.id.value, reason }
        })
      );
      return successor;
    }
    transition(from, to, eventType, metadata2) {
      this.assertStatus(from, to);
      this.#status = to;
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType,
          aggregateId: this.id,
          payload: {}
        })
      );
    }
    assertStatus(expected, next) {
      if (this.#status !== expected)
        throw new DomainError(
          "CARBON_BATCH4B_INVALID_TRANSITION",
          `ActivityDataRecord cannot transition from ${this.#status} to ${next}.`
        );
    }
  };
  function validateInput(input) {
    assertIdentifierKind(input.id, "ActivityDataRecord", "id");
    assertIdentifierKind(
      input.carbonActivityId,
      "CarbonActivity",
      "carbonActivityId"
    );
    if (input.observations.length === 0 || input.observations.some(
      (item) => !(item instanceof ObservationFactReference)
    ))
      throw new DomainError(
        "CARBON_BATCH4B_INVALID_REFERENCE",
        "An ActivityDataRecord requires one or more Observation fact references."
      );
    const ids = input.observations.map((item) => item.observationId.value);
    if (new Set(ids).size !== ids.length)
      throw new DomainError(
        "CARBON_BATCH4B_DUPLICATE_OBSERVATION",
        "Observation references must be unique within an ActivityDataRecord."
      );
    if (input.observations.some(
      (item) => !item.carbonActivityId.equals(input.carbonActivityId)
    ))
      throw new DomainError(
        "CARBON_BATCH4B_ACTIVITY_MISMATCH",
        "All Observations must belong to the ActivityDataRecord CarbonActivity."
      );
  }
  function nonBlank4(value) {
    const result = value.trim();
    if (!result)
      throw new DomainError(
        "CARBON_BATCH4B_INVALID_VALUE",
        "Value must be non-blank."
      );
    return result;
  }
  function supersessionError() {
    return new DomainError(
      "CARBON_BATCH4B_SUPERSESSION_INVALID",
      "Supersession must be directional, linear, and acyclic."
    );
  }

  // packages/carbon-core/src/data-trust.ts
  var DataTrustAggregate = class _DataTrustAggregate {
    id;
    activityDataRecordReference;
    #assessments = [];
    #evidence = [];
    #lineage = [];
    #events = [];
    #status = "Created";
    constructor(id, reference, metadata2) {
      this.id = id;
      this.activityDataRecordReference = reference;
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType: "DataTrustRecordCreated",
          aggregateId: id,
          payload: { activityDataRecordId: reference.activityDataRecordId.value }
        })
      );
    }
    static create(id, reference, metadata2) {
      assertIdentifierKind(id, "DataTrust", "id");
      if (!(reference instanceof ActivityDataRecordReference))
        throw new DomainError(
          "CARBON_BATCH4B_INVALID_REFERENCE",
          "DataTrust requires exactly one ActivityDataRecord reference."
        );
      return new _DataTrustAggregate(id, reference, metadata2);
    }
    get status() {
      return this.#status;
    }
    get assessments() {
      return Object.freeze(
        this.#assessments.map((item) => Object.freeze({ ...item }))
      );
    }
    get evidenceReferenceIds() {
      return Object.freeze([...this.#evidence]);
    }
    get lineage() {
      return Object.freeze([...this.#lineage]);
    }
    get events() {
      return Object.freeze([...this.#events]);
    }
    markNeedsReview(metadata2) {
      this.assertMutable();
      if (this.#status !== "Created")
        throw invalidTransition(this.#status, "NeedsReview");
      this.#status = "NeedsReview";
      this.empty("DataTrustMarkedNeedsReview", metadata2);
    }
    addAssessment(id, criterion, metadata2) {
      this.assertMutable();
      id = required(id);
      criterion = required(criterion);
      if (this.#assessments.some((item) => item.id === id))
        throw new DomainError(
          "CARBON_BATCH4B_DUPLICATE_ASSESSMENT",
          "Assessment identifiers must be unique."
        );
      this.#assessments.push(Object.freeze({ id, criterion }));
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType: "DataQualityAssessmentAdded",
          aggregateId: this.id,
          payload: { assessmentId: id, criterion }
        })
      );
    }
    completeAssessment(id, outcome2, metadata2) {
      this.assertMutable();
      const index = this.#assessments.findIndex((item) => item.id === id);
      if (index < 0)
        throw new DomainError(
          "CARBON_BATCH4B_ASSESSMENT_NOT_FOUND",
          "Assessment must exist before completion."
        );
      const current = this.#assessments[index];
      if (current === void 0)
        throw new DomainError(
          "CARBON_BATCH4B_ASSESSMENT_NOT_FOUND",
          "Assessment must exist before completion."
        );
      if (current.outcome !== void 0)
        throw new DomainError(
          "CARBON_BATCH4B_ASSESSMENT_IMMUTABLE",
          "Completed assessments cannot be overwritten."
        );
      outcome2 = required(outcome2);
      this.#assessments[index] = Object.freeze({
        id: current.id,
        criterion: current.criterion,
        outcome: outcome2
      });
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType: "DataQualityAssessmentCompleted",
          aggregateId: this.id,
          payload: { assessmentId: id, outcome: outcome2 }
        })
      );
    }
    linkEvidence(id, metadata2) {
      this.assertMutable();
      assertIdentifierKind(id, "EvidenceReference", "evidenceReferenceId");
      if (this.#evidence.some((item) => item.equals(id)))
        throw new DomainError(
          "CARBON_BATCH4B_DUPLICATE_EVIDENCE",
          "Evidence links are immutable and unique."
        );
      this.#evidence.push(id);
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType: "EvidenceLinked",
          aggregateId: this.id,
          payload: { evidenceReferenceId: id.value }
        })
      );
    }
    recordLineage(reference, metadata2) {
      this.addLineage(reference, "DataLineageRecorded", metadata2);
    }
    expandLineage(reference, metadata2) {
      this.addLineage(reference, "DataLineageExpanded", metadata2);
    }
    validate(metadata2) {
      this.assertVerifiable();
      this.empty("DataTrustValidated", metadata2);
    }
    verify(metadata2) {
      this.assertVerifiable();
      this.#status = "Verified";
      this.empty("DataTrustVerified", metadata2);
    }
    archive(metadata2) {
      if (this.#status !== "Verified")
        throw invalidTransition(this.#status, "Archived");
      this.#status = "Archived";
      this.empty("DataTrustArchived", metadata2);
    }
    isReadyForLaterFactorSelection(snapshot) {
      return snapshot instanceof ActivityDataRecordAdmissionSnapshot && snapshot.activityDataRecordId.equals(
        this.activityDataRecordReference.activityDataRecordId
      ) && this.#status === "Verified" && (snapshot.status === "Accepted" || snapshot.status === "Locked");
    }
    assertVerifiable() {
      if (this.#status !== "NeedsReview" || this.#assessments.length === 0 || this.#assessments.some(
        (assessment) => assessment.outcome === void 0
      ) || this.#evidence.length === 0 || this.#lineage.length === 0) {
        throw new DomainError(
          "CARBON_BATCH4B_TRUST_NOT_VERIFIABLE",
          "DataTrust verification requires NeedsReview status, completed assessments, evidence, and lineage."
        );
      }
    }
    addLineage(reference, eventType, metadata2) {
      this.assertMutable();
      reference = required(reference);
      this.#lineage.push(reference);
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType,
          aggregateId: this.id,
          payload: { reference }
        })
      );
    }
    empty(eventType, metadata2) {
      this.#events.push(
        Batch4BEvent.create({
          ...metadata2,
          eventType,
          aggregateId: this.id,
          payload: {}
        })
      );
    }
    assertMutable() {
      if (this.#status === "Archived")
        throw invalidTransition("Archived", "Archived");
    }
  };
  function required(value) {
    const result = value.trim();
    if (!result)
      throw new DomainError(
        "CARBON_BATCH4B_INVALID_VALUE",
        "Value must be non-blank."
      );
    return result;
  }
  function invalidTransition(from, to) {
    return new DomainError(
      "CARBON_BATCH4B_INVALID_TRANSITION",
      `DataTrust cannot transition from ${from} to ${to}.`
    );
  }

  // packages/carbon-core/src/batch4a-events.ts
  var batch4AEventTypes = Object.freeze([
    "EmissionSourceDrafted",
    "EmissionSourceRegistered",
    "EmissionSourceActivated",
    "EmissionSourceSuspended",
    "EmissionSourceReactivated",
    "EmissionSourceRetired",
    "EmissionSourceDetailsChanged",
    "CarbonActivityPlanned",
    "CarbonActivityOccurred",
    "CarbonActivityObserved",
    "CarbonActivityRecorded",
    "CarbonActivityClosed",
    "CarbonActivityCancelled",
    "ObservationCreated",
    "ObservationCaptured",
    "ObservationValidated",
    "ObservationConsumed",
    "ObservationDiscarded"
  ]);
  var payloadKeys = Object.freeze({
    EmissionSourceDrafted: Object.freeze([
      "reportingEntityVersionId",
      "accountingContextId",
      "sourceCategory"
    ]),
    EmissionSourceRegistered: Object.freeze([]),
    EmissionSourceActivated: Object.freeze([]),
    EmissionSourceSuspended: Object.freeze([]),
    EmissionSourceReactivated: Object.freeze([]),
    EmissionSourceRetired: Object.freeze([]),
    EmissionSourceDetailsChanged: Object.freeze([
      "sourceName",
      "sourceCategory"
    ]),
    CarbonActivityPlanned: Object.freeze([
      "emissionSourceId",
      "activityDefinitionCode",
      "expectedUnit"
    ]),
    CarbonActivityOccurred: Object.freeze([
      "occurrenceKind",
      "startAt",
      "endAt"
    ]),
    CarbonActivityObserved: Object.freeze(["observationId"]),
    CarbonActivityRecorded: Object.freeze([]),
    CarbonActivityClosed: Object.freeze([]),
    CarbonActivityCancelled: Object.freeze([]),
    ObservationCreated: Object.freeze([
      "carbonActivityId",
      "measurementType",
      "versionNumber",
      "supersedesId"
    ]),
    ObservationCaptured: Object.freeze(["measurementType", "value", "unit"]),
    ObservationValidated: Object.freeze([]),
    ObservationConsumed: Object.freeze([]),
    ObservationDiscarded: Object.freeze([])
  });
  function aggregateKind(eventType) {
    if (eventType.startsWith("EmissionSource")) return "EmissionSource";
    if (eventType.startsWith("CarbonActivity")) return "CarbonActivity";
    return "Observation";
  }
  var Batch4AEvent = class _Batch4AEvent {
    eventId;
    eventType;
    aggregateId;
    actorId;
    schemaVersion = 1;
    payload;
    #occurredAtTime;
    constructor(input) {
      this.eventId = input.eventId;
      this.eventType = input.eventType;
      this.aggregateId = input.aggregateId;
      this.actorId = input.actorId;
      this.#occurredAtTime = input.occurredAt.getTime();
      this.payload = Object.freeze({ ...input.payload });
      Object.freeze(this);
    }
    static create(input) {
      assertEvent2(input);
      return new _Batch4AEvent(input);
    }
    get occurredAt() {
      return new Date(this.#occurredAtTime);
    }
  };
  function invalidEvent() {
    return new DomainError(
      "CARBON_BATCH4A_EVENT_INVALID",
      "Batch 4A event does not match the frozen runtime contract."
    );
  }
  function isIdentifier(value, kind2) {
    return value instanceof Identifier && value.kind === kind2;
  }
  function nonBlank5(value) {
    return typeof value === "string" && value.trim().length > 0;
  }
  function validIso(value) {
    return typeof value === "string" && Number.isFinite(Date.parse(value));
  }
  function assertEvent2(value) {
    if (typeof value !== "object" || value === null) throw invalidEvent();
    const input = value;
    if (!isIdentifier(input.eventId, "CarbonDomainEvent") || !isIdentifier(input.actorId, "Actor") || !(input.occurredAt instanceof Date) || !Number.isFinite(input.occurredAt.getTime()) || typeof input.eventType !== "string" || !batch4AEventTypes.includes(input.eventType)) {
      throw invalidEvent();
    }
    const eventType = input.eventType;
    if (!isIdentifier(input.aggregateId, aggregateKind(eventType))) {
      throw invalidEvent();
    }
    if (typeof input.payload !== "object" || input.payload === null) {
      throw invalidEvent();
    }
    const payload = input.payload;
    const actual = Object.keys(payload).sort();
    const expected = [...payloadKeys[eventType]].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
      throw invalidEvent();
    }
    assertPayload(eventType, payload);
  }
  function assertPayload(eventType, payload) {
    let valid;
    switch (eventType) {
      case "EmissionSourceDrafted":
        valid = nonBlank5(payload.reportingEntityVersionId) && nonBlank5(payload.accountingContextId) && nonBlank5(payload.sourceCategory);
        break;
      case "EmissionSourceDetailsChanged":
        valid = nonBlank5(payload.sourceName) && nonBlank5(payload.sourceCategory);
        break;
      case "CarbonActivityPlanned":
        valid = nonBlank5(payload.emissionSourceId) && nonBlank5(payload.activityDefinitionCode) && validUnit(payload.expectedUnit);
        break;
      case "CarbonActivityOccurred":
        valid = (payload.occurrenceKind === "INSTANT" || payload.occurrenceKind === "PERIOD") && validIso(payload.startAt) && (payload.endAt === null || validIso(payload.endAt) && Date.parse(payload.endAt) >= Date.parse(payload.startAt)) && (payload.occurrenceKind === "PERIOD" || payload.endAt === null);
        break;
      case "CarbonActivityObserved":
        valid = nonBlank5(payload.observationId);
        break;
      case "ObservationCreated":
        valid = nonBlank5(payload.carbonActivityId) && validMeasurement(payload.measurementType) && Number.isSafeInteger(payload.versionNumber) && payload.versionNumber > 0 && (payload.supersedesId === null || nonBlank5(payload.supersedesId));
        break;
      case "ObservationCaptured":
        valid = validMeasurement(payload.measurementType) && (payload.measurementType === "MISSING" && payload.value === null && payload.unit === null || payload.measurementType !== "MISSING" && nonBlank5(payload.value) && validUnit(payload.unit));
        break;
      default:
        valid = true;
    }
    if (!valid) throw invalidEvent();
  }
  function validMeasurement(value) {
    return typeof value === "string" && measurementTypes.includes(value);
  }
  function validUnit(value) {
    try {
      unitDimensionOf(value);
      return true;
    } catch {
      return false;
    }
  }

  // packages/carbon-core/src/carbon-activity.ts
  var CarbonActivityAggregate = class _CarbonActivityAggregate {
    id;
    emissionSourceReference;
    activityDefinitionCode;
    expectedUnit;
    plannedPeriod;
    #status = "Planned";
    #occurrence;
    #observationReference;
    #events = [];
    constructor(input, metadata2) {
      this.id = input.id;
      this.emissionSourceReference = input.emissionSourceReference;
      this.activityDefinitionCode = assertBatch4ANonBlank(
        input.activityDefinitionCode
      );
      this.expectedUnit = input.expectedUnit;
      this.plannedPeriod = input.plannedPeriod;
      this.#events.push(
        Batch4AEvent.create({
          ...metadata2,
          eventType: "CarbonActivityPlanned",
          aggregateId: this.id,
          payload: {
            emissionSourceId: this.emissionSourceReference.emissionSourceId.value,
            activityDefinitionCode: this.activityDefinitionCode,
            expectedUnit: this.expectedUnit
          }
        })
      );
    }
    static create(input, metadata2) {
      assertIdentifierKind(input.id, "CarbonActivity", "id");
      if (!(input.emissionSourceReference instanceof EmissionSourceReference)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_REFERENCE",
          "emissionSourceReference must be an EmissionSourceReference."
        );
      }
      unitDimensionOf(input.expectedUnit);
      if (!(input.plannedPeriod instanceof ValidityPeriod)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_VALUE",
          "plannedPeriod must be a ValidityPeriod."
        );
      }
      return new _CarbonActivityAggregate(input, metadata2);
    }
    get status() {
      return this.#status;
    }
    get occurrence() {
      return this.#occurrence;
    }
    get observationReference() {
      return this.#observationReference;
    }
    get events() {
      return Object.freeze([...this.#events]);
    }
    toReference() {
      return CarbonActivityReference.create({
        carbonActivityId: this.id,
        emissionSourceReference: this.emissionSourceReference,
        activityDefinitionCode: this.activityDefinitionCode,
        expectedUnit: this.expectedUnit
      });
    }
    occur(occurrence, metadata2) {
      this.assertStatus("Planned", "Occurred");
      if (!(occurrence instanceof ActivityOccurrence)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_VALUE",
          "occurrence must be an ActivityOccurrence."
        );
      }
      this.#occurrence = occurrence;
      this.#status = "Occurred";
      this.#events.push(
        Batch4AEvent.create({
          ...metadata2,
          eventType: "CarbonActivityOccurred",
          aggregateId: this.id,
          payload: {
            occurrenceKind: occurrence.kind,
            startAt: occurrence.startAt,
            endAt: occurrence.endAt
          }
        })
      );
    }
    observe(reference, metadata2) {
      this.assertStatus("Occurred", "Observed");
      if (!(reference instanceof ObservationReference) || !reference.carbonActivityId.equals(this.id)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_REFERENCE",
          "Observation reference must identify this Carbon Activity."
        );
      }
      this.#observationReference = reference;
      this.#status = "Observed";
      this.#events.push(
        Batch4AEvent.create({
          ...metadata2,
          eventType: "CarbonActivityObserved",
          aggregateId: this.id,
          payload: { observationId: reference.observationId.value }
        })
      );
    }
    record(metadata2) {
      this.transition("Observed", "Recorded", "CarbonActivityRecorded", metadata2);
    }
    close(metadata2) {
      this.transition("Recorded", "Closed", "CarbonActivityClosed", metadata2);
    }
    cancel(metadata2) {
      this.transition(
        "Planned",
        "Cancelled",
        "CarbonActivityCancelled",
        metadata2
      );
    }
    transition(expected, next, eventType, metadata2) {
      this.assertStatus(expected, next);
      this.#status = next;
      this.#events.push(
        Batch4AEvent.create({
          ...metadata2,
          eventType,
          aggregateId: this.id,
          payload: {}
        })
      );
    }
    assertStatus(expected, next) {
      if (this.#status !== expected) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_TRANSITION",
          `Carbon Activity cannot transition from ${this.#status} to ${next}.`,
          { from: this.#status, to: next }
        );
      }
    }
  };

  // packages/carbon-core/src/batch4a-identifiers.ts
  var createEmissionSourceId = (value) => Identifier.create("EmissionSource", value);
  var createCarbonActivityId = (value) => Identifier.create("CarbonActivity", value);
  var createObservationId = (value) => Identifier.create("Observation", value);
  var createActivityDataRecordId = (value) => Identifier.create("ActivityDataRecord", value);
  var createDataTrustId = (value) => Identifier.create("DataTrust", value);
  var createFactorDatasetVersionId = (value) => Identifier.create("FactorDatasetVersion", value);
  var createEmissionFactorId = (value) => Identifier.create("EmissionFactor", value);
  var createFactorSelectionPolicyId = (value) => Identifier.create("FactorSelectionPolicy", value);
  var createFactorSelectionId = (value) => Identifier.create("FactorSelection", value);
  var createEmissionCalculationId = (value) => Identifier.create("EmissionCalculation", value);

  // packages/carbon-core/src/batch5-value-objects.ts
  var FactorDatasetVersionReference = class _FactorDatasetVersionReference {
    constructor(id) {
      this.id = id;
      Object.freeze(this);
    }
    static create(id) {
      assertIdentifierKind(id, "FactorDatasetVersion", "factorDatasetVersionId");
      return new _FactorDatasetVersionReference(id);
    }
  };
  var EmissionFactorReference = class _EmissionFactorReference {
    constructor(id) {
      this.id = id;
      Object.freeze(this);
    }
    static create(id) {
      assertIdentifierKind(id, "EmissionFactor", "emissionFactorId");
      return new _EmissionFactorReference(id);
    }
  };
  var FactorApplicability = class _FactorApplicability {
    constructor(activitySemanticKey, accountingContextReference) {
      this.activitySemanticKey = activitySemanticKey;
      this.accountingContextReference = accountingContextReference;
      Object.freeze(this);
    }
    static create(activitySemanticKey, accountingContextReference) {
      return new _FactorApplicability(
        required2(activitySemanticKey, "activitySemanticKey"),
        required2(accountingContextReference, "accountingContextReference")
      );
    }
    matches(other) {
      return this.activitySemanticKey === other.activitySemanticKey && this.accountingContextReference === other.accountingContextReference;
    }
  };
  var ApplicabilitySnapshot = class _ApplicabilitySnapshot {
    constructor(activitySemanticKey, accountingContextReference) {
      this.activitySemanticKey = activitySemanticKey;
      this.accountingContextReference = accountingContextReference;
      Object.freeze(this);
    }
    static from(value) {
      if (!(value instanceof FactorApplicability)) throw invalid("applicability");
      return new _ApplicabilitySnapshot(
        value.activitySemanticKey,
        value.accountingContextReference
      );
    }
  };
  var FactorUnit = class _FactorUnit {
    constructor(carbonOutputUnit, carbonGasBasis, denominatorUnit) {
      this.carbonOutputUnit = carbonOutputUnit;
      this.carbonGasBasis = carbonGasBasis;
      this.denominatorUnit = denominatorUnit;
      Object.freeze(this);
    }
    static create(carbonOutputUnit, carbonGasBasis, denominatorUnit) {
      assertMassUnit(carbonOutputUnit);
      assertCarbonGasBasis(carbonGasBasis);
      areUnitsCompatible(denominatorUnit, denominatorUnit);
      return new _FactorUnit(carbonOutputUnit, carbonGasBasis, denominatorUnit);
    }
    accepts(activityUnit) {
      return areUnitsCompatible(activityUnit, this.denominatorUnit);
    }
  };
  var FactorUnitSnapshot = class _FactorUnitSnapshot {
    constructor(carbonOutputUnit, carbonGasBasis, denominatorUnit) {
      this.carbonOutputUnit = carbonOutputUnit;
      this.carbonGasBasis = carbonGasBasis;
      this.denominatorUnit = denominatorUnit;
      Object.freeze(this);
    }
    static from(value) {
      if (!(value instanceof FactorUnit)) throw invalid("factorUnit");
      return new _FactorUnitSnapshot(
        value.carbonOutputUnit,
        value.carbonGasBasis,
        value.denominatorUnit
      );
    }
  };
  var FactorValueSnapshot = class _FactorValueSnapshot {
    constructor(value) {
      this.value = value;
      Object.freeze(this);
    }
    static from(value) {
      return new _FactorValueSnapshot(value.toString());
    }
  };
  var PolicySnapshot = class _PolicySnapshot {
    constructor(policyId, version, resolutionRule) {
      this.policyId = policyId;
      this.version = version;
      this.resolutionRule = resolutionRule;
      Object.freeze(this);
    }
    static create(policyId, version) {
      assertIdentifierKind(policyId, "FactorSelectionPolicy", "policyId");
      return new _PolicySnapshot(
        policyId,
        required2(version, "policyVersion"),
        "UniqueEligibleCandidate"
      );
    }
  };
  var ActivityDataRecordSelectionSemanticsSnapshot = class _ActivityDataRecordSelectionSemanticsSnapshot {
    activityDataRecordId;
    applicability;
    quantityUnit;
    #relevantAtTime;
    constructor(input) {
      this.activityDataRecordId = input.activityDataRecordId;
      this.applicability = input.applicability;
      this.quantityUnit = input.quantityUnit;
      this.#relevantAtTime = input.relevantAt.getTime();
      Object.freeze(this);
    }
    static create(input) {
      assertIdentifierKind(
        input.activityDataRecordId,
        "ActivityDataRecord",
        "activityDataRecordId"
      );
      if (!(input.applicability instanceof FactorApplicability))
        throw invalid("applicability");
      areUnitsCompatible(input.quantityUnit, input.quantityUnit);
      if (!Number.isFinite(input.relevantAt.getTime()))
        throw invalid("relevantAt");
      return new _ActivityDataRecordSelectionSemanticsSnapshot(input);
    }
    get relevantAt() {
      return new Date(this.#relevantAtTime);
    }
  };
  var ActivityFactorSelectionContext = class _ActivityFactorSelectionContext {
    activityDataRecordId;
    admissionSnapshot;
    selectionSemanticsSnapshot;
    constructor(input) {
      this.activityDataRecordId = input.activityDataRecordId;
      this.admissionSnapshot = input.admissionSnapshot;
      this.selectionSemanticsSnapshot = input.selectionSemanticsSnapshot;
      Object.freeze(this);
    }
    static create(input) {
      assertIdentifierKind(
        input.activityDataRecordId,
        "ActivityDataRecord",
        "activityDataRecordId"
      );
      if (!input.admissionSnapshot.activityDataRecordId.equals(
        input.activityDataRecordId
      )) {
        throw invalid("admissionSnapshot");
      }
      if (!(input.selectionSemanticsSnapshot instanceof ActivityDataRecordSelectionSemanticsSnapshot) || !input.selectionSemanticsSnapshot.activityDataRecordId.equals(
        input.activityDataRecordId
      )) {
        throw invalid("selectionSemanticsSnapshot");
      }
      return new _ActivityFactorSelectionContext(input);
    }
    get applicability() {
      return this.selectionSemanticsSnapshot.applicability;
    }
    get quantityUnit() {
      return this.selectionSemanticsSnapshot.quantityUnit;
    }
    get relevantAt() {
      return this.selectionSemanticsSnapshot.relevantAt;
    }
  };
  function isValidAt(validity2, instant) {
    return validity2.containsInstant(instant);
  }
  function required2(value, field) {
    const normalized = value.trim();
    if (!normalized) throw invalid(field);
    return normalized;
  }
  function invalid(field) {
    return new DomainError("CARBON_BATCH5_INVALID_VALUE", `${field} is invalid.`);
  }

  // packages/carbon-core/src/factor-selection.ts
  var FrozenFactorSelection = class _FrozenFactorSelection {
    constructor(factorSelectionId, activityDataRecordRef, activityDataRecordAdmissionSnapshot, emissionFactorRef, factorDatasetVersionRef, factorValueSnapshot, factorUnitSnapshot, applicabilitySnapshot, policySnapshot) {
      this.factorSelectionId = factorSelectionId;
      this.activityDataRecordRef = activityDataRecordRef;
      this.activityDataRecordAdmissionSnapshot = activityDataRecordAdmissionSnapshot;
      this.emissionFactorRef = emissionFactorRef;
      this.factorDatasetVersionRef = factorDatasetVersionRef;
      this.factorValueSnapshot = factorValueSnapshot;
      this.factorUnitSnapshot = factorUnitSnapshot;
      this.applicabilitySnapshot = applicabilitySnapshot;
      this.policySnapshot = policySnapshot;
      Object.freeze(this);
    }
    status = "Frozen";
    static create(id, context, factor, policy) {
      return new _FrozenFactorSelection(
        id,
        context.activityDataRecordId,
        context.admissionSnapshot,
        factor.toReference(),
        factor.datasetVersionReference,
        FactorValueSnapshot.from(factor.value),
        FactorUnitSnapshot.from(factor.unit),
        ApplicabilitySnapshot.from(factor.applicability),
        policy.snapshot
      );
    }
  };
  var FactorSelection = class _FactorSelection {
    id;
    activityContext;
    #status = "Draft";
    #frozen;
    constructor(id, context) {
      this.id = id;
      this.activityContext = context;
    }
    static create(id, context) {
      assertIdentifierKind(id, "FactorSelection", "id");
      if (!(context instanceof ActivityFactorSelectionContext))
        throw new DomainError(
          "CARBON_BATCH5_INVALID_VALUE",
          "Selection context is invalid."
        );
      return new _FactorSelection(id, context);
    }
    get status() {
      return this.#status;
    }
    get frozenSelection() {
      return this.#frozen;
    }
    get isEligibleForBatch6() {
      return this.#status === "Frozen";
    }
    evaluate(trust, candidates, policy) {
      if (this.#status !== "Draft")
        throw new DomainError(
          "CARBON_BATCH5_SELECTION_IMMUTABLE",
          "A completed FactorSelection cannot be changed."
        );
      if (!trust.isReadyForLaterFactorSelection(
        this.activityContext.admissionSnapshot
      )) {
        this.#status = "Unresolved";
        return;
      }
      const eligible = candidates.filter(
        (factor) => factor.status === "Published" && factor.applicability.matches(this.activityContext.applicability) && factor.unit.accepts(this.activityContext.quantityUnit) && isValidAt(factor.validity, this.activityContext.relevantAt)
      );
      const resolved = policy.resolve(eligible);
      if (resolved === void 0) {
        this.#status = "Unresolved";
        return;
      }
      this.#frozen = FrozenFactorSelection.create(
        this.id,
        this.activityContext,
        resolved,
        policy
      );
      this.#status = "Frozen";
    }
  };

  // packages/carbon-core/src/emission-result.ts
  var EmissionResult = class _EmissionResult {
    constructor(emissionCalculationId, activityDataRecordRef, factorSelectionRef, activityQuantitySnapshot, factorValueSnapshot, factorUnitSnapshot, result, calculatedAt) {
      this.emissionCalculationId = emissionCalculationId;
      this.activityDataRecordRef = activityDataRecordRef;
      this.factorSelectionRef = factorSelectionRef;
      this.activityQuantitySnapshot = activityQuantitySnapshot;
      this.factorValueSnapshot = factorValueSnapshot;
      this.factorUnitSnapshot = factorUnitSnapshot;
      this.result = result;
      this.#calculatedAtTime = calculatedAt.getTime();
      Object.freeze(this);
    }
    #calculatedAtTime;
    static calculate(id, quantity, factor, calculatedAt) {
      assertIdentifierKind(id, "EmissionCalculation", "emissionCalculationId");
      if (!(quantity instanceof ActivityDataRecordCalculationSnapshot)) {
        throw new DomainError(
          "CARBON_BATCH6_INVALID_VALUE",
          "A governed ActivityDataRecordCalculationSnapshot is required."
        );
      }
      if (!(factor instanceof FrozenFactorSelection)) {
        throw new DomainError(
          "CARBON_BATCH6_INVALID_VALUE",
          "A FrozenFactorSelection is required."
        );
      }
      if (!(calculatedAt instanceof Date) || !Number.isFinite(calculatedAt.getTime())) {
        throw new DomainError(
          "CARBON_BATCH6_TIMESTAMP_INVALID",
          "calculatedAt must be a valid timestamp."
        );
      }
      if (!factor.activityDataRecordRef.equals(
        quantity.activityDataRecordRef.activityDataRecordId
      )) {
        throw new DomainError(
          "CARBON_BATCH6_RECORD_MISMATCH",
          "Quantity and FrozenFactorSelection must reference the same ActivityDataRecord."
        );
      }
      const unit = factor.factorUnitSnapshot;
      const normalizedQuantity = quantity.activityQuantitySnapshot.convertTo(
        unit.denominatorUnit
      );
      const product = ExactDecimal.parse(normalizedQuantity.value).multiply(
        ExactDecimal.parse(
          factor.factorValueSnapshot.value,
          "CARBON_BATCH6_FACTOR_INVALID",
          "Frozen factor value"
        )
      );
      return new _EmissionResult(
        id,
        quantity.activityDataRecordRef,
        factor.factorSelectionId,
        ActivityQuantity.create(
          quantity.activityQuantitySnapshot.value,
          quantity.activityQuantitySnapshot.unit
        ),
        factor.factorValueSnapshot,
        factor.factorUnitSnapshot,
        CarbonQuantity.create(
          product.toString(),
          unit.carbonOutputUnit,
          unit.carbonGasBasis
        ),
        calculatedAt
      );
    }
    get calculatedAt() {
      return new Date(this.#calculatedAtTime);
    }
  };

  // packages/carbon-core/src/reduction-identifiers.ts
  var createReductionPlanId = (value) => Identifier.create("ReductionPlan", value);
  var createReductionMeasureId = (value) => Identifier.create("ReductionMeasure", value);
  var createReductionExecutionFactId = (value) => Identifier.create("ReductionExecutionFact", value);
  var createReductionAccountingUnitId = (value) => Identifier.create("ReductionAccountingUnit", value);
  var createReductionOutcomeId = (value) => Identifier.create("ReductionOutcome", value);

  // packages/carbon-core/src/reduction-outcome-events.ts
  var ReductionOutcomeEvent = class _ReductionOutcomeEvent {
    constructor(eventId, eventType, aggregateId, actorId, occurredAt, payload) {
      this.eventId = eventId;
      this.eventType = eventType;
      this.aggregateId = aggregateId;
      this.actorId = actorId;
      this.payload = payload;
      this.#occurredAt = occurredAt.getTime();
      Object.freeze(this.payload);
      Object.freeze(this);
    }
    schemaVersion = 1;
    #occurredAt;
    static create(input) {
      const value = input;
      if (!(value.eventId instanceof Identifier) || value.eventId.kind !== "CarbonDomainEvent" || !(value.actorId instanceof Identifier) || value.actorId.kind !== "Actor" || !(value.aggregateId instanceof Identifier) || value.aggregateId.kind !== "ReductionOutcome" || !["ReductionSourceAssessed", "ReductionOutcomeFinalized"].includes(
        input.eventType
      ) || !(input.occurredAt instanceof Date) || !Number.isFinite(input.occurredAt.getTime()) || Object.keys(input.payload).length === 0 || Object.values(input.payload).some(
        (value2) => typeof value2 !== "string" || value2.trim().length === 0
      ))
        throw new DomainError(
          "CARBON_REDUCTION_R3_EVENT_INVALID",
          "Reduction outcome event is invalid."
        );
      return new _ReductionOutcomeEvent(
        input.eventId,
        input.eventType,
        input.aggregateId,
        input.actorId,
        input.occurredAt,
        Object.freeze({ ...input.payload })
      );
    }
    get occurredAt() {
      return new Date(this.#occurredAt);
    }
  };

  // packages/carbon-core/src/reduction-outcome.ts
  var ObservedEmissionChange = class _ObservedEmissionChange {
    constructor(direction, magnitude) {
      this.direction = direction;
      this.magnitude = magnitude;
      Object.freeze(this);
    }
    static compare(before, after) {
      const comparison = before.compare(after);
      if (comparison > 0)
        return new _ObservedEmissionChange(
          "REDUCTION",
          before.subtractNonnegative(after)
        );
      if (comparison < 0)
        return new _ObservedEmissionChange(
          "INCREASE",
          after.subtractNonnegative(before)
        );
      return new _ObservedEmissionChange(
        "NO_CHANGE",
        CarbonQuantity.create("0", before.unit, before.gasBasis)
      );
    }
  };
  var ReductionAttribution = class _ReductionAttribution {
    constructor(classification, evidenceKind, evidenceReferenceIds = [], accountingUnitId, measureId, executionFactId) {
      this.classification = classification;
      this.evidenceKind = evidenceKind;
      this.evidenceReferenceIds = evidenceReferenceIds;
      this.accountingUnitId = accountingUnitId;
      this.measureId = measureId;
      this.executionFactId = executionFactId;
      Object.freeze(this.evidenceReferenceIds);
      Object.freeze(this);
    }
    static active(input) {
      assertKind2(input.accountingUnitId, "ReductionAccountingUnit");
      assertKind2(input.measureId, "ReductionMeasure");
      assertKind2(input.executionFactId, "ReductionExecutionFact");
      return new _ReductionAttribution(
        "ACTIVE_REDUCTION",
        void 0,
        [],
        input.accountingUnitId,
        input.measureId,
        input.executionFactId
      );
    }
    static activityLevel(input) {
      const evidence = input.evidenceReferenceIds;
      if (!["OUTPUT", "OPERATING_TIME", "SALES_VOLUME"].includes(
        input.evidenceKind
      ) || input.evidenceReferenceIds.length === 0 || evidence.some(
        (id) => !(id instanceof Identifier) || id.kind !== "EvidenceReference"
      ))
        throw r3(
          "CARBON_REDUCTION_R3_ACTIVITY_EVIDENCE_REQUIRED",
          "Activity-level reduction requires governed Lite evidence."
        );
      return new _ReductionAttribution(
        "ACTIVITY_LEVEL_REDUCTION",
        input.evidenceKind,
        [...input.evidenceReferenceIds]
      );
    }
    static otherOrUnresolved() {
      return new _ReductionAttribution("OTHER_OR_UNRESOLVED");
    }
  };
  var ReductionComparison = class _ReductionComparison {
    constructor(baselineSource, afterSource, observedChange, attribution) {
      this.baselineSource = baselineSource;
      this.afterSource = afterSource;
      this.observedChange = observedChange;
      this.attribution = attribution;
      Object.freeze(this);
    }
    static create(input) {
      const before = input.baseline.source(input.baselineSourceId);
      if (before === void 0)
        throw r3(
          "CARBON_REDUCTION_R3_SOURCE_NOT_IN_BASELINE",
          "Assessment source is outside the baseline."
        );
      assertComparable(
        input.baseline,
        input.targetPeriod,
        before,
        input.afterSource
      );
      const observed = ObservedEmissionChange.compare(
        before.baselineCarbonQuantity,
        input.afterSource.quantity
      );
      assertAttribution(input.attribution, observed, before, input.plan);
      return new _ReductionComparison(
        before,
        input.afterSource,
        observed,
        input.attribution
      );
    }
  };
  var ReductionOutcomeResult = class _ReductionOutcomeResult {
    constructor(direction, disposition, magnitude, totalActualReduction, comparisons) {
      this.direction = direction;
      this.disposition = disposition;
      this.magnitude = magnitude;
      this.totalActualReduction = totalActualReduction;
      this.comparisons = comparisons;
      Object.freeze(this.comparisons);
      Object.freeze(this);
    }
    static from(comparisons) {
      const first = comparisons[0];
      if (first === void 0)
        throw r3("CARBON_REDUCTION_R3_INCOMPLETE", "No sources were assessed.");
      let reductions = CarbonQuantity.create(
        "0",
        first.observedChange.magnitude.unit,
        first.observedChange.magnitude.gasBasis
      );
      let increases = reductions;
      for (const comparison of comparisons) {
        if (comparison.observedChange.direction === "REDUCTION")
          reductions = reductions.add(comparison.observedChange.magnitude);
        if (comparison.observedChange.direction === "INCREASE")
          increases = increases.add(comparison.observedChange.magnitude);
      }
      const sign = reductions.compare(increases);
      if (sign > 0) {
        const net = reductions.subtractNonnegative(increases);
        return new _ReductionOutcomeResult(
          "REDUCTION",
          "TOTAL_ACTUAL_REDUCTION",
          net,
          net,
          [...comparisons]
        );
      }
      if (sign < 0)
        return new _ReductionOutcomeResult(
          "INCREASE",
          "NET_EMISSION_INCREASE",
          increases.subtractNonnegative(reductions),
          void 0,
          [...comparisons]
        );
      return new _ReductionOutcomeResult(
        "NO_CHANGE",
        "NO_NET_REDUCTION",
        reductions.subtractNonnegative(increases),
        void 0,
        [...comparisons]
      );
    }
  };
  var ReductionOutcomeAggregate = class _ReductionOutcomeAggregate {
    constructor(id, baseline, targetPeriod, plan) {
      this.id = id;
      this.baseline = baseline;
      this.targetPeriod = targetPeriod;
      this.plan = plan;
    }
    #comparisons = [];
    #afterSourceIds = /* @__PURE__ */ new Set();
    #afterCalculationIds = /* @__PURE__ */ new Set();
    #events = [];
    #result;
    static create(input) {
      assertKind2(input.id, "ReductionOutcome");
      input.baseline.assertGenuine();
      if (!(input.targetPeriod instanceof ReportingPeriod))
        throw r3(
          "CARBON_REDUCTION_R3_INVALID_REFERENCE",
          "Target period is invalid."
        );
      if (input.plan !== void 0 && input.plan.baseline !== input.baseline)
        throw r3(
          "CARBON_REDUCTION_R3_PLAN_MISMATCH",
          "Optional plan must use the exact outcome baseline."
        );
      return new _ReductionOutcomeAggregate(
        input.id,
        input.baseline,
        input.targetPeriod,
        input.plan
      );
    }
    get comparisons() {
      return Object.freeze([...this.#comparisons]);
    }
    get events() {
      return Object.freeze([...this.#events]);
    }
    get result() {
      return this.#result;
    }
    assess(input) {
      if (this.#result !== void 0)
        throw r3(
          "CARBON_REDUCTION_R3_FINALIZED",
          "Outcome is already finalized."
        );
      if (this.#comparisons.some(
        (item) => item.baselineSource.governedInventorySourceId.equals(
          input.baselineSourceId
        )
      ))
        throw r3(
          "CARBON_REDUCTION_R3_BASELINE_REUSE",
          "A baseline source may be assessed exactly once."
        );
      const afterId = input.afterSource.id.value;
      const calculationId = input.afterSource.emissionResult.emissionCalculationId.value;
      if (this.#afterSourceIds.has(afterId))
        throw r3(
          "CARBON_REDUCTION_R3_AFTER_SOURCE_REUSE",
          "An After source may be used at most once."
        );
      if (this.#afterCalculationIds.has(calculationId))
        throw r3(
          "CARBON_REDUCTION_R3_CALCULATION_REUSE",
          "An After calculation may be used at most once."
        );
      const comparison = ReductionComparison.create({
        baseline: this.baseline,
        targetPeriod: this.targetPeriod,
        baselineSourceId: input.baselineSourceId,
        afterSource: input.afterSource,
        attribution: input.attribution,
        ...this.plan === void 0 ? {} : { plan: this.plan }
      });
      const event2 = ReductionOutcomeEvent.create({
        ...input.eventMetadata,
        eventType: "ReductionSourceAssessed",
        aggregateId: this.id,
        payload: {
          baselineSourceId: input.baselineSourceId.value,
          afterSourceId: afterId,
          direction: comparison.observedChange.direction,
          attribution: comparison.attribution.classification
        }
      });
      this.#comparisons.push(comparison);
      this.#afterSourceIds.add(afterId);
      this.#afterCalculationIds.add(calculationId);
      this.#events.push(event2);
      return comparison;
    }
    finalize(metadata2) {
      if (this.#result !== void 0)
        throw r3(
          "CARBON_REDUCTION_R3_FINALIZED",
          "Outcome is already finalized."
        );
      if (this.#comparisons.length !== this.baseline.governedSourceSnapshots.length)
        throw r3(
          "CARBON_REDUCTION_R3_INCOMPLETE",
          "Every governed baseline source requires one comparable After assessment."
        );
      const result = ReductionOutcomeResult.from(this.#comparisons);
      const event2 = ReductionOutcomeEvent.create({
        ...metadata2,
        eventType: "ReductionOutcomeFinalized",
        aggregateId: this.id,
        payload: {
          direction: result.direction,
          disposition: result.disposition,
          magnitude: result.magnitude.value
        }
      });
      this.#result = result;
      this.#events.push(event2);
      return result;
    }
  };
  function assertComparable(baseline, targetPeriod, before, after) {
    after.assertGenuine();
    const afterSource = after.emissionSource.toReference();
    const afterActivity = after.carbonActivity.toReference();
    const beforeSource = before.emissionSourceReference;
    const beforeActivity = before.carbonActivityReference;
    const period = after.accountingContext.reportingPeriod;
    const comparable = after.reportingEntityVersion.id.equals(baseline.reportingEntityVersionId) && after.accountingContext.id.equals(baseline.accountingContextId) && afterSource.sourceCategory.equals(beforeSource.sourceCategory) && afterActivity.activityDefinitionCode === beforeActivity.activityDefinitionCode && afterActivity.expectedUnit === beforeActivity.expectedUnit && after.quantity.gasBasis === baseline.carbonGasBasis && period.startDate === targetPeriod.startDate && period.endDate === targetPeriod.endDate && !after.emissionResult.emissionCalculationId.equals(
      before.emissionCalculationId
    );
    try {
      before.baselineCarbonQuantity.compare(after.quantity);
    } catch {
      throw r3(
        "CARBON_REDUCTION_R3_UNRESOLVED_COMPARABILITY",
        "Carbon quantity compatibility cannot be proven."
      );
    }
    if (!comparable)
      throw r3(
        "CARBON_REDUCTION_R3_UNRESOLVED_COMPARABILITY",
        "Before and After source comparability cannot be proven."
      );
  }
  function assertAttribution(attribution, observed, before, plan) {
    if (attribution.classification !== "OTHER_OR_UNRESOLVED" && observed.direction !== "REDUCTION")
      throw r3(
        "CARBON_REDUCTION_R3_ATTRIBUTION_DIRECTION",
        "Active and activity-level attribution require an observed reduction."
      );
    if (attribution.classification !== "ACTIVE_REDUCTION") return;
    if (plan === void 0 || plan.status !== "COMPLETED")
      throw r3(
        "CARBON_REDUCTION_R3_ACTIVE_GOVERNANCE",
        "Active attribution requires a completed plan."
      );
    const { accountingUnitId, measureId, executionFactId } = attribution;
    if (accountingUnitId === void 0 || measureId === void 0 || executionFactId === void 0)
      throw r3(
        "CARBON_REDUCTION_R3_ACTIVE_GOVERNANCE",
        "Active attribution requires complete lineage identifiers."
      );
    const unit = plan.accountingUnits.find(
      (item) => item.id.equals(accountingUnitId)
    );
    const measure = plan.measures.find((item) => item.id.equals(measureId));
    const fact = plan.executionFacts.find(
      (item) => item.id.equals(executionFactId)
    );
    if (unit === void 0 || measure === void 0 || fact === void 0 || !unit.baselineGovernedSourceIds.some(
      (id) => id.equals(before.governedInventorySourceId)
    ) || !unit.contributingMeasureIds.some((id) => id.equals(measure.id)) || !measure.target.governedInventorySourceId.equals(
      before.governedInventorySourceId
    ) || !fact.measureId.equals(measure.id) || fact.target !== measure.target)
      throw r3(
        "CARBON_REDUCTION_R3_ACTIVE_GOVERNANCE",
        "Active attribution lineage must be governed by the exact plan and RAU."
      );
  }
  function assertKind2(value, kind2) {
    if (!(value instanceof Identifier) || value.kind !== kind2)
      throw r3("CARBON_REDUCTION_R3_INVALID_REFERENCE", `Expected ${kind2}.`);
  }
  function r3(code, message) {
    return new DomainError(code, message);
  }

  // packages/carbon-core/src/reduction-product-propagation.ts
  var productQuantityAuthority = Symbol("reduction-product-quantity-authority");
  var GovernedProductQuantityFact = class _GovernedProductQuantityFact {
    constructor(productSubject, quantityRole, source2, observationFact, activityReference) {
      this.productSubject = productSubject;
      this.quantityRole = quantityRole;
      this.source = source2;
      this.observationFact = observationFact;
      this.activityReference = activityReference;
      Object.freeze(this);
    }
    #nominal = true;
    static issue(input, authority) {
      if (authority !== productQuantityAuthority)
        throw invalid2("Governed product quantity authority is invalid.");
      input.source.assertGenuine();
      if (!["PRODUCED", "TRANSFERRED"].includes(input.quantityRole))
        throw invalid2("Product quantity role is invalid.");
      assertGovernedProductQuantity(input.observationFact, input.source);
      return new _GovernedProductQuantityFact(
        nonBlank6(input.productSubject, "productSubject"),
        input.quantityRole,
        input.source,
        input.observationFact,
        input.source.carbonActivity.toReference()
      );
    }
    get quantity() {
      void this.#nominal;
      const quantity = this.observationFact.quantity;
      if (quantity === void 0)
        throw invalid2("Governed product quantity is unexpectedly missing.");
      return quantity;
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var RecognizedCarbonContribution = class _RecognizedCarbonContribution {
    constructor(id, afterSource, quantity, type, allocationSemanticsReference, afterDriverFact, afterDriverActivity) {
      this.id = id;
      this.afterSource = afterSource;
      this.quantity = quantity;
      this.type = type;
      this.allocationSemanticsReference = allocationSemanticsReference;
      this.afterDriverFact = afterDriverFact;
      this.afterDriverActivity = afterDriverActivity;
      Object.freeze(this);
    }
    #nominal = true;
    static recognize(input) {
      input.afterSource.assertGenuine();
      if (!["DIRECT", "ALLOCATED", "AMORTIZED"].includes(input.type))
        throw invalid2("Contribution type is invalid.");
      if (input.quantity.compare(input.afterSource.quantity) !== 0 || input.quantity.unit !== input.afterSource.quantity.unit)
        throw invalid2(
          "Recognized quantity must exactly match its governed After source."
        );
      assertGovernedAfterDriver(
        input.afterDriverFact,
        input.afterDriverActivity,
        input.afterSource
      );
      return new _RecognizedCarbonContribution(
        nonBlank6(input.id, "id"),
        input.afterSource,
        input.quantity,
        input.type,
        nonBlank6(
          input.allocationSemanticsReference,
          "allocationSemanticsReference"
        ),
        input.afterDriverFact,
        input.afterDriverActivity
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ReductionProductPropagation = class _ReductionProductPropagation {
    constructor(outcome2, afterInventory) {
      this.outcome = outcome2;
      this.afterInventory = afterInventory;
    }
    #registeredContributionIds = /* @__PURE__ */ new Set();
    #registeredAfterSources = /* @__PURE__ */ new Set();
    #registeredProductQuantityObservations = /* @__PURE__ */ new Map();
    #registeredProductQuantityFacts = /* @__PURE__ */ new Set();
    #consumedProducedQuantityFacts = /* @__PURE__ */ new Set();
    #consumedTransferredQuantityFacts = /* @__PURE__ */ new Set();
    static create(input) {
      if (input.finalizedOutcome.result === void 0)
        throw invalid2("R3 ReductionOutcome must be finalized.");
      return new _ReductionProductPropagation(
        input.finalizedOutcome,
        input.afterInventory
      );
    }
    register(input) {
      const { contribution } = input;
      contribution.assertGenuine();
      if (this.#registeredContributionIds.has(contribution.id))
        throw duplicate(
          "A recognized contribution identifier cannot be accumulated twice."
        );
      if (this.#registeredAfterSources.has(contribution.afterSource))
        throw duplicate(
          "A governed After source may participate in only one propagation role."
        );
      const comparison = this.comparisonFor(contribution.afterSource);
      if (!this.afterInventory.containsGovernedSource(contribution.afterSource))
        throw invalid2("After inventory must own the governed After source.");
      assertGovernedAfterDriver(
        contribution.afterDriverFact,
        contribution.afterDriverActivity,
        contribution.afterSource
      );
      const role = governedRole(comparison);
      const relation = comparison.baselineSource.productAllocationRelations[0];
      if (role === "UNALLOCATED_ENTERPRISE") {
        if (input.allocations.length !== 0)
          throw invalid2(
            "An unallocated enterprise contribution has no product allocation."
          );
        assertFullResidual(contribution.quantity, input.residual);
      } else {
        if (relation === void 0)
          throw invalid2("Baseline allocation semantics are unprovable.");
        if (relation.allocationSemanticsReference !== contribution.allocationSemanticsReference)
          throw new DomainError(
            "CARBON_REDUCTION_R4_NOT_DIRECTLY_COMPARABLE",
            "After allocation does not preserve the governed baseline semantics."
          );
        this.afterInventory.registerAllocation({
          source: contribution.afterSource,
          purpose: role === "PRODUCT_TRANSFER" ? "TRANSFER" : "PRODUCT_RESULT",
          allocationSemanticsReference: relation.allocationSemanticsReference,
          allocations: input.allocations,
          residual: input.residual
        });
      }
      this.#registeredContributionIds.add(contribution.id);
      this.#registeredAfterSources.add(contribution.afterSource);
      return role;
    }
    recognizeProductQuantity(input) {
      const observations = this.#registeredProductQuantityObservations.get(input.source) ?? /* @__PURE__ */ new Set();
      if (observations.has(input.observationFact))
        throw duplicate(
          "A governed product quantity observation may be bound only once."
        );
      if (!this.baselineProductSubjects().has(input.productSubject))
        throw invalid2(
          "Governed product quantity requires a baseline PRODUCT_RESULT subject."
        );
      this.comparisonFor(input.source);
      if (!this.afterInventory.containsGovernedSource(input.source))
        throw invalid2(
          "After inventory must own the governed product quantity source."
        );
      const quantityFact = GovernedProductQuantityFact.issue(
        input,
        productQuantityAuthority
      );
      observations.add(input.observationFact);
      this.#registeredProductQuantityObservations.set(input.source, observations);
      this.#registeredProductQuantityFacts.add(quantityFact);
      return quantityFact;
    }
    issueProductResult(id, producedQuantity) {
      producedQuantity.assertGenuine();
      if (!this.#registeredProductQuantityFacts.has(producedQuantity))
        throw invalid2(
          "PRODUCED quantity fact must be bound by this propagation instance."
        );
      if (this.#consumedProducedQuantityFacts.has(producedQuantity))
        throw duplicate(
          "A PRODUCED governed product quantity fact may be consumed only once."
        );
      if (producedQuantity.quantityRole !== "PRODUCED")
        throw invalid2("ProductCarbonResult requires a PRODUCED quantity fact.");
      if (!this.baselineProductSubjects().has(producedQuantity.productSubject))
        throw invalid2(
          "After ProductCarbonResult requires the same product subject as a baseline PRODUCT_RESULT allocation."
        );
      this.comparisonFor(producedQuantity.source);
      if (!this.afterInventory.containsGovernedSource(producedQuantity.source))
        throw invalid2("After inventory must own the governed output source.");
      assertGovernedProductQuantity(
        producedQuantity.observationFact,
        producedQuantity.source
      );
      const result = this.afterInventory.issueProductCarbonResult(
        id,
        producedQuantity.productSubject,
        producedQuantity.quantity.value
      );
      this.#consumedProducedQuantityFacts.add(producedQuantity);
      return result;
    }
    issueTransferResult(id, productResult, transferredQuantity) {
      transferredQuantity.assertGenuine();
      if (!this.#registeredProductQuantityFacts.has(transferredQuantity))
        throw invalid2(
          "TRANSFERRED quantity fact must be bound by this propagation instance."
        );
      if (this.#consumedTransferredQuantityFacts.has(transferredQuantity))
        throw duplicate(
          "A TRANSFERRED governed product quantity fact may be consumed only once."
        );
      if (transferredQuantity.quantityRole !== "TRANSFERRED")
        throw invalid2(
          "ProductCarbonTransferResult requires a TRANSFERRED quantity fact."
        );
      if (transferredQuantity.productSubject !== productResult.productSubject)
        throw invalid2(
          "Transferred quantity product subject must match ProductCarbonResult."
        );
      this.comparisonFor(transferredQuantity.source);
      if (!this.afterInventory.containsGovernedSource(transferredQuantity.source))
        throw invalid2(
          "After inventory must own the governed transfer quantity source."
        );
      assertGovernedProductQuantity(
        transferredQuantity.observationFact,
        transferredQuantity.source
      );
      const result = this.afterInventory.issueProductCarbonTransferResult(
        id,
        productResult,
        transferredQuantity.quantity.value
      );
      this.#consumedTransferredQuantityFacts.add(transferredQuantity);
      return result;
    }
    comparisonFor(source2) {
      const comparison = this.outcome.result?.comparisons.find(
        (candidate) => candidate.afterSource === source2
      );
      if (comparison === void 0)
        throw invalid2(
          "Contribution source must be a governed After fact in the finalized R3 outcome."
        );
      return comparison;
    }
    baselineProductSubjects() {
      return new Set(
        this.outcome.result?.comparisons.flatMap(
          (comparison) => comparison.baselineSource.productAllocationRelations.filter((relation) => relation.purpose === "PRODUCT_RESULT").flatMap((relation) => relation.productSubjects)
        )
      );
    }
  };
  function governedRole(comparison) {
    const relations = comparison.baselineSource.productAllocationRelations;
    if (relations.length === 0) return "UNALLOCATED_ENTERPRISE";
    const purposes = new Set(relations.map((relation) => relation.purpose));
    if (relations.length !== 1 || purposes.size !== 1)
      throw invalid2(
        "Baseline product relation is ambiguous and presents cross-role risk."
      );
    return relations[0]?.purpose === "TRANSFER" ? "PRODUCT_TRANSFER" : "PRODUCT_FORMATION";
  }
  function assertGovernedAfterDriver(fact, activity, source2) {
    if (!(fact instanceof ObservationFactReference) || !(activity instanceof CarbonActivityReference))
      throw invalid2(
        "After driver must use genuine governed fact and activity references."
      );
    if (fact.measurementType === "MISSING" || fact.quantity === void 0)
      throw invalid2(
        "A missing After driver is not zero and cannot drive allocation."
      );
    if (!["Captured", "Validated", "Consumed"].includes(fact.lifecycleStatus))
      throw invalid2("After driver lifecycle is not usable.");
    if (!fact.carbonActivityId.equals(activity.carbonActivityId))
      throw invalid2("After driver fact and activity must be one chain.");
    const sourceActivity = source2.carbonActivity.toReference();
    if (!activity.carbonActivityId.equals(sourceActivity.carbonActivityId) || !activity.emissionSourceReference.accountingContextId.equals(
      source2.accountingContext.id
    ) || !activity.emissionSourceReference.reportingEntityVersionId.equals(
      source2.reportingEntityVersion.id
    ))
      throw invalid2("After driver is outside the governed After source context.");
    if (!source2.activityDataRecord.observations.includes(fact))
      throw invalid2(
        "After driver fact must be the exact fact owned by the governed ActivityDataRecord."
      );
  }
  function assertGovernedProductQuantity(fact, source2) {
    if (!(fact instanceof ObservationFactReference))
      throw invalid2("Actual product output must be a genuine governed fact.");
    if (!source2.activityDataRecord.observations.includes(fact))
      throw invalid2(
        "Actual product output fact must be exactly owned by the governed ActivityDataRecord."
      );
    if (source2.activityDataRecord.status !== "Accepted" && source2.activityDataRecord.status !== "Locked")
      throw invalid2("Actual product output record must be Accepted or Locked.");
    if (fact.measurementType === "MISSING" || fact.quantity === void 0)
      throw invalid2("Missing actual product output is not zero.");
    if (!["Captured", "Validated", "Consumed"].includes(fact.lifecycleStatus))
      throw invalid2("Actual product output fact lifecycle is not usable.");
    if (unitDimensionOf(fact.quantity.unit) !== "COUNT")
      throw invalid2("Actual product output must use an item/COUNT quantity.");
    if (fact.quantity.value === "0")
      throw invalid2("Actual product output must be strictly positive.");
    const activity = source2.carbonActivity.toReference();
    if (!fact.carbonActivityId.equals(activity.carbonActivityId) || !activity.emissionSourceReference.accountingContextId.equals(
      source2.accountingContext.id
    ) || !activity.emissionSourceReference.reportingEntityVersionId.equals(
      source2.reportingEntityVersion.id
    ))
      throw invalid2(
        "Actual product output is outside the After inventory context."
      );
  }
  function assertFullResidual(quantity, residual) {
    residual.assertGenuine();
    if (residual.quantity.compare(quantity) !== 0 || residual.quantity.unit !== quantity.unit)
      throw invalid2(
        "Unallocated enterprise contribution requires an explicit full residual."
      );
  }
  function nonBlank6(value, field) {
    if (value.trim().length === 0) throw invalid2(`${field} must not be blank.`);
    return value;
  }
  function duplicate(message) {
    return new DomainError("CARBON_REDUCTION_R4_DUPLICATE_CONTRIBUTION", message);
  }
  function invalid2(message) {
    return new DomainError("CARBON_REDUCTION_R4_INVALID_PROPAGATION", message);
  }

  // packages/carbon-core/src/boundary-shared.ts
  var isoDateOnlyPattern2 = /^\d{4}-\d{2}-\d{2}$/;
  function assertNonBlank(value, field) {
    if (typeof value !== "string") {
      throw new DomainError(
        "CARBON_BOUNDARY_INVALID_VALUE",
        `${field} must be non-blank.`,
        { field }
      );
    }
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw new DomainError(
        "CARBON_BOUNDARY_INVALID_VALUE",
        `${field} must be non-blank.`,
        { field }
      );
    }
    return normalized;
  }
  function assertPositiveVersion(versionNumber) {
    if (!Number.isSafeInteger(versionNumber) || versionNumber <= 0) {
      throw new DomainError(
        "CARBON_BOUNDARY_INVALID_VALUE",
        "versionNumber must be a positive safe integer.",
        { versionNumber }
      );
    }
  }
  function assertIsoDateOnly2(value, field) {
    if (!isoDateOnlyPattern2.test(value)) {
      throw new DomainError(
        "CARBON_BOUNDARY_INVALID_VALUE",
        `${field} must use the ISO YYYY-MM-DD date-only format.`,
        { field, value }
      );
    }
    const parsed = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new DomainError(
        "CARBON_BOUNDARY_INVALID_VALUE",
        `${field} must be a valid calendar date.`,
        { field, value }
      );
    }
  }
  function assertVocabularyValue(value, values2, field) {
    if (!values2.includes(value)) {
      throw new DomainError(
        "CARBON_BOUNDARY_INVALID_VALUE",
        `${field} is not an approved value.`,
        { field, value }
      );
    }
  }
  function freezeIdentifiers(identifiers) {
    return Object.freeze([...identifiers]);
  }
  var FreezingMetadata = class _FreezingMetadata {
    frozenByActorId;
    #frozenAtTime;
    constructor(input) {
      this.frozenByActorId = input.frozenByActorId;
      this.#frozenAtTime = input.frozenAt.getTime();
      Object.freeze(this);
    }
    static create(input) {
      if (!Number.isFinite(input.frozenAt.getTime())) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_VALUE",
          "frozenAt must be a valid timestamp."
        );
      }
      return new _FreezingMetadata(input);
    }
    get frozenAt() {
      return new Date(this.#frozenAtTime);
    }
  };

  // packages/carbon-core/src/organizational-subject-reference.ts
  var organizationalSubjectTypes = Object.freeze([
    "ReportingEntityVersion",
    "LegalEntity",
    "OrganizationUnit",
    "Facility"
  ]);
  var identifierKindBySubjectType = {
    ReportingEntityVersion: "ReportingEntityVersion",
    LegalEntity: "LegalEntity",
    OrganizationUnit: "OrganizationUnit",
    Facility: "Facility"
  };
  var OrganizationalSubjectReference = class _OrganizationalSubjectReference {
    subjectType;
    subjectId;
    subjectVersion;
    validityPeriod;
    constructor(input) {
      this.subjectType = input.subjectType;
      this.subjectId = input.subjectId;
      this.subjectVersion = input.subjectVersion === void 0 ? void 0 : assertNonBlank(input.subjectVersion, "subjectVersion");
      this.validityPeriod = input.validityPeriod;
      Object.freeze(this);
    }
    static create(input) {
      const expectedKind = identifierKindBySubjectType[input.subjectType];
      if (expectedKind === void 0 || input.subjectId.kind !== expectedKind) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "Organizational subject type and identifier kind must match an existing Platform contract.",
          {
            subjectType: input.subjectType,
            identifierKind: input.subjectId.kind
          }
        );
      }
      return new _OrganizationalSubjectReference(input);
    }
    get identityKey() {
      return `${this.subjectType}:${this.subjectId.value}`;
    }
    equals(other) {
      return this.subjectType === other.subjectType && this.subjectId.equals(other.subjectId) && this.subjectVersion === other.subjectVersion;
    }
  };

  // packages/carbon-core/src/reduction-value-objects.ts
  var ReductionBaselineSourceSnapshot = class _ReductionBaselineSourceSnapshot {
    constructor(governedInventorySourceId, emissionCalculationId, emissionSourceReference, carbonActivityReference, baselineCarbonQuantity, productAllocationRelations) {
      this.governedInventorySourceId = governedInventorySourceId;
      this.emissionCalculationId = emissionCalculationId;
      this.emissionSourceReference = emissionSourceReference;
      this.carbonActivityReference = carbonActivityReference;
      this.baselineCarbonQuantity = baselineCarbonQuantity;
      this.productAllocationRelations = productAllocationRelations;
      Object.freeze(this.productAllocationRelations);
      Object.freeze(this);
    }
    #nominal = true;
    static capture(source2, inventory) {
      source2.assertGenuine();
      return new _ReductionBaselineSourceSnapshot(
        source2.id,
        source2.emissionResult.emissionCalculationId,
        source2.emissionSource.toReference(),
        source2.carbonActivity.toReference(),
        source2.quantity,
        inventory.allocationInstructionsFor(source2).map(
          (instruction) => Object.freeze({
            purpose: instruction.purpose,
            allocationSemanticsReference: instruction.allocationSemanticsReference,
            productSubjects: Object.freeze(
              instruction.allocations.map(
                (allocation) => allocation.productSubject
              )
            )
          })
        )
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ReductionBaselineSnapshot = class _ReductionBaselineSnapshot {
    constructor(carbonInventoryId, reportingEntityVersionId, accountingContextId, reportingPeriod, reportingMassUnit, carbonGasBasis, governedSourceSnapshots, capturedAt) {
      this.carbonInventoryId = carbonInventoryId;
      this.reportingEntityVersionId = reportingEntityVersionId;
      this.accountingContextId = accountingContextId;
      this.reportingPeriod = reportingPeriod;
      this.reportingMassUnit = reportingMassUnit;
      this.carbonGasBasis = carbonGasBasis;
      this.governedSourceSnapshots = governedSourceSnapshots;
      this.#capturedAtTime = capturedAt.getTime();
      this.#sourceById = new Map(
        governedSourceSnapshots.map((source2) => [
          source2.governedInventorySourceId.value,
          source2
        ])
      );
      Object.freeze(this.governedSourceSnapshots);
      Object.freeze(this);
    }
    #capturedAtTime;
    #sourceById;
    #nominal = true;
    static capture(input) {
      if (input.inventory.status !== "CLOSED")
        throw error(
          "CARBON_REDUCTION_R1_BASELINE_NOT_CLOSED",
          "Reduction baseline requires a CLOSED CarbonInventory."
        );
      if (!(input.capturedAt instanceof Date) || !Number.isFinite(input.capturedAt.getTime()))
        throw invalidValue("capturedAt must be a valid timestamp.");
      const snapshots = input.governedSources.map((source2) => {
        if (!input.inventory.containsGovernedSource(source2))
          throw error(
            "CARBON_REDUCTION_R1_CONTEXT_MISMATCH",
            "Baseline source must belong to the exact closed inventory."
          );
        return ReductionBaselineSourceSnapshot.capture(source2, input.inventory);
      });
      if (new Set(snapshots.map((item) => item.governedInventorySourceId.value)).size !== snapshots.length)
        throw error(
          "CARBON_REDUCTION_R1_DUPLICATE",
          "A governed source may appear only once in a baseline."
        );
      const context = input.inventory.context;
      return new _ReductionBaselineSnapshot(
        input.inventory.id,
        context.reportingEntityVersionId,
        context.accountingContextId,
        context.reportingPeriod,
        context.reportingMassUnit,
        context.carbonGasBasis,
        snapshots,
        input.capturedAt
      );
    }
    get capturedAt() {
      return new Date(this.#capturedAtTime);
    }
    source(id) {
      return this.#sourceById.get(id.value);
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ReductionObjective = class _ReductionObjective {
    constructor(statement, targetPeriod, targetSubject) {
      this.statement = statement;
      this.targetPeriod = targetPeriod;
      this.targetSubject = targetSubject;
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      if (!(input.targetPeriod instanceof ReportingPeriod))
        throw invalidReference2("targetPeriod must be a ReportingPeriod.");
      if (!(input.targetSubject instanceof OrganizationalSubjectReference))
        throw invalidReference2(
          "targetSubject must be an OrganizationalSubjectReference."
        );
      return new _ReductionObjective(
        nonBlank7(input.statement, "statement"),
        input.targetPeriod,
        input.targetSubject
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ExpectedReduction = class _ExpectedReduction {
    constructor(rate, decimal) {
      this.rate = rate;
      this.#decimal = decimal;
      Object.freeze(this);
    }
    #decimal;
    static rate(value) {
      const decimal = ExactDecimal.parse(
        value,
        "CARBON_REDUCTION_R1_INVALID_VALUE",
        "Expected reduction rate"
      );
      if (decimal.compare(ExactDecimal.parse("0")) <= 0 || decimal.compare(ExactDecimal.parse("1")) > 0)
        throw invalidValue(
          "Expected reduction rate must be greater than 0 and at most 1."
        );
      return new _ExpectedReduction(decimal.toString(), decimal);
    }
    assertValid() {
      void this.#decimal;
    }
  };
  var ReductionTarget = class _ReductionTarget {
    constructor(governedInventorySourceId, emissionSourceReference, carbonActivityReference) {
      this.governedInventorySourceId = governedInventorySourceId;
      this.emissionSourceReference = emissionSourceReference;
      this.carbonActivityReference = carbonActivityReference;
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      input.baseline.assertGenuine();
      const emissionSourceReference = input.emissionSourceReference;
      const carbonActivityReference = input.carbonActivityReference;
      if (!hasIdentifierKind2(
        input.governedInventorySourceId,
        "GovernedInventorySource"
      ) || !(emissionSourceReference instanceof EmissionSourceReference) || !(carbonActivityReference instanceof CarbonActivityReference))
        throw invalidReference2("Reduction target references are invalid.");
      const source2 = input.baseline.source(input.governedInventorySourceId);
      if (source2 === void 0)
        throw error(
          "CARBON_REDUCTION_R1_TARGET_NOT_IN_BASELINE",
          "Reduction target is not admitted to the baseline."
        );
      if (!sameEmissionSource(
        source2.emissionSourceReference,
        input.emissionSourceReference
      ) || !sameActivity(
        source2.carbonActivityReference,
        input.carbonActivityReference
      ) || !sameEmissionSource(
        input.emissionSourceReference,
        input.carbonActivityReference.emissionSourceReference
      ))
        throw invalidReference2(
          "Reduction target references must describe the baseline source/activity chain."
        );
      return new _ReductionTarget(
        input.governedInventorySourceId,
        input.emissionSourceReference,
        input.carbonActivityReference
      );
    }
    belongsTo(baseline) {
      const source2 = baseline.source(this.governedInventorySourceId);
      return source2 !== void 0 && sameEmissionSource(
        source2.emissionSourceReference,
        this.emissionSourceReference
      ) && sameActivity(source2.carbonActivityReference, this.carbonActivityReference);
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function sameEmissionSource(left, right) {
    return left.emissionSourceId.equals(right.emissionSourceId) && left.reportingEntityVersionId.equals(right.reportingEntityVersionId) && left.accountingContextId.equals(right.accountingContextId) && left.sourceCategory.equals(right.sourceCategory);
  }
  function sameActivity(left, right) {
    return left.carbonActivityId.equals(right.carbonActivityId) && left.activityDefinitionCode === right.activityDefinitionCode && left.expectedUnit === right.expectedUnit && sameEmissionSource(
      left.emissionSourceReference,
      right.emissionSourceReference
    );
  }
  function hasIdentifierKind2(value, kind2) {
    return value instanceof Identifier && value.kind === kind2;
  }
  function nonBlank7(value, field) {
    const normalized = value.trim();
    if (normalized.length === 0) throw invalidValue(`${field} must be nonblank.`);
    return normalized;
  }
  function invalidValue(message) {
    return error("CARBON_REDUCTION_R1_INVALID_VALUE", message);
  }
  function invalidReference2(message) {
    return error("CARBON_REDUCTION_R1_INVALID_REFERENCE", message);
  }
  function error(code, message) {
    return new DomainError(code, message);
  }

  // packages/carbon-core/src/reduction-execution.ts
  var ReductionExecutionFact = class _ReductionExecutionFact {
    constructor(id, measureId, target, occurredAt, description, observationFactReferences, activityDataRecordReferences, evidenceReferenceIds) {
      this.id = id;
      this.measureId = measureId;
      this.target = target;
      this.description = description;
      this.observationFactReferences = observationFactReferences;
      this.activityDataRecordReferences = activityDataRecordReferences;
      this.evidenceReferenceIds = evidenceReferenceIds;
      this.#occurredAtTime = occurredAt.getTime();
      Object.freeze(this.observationFactReferences);
      Object.freeze(this.activityDataRecordReferences);
      Object.freeze(this.evidenceReferenceIds);
      Object.freeze(this);
    }
    #occurredAtTime;
    #nominal = true;
    static create(input) {
      if (!kind(input.id, "ReductionExecutionFact") || !kind(input.measureId, "ReductionMeasure"))
        throw error2(
          "CARBON_REDUCTION_R2_INVALID_REFERENCE",
          "Execution fact identifiers are invalid."
        );
      if (!(input.target instanceof ReductionTarget))
        throw error2(
          "CARBON_REDUCTION_R2_INVALID_REFERENCE",
          "Execution fact target is invalid."
        );
      input.target.assertGenuine();
      if (!(input.occurredAt instanceof Date) || !Number.isFinite(input.occurredAt.getTime()))
        throw error2(
          "CARBON_REDUCTION_R2_INVALID_VALUE",
          "occurredAt must be a valid Date."
        );
      const description = input.description.trim();
      if (description.length === 0)
        throw error2(
          "CARBON_REDUCTION_R2_INVALID_VALUE",
          "description must be nonblank."
        );
      const observations = [...input.observationFactReferences ?? []];
      const records = [...input.activityDataRecordReferences ?? []];
      const evidence = [...input.evidenceReferenceIds ?? []];
      if (observations.length === 0 && evidence.length === 0)
        throw error2(
          "CARBON_REDUCTION_R2_EXECUTION_EVIDENCE_REQUIRED",
          "An observation or explicit evidence reference is required."
        );
      if (observations.some(
        (item) => !isObservation(item) || item.lifecycleStatus === "Discarded" || !item.carbonActivityId.equals(
          input.target.carbonActivityReference.carbonActivityId
        )
      ))
        throw error2(
          "CARBON_REDUCTION_R2_OBSERVATION_MISMATCH",
          "Observations must be genuine, active, and belong to the target CarbonActivity."
        );
      if (records.some((item) => !isRecord(item)) || evidence.some((item) => !kind(item, "EvidenceReference")))
        throw error2(
          "CARBON_REDUCTION_R2_INVALID_REFERENCE",
          "Execution evidence references are invalid."
        );
      return new _ReductionExecutionFact(
        input.id,
        input.measureId,
        input.target,
        input.occurredAt,
        description,
        observations,
        records,
        evidence
      );
    }
    get occurredAt() {
      return new Date(this.#occurredAtTime);
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ReductionAccountingUnit = class _ReductionAccountingUnit {
    constructor(id, accountingContextId, baselineGovernedSourceIds, contributingMeasureIds) {
      this.id = id;
      this.accountingContextId = accountingContextId;
      this.baselineGovernedSourceIds = baselineGovernedSourceIds;
      this.contributingMeasureIds = contributingMeasureIds;
      Object.freeze(this.baselineGovernedSourceIds);
      Object.freeze(this.contributingMeasureIds);
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      if (!kind(input.id, "ReductionAccountingUnit") || !(input.baseline instanceof ReductionBaselineSnapshot))
        throw error2(
          "CARBON_REDUCTION_R2_INVALID_REFERENCE",
          "Accounting unit identity or baseline is invalid."
        );
      input.baseline.assertGenuine();
      const sources = [...input.baselineGovernedSourceIds];
      const measures = [...input.contributingMeasureIds];
      if (sources.length === 0 || measures.length === 0 || sources.some((id) => !kind(id, "GovernedInventorySource")) || measures.some((id) => !kind(id, "ReductionMeasure")) || duplicate2(sources) || duplicate2(measures))
        throw error2(
          "CARBON_REDUCTION_R2_RAU_INVALID",
          "Accounting unit lists must be non-empty, valid, and unique."
        );
      return new _ReductionAccountingUnit(
        input.id,
        input.baseline.accountingContextId,
        sources,
        measures
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function kind(value, expected) {
    return value instanceof Identifier && value.kind === expected;
  }
  function duplicate2(values2) {
    return new Set(values2.map((id) => id.value)).size !== values2.length;
  }
  function isObservation(value) {
    return value instanceof ObservationFactReference;
  }
  function isRecord(value) {
    return value instanceof ActivityDataRecordReference;
  }
  function error2(code, message) {
    return new DomainError(code, message);
  }

  // packages/carbon-core/src/reduction-events.ts
  var reductionEventTypes = Object.freeze([
    "ReductionPlanCreated",
    "ReductionMeasureAdded",
    "ReductionPlanAuthorized",
    "ReductionExecutionFactRecorded",
    "ReductionMeasureCompleted",
    "ReductionPlanCompleted"
  ]);
  var payloadKeys2 = {
    ReductionPlanCreated: [
      "carbonInventoryId",
      "reportingEntityVersionId",
      "accountingContextId"
    ],
    ReductionMeasureAdded: [
      "reductionMeasureId",
      "governedInventorySourceId",
      "expectedReductionRate"
    ],
    ReductionPlanAuthorized: ["measureCount"],
    ReductionExecutionFactRecorded: ["executionFactId", "reductionMeasureId"],
    ReductionMeasureCompleted: ["reductionMeasureId", "executionFactCount"],
    ReductionPlanCompleted: [
      "measureCount",
      "executionFactCount",
      "accountingUnitCount"
    ]
  };
  var ReductionEvent = class _ReductionEvent {
    constructor(eventId, eventType, aggregateId, actorId, occurredAt, payload) {
      this.eventId = eventId;
      this.eventType = eventType;
      this.aggregateId = aggregateId;
      this.actorId = actorId;
      this.payload = payload;
      this.#occurredAtTime = occurredAt.getTime();
      Object.freeze(payload);
      Object.freeze(this);
    }
    schemaVersion = 1;
    #occurredAtTime;
    static create(input) {
      const value = input;
      if (!hasIdentifierKind3(value.eventId, "CarbonDomainEvent") || !hasIdentifierKind3(value.actorId, "Actor") || !hasIdentifierKind3(value.aggregateId, "ReductionPlan") || !(value.occurredAt instanceof Date) || !Number.isFinite(value.occurredAt.getTime()) || typeof value.eventType !== "string" || !reductionEventTypes.includes(value.eventType) || typeof value.payload !== "object" || value.payload === null || !exactKeys(input.payload, payloadKeys2[input.eventType]) || !validPayload2(input.eventType, input.payload))
        throw new DomainError(
          "CARBON_REDUCTION_R1_EVENT_INVALID",
          "Reduction event must match the immutable schemaVersion 1 contract."
        );
      return new _ReductionEvent(
        input.eventId,
        input.eventType,
        input.aggregateId,
        input.actorId,
        input.occurredAt,
        Object.freeze({ ...input.payload })
      );
    }
    get occurredAt() {
      return new Date(this.#occurredAtTime);
    }
  };
  function hasIdentifierKind3(value, kind2) {
    return value instanceof Identifier && value.kind === kind2;
  }
  function exactKeys(value, expected) {
    const actual = Object.keys(value).sort();
    return actual.length === expected.length && actual.every((key, i) => key === [...expected].sort()[i]);
  }
  function validPayload2(type, payload) {
    const value = payload;
    if (type === "ReductionPlanAuthorized")
      return Number.isSafeInteger(value.measureCount) && Number(value.measureCount) > 0;
    if (type === "ReductionMeasureCompleted")
      return typeof value.reductionMeasureId === "string" && value.reductionMeasureId.trim().length > 0 && Number.isSafeInteger(value.executionFactCount) && Number(value.executionFactCount) > 0;
    if (type === "ReductionPlanCompleted")
      return ["measureCount", "executionFactCount", "accountingUnitCount"].every(
        (key) => Number.isSafeInteger(value[key]) && Number(value[key]) > 0
      );
    return Object.values(value).every(
      (item) => typeof item === "string" && item.trim().length > 0
    );
  }

  // packages/carbon-core/src/reduction-plan.ts
  var ReductionMeasure = class _ReductionMeasure {
    constructor(id, target, description, expectedReduction, responsibleSubject) {
      this.id = id;
      this.target = target;
      this.description = description;
      this.expectedReduction = expectedReduction;
      this.responsibleSubject = responsibleSubject;
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      if (!hasIdentifierKind4(input.id, "ReductionMeasure"))
        throw invalidReference3("id must be a ReductionMeasure identifier.");
      if (!(input.target instanceof ReductionTarget))
        throw invalidReference3("target must be a ReductionTarget.");
      input.target.assertGenuine();
      if (!(input.expectedReduction instanceof ExpectedReduction))
        throw invalidReference3("expectedReduction must be an ExpectedReduction.");
      input.expectedReduction.assertValid();
      if (!(input.responsibleSubject instanceof OrganizationalSubjectReference))
        throw invalidReference3(
          "responsibleSubject must be an OrganizationalSubjectReference."
        );
      return new _ReductionMeasure(
        input.id,
        input.target,
        nonBlank7(input.description, "description"),
        input.expectedReduction,
        input.responsibleSubject
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ReductionPlanAggregate = class _ReductionPlanAggregate {
    constructor(id, baseline, objective) {
      this.id = id;
      this.baseline = baseline;
      this.objective = objective;
    }
    #measures = [];
    #events = [];
    #executionFacts = [];
    #accountingUnits = [];
    #completedMeasureIds = [];
    #executionEvents = [];
    #status = "DRAFT";
    static create(input) {
      if (!hasIdentifierKind4(input.id, "ReductionPlan"))
        throw invalidReference3("id must be a ReductionPlan identifier.");
      if (!(input.baseline instanceof ReductionBaselineSnapshot))
        throw invalidReference3("baseline must be a ReductionBaselineSnapshot.");
      input.baseline.assertGenuine();
      if (!(input.objective instanceof ReductionObjective))
        throw invalidReference3("objective must be a ReductionObjective.");
      input.objective.assertGenuine();
      const plan = new _ReductionPlanAggregate(
        input.id,
        input.baseline,
        input.objective
      );
      plan.#events.push(
        ReductionEvent.create({
          ...input.eventMetadata,
          eventType: "ReductionPlanCreated",
          aggregateId: input.id,
          payload: {
            carbonInventoryId: input.baseline.carbonInventoryId.value,
            reportingEntityVersionId: input.baseline.reportingEntityVersionId.value,
            accountingContextId: input.baseline.accountingContextId.value
          }
        })
      );
      return plan;
    }
    get status() {
      return this.#status;
    }
    get measures() {
      return Object.freeze([...this.#measures]);
    }
    get events() {
      return Object.freeze([...this.#events, ...this.#executionEvents]);
    }
    get executionFacts() {
      return Object.freeze([...this.#executionFacts]);
    }
    get accountingUnits() {
      return Object.freeze([...this.#accountingUnits]);
    }
    get completedMeasureIds() {
      return Object.freeze([...this.#completedMeasureIds]);
    }
    addMeasure(measure, metadata2) {
      if (this.#status !== "DRAFT")
        throw new DomainError(
          "CARBON_REDUCTION_R1_IMMUTABLE",
          "An AUTHORIZED reduction plan is immutable."
        );
      measure.assertGenuine();
      if (!measure.target.belongsTo(this.baseline))
        throw new DomainError(
          "CARBON_REDUCTION_R1_TARGET_NOT_IN_BASELINE",
          "Measure target does not belong to the plan baseline."
        );
      if (this.#measures.some((item) => item.id.equals(measure.id)))
        throw new DomainError(
          "CARBON_REDUCTION_R1_DUPLICATE",
          "ReductionMeasureId must be unique within a plan."
        );
      const event2 = ReductionEvent.create({
        ...metadata2,
        eventType: "ReductionMeasureAdded",
        aggregateId: this.id,
        payload: {
          reductionMeasureId: measure.id.value,
          governedInventorySourceId: measure.target.governedInventorySourceId.value,
          expectedReductionRate: measure.expectedReduction.rate
        }
      });
      this.#measures.push(measure);
      this.#events.push(event2);
    }
    authorize(metadata2) {
      if (this.#status !== "DRAFT")
        throw new DomainError(
          "CARBON_REDUCTION_R1_INVALID_TRANSITION",
          `Reduction plan cannot authorize from ${this.#status}.`
        );
      if (this.#measures.length === 0 || this.#measures.some((measure) => !measure.target.belongsTo(this.baseline)))
        throw new DomainError(
          "CARBON_REDUCTION_R1_AUTHORIZATION_INCOMPLETE",
          "Authorization requires at least one completely valid measure."
        );
      const event2 = ReductionEvent.create({
        ...metadata2,
        eventType: "ReductionPlanAuthorized",
        aggregateId: this.id,
        payload: { measureCount: this.#measures.length }
      });
      this.#status = "AUTHORIZED";
      this.#events.push(event2);
      Object.freeze(this.#measures);
      Object.freeze(this.#events);
      Object.freeze(this);
    }
    recordExecutionFact(fact, metadata2) {
      this.assertExecutionOpen("record an execution fact");
      if (!(fact instanceof ReductionExecutionFact))
        throw r2(
          "CARBON_REDUCTION_R2_INVALID_REFERENCE",
          "Execution fact must be genuine."
        );
      fact.assertGenuine();
      if (this.#executionFacts.some((item) => item.id.equals(fact.id)))
        throw r2(
          "CARBON_REDUCTION_R2_DUPLICATE",
          "ReductionExecutionFactId must be unique."
        );
      const measure = this.#measures.find(
        (item) => item.id.equals(fact.measureId)
      );
      if (measure === void 0)
        throw r2(
          "CARBON_REDUCTION_R2_MEASURE_NOT_FOUND",
          "Execution fact measure does not exist in this plan."
        );
      if (fact.target !== measure.target)
        throw r2(
          "CARBON_REDUCTION_R2_TARGET_MISMATCH",
          "Execution fact must retain the measure target."
        );
      if (this.#completedMeasureIds.some((id) => id.equals(measure.id)))
        throw r2(
          "CARBON_REDUCTION_R2_INVALID_TRANSITION",
          "A completed measure cannot accept execution facts."
        );
      const date = fact.occurredAt.toISOString().slice(0, 10);
      if (!this.objective.targetPeriod.includes(date))
        throw r2(
          "CARBON_REDUCTION_R2_EXECUTION_OUTSIDE_PERIOD",
          "Execution occurred outside the objective target period."
        );
      const event2 = ReductionEvent.create({
        ...metadata2,
        eventType: "ReductionExecutionFactRecorded",
        aggregateId: this.id,
        payload: {
          executionFactId: fact.id.value,
          reductionMeasureId: measure.id.value
        }
      });
      this.#executionFacts.push(fact);
      this.#executionEvents.push(event2);
      this.#status = "IN_EXECUTION";
    }
    defineAccountingUnit(unit) {
      this.assertExecutionOpen("define an accounting unit");
      if (!(unit instanceof ReductionAccountingUnit))
        throw r2(
          "CARBON_REDUCTION_R2_INVALID_REFERENCE",
          "Accounting unit must be genuine."
        );
      unit.assertGenuine();
      if (this.#accountingUnits.some((item) => item.id.equals(unit.id)))
        throw r2(
          "CARBON_REDUCTION_R2_DUPLICATE",
          "ReductionAccountingUnitId must be unique."
        );
      if (!unit.accountingContextId.equals(this.baseline.accountingContextId))
        throw r2(
          "CARBON_REDUCTION_R2_RAU_INVALID",
          "Accounting unit context must come from the plan baseline."
        );
      const sourceValues = new Set(
        unit.baselineGovernedSourceIds.map((id) => id.value)
      );
      const measures = unit.contributingMeasureIds.map((id) => {
        const measure = this.#measures.find((item) => item.id.equals(id));
        if (measure === void 0)
          throw r2(
            "CARBON_REDUCTION_R2_MEASURE_NOT_FOUND",
            "Accounting unit contains an unknown measure."
          );
        return measure;
      });
      if (unit.baselineGovernedSourceIds.some(
        (id) => this.baseline.source(id) === void 0
      ))
        throw r2(
          "CARBON_REDUCTION_R2_RAU_INVALID",
          "Accounting unit contains a source outside the baseline."
        );
      if (measures.some(
        (measure) => !sourceValues.has(measure.target.governedInventorySourceId.value)
      ))
        throw r2(
          "CARBON_REDUCTION_R2_RAU_INVALID",
          "Every contributing measure target must be represented."
        );
      if ([...sourceValues].some(
        (source2) => !measures.some(
          (measure) => measure.target.governedInventorySourceId.value === source2
        )
      ))
        throw r2(
          "CARBON_REDUCTION_R2_RAU_INVALID",
          "Every accounting source requires a contributing measure."
        );
      if (this.#accountingUnits.some(
        (existing) => existing.baselineGovernedSourceIds.some(
          (id) => sourceValues.has(id.value)
        )
      ))
        throw r2(
          "CARBON_REDUCTION_R2_RAU_OVERLAP",
          "A baseline source may belong to at most one accounting unit."
        );
      this.#accountingUnits.push(unit);
    }
    completeMeasure(measureId, metadata2) {
      if (this.#status !== "IN_EXECUTION")
        throw r2(
          "CARBON_REDUCTION_R2_INVALID_TRANSITION",
          "Measures complete only while IN_EXECUTION."
        );
      const measure = this.#measures.find((item) => item.id.equals(measureId));
      if (measure === void 0)
        throw r2(
          "CARBON_REDUCTION_R2_MEASURE_NOT_FOUND",
          "Measure does not exist in this plan."
        );
      if (this.#completedMeasureIds.some((id) => id.equals(measureId)))
        throw r2(
          "CARBON_REDUCTION_R2_DUPLICATE",
          "Measure is already completed."
        );
      const count = this.#executionFacts.filter(
        (fact) => fact.measureId.equals(measureId)
      ).length;
      if (count === 0)
        throw r2(
          "CARBON_REDUCTION_R2_MEASURE_NOT_EXECUTED",
          "Measure requires an admitted execution fact."
        );
      const event2 = ReductionEvent.create({
        ...metadata2,
        eventType: "ReductionMeasureCompleted",
        aggregateId: this.id,
        payload: {
          reductionMeasureId: measureId.value,
          executionFactCount: count
        }
      });
      this.#completedMeasureIds.push(measureId);
      this.#executionEvents.push(event2);
    }
    completePlan(metadata2) {
      if (this.#status !== "IN_EXECUTION")
        throw r2(
          "CARBON_REDUCTION_R2_INVALID_TRANSITION",
          "Plan completes only from IN_EXECUTION."
        );
      const represented = new Set(
        this.#accountingUnits.flatMap(
          (unit) => unit.contributingMeasureIds.map((id) => id.value)
        )
      );
      if (this.#executionFacts.length === 0 || this.#accountingUnits.length === 0 || this.#completedMeasureIds.length !== this.#measures.length || this.#measures.some((measure) => !represented.has(measure.id.value)) || !this.accountingUnitsRemainDisjoint())
        throw r2(
          "CARBON_REDUCTION_R2_COMPLETION_INCOMPLETE",
          "Plan execution and accounting-unit coverage must be complete."
        );
      const event2 = ReductionEvent.create({
        ...metadata2,
        eventType: "ReductionPlanCompleted",
        aggregateId: this.id,
        payload: {
          measureCount: this.#measures.length,
          executionFactCount: this.#executionFacts.length,
          accountingUnitCount: this.#accountingUnits.length
        }
      });
      this.#executionEvents.push(event2);
      this.#status = "COMPLETED";
      Object.freeze(this.#executionFacts);
      Object.freeze(this.#accountingUnits);
      Object.freeze(this.#completedMeasureIds);
      Object.freeze(this.#executionEvents);
    }
    assertExecutionOpen(action) {
      if (this.#status !== "AUTHORIZED" && this.#status !== "IN_EXECUTION")
        throw r2(
          "CARBON_REDUCTION_R2_INVALID_TRANSITION",
          `Cannot ${action} from ${this.#status}.`
        );
    }
    accountingUnitsRemainDisjoint() {
      const sources = this.#accountingUnits.flatMap(
        (unit) => unit.baselineGovernedSourceIds.map((id) => id.value)
      );
      return new Set(sources).size === sources.length;
    }
  };
  function invalidReference3(message) {
    return new DomainError("CARBON_REDUCTION_R1_INVALID_REFERENCE", message);
  }
  function hasIdentifierKind4(value, kind2) {
    return value instanceof Identifier && value.kind === kind2;
  }
  function r2(code, message) {
    return new DomainError(code, message);
  }

  // packages/carbon-core/src/carbon-inventory.ts
  var createCarbonInventoryId = (value) => Identifier.create("CarbonInventory", value);
  var createGovernedInventorySourceId = (value) => Identifier.create("GovernedInventorySource", value);
  var createProductCarbonResultId = (value) => Identifier.create("ProductCarbonResult", value);
  var createProductCarbonTransferResultId = (value) => Identifier.create("ProductCarbonTransferResult", value);
  var allocationAuthority = Symbol("inventory-allocation-authority");
  var resultAuthority = Symbol("inventory-result-authority");
  var transferAuthority = Symbol("inventory-transfer-authority");
  var CarbonInventoryContextSnapshot = class _CarbonInventoryContextSnapshot {
    constructor(reportingEntityVersionId, accountingContextId, reportingPeriod, reportingMassUnit, carbonGasBasis) {
      this.reportingEntityVersionId = reportingEntityVersionId;
      this.accountingContextId = accountingContextId;
      this.reportingPeriod = reportingPeriod;
      this.reportingMassUnit = reportingMassUnit;
      this.carbonGasBasis = carbonGasBasis;
      Object.freeze(this);
    }
    #nominal = true;
    static capture(input) {
      void input.reportingEntityVersion.status;
      void input.accountingContext.status;
      if (!input.accountingContext.reportingEntityVersionId.equals(
        input.reportingEntityVersion.id
      ))
        throw mismatch(
          "Accounting context and ReportingEntityVersion must be on one chain."
        );
      if (input.reportingEntityVersion.status !== "APPROVED" && input.reportingEntityVersion.status !== "ACTIVE" && input.reportingEntityVersion.status !== "SUPERSEDED")
        throw new DomainError(
          "CARBON_BATCH7_CONTEXT_NOT_CONTROLLED",
          "ReportingEntityVersion must be APPROVED, ACTIVE, or SUPERSEDED."
        );
      if (input.accountingContext.status !== "Effective" && input.accountingContext.status !== "Frozen")
        throw new DomainError(
          "CARBON_BATCH7_CONTEXT_NOT_CONTROLLED",
          "CarbonAccountingContext must be Effective or Frozen."
        );
      const controlled = CarbonQuantity.create(
        "0",
        input.reportingMassUnit,
        input.carbonGasBasis
      );
      return new _CarbonInventoryContextSnapshot(
        input.reportingEntityVersion.id,
        input.accountingContext.id,
        ReportingPeriod.create(
          input.accountingContext.reportingPeriod.startDate,
          input.accountingContext.reportingPeriod.endDate,
          {
            periodType: input.accountingContext.reportingPeriod.periodType,
            ...input.accountingContext.reportingPeriod.calendarReference === void 0 ? {} : {
              calendarReference: input.accountingContext.reportingPeriod.calendarReference
            },
            ...input.accountingContext.reportingPeriod.baseYearRole === void 0 ? {} : {
              baseYearRole: input.accountingContext.reportingPeriod.baseYearRole
            }
          }
        ),
        controlled.unit,
        controlled.gasBasis
      );
    }
    accepts(quantity) {
      void this.#nominal;
      if (!(quantity instanceof CarbonQuantity) || quantity.gasBasis !== this.carbonGasBasis)
        throw mismatch("Carbon quantity does not match the inventory gas basis.");
      return quantity.convertTo(this.reportingMassUnit);
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var GovernedInventorySource = class _GovernedInventorySource {
    constructor(id, emissionResult, activityDataRecord, carbonActivity, emissionSource, accountingContext, reportingEntityVersion) {
      this.id = id;
      this.emissionResult = emissionResult;
      this.activityDataRecord = activityDataRecord;
      this.carbonActivity = carbonActivity;
      this.emissionSource = emissionSource;
      this.accountingContext = accountingContext;
      this.reportingEntityVersion = reportingEntityVersion;
      Object.freeze(this);
    }
    #nominal = true;
    static admit(input) {
      void input.emissionResult.calculatedAt;
      const recordStatus = input.activityDataRecord.status;
      const activityStatus = input.carbonActivity.status;
      const sourceStatus = input.emissionSource.status;
      void input.accountingContext.status;
      void input.reportingEntityVersion.status;
      if (recordStatus !== "Accepted" && recordStatus !== "Locked")
        throw ungovened("ActivityDataRecord must be Accepted or Locked.");
      if (activityStatus !== "Recorded" && activityStatus !== "Closed")
        throw ungovened("CarbonActivity must be Recorded or Closed.");
      if (sourceStatus !== "Active" && sourceStatus !== "Retired")
        throw ungovened("EmissionSource must be Active or Retired.");
      if (!input.emissionResult.activityDataRecordRef.activityDataRecordId.equals(
        input.activityDataRecord.id
      ) || !input.activityDataRecord.carbonActivityId.equals(
        input.carbonActivity.id
      ) || !input.carbonActivity.emissionSourceReference.emissionSourceId.equals(
        input.emissionSource.id
      ) || !input.emissionSource.accountingContextId.equals(
        input.accountingContext.id
      ) || !input.carbonActivity.emissionSourceReference.accountingContextId.equals(
        input.accountingContext.id
      ) || !input.emissionSource.reportingEntityVersionId.equals(
        input.reportingEntityVersion.id
      ) || !input.accountingContext.reportingEntityVersionId.equals(
        input.reportingEntityVersion.id
      ) || !input.carbonActivity.emissionSourceReference.reportingEntityVersionId.equals(
        input.reportingEntityVersion.id
      ))
        throw mismatch(
          "EmissionResult, record, activity, source, context and ReportingEntityVersion must be one chain."
        );
      return new _GovernedInventorySource(
        input.id,
        input.emissionResult,
        input.activityDataRecord,
        input.carbonActivity,
        input.emissionSource,
        input.accountingContext,
        input.reportingEntityVersion
      );
    }
    get quantity() {
      void this.#nominal;
      return this.emissionResult.result;
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ProductAllocation = class _ProductAllocation {
    constructor(productSubject, allocatedQuantity, allocationReference) {
      this.productSubject = productSubject;
      this.allocatedQuantity = allocatedQuantity;
      this.allocationReference = allocationReference;
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      return new _ProductAllocation(
        nonBlank8(input.productSubject, "productSubject"),
        input.allocatedQuantity,
        nonBlank8(input.allocationReference, "allocationReference")
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var AllocationResidual = class _AllocationResidual {
    constructor(quantity, reason, reference) {
      this.quantity = quantity;
      this.reason = reason;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static create(quantity, reason, reference) {
      return new _AllocationResidual(
        quantity,
        nonBlank8(reason, "reason"),
        nonBlank8(reference, "reference")
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ProductAllocationInstruction = class _ProductAllocationInstruction {
    constructor(source2, purpose, allocationSemanticsReference, allocations, residual) {
      this.source = source2;
      this.purpose = purpose;
      this.allocationSemanticsReference = allocationSemanticsReference;
      this.allocations = allocations;
      this.residual = residual;
      Object.freeze(this);
    }
    #nominal = true;
    static issue(input, authority) {
      if (authority !== allocationAuthority) throw forgery();
      input.source.assertGenuine();
      if (input.purpose !== "PRODUCT_RESULT" && input.purpose !== "TRANSFER")
        throw invalidAllocation("Allocation purpose is invalid.");
      if (input.allocations.length === 0 || input.allocations.some((item) => !(item instanceof ProductAllocation)))
        throw invalidAllocation(
          "At least one genuine product allocation is required."
        );
      const allocationSemanticsReference = nonBlank8(
        input.allocationSemanticsReference,
        "allocationSemanticsReference"
      );
      if (!(input.residual instanceof AllocationResidual))
        throw invalidAllocation("An explicit AllocationResidual is required.");
      for (const allocation of input.allocations) allocation.assertGenuine();
      input.residual.assertGenuine();
      const productSubjects = new Set(
        input.allocations.map((allocation) => allocation.productSubject)
      );
      if (productSubjects.size !== input.allocations.length)
        throw invalidAllocation(
          "Product subjects must be unique within one source-level instruction."
        );
      let accounted = CarbonQuantity.create(
        "0",
        input.source.quantity.unit,
        input.source.quantity.gasBasis
      );
      for (const allocation of input.allocations)
        accounted = accounted.add(allocation.allocatedQuantity);
      accounted = accounted.add(input.residual.quantity);
      if (accounted.value !== input.source.quantity.value || accounted.unit !== input.source.quantity.unit)
        throw invalidAllocation(
          "Allocated quantities plus residual must exactly equal the governed source quantity."
        );
      return new _ProductAllocationInstruction(
        input.source,
        input.purpose,
        allocationSemanticsReference,
        Object.freeze([...input.allocations]),
        input.residual
      );
    }
    allocationFor(productSubject) {
      void this.#nominal;
      return this.allocations.find(
        (item) => item.productSubject === productSubject
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ProductCarbonResult = class _ProductCarbonResult {
    constructor(authority, inventoryId, id, productSubject, sourceAllocationReferences, allocatedCarbonTotal, producedQuantity, perUnitCarbonQuantity) {
      this.inventoryId = inventoryId;
      this.id = id;
      this.productSubject = productSubject;
      this.sourceAllocationReferences = sourceAllocationReferences;
      this.allocatedCarbonTotal = allocatedCarbonTotal;
      this.producedQuantity = producedQuantity;
      this.perUnitCarbonQuantity = perUnitCarbonQuantity;
      if (authority !== resultAuthority) throw forgery();
      Object.freeze(this);
    }
    #nominal = true;
    static issue(input, authority) {
      assertStrictlyPositive(input.producedQuantity, "producedQuantity");
      return new _ProductCarbonResult(
        authority,
        input.inventoryId,
        input.id,
        input.productSubject,
        Object.freeze([...input.references]),
        input.total,
        input.producedQuantity,
        input.total.divideFinite(input.producedQuantity)
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ProductCarbonTransferResult = class _ProductCarbonTransferResult {
    constructor(authority, inventoryId, id, productSubject, productCarbonResult, transferAllocationReferences, soldOrTransferredQuantity, transferredCarbonQuantity) {
      this.inventoryId = inventoryId;
      this.id = id;
      this.productSubject = productSubject;
      this.productCarbonResult = productCarbonResult;
      this.transferAllocationReferences = transferAllocationReferences;
      this.soldOrTransferredQuantity = soldOrTransferredQuantity;
      this.transferredCarbonQuantity = transferredCarbonQuantity;
      if (authority !== transferAuthority) throw forgery();
      Object.freeze(this);
    }
    #nominal = true;
    static issue(input, authority) {
      assertStrictlyPositive(
        input.soldOrTransferredQuantity,
        "soldOrTransferredQuantity"
      );
      input.productCarbonResult.assertGenuine();
      const transferred = input.productCarbonResult.perUnitCarbonQuantity.multiply(input.soldOrTransferredQuantity).add(input.salesAllocated);
      return new _ProductCarbonTransferResult(
        authority,
        input.inventoryId,
        input.id,
        input.productSubject,
        input.productCarbonResult,
        Object.freeze([...input.references]),
        input.soldOrTransferredQuantity,
        transferred
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var CarbonBalance = class _CarbonBalance {
    constructor(value, unit, gasBasis) {
      this.value = value;
      this.unit = unit;
      this.gasBasis = gasBasis;
      Object.freeze(this);
    }
    static from(inAndAdd, out) {
      const normalized = out.convertTo(inAndAdd.unit);
      if (normalized.gasBasis !== inAndAdd.gasBasis)
        throw mismatch("Balance gas bases must match.");
      const [value, negative2] = compareAndSubtract(
        inAndAdd.value,
        normalized.value
      );
      return new _CarbonBalance(
        `${negative2 ? "-" : ""}${value}`,
        inAndAdd.unit,
        inAndAdd.gasBasis
      );
    }
  };
  var CarbonInventoryAggregate = class _CarbonInventoryAggregate {
    constructor(id, context) {
      this.id = id;
      this.context = context;
    }
    #sources = /* @__PURE__ */ new Map();
    #emissionResultIds = /* @__PURE__ */ new Set();
    #direct = /* @__PURE__ */ new Map();
    #instructions = [];
    #productResults = /* @__PURE__ */ new Map();
    #issuedTransfers = /* @__PURE__ */ new Map();
    #postedTransferIds = /* @__PURE__ */ new Set();
    #status = "DRAFT";
    static create(id, context) {
      context.assertGenuine();
      return new _CarbonInventoryAggregate(id, context);
    }
    get status() {
      return this.#status;
    }
    containsGovernedSource(source2) {
      return this.#sources.get(source2.id.value) === source2;
    }
    admitSource(input) {
      this.assertDraft();
      const source2 = GovernedInventorySource.admit(input);
      this.assertSameContext(source2);
      this.context.accepts(source2.quantity);
      if (this.#sources.has(source2.id.value))
        throw duplicate3("Governed source is already admitted.");
      if (this.#emissionResultIds.has(
        source2.emissionResult.emissionCalculationId.value
      ))
        throw duplicate3("EmissionResult is already admitted to this inventory.");
      this.#sources.set(source2.id.value, source2);
      this.#emissionResultIds.add(
        source2.emissionResult.emissionCalculationId.value
      );
      return source2;
    }
    postSource(direction, source2) {
      this.assertDraft();
      this.assertOwnedSource(source2);
      if (direction !== "IN" && direction !== "ADD")
        throw new DomainError(
          "CARBON_BATCH7_NAKED_OUT",
          "Direct EmissionResult posting is limited to IN and ADD."
        );
      if (this.#direct.has(source2.id.value))
        throw duplicate3(
          "Governed source is already posted to enterprise totals."
        );
      this.#direct.set(source2.id.value, direction);
    }
    registerAllocation(input) {
      this.assertDraft();
      this.assertOwnedSource(input.source);
      if (this.#instructions.some(
        (item) => item.source === input.source && item.purpose === input.purpose
      ))
        throw duplicate3("Source already has an instruction for this purpose.");
      const instruction = ProductAllocationInstruction.issue(
        input,
        allocationAuthority
      );
      this.#instructions.push(instruction);
      return instruction;
    }
    allocationInstructionsFor(source2) {
      this.assertOwnedSource(source2);
      return Object.freeze(
        this.#instructions.filter((instruction) => instruction.source === source2)
      );
    }
    issueProductCarbonResult(id, productSubject, producedQuantity) {
      this.assertDraft();
      const subject = nonBlank8(productSubject, "productSubject");
      if (this.#productResults.has(id.value))
        throw duplicate3("ProductCarbonResult identifier already exists.");
      let total = this.zero();
      const references = [];
      for (const instruction of this.#instructions) {
        if (instruction.purpose !== "PRODUCT_RESULT") continue;
        const allocation = instruction.allocationFor(subject);
        if (allocation !== void 0) {
          total = total.add(this.context.accepts(allocation.allocatedQuantity));
          references.push(
            Object.freeze({
              governedSourceId: instruction.source.id,
              allocationReference: allocation.allocationReference
            })
          );
        }
      }
      if (references.length === 0)
        throw invalidAllocation(
          "No registered PRODUCT_RESULT allocation exists for this product."
        );
      const result = ProductCarbonResult.issue(
        {
          inventoryId: this.id,
          id,
          productSubject: subject,
          references,
          total,
          producedQuantity
        },
        resultAuthority
      );
      this.#productResults.set(id.value, result);
      return result;
    }
    issueProductCarbonTransferResult(id, productResult, soldOrTransferredQuantity) {
      this.assertDraft();
      productResult.assertGenuine();
      if (!productResult.inventoryId.equals(this.id) || this.#productResults.get(productResult.id.value) !== productResult)
        throw mismatch("ProductCarbonResult is not owned by this inventory.");
      if (this.#issuedTransfers.has(id.value))
        throw duplicate3("Transfer result identifier already exists.");
      let salesAllocated = this.zero();
      const references = [];
      for (const instruction of this.#instructions) {
        if (instruction.purpose !== "TRANSFER") continue;
        const allocation = instruction.allocationFor(
          productResult.productSubject
        );
        if (allocation !== void 0) {
          salesAllocated = salesAllocated.add(
            this.context.accepts(allocation.allocatedQuantity)
          );
          references.push(
            Object.freeze({
              governedSourceId: instruction.source.id,
              allocationReference: allocation.allocationReference
            })
          );
        }
      }
      if (references.length === 0)
        throw invalidAllocation(
          "No registered TRANSFER allocation exists for this product."
        );
      const transfer = ProductCarbonTransferResult.issue(
        {
          inventoryId: this.id,
          id,
          productSubject: productResult.productSubject,
          productCarbonResult: productResult,
          references,
          salesAllocated,
          soldOrTransferredQuantity
        },
        transferAuthority
      );
      this.#issuedTransfers.set(id.value, transfer);
      return transfer;
    }
    postTransfer(transfer) {
      this.assertDraft();
      transfer.assertGenuine();
      if (!transfer.inventoryId.equals(this.id) || this.#issuedTransfers.get(transfer.id.value) !== transfer)
        throw new DomainError(
          "CARBON_BATCH7_FOREIGN_TRANSFER",
          "OUT requires the exact transfer issued by this inventory."
        );
      if (this.#postedTransferIds.has(transfer.id.value))
        throw duplicate3("Transfer is already posted to OUT.");
      this.context.accepts(transfer.transferredCarbonQuantity);
      this.#postedTransferIds.add(transfer.id.value);
    }
    total(direction) {
      let total = this.zero();
      let found = false;
      if (direction === "OUT") {
        for (const id of this.#postedTransferIds) {
          found = true;
          const transfer = this.#issuedTransfers.get(id);
          if (transfer === void 0)
            throw mismatch("Posted transfer lineage is incomplete.");
          total = total.add(
            this.context.accepts(transfer.transferredCarbonQuantity)
          );
        }
      } else
        for (const [id, postedDirection] of this.#direct) {
          if (postedDirection !== direction) continue;
          found = true;
          const source2 = this.#sources.get(id);
          if (source2 === void 0)
            throw mismatch("Posted source lineage is incomplete.");
          total = total.add(this.context.accepts(source2.quantity));
        }
      if (!found)
        throw new DomainError(
          "CARBON_BATCH7_FLOW_MISSING",
          `${direction} has no governed inventory entry; missing flow is not zero.`
        );
      return total;
    }
    get operatingBalance() {
      return CarbonBalance.from(
        this.total("IN").add(this.total("ADD")),
        this.total("OUT")
      );
    }
    startReconciliation() {
      this.transition("DRAFT", "RECONCILING");
    }
    markReconciled() {
      this.transition("RECONCILING", "RECONCILED");
    }
    close() {
      this.transition("RECONCILED", "CLOSED");
      Object.freeze(this.#instructions);
      Object.freeze(this);
    }
    zero() {
      return CarbonQuantity.create(
        "0",
        this.context.reportingMassUnit,
        this.context.carbonGasBasis
      );
    }
    assertOwnedSource(source2) {
      source2.assertGenuine();
      if (this.#sources.get(source2.id.value) !== source2)
        throw mismatch("Source is not admitted to this inventory.");
    }
    assertSameContext(source2) {
      if (!source2.reportingEntityVersion.id.equals(
        this.context.reportingEntityVersionId
      ) || !source2.accountingContext.id.equals(this.context.accountingContextId))
        throw mismatch(
          "Foreign context or ReportingEntityVersion source rejected."
        );
    }
    assertDraft() {
      if (this.#status !== "DRAFT")
        throw new DomainError(
          "CARBON_BATCH7_IMMUTABLE",
          "Inventory content is mutable only in DRAFT."
        );
    }
    transition(from, to) {
      if (this.#status !== from)
        throw new DomainError(
          "CARBON_BATCH7_INVALID_TRANSITION",
          `Inventory cannot transition from ${this.#status} to ${to}.`
        );
      this.#status = to;
    }
  };
  function mismatch(message) {
    return new DomainError("CARBON_BATCH7_CONTEXT_MISMATCH", message);
  }
  function forgery() {
    return new DomainError(
      "CARBON_BATCH7_FORGERY_REJECTED",
      "A genuine inventory-owned domain instance is required."
    );
  }
  function ungovened(message) {
    return new DomainError("CARBON_BATCH7_SOURCE_NOT_GOVERNED", message);
  }
  function duplicate3(message) {
    return new DomainError("CARBON_BATCH7_DUPLICATE", message);
  }
  function invalidAllocation(message) {
    return new DomainError("CARBON_BATCH7_ALLOCATION_INVALID", message);
  }
  function nonBlank8(value, field) {
    const normalized = value.trim();
    if (normalized.length === 0)
      throw new DomainError(
        "CARBON_BATCH7_NONBLANK_REQUIRED",
        `${field} must be nonblank.`
      );
    return normalized;
  }
  function assertStrictlyPositive(value, field) {
    const quantity = CarbonQuantity.create(value, "kg", "CO2E");
    if (quantity.value === "0")
      throw new DomainError(
        "CARBON_BATCH7_PRODUCT_QUANTITY_INVALID",
        `${field} must be strictly positive.`
      );
  }
  function compareAndSubtract(left, right) {
    const scale = Math.max(
      (left.split(".")[1] ?? "").length,
      (right.split(".")[1] ?? "").length
    );
    const integer = (value) => BigInt(
      value.replace(".", "") + "0".repeat(scale - (value.split(".")[1] ?? "").length)
    );
    const difference = integer(left) - integer(right);
    const negative2 = difference < 0n;
    let digits = (negative2 ? -difference : difference).toString().padStart(scale + 1, "0");
    if (scale > 0) digits = `${digits.slice(0, -scale)}.${digits.slice(-scale)}`;
    if (digits.includes("."))
      digits = digits.replace(/0+$/u, "").replace(/\.$/u, "");
    return [digits, negative2];
  }

  // packages/carbon-core/src/factor-dataset-version.ts
  var FactorDatasetVersion = class _FactorDatasetVersion {
    id;
    sourceIdentity;
    version;
    constructor(input) {
      this.id = input.id;
      this.sourceIdentity = required3(input.sourceIdentity);
      this.version = required3(input.version);
      Object.freeze(this);
    }
    static create(input) {
      assertIdentifierKind(input.id, "FactorDatasetVersion", "id");
      return new _FactorDatasetVersion(input);
    }
    toReference() {
      return FactorDatasetVersionReference.create(this.id);
    }
  };
  function required3(value) {
    const normalized = value.trim();
    if (!normalized)
      throw new DomainError(
        "CARBON_BATCH5_INVALID_VALUE",
        "Dataset source and version must be non-blank."
      );
    return normalized;
  }

  // packages/carbon-core/src/emission-factor.ts
  var EmissionFactor = class _EmissionFactor {
    id;
    datasetVersionReference;
    value;
    unit;
    applicability;
    validity;
    evidenceReferenceId;
    #status = "Draft";
    constructor(input) {
      this.id = input.id;
      this.datasetVersionReference = input.datasetVersionReference;
      this.value = input.value;
      this.unit = input.unit;
      this.applicability = input.applicability;
      this.validity = input.validity;
      this.evidenceReferenceId = input.evidenceReferenceId;
    }
    static create(input) {
      assertIdentifierKind(input.id, "EmissionFactor", "id");
      if (!(input.datasetVersionReference instanceof FactorDatasetVersionReference) || !(input.value instanceof ExactDecimal) || !(input.unit instanceof FactorUnit) || !(input.applicability instanceof FactorApplicability) || !(input.validity instanceof ValidityPeriod)) {
        throw new DomainError(
          "CARBON_BATCH5_INVALID_VALUE",
          "EmissionFactor requires valid governed values."
        );
      }
      assertIdentifierKind(
        input.evidenceReferenceId,
        "EvidenceReference",
        "evidenceReferenceId"
      );
      return new _EmissionFactor(input);
    }
    get status() {
      return this.#status;
    }
    publish() {
      this.transition("Draft", "Published");
    }
    archive() {
      this.transition("Published", "Archived");
    }
    toReference() {
      return EmissionFactorReference.create(this.id);
    }
    transition(from, to) {
      if (this.#status !== from)
        throw new DomainError(
          "CARBON_BATCH5_INVALID_TRANSITION",
          `EmissionFactor cannot transition from ${this.#status} to ${to}.`
        );
      this.#status = to;
    }
  };

  // packages/carbon-core/src/factor-selection-policy.ts
  var FactorSelectionPolicy = class _FactorSelectionPolicy {
    snapshot;
    constructor(id, version) {
      this.snapshot = PolicySnapshot.create(id, version);
      Object.freeze(this);
    }
    static create(id, version) {
      return new _FactorSelectionPolicy(id, version);
    }
    resolve(candidates) {
      const stable = [...candidates].sort(
        (left, right) => left.id.value.localeCompare(right.id.value)
      );
      return stable.length === 1 ? stable[0] : void 0;
    }
  };

  // packages/carbon-core/src/emission-source.ts
  var EmissionSourceAggregate = class _EmissionSourceAggregate {
    id;
    reportingEntityVersionId;
    accountingContextId;
    validityPeriod;
    #sourceName;
    #sourceCategory;
    #status = "Draft";
    #events = [];
    constructor(input, metadata2) {
      this.id = input.id;
      this.reportingEntityVersionId = input.reportingEntityVersionId;
      this.accountingContextId = input.accountingContextId;
      this.validityPeriod = input.validityPeriod;
      this.#sourceName = assertBatch4ANonBlank(input.sourceName);
      this.#sourceCategory = input.sourceCategory;
      this.#events.push(
        Batch4AEvent.create({
          ...metadata2,
          eventType: "EmissionSourceDrafted",
          aggregateId: this.id,
          payload: {
            reportingEntityVersionId: this.reportingEntityVersionId.value,
            accountingContextId: this.accountingContextId.value,
            sourceCategory: this.#sourceCategory.toString()
          }
        })
      );
    }
    static create(input, metadata2) {
      assertIdentifierKind(input.id, "EmissionSource", "id");
      assertIdentifierKind(
        input.reportingEntityVersionId,
        "ReportingEntityVersion",
        "reportingEntityVersionId"
      );
      assertIdentifierKind(
        input.accountingContextId,
        "CarbonAccountingContext",
        "accountingContextId"
      );
      if (!(input.sourceCategory instanceof SourceCategoryCode)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_REFERENCE",
          "sourceCategory must be a SourceCategoryCode."
        );
      }
      if (!(input.validityPeriod instanceof ValidityPeriod)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_VALUE",
          "validityPeriod must be a ValidityPeriod."
        );
      }
      return new _EmissionSourceAggregate(input, metadata2);
    }
    get status() {
      return this.#status;
    }
    get sourceName() {
      return this.#sourceName;
    }
    get sourceCategory() {
      return this.#sourceCategory;
    }
    get events() {
      return Object.freeze([...this.#events]);
    }
    toReference() {
      return EmissionSourceReference.create({
        emissionSourceId: this.id,
        reportingEntityVersionId: this.reportingEntityVersionId,
        accountingContextId: this.accountingContextId,
        sourceCategory: this.#sourceCategory
      });
    }
    register(metadata2) {
      this.transition(
        "Draft",
        "Registered",
        "EmissionSourceRegistered",
        metadata2
      );
    }
    activate(metadata2) {
      this.transition(
        "Registered",
        "Active",
        "EmissionSourceActivated",
        metadata2
      );
    }
    suspend(metadata2) {
      this.transition("Active", "Suspended", "EmissionSourceSuspended", metadata2);
    }
    reactivate(metadata2) {
      this.transition(
        "Suspended",
        "Active",
        "EmissionSourceReactivated",
        metadata2
      );
    }
    retire(metadata2) {
      if (this.#status !== "Active" && this.#status !== "Suspended") {
        throw invalidTransition2(this.#status, "Retired");
      }
      this.#status = "Retired";
      this.recordEmpty("EmissionSourceRetired", metadata2);
    }
    changeDetails(sourceName, sourceCategory, metadata2) {
      if (this.#status === "Retired") {
        throw new DomainError(
          "CARBON_BATCH4A_IMMUTABLE",
          "A retired Emission Source is immutable."
        );
      }
      if (!(sourceCategory instanceof SourceCategoryCode)) {
        throw new DomainError(
          "CARBON_BATCH4A_INVALID_REFERENCE",
          "sourceCategory must be a SourceCategoryCode."
        );
      }
      this.#sourceName = assertBatch4ANonBlank(sourceName);
      this.#sourceCategory = sourceCategory;
      this.#events.push(
        Batch4AEvent.create({
          ...metadata2,
          eventType: "EmissionSourceDetailsChanged",
          aggregateId: this.id,
          payload: {
            sourceName: this.#sourceName,
            sourceCategory: this.#sourceCategory.toString()
          }
        })
      );
    }
    transition(expected, next, eventType, metadata2) {
      if (this.#status !== expected) throw invalidTransition2(this.#status, next);
      this.#status = next;
      this.recordEmpty(eventType, metadata2);
    }
    recordEmpty(eventType, metadata2) {
      this.#events.push(
        Batch4AEvent.create({
          ...metadata2,
          eventType,
          aggregateId: this.id,
          payload: {}
        })
      );
    }
  };
  function invalidTransition2(from, to) {
    return new DomainError(
      "CARBON_BATCH4A_INVALID_TRANSITION",
      `Emission Source cannot transition from ${from} to ${to}.`,
      { from, to }
    );
  }

  // packages/carbon-core/src/accounting-standard-reference.ts
  var accountingStandardReferenceRoles = Object.freeze([
    "Primary",
    "Supplementary",
    "Regulatory",
    "InternalPolicy",
    "MethodologicalGuidance"
  ]);
  var AccountingStandardReference = class _AccountingStandardReference {
    code;
    name;
    version;
    issuer;
    referenceRole;
    effectiveDate;
    reference;
    applicabilityNote;
    constructor(input) {
      this.code = assertNonBlank(input.code, "standard code");
      this.name = assertNonBlank(input.name, "standard name");
      this.version = assertNonBlank(input.version, "standard version");
      this.issuer = assertNonBlank(input.issuer, "standard issuer");
      this.referenceRole = input.referenceRole;
      this.effectiveDate = input.effectiveDate;
      this.reference = assertNonBlank(input.reference, "standard reference");
      this.applicabilityNote = input.applicabilityNote === void 0 ? void 0 : assertNonBlank(input.applicabilityNote, "applicability note");
      Object.freeze(this);
    }
    static create(input) {
      assertVocabularyValue(
        input.referenceRole,
        accountingStandardReferenceRoles,
        "referenceRole"
      );
      assertIsoDateOnly2(input.effectiveDate, "effectiveDate");
      try {
        return new _AccountingStandardReference(input);
      } catch (error3) {
        if (error3 instanceof DomainError) {
          throw error3;
        }
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_VALUE",
          "Accounting standard reference is invalid."
        );
      }
    }
    hasSameIdentity(other) {
      return this.code === other.code && this.version === other.version;
    }
  };

  // packages/carbon-core/src/boundary-vocabulary.ts
  var contextLifecycleStatuses = Object.freeze([
    "Draft",
    "UnderReview",
    "Effective",
    "Frozen",
    "Superseded",
    "Retired"
  ]);
  var consolidationApproaches = Object.freeze([
    "OperationalControl",
    "FinancialControl",
    "EquityShare",
    "ApprovedHybrid",
    "OtherApprovedApproach"
  ]);
  var boundaryDecisionTypes = Object.freeze([
    "InclusionDecision",
    "ExclusionDecision",
    "PartialInclusionDecision",
    "ApplicabilityDecision",
    "ConsolidationApproachDecision",
    "MaterialityDecision",
    "BoundaryChangeDecision"
  ]);
  var organizationalBoundaryTreatments = Object.freeze([
    "Included",
    "PartiallyIncluded",
    "Excluded",
    "NotApplicable",
    "PendingAssessment"
  ]);
  var coverageStatuses = Object.freeze([
    "Included",
    "PartiallyIncluded",
    "Excluded",
    "NotApplicable",
    "PendingAssessment"
  ]);
  var requirementStatuses = Object.freeze([
    "Required",
    "ConditionallyRequired",
    "Optional",
    "NotRequired",
    "Undetermined"
  ]);
  var materialityStatuses = Object.freeze([
    "Material",
    "Immaterial",
    "NotAssessed",
    "NotApplicable"
  ]);
  var assessmentTypes = Object.freeze([
    "OperationalControl",
    "FinancialControl",
    "EquityInterest",
    "ContractualControl",
    "OtherApprovedBasis"
  ]);
  var assessmentOutcomes = Object.freeze([
    "Confirmed",
    "NotConfirmed",
    "Partial",
    "Indeterminate"
  ]);

  // packages/carbon-core/src/boundary-events.ts
  var carbonBoundaryEventTypes = Object.freeze([
    "CarbonAccountingContextCreated",
    "ReportingPeriodAssigned",
    "OrganizationalBoundaryDefined",
    "OrganizationalBoundaryChanged",
    "OperationalBoundaryDefined",
    "OperationalBoundaryChanged",
    "BoundaryDecisionRecorded",
    "CarbonAccountingContextSubmittedForReview",
    "CarbonAccountingContextMadeEffective",
    "CarbonAccountingContextFrozen",
    "CarbonAccountingContextSuperseded",
    "CarbonAccountingContextRetired"
  ]);
  var payloadKeysByEventType = Object.freeze({
    CarbonAccountingContextCreated: Object.freeze([
      "reportingEntityVersionId",
      "versionNumber"
    ]),
    ReportingPeriodAssigned: Object.freeze([
      "startDate",
      "endDate",
      "periodType"
    ]),
    OrganizationalBoundaryDefined: Object.freeze([
      "contextId",
      "versionNumber",
      "consolidationApproach"
    ]),
    OrganizationalBoundaryChanged: Object.freeze(["contextId", "changeType"]),
    OperationalBoundaryDefined: Object.freeze(["contextId", "versionNumber"]),
    OperationalBoundaryChanged: Object.freeze(["contextId", "changeType"]),
    BoundaryDecisionRecorded: Object.freeze(["decisionType", "versionNumber"]),
    CarbonAccountingContextSubmittedForReview: Object.freeze([
      "organizationalBoundaryId",
      "operationalBoundaryId"
    ]),
    CarbonAccountingContextMadeEffective: Object.freeze([
      "reportingEntityVersionId"
    ]),
    CarbonAccountingContextFrozen: Object.freeze([
      "organizationalBoundaryId",
      "operationalBoundaryId"
    ]),
    CarbonAccountingContextSuperseded: Object.freeze([
      "successorContextId",
      "reason"
    ]),
    CarbonAccountingContextRetired: Object.freeze(["formerStatus", "reason"])
  });
  var aggregateKindByEventType = Object.freeze({
    CarbonAccountingContextCreated: "CarbonAccountingContext",
    ReportingPeriodAssigned: "CarbonAccountingContext",
    OrganizationalBoundaryDefined: "OrganizationalBoundary",
    OrganizationalBoundaryChanged: "OrganizationalBoundary",
    OperationalBoundaryDefined: "OperationalBoundary",
    OperationalBoundaryChanged: "OperationalBoundary",
    BoundaryDecisionRecorded: "BoundaryDecision",
    CarbonAccountingContextSubmittedForReview: "CarbonAccountingContext",
    CarbonAccountingContextMadeEffective: "CarbonAccountingContext",
    CarbonAccountingContextFrozen: "CarbonAccountingContext",
    CarbonAccountingContextSuperseded: "CarbonAccountingContext",
    CarbonAccountingContextRetired: "CarbonAccountingContext"
  });
  var CarbonBoundaryEvent = class _CarbonBoundaryEvent {
    eventId;
    eventType;
    aggregateId;
    actorId;
    schemaVersion = 1;
    payload;
    #occurredAtTime;
    constructor(input) {
      this.eventId = input.eventId;
      this.eventType = input.eventType;
      this.aggregateId = input.aggregateId;
      this.actorId = input.actorId;
      this.#occurredAtTime = input.occurredAt.getTime();
      this.payload = Object.freeze({ ...input.payload });
      Object.freeze(this);
    }
    static create(input) {
      assertRuntimeEventContract(input);
      return new _CarbonBoundaryEvent(input);
    }
    get occurredAt() {
      return new Date(this.#occurredAtTime);
    }
  };
  function assertRuntimeEventContract(value) {
    if (typeof value !== "object" || value === null) {
      throw invalidEventContract();
    }
    const input = value;
    if (!(input.occurredAt instanceof Date) || !Number.isFinite(input.occurredAt.getTime())) {
      throw invalidEventContract();
    }
    const eventType = input.eventType;
    if (typeof eventType !== "string" || !carbonBoundaryEventTypes.includes(eventType)) {
      throw invalidEventContract();
    }
    const approvedEventType = eventType;
    const payload = input.payload;
    if (typeof payload !== "object" || payload === null) {
      throw invalidEventContract();
    }
    const actualKeys = Object.keys(payload).sort();
    const expectedKeys = [...payloadKeysByEventType[approvedEventType]].sort();
    if (actualKeys.length !== expectedKeys.length || actualKeys.some((key, index) => key !== expectedKeys[index])) {
      throw invalidEventContract();
    }
    assertRuntimePayloadValues(
      approvedEventType,
      payload
    );
    if (!hasIdentifierKind5(input.eventId, "CarbonDomainEvent") || !hasIdentifierKind5(input.actorId, "Actor") || !hasIdentifierKind5(
      input.aggregateId,
      aggregateKindByEventType[approvedEventType]
    )) {
      throw invalidEventContract();
    }
  }
  function hasIdentifierKind5(value, kind2) {
    return value instanceof Identifier && value.kind === kind2;
  }
  function assertRuntimePayloadValues(eventType, payload) {
    switch (eventType) {
      case "CarbonAccountingContextCreated":
        assertPayload2(
          hasNonBlankString(payload, "reportingEntityVersionId") && hasPositiveVersion(payload, "versionNumber")
        );
        return;
      case "ReportingPeriodAssigned": {
        const startDate = payload.startDate;
        const endDate = payload.endDate;
        assertPayload2(
          isIsoDateOnly(startDate) && isIsoDateOnly(endDate) && startDate <= endDate && hasNonBlankString(payload, "periodType")
        );
        return;
      }
      case "OrganizationalBoundaryDefined":
        assertPayload2(
          hasNonBlankString(payload, "contextId") && hasPositiveVersion(payload, "versionNumber") && isVocabularyValue(
            payload.consolidationApproach,
            consolidationApproaches
          )
        );
        return;
      case "OrganizationalBoundaryChanged":
      case "OperationalBoundaryChanged":
        assertPayload2(
          hasNonBlankString(payload, "contextId") && hasNonBlankString(payload, "changeType")
        );
        return;
      case "OperationalBoundaryDefined":
        assertPayload2(
          hasNonBlankString(payload, "contextId") && hasPositiveVersion(payload, "versionNumber")
        );
        return;
      case "BoundaryDecisionRecorded":
        assertPayload2(
          isVocabularyValue(payload.decisionType, boundaryDecisionTypes) && hasPositiveVersion(payload, "versionNumber")
        );
        return;
      case "CarbonAccountingContextSubmittedForReview":
      case "CarbonAccountingContextFrozen":
        assertPayload2(
          hasNonBlankString(payload, "organizationalBoundaryId") && hasNonBlankString(payload, "operationalBoundaryId")
        );
        return;
      case "CarbonAccountingContextMadeEffective":
        assertPayload2(hasNonBlankString(payload, "reportingEntityVersionId"));
        return;
      case "CarbonAccountingContextSuperseded":
        assertPayload2(
          hasNonBlankString(payload, "successorContextId") && hasNonBlankString(payload, "reason")
        );
        return;
      case "CarbonAccountingContextRetired":
        assertPayload2(
          isVocabularyValue(payload.formerStatus, contextLifecycleStatuses) && hasNonBlankString(payload, "reason")
        );
    }
  }
  function hasNonBlankString(payload, key) {
    const value = payload[key];
    return typeof value === "string" && value.trim().length > 0;
  }
  function hasPositiveVersion(payload, key) {
    const value = payload[key];
    return Number.isSafeInteger(value) && value > 0;
  }
  function isVocabularyValue(value, vocabulary) {
    return typeof value === "string" && vocabulary.includes(value);
  }
  function isIsoDateOnly(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const parsed = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }
  function assertPayload2(condition) {
    if (!condition) {
      throw invalidEventContract();
    }
  }
  function invalidEventContract() {
    return new DomainError(
      "CARBON_BOUNDARY_INVALID_VALUE",
      "Domain event type, identifiers, aggregate kind, and minimal payload must match the approved Batch 3 contract."
    );
  }

  // packages/carbon-core/src/carbon-accounting-context.ts
  var CarbonAccountingContext = class _CarbonAccountingContext {
    id;
    reportingEntityVersionId;
    reportingPeriod;
    validityPeriod;
    organizationalBoundaryId;
    operationalBoundaryId;
    versionNumber;
    supersedesId;
    supersessionReason;
    #accountingPurpose;
    #status = "Draft";
    #accountingStandardReferences;
    #freezingMetadata;
    #lastReviewRejectionReason;
    #events = [];
    #ancestorIds;
    #predecessorBoundaries;
    constructor(input, metadata2, supersedesId, supersessionReason, ancestorIds, predecessorBoundaries) {
      this.id = input.id;
      this.reportingEntityVersionId = input.reportingEntityVersionId;
      this.reportingPeriod = input.reportingPeriod;
      this.validityPeriod = reportingPeriodValidity(input.reportingPeriod);
      this.organizationalBoundaryId = input.organizationalBoundaryId;
      this.operationalBoundaryId = input.operationalBoundaryId;
      this.#accountingPurpose = assertNonBlank(
        input.accountingPurpose,
        "accountingPurpose"
      );
      this.#accountingStandardReferences = [
        ...input.accountingStandardReferences
      ];
      this.versionNumber = input.versionNumber;
      this.supersedesId = supersedesId;
      this.supersessionReason = supersessionReason;
      this.#ancestorIds = Object.freeze([...ancestorIds]);
      this.#predecessorBoundaries = predecessorBoundaries;
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...metadata2.contextCreated,
          eventType: "CarbonAccountingContextCreated",
          aggregateId: input.id,
          payload: {
            reportingEntityVersionId: input.reportingEntityVersionId.value,
            versionNumber: input.versionNumber
          }
        }),
        CarbonBoundaryEvent.create({
          ...metadata2.reportingPeriodAssigned,
          eventType: "ReportingPeriodAssigned",
          aggregateId: input.id,
          payload: {
            startDate: input.reportingPeriod.startDate,
            endDate: input.reportingPeriod.endDate,
            periodType: input.reportingPeriod.periodType
          }
        })
      );
    }
    static create(input, metadata2) {
      validateCreateInput(input, metadata2);
      return new _CarbonAccountingContext(
        input,
        metadata2,
        void 0,
        void 0,
        [],
        void 0
      );
    }
    get status() {
      return this.#status;
    }
    get accountingPurpose() {
      return this.#accountingPurpose;
    }
    get accountingStandardReferences() {
      return Object.freeze([...this.#accountingStandardReferences]);
    }
    get freezingMetadata() {
      return this.#freezingMetadata;
    }
    get lastReviewRejectionReason() {
      return this.#lastReviewRejectionReason;
    }
    get events() {
      return Object.freeze([...this.#events]);
    }
    addAccountingStandard(standard) {
      this.assertContentMutable();
      if (this.#accountingStandardReferences.some(
        (candidate) => candidate.hasSameIdentity(standard)
      )) {
        throw new DomainError(
          "CARBON_BOUNDARY_DUPLICATE",
          "Accounting-standard code and version already exist in this context."
        );
      }
      this.#accountingStandardReferences.push(standard);
    }
    removeAccountingStandard(standard) {
      this.assertContentMutable();
      const index = this.#accountingStandardReferences.findIndex(
        (candidate) => candidate.hasSameIdentity(standard) && candidate.referenceRole === standard.referenceRole
      );
      if (index < 0) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "Accounting-standard reference does not belong to this context."
        );
      }
      this.#accountingStandardReferences.splice(index, 1);
    }
    changeAccountingPurpose(accountingPurpose) {
      this.assertContentMutable();
      this.#accountingPurpose = assertNonBlank(
        accountingPurpose,
        "accountingPurpose"
      );
    }
    submitForReview(input) {
      this.assertStatus("Draft", "UnderReview");
      this.assertExactlyOnePrimaryStandard();
      this.assertBoundariesReady(input);
      this.#status = "UnderReview";
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...input.eventMetadata,
          eventType: "CarbonAccountingContextSubmittedForReview",
          aggregateId: this.id,
          payload: {
            organizationalBoundaryId: this.organizationalBoundaryId.value,
            operationalBoundaryId: this.operationalBoundaryId.value
          }
        })
      );
    }
    rejectReview(reason) {
      this.assertStatus("UnderReview", "Draft");
      this.#lastReviewRejectionReason = assertNonBlank(
        reason,
        "review rejection reason"
      );
      this.#status = "Draft";
    }
    makeEffective(input) {
      this.assertStatus("UnderReview", "Effective");
      this.assertExactlyOnePrimaryStandard();
      this.assertBoundariesReady(input);
      if (!input.reportingEntityVersion.id.equals(this.reportingEntityVersionId)) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "ReportingEntityVersion does not match the context reference."
        );
      }
      if (input.reportingEntityVersion.status !== "ACTIVE") {
        throw new DomainError(
          "CARBON_BOUNDARY_NOT_READY",
          "ReportingEntityVersion must be ACTIVE before context effectiveness."
        );
      }
      if (!input.reportingEntityVersion.validityPeriod.contains(
        reportingPeriodValidity(this.reportingPeriod)
      )) {
        throw new DomainError(
          "CARBON_BOUNDARY_NOT_READY",
          "The reporting period must fall within ReportingEntityVersion validity."
        );
      }
      if (input.actor.status !== "ACTIVE" || !input.actor.id.equals(input.eventMetadata.actorId)) {
        throw new DomainError(
          "CARBON_BOUNDARY_NOT_READY",
          "An active matching Actor is required to make the context effective."
        );
      }
      if (this.#predecessorBoundaries !== void 0) {
        if (!input.organizationalBoundary.isFrozen || !input.operationalBoundary.isFrozen || !input.organizationalBoundary.supersedesId?.equals(
          this.#predecessorBoundaries.organizationalBoundaryId
        ) || !input.operationalBoundary.supersedesId?.equals(
          this.#predecessorBoundaries.operationalBoundaryId
        )) {
          throw new DomainError(
            "CARBON_BOUNDARY_SUPERSESSION_INVALID",
            "An effective successor context requires frozen successors of both historical boundaries."
          );
        }
      }
      this.#status = "Effective";
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...input.eventMetadata,
          eventType: "CarbonAccountingContextMadeEffective",
          aggregateId: this.id,
          payload: {
            reportingEntityVersionId: this.reportingEntityVersionId.value
          }
        })
      );
    }
    freeze(input) {
      this.assertStatus("Effective", "Frozen");
      this.assertExactlyOnePrimaryStandard();
      this.assertBoundariesReady(input);
      if (!input.organizationalBoundary.isFrozen || !input.operationalBoundary.isFrozen) {
        throw new DomainError(
          "CARBON_BOUNDARY_NOT_READY",
          "Both accounting boundaries must be frozen before the context."
        );
      }
      if (!input.freezingMetadata.frozenByActorId.equals(
        input.eventMetadata.actorId
      )) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "The context freezing Actor and event Actor must match."
        );
      }
      this.#freezingMetadata = input.freezingMetadata;
      this.#status = "Frozen";
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...input.eventMetadata,
          eventType: "CarbonAccountingContextFrozen",
          aggregateId: this.id,
          payload: {
            organizationalBoundaryId: this.organizationalBoundaryId.value,
            operationalBoundaryId: this.operationalBoundaryId.value
          }
        })
      );
    }
    createSuccessor(input, metadata2) {
      validateCreateInput(input, metadata2);
      const reason = assertNonBlank(input.reason, "supersession reason");
      if (this.#status !== "Frozen" || input.versionNumber <= this.versionNumber || input.id.equals(this.id) || this.#ancestorIds.includes(input.id.value)) {
        throw new DomainError(
          "CARBON_BOUNDARY_SUPERSESSION_INVALID",
          "Context supersession must be directional, increasing, and acyclic from a frozen predecessor."
        );
      }
      return new _CarbonAccountingContext(
        input,
        metadata2,
        this.id,
        reason,
        [...this.#ancestorIds, this.id.value],
        {
          organizationalBoundaryId: this.organizationalBoundaryId,
          operationalBoundaryId: this.operationalBoundaryId
        }
      );
    }
    supersedeWith(successor, metadata2) {
      if (this.#status !== "Frozen" || successor.status !== "Effective" || !successor.supersedesId?.equals(this.id) || successor.versionNumber <= this.versionNumber || successor.supersessionReason === void 0 || successor.id.equals(this.id) || this.#ancestorIds.includes(successor.id.value)) {
        throw new DomainError(
          "CARBON_BOUNDARY_SUPERSESSION_INVALID",
          "A context may be superseded only by its effective, increasing, acyclic successor."
        );
      }
      this.#status = "Superseded";
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...metadata2,
          eventType: "CarbonAccountingContextSuperseded",
          aggregateId: this.id,
          payload: {
            successorContextId: successor.id.value,
            reason: successor.supersessionReason
          }
        })
      );
    }
    retire(reason, metadata2) {
      if (this.#status === "Retired") {
        throw this.invalidTransition("Retired");
      }
      const normalizedReason = assertNonBlank(reason, "retirement reason");
      const formerStatus = this.#status;
      this.#status = "Retired";
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...metadata2,
          eventType: "CarbonAccountingContextRetired",
          aggregateId: this.id,
          payload: { formerStatus, reason: normalizedReason }
        })
      );
    }
    assertBoundariesReady(input) {
      if (!input.organizationalBoundary.id.equals(this.organizationalBoundaryId) || !input.operationalBoundary.id.equals(this.operationalBoundaryId) || !input.organizationalBoundary.accountingContextId.equals(this.id) || !input.operationalBoundary.accountingContextId.equals(this.id)) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "Boundary identifiers and owning context references must match the context."
        );
      }
      if (!input.organizationalBoundary.effectivePeriod.contains(
        this.validityPeriod
      ) || !input.operationalBoundary.effectivePeriod.contains(this.validityPeriod)) {
        throw new DomainError(
          "CARBON_BOUNDARY_NOT_READY",
          "Both boundary effective periods must cover the context reporting period."
        );
      }
      input.organizationalBoundary.assertReady(input.boundaryDecisions);
      input.operationalBoundary.assertReady(input.boundaryDecisions);
    }
    assertExactlyOnePrimaryStandard() {
      const primaryCount = this.#accountingStandardReferences.filter(
        (standard) => standard.referenceRole === "Primary"
      ).length;
      if (primaryCount !== 1) {
        throw new DomainError(
          "CARBON_INV_3_04",
          "A reviewed, effective, or frozen context requires exactly one Primary standard.",
          { primaryCount }
        );
      }
    }
    assertContentMutable() {
      if (this.#status === "Frozen" || this.#status === "Superseded" || this.#status === "Retired") {
        throw new DomainError(
          "CARBON_INV_3_10",
          "A historical CarbonAccountingContext cannot be modified in place."
        );
      }
      if (this.#status !== "Draft") {
        throw this.invalidTransition("DraftContentChange");
      }
    }
    assertStatus(expected, target) {
      if (this.#status !== expected) {
        throw this.invalidTransition(target);
      }
    }
    invalidTransition(target) {
      return new DomainError(
        "CARBON_BOUNDARY_INVALID_TRANSITION",
        `CarbonAccountingContext cannot transition from ${this.#status} to ${target}.`
      );
    }
  };
  function validateCreateInput(input, metadata2) {
    if (!hasIdentifierKind6(input.reportingEntityVersionId, "ReportingEntityVersion")) {
      throw new DomainError(
        "CARBON_INV_3_01",
        "CarbonAccountingContext requires exactly one ReportingEntityVersion reference."
      );
    }
    if (!isReportingPeriod(input.reportingPeriod)) {
      throw new DomainError(
        "CARBON_INV_3_02",
        "CarbonAccountingContext requires exactly one valid ReportingPeriod."
      );
    }
    if (!hasIdentifierKind6(
      input.organizationalBoundaryId,
      "OrganizationalBoundary"
    ) || !hasIdentifierKind6(input.operationalBoundaryId, "OperationalBoundary")) {
      throw new DomainError(
        "CARBON_INV_3_03",
        "CarbonAccountingContext requires one reference to each boundary type."
      );
    }
    assertNonBlank(input.accountingPurpose, "accountingPurpose");
    assertPositiveVersion(input.versionNumber);
    if (!Array.isArray(input.accountingStandardReferences) || !input.accountingStandardReferences.every(
      (reference) => reference instanceof AccountingStandardReference
    )) {
      throw new DomainError(
        "CARBON_BOUNDARY_INVALID_VALUE",
        "Accounting-standard references must use approved typed values."
      );
    }
    for (let index = 0; index < input.accountingStandardReferences.length; index += 1) {
      const reference = input.accountingStandardReferences[index];
      if (reference !== void 0 && input.accountingStandardReferences.slice(0, index).some((candidate) => candidate.hasSameIdentity(reference))) {
        throw new DomainError(
          "CARBON_BOUNDARY_DUPLICATE",
          "Accounting-standard code and version already exist in this context."
        );
      }
    }
    if (!metadata2.contextCreated.actorId.equals(
      metadata2.reportingPeriodAssigned.actorId
    )) {
      throw new DomainError(
        "CARBON_BOUNDARY_INVALID_REFERENCE",
        "Context creation and reporting-period assignment must record the same Actor."
      );
    }
  }
  function hasIdentifierKind6(value, expectedKind) {
    return value instanceof Identifier && value.kind === expectedKind;
  }
  function isReportingPeriod(value) {
    return value instanceof ReportingPeriod;
  }
  function reportingPeriodValidity(period) {
    const start = /* @__PURE__ */ new Date(`${period.startDate}T00:00:00.000Z`);
    const endExclusive = /* @__PURE__ */ new Date(`${period.endDate}T00:00:00.000Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    return ValidityPeriod.create(start, endExclusive);
  }

  // packages/carbon-core/src/boundary-identifiers.ts
  var createCarbonAccountingContextId = (value) => Identifier.create("CarbonAccountingContext", value);
  var createOrganizationalBoundaryId = (value) => Identifier.create("OrganizationalBoundary", value);
  var createOperationalBoundaryId = (value) => Identifier.create("OperationalBoundary", value);
  var createCarbonDomainEventId = (value) => Identifier.create("CarbonDomainEvent", value);
  var createEvidenceReferenceId = (value) => Identifier.create("EvidenceReference", value);

  // packages/carbon-core/src/control-assessment.ts
  var ControlAssessment = class _ControlAssessment {
    assessmentType;
    assessmentOutcome;
    assessmentDate;
    evidenceReferenceIds;
    assessorActorId;
    constructor(input) {
      this.assessmentType = input.assessmentType;
      this.assessmentOutcome = input.assessmentOutcome;
      this.assessmentDate = input.assessmentDate;
      this.evidenceReferenceIds = freezeIdentifiers(input.evidenceReferenceIds);
      this.assessorActorId = input.assessorActorId;
      Object.freeze(this);
    }
    static create(input) {
      assertVocabularyValue(
        input.assessmentType,
        assessmentTypes,
        "assessmentType"
      );
      assertVocabularyValue(
        input.assessmentOutcome,
        assessmentOutcomes,
        "assessmentOutcome"
      );
      assertIsoDateOnly2(input.assessmentDate, "assessmentDate");
      return new _ControlAssessment(input);
    }
    get isDeterminate() {
      return this.assessmentOutcome !== "Indeterminate";
    }
  };

  // packages/carbon-core/src/organizational-boundary-entry.ts
  var OrganizationalBoundaryEntry = class _OrganizationalBoundaryEntry {
    subject;
    treatment;
    consolidationShare;
    controlAssessment;
    boundaryDecisionIds;
    effectivePeriod;
    constructor(input) {
      this.subject = input.subject;
      this.treatment = input.treatment;
      this.consolidationShare = input.consolidationShare;
      this.controlAssessment = input.controlAssessment;
      this.boundaryDecisionIds = freezeIdentifiers(input.boundaryDecisionIds);
      this.effectivePeriod = input.effectivePeriod;
      Object.freeze(this);
    }
    static create(input) {
      assertVocabularyValue(
        input.treatment,
        organizationalBoundaryTreatments,
        "organizational boundary treatment"
      );
      if ((input.treatment === "Excluded" || input.treatment === "PartiallyIncluded") && input.boundaryDecisionIds.length === 0) {
        throw new DomainError(
          "CARBON_INV_3_06",
          "Excluded and PartiallyIncluded entries require a formal BoundaryDecision."
        );
      }
      return new _OrganizationalBoundaryEntry(input);
    }
    get isPending() {
      return this.treatment === "PendingAssessment" || this.controlAssessment?.isDeterminate === false;
    }
  };

  // packages/carbon-core/src/organizational-boundary.ts
  var OrganizationalBoundary = class _OrganizationalBoundary {
    id;
    accountingContextId;
    consolidationApproach;
    versionNumber;
    effectivePeriod;
    supersedesId;
    supersessionReason;
    #freezingMetadata;
    #entries = [];
    #events = [];
    #ancestorIds;
    constructor(input, metadata2, supersedesId, supersessionReason, ancestorIds) {
      this.id = input.id;
      this.accountingContextId = input.accountingContextId;
      this.consolidationApproach = input.consolidationApproach;
      this.versionNumber = input.versionNumber;
      this.effectivePeriod = input.effectivePeriod;
      this.supersedesId = supersedesId;
      this.supersessionReason = supersessionReason;
      this.#ancestorIds = Object.freeze([...ancestorIds]);
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...metadata2,
          eventType: "OrganizationalBoundaryDefined",
          aggregateId: input.id,
          payload: {
            contextId: input.accountingContextId.value,
            versionNumber: input.versionNumber,
            consolidationApproach: input.consolidationApproach
          }
        })
      );
    }
    static create(input, metadata2) {
      validateCreateInput2(input);
      return new _OrganizationalBoundary(
        input,
        metadata2,
        void 0,
        void 0,
        []
      );
    }
    get entries() {
      return Object.freeze([...this.#entries]);
    }
    get events() {
      return Object.freeze([...this.#events]);
    }
    get isFrozen() {
      return this.#freezingMetadata !== void 0;
    }
    get freezingMetadata() {
      return this.#freezingMetadata;
    }
    get requiredDecisionIds() {
      const decisions = /* @__PURE__ */ new Map();
      for (const entry of this.#entries) {
        for (const id of entry.boundaryDecisionIds) {
          decisions.set(id.value, id);
        }
      }
      return Object.freeze([...decisions.values()]);
    }
    addEntry(entry, metadata2) {
      this.assertMutable();
      if (!this.effectivePeriod.contains(entry.effectivePeriod)) {
        throw new DomainError(
          "CARBON_BOUNDARY_CONFLICT",
          "An organizational entry effective period must fall within its boundary period."
        );
      }
      if (entry.subject.validityPeriod !== void 0 && !entry.subject.validityPeriod.contains(entry.effectivePeriod)) {
        throw new DomainError(
          "CARBON_BOUNDARY_CONFLICT",
          "An organizational entry effective period must fall within its subject validity."
        );
      }
      const conflictingEntry = this.#entries.find(
        (candidate) => candidate.subject.identityKey === entry.subject.identityKey && candidate.effectivePeriod.overlaps(entry.effectivePeriod)
      );
      if (conflictingEntry !== void 0) {
        throw new DomainError(
          "CARBON_INV_3_05",
          "The same organizational subject cannot have overlapping active treatments."
        );
      }
      this.assertConsolidationShare(entry);
      this.#entries.push(entry);
      this.recordChange("EntryAdded", metadata2);
    }
    assertReady(decisions) {
      if (this.#entries.length === 0) {
        throw new DomainError(
          "CARBON_BOUNDARY_NOT_READY",
          "An organizational boundary requires at least one entry."
        );
      }
      for (const entry of this.#entries) {
        if (entry.treatment === "PendingAssessment" || entry.isPending) {
          throw new DomainError(
            "CARBON_BOUNDARY_NOT_READY",
            "Organizational boundary assessments must be determinate."
          );
        }
        if ((entry.treatment === "Included" || entry.treatment === "PartiallyIncluded") && entry.controlAssessment === void 0) {
          throw new DomainError(
            "CARBON_BOUNDARY_NOT_READY",
            "Applicable organizational entries require a control assessment."
          );
        }
        this.assertDecisionsResolved(entry, decisions);
      }
    }
    freeze(metadata2, decisions, eventMetadata) {
      this.assertMutable();
      if (!metadata2.frozenByActorId.equals(eventMetadata.actorId)) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "The freezing Actor and event Actor must match."
        );
      }
      this.assertReady(decisions);
      this.#freezingMetadata = metadata2;
      this.recordChange("Frozen", eventMetadata);
    }
    createSuccessor(input, metadata2) {
      validateCreateInput2(input);
      const reason = assertNonBlank(input.reason, "supersession reason");
      if (!this.isFrozen || input.versionNumber <= this.versionNumber || input.id.equals(this.id) || this.#ancestorIds.includes(input.id.value)) {
        throw new DomainError(
          "CARBON_BOUNDARY_SUPERSESSION_INVALID",
          "OrganizationalBoundary supersession must be directional, increasing, and acyclic from a frozen predecessor."
        );
      }
      return new _OrganizationalBoundary(input, metadata2, this.id, reason, [
        ...this.#ancestorIds,
        this.id.value
      ]);
    }
    assertConsolidationShare(entry) {
      const share = entry.consolidationShare;
      const applicableTreatment = entry.treatment === "Included" || entry.treatment === "PartiallyIncluded";
      if (this.consolidationApproach === "EquityShare") {
        if (applicableTreatment) {
          if (share === void 0) {
            throw invalidConsolidationShare();
          }
          if (entry.treatment === "PartiallyIncluded" && !share.isPartial) {
            throw invalidConsolidationShare();
          }
        } else if (share !== void 0) {
          throw invalidConsolidationShare();
        }
        return;
      }
      if (this.consolidationApproach === "ApprovedHybrid") {
        if (entry.treatment === "PartiallyIncluded") {
          if (share === void 0 || !share.isPartial) {
            throw invalidConsolidationShare();
          }
          return;
        }
        if (share !== void 0) {
          throw invalidConsolidationShare();
        }
        return;
      }
      if (share !== void 0) {
        throw invalidConsolidationShare();
      }
    }
    assertDecisionsResolved(entry, decisions) {
      let hasRequiredCoverageDecision = entry.treatment !== "Excluded" && entry.treatment !== "PartiallyIncluded";
      for (const decisionId of entry.boundaryDecisionIds) {
        const decision = decisions.find(
          (candidate) => candidate.id.equals(decisionId)
        );
        if (decision === void 0) {
          throw new DomainError(
            "CARBON_BOUNDARY_DECISION_REQUIRED",
            "A referenced organizational BoundaryDecision has not been supplied.",
            { decisionId: decisionId.value }
          );
        }
        if (decision.subject.identityKey !== `OrganizationalSubject:${entry.subject.identityKey}`) {
          throw new DomainError(
            "CARBON_BOUNDARY_INVALID_REFERENCE",
            "A referenced decision must address the organizational entry subject."
          );
        }
        if (!decision.effectivePeriod.contains(entry.effectivePeriod)) {
          throw new DomainError(
            "CARBON_BOUNDARY_INVALID_REFERENCE",
            "A referenced decision effective period must cover the organizational entry period."
          );
        }
        if (decision.conflictsWithCoverageStatus(entry.treatment) || decision.conflictsWithConsolidationApproach(this.consolidationApproach)) {
          throw new DomainError(
            "CARBON_BOUNDARY_CONFLICT",
            "A referenced decision conclusion contradicts the organizational boundary state."
          );
        }
        hasRequiredCoverageDecision ||= decision.concludesCoverageStatus(
          entry.treatment
        );
      }
      if (!hasRequiredCoverageDecision) {
        throw new DomainError(
          "CARBON_BOUNDARY_DECISION_REQUIRED",
          "Excluded and PartiallyIncluded organizational treatments require a matching formal BoundaryDecision."
        );
      }
    }
    assertMutable() {
      if (this.isFrozen) {
        throw new DomainError(
          "CARBON_INV_3_10",
          "A frozen OrganizationalBoundary cannot be modified in place."
        );
      }
    }
    recordChange(changeType, metadata2) {
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...metadata2,
          eventType: "OrganizationalBoundaryChanged",
          aggregateId: this.id,
          payload: {
            contextId: this.accountingContextId.value,
            changeType
          }
        })
      );
    }
  };
  function validateCreateInput2(input) {
    assertPositiveVersion(input.versionNumber);
    assertVocabularyValue(
      input.consolidationApproach,
      consolidationApproaches,
      "consolidationApproach"
    );
  }
  function invalidConsolidationShare() {
    return new DomainError(
      "CARBON_INV_3_07",
      "Consolidation share is incompatible with the boundary approach or treatment."
    );
  }

  // packages/carbon-core/src/operational-coverage.ts
  var CarbonCategoryCoverage = class _CarbonCategoryCoverage {
    category;
    coverageStatus;
    requirementStatus;
    materialityStatus;
    description;
    boundaryDecisionIds;
    constructor(input) {
      this.category = input.category;
      this.coverageStatus = input.coverageStatus;
      this.requirementStatus = input.requirementStatus;
      this.materialityStatus = input.materialityStatus;
      this.description = normalizeCoverageDescription(
        input.coverageStatus,
        input.description
      );
      this.boundaryDecisionIds = freezeIdentifiers(input.boundaryDecisionIds);
      Object.freeze(this);
    }
    static create(input) {
      validateCoverageInput(input);
      assertVocabularyValue(
        input.materialityStatus,
        materialityStatuses,
        "materialityStatus"
      );
      if (input.coverageStatus === "NotApplicable") {
        if (input.requirementStatus !== "NotRequired" || input.materialityStatus !== "NotApplicable") {
          throw coverageConflict(
            "NotApplicable category coverage requires NotRequired and NotApplicable materiality."
          );
        }
      } else if (input.materialityStatus === "NotApplicable") {
        throw coverageConflict(
          "NotApplicable materiality requires NotApplicable category coverage."
        );
      }
      return new _CarbonCategoryCoverage(input);
    }
    get isReady() {
      return this.coverageStatus !== "PendingAssessment" && this.requirementStatus !== "Undetermined" && this.materialityStatus !== "NotAssessed";
    }
    assertDecisionsResolved(decisions, effectivePeriod) {
      assertDecisionReferences(
        this.boundaryDecisionIds,
        decisions,
        `Category:${this.category.toString()}`,
        this.coverageStatus,
        effectivePeriod,
        this.materialityStatus
      );
    }
  };
  var CarbonScopeCoverage = class _CarbonScopeCoverage {
    scope;
    coverageStatus;
    requirementStatus;
    description;
    boundaryDecisionIds;
    categories;
    constructor(input) {
      this.scope = input.scope;
      this.coverageStatus = input.coverageStatus;
      this.requirementStatus = input.requirementStatus;
      this.description = normalizeCoverageDescription(
        input.coverageStatus,
        input.description
      );
      this.boundaryDecisionIds = freezeIdentifiers(input.boundaryDecisionIds);
      this.categories = Object.freeze([...input.categories]);
      Object.freeze(this);
    }
    static create(input) {
      if (!scopeCodes.includes(input.scope)) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "Scope coverage must reference the Batch 2 scope ontology."
        );
      }
      validateCoverageInput(input);
      if (input.coverageStatus === "NotApplicable" && input.requirementStatus !== "NotRequired") {
        throw coverageConflict(
          "NotApplicable scope coverage requires NotRequired."
        );
      }
      const categoryKeys = /* @__PURE__ */ new Set();
      for (const category of input.categories) {
        if (category.category.scope !== input.scope) {
          throw new DomainError(
            "CARBON_INV_3_09",
            "Category coverage must match its Batch 2 parent scope."
          );
        }
        const key = category.category.toString();
        if (categoryKeys.has(key)) {
          throw new DomainError(
            "CARBON_INV_3_08",
            "A scope cannot contain duplicate category coverage."
          );
        }
        categoryKeys.add(key);
        if (input.coverageStatus === "Excluded" && category.coverageStatus !== "Excluded" && category.coverageStatus !== "NotApplicable") {
          throw coverageConflict(
            "An Excluded scope can contain only Excluded or NotApplicable categories."
          );
        }
        if (input.coverageStatus === "NotApplicable" && category.coverageStatus !== "NotApplicable") {
          throw coverageConflict(
            "A NotApplicable scope can contain only NotApplicable categories."
          );
        }
      }
      return new _CarbonScopeCoverage(input);
    }
    get isReady() {
      return this.coverageStatus !== "PendingAssessment" && this.requirementStatus !== "Undetermined" && this.categories.every((category) => category.isReady);
    }
    assertDecisionsResolved(decisions, effectivePeriod) {
      assertDecisionReferences(
        this.boundaryDecisionIds,
        decisions,
        `Scope:${this.scope}`,
        this.coverageStatus,
        effectivePeriod
      );
      for (const category of this.categories) {
        category.assertDecisionsResolved(decisions, effectivePeriod);
      }
    }
  };
  function validateCoverageInput(input) {
    assertVocabularyValue(
      input.coverageStatus,
      coverageStatuses,
      "coverageStatus"
    );
    assertVocabularyValue(
      input.requirementStatus,
      requirementStatuses,
      "requirementStatus"
    );
    if ((input.coverageStatus === "Excluded" || input.coverageStatus === "PartiallyIncluded") && input.boundaryDecisionIds.length === 0) {
      throw new DomainError(
        "CARBON_INV_3_06",
        "Excluded and PartiallyIncluded coverage requires a formal BoundaryDecision."
      );
    }
    normalizeCoverageDescription(input.coverageStatus, input.description);
  }
  function normalizeCoverageDescription(status, description) {
    if (status === "PartiallyIncluded") {
      return assertNonBlank(description ?? "", "partial coverage description");
    }
    return description === void 0 ? void 0 : assertNonBlank(description, "coverage description");
  }
  function assertDecisionReferences(ids, decisions, subjectKey, coverageStatus, effectivePeriod, materialityStatus) {
    let hasRequiredCoverageDecision = coverageStatus !== "Excluded" && coverageStatus !== "PartiallyIncluded";
    for (const id of ids) {
      const decision = decisions.find((candidate) => candidate.id.equals(id));
      if (decision === void 0) {
        throw new DomainError(
          "CARBON_BOUNDARY_DECISION_REQUIRED",
          "A referenced operational BoundaryDecision has not been supplied.",
          { decisionId: id.value }
        );
      }
      if (decision.subject.identityKey !== subjectKey) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "A referenced decision must address the scope or category coverage subject."
        );
      }
      if (!decision.effectivePeriod.contains(effectivePeriod)) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "A referenced decision effective period must cover the operational boundary period."
        );
      }
      if (decision.conflictsWithCoverageStatus(coverageStatus) || materialityStatus !== void 0 && decision.conflictsWithMaterialityStatus(materialityStatus)) {
        throw new DomainError(
          "CARBON_BOUNDARY_CONFLICT",
          "A referenced decision conclusion contradicts the operational coverage state."
        );
      }
      hasRequiredCoverageDecision ||= decision.concludesCoverageStatus(coverageStatus);
    }
    if (!hasRequiredCoverageDecision) {
      throw new DomainError(
        "CARBON_BOUNDARY_DECISION_REQUIRED",
        "Excluded and PartiallyIncluded operational coverage requires a matching formal BoundaryDecision."
      );
    }
  }
  function coverageConflict(message) {
    return new DomainError("CARBON_BOUNDARY_CONFLICT", message);
  }

  // packages/carbon-core/src/operational-boundary.ts
  var OperationalBoundary = class _OperationalBoundary {
    id;
    accountingContextId;
    versionNumber;
    effectivePeriod;
    supersedesId;
    supersessionReason;
    #freezingMetadata;
    #scopeCoverages = [];
    #events = [];
    #ancestorIds;
    constructor(input, metadata2, supersedesId, supersessionReason, ancestorIds) {
      this.id = input.id;
      this.accountingContextId = input.accountingContextId;
      this.versionNumber = input.versionNumber;
      this.effectivePeriod = input.effectivePeriod;
      this.supersedesId = supersedesId;
      this.supersessionReason = supersessionReason;
      this.#ancestorIds = Object.freeze([...ancestorIds]);
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...metadata2,
          eventType: "OperationalBoundaryDefined",
          aggregateId: input.id,
          payload: {
            contextId: input.accountingContextId.value,
            versionNumber: input.versionNumber
          }
        })
      );
    }
    static create(input, metadata2) {
      assertPositiveVersion(input.versionNumber);
      return new _OperationalBoundary(input, metadata2, void 0, void 0, []);
    }
    get scopeCoverages() {
      return Object.freeze([...this.#scopeCoverages]);
    }
    get events() {
      return Object.freeze([...this.#events]);
    }
    get isFrozen() {
      return this.#freezingMetadata !== void 0;
    }
    get freezingMetadata() {
      return this.#freezingMetadata;
    }
    get requiredDecisionIds() {
      const decisions = /* @__PURE__ */ new Map();
      for (const coverage of this.#scopeCoverages) {
        for (const id of coverage.boundaryDecisionIds) {
          decisions.set(id.value, id);
        }
        for (const category of coverage.categories) {
          for (const id of category.boundaryDecisionIds) {
            decisions.set(id.value, id);
          }
        }
      }
      return Object.freeze([...decisions.values()]);
    }
    addScopeCoverage(coverage, metadata2) {
      this.assertMutable();
      if (this.#scopeCoverages.some(
        (candidate) => candidate.scope === coverage.scope
      )) {
        throw new DomainError(
          "CARBON_BOUNDARY_DUPLICATE",
          "OperationalBoundary cannot contain duplicate active scope coverage."
        );
      }
      this.#scopeCoverages.push(coverage);
      this.recordChange("ScopeCoverageAdded", metadata2);
    }
    assertReady(decisions) {
      const presentScopes = new Set(
        this.#scopeCoverages.map((coverage) => coverage.scope)
      );
      if (scopeCodes.some((scope) => !presentScopes.has(scope)) || presentScopes.size !== scopeCodes.length) {
        throw new DomainError(
          "CARBON_BOUNDARY_NOT_READY",
          "OperationalBoundary requires exactly one coverage for each Batch 2 scope."
        );
      }
      for (const coverage of this.#scopeCoverages) {
        if (!coverage.isReady) {
          throw new DomainError(
            "CARBON_BOUNDARY_NOT_READY",
            "Operational scope and category assessments must be complete."
          );
        }
        coverage.assertDecisionsResolved(decisions, this.effectivePeriod);
      }
    }
    freeze(metadata2, decisions, eventMetadata) {
      this.assertMutable();
      if (!metadata2.frozenByActorId.equals(eventMetadata.actorId)) {
        throw new DomainError(
          "CARBON_BOUNDARY_INVALID_REFERENCE",
          "The freezing Actor and event Actor must match."
        );
      }
      this.assertReady(decisions);
      this.#freezingMetadata = metadata2;
      this.recordChange("Frozen", eventMetadata);
    }
    createSuccessor(input, metadata2) {
      assertPositiveVersion(input.versionNumber);
      const reason = assertNonBlank(input.reason, "supersession reason");
      if (!this.isFrozen || input.versionNumber <= this.versionNumber || input.id.equals(this.id) || this.#ancestorIds.includes(input.id.value)) {
        throw new DomainError(
          "CARBON_BOUNDARY_SUPERSESSION_INVALID",
          "OperationalBoundary supersession must be directional, increasing, and acyclic from a frozen predecessor."
        );
      }
      return new _OperationalBoundary(input, metadata2, this.id, reason, [
        ...this.#ancestorIds,
        this.id.value
      ]);
    }
    assertMutable() {
      if (this.isFrozen) {
        throw new DomainError(
          "CARBON_INV_3_10",
          "A frozen OperationalBoundary cannot be modified in place."
        );
      }
    }
    recordChange(changeType, metadata2) {
      this.#events.push(
        CarbonBoundaryEvent.create({
          ...metadata2,
          eventType: "OperationalBoundaryChanged",
          aggregateId: this.id,
          payload: {
            contextId: this.accountingContextId.value,
            changeType
          }
        })
      );
    }
  };

  // packages/simulation-core/src/teaching-v080-carbon-adapter.ts
  var CoreActualReductionSnapshotV080 = class _CoreActualReductionSnapshotV080 {
    constructor(provenance, coreSourceReference, reductionOutcomeId, direction, disposition, outcomeMagnitude, enterpriseActualReduction, reference) {
      this.provenance = provenance;
      this.coreSourceReference = coreSourceReference;
      this.reductionOutcomeId = reductionOutcomeId;
      this.direction = direction;
      this.disposition = disposition;
      this.outcomeMagnitude = outcomeMagnitude;
      this.enterpriseActualReduction = enterpriseActualReduction;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static from(input) {
      if (!(input.outcome instanceof ReductionOutcomeAggregate))
        throw simulationInvalid(
          "Wave 2 Actual Reduction requires a genuine Carbon Core ReductionOutcomeAggregate."
        );
      const result = input.outcome.result;
      if (result === void 0)
        throw simulationInvalid(
          "Wave 2 Actual Reduction requires a finalized Carbon Core reduction outcome.",
          { reductionOutcomeId: input.outcome.id.value }
        );
      const payload = Object.freeze({
        provenance: "CORE_FACT",
        coreSourceReference: nonBlank(
          input.coreSourceReference,
          "coreSourceReference"
        ),
        reductionOutcomeId: input.outcome.id.value,
        direction: result.direction,
        disposition: result.disposition,
        outcomeMagnitude: quantitySnapshot(result.magnitude),
        enterpriseActualReduction: result.totalActualReduction === void 0 ? void 0 : quantitySnapshot(result.totalActualReduction)
      });
      return new _CoreActualReductionSnapshotV080(
        payload.provenance,
        payload.coreSourceReference,
        payload.reductionOutcomeId,
        payload.direction,
        payload.disposition,
        payload.outcomeMagnitude,
        payload.enterpriseActualReduction,
        `core-reduction-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var CoreProductCarbonSnapshotV080 = class _CoreProductCarbonSnapshotV080 {
    constructor(provenance, coreSourceReference, results, reference) {
      this.provenance = provenance;
      this.coreSourceReference = coreSourceReference;
      this.results = results;
      this.reference = reference;
      Object.freeze(this.results);
      Object.freeze(this);
    }
    #nominal = true;
    static from(input) {
      if (input.results.length === 0)
        throw simulationInvalid(
          "Wave 2 product-carbon adapter requires at least one governed ProductCarbonResult; missing is not zero."
        );
      const results = input.results.map((result) => {
        if (!(result instanceof ProductCarbonResult))
          throw simulationInvalid(
            "Wave 2 product carbon requires genuine Carbon Core ProductCarbonResult objects."
          );
        result.assertGenuine();
        return Object.freeze({
          productCarbonResultId: result.id.value,
          productSubject: result.productSubject,
          allocatedCarbonTotal: quantitySnapshot(result.allocatedCarbonTotal),
          producedQuantity: result.producedQuantity,
          perUnitCarbonQuantity: quantitySnapshot(result.perUnitCarbonQuantity)
        });
      });
      const productSubjects = new Set(
        results.map((result) => result.productSubject)
      );
      if (productSubjects.size !== results.length)
        throw simulationInvalid(
          "Wave 2 product-carbon snapshot requires unique product subjects."
        );
      const payload = Object.freeze({
        provenance: "CORE_FACT",
        coreSourceReference: nonBlank(
          input.coreSourceReference,
          "coreSourceReference"
        ),
        results: Object.freeze(results)
      });
      return new _CoreProductCarbonSnapshotV080(
        payload.provenance,
        payload.coreSourceReference,
        payload.results,
        `core-product-carbon-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var CoreOffsetPositionSnapshotV080 = class _CoreOffsetPositionSnapshotV080 {
    constructor(provenance, coreSourceReference, offsetSettlementId, disposition, operatingCarbonNetAfter, availableOffsetResources, closingBalance, reference) {
      this.provenance = provenance;
      this.coreSourceReference = coreSourceReference;
      this.offsetSettlementId = offsetSettlementId;
      this.disposition = disposition;
      this.operatingCarbonNetAfter = operatingCarbonNetAfter;
      this.availableOffsetResources = availableOffsetResources;
      this.closingBalance = closingBalance;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static from(input) {
      if (!(input.settlement instanceof OffsetSettlementAggregate))
        throw simulationInvalid(
          "Wave 2 carbon position requires a genuine Carbon Core OffsetSettlementAggregate."
        );
      input.settlement.requirement.assertGenuine();
      const result = input.settlement.result;
      if (result === void 0)
        throw simulationInvalid(
          "Wave 2 carbon position requires a finalized Carbon Core offset settlement.",
          { offsetSettlementId: input.settlement.id.value }
        );
      const payload = Object.freeze({
        provenance: "CORE_FACT",
        coreSourceReference: nonBlank(
          input.coreSourceReference,
          "coreSourceReference"
        ),
        offsetSettlementId: input.settlement.id.value,
        disposition: result.disposition,
        operatingCarbonNetAfter: quantitySnapshot(
          input.settlement.requirement.operatingCarbonNetAfter
        ),
        availableOffsetResources: quantitySnapshot(
          result.availableOffsetResources
        ),
        closingBalance: Object.freeze({
          sign: result.closingBalance.sign,
          value: result.closingBalance.value,
          magnitude: quantitySnapshot(result.closingBalance.magnitude)
        })
      });
      return new _CoreOffsetPositionSnapshotV080(
        payload.provenance,
        payload.coreSourceReference,
        payload.offsetSettlementId,
        payload.disposition,
        payload.operatingCarbonNetAfter,
        payload.availableOffsetResources,
        payload.closingBalance,
        `core-offset-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var CarbonTruthStateV080 = class _CarbonTruthStateV080 {
    constructor(reduction, productCarbon, offset, reference) {
      this.reduction = reduction;
      this.productCarbon = productCarbon;
      this.offset = offset;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static compose(input) {
      if (input.reduction !== void 0) {
        if (!(input.reduction instanceof CoreActualReductionSnapshotV080))
          throw invalidAdapterSnapshot();
        input.reduction.assertGenuine();
      }
      if (input.productCarbon !== void 0) {
        if (!(input.productCarbon instanceof CoreProductCarbonSnapshotV080))
          throw invalidAdapterSnapshot();
        input.productCarbon.assertGenuine();
      }
      if (input.offset !== void 0) {
        if (!(input.offset instanceof CoreOffsetPositionSnapshotV080))
          throw invalidAdapterSnapshot();
        input.offset.assertGenuine();
      }
      const payload = Object.freeze({
        reduction: input.reduction,
        productCarbon: input.productCarbon,
        offset: input.offset
      });
      return new _CarbonTruthStateV080(
        payload.reduction,
        payload.productCarbon,
        payload.offset,
        `carbon-truth-view-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function adaptReductionOutcomeV080(input) {
    return CoreActualReductionSnapshotV080.from(input);
  }
  function adaptProductCarbonResultsV080(input) {
    return CoreProductCarbonSnapshotV080.from(input);
  }
  function adaptOffsetSettlementV080(input) {
    return CoreOffsetPositionSnapshotV080.from(input);
  }
  function createCarbonTruthStateV080(input) {
    return CarbonTruthStateV080.compose(input);
  }
  function invalidAdapterSnapshot() {
    return simulationInvalid(
      "CarbonTruthStateV080 accepts only snapshots issued by the Wave 2 Carbon Core adapter."
    );
  }
  function quantitySnapshot(input) {
    return Object.freeze({
      value: input.value,
      unit: input.unit,
      gasBasis: input.gasBasis
    });
  }

  // packages/simulation-core/src/teaching-v080-communication.ts
  var teachingV080CommunicationChannels = [
    "FORMAL_REPORT",
    "CSR_REPORT",
    "WEBSITE",
    "PRESS_CONFERENCE",
    "DIRECT_GREEN_CUSTOMER"
  ];
  var teachingV080CommunicationTimings = [
    "SCHEDULED",
    "IMMEDIATE",
    "BEFORE_GREEN_ORDER",
    "AFTER_MAJOR_CARBON_ACTION"
  ];
  var teachingV080EvidenceLevels = [
    "BASIC",
    "VERIFIED",
    "ASSURED"
  ];
  var teachingV080CommunicationIntensities = [
    "LOW",
    "STANDARD",
    "ACTIVE"
  ];
  var CommunicationDecisionV080 = class _CommunicationDecisionV080 {
    constructor(provenance, decisionReference, selectedClaimTypes, channel, timing, evidenceLevel, intensity, reference) {
      this.provenance = provenance;
      this.decisionReference = decisionReference;
      this.selectedClaimTypes = selectedClaimTypes;
      this.channel = channel;
      this.timing = timing;
      this.evidenceLevel = evidenceLevel;
      this.intensity = intensity;
      this.reference = reference;
      Object.freeze(this.selectedClaimTypes);
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      if (input.selectedClaimTypes.length === 0)
        throw simulationInvalid(
          "Communication decision requires at least one WHAT claim type."
        );
      for (const claimType of input.selectedClaimTypes)
        if (!disclosureClaimTypes.includes(claimType))
          throw simulationInvalid("Unknown disclosure claim type.");
      if (!teachingV080CommunicationChannels.includes(input.channel))
        throw simulationInvalid("Unknown communication channel.");
      if (!teachingV080CommunicationTimings.includes(input.timing))
        throw simulationInvalid("Unknown communication timing.");
      if (!teachingV080EvidenceLevels.includes(input.evidenceLevel))
        throw simulationInvalid("Unknown communication evidence level.");
      if (!teachingV080CommunicationIntensities.includes(input.intensity))
        throw simulationInvalid("Unknown communication intensity.");
      const selectedClaimTypes = Object.freeze([
        ...new Set(input.selectedClaimTypes)
      ]);
      const payload = Object.freeze({
        provenance: "PLAYER_DECISION",
        decisionReference: nonBlank(input.decisionReference, "decisionReference"),
        selectedClaimTypes,
        channel: input.channel,
        timing: input.timing,
        evidenceLevel: input.evidenceLevel,
        intensity: input.intensity
      });
      return new _CommunicationDecisionV080(
        payload.provenance,
        payload.decisionReference,
        payload.selectedClaimTypes,
        payload.channel,
        payload.timing,
        payload.evidenceLevel,
        payload.intensity,
        `communication-decision-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ClaimSupportAssessmentV080 = class _ClaimSupportAssessmentV080 {
    constructor(provenance, assertionId, assertionType, status, authoritativeFactReference, authoritativeValue, assertedValue, productSubject, reference) {
      this.provenance = provenance;
      this.assertionId = assertionId;
      this.assertionType = assertionType;
      this.status = status;
      this.authoritativeFactReference = authoritativeFactReference;
      this.authoritativeValue = authoritativeValue;
      this.assertedValue = assertedValue;
      this.productSubject = productSubject;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static issue(input) {
      const payload = Object.freeze({
        provenance: "SIMULATION_OUTCOME",
        ...input
      });
      return new _ClaimSupportAssessmentV080(
        payload.provenance,
        payload.assertionId,
        payload.assertionType,
        payload.status,
        payload.authoritativeFactReference,
        payload.authoritativeValue,
        payload.assertedValue,
        payload.productSubject,
        `claim-support-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var CoreCommunicationEvidenceV080 = class _CoreCommunicationEvidenceV080 {
    constructor(provenance, coreSourceReference, disclosureVersionId, publicationReference, verificationReference, claimTypes, reference) {
      this.provenance = provenance;
      this.coreSourceReference = coreSourceReference;
      this.disclosureVersionId = disclosureVersionId;
      this.publicationReference = publicationReference;
      this.verificationReference = verificationReference;
      this.claimTypes = claimTypes;
      this.reference = reference;
      Object.freeze(this.claimTypes);
      Object.freeze(this);
    }
    #nominal = true;
    static from(input) {
      if (!(input.publication instanceof PublicationSnapshot))
        throw simulationInvalid(
          "Core communication evidence requires a genuine PublicationSnapshot."
        );
      if (!(input.verification instanceof VerificationSnapshot))
        throw simulationInvalid(
          "Core communication evidence requires a genuine VerificationSnapshot."
        );
      input.publication.assertGenuine();
      input.verification.assertGenuine();
      if (input.publication.disclosureVersionId !== input.verification.disclosureVersionId || input.verification.overallResult !== "VERIFIED")
        throw simulationInvalid(
          "Core communication evidence must bind one VERIFIED disclosure version."
        );
      const payload = Object.freeze({
        provenance: "CORE_FACT",
        coreSourceReference: nonBlank(
          input.coreSourceReference,
          "coreSourceReference"
        ),
        disclosureVersionId: input.publication.disclosureVersionId,
        publicationReference: input.publication.publicationReference,
        verificationReference: nonBlank(
          input.verification.verifierReference,
          "verificationReference"
        ),
        claimTypes: Object.freeze([...input.publication.claimTypes])
      });
      return new _CoreCommunicationEvidenceV080(
        payload.provenance,
        payload.coreSourceReference,
        payload.disclosureVersionId,
        payload.publicationReference,
        payload.verificationReference,
        payload.claimTypes,
        `core-communication-evidence-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var CommunicationStateV080 = class _CommunicationStateV080 {
    constructor(provenance, awareness, trust, reputation, greenMarketAccess, disclosureCredibility, latentDisclosureRisk, governanceViolation, reference) {
      this.provenance = provenance;
      this.awareness = awareness;
      this.trust = trust;
      this.reputation = reputation;
      this.greenMarketAccess = greenMarketAccess;
      this.disclosureCredibility = disclosureCredibility;
      this.latentDisclosureRisk = latentDisclosureRisk;
      this.governanceViolation = governanceViolation;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      const payload = Object.freeze({
        provenance: "SIMULATION_OUTCOME",
        awareness: unitInterval(input.awareness, "awareness"),
        trust: unitInterval(input.trust, "trust"),
        reputation: unitInterval(input.reputation, "reputation"),
        greenMarketAccess: unitInterval(
          input.greenMarketAccess,
          "greenMarketAccess"
        ),
        disclosureCredibility: unitInterval(
          input.disclosureCredibility ?? 0,
          "disclosureCredibility"
        ),
        latentDisclosureRisk: unitInterval(
          input.latentDisclosureRisk ?? 0,
          "latentDisclosureRisk"
        ),
        governanceViolation: input.governanceViolation ?? false
      });
      return new _CommunicationStateV080(
        payload.provenance,
        payload.awareness,
        payload.trust,
        payload.reputation,
        payload.greenMarketAccess,
        payload.disclosureCredibility,
        payload.latentDisclosureRisk,
        payload.governanceViolation,
        `communication-state-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var CommunicationResolutionV080 = class _CommunicationResolutionV080 {
    constructor(provenance, decision, state, communicationCost, claimAssessments, coreEvidenceReference, reference) {
      this.provenance = provenance;
      this.decision = decision;
      this.state = state;
      this.communicationCost = communicationCost;
      this.claimAssessments = claimAssessments;
      this.coreEvidenceReference = coreEvidenceReference;
      this.reference = reference;
      Object.freeze(this.claimAssessments);
      Object.freeze(this);
    }
    #nominal = true;
    static issue(input) {
      const payload = Object.freeze({
        provenance: "SIMULATION_OUTCOME",
        ...input,
        claimAssessments: Object.freeze([...input.claimAssessments])
      });
      return new _CommunicationResolutionV080(
        payload.provenance,
        payload.decision,
        payload.state,
        payload.communicationCost,
        payload.claimAssessments,
        payload.coreEvidenceReference,
        `communication-resolution-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function createCommunicationDecisionV080(input) {
    return CommunicationDecisionV080.create(input);
  }
  function assessPromotionalAssertionV080(input) {
    requireCarbonTruth(input.carbonTruth);
    const assertionId = nonBlank(input.assertion.assertionId, "assertionId");
    const assertedValue = input.assertion.assertionType === "OFFSET" ? normalizeSignedDecimal(input.assertion.assertedValue, "assertedValue") : normalizeUnsignedDecimal(
      input.assertion.assertedValue,
      "assertedValue"
    );
    let authoritativeValue;
    let authoritativeFactReference;
    let productSubject;
    switch (input.assertion.assertionType) {
      case "ACTUAL_REDUCTION":
        authoritativeValue = input.carbonTruth.reduction?.enterpriseActualReduction?.value;
        authoritativeFactReference = input.carbonTruth.reduction?.reference;
        break;
      case "PRODUCT_CARBON": {
        productSubject = nonBlank(
          input.assertion.productSubject ?? "",
          "productSubject"
        );
        const item = input.carbonTruth.productCarbon?.results.find(
          (candidate) => candidate.productSubject === productSubject
        );
        authoritativeValue = item?.perUnitCarbonQuantity.value;
        authoritativeFactReference = item?.productCarbonResultId;
        break;
      }
      case "OFFSET":
        authoritativeValue = input.carbonTruth.offset?.closingBalance.value;
        authoritativeFactReference = input.carbonTruth.offset?.reference;
        break;
      case "CARBON_NEUTRALITY":
        break;
    }
    const status = authoritativeValue === void 0 ? "AMBIGUOUS" : compareDecimal(assertedValue, authoritativeValue) === 0 ? "SUPPORTED" : "FLAGGED";
    return ClaimSupportAssessmentV080.issue({
      assertionId,
      assertionType: input.assertion.assertionType,
      status,
      authoritativeFactReference,
      authoritativeValue,
      assertedValue,
      productSubject
    });
  }
  function createCommunicationStateV080(input) {
    return CommunicationStateV080.create(input);
  }
  function resolveCommunicationV080(input) {
    requireCommunicationState(input.opening);
    if (!(input.decision instanceof CommunicationDecisionV080))
      throw simulationInvalid("Communication decision was structurally forged.");
    input.decision.assertGenuine();
    if (input.opening.governanceViolation)
      throw simulationInvalid(
        "A prior confirmed violation must be resolved through R7 consequence handling."
      );
    const scrutiny = unitInterval(input.scrutinyIntensity, "scrutinyIntensity");
    if (input.claimAssessments.length === 0 && input.coreEvidence === void 0)
      throw simulationInvalid(
        "Communication requires claim assessment or genuine Core communication evidence."
      );
    for (const assessment of input.claimAssessments) {
      if (!(assessment instanceof ClaimSupportAssessmentV080))
        throw simulationInvalid(
          "Communication claim assessment was structurally forged."
        );
      assessment.assertGenuine();
      const mappedClaimType = mappedDisclosureClaimType(assessment.assertionType);
      if (!input.decision.selectedClaimTypes.includes(mappedClaimType))
        throw simulationInvalid(
          "Claim assessment does not match the selected WHAT disclosure content."
        );
    }
    if (input.coreEvidence !== void 0) {
      if (!(input.coreEvidence instanceof CoreCommunicationEvidenceV080))
        throw simulationInvalid(
          "Communication Core evidence was structurally forged."
        );
      input.coreEvidence.assertGenuine();
      for (const claimType of input.coreEvidence.claimTypes)
        if (!input.decision.selectedClaimTypes.includes(claimType))
          throw simulationInvalid(
            "Core evidence contains a claim type outside the selected WHAT disclosure content."
          );
    }
    assertDecisionCoverage(
      input.decision,
      input.claimAssessments,
      input.coreEvidence
    );
    validateEconomicParameters(input.parameters);
    const flagged = input.claimAssessments.filter(
      (item) => item.status === "FLAGGED"
    ).length;
    const ambiguous = input.claimAssessments.filter(
      (item) => item.status === "AMBIGUOUS"
    ).length;
    const supported = input.claimAssessments.filter(
      (item) => item.status === "SUPPORTED"
    ).length;
    const allAssessedSupported = input.claimAssessments.length === 0 || supported === input.claimAssessments.length;
    const supportStatus = flagged > 0 ? "FLAGGED" : ambiguous > 0 ? "AMBIGUOUS" : "SUPPORTED";
    const evidenceCredibility = unitInterval(
      input.parameters.evidenceCredibility[input.decision.evidenceLevel],
      `evidenceCredibility.${input.decision.evidenceLevel}`
    );
    const claimCredibilityFactor = unitInterval(
      input.parameters.claimCredibilityFactor[supportStatus],
      `claimCredibilityFactor.${supportStatus}`
    );
    const disclosureCredibility = clamp01(
      evidenceCredibility * claimCredibilityFactor
    );
    const reach = unitInterval(
      input.parameters.reach[input.decision.intensity],
      `reach.${input.decision.intensity}`
    );
    const awarenessGain = reach * (1 - input.opening.awareness);
    const awareness = clamp01(input.opening.awareness + awarenessGain);
    const supportedForTrust = allAssessedSupported;
    const trustGain = supportedForTrust ? input.parameters.supportedTrustGain * disclosureCredibility * (1 - input.opening.trust) : 0;
    const trust = clamp01(input.opening.trust + trustGain);
    const reputationGain = supportedForTrust ? input.parameters.supportedReputationGain * disclosureCredibility * awarenessGain * (1 - input.opening.reputation) : 0;
    const reputation = clamp01(input.opening.reputation + reputationGain);
    const marketAccessGain = input.parameters.marketAccessGain * Math.min(trust, reputation) * disclosureCredibility * (1 - input.opening.greenMarketAccess);
    const greenMarketAccess = clamp01(
      input.opening.greenMarketAccess + marketAccessGain
    );
    const riskExposure = unitInterval(
      input.parameters.riskExposure[input.decision.intensity],
      `riskExposure.${input.decision.intensity}`
    );
    const latentRiskGain = (flagged * input.parameters.flaggedRiskGain + ambiguous * input.parameters.ambiguousRiskGain) * riskExposure * (1 + scrutiny);
    const latentDisclosureRisk = clamp01(
      input.opening.latentDisclosureRisk + latentRiskGain
    );
    const communicationCost = input.parameters.channelCost[input.decision.channel] + input.parameters.evidenceCost[input.decision.evidenceLevel] + input.parameters.intensityCost[input.decision.intensity] + input.parameters.timingCost[input.decision.timing];
    const state = createCommunicationStateV080({
      awareness,
      trust,
      reputation,
      greenMarketAccess,
      disclosureCredibility,
      latentDisclosureRisk,
      governanceViolation: false
    });
    return CommunicationResolutionV080.issue({
      decision: input.decision,
      state,
      communicationCost,
      claimAssessments: input.claimAssessments,
      coreEvidenceReference: input.coreEvidence?.reference
    });
  }
  function resolveVerificationConsequenceV080(input) {
    if (!(input.communication instanceof CommunicationResolutionV080))
      throw simulationInvalid(
        "Verification requires a genuine CommunicationResolutionV080."
      );
    input.communication.assertGenuine();
    const verificationCost = nonNegativeFinite(
      input.verificationCost,
      "verificationCost"
    );
    const trustLoss = unitInterval(input.trustLoss, "trustLoss");
    const reputationLoss = unitInterval(input.reputationLoss, "reputationLoss");
    const marketAccessLoss = unitInterval(
      input.marketAccessLoss,
      "marketAccessLoss"
    );
    const hasUnresolvedRisk = input.communication.claimAssessments.some(
      (assessment) => assessment.status === "FLAGGED" || assessment.status === "AMBIGUOUS"
    );
    if (input.finding === "CONFIRMED_VIOLATION" && !hasUnresolvedRisk)
      throw simulationInvalid(
        "A confirmed violation cannot be manufactured from a fully supported communication record."
      );
    const opening = input.communication.state;
    const closingState = resolveVerificationState(
      opening,
      input.finding,
      trustLoss,
      reputationLoss,
      marketAccessLoss
    );
    const payload = Object.freeze({
      provenance: "SIMULATION_OUTCOME",
      finding: input.finding,
      openingStateReference: opening.reference,
      closingState,
      verificationCost,
      confirmedGovernanceViolation: input.finding === "CONFIRMED_VIOLATION"
    });
    return Object.freeze({
      ...payload,
      reference: `verification-consequence-v080:${deterministicSha256(payload)}`
    });
  }
  function resolveVerificationFindingV080(communication) {
    if (!(communication instanceof CommunicationResolutionV080))
      throw simulationInvalid(
        "Verification finding requires a genuine CommunicationResolutionV080."
      );
    communication.assertGenuine();
    if (communication.claimAssessments.length === 0)
      throw simulationInvalid(
        "Verification finding requires at least one genuinely assessed relevant claim."
      );
    if (communication.claimAssessments.some(
      (assessment) => assessment.status === "FLAGGED"
    ))
      return "CONFIRMED_VIOLATION";
    if (communication.claimAssessments.some(
      (assessment) => assessment.status === "AMBIGUOUS"
    ))
      return "INCONCLUSIVE";
    return "CLEARED";
  }
  function resolveVerificationState(opening, finding, trustLoss, reputationLoss, marketAccessLoss) {
    if (finding === "CONFIRMED_VIOLATION")
      return createCommunicationStateV080({
        awareness: opening.awareness,
        trust: clamp01(opening.trust * (1 - trustLoss)),
        reputation: clamp01(opening.reputation * (1 - reputationLoss)),
        greenMarketAccess: clamp01(
          opening.greenMarketAccess * (1 - marketAccessLoss)
        ),
        disclosureCredibility: 0,
        latentDisclosureRisk: 0,
        governanceViolation: true
      });
    if (finding === "CLEARED")
      return createCommunicationStateV080({
        awareness: opening.awareness,
        trust: opening.trust,
        reputation: opening.reputation,
        greenMarketAccess: opening.greenMarketAccess,
        disclosureCredibility: opening.disclosureCredibility,
        latentDisclosureRisk: 0,
        governanceViolation: false
      });
    return createCommunicationStateV080({
      awareness: opening.awareness,
      trust: opening.trust,
      reputation: opening.reputation,
      greenMarketAccess: opening.greenMarketAccess,
      disclosureCredibility: opening.disclosureCredibility,
      latentDisclosureRisk: opening.latentDisclosureRisk,
      governanceViolation: false
    });
  }
  function assertDecisionCoverage(decision, assessments, coreEvidence) {
    const covered = /* @__PURE__ */ new Set();
    for (const assessment of assessments)
      covered.add(mappedDisclosureClaimType(assessment.assertionType));
    if (coreEvidence !== void 0)
      for (const claimType of coreEvidence.claimTypes) covered.add(claimType);
    for (const selected2 of decision.selectedClaimTypes)
      if (!covered.has(selected2))
        throw simulationInvalid(
          "Every selected WHAT claim requires assessed or genuine Core evidence."
        );
  }
  function mappedDisclosureClaimType(assertionType) {
    switch (assertionType) {
      case "ACTUAL_REDUCTION":
        return "REDUCTION_OUTCOME";
      case "PRODUCT_CARBON":
        return "PRODUCT_CARBON";
      case "OFFSET":
        return "OFFSET_OUTCOME";
      case "CARBON_NEUTRALITY":
        return "CARBON_NEUTRALITY";
    }
  }
  function requireCarbonTruth(value) {
    if (!(value instanceof CarbonTruthStateV080))
      throw simulationInvalid(
        "Claim assessment requires genuine Wave 2 Carbon Truth."
      );
    value.assertGenuine();
  }
  function requireCommunicationState(value) {
    if (!(value instanceof CommunicationStateV080))
      throw simulationInvalid("Communication state was structurally forged.");
    value.assertGenuine();
  }
  function validateEconomicParameters(parameters) {
    for (const channel of teachingV080CommunicationChannels)
      nonNegativeFinite(
        parameters.channelCost[channel],
        `channelCost.${channel}`
      );
    for (const level of teachingV080EvidenceLevels) {
      nonNegativeFinite(parameters.evidenceCost[level], `evidenceCost.${level}`);
      unitInterval(
        parameters.evidenceCredibility[level],
        `evidenceCredibility.${level}`
      );
    }
    for (const intensity of teachingV080CommunicationIntensities) {
      nonNegativeFinite(
        parameters.intensityCost[intensity],
        `intensityCost.${intensity}`
      );
      unitInterval(parameters.reach[intensity], `reach.${intensity}`);
      unitInterval(
        parameters.riskExposure[intensity],
        `riskExposure.${intensity}`
      );
    }
    for (const timing of teachingV080CommunicationTimings)
      nonNegativeFinite(parameters.timingCost[timing], `timingCost.${timing}`);
    for (const status of ["SUPPORTED", "FLAGGED", "AMBIGUOUS"])
      unitInterval(
        parameters.claimCredibilityFactor[status],
        `claimCredibilityFactor.${status}`
      );
    for (const [field, value] of [
      ["supportedTrustGain", parameters.supportedTrustGain],
      ["supportedReputationGain", parameters.supportedReputationGain],
      ["marketAccessGain", parameters.marketAccessGain],
      ["flaggedRiskGain", parameters.flaggedRiskGain],
      ["ambiguousRiskGain", parameters.ambiguousRiskGain]
    ])
      unitInterval(value, field);
  }
  function normalizeUnsignedDecimal(value, field) {
    const normalized = value.trim();
    if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(normalized))
      throw simulationInvalid(`${field} must be a non-negative decimal string.`);
    return normalized;
  }
  function compareUnsignedDecimal(left, right) {
    const a = decimalParts(normalizeUnsignedDecimal(left, "leftDecimal"));
    const b = decimalParts(normalizeUnsignedDecimal(right, "rightDecimal"));
    const scale = Math.max(a.fraction.length, b.fraction.length);
    const av = BigInt(a.whole + a.fraction.padEnd(scale, "0"));
    const bv = BigInt(b.whole + b.fraction.padEnd(scale, "0"));
    return av < bv ? -1 : av > bv ? 1 : 0;
  }
  function normalizeSignedDecimal(value, field) {
    const normalized = value.trim();
    if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(normalized))
      throw simulationInvalid(`${field} must be a signed decimal string.`);
    return normalized === "-0" ? "0" : normalized;
  }
  function compareDecimal(left, right) {
    const a = normalizeSignedDecimal(left, "leftDecimal");
    const b = normalizeSignedDecimal(right, "rightDecimal");
    if (a.startsWith("-") !== b.startsWith("-"))
      return a.startsWith("-") ? -1 : 1;
    const sign = a.startsWith("-") ? -1 : 1;
    return sign * compareUnsignedDecimal(a.replace(/^-/, ""), b.replace(/^-/, ""));
  }
  function decimalParts(value) {
    const [whole, fraction = ""] = value.split(".");
    return { whole: whole ?? "0", fraction };
  }
  function clamp01(value) {
    if (!Number.isFinite(value))
      throw simulationInvalid("Simulation communication result must be finite.");
    return Math.max(0, Math.min(1, value));
  }

  // packages/simulation-core/src/teaching-v080-events.ts
  var teachingV080EventKinds = [
    "ENERGY_PRICE_INCREASE",
    "ENERGY_PRICE_RELIEF",
    "CARBON_PRICE_INCREASE",
    "CARBON_PRICE_RELIEF",
    "GREEN_DEMAND_SURGE",
    "GREEN_DEMAND_COOLING",
    "LOW_CARBON_TECH_COST_DECLINE",
    "MAJOR_GREEN_BUYER_TENDER",
    "VERIFICATION_CAMPAIGN",
    "GREENWASHING_SCRUTINY"
  ];
  var teachingV080EventSeverities = ["LOW", "MEDIUM", "HIGH"];
  var pressureBySeverity = Object.freeze({ LOW: 1, MEDIUM: 2, HIGH: 3 });
  var SimulationEventV080 = class _SimulationEventV080 {
    constructor(provenance, eventId, eventKind, round, severity, pressure, description, effect, reference) {
      this.provenance = provenance;
      this.eventId = eventId;
      this.eventKind = eventKind;
      this.round = round;
      this.severity = severity;
      this.pressure = pressure;
      this.description = description;
      this.effect = effect;
      this.reference = reference;
      Object.freeze(this.effect);
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      if (!teachingV080EventKinds.includes(input.eventKind))
        throw simulationInvalid("Unknown v0.8 event kind.");
      if (!teachingV080EventSeverities.includes(input.severity))
        throw simulationInvalid("Unknown v0.8 event severity.");
      const round = positiveSafeInteger(input.round, "round");
      if (round > 8) throw simulationInvalid("Wave 3 event round must be 1..8.");
      const effect = normalizeEffect(input.effect);
      assertEventEffect(input.eventKind, effect);
      const payload = Object.freeze({
        provenance: "SIMULATION_EVENT",
        eventId: nonBlank(input.eventId, "eventId"),
        eventKind: input.eventKind,
        round,
        severity: input.severity,
        pressure: pressureBySeverity[input.severity],
        description: nonBlank(input.description, "description"),
        effect
      });
      return new _SimulationEventV080(
        payload.provenance,
        payload.eventId,
        payload.eventKind,
        payload.round,
        payload.severity,
        payload.pressure,
        payload.description,
        payload.effect,
        `simulation-event-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var EventScheduleV080 = class _EventScheduleV080 {
    constructor(provenance, eventSeed, events, reference) {
      this.provenance = provenance;
      this.eventSeed = eventSeed;
      this.events = events;
      this.reference = reference;
      Object.freeze(this.events);
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      const eventSeed = nonBlank(input.eventSeed, "eventSeed");
      const events = [...input.events].sort(
        (a, b) => a.round - b.round || a.eventId.localeCompare(b.eventId)
      );
      const ids = /* @__PURE__ */ new Set();
      let totalHigh = 0;
      const highRounds = /* @__PURE__ */ new Set();
      for (const event2 of events) {
        if (!(event2 instanceof SimulationEventV080))
          throw simulationInvalid(
            "Event schedule accepts only issued SimulationEventV080 objects."
          );
        event2.assertGenuine();
        if (ids.has(event2.eventId))
          throw simulationInvalid("Event schedule eventId must be unique.");
        ids.add(event2.eventId);
        if (event2.severity === "HIGH") {
          totalHigh += 1;
          if (highRounds.has(event2.round))
            throw simulationInvalid(
              "At most one HIGH exogenous event is allowed per round."
            );
          highRounds.add(event2.round);
        }
      }
      if (totalHigh > 3)
        throw simulationInvalid(
          "At most three HIGH exogenous events are allowed per game."
        );
      for (let round = 1; round <= 8; round += 1) {
        const roundEvents = events.filter((event2) => event2.round === round);
        const pressure = roundEvents.reduce(
          (sum, event2) => sum + event2.pressure,
          0
        );
        if (pressure > 3)
          throw simulationInvalid(
            "Exogenous event pressure may not exceed 3 per round.",
            { round, pressure }
          );
      }
      if (input.allowConsecutiveHigh !== true) {
        const ordered = [...highRounds].sort((a, b) => a - b);
        let previous;
        for (const current of ordered) {
          if (previous !== void 0 && current === previous + 1)
            throw simulationInvalid(
              "Consecutive HIGH exogenous events are disabled by default."
            );
          previous = current;
        }
      }
      const payload = Object.freeze({
        provenance: "SIMULATION_EVENT",
        eventSeed,
        events: Object.freeze(events)
      });
      return new _EventScheduleV080(
        payload.provenance,
        payload.eventSeed,
        payload.events,
        `event-schedule-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var MarketEnvironmentV080 = class _MarketEnvironmentV080 {
    constructor(provenance, round, energyPriceIndex, carbonPriceIndex, greenDemandIndex, technologyCostIndex, verificationIntensity, scrutinyIntensity, availableGreenOrders, eventReferences, reference) {
      this.provenance = provenance;
      this.round = round;
      this.energyPriceIndex = energyPriceIndex;
      this.carbonPriceIndex = carbonPriceIndex;
      this.greenDemandIndex = greenDemandIndex;
      this.technologyCostIndex = technologyCostIndex;
      this.verificationIntensity = verificationIntensity;
      this.scrutinyIntensity = scrutinyIntensity;
      this.availableGreenOrders = availableGreenOrders;
      this.eventReferences = eventReferences;
      this.reference = reference;
      Object.freeze(this.eventReferences);
      Object.freeze(this);
    }
    #nominal = true;
    static resolve(input) {
      if (!(input.schedule instanceof EventScheduleV080))
        throw simulationInvalid(
          "Market environment requires a genuine event schedule."
        );
      input.schedule.assertGenuine();
      const round = positiveSafeInteger(input.round, "round");
      if (round > 8)
        throw simulationInvalid("Wave 3 environment round must be 1..8.");
      const events = input.schedule.events.filter(
        (event2) => event2.round === round
      );
      let energyPriceIndex = nonNegativeFinite(
        input.opening.energyPriceIndex,
        "energyPriceIndex"
      );
      let carbonPriceIndex = nonNegativeFinite(
        input.opening.carbonPriceIndex,
        "carbonPriceIndex"
      );
      let greenDemandIndex = nonNegativeFinite(
        input.opening.greenDemandIndex,
        "greenDemandIndex"
      );
      let technologyCostIndex = nonNegativeFinite(
        input.opening.technologyCostIndex,
        "technologyCostIndex"
      );
      let verificationIntensity = unitInterval(
        input.opening.verificationIntensity,
        "verificationIntensity"
      );
      let scrutinyIntensity = unitInterval(
        input.opening.scrutinyIntensity,
        "scrutinyIntensity"
      );
      let availableGreenOrders = nonNegativeInteger(
        input.opening.availableGreenOrders,
        "availableGreenOrders"
      );
      for (const event2 of events) {
        energyPriceIndex += event2.effect.energyPriceDelta ?? 0;
        carbonPriceIndex += event2.effect.carbonPriceDelta ?? 0;
        greenDemandIndex += event2.effect.greenDemandDelta ?? 0;
        technologyCostIndex += event2.effect.technologyCostDelta ?? 0;
        verificationIntensity += event2.effect.verificationIntensityDelta ?? 0;
        scrutinyIntensity += event2.effect.scrutinyIntensityDelta ?? 0;
        availableGreenOrders += event2.effect.greenOrderDelta ?? 0;
      }
      assertNonNegativeFiniteResult(energyPriceIndex, "energyPriceIndex");
      assertNonNegativeFiniteResult(carbonPriceIndex, "carbonPriceIndex");
      assertNonNegativeFiniteResult(greenDemandIndex, "greenDemandIndex");
      assertNonNegativeFiniteResult(technologyCostIndex, "technologyCostIndex");
      verificationIntensity = unitInterval(
        verificationIntensity,
        "resolvedVerificationIntensity"
      );
      scrutinyIntensity = unitInterval(
        scrutinyIntensity,
        "resolvedScrutinyIntensity"
      );
      availableGreenOrders = nonNegativeInteger(
        availableGreenOrders,
        "resolvedAvailableGreenOrders"
      );
      const payload = Object.freeze({
        provenance: "SIMULATION_OUTCOME",
        round,
        energyPriceIndex,
        carbonPriceIndex,
        greenDemandIndex,
        technologyCostIndex,
        verificationIntensity,
        scrutinyIntensity,
        availableGreenOrders,
        eventReferences: Object.freeze(events.map((event2) => event2.reference))
      });
      return new _MarketEnvironmentV080(
        payload.provenance,
        payload.round,
        payload.energyPriceIndex,
        payload.carbonPriceIndex,
        payload.greenDemandIndex,
        payload.technologyCostIndex,
        payload.verificationIntensity,
        payload.scrutinyIntensity,
        payload.availableGreenOrders,
        payload.eventReferences,
        `market-environment-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function createSimulationEventV080(input) {
    return SimulationEventV080.create(input);
  }
  function createEventScheduleV080(input) {
    return EventScheduleV080.create(input);
  }
  function resolveMarketEnvironmentV080(input) {
    return MarketEnvironmentV080.resolve(input);
  }
  function normalizeEffect(effect) {
    const normalized = {};
    copyEffectValue(effect.energyPriceDelta, "energyPriceDelta", normalized);
    copyEffectValue(effect.carbonPriceDelta, "carbonPriceDelta", normalized);
    copyEffectValue(effect.greenDemandDelta, "greenDemandDelta", normalized);
    copyEffectValue(
      effect.technologyCostDelta,
      "technologyCostDelta",
      normalized
    );
    copyEffectValue(
      effect.verificationIntensityDelta,
      "verificationIntensityDelta",
      normalized
    );
    copyEffectValue(
      effect.scrutinyIntensityDelta,
      "scrutinyIntensityDelta",
      normalized
    );
    copyEffectValue(effect.greenOrderDelta, "greenOrderDelta", normalized);
    return Object.freeze(normalized);
  }
  function copyEffectValue(value, field, target) {
    if (value === void 0) return;
    if (!Number.isFinite(value))
      throw simulationInvalid(`Event effect ${field} must be finite.`);
    switch (field) {
      case "energyPriceDelta":
        target.energyPriceDelta = value;
        return;
      case "carbonPriceDelta":
        target.carbonPriceDelta = value;
        return;
      case "greenDemandDelta":
        target.greenDemandDelta = value;
        return;
      case "technologyCostDelta":
        target.technologyCostDelta = value;
        return;
      case "verificationIntensityDelta":
        target.verificationIntensityDelta = value;
        return;
      case "scrutinyIntensityDelta":
        target.scrutinyIntensityDelta = value;
        return;
      case "greenOrderDelta":
        target.greenOrderDelta = value;
        return;
    }
  }
  function assertEventEffect(kind2, effect) {
    const keys2 = Object.keys(effect);
    const only = (allowed) => {
      if (keys2.some((key) => !allowed.includes(key)))
        throw simulationInvalid(
          `${kind2} contains an unauthorized environment effect.`
        );
    };
    switch (kind2) {
      case "ENERGY_PRICE_INCREASE":
        only(["energyPriceDelta"]);
        positive(effect.energyPriceDelta, kind2);
        return;
      case "ENERGY_PRICE_RELIEF":
        only(["energyPriceDelta"]);
        negative(effect.energyPriceDelta, kind2);
        return;
      case "CARBON_PRICE_INCREASE":
        only(["carbonPriceDelta"]);
        positive(effect.carbonPriceDelta, kind2);
        return;
      case "CARBON_PRICE_RELIEF":
        only(["carbonPriceDelta"]);
        negative(effect.carbonPriceDelta, kind2);
        return;
      case "GREEN_DEMAND_SURGE":
        only(["greenDemandDelta"]);
        positive(effect.greenDemandDelta, kind2);
        return;
      case "GREEN_DEMAND_COOLING":
        only(["greenDemandDelta"]);
        negative(effect.greenDemandDelta, kind2);
        return;
      case "LOW_CARBON_TECH_COST_DECLINE":
        only(["technologyCostDelta"]);
        negative(effect.technologyCostDelta, kind2);
        return;
      case "MAJOR_GREEN_BUYER_TENDER":
        only(["greenOrderDelta"]);
        if (!Number.isSafeInteger(effect.greenOrderDelta) || (effect.greenOrderDelta ?? 0) <= 0)
          throw simulationInvalid(
            `${kind2} requires a positive integer greenOrderDelta.`
          );
        return;
      case "VERIFICATION_CAMPAIGN":
        only(["verificationIntensityDelta"]);
        positive(effect.verificationIntensityDelta, kind2);
        return;
      case "GREENWASHING_SCRUTINY":
        only(["scrutinyIntensityDelta"]);
        positive(effect.scrutinyIntensityDelta, kind2);
        return;
    }
  }
  function positive(value, kind2) {
    if (value === void 0 || value <= 0)
      throw simulationInvalid(`${kind2} requires a positive effect.`);
  }
  function negative(value, kind2) {
    if (value === void 0 || value >= 0)
      throw simulationInvalid(`${kind2} requires a negative effect.`);
  }
  function nonNegativeInteger(value, field) {
    if (!Number.isSafeInteger(value) || value < 0)
      throw simulationInvalid(`${field} must be a non-negative safe integer.`);
    return value;
  }
  function assertNonNegativeFiniteResult(value, field) {
    if (!Number.isFinite(value) || value < 0)
      throw simulationInvalid(
        `${field} event resolution produced an invalid value.`
      );
  }

  // packages/simulation-core/src/teaching-v080-market.ts
  var teachingV080MarketTargets = ["REGULAR", "GREEN", "MIXED"];
  function resolveSharedGreenMarketV080(input) {
    if (!(input.environment instanceof MarketEnvironmentV080))
      throw simulationInvalid(
        "Shared green market requires genuine market environment."
      );
    input.environment.assertGenuine();
    if (input.teams.length === 0)
      throw simulationInvalid("Shared green market requires at least one team.");
    validateParameters(input.parameters);
    const teamIds = /* @__PURE__ */ new Set();
    const evaluations = [];
    for (const team of input.teams) {
      const teamId = nonBlank(team.teamId, "teamId");
      if (teamIds.has(teamId))
        throw simulationInvalid("Shared green market teamId must be unique.");
      teamIds.add(teamId);
      if (!teachingV080MarketTargets.includes(team.marketTarget))
        throw simulationInvalid("Unknown v0.8 market target.");
      const productSubject = nonBlank(team.productSubject, "productSubject");
      const availableCapacity = nonNegativeFinite(
        team.availableCapacity,
        `${teamId}.availableCapacity`
      );
      if (!(team.carbonTruth instanceof CarbonTruthStateV080))
        throw simulationInvalid(
          "Market evaluation requires genuine Wave 2 Carbon Truth."
        );
      team.carbonTruth.assertGenuine();
      if (!(team.communication instanceof CommunicationStateV080))
        throw simulationInvalid(
          "Market evaluation requires genuine Wave 3 Communication state."
        );
      team.communication.assertGenuine();
      const greenRequested = team.marketTarget !== "REGULAR";
      const product = greenRequested ? exactProductCarbon(team.carbonTruth, productSubject) : void 0;
      const reasons = [];
      let productCarbonScore;
      if (greenRequested) {
        if (product === void 0) {
          reasons.push("AUTHORITATIVE_PRODUCT_CARBON_UNAVAILABLE");
        } else if (product.perUnitCarbonQuantity.unit !== input.parameters.productThreshold.unit || product.perUnitCarbonQuantity.gasBasis !== input.parameters.productThreshold.gasBasis) {
          reasons.push("PRODUCT_CARBON_THRESHOLD_CONTEXT_MISMATCH");
        } else {
          const value = decimalToFiniteNumber(
            product.perUnitCarbonQuantity.value,
            `${teamId}.productCarbon`
          );
          if (value > input.parameters.productThreshold.value)
            reasons.push("PRODUCT_CARBON_ABOVE_GREEN_THRESHOLD");
          productCarbonScore = Math.max(
            0,
            1 - value / input.parameters.productThreshold.value
          );
        }
        if (availableCapacity < input.parameters.requiredCapacityPerAward)
          reasons.push("INSUFFICIENT_CAPACITY");
        if (team.communication.disclosureCredibility < input.parameters.minimumDisclosureCredibility)
          reasons.push("DISCLOSURE_CREDIBILITY_BELOW_THRESHOLD");
        if (team.communication.greenMarketAccess < input.parameters.minimumGreenMarketAccess)
          reasons.push("GREEN_MARKET_ACCESS_BELOW_THRESHOLD");
      } else {
        reasons.push("REGULAR_MARKET_TARGET");
      }
      const eligible = greenRequested && reasons.length === 0;
      const score = eligible && productCarbonScore !== void 0 ? competitiveScore(
        productCarbonScore,
        team.communication,
        input.parameters.weights
      ) : void 0;
      evaluations.push({
        team,
        teamId,
        product,
        eligible,
        reasons: Object.freeze(reasons),
        score
      });
    }
    const winners = evaluations.filter((item) => item.eligible && item.score !== void 0).sort((a, b) => {
      const scoreDifference = (b.score ?? 0) - (a.score ?? 0);
      return scoreDifference !== 0 ? scoreDifference : a.teamId.localeCompare(b.teamId);
    }).slice(0, input.environment.availableGreenOrders);
    const awardedTeamIds = Object.freeze(winners.map((winner) => winner.teamId));
    const winnerSet = new Set(awardedTeamIds);
    const teamResults = Object.freeze(
      evaluations.map((item) => {
        const greenOrderAwarded = winnerSet.has(item.teamId);
        const regularRevenue = regularRevenueForTarget(
          item.team.marketTarget,
          input.parameters
        );
        const greenRevenue = greenOrderAwarded ? input.parameters.greenRevenuePerAwardAtDemandIndex1 * input.environment.greenDemandIndex : 0;
        const payload2 = Object.freeze({
          teamId: item.teamId,
          marketTarget: item.team.marketTarget,
          eligibleForGreenOrder: item.eligible,
          greenEligibilityReasons: item.reasons,
          productCarbonValue: item.product?.perUnitCarbonQuantity.value,
          productCarbonFactReference: item.product?.productCarbonResultId,
          competitivePositionScore: item.score === void 0 ? void 0 : rounded(item.score),
          greenOrderAwarded,
          regularRevenue: rounded(regularRevenue),
          greenRevenue: rounded(greenRevenue),
          totalMarketRevenue: rounded(regularRevenue + greenRevenue),
          carbonTruthReference: item.team.carbonTruth.reference,
          communicationStateReference: item.team.communication.reference
        });
        return Object.freeze({
          ...payload2,
          reference: `market-team-result-v080:${deterministicSha256(payload2)}`
        });
      })
    );
    const payload = Object.freeze({
      provenance: "SIMULATION_OUTCOME",
      environmentReference: input.environment.reference,
      availableGreenOrders: input.environment.availableGreenOrders,
      awardedTeamIds,
      teamResults
    });
    return Object.freeze({
      ...payload,
      reference: `shared-green-market-v080:${deterministicSha256(payload)}`
    });
  }
  function exactProductCarbon(carbonTruth, productSubject) {
    const snapshot = carbonTruth.productCarbon;
    if (snapshot === void 0) return void 0;
    snapshot.assertGenuine();
    return snapshot.results.find(
      (item) => item.productSubject === productSubject
    );
  }
  function regularRevenueForTarget(target, parameters) {
    switch (target) {
      case "REGULAR":
        return parameters.regularRevenueFull;
      case "MIXED":
        return parameters.regularRevenueFull * parameters.mixedRegularRevenueShare;
      case "GREEN":
        return 0;
    }
  }
  function competitiveScore(productCarbonScore, communication, weights) {
    const total = weights.productCarbon + weights.trust + weights.reputation + weights.disclosureCredibility;
    return (weights.productCarbon * productCarbonScore + weights.trust * communication.trust + weights.reputation * communication.reputation + weights.disclosureCredibility * communication.disclosureCredibility) / total;
  }
  function validateParameters(parameters) {
    if (!Number.isFinite(parameters.productThreshold.value) || parameters.productThreshold.value <= 0)
      throw simulationInvalid("Green product-carbon threshold must be positive.");
    unitInterval(
      parameters.minimumDisclosureCredibility,
      "minimumDisclosureCredibility"
    );
    unitInterval(parameters.minimumGreenMarketAccess, "minimumGreenMarketAccess");
    nonNegativeFinite(
      parameters.requiredCapacityPerAward,
      "requiredCapacityPerAward"
    );
    nonNegativeFinite(parameters.regularRevenueFull, "regularRevenueFull");
    unitInterval(parameters.mixedRegularRevenueShare, "mixedRegularRevenueShare");
    nonNegativeFinite(
      parameters.greenRevenuePerAwardAtDemandIndex1,
      "greenRevenuePerAwardAtDemandIndex1"
    );
    const weightValues = [
      parameters.weights.productCarbon,
      parameters.weights.trust,
      parameters.weights.reputation,
      parameters.weights.disclosureCredibility
    ];
    for (let index = 0; index < weightValues.length; index += 1) {
      const value = weightValues[index];
      if (value === void 0)
        throw simulationInvalid("Green-market weight is missing.");
      nonNegativeFinite(value, `marketWeight.${String(index)}`);
    }
    if (weightValues.every((value) => value === 0))
      throw simulationInvalid(
        "At least one green-market competition weight must be positive."
      );
  }
  function decimalToFiniteNumber(value, field) {
    if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value))
      throw simulationInvalid(`${field} must be a non-negative decimal string.`);
    const parsed = Number(value);
    if (!Number.isFinite(parsed))
      throw simulationInvalid(
        `${field} cannot be represented for market evaluation.`
      );
    return parsed;
  }
  function rounded(value) {
    return Math.round((value + Number.EPSILON) * 1e6) / 1e6;
  }

  // packages/carbon-core/src/stimulation-sincerity.ts
  var sinceritySlots = [
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "Q5",
    "Q6",
    "Q7",
    "Q8",
    "Q9"
  ];
  var legacySinceritySemantics = Object.freeze({
    Q1: "LEGACY_REDUCTION_FUND_INVESTMENT_TO_TOTAL_ASSETS",
    Q2: "LEGACY_OFFSET_FUND_INVESTMENT_TO_TOTAL_ASSETS",
    Q3: "LEGACY_CARBON_NEUTRALITY_PERSONNEL_TO_TOTAL_EMPLOYEES",
    Q4: "LEGACY_CARBON_NEUTRALITY_IMPLEMENTATION_YEARS",
    Q5: "LEGACY_CONTINUOUS_CARBON_NEUTRALITY_FUNDING",
    Q6: "LEGACY_PERSONNEL_INCREASE_YEAR_BY_YEAR",
    Q7: "LEGACY_EMISSION_LEVEL_CHANGE",
    Q8: "LEGACY_CARBON_LIABILITY_REDUCTION_TO_CURRENT_EMISSIONS",
    Q9: "LEGACY_CARBON_NEUTRALITY_PROGRESS"
  });

  // packages/simulation-core/src/teaching-v080-teaching.ts
  var teachingV080Roles = ["CEO", "CFO", "COO", "CCO", "CMO"];
  var teachingV080LeadRolesByRound = Object.freeze({
    1: Object.freeze(["CEO", "CFO", "CCO"]),
    2: Object.freeze(["CCO", "CFO"]),
    3: Object.freeze(["COO", "CFO", "CCO"]),
    4: Object.freeze(["CMO", "COO", "CCO"]),
    5: Object.freeze(["CFO", "CCO", "CEO"]),
    6: Object.freeze(["CMO", "CCO", "CFO"]),
    7: Object.freeze(["CCO", "CMO", "CEO"]),
    8: Object.freeze([...teachingV080Roles])
  });
  var RolePlanV080 = class _RolePlanV080 {
    constructor(firstHalf, secondHalf, rotationRound, reference) {
      this.firstHalf = firstHalf;
      this.secondHalf = secondHalf;
      this.rotationRound = rotationRound;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      const firstHalf = normalizeRoleAssignments(input.firstHalf, "firstHalf");
      const secondHalf = normalizeRoleAssignments(input.secondHalf, "secondHalf");
      const changed = teachingV080Roles.some(
        (role) => firstHalf[role] !== secondHalf[role]
      );
      if (!changed)
        throw simulationInvalid(
          "Wave 4 role plan requires one meaningful rotation beginning at R5."
        );
      const payload = { firstHalf, secondHalf, rotationRound: 5 };
      return new _RolePlanV080(
        firstHalf,
        secondHalf,
        5,
        `role-plan-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
    holder(round, role) {
      this.assertGenuine();
      assertRound(round);
      assertRole(role);
      return round < this.rotationRound ? this.firstHalf[role] : this.secondHalf[role];
    }
  };
  var textbookSincerityDimensionBySlotV080 = Object.freeze({
    Q1: "INPUT_LEVEL",
    Q2: "INPUT_LEVEL",
    Q3: "INPUT_LEVEL",
    Q4: "CONTINUITY",
    Q5: "CONTINUITY",
    Q6: "CONTINUITY",
    Q7: "IMPLEMENTATION_EFFECT",
    Q8: "IMPLEMENTATION_EFFECT",
    Q9: "IMPLEMENTATION_EFFECT"
  });
  var TextbookSincerityEvaluationV080 = class _TextbookSincerityEvaluationV080 {
    constructor(provenance, metricNamespace, status, components, missingSlots, sincerityScore, weightParameterClass, weightParameterReference, reference) {
      this.provenance = provenance;
      this.metricNamespace = metricNamespace;
      this.status = status;
      this.sincerityScore = sincerityScore;
      this.weightParameterClass = weightParameterClass;
      this.weightParameterReference = weightParameterReference;
      this.reference = reference;
      this.components = Object.freeze([...components]);
      this.missingSlots = Object.freeze([...missingSlots]);
      Object.freeze(this);
    }
    #nominal = true;
    components;
    missingSlots;
    static evaluate(input) {
      if (input.weightParameterClass !== "P2")
        throw simulationInvalid(
          "Textbook sincerity weights must be P2 parameters."
        );
      let weightTotal = 0;
      const components = [];
      const missingSlots = [];
      for (const slot2 of sinceritySlots) {
        const weight = nonNegativeFinite(input.weights[slot2], `weight.${slot2}`);
        weightTotal += weight;
        const raw = input.normalizedComponents[slot2];
        const normalizedValue = raw === void 0 ? void 0 : unitInterval(raw, `component.${slot2}`);
        if (normalizedValue === void 0) missingSlots.push(slot2);
        components.push(
          Object.freeze({
            slot: slot2,
            dimension: textbookSincerityDimensionBySlotV080[slot2],
            semanticReference: legacySinceritySemantics[slot2],
            normalizedValue,
            weight
          })
        );
      }
      if (Math.abs(weightTotal - 1) > 1e-9)
        throw simulationInvalid("Textbook sincerity P2 weights must sum to 1.", {
          weightTotal
        });
      const status = missingSlots.length === 0 ? "AVAILABLE" : "UNAVAILABLE";
      const sincerityScore = status === "AVAILABLE" ? components.reduce((sum, component) => {
        if (component.normalizedValue === void 0)
          throw simulationInvalid(
            "Available textbook sincerity cannot contain a missing component."
          );
        return sum + component.normalizedValue * component.weight;
      }, 0) : void 0;
      const payload = {
        provenance: "TEACHING_FEEDBACK",
        metricNamespace: "TEXTBOOK_METRIC",
        status,
        components,
        missingSlots,
        sincerityScore,
        weightParameterClass: "P2",
        weightParameterReference: nonBlank(
          input.weightParameterReference,
          "weightParameterReference"
        )
      };
      return new _TextbookSincerityEvaluationV080(
        payload.provenance,
        payload.metricNamespace,
        payload.status,
        payload.components,
        payload.missingSlots,
        payload.sincerityScore,
        payload.weightParameterClass,
        payload.weightParameterReference,
        `textbook-sincerity-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var enterpriseProfileDimensionsV080 = [
    "BUSINESS_HEALTH",
    "ACTUAL_REDUCTION",
    "PRODUCT_CARBON_COMPETITIVENESS",
    "OFFSET_DEPENDENCY",
    "DISCLOSURE_CREDIBILITY_REPUTATION",
    "LONG_TERM_CAPABILITY",
    "TEXTBOOK_SINCERITY"
  ];
  var enterpriseProfileBandsV080 = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "UNAVAILABLE"
  ];
  var enterpriseProfileTagsV080 = [
    "REAL_REDUCTION_LEADER",
    "LOW_CARBON_PRODUCT_COMPETITOR",
    "LONG_TERM_CAPABILITY_BUILDER",
    "FINANCIALLY_RESILIENT",
    "SINCERE_CONTINUOUS_INVESTOR",
    "OFFSET_DEPENDENT",
    "DISCLOSURE_GOVERNANCE_HIGH_RISK",
    "GREEN_INVESTMENT_PRESSURED"
  ];
  var EnterpriseProfileV080 = class _EnterpriseProfileV080 {
    constructor(provenance, dimensions, tags, classificationParameterClass, classificationParameterReference, reference) {
      this.provenance = provenance;
      this.classificationParameterClass = classificationParameterClass;
      this.classificationParameterReference = classificationParameterReference;
      this.reference = reference;
      this.dimensions = Object.freeze([...dimensions]);
      this.tags = Object.freeze([...tags]);
      Object.freeze(this);
    }
    #nominal = true;
    dimensions;
    tags;
    static create(input) {
      input.sincerity.assertGenuine();
      if (input.classificationParameterClass !== "P2")
        throw simulationInvalid(
          "Enterprise profile classification must use P2 parameters."
        );
      const dimensions = enterpriseProfileDimensionsV080.map((dimension) => {
        const item = input.dimensions[dimension];
        if (!enterpriseProfileBandsV080.includes(item.band))
          throw simulationInvalid("Enterprise profile band is invalid.", {
            dimension,
            band: item.band
          });
        const evidenceReferences = uniqueNonBlank2(
          item.evidenceReferences,
          `${dimension}.evidenceReferences`
        );
        if (evidenceReferences.length === 0)
          throw simulationInvalid(
            "Enterprise profile dimensions require evidence.",
            {
              dimension
            }
          );
        return Object.freeze({
          dimension,
          band: item.band,
          evidenceReferences
        });
      });
      const sincerityBand = input.dimensions.TEXTBOOK_SINCERITY.band;
      if (input.sincerity.status === "UNAVAILABLE" && sincerityBand !== "UNAVAILABLE")
        throw simulationInvalid(
          "Unavailable textbook sincerity must remain UNAVAILABLE in the enterprise profile."
        );
      const tags = uniqueTags(input.tags);
      const payload = {
        provenance: "TEACHING_FEEDBACK",
        dimensions,
        tags,
        classificationParameterClass: "P2",
        classificationParameterReference: nonBlank(
          input.classificationParameterReference,
          "classificationParameterReference"
        ),
        sincerityReference: input.sincerity.reference
      };
      return new _EnterpriseProfileV080(
        payload.provenance,
        payload.dimensions,
        payload.tags,
        payload.classificationParameterClass,
        payload.classificationParameterReference,
        `enterprise-profile-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var nextCycleStrategicPrioritiesV080 = [
    "FINANCIAL_RECOVERY",
    "DEEP_REDUCTION",
    "PRODUCT_LOW_CARBON_LEADERSHIP",
    "REPUTATION_REBUILDING",
    "BALANCED_TRANSITION"
  ];
  var nextCycleAmbitionsV080 = [
    "CONSERVATIVE",
    "MODERATE",
    "AMBITIOUS"
  ];
  var NextCycleCommitmentV080 = class _NextCycleCommitmentV080 {
    constructor(provenance, strategicPriority, ambition, target, evidenceReferences, capabilityGap, budgetIntent, reference) {
      this.provenance = provenance;
      this.strategicPriority = strategicPriority;
      this.ambition = ambition;
      this.target = target;
      this.capabilityGap = capabilityGap;
      this.budgetIntent = budgetIntent;
      this.reference = reference;
      this.evidenceReferences = Object.freeze([...evidenceReferences]);
      Object.freeze(this);
    }
    #nominal = true;
    evidenceReferences;
    static create(input) {
      if (!nextCycleStrategicPrioritiesV080.includes(input.strategicPriority))
        throw simulationInvalid("Unknown next-cycle strategic priority.");
      if (!nextCycleAmbitionsV080.includes(input.ambition))
        throw simulationInvalid("Unknown next-cycle ambition.");
      const evidenceReferences = uniqueNonBlank2(
        input.evidenceReferences,
        "evidenceReferences"
      );
      if (evidenceReferences.length === 0)
        throw simulationInvalid(
          "Next-cycle commitment requires current-cycle evidence."
        );
      const payload = {
        provenance: "PLAYER_DECISION",
        strategicPriority: input.strategicPriority,
        ambition: input.ambition,
        target: nonBlank(input.target, "target"),
        evidenceReferences,
        capabilityGap: nonBlank(input.capabilityGap, "capabilityGap"),
        budgetIntent: nonBlank(input.budgetIntent, "budgetIntent")
      };
      return new _NextCycleCommitmentV080(
        payload.provenance,
        payload.strategicPriority,
        payload.ambition,
        payload.target,
        payload.evidenceReferences,
        payload.capabilityGap,
        payload.budgetIntent,
        `next-cycle-commitment-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var NextCycleSeedV080 = class _NextCycleSeedV080 {
    constructor(provenance, sourceCommitmentReference, carryForwardEvidenceReferences, coreEvidenceHandoffReference, reference) {
      this.provenance = provenance;
      this.sourceCommitmentReference = sourceCommitmentReference;
      this.coreEvidenceHandoffReference = coreEvidenceHandoffReference;
      this.reference = reference;
      this.carryForwardEvidenceReferences = Object.freeze([
        ...carryForwardEvidenceReferences
      ]);
      Object.freeze(this);
    }
    #nominal = true;
    carryForwardEvidenceReferences;
    static create(input) {
      input.commitment.assertGenuine();
      const carryForwardEvidenceReferences = uniqueNonBlank2(
        input.carryForwardEvidenceReferences,
        "carryForwardEvidenceReferences"
      );
      if (carryForwardEvidenceReferences.length === 0)
        throw simulationInvalid(
          "Next-cycle seed requires carry-forward evidence."
        );
      const payload = {
        provenance: "SIMULATION_OUTCOME",
        sourceCommitmentReference: input.commitment.reference,
        carryForwardEvidenceReferences,
        coreEvidenceHandoffReference: input.coreEvidenceHandoffReference === void 0 ? void 0 : nonBlank(
          input.coreEvidenceHandoffReference,
          "coreEvidenceHandoffReference"
        )
      };
      return new _NextCycleSeedV080(
        payload.provenance,
        payload.sourceCommitmentReference,
        payload.carryForwardEvidenceReferences,
        payload.coreEvidenceHandoffReference,
        `next-cycle-seed-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function normalizeRoleAssignments(assignments, field) {
    const normalized = {};
    for (const role of teachingV080Roles)
      normalized[role] = nonBlank(assignments[role], `${field}.${role}`);
    return Object.freeze(normalized);
  }
  function assertRole(role) {
    if (!teachingV080Roles.includes(role))
      throw simulationInvalid("Unknown teaching role.", { role });
  }
  function assertRound(round) {
    const normalized = positiveSafeInteger(round, "round");
    if (normalized > 8)
      throw simulationInvalid("Teaching v0.8 round must be between 1 and 8.", {
        round
      });
    return normalized;
  }
  function uniqueNonBlank2(values2, field) {
    const normalized = values2.map((value) => nonBlank(value, field));
    if (new Set(normalized).size !== normalized.length)
      throw simulationInvalid(`${field} must not contain duplicates.`);
    return Object.freeze(normalized);
  }
  function uniqueTags(tags) {
    for (const tag of tags)
      if (!enterpriseProfileTagsV080.includes(tag))
        throw simulationInvalid("Unknown enterprise profile tag.", { tag });
    if (new Set(tags).size !== tags.length)
      throw simulationInvalid(
        "Enterprise profile tags must not contain duplicates."
      );
    return Object.freeze([...tags]);
  }

  // packages/simulation-core/src/teaching-v080-decision-values.ts
  var teachingV080StrategicCommitments = [
    "STABILIZE_CARBON_TRUTH",
    "PRIORITIZE_REAL_REDUCTION",
    "BUILD_LOW_CARBON_VALUE"
  ];
  var teachingV080ResourcePostures = [
    "LIQUIDITY_PROTECTED",
    "DISCIPLINED_DEPLOYMENT",
    "TRANSFORMATION_CAPACITY"
  ];
  var teachingV080UncertaintyResponses = [
    "PROCEED_WITH_LIMITATION",
    "REMEDIATE_BEFORE_ACTION",
    "WITHHOLD_AFFECTED_ACTION"
  ];
  var teachingV080RemediationDomains = [
    "ACTIVITY_DATA",
    "PRODUCT_TRACEABILITY",
    "DISCLOSURE_EVIDENCE"
  ];
  var teachingV080RemediationIntensities = [
    "BASIC",
    "STANDARD",
    "DEEP"
  ];
  var teachingV080ReductionInvestmentIntensities = [
    "LOW",
    "MODERATE",
    "HIGH"
  ];
  var teachingV080ReductionProjectIds = teachingV080BdReductionProjectIds;
  var teachingV080InvestmentHorizons = [
    "SHORT",
    "MEDIUM",
    "LONG"
  ];
  var teachingV080OffsetIntensities = [
    "NONE",
    "PARTIAL",
    "FULL_REMAINING_REQUIREMENT"
  ];
  var teachingV080CarbonAssetBuffers = [
    "NO_BUFFER",
    "LIMITED_BUFFER",
    "ROBUST_BUFFER"
  ];
  function bindExact(decision, slot2, value, allowed, kind2) {
    requireSlot(decision, slot2);
    if (!allowed.includes(value))
      throw simulationInvalid(`Unknown frozen ${slot2} option.`);
    requireSelectionCode(decision, value);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: decision.reference,
      value
    });
    return Object.freeze({
      ...payload,
      decision,
      reference: `${kind2}-v080:${deterministicSha256(payload)}`
    });
  }
  var bindStrategicCommitmentDecisionV080 = (input) => bindExact(
    input.decision,
    "D1",
    input.value,
    teachingV080StrategicCommitments,
    "strategic-commitment-decision"
  );
  var bindResourcePostureDecisionV080 = (input) => bindExact(
    input.decision,
    "D2",
    input.value,
    teachingV080ResourcePostures,
    "resource-posture-decision"
  );
  var bindUncertaintyResponseDecisionV080 = (input) => bindExact(
    input.decision,
    "D3",
    input.value,
    teachingV080UncertaintyResponses,
    "uncertainty-response-decision"
  );
  var bindReductionInvestmentDecisionV080 = (input) => bindExact(
    input.decision,
    "D5",
    input.value,
    teachingV080ReductionInvestmentIntensities,
    "reduction-investment-decision"
  );
  var bindInvestmentHorizonDecisionV080 = (input) => bindExact(
    input.decision,
    "D7",
    input.value,
    teachingV080InvestmentHorizons,
    "investment-horizon-decision"
  );
  var bindOffsetIntensityDecisionV080 = (input) => bindExact(
    input.decision,
    "D11",
    input.value,
    teachingV080OffsetIntensities,
    "offset-intensity-decision"
  );
  var bindCarbonAssetBufferDecisionV080 = (input) => bindExact(
    input.decision,
    "D12",
    input.value,
    teachingV080CarbonAssetBuffers,
    "carbon-asset-buffer-decision"
  );
  function bindRemediationPriorityDecisionV080(input) {
    requireSlot(input.decision, "D4");
    if (!teachingV080RemediationDomains.includes(input.domain) || !teachingV080RemediationIntensities.includes(input.intensity))
      throw simulationInvalid("Unknown frozen D4 option.");
    requireSelectionCode(input.decision, `${input.domain}+${input.intensity}`);
    const value = Object.freeze({
      domain: input.domain,
      intensity: input.intensity
    });
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      value
    });
    return Object.freeze({
      ...payload,
      decision: input.decision,
      reference: `remediation-priority-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindReductionPortfolioDecisionV080(input) {
    requireSlot(input.decision, "D6");
    if (input.projectIds.length === 0 || new Set(input.projectIds).size !== input.projectIds.length || input.projectIds.some((id) => !teachingV080ReductionProjectIds.includes(id)))
      throw simulationInvalid("D6 requires unique frozen BD project IDs.");
    const ordered = Object.freeze(
      teachingV080ReductionProjectIds.filter(
        (id) => input.projectIds.includes(id)
      )
    );
    requireSelectionCode(input.decision, ordered.join("+"));
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      value: ordered
    });
    return Object.freeze({
      ...payload,
      decision: input.decision,
      reference: `reduction-portfolio-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindProductionMixDecisionV080(input) {
    requireSlot(input.decision, "D8");
    const value = validateProductionMixV080(input);
    requireSelectionCode(
      input.decision,
      `c1Production=${String(value.c1Production)};c2Production=${String(value.c2Production)}`
    );
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      value
    });
    return Object.freeze({
      ...payload,
      decision: input.decision,
      reference: `production-mix-decision-v080:${deterministicSha256(payload)}`
    });
  }
  var teachingV080R3RequiredP2ParameterIds = Object.freeze([
    "P2_D5_D6_D7_INVESTMENT_SPEND",
    "P2_D5_D6_D7_FUTURE_OUTFLOW",
    "P2_D5_D6_D7_ACTIVATION_LAG",
    "P2_D5_D6_D7_CAPABILITY_GAIN"
  ]);
  function bindMarketTargetDecisionV080(input) {
    requireSlot(input.decision, "D9");
    if (!teachingV080MarketTargets.includes(input.marketTarget))
      throw simulationInvalid("Unknown frozen D9 market target.");
    requireSelectionCode(input.decision, input.marketTarget);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      marketTarget: input.marketTarget
    });
    return Object.freeze({
      ...payload,
      reference: `market-target-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindRemainingReductionDecisionV080(input) {
    requireSlot(input.decision, "D10");
    const response = assertRemainingReductionResponseV080(input.response);
    requireSelectionCode(input.decision, response);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      response
    });
    return Object.freeze({
      ...payload,
      reference: `remaining-reduction-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindDisclosureWhatDecisionV080(input) {
    requireSlot(input.decision, "D13");
    const canonicalSelectionCode = input.selection.contentKinds.join("+");
    requireSelectionCode(input.decision, canonicalSelectionCode);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      disclosureContentSelectionReference: input.selection.reference
    });
    return Object.freeze({
      provenance: payload.provenance,
      decisionReference: payload.decisionReference,
      selection: input.selection,
      reference: `disclosure-what-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindCommunicationChannelDecisionV080(input) {
    requireSlot(input.decision, "D14");
    if (!teachingV080CommunicationChannels.includes(input.channel))
      throw simulationInvalid("Unknown frozen D14 communication channel.");
    requireSelectionCode(input.decision, input.channel);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      channel: input.channel
    });
    return Object.freeze({
      ...payload,
      reference: `communication-channel-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindCommunicationTimingDecisionV080(input) {
    requireSlot(input.decision, "D15");
    if (!teachingV080CommunicationTimings.includes(input.timing))
      throw simulationInvalid("Unknown frozen D15 communication timing.");
    requireSelectionCode(input.decision, input.timing);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      timing: input.timing
    });
    return Object.freeze({
      ...payload,
      reference: `communication-timing-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindEvidenceIntensityDecisionV080(input) {
    requireSlot(input.decision, "D16");
    if (!teachingV080EvidenceLevels.includes(input.evidenceLevel))
      throw simulationInvalid("Unknown frozen D16 evidence level.");
    if (!teachingV080CommunicationIntensities.includes(input.intensity))
      throw simulationInvalid("Unknown frozen D16 communication intensity.");
    requireSelectionCode(
      input.decision,
      `${input.evidenceLevel}+${input.intensity}`
    );
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      evidenceLevel: input.evidenceLevel,
      intensity: input.intensity
    });
    return Object.freeze({
      ...payload,
      reference: `evidence-intensity-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindVerificationResponseDecisionV080(input) {
    requireSlot(input.decision, "D17");
    const response = assertVerificationResponseV080(input.response);
    requireSelectionCode(input.decision, response);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      response
    });
    return Object.freeze({
      ...payload,
      reference: `verification-response-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindDisclosureCorrectionDecisionV080(input) {
    requireSlot(input.decision, "D18");
    const response = assertDisclosureCorrectionResponseV080(input.response);
    requireSelectionCode(input.decision, response);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      response
    });
    return Object.freeze({
      ...payload,
      reference: `disclosure-correction-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindNextCyclePriorityDecisionV080(input) {
    requireSlot(input.decision, "D19");
    if (!nextCycleStrategicPrioritiesV080.includes(input.strategicPriority))
      throw simulationInvalid("Unknown frozen D19 strategic priority.");
    requireSelectionCode(input.decision, input.strategicPriority);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      strategicPriority: input.strategicPriority
    });
    return Object.freeze({
      ...payload,
      reference: `next-cycle-priority-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function bindNextCycleAmbitionDecisionV080(input) {
    requireSlot(input.decision, "D20");
    if (!nextCycleAmbitionsV080.includes(input.ambition))
      throw simulationInvalid("Unknown frozen D20 next-cycle ambition.");
    requireSelectionCode(input.decision, input.ambition);
    const payload = Object.freeze({
      provenance: "PLAYER_DECISION",
      decisionReference: input.decision.reference,
      ambition: input.ambition,
      target: nonBlank(input.target, "target"),
      capabilityGap: nonBlank(input.capabilityGap, "capabilityGap"),
      budgetIntent: nonBlank(input.budgetIntent, "budgetIntent")
    });
    return Object.freeze({
      ...payload,
      reference: `next-cycle-ambition-decision-v080:${deterministicSha256(payload)}`
    });
  }
  function requireSlot(decision, expectedSlotId) {
    if (!(decision instanceof PlayerDecisionRecordV080))
      throw simulationInvalid(
        "Executable decision binding requires a genuine player decision."
      );
    decision.assertGenuine();
    if (decision.slotId !== expectedSlotId)
      throw simulationInvalid("Decision binding used the wrong frozen D-slot.", {
        expectedSlotId,
        actualSlotId: decision.slotId
      });
  }
  function requireSelectionCode(decision, expectedSelectionCode) {
    if (decision.selectionCode !== expectedSelectionCode)
      throw simulationInvalid(
        "Player decision selectionCode does not match its governed executable value.",
        {
          slotId: decision.slotId,
          selectionCode: decision.selectionCode,
          expectedSelectionCode
        }
      );
  }

  // packages/simulation-core/src/teaching-v080-runtime.ts
  var teachingV080RoundCount = 8;
  var teachingV080CheckpointVersion = "CROCS_TEACHING_SIM_V080_CHECKPOINT_V1";
  var DecisionJournalV080 = class _DecisionJournalV080 {
    constructor(journalEntries) {
      this.journalEntries = journalEntries;
      Object.freeze(this.journalEntries);
      Object.freeze(this);
    }
    static empty() {
      return new _DecisionJournalV080(Object.freeze([]));
    }
    get entries() {
      return this.journalEntries;
    }
    get cursor() {
      return this.journalEntries.length;
    }
    get reference() {
      return `journal:${deterministicSha256(this.journalEntries)}`;
    }
    append(input) {
      const entryId = nonBlank(input.entryId, "entryId");
      if (this.journalEntries.some((entry2) => entry2.entryId === entryId))
        throw simulationInvalid("Decision journal entryId must be unique.", {
          entryId
        });
      const entry = Object.freeze({
        entryId,
        roundNumber: boundedRoundNumber(input.roundNumber),
        timestamp: nonBlank(input.timestamp, "timestamp"),
        provenance: "PLAYER_DECISION",
        stateBeforeReference: nonBlank(
          input.stateBeforeReference,
          "stateBeforeReference"
        ),
        decisionReference: nonBlank(input.decisionReference, "decisionReference"),
        rationale: optionalNonBlank3(input.rationale, "rationale"),
        eventContextReferences: normalizeReferences(
          input.eventContextReferences ?? [],
          "eventContextReferences"
        ),
        businessEffectReferences: normalizeReferences(
          input.businessEffectReferences ?? [],
          "businessEffectReferences"
        ),
        carbonEffectReferences: normalizeReferences(
          input.carbonEffectReferences ?? [],
          "carbonEffectReferences"
        ),
        stateAfterReference: nonBlank(
          input.stateAfterReference,
          "stateAfterReference"
        )
      });
      return new _DecisionJournalV080(
        Object.freeze([...this.journalEntries, entry])
      );
    }
  };
  var TeamSimulationV080 = class _TeamSimulationV080 {
    constructor(sessionId, teamId, roundNumber, roundReference2, roundPhase, checkpointReference) {
      this.sessionId = sessionId;
      this.teamId = teamId;
      this.roundNumber = roundNumber;
      this.roundReference = roundReference2;
      this.roundPhase = roundPhase;
      this.checkpointReference = checkpointReference;
      Object.freeze(this);
    }
    static create(input) {
      const sessionId = nonBlank(input.sessionId, "sessionId");
      const teamId = nonBlank(input.teamId, "teamId");
      return new _TeamSimulationV080(
        sessionId,
        teamId,
        1,
        roundReference(sessionId, teamId, 1),
        "ROUND_OPEN",
        void 0
      );
    }
    static fromCheckpoint(checkpoint) {
      return new _TeamSimulationV080(
        checkpoint.sessionId,
        checkpoint.teamId,
        checkpoint.roundNumber,
        checkpoint.roundReference,
        "CHECKPOINTED",
        checkpoint.checkpointId
      );
    }
    beginDecisionCollection() {
      return this.advancePhase("ROUND_OPEN", "DECISION_COLLECTION");
    }
    lockDecisions() {
      return this.advancePhase("DECISION_COLLECTION", "DECISION_LOCKED");
    }
    beginResolving() {
      return this.advancePhase("DECISION_LOCKED", "RESOLVING");
    }
    beginReview() {
      return this.advancePhase("RESOLVING", "REVIEW");
    }
    markCheckpointed(checkpointReference) {
      this.assertPhase("REVIEW");
      return new _TeamSimulationV080(
        this.sessionId,
        this.teamId,
        this.roundNumber,
        this.roundReference,
        "CHECKPOINTED",
        nonBlank(checkpointReference, "checkpointReference")
      );
    }
    openNextRound() {
      this.assertPhase("CHECKPOINTED");
      if (this.roundNumber >= teachingV080RoundCount)
        throw simulationInvalid("Round 8 has no successor teaching round.", {
          roundNumber: this.roundNumber
        });
      const nextRound = this.roundNumber + 1;
      return new _TeamSimulationV080(
        this.sessionId,
        this.teamId,
        nextRound,
        roundReference(this.sessionId, this.teamId, nextRound),
        "ROUND_OPEN",
        void 0
      );
    }
    advancePhase(expected, next) {
      this.assertPhase(expected);
      return new _TeamSimulationV080(
        this.sessionId,
        this.teamId,
        this.roundNumber,
        this.roundReference,
        next,
        void 0
      );
    }
    assertPhase(expected) {
      if (this.roundPhase !== expected)
        throw simulationInvalid(
          `TeamSimulationV080 must be ${expected} for this transition.`,
          { expected, actual: this.roundPhase }
        );
    }
  };
  function checkpointTeamSimulationV080(input) {
    if (input.team.roundPhase !== "REVIEW")
      throw simulationInvalid(
        "A v0.8 round checkpoint can only be created from REVIEW.",
        { roundPhase: input.team.roundPhase }
      );
    const checkpointPayload = Object.freeze({
      checkpointId: nonBlank(input.checkpointId, "checkpointId"),
      sessionId: input.team.sessionId,
      teamId: input.team.teamId,
      roundNumber: boundedRoundNumber(input.team.roundNumber),
      roundReference: input.team.roundReference,
      runtimeStateReference: nonBlank(
        input.runtimeStateReference,
        "runtimeStateReference"
      ),
      teamStateReference: nonBlank(
        input.teamStateReference,
        "teamStateReference"
      ),
      journalCursor: nonNegativeSafeInteger(
        input.journal.cursor,
        "journalCursor"
      ),
      checkpointVersion: teachingV080CheckpointVersion
    });
    const checkpoint = Object.freeze({
      ...checkpointPayload,
      checksum: checkpointChecksum(checkpointPayload)
    });
    return Object.freeze({
      checkpoint,
      team: input.team.markCheckpointed(checkpoint.checkpointId)
    });
  }
  function checkpointChecksum(payload) {
    return deterministicSha256(payload);
  }
  function roundReference(sessionId, teamId, roundNumber) {
    return `${sessionId}:${teamId}:round-${String(boundedRoundNumber(roundNumber))}`;
  }
  function boundedRoundNumber(value) {
    const roundNumber = positiveSafeInteger(value, "roundNumber");
    if (roundNumber > teachingV080RoundCount)
      throw simulationInvalid("v0.8 roundNumber must be between 1 and 8.", {
        roundNumber
      });
    return roundNumber;
  }
  function nonNegativeSafeInteger(value, field) {
    if (!Number.isSafeInteger(value) || value < 0)
      throw simulationInvalid(`${field} must be a non-negative safe integer.`, {
        field,
        value
      });
    return value;
  }
  function optionalNonBlank3(value, field) {
    return value === void 0 ? void 0 : nonBlank(value, field);
  }
  function normalizeReferences(references, field) {
    return Object.freeze(
      references.map((reference) => nonBlank(reference, field))
    );
  }

  // packages/simulation-core/src/teaching-v080-seed1.ts
  var teachingV080Seed1CalibrationVersion = "V080_SEED_1";
  var teachingV080Seed1Source = "explicit Product Owner approved v0.8 P2 Seed-1 baseline";
  var teachingV080Seed1ScenarioVersion = "CROCS_TEACHING_SIM_V080";
  var seedDefinitions = Object.freeze([
    ...choices(
      "P2_D4_REMEDIATION_COST_RATIO",
      "D4 remediation cost ratio",
      "fraction of opening available discretionary cash",
      { BASIC: 0.03, STANDARD: 0.06, DEEP: 0.1 }
    ),
    ...choices(
      "P2_D4_DATA_CAPABILITY_GAIN",
      "D4 executed DATA capability gain",
      "capability points",
      { BASIC: 3, STANDARD: 6, DEEP: 10 }
    ),
    ...choices(
      "P2_R3_INTENSITY_MULTIPLIER",
      "R3 investment intensity multiplier",
      "multiplier",
      { LOW: 0.75, MODERATE: 1, HIGH: 1.3 }
    ),
    ...choices(
      "P2_R3_PROJECT_BASE_COST_RATIO",
      "R3 project base cost ratio",
      "fraction of R3 opening available discretionary cash",
      {
        SOLAR_ENERGY_SHARE: 0.14,
        DECARBONIZATION_TECHNOLOGY: 0.11,
        EQUIPMENT_OPERATION_EFFICIENCY: 0.08,
        LOW_CARBON_SALES_LOGISTICS: 0.06
      },
      "Simulation cost share; never a BD P1 reduction ratio."
    ),
    ...choices("P2_R3_ACTIVATION_LAG", "R3 project activation lag", "rounds", {
      SHORT: 1,
      MEDIUM: 2,
      LONG: 3
    }),
    ...choices(
      "P2_R3_CURRENT_PAYMENT_RATIO",
      "R3 current payment ratio",
      "fraction of authorized investment",
      { SHORT: 1, MEDIUM: 0.7, LONG: 0.5 }
    ),
    ...choices(
      "P2_R3_FUTURE_OUTFLOW_RATIO",
      "R3 committed future outflow ratio",
      "fraction of authorized investment",
      { SHORT: 0, MEDIUM: 0.3, LONG: 0.5 }
    ),
    ...choices(
      "P2_R3_EXECUTED_ACTIVITY_IMPACT_RATIO",
      "R3 executed governed activity impact ratio",
      "fraction of governed activity value",
      { LOW: 0.03, MODERATE: 0.06, HIGH: 0.1 },
      "Executed business/activity change only; not Actual Reduction or Carbon Truth."
    ),
    ...choices(
      "P2_R3_CAPABILITY_GAIN",
      "R3 post-execution capability gain",
      "capability points",
      { LOW: 2, MODERATE: 4, HIGH: 7 }
    ),
    ...choices(
      "P2_R5_OFFSET_COVERAGE_RATIO",
      "R5 requested offset coverage",
      "fraction of governed remaining requirement",
      { NONE: 0, PARTIAL: 0.5, FULL_REMAINING_REQUIREMENT: 1 }
    ),
    Object.freeze({
      parameterId: "P2_R5_GOVERNED_UNIT_PRICE",
      name: "R5 governed offset and buffer unit price",
      value: 0.2,
      unit: "scenario currency per governed tCO2e unit"
    }),
    ...choices(
      "P2_R5_BUFFER_QUANTITY_RATIO",
      "R5 carbon asset buffer quantity ratio",
      "fraction of pre-offset governed remaining requirement",
      { NO_BUFFER: 0, LIMITED_BUFFER: 0.1, ROBUST_BUFFER: 0.25 }
    )
  ]);
  function choices(prefix, name, unit, values2, notes) {
    return Object.freeze(
      Object.entries(values2).map(
        ([choice, value]) => Object.freeze({
          parameterId: `${prefix}.${choice}`,
          name: `${name} \u2014 ${choice}`,
          value,
          unit,
          ...notes === void 0 ? {} : { notes }
        })
      )
    );
  }
  function createTeachingV080Seed1ParameterRegistry() {
    return seedDefinitions.reduce(
      (registry2, definition) => registry2.register({
        ...definition,
        parameterClass: "P2_SIMULATION_PARAMETER",
        source: teachingV080Seed1Source,
        scenarioVersion: teachingV080Seed1ScenarioVersion,
        calibrationVersion: teachingV080Seed1CalibrationVersion
      }),
      ParameterRegistryV080.empty()
    );
  }
  function createR3Seed1ActionEffectPackV080(input) {
    const intensity = selected(input.intensity, "D5");
    const projects = selected(input.portfolio, "D6");
    const horizon = selected(input.horizon, "D7");
    return P2ActionEffectPackV080.create({
      packId: `R3:${intensity}:${projects.join("+")}:${horizon}:${teachingV080Seed1CalibrationVersion}`,
      registry: input.registry,
      parameterIds: [
        `P2_R3_INTENSITY_MULTIPLIER.${intensity}`,
        ...projects.map(
          (projectId) => `P2_R3_PROJECT_BASE_COST_RATIO.${projectId}`
        ),
        `P2_R3_ACTIVATION_LAG.${horizon}`,
        `P2_R3_CURRENT_PAYMENT_RATIO.${horizon}`,
        `P2_R3_FUTURE_OUTFLOW_RATIO.${horizon}`,
        `P2_R3_EXECUTED_ACTIVITY_IMPACT_RATIO.${intensity}`,
        `P2_R3_CAPABILITY_GAIN.${intensity}`
      ]
    });
  }
  function parameter(registry2, parameterId) {
    if (!(registry2 instanceof ParameterRegistryV080))
      throw simulationInvalid(
        "Seed-1 resolver requires a genuine ParameterRegistryV080."
      );
    const result = registry2.require(parameterId);
    if (result.parameterClass !== "P2_SIMULATION_PARAMETER" || result.calibrationVersion !== teachingV080Seed1CalibrationVersion || result.source !== teachingV080Seed1Source || typeof result.value !== "number")
      throw simulationInvalid(
        "Resolver parameter is not an approved numeric v0.8 Seed-1 P2 value.",
        { parameterId }
      );
    return result;
  }
  function selected(binding, field) {
    if (!(binding.decision instanceof PlayerDecisionRecordV080))
      throw simulationInvalid(`${field} requires a genuine player decision.`);
    binding.decision.assertGenuine();
    if (binding.decision.reference !== binding.decisionReference)
      throw simulationInvalid(`${field} decision provenance is inconsistent.`);
    nonBlank(binding.decisionReference, `${field}.decisionReference`);
    nonBlank(binding.reference, `${field}.reference`);
    return binding.value;
  }
  var teachingV080ProjectActivityDomains = Object.freeze({
    SOLAR_ENERGY_SHARE: "PRODUCTION_ELECTRICITY",
    DECARBONIZATION_TECHNOLOGY: "PRODUCTION_MATERIAL_PROCESS",
    EQUIPMENT_OPERATION_EFFICIENCY: "PRODUCTION_EQUIPMENT_OPERATION",
    LOW_CARBON_SALES_LOGISTICS: "SALES_TRANSPORT_AND_EXHIBITION"
  });
  var teachingV080ProjectCapabilities = Object.freeze({
    SOLAR_ENERGY_SHARE: "ENERGY_EFFICIENCY",
    DECARBONIZATION_TECHNOLOGY: "PROCESS_REDUCTION",
    EQUIPMENT_OPERATION_EFFICIENCY: "EQUIPMENT_EFFICIENCY",
    LOW_CARBON_SALES_LOGISTICS: "CARBON_MANAGEMENT"
  });
  var pendingR3ProjectActionAuthority = Symbol(
    "pending-r3-project-action-v080"
  );
  var PendingR3ProjectActionV080 = class _PendingR3ProjectActionV080 {
    constructor(authority, status, projectId, activityDomain, sourceDecisionReferences, p2ParameterReferences, effectPackReference, authorizedRound, activationRound, capability, intensity, reference) {
      this.status = status;
      this.projectId = projectId;
      this.activityDomain = activityDomain;
      this.sourceDecisionReferences = sourceDecisionReferences;
      this.p2ParameterReferences = p2ParameterReferences;
      this.effectPackReference = effectPackReference;
      this.authorizedRound = authorizedRound;
      this.activationRound = activationRound;
      this.capability = capability;
      this.intensity = intensity;
      this.reference = reference;
      if (authority !== pendingR3ProjectActionAuthority)
        throw simulationInvalid(
          "Pending R3 project actions may be issued only by the R3 investment resolver."
        );
      Object.freeze(this.sourceDecisionReferences);
      Object.freeze(this.p2ParameterReferences);
      Object.freeze(this);
    }
    #nominal = true;
    static issue(input, authority) {
      if (authority !== pendingR3ProjectActionAuthority)
        throw simulationInvalid(
          "Pending R3 project action issuance authority is invalid."
        );
      const sourceDecisionReferences = input.sourceDecisionReferences.map(
        (reference, index) => nonBlank(reference, `sourceDecisionReferences[${String(index)}]`)
      );
      if (sourceDecisionReferences.length !== 3 || new Set(sourceDecisionReferences).size !== sourceDecisionReferences.length)
        throw simulationInvalid(
          "Pending R3 project action requires the exact unique D5/D6/D7 decision lineage."
        );
      const p2ParameterReferences = input.p2ParameterReferences.map(
        (reference, index) => nonBlank(reference, `p2ParameterReferences[${String(index)}]`)
      );
      if (p2ParameterReferences.length === 0 || new Set(p2ParameterReferences).size !== p2ParameterReferences.length)
        throw simulationInvalid(
          "Pending R3 project action requires unique governed P2 parameter lineage."
        );
      const payload = Object.freeze({
        status: input.status,
        projectId: input.projectId,
        activityDomain: input.activityDomain,
        sourceDecisionReferences: Object.freeze(sourceDecisionReferences),
        p2ParameterReferences: Object.freeze(p2ParameterReferences),
        effectPackReference: nonBlank(
          input.effectPackReference,
          "effectPackReference"
        ),
        authorizedRound: input.authorizedRound,
        activationRound: positiveSafeInteger(
          input.activationRound,
          "activationRound"
        ),
        capability: input.capability,
        intensity: input.intensity
      });
      return new _PendingR3ProjectActionV080(
        authority,
        payload.status,
        payload.projectId,
        payload.activityDomain,
        payload.sourceDecisionReferences,
        payload.p2ParameterReferences,
        payload.effectPackReference,
        payload.authorizedRound,
        payload.activationRound,
        payload.capability,
        payload.intensity,
        `r3-pending-project-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function resolveR3InvestmentV080(input) {
    const intensity = selected(input.intensity, "D5");
    const projects = selected(input.portfolio, "D6");
    const horizon = selected(input.horizon, "D7");
    const effectPack = createR3Seed1ActionEffectPackV080(input);
    if (projects.length === 0 || new Set(projects).size !== projects.length)
      throw simulationInvalid("R3 requires at least one unique project.");
    const multiplier = parameter(
      input.registry,
      `P2_R3_INTENSITY_MULTIPLIER.${intensity}`
    );
    const projectCosts = projects.map(
      (projectId) => parameter(input.registry, `P2_R3_PROJECT_BASE_COST_RATIO.${projectId}`)
    );
    const lag = parameter(input.registry, `P2_R3_ACTIVATION_LAG.${horizon}`);
    const payment = parameter(
      input.registry,
      `P2_R3_CURRENT_PAYMENT_RATIO.${horizon}`
    );
    const future = parameter(
      input.registry,
      `P2_R3_FUTURE_OUTFLOW_RATIO.${horizon}`
    );
    if (numberValue(payment) + numberValue(future) !== 1)
      throw simulationInvalid(
        "R3 current and future payment ratios must reconcile exactly to the authorized investment."
      );
    const technologyCostIndex = input.technologyCostIndex ?? 1;
    if (!Number.isFinite(technologyCostIndex) || technologyCostIndex < 0)
      throw simulationInvalid(
        "technologyCostIndex must be non-negative and finite."
      );
    const projectBaseCost = input.openingBusiness.availableDiscretionaryCash * projectCosts.reduce((sum, item) => sum + numberValue(item), 0) * technologyCostIndex;
    const authorizedInvestment = projectBaseCost * numberValue(multiplier);
    const currentInvestmentSpend = authorizedInvestment * numberValue(payment);
    const newCommittedFutureOutflow = authorizedInvestment * numberValue(future);
    const business = resolveBusinessRoundV080({
      ...unchangedBusinessInputs(input.openingBusiness),
      opening: input.openingBusiness,
      investmentSpend: currentInvestmentSpend,
      newCommittedFutureOutflow
    });
    const sharedReferences = Object.freeze([
      multiplier.reference,
      lag.reference,
      payment.reference,
      future.reference
    ]);
    const sourceDecisionReferences = Object.freeze([
      input.intensity.decisionReference,
      input.portfolio.decisionReference,
      input.horizon.decisionReference
    ]);
    const pendingActions = Object.freeze(
      projects.map((projectId, index) => {
        if (!(projectId in teachingV080ProjectActivityDomains))
          throw simulationInvalid("R3 project/domain mapping is invalid.", {
            projectId
          });
        return PendingR3ProjectActionV080.issue(
          {
            status: "PENDING_LAG",
            projectId,
            activityDomain: teachingV080ProjectActivityDomains[projectId],
            sourceDecisionReferences,
            p2ParameterReferences: Object.freeze([
              ...sharedReferences,
              requiredAt(projectCosts, index).reference
            ]),
            effectPackReference: effectPack.reference,
            authorizedRound: 3,
            activationRound: 3 + positiveSafeInteger(numberValue(lag), "activationLag"),
            capability: teachingV080ProjectCapabilities[projectId],
            intensity
          },
          pendingR3ProjectActionAuthority
        );
      })
    );
    return outcome("r3-investment", {
      provenance: "SIMULATION_OUTCOME",
      projectBaseCost,
      authorizedInvestment,
      currentInvestmentSpend,
      newCommittedFutureOutflow,
      business,
      pendingActions,
      effectPackReference: effectPack.reference,
      parameterReferences: Object.freeze([
        ...sharedReferences,
        ...projectCosts.map((item) => item.reference)
      ])
    });
  }
  var executedActivityAuthority = Symbol("executed-activity-v080");
  var ExecutedActivityFactV080 = class _ExecutedActivityFactV080 {
    constructor(authority, provenance, status, projectId, activityDomain, sourceDecisionReferences, p2ParameterReferences, authorizedRound, activationRound, executedRound, openingGovernedActivity, resultingGovernedActivity, capabilityChange, reference) {
      this.provenance = provenance;
      this.status = status;
      this.projectId = projectId;
      this.activityDomain = activityDomain;
      this.sourceDecisionReferences = sourceDecisionReferences;
      this.p2ParameterReferences = p2ParameterReferences;
      this.authorizedRound = authorizedRound;
      this.activationRound = activationRound;
      this.executedRound = executedRound;
      this.openingGovernedActivity = openingGovernedActivity;
      this.resultingGovernedActivity = resultingGovernedActivity;
      this.capabilityChange = capabilityChange;
      this.reference = reference;
      if (authority !== executedActivityAuthority)
        throw simulationInvalid(
          "Executed activity facts may be issued only by the R3 execution resolver."
        );
      Object.freeze(this.sourceDecisionReferences);
      Object.freeze(this.p2ParameterReferences);
      Object.freeze(this);
    }
    #nominal = true;
    static issue(input, authority) {
      const payload = Object.freeze({
        provenance: input.provenance,
        status: input.status,
        projectId: input.projectId,
        activityDomain: input.activityDomain,
        sourceDecisionReferences: Object.freeze([
          ...input.sourceDecisionReferences
        ]),
        p2ParameterReferences: Object.freeze([...input.p2ParameterReferences]),
        authorizedRound: input.authorizedRound,
        activationRound: input.activationRound,
        executedRound: input.executedRound,
        openingGovernedActivity: input.openingGovernedActivity,
        resultingGovernedActivity: input.resultingGovernedActivity,
        capabilityChange: input.capabilityChange
      });
      return new _ExecutedActivityFactV080(
        authority,
        payload.provenance,
        payload.status,
        payload.projectId,
        payload.activityDomain,
        payload.sourceDecisionReferences,
        payload.p2ParameterReferences,
        payload.authorizedRound,
        payload.activationRound,
        payload.executedRound,
        payload.openingGovernedActivity,
        payload.resultingGovernedActivity,
        payload.capabilityChange,
        `r3-executed-activity-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var ExecutedActivityCoreReductionHandoffV080 = class _ExecutedActivityCoreReductionHandoffV080 {
    constructor(executedActivity, plan, measure, executionFact, accountingUnit, targetCarbonActivity, resultingActivityDataRecord, afterSource, reference) {
      this.executedActivity = executedActivity;
      this.plan = plan;
      this.measure = measure;
      this.executionFact = executionFact;
      this.accountingUnit = accountingUnit;
      this.targetCarbonActivity = targetCarbonActivity;
      this.resultingActivityDataRecord = resultingActivityDataRecord;
      this.afterSource = afterSource;
      this.reference = reference;
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      if (!(input.executedActivity instanceof ExecutedActivityFactV080))
        throw simulationInvalid(
          "Core handoff requires a genuine executed activity."
        );
      input.executedActivity.assertGenuine();
      if (!(input.plan instanceof ReductionPlanAggregate) || !(input.measure instanceof ReductionMeasure) || !(input.executionFact instanceof ReductionExecutionFact) || !(input.accountingUnit instanceof ReductionAccountingUnit) || !(input.targetCarbonActivity instanceof CarbonActivityAggregate) || !(input.resultingActivityDataRecord instanceof ActivityDataRecordAggregate) || !(input.afterSource instanceof GovernedInventorySource))
        throw simulationInvalid(
          "Core handoff requires genuine Carbon Core objects."
        );
      input.measure.assertGenuine();
      input.executionFact.assertGenuine();
      input.accountingUnit.assertGenuine();
      input.afterSource.assertGenuine();
      const activity = input.executedActivity;
      const resultingQuantity = input.afterSource.emissionResult.activityQuantitySnapshot;
      if (input.plan.status !== "COMPLETED" || !input.plan.measures.includes(input.measure) || !input.plan.executionFacts.includes(input.executionFact) || !input.plan.accountingUnits.includes(input.accountingUnit) || !input.executionFact.measureId.equals(input.measure.id) || input.executionFact.target !== input.measure.target || !input.executionFact.target.carbonActivityReference.carbonActivityId.equals(
        input.targetCarbonActivity.id
      ) || input.targetCarbonActivity.activityDefinitionCode !== activity.activityDomain || input.afterSource.activityDataRecord !== input.resultingActivityDataRecord || !input.resultingActivityDataRecord.carbonActivityId.equals(
        input.afterSource.carbonActivity.id
      ) || resultingQuantity.unit !== activity.resultingGovernedActivity.unit || Number(resultingQuantity.value) !== activity.resultingGovernedActivity.value)
        throw simulationInvalid(
          "Executed activity is not the governed business fact represented by the Core handoff."
        );
      const payload = {
        executedActivityReference: activity.reference,
        reductionPlanId: input.plan.id.value,
        reductionMeasureId: input.measure.id.value,
        reductionExecutionFactId: input.executionFact.id.value,
        reductionAccountingUnitId: input.accountingUnit.id.value,
        targetCarbonActivityId: input.targetCarbonActivity.id.value,
        resultingActivityDataRecordId: input.resultingActivityDataRecord.id.value,
        afterSourceId: input.afterSource.id.value
      };
      return new _ExecutedActivityCoreReductionHandoffV080(
        activity,
        input.plan,
        input.measure,
        input.executionFact,
        input.accountingUnit,
        input.targetCarbonActivity,
        input.resultingActivityDataRecord,
        input.afterSource,
        `executed-activity-core-handoff-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function executeR3ProjectActionV080(input) {
    if (!(input.action instanceof PendingR3ProjectActionV080))
      throw simulationInvalid(
        "R3 execution rejects a forged pending project action."
      );
    input.action.assertGenuine();
    const executedRound = positiveSafeInteger(
      input.executedRound,
      "executedRound"
    );
    if (executedRound < input.action.activationRound)
      throw simulationInvalid(
        "R3 project activation round has not been reached."
      );
    const opening = governedActivity(
      input.openingGovernedActivity,
      "openingGovernedActivity"
    );
    if (input.action.p2ParameterReferences.length === 0)
      throw simulationInvalid("R3 executed activity requires P2 lineage.");
    if (teachingV080ProjectActivityDomains[input.action.projectId] !== input.action.activityDomain)
      throw simulationInvalid("R3 project/domain mapping is invalid.");
    const impact = parameter(
      input.registry,
      `P2_R3_EXECUTED_ACTIVITY_IMPACT_RATIO.${input.action.intensity}`
    );
    const gain = parameter(
      input.registry,
      `P2_R3_CAPABILITY_GAIN.${input.action.intensity}`
    );
    const resulting = Object.freeze({
      reference: `governed-activity-result-v080:${deterministicSha256({ source: opening.reference, projectId: input.action.projectId, impactReference: impact.reference, executedRound })}`,
      value: opening.value * (1 - numberValue(impact)),
      unit: opening.unit
    });
    const capabilityChange = applyAuthorizedCapabilityGainV080({
      opening: input.openingCapability,
      capability: input.action.capability,
      authorizedGain: numberValue(gain),
      sourceParameterReference: gain.reference
    });
    return ExecutedActivityFactV080.issue(
      {
        provenance: "SIMULATION_OUTCOME",
        status: "EXECUTED",
        projectId: input.action.projectId,
        activityDomain: input.action.activityDomain,
        sourceDecisionReferences: input.action.sourceDecisionReferences,
        p2ParameterReferences: Object.freeze([
          ...input.action.p2ParameterReferences,
          impact.reference,
          gain.reference
        ]),
        authorizedRound: input.action.authorizedRound,
        activationRound: input.action.activationRound,
        executedRound,
        openingGovernedActivity: opening,
        resultingGovernedActivity: resulting,
        capabilityChange
      },
      executedActivityAuthority
    );
  }
  function admitExecutedActivitiesToReductionV080(input) {
    if (input.executedActivities.length === 0)
      throw simulationInvalid(
        "Carbon Core reduction admission requires executed activity facts."
      );
    for (const activity of input.executedActivities) {
      if (!(activity instanceof ExecutedActivityFactV080))
        throw simulationInvalid(
          "Reduction admission rejects a forged executed activity."
        );
      activity.assertGenuine();
    }
    if (!(input.outcome instanceof ReductionOutcomeAggregate))
      throw simulationInvalid("Reduction outcome was structurally forged.");
    if (input.outcome.result === void 0)
      throw simulationInvalid(
        "Reduction outcome must be finalized by Carbon Core."
      );
    const plan = input.outcome.plan;
    if (plan === void 0 || plan.status !== "COMPLETED")
      throw simulationInvalid(
        "Executed activity admission requires the completed Carbon Core reduction plan."
      );
    if (input.handoffs.length !== input.executedActivities.length)
      throw simulationInvalid(
        "Every executed activity requires exactly one typed Carbon Core lineage binding."
      );
    const activities = new Set(input.executedActivities);
    const activityReferences = new Set(
      input.executedActivities.map((activity) => activity.reference)
    );
    if (activities.size !== input.executedActivities.length || activityReferences.size !== input.executedActivities.length)
      throw simulationInvalid("Executed activity references must be unique.");
    const boundActivities = /* @__PURE__ */ new Set();
    for (const handoff of input.handoffs) {
      if (!(handoff instanceof ExecutedActivityCoreReductionHandoffV080))
        throw simulationInvalid(
          "Reduction admission rejects a forged Core handoff."
        );
      handoff.assertGenuine();
      if (!activities.has(handoff.executedActivity) || boundActivities.has(handoff.executedActivity) || handoff.plan !== plan)
        throw simulationInvalid(
          "Executed activity does not identify the exact governed reduction plan lineage."
        );
      const comparison = input.outcome.comparisons.find(
        (item) => item.attribution.classification === "ACTIVE_REDUCTION" && item.attribution.measureId?.equals(handoff.measure.id) === true && item.attribution.executionFactId?.equals(handoff.executionFact.id) === true && item.attribution.accountingUnitId?.equals(handoff.accountingUnit.id) === true && item.afterSource === handoff.afterSource
      );
      if (comparison === void 0 || !handoff.accountingUnit.contributingMeasureIds.some(
        (id) => id.equals(handoff.measure.id)
      ))
        throw simulationInvalid(
          "Executed activity is unrelated to the finalized Carbon Core reduction outcome."
        );
      boundActivities.add(handoff.executedActivity);
    }
    const authorityReference = `executed-activity-core-lineage-v080:${deterministicSha256(
      input.handoffs.map((handoff) => handoff.reference)
    )}`;
    return adaptReductionOutcomeV080({
      outcome: input.outcome,
      coreSourceReference: authorityReference
    });
  }
  function resolveR4ProductCarbonV080(input) {
    if (input.results.length === 0)
      throw simulationInvalid(
        "R4 requires genuine Core Product Carbon; missing is not zero."
      );
    if (!(input.priorCarbonTruth instanceof CarbonTruthStateV080))
      throw simulationInvalid("R4 requires genuine prior Carbon Truth.");
    input.priorCarbonTruth.assertGenuine();
    const productCarbon = adaptProductCarbonResultsV080({
      results: input.results,
      coreSourceReference: input.coreSourceReference
    });
    const carbonTruth = createCarbonTruthStateV080({
      ...input.priorCarbonTruth.reduction === void 0 ? {} : { reduction: input.priorCarbonTruth.reduction },
      productCarbon,
      ...input.priorCarbonTruth.offset === void 0 ? {} : { offset: input.priorCarbonTruth.offset }
    });
    return outcome("r4-product-carbon", {
      business: input.business,
      productCarbon,
      carbonTruth
    });
  }
  function resolveR4ProductionV080(input) {
    const production = selected(input.production, "D8");
    return resolveBusinessRoundV080({
      ...unchangedBusinessInputs(input.openingBusiness),
      opening: input.openingBusiness,
      operatingCost: input.energyOperatingCost ?? 0,
      c1Production: production.c1Production,
      c2Production: production.c2Production
    });
  }
  function resolveR5EconomicsV080(input) {
    if (!(input.requirement instanceof OffsetRequirementSnapshot))
      throw simulationInvalid(
        "R5 requires a genuine governed remaining requirement."
      );
    input.requirement.assertGenuine();
    const offsetChoice = selected(input.offset, "D11");
    const bufferChoice = selected(input.buffer, "D12");
    const coverage = parameter(
      input.registry,
      `P2_R5_OFFSET_COVERAGE_RATIO.${offsetChoice}`
    );
    const buffer = parameter(
      input.registry,
      `P2_R5_BUFFER_QUANTITY_RATIO.${bufferChoice}`
    );
    const price = parameter(input.registry, "P2_R5_GOVERNED_UNIT_PRICE");
    const remaining = decimalNumber(
      input.requirement.operatingCarbonNetAfter.value,
      "remainingRequirement"
    );
    const requestedCoverageQuantity = remaining * numberValue(coverage);
    const bufferQuantity = remaining * numberValue(buffer);
    const carbonPriceIndex = input.carbonPriceIndex ?? 1;
    if (!Number.isFinite(carbonPriceIndex) || carbonPriceIndex < 0)
      throw simulationInvalid(
        "carbonPriceIndex must be non-negative and finite."
      );
    const effectivePrice = numberValue(price) * carbonPriceIndex;
    const offsetCashOutflow = requestedCoverageQuantity * effectivePrice;
    const bufferCashOutflow = bufferQuantity * effectivePrice;
    const business = resolveBusinessRoundV080({
      ...unchangedBusinessInputs(input.openingBusiness),
      opening: input.openingBusiness,
      carbonComplianceCost: offsetCashOutflow,
      carbonAssetBufferCashOutflow: bufferCashOutflow
    });
    return outcome("r5-economics", {
      provenance: "SIMULATION_OUTCOME",
      genuineRequirementReference: input.requirement.id.value,
      preOffsetRemainingRequirement: remaining,
      requestedCoverageQuantity,
      bufferQuantity,
      offsetCashOutflow,
      bufferCashOutflow,
      business,
      parameterReferences: Object.freeze([
        coverage.reference,
        buffer.reference,
        price.reference
      ])
    });
  }
  function admitR5OffsetSettlementV080(input) {
    if (!(input.settlement instanceof OffsetSettlementAggregate) || input.settlement.requirement.id.value !== input.economics.genuineRequirementReference)
      throw simulationInvalid(
        "R5 settlement must use the exact governed requirement used by economics."
      );
    input.priorCarbonTruth.assertGenuine();
    const offset = adaptOffsetSettlementV080({
      settlement: input.settlement,
      coreSourceReference: input.coreSourceReference
    });
    const carbonTruth = createCarbonTruthStateV080({
      ...input.priorCarbonTruth.reduction === void 0 ? {} : { reduction: input.priorCarbonTruth.reduction },
      ...input.priorCarbonTruth.productCarbon === void 0 ? {} : { productCarbon: input.priorCarbonTruth.productCarbon },
      offset
    });
    return outcome("r5-offset-admission", { offset, carbonTruth });
  }
  function unchangedBusinessInputs(opening) {
    return {
      roundRevenue: 0,
      operatingCost: 0,
      investmentSpend: 0,
      carbonComplianceCost: 0,
      dataEvidenceCost: 0,
      carbonAssetBufferCashOutflow: 0,
      c1Production: opening.c1Production,
      c2Production: opening.c2Production,
      c1Inventory: opening.c1Inventory,
      c2Inventory: opening.c2Inventory,
      productionCapacity: opening.productionCapacity
    };
  }
  function numberValue(item) {
    if (typeof item.value !== "number")
      throw simulationInvalid("Expected numeric P2 parameter.");
    return item.value;
  }
  function governedActivity(value, field) {
    return Object.freeze({
      reference: nonBlank(value.reference, `${field}.reference`),
      value: nonNegativeFinite(value.value, `${field}.value`),
      unit: nonBlank(value.unit, `${field}.unit`)
    });
  }
  function decimalNumber(value, field) {
    if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value))
      throw simulationInvalid(`${field} must be a non-negative decimal string.`);
    return nonNegativeFinite(Number(value), field);
  }
  function requiredAt(items, index) {
    const value = items[index];
    if (value === void 0) throw simulationInvalid("Required item is missing.");
    return value;
  }
  function outcome(prefix, payload) {
    return Object.freeze({
      ...payload,
      reference: `${prefix}-v080:${deterministicSha256(payload)}`
    });
  }

  // packages/simulation-core/src/teaching-v080-integrated-runtime.ts
  var IntegratedRuntimeStateV080 = class _IntegratedRuntimeStateV080 {
    constructor(business, capability, carbonTruth, marketOutcomeReferences, communicationOutcomeReferences, teachingEvidenceReferences, pendingR3ProjectActions, executedActivityFacts, reference) {
      this.business = business;
      this.capability = capability;
      this.carbonTruth = carbonTruth;
      this.reference = reference;
      this.marketOutcomeReferences = Object.freeze([...marketOutcomeReferences]);
      this.communicationOutcomeReferences = Object.freeze([
        ...communicationOutcomeReferences
      ]);
      this.teachingEvidenceReferences = Object.freeze([
        ...teachingEvidenceReferences
      ]);
      this.pendingR3ProjectActions = Object.freeze([...pendingR3ProjectActions]);
      this.executedActivityFacts = Object.freeze([...executedActivityFacts]);
      Object.freeze(this);
    }
    #nominal = true;
    marketOutcomeReferences;
    communicationOutcomeReferences;
    teachingEvidenceReferences;
    pendingR3ProjectActions;
    executedActivityFacts;
    static create(input) {
      if (!(input.carbonTruth instanceof CarbonTruthStateV080))
        throw simulationInvalid(
          "Integrated state requires genuine Carbon Truth state."
        );
      input.carbonTruth.assertGenuine();
      const market = normalizeReferences2(
        input.marketOutcomeReferences ?? [],
        "marketOutcomeReferences"
      );
      const communication = normalizeReferences2(
        input.communicationOutcomeReferences ?? [],
        "communicationOutcomeReferences"
      );
      const teaching = normalizeReferences2(
        input.teachingEvidenceReferences ?? [],
        "teachingEvidenceReferences"
      );
      const pending = Object.freeze([...input.pendingR3ProjectActions ?? []]);
      for (const action of pending) {
        if (!(action instanceof PendingR3ProjectActionV080))
          throw simulationInvalid(
            "Integrated state rejects a forged pending R3 project action."
          );
        action.assertGenuine();
      }
      const executed = Object.freeze([...input.executedActivityFacts ?? []]);
      for (const activity of executed) {
        if (!(activity instanceof ExecutedActivityFactV080))
          throw simulationInvalid(
            "Integrated state rejects a forged executed activity fact."
          );
        activity.assertGenuine();
      }
      const payload = Object.freeze({
        business: input.business,
        capability: input.capability,
        carbonTruthReference: input.carbonTruth.reference,
        market,
        communication,
        teaching,
        pendingActionReferences: pending.map((item) => item.reference),
        executedActivityReferences: executed.map((item) => item.reference)
      });
      return new _IntegratedRuntimeStateV080(
        input.business,
        input.capability,
        input.carbonTruth,
        market,
        communication,
        teaching,
        pending,
        executed,
        `integrated-runtime-state-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var IntegratedRoundDecisionSetV080 = class _IntegratedRoundDecisionSetV080 {
    constructor(round, decisions, actionPackages, reference) {
      this.round = round;
      this.reference = reference;
      this.decisions = Object.freeze([...decisions]);
      this.actionPackages = Object.freeze([...actionPackages]);
      Object.freeze(this);
    }
    #nominal = true;
    decisions;
    actionPackages;
    static create(input) {
      const requiredSlots = teachingV080DecisionSlotsForRound(input.round).map(
        (contract) => contract.slotId
      );
      if (input.decisions.length !== requiredSlots.length)
        throw simulationInvalid(
          "Integrated v0.8 round requires exactly the frozen decision slots for that round.",
          {
            round: input.round,
            expectedDecisionCount: requiredSlots.length,
            actualDecisionCount: input.decisions.length
          }
        );
      const decisionsBySlot = /* @__PURE__ */ new Map();
      for (const decision of input.decisions) {
        if (!(decision instanceof PlayerDecisionRecordV080))
          throw simulationInvalid(
            "Integrated round decision was structurally forged."
          );
        decision.assertGenuine();
        if (decision.round !== input.round)
          throw simulationInvalid(
            "Integrated round decision belongs to another round.",
            {
              expectedRound: input.round,
              actualRound: decision.round,
              slotId: decision.slotId
            }
          );
        if (decisionsBySlot.has(decision.slotId))
          throw simulationInvalid("Integrated round cannot duplicate a D-slot.", {
            slotId: decision.slotId
          });
        decisionsBySlot.set(decision.slotId, decision);
      }
      for (const slotId of requiredSlots)
        if (!decisionsBySlot.has(slotId))
          throw simulationInvalid(
            "Integrated round is missing a frozen D-slot.",
            {
              round: input.round,
              slotId
            }
          );
      for (const slotId of decisionsBySlot.keys())
        if (!requiredSlots.includes(slotId))
          throw simulationInvalid(
            "Integrated round contains a D-slot from another round.",
            {
              round: input.round,
              slotId
            }
          );
      if (input.actionPackages.length !== input.decisions.length)
        throw simulationInvalid(
          "Every integrated player decision requires exactly one authorized action package."
        );
      const packagesByDecision = /* @__PURE__ */ new Map();
      for (const actionPackage of input.actionPackages) {
        if (!(actionPackage instanceof AuthorizedActionPackageV080))
          throw simulationInvalid(
            "Authorized action package was structurally forged."
          );
        actionPackage.assertGenuine();
        const decisionReference = actionPackage.decision.reference;
        if (packagesByDecision.has(decisionReference))
          throw simulationInvalid(
            "Integrated round cannot duplicate an authorized action package."
          );
        if (!input.decisions.some(
          (decision) => decision.reference === decisionReference
        ))
          throw simulationInvalid(
            "Authorized action package does not belong to this round decision set."
          );
        packagesByDecision.set(decisionReference, actionPackage);
      }
      for (const decision of input.decisions)
        if (!packagesByDecision.has(decision.reference))
          throw simulationInvalid(
            "Integrated round is missing the action package for one decision.",
            { slotId: decision.slotId }
          );
      const orderedDecisions = Object.freeze(
        requiredSlots.map((slotId) => {
          const decision = decisionsBySlot.get(slotId);
          if (decision === void 0)
            throw simulationInvalid(
              "Frozen D-slot ordering could not be resolved."
            );
          return decision;
        })
      );
      const orderedPackages = Object.freeze(
        orderedDecisions.map((decision) => {
          const actionPackage = packagesByDecision.get(decision.reference);
          if (actionPackage === void 0)
            throw simulationInvalid(
              "Authorized action package ordering could not be resolved."
            );
          return actionPackage;
        })
      );
      const payload = Object.freeze({
        round: input.round,
        decisionReferences: orderedDecisions.map(
          (decision) => decision.reference
        ),
        actionPackageReferences: orderedPackages.map(
          (actionPackage) => actionPackage.reference
        )
      });
      return new _IntegratedRoundDecisionSetV080(
        input.round,
        orderedDecisions,
        orderedPackages,
        `integrated-round-decisions-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var IntegratedRoundExecutionReceiptV080 = class _IntegratedRoundExecutionReceiptV080 {
    constructor(provenance, round, stateBeforeReference, stateAfterReference, businessEffectReferences, carbonTruth, priorCarbonTruth, marketEffectReferences, communicationEffectReferences, teachingFeedbackReferences, executedReductionActivityReference, productCarbonAuthorityReference, enterpriseProfile, nextCycleCommitment, nextCycleSeed, reference) {
      this.provenance = provenance;
      this.round = round;
      this.stateBeforeReference = stateBeforeReference;
      this.stateAfterReference = stateAfterReference;
      this.carbonTruth = carbonTruth;
      this.priorCarbonTruth = priorCarbonTruth;
      this.executedReductionActivityReference = executedReductionActivityReference;
      this.productCarbonAuthorityReference = productCarbonAuthorityReference;
      this.enterpriseProfile = enterpriseProfile;
      this.nextCycleCommitment = nextCycleCommitment;
      this.nextCycleSeed = nextCycleSeed;
      this.reference = reference;
      this.businessEffectReferences = Object.freeze([
        ...businessEffectReferences
      ]);
      this.marketEffectReferences = Object.freeze([...marketEffectReferences]);
      this.communicationEffectReferences = Object.freeze([
        ...communicationEffectReferences
      ]);
      this.teachingFeedbackReferences = Object.freeze([
        ...teachingFeedbackReferences
      ]);
      Object.freeze(this);
    }
    #nominal = true;
    businessEffectReferences;
    marketEffectReferences;
    communicationEffectReferences;
    teachingFeedbackReferences;
    static issue(input) {
      teachingV080DecisionSlotsForRound(input.round);
      if (input.carbonTruth !== void 0) {
        if (!(input.carbonTruth instanceof CarbonTruthStateV080))
          throw simulationInvalid(
            "Integrated execution receipt accepts Carbon Truth only from genuine Wave 2 authority."
          );
        input.carbonTruth.assertGenuine();
      }
      if (input.priorCarbonTruth !== void 0) {
        if (!(input.priorCarbonTruth instanceof CarbonTruthStateV080))
          throw simulationInvalid(
            "Integrated execution receipt accepts prior Carbon Truth only from genuine Wave 2 authority."
          );
        input.priorCarbonTruth.assertGenuine();
      }
      const priorReductionReference = input.priorCarbonTruth?.reduction?.reference;
      const nextReductionReference = input.carbonTruth?.reduction?.reference;
      const reductionChanged = nextReductionReference !== void 0 && nextReductionReference !== priorReductionReference;
      if (reductionChanged && input.executedReductionActivityReference !== input.carbonTruth?.reduction?.coreSourceReference)
        throw simulationInvalid(
          "New or changed Reduction requires its exact executed-activity Core lineage authority."
        );
      if (!reductionChanged && input.carbonTruth !== void 0 && nextReductionReference !== priorReductionReference)
        throw simulationInvalid(
          "Unchanged Reduction must preserve the exact prior Core reference."
        );
      if (input.round === 4 && input.carbonTruth?.productCarbon !== void 0 && input.productCarbonAuthorityReference !== input.carbonTruth.productCarbon.reference)
        throw simulationInvalid(
          "R4 Product Carbon requires its exact Core authority reference."
        );
      if (input.round === 5 && input.carbonTruth !== void 0 && input.priorCarbonTruth === void 0)
        throw simulationInvalid(
          "R5 Carbon Truth admission requires the prior governed truth state."
        );
      if (input.round === 5 && input.priorCarbonTruth !== void 0) {
        const dueActivityAdmission = input.carbonTruth?.reduction?.reference !== input.priorCarbonTruth.reduction?.reference && input.executedReductionActivityReference === input.carbonTruth?.reduction?.coreSourceReference && input.productCarbonAuthorityReference === input.carbonTruth?.productCarbon?.reference;
        if (!dueActivityAdmission && (input.carbonTruth?.reduction?.reference !== input.priorCarbonTruth.reduction?.reference || input.carbonTruth?.productCarbon?.reference !== input.priorCarbonTruth.productCarbon?.reference))
          throw simulationInvalid(
            "R5 Offset cannot rewrite Reduction or Product Carbon."
          );
      }
      if (input.round === 8) {
        if (!(input.enterpriseProfile instanceof EnterpriseProfileV080))
          throw simulationInvalid(
            "R8 requires a genuine seven-dimensional enterprise profile."
          );
        input.enterpriseProfile.assertGenuine();
        if (!(input.nextCycleCommitment instanceof NextCycleCommitmentV080))
          throw simulationInvalid("R8 requires a genuine next-cycle commitment.");
        input.nextCycleCommitment.assertGenuine();
        if (!(input.nextCycleSeed instanceof NextCycleSeedV080))
          throw simulationInvalid("R8 requires a genuine next-cycle seed.");
        input.nextCycleSeed.assertGenuine();
        if (input.nextCycleSeed.sourceCommitmentReference !== input.nextCycleCommitment.reference)
          throw simulationInvalid(
            "R8 seed must derive from the supplied commitment."
          );
      }
      const businessEffectReferences = normalizeReferences2(
        input.businessEffectReferences ?? [],
        "businessEffectReferences"
      );
      const marketEffectReferences = normalizeReferences2(
        input.marketEffectReferences ?? [],
        "marketEffectReferences"
      );
      const communicationEffectReferences = normalizeReferences2(
        input.communicationEffectReferences ?? [],
        "communicationEffectReferences"
      );
      const teachingFeedbackReferences = normalizeReferences2(
        input.teachingFeedbackReferences ?? [],
        "teachingFeedbackReferences"
      );
      const payload = Object.freeze({
        provenance: "SIMULATION_OUTCOME",
        round: input.round,
        stateBeforeReference: nonBlank(
          input.stateBeforeReference,
          "stateBeforeReference"
        ),
        stateAfterReference: nonBlank(
          input.stateAfterReference,
          "stateAfterReference"
        ),
        businessEffectReferences,
        carbonTruthReference: input.carbonTruth?.reference,
        priorCarbonTruthReference: input.priorCarbonTruth?.reference,
        marketEffectReferences,
        communicationEffectReferences,
        teachingFeedbackReferences,
        executedReductionActivityReference: input.executedReductionActivityReference === void 0 ? void 0 : nonBlank(
          input.executedReductionActivityReference,
          "executedReductionActivityReference"
        ),
        productCarbonAuthorityReference: input.productCarbonAuthorityReference === void 0 ? void 0 : nonBlank(
          input.productCarbonAuthorityReference,
          "productCarbonAuthorityReference"
        ),
        enterpriseProfileReference: input.enterpriseProfile?.reference,
        nextCycleCommitmentReference: input.nextCycleCommitment?.reference,
        nextCycleSeedReference: input.nextCycleSeed?.reference
      });
      return new _IntegratedRoundExecutionReceiptV080(
        payload.provenance,
        payload.round,
        payload.stateBeforeReference,
        payload.stateAfterReference,
        payload.businessEffectReferences,
        input.carbonTruth,
        input.priorCarbonTruth,
        payload.marketEffectReferences,
        payload.communicationEffectReferences,
        payload.teachingFeedbackReferences,
        payload.executedReductionActivityReference,
        payload.productCarbonAuthorityReference,
        input.enterpriseProfile,
        input.nextCycleCommitment,
        input.nextCycleSeed,
        `integrated-round-execution-v080:${deterministicSha256(payload)}`
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  var IntegratedTeachingOrchestrationV080 = class _IntegratedTeachingOrchestrationV080 {
    constructor(rolePlan, team, journal, checkpoints, runtimeState) {
      this.rolePlan = rolePlan;
      this.team = team;
      this.journal = journal;
      this.runtimeState = runtimeState;
      this.checkpoints = Object.freeze([...checkpoints]);
      Object.freeze(this);
    }
    #nominal = true;
    checkpoints;
    static create(input) {
      if (!(input.rolePlan instanceof RolePlanV080))
        throw simulationInvalid(
          "Integrated orchestration requires a genuine RolePlanV080."
        );
      input.rolePlan.assertGenuine();
      input.runtimeState?.assertGenuine();
      return new _IntegratedTeachingOrchestrationV080(
        input.rolePlan,
        TeamSimulationV080.create(input),
        DecisionJournalV080.empty(),
        [],
        input.runtimeState
      );
    }
    completeRound(input) {
      const { nextRuntimeState, ...roundInput } = input;
      if (this.runtimeState === void 0 !== (nextRuntimeState === void 0))
        throw simulationInvalid(
          "Stateful orchestration requires a next runtime state for every round."
        );
      nextRuntimeState?.assertGenuine();
      if (nextRuntimeState !== void 0 && roundInput.runtimeStateReference !== nextRuntimeState.reference)
        throw simulationInvalid(
          "Checkpoint runtime state reference must match the genuine next state."
        );
      if (this.runtimeState !== void 0 && nextRuntimeState !== void 0) {
        this.runtimeState.assertGenuine();
        if (roundInput.execution.stateBeforeReference !== this.runtimeState.reference)
          throw simulationInvalid(
            "Execution stateBeforeReference must match the current integrated runtime state."
          );
        if (roundInput.execution.stateAfterReference !== nextRuntimeState.reference)
          throw simulationInvalid(
            "Execution stateAfterReference must match the next integrated runtime state."
          );
        const currentTruth = this.runtimeState.carbonTruth;
        const nextTruth = nextRuntimeState.carbonTruth;
        const truthChanged = nextTruth.reference !== currentTruth.reference;
        if (truthChanged) {
          if (roundInput.execution.carbonTruth !== nextTruth)
            throw simulationInvalid(
              "Changed Carbon Truth must be explicitly carried by the execution receipt."
            );
          if (roundInput.execution.priorCarbonTruth !== currentTruth)
            throw simulationInvalid(
              "Changed Carbon Truth requires the exact current truth as prior authority."
            );
        } else {
          if (roundInput.execution.carbonTruth !== void 0 && roundInput.execution.carbonTruth !== nextTruth)
            throw simulationInvalid(
              "Unchanged Carbon Truth receipt must match the exact next runtime truth."
            );
          if (roundInput.execution.priorCarbonTruth !== void 0 && roundInput.execution.priorCarbonTruth !== currentTruth)
            throw simulationInvalid(
              "Execution prior Carbon Truth must match the current runtime truth."
            );
        }
      }
      const roundTeam = this.team.roundPhase === "CHECKPOINTED" && this.team.roundNumber < 8 ? this.team.openNextRound() : this.team;
      const result = completeIntegratedRoundV080({
        ...roundInput,
        team: roundTeam,
        journal: this.journal
      });
      const expectedCursor = teachingV080DecisionSlotsForRound(result.team.roundNumber).length + this.journal.cursor;
      if (result.journal.cursor !== expectedCursor)
        throw simulationInvalid("Integrated journal cursor is inconsistent.");
      return new _IntegratedTeachingOrchestrationV080(
        this.rolePlan,
        result.team,
        result.journal,
        [...this.checkpoints, result.checkpoint],
        nextRuntimeState
      );
    }
    static resume(input) {
      if (!(input.rolePlan instanceof RolePlanV080) || !(input.team instanceof TeamSimulationV080) || !(input.journal instanceof DecisionJournalV080))
        throw simulationInvalid(
          "Integrated resume requires genuine runtime values."
        );
      input.rolePlan.assertGenuine();
      input.runtimeState?.assertGenuine();
      const latest = input.checkpoints.at(-1);
      if (latest === void 0 || latest.journalCursor !== input.journal.cursor || input.team.checkpointReference !== latest.checkpointId)
        throw simulationInvalid(
          "Integrated resume checkpoint and journal do not match."
        );
      if (input.runtimeState !== void 0 && latest.runtimeStateReference !== input.runtimeState.reference)
        throw simulationInvalid(
          "Integrated resume runtime state does not match its checkpoint."
        );
      return new _IntegratedTeachingOrchestrationV080(
        input.rolePlan,
        input.team,
        input.journal,
        input.checkpoints,
        input.runtimeState
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function completeIntegratedRoundV080(input) {
    if (!(input.team instanceof TeamSimulationV080))
      throw simulationInvalid(
        "Integrated round requires a genuine TeamSimulationV080."
      );
    if (!(input.journal instanceof DecisionJournalV080))
      throw simulationInvalid(
        "Integrated round requires a genuine DecisionJournalV080."
      );
    if (!(input.decisionSet instanceof IntegratedRoundDecisionSetV080))
      throw simulationInvalid(
        "Integrated round decision set was structurally forged."
      );
    input.decisionSet.assertGenuine();
    if (!(input.execution instanceof IntegratedRoundExecutionReceiptV080))
      throw simulationInvalid(
        "Integrated round execution receipt was structurally forged."
      );
    input.execution.assertGenuine();
    if (input.team.roundPhase !== "ROUND_OPEN")
      throw simulationInvalid("Integrated round must start from ROUND_OPEN.", {
        actualPhase: input.team.roundPhase
      });
    if (input.decisionSet.round !== input.team.roundNumber || input.execution.round !== input.team.roundNumber)
      throw simulationInvalid(
        "Integrated decision set and execution receipt must match the current team round.",
        {
          teamRound: input.team.roundNumber,
          decisionRound: input.decisionSet.round,
          executionRound: input.execution.round
        }
      );
    const collecting = input.team.beginDecisionCollection();
    const locked = collecting.lockDecisions();
    const resolving = locked.beginResolving();
    const review = resolving.beginReview();
    const eventContextReferences = normalizeReferences2(
      input.eventContextReferences ?? [],
      "eventContextReferences"
    );
    const carbonEffectReferences = input.execution.carbonTruth === void 0 ? Object.freeze([]) : Object.freeze([input.execution.carbonTruth.reference]);
    const allBusinessOutcomeReferences = Object.freeze([
      ...input.execution.businessEffectReferences,
      ...input.execution.marketEffectReferences,
      ...input.execution.communicationEffectReferences
    ]);
    let journal = input.journal;
    for (const decision of input.decisionSet.decisions) {
      journal = journal.append({
        entryId: `${decision.decisionId}:journal`,
        roundNumber: input.team.roundNumber,
        timestamp: nonBlank(input.timestamp, "timestamp"),
        stateBeforeReference: input.execution.stateBeforeReference,
        decisionReference: decision.reference,
        ...decision.rationale === void 0 ? {} : { rationale: decision.rationale },
        eventContextReferences,
        businessEffectReferences: allBusinessOutcomeReferences,
        carbonEffectReferences,
        stateAfterReference: input.execution.stateAfterReference
      });
    }
    const checkpointed = checkpointTeamSimulationV080({
      team: review,
      journal,
      checkpointId: nonBlank(input.checkpointId, "checkpointId"),
      runtimeStateReference: nonBlank(
        input.runtimeStateReference,
        "runtimeStateReference"
      ),
      teamStateReference: nonBlank(
        input.teamStateReference,
        "teamStateReference"
      )
    });
    return Object.freeze({
      team: checkpointed.team,
      journal,
      checkpoint: checkpointed.checkpoint,
      decisionSetReference: input.decisionSet.reference,
      executionReceiptReference: input.execution.reference
    });
  }
  function normalizeReferences2(references, field) {
    const normalized = references.map(
      (reference, index) => nonBlank(reference, `${field}[${String(index)}]`)
    );
    if (new Set(normalized).size !== normalized.length)
      throw simulationInvalid(`${field} must not contain duplicates.`);
    return Object.freeze(normalized);
  }

  // packages/simulation-core/src/teaching-v080-genuine-cycle-runner.ts
  function resolveGenuineTeachingRoundV080(input) {
    const expected = teachingV080DecisionSlotsForRound(input.round);
    if (input.boundRoundDecisions.length !== expected.length || !expected.every(
      ({ slotId }) => input.boundRoundDecisions.some((decision) => decision.slotId === slotId)
    ))
      throw simulationInvalid(
        "Genuine round requires its complete governed decision set.",
        {
          round: input.round
        }
      );
    return input.authorities.resolve({
      round: input.round,
      currentState: input.currentRuntimeState,
      decisions: input.boundRoundDecisions,
      environment: input.environment,
      ...input.eventContext === void 0 ? {} : { eventContext: input.eventContext }
    });
  }
  function executePendingR3ProjectsSequentiallyV080(input) {
    let capability = input.openingCapability;
    const executed = [];
    for (const action of input.actions) {
      const openingGovernedActivity = input.openingActivities[action.projectId];
      if (openingGovernedActivity === void 0)
        throw simulationInvalid("R4 is missing a governed opening activity.", {
          projectId: action.projectId
        });
      const fact = executeR3ProjectActionV080({
        registry: input.registry,
        action,
        executedRound: input.executedRound,
        openingGovernedActivity,
        openingCapability: capability
      });
      executed.push(fact);
      capability = fact.capabilityChange.closing;
    }
    return Object.freeze(executed);
  }

  // packages/platform-identity-access/src/actor.ts
  var Actor = class _Actor {
    id;
    actorType;
    #status = "ACTIVE";
    constructor(input) {
      this.id = input.id;
      this.actorType = input.actorType;
    }
    static create(input) {
      return new _Actor(input);
    }
    get status() {
      return this.#status;
    }
    suspend() {
      this.#status = "SUSPENDED";
    }
    resume() {
      if (this.#status === "SUSPENDED") {
        this.#status = "ACTIVE";
      }
    }
    retire() {
      this.#status = "RETIRED";
    }
  };

  // packages/platform-organization/src/enterprise-reference.ts
  var EnterpriseReference = class _EnterpriseReference {
    id;
    constructor(id) {
      this.id = id;
      Object.freeze(this);
    }
    static create(id) {
      if (id === void 0 || id === null) {
        throw new DomainError(
          "RE-INV-01",
          "A Reporting Entity must belong to exactly one Enterprise."
        );
      }
      return new _EnterpriseReference(id);
    }
    equals(other) {
      return this.id.equals(other.id);
    }
  };

  // packages/platform-organization/src/reporting-entity-membership.ts
  var reportingEntityMembershipRemoval = Symbol(
    "ReportingEntityMembershipRemoval"
  );
  var expectedMemberKind = {
    LEGAL_ENTITY: "LegalEntity",
    ORGANIZATION_UNIT: "OrganizationUnit",
    FACILITY: "Facility"
  };
  var ReportingEntityMembership = class _ReportingEntityMembership {
    id;
    reportingEntityVersionId;
    memberType;
    memberId;
    inclusionBasis;
    consolidationMethod;
    ownershipPercentage;
    controlBasis;
    validityPeriod;
    #status;
    constructor(input, status) {
      this.id = input.id;
      this.reportingEntityVersionId = input.reportingEntityVersionId;
      this.memberType = input.memberType;
      this.memberId = input.memberId;
      this.inclusionBasis = input.inclusionBasis;
      this.consolidationMethod = input.consolidationMethod;
      this.ownershipPercentage = input.ownershipPercentage;
      this.controlBasis = input.controlBasis;
      this.validityPeriod = input.validityPeriod;
      this.#status = status;
    }
    static create(input) {
      if (input.memberId.kind !== expectedMemberKind[input.memberType]) {
        throw new DomainError(
          "INVALID_REPORTING_ENTITY_MEMBER_REFERENCE",
          "Member type and member identifier kind must match."
        );
      }
      if (input.ownershipPercentage !== void 0 && (!Number.isFinite(input.ownershipPercentage) || input.ownershipPercentage < 0 || input.ownershipPercentage > 100)) {
        throw new DomainError(
          "INVALID_OWNERSHIP_PERCENTAGE",
          "Ownership percentage must be between 0 and 100."
        );
      }
      return new _ReportingEntityMembership(input, "ACTIVE");
    }
    get status() {
      return this.#status;
    }
    get isActive() {
      return this.#status === "ACTIVE";
    }
    representsSameMember(other) {
      return this.memberType === other.memberType && this.memberId.equals(other.memberId);
    }
    [reportingEntityMembershipRemoval]() {
      const ownership = this.ownershipPercentage === void 0 ? {} : { ownershipPercentage: this.ownershipPercentage };
      return new _ReportingEntityMembership(
        {
          id: this.id,
          reportingEntityVersionId: this.reportingEntityVersionId,
          memberType: this.memberType,
          memberId: this.memberId,
          inclusionBasis: this.inclusionBasis,
          consolidationMethod: this.consolidationMethod,
          controlBasis: this.controlBasis,
          validityPeriod: this.validityPeriod,
          ...ownership
        },
        "REMOVED"
      );
    }
  };

  // packages/platform-organization/src/reporting-entity-version.ts
  var reportingEntityVersionAggregateTransition = Symbol(
    "ReportingEntityVersionAggregateTransition"
  );
  var withdrawableStatuses = [
    "DRAFT",
    "UNDER_REVIEW",
    "APPROVED"
  ];
  var ReportingEntityVersion = class _ReportingEntityVersion {
    id;
    reportingEntityId;
    #validityPeriod;
    #status = "DRAFT";
    #memberships = /* @__PURE__ */ new Map();
    constructor(input) {
      this.id = input.id;
      this.reportingEntityId = input.reportingEntityId;
      this.#validityPeriod = input.validityPeriod;
    }
    static create(input) {
      return new _ReportingEntityVersion(input);
    }
    get status() {
      return this.#status;
    }
    get validityPeriod() {
      return this.#validityPeriod;
    }
    get memberships() {
      return [...this.#memberships.values()];
    }
    get activeMemberships() {
      return this.memberships.filter((membership) => membership.isActive);
    }
    updateValidityPeriod(validityPeriod) {
      this.assertContentMutable();
      const invalidMembership = this.activeMemberships.find(
        (membership) => !validityPeriod.contains(membership.validityPeriod)
      );
      if (invalidMembership !== void 0) {
        throw new DomainError(
          "RE-INV-04",
          "Membership validity must fall within Version validity."
        );
      }
      this.#validityPeriod = validityPeriod;
    }
    addMembership(membership) {
      this.assertContentMutable();
      if (!membership.reportingEntityVersionId.equals(this.id)) {
        throw new DomainError(
          "RE-MEMBERSHIP-VERSION-MISMATCH",
          "A Membership must belong to the Version that owns it."
        );
      }
      if (!this.#validityPeriod.contains(membership.validityPeriod)) {
        throw new DomainError(
          "RE-INV-04",
          "Membership validity must fall within Version validity."
        );
      }
      const overlappingMembership = this.activeMemberships.find(
        (candidate) => candidate.representsSameMember(membership) && candidate.validityPeriod.overlaps(membership.validityPeriod)
      );
      if (overlappingMembership !== void 0) {
        throw new DomainError(
          "RE-INV-05",
          "The same member cannot have overlapping active Memberships in one Version."
        );
      }
      if (this.#memberships.has(membership.id.value)) {
        throw new DomainError(
          "DUPLICATE_REPORTING_ENTITY_MEMBERSHIP",
          "Membership identifier already exists in this Version."
        );
      }
      this.#memberships.set(membership.id.value, membership);
    }
    removeMembership(id) {
      this.assertContentMutable();
      const membership = this.#memberships.get(id.value);
      if (membership === void 0) {
        throw new DomainError(
          "REPORTING_ENTITY_MEMBERSHIP_NOT_FOUND",
          "Membership does not exist in this Version."
        );
      }
      this.#memberships.set(
        id.value,
        membership[reportingEntityMembershipRemoval]()
      );
    }
    submitForReview() {
      this.assertStatus("DRAFT", "UNDER_REVIEW");
      this.assertHasIncludedMembership();
      this.#status = "UNDER_REVIEW";
    }
    approve() {
      this.assertStatus("UNDER_REVIEW", "APPROVED");
      this.assertHasIncludedMembership();
      this.#status = "APPROVED";
    }
    reject() {
      this.assertStatus("UNDER_REVIEW", "REJECTED");
      this.#status = "REJECTED";
    }
    withdraw() {
      if (!withdrawableStatuses.includes(this.#status)) {
        throw this.invalidTransition("WITHDRAWN");
      }
      this.#status = "WITHDRAWN";
    }
    [reportingEntityVersionAggregateTransition](transition) {
      if (transition === "ACTIVATE") {
        this.assertStatus("APPROVED", "ACTIVE");
        this.assertHasIncludedMembership();
        this.#status = "ACTIVE";
        return;
      }
      this.assertStatus("ACTIVE", "SUPERSEDED");
      this.#status = "SUPERSEDED";
    }
    assertContentMutable() {
      if (this.#status === "APPROVED" || this.#status === "ACTIVE" || this.#status === "SUPERSEDED") {
        throw new DomainError(
          "RE-INV-03",
          `${this.#status} Versions cannot be modified in place.`
        );
      }
      if (this.#status !== "DRAFT") {
        throw this.invalidTransition("DRAFT_CONTENT_UPDATE");
      }
    }
    assertHasIncludedMembership() {
      if (this.activeMemberships.length === 0) {
        throw new DomainError(
          "RE-INV-13",
          "A Version requires at least one valid included Membership."
        );
      }
    }
    assertStatus(expected, target) {
      if (this.#status !== expected) {
        throw this.invalidTransition(target);
      }
    }
    invalidTransition(target) {
      return new DomainError(
        "INVALID_STATE_TRANSITION",
        `ReportingEntityVersion cannot transition from ${this.#status} to ${target}.`
      );
    }
  };

  // packages/platform-organization/src/reporting-entity.ts
  var ReportingEntity = class _ReportingEntity {
    id;
    enterprise;
    #versions = /* @__PURE__ */ new Map();
    #operationalStatus;
    #activeVersionId;
    constructor(id, enterprise) {
      this.id = id;
      this.enterprise = enterprise;
    }
    static create(input) {
      if (input.enterprise === void 0 || input.enterprise === null) {
        throw new DomainError(
          "RE-INV-01",
          "A Reporting Entity must belong to exactly one Enterprise."
        );
      }
      return new _ReportingEntity(input.id, input.enterprise);
    }
    get status() {
      if (this.#operationalStatus !== void 0) {
        return this.#operationalStatus;
      }
      if (this.hasVersionInStatus("APPROVED")) {
        return "APPROVED";
      }
      if (this.hasVersionInStatus("UNDER_REVIEW")) {
        return "UNDER_REVIEW";
      }
      return "DRAFT";
    }
    get versions() {
      return [...this.#versions.values()];
    }
    get activeVersion() {
      return this.#activeVersionId === void 0 ? void 0 : this.#versions.get(this.#activeVersionId.value);
    }
    addVersion(version) {
      this.assertNotRetired();
      if (!version.reportingEntityId.equals(this.id)) {
        throw new DomainError(
          "REPORTING_ENTITY_VERSION_OWNER_MISMATCH",
          "A Version must belong to the Reporting Entity that owns it."
        );
      }
      if (this.#versions.has(version.id.value)) {
        throw new DomainError(
          "DUPLICATE_REPORTING_ENTITY_VERSION",
          "Version identifier already exists in this Reporting Entity."
        );
      }
      this.#versions.set(version.id.value, version);
    }
    activateVersion(id) {
      this.assertNotRetired();
      if (this.#operationalStatus === "SUSPENDED") {
        throw this.invalidTransition("ACTIVATE_VERSION");
      }
      const target = this.requireVersion(id);
      if (target.status !== "APPROVED") {
        throw this.invalidTransition("ACTIVATE_VERSION");
      }
      const formerActive = this.activeVersion;
      target[reportingEntityVersionAggregateTransition]("ACTIVATE");
      if (formerActive !== void 0 && !formerActive.id.equals(target.id)) {
        formerActive[reportingEntityVersionAggregateTransition]("SUPERSEDE");
      }
      this.#activeVersionId = target.id;
      this.#operationalStatus = "ACTIVE";
    }
    suspend() {
      if (this.status !== "ACTIVE") {
        throw this.invalidTransition("SUSPENDED");
      }
      this.#operationalStatus = "SUSPENDED";
    }
    resume() {
      if (this.status !== "SUSPENDED" || this.activeVersion === void 0) {
        throw this.invalidTransition("ACTIVE");
      }
      this.#operationalStatus = "ACTIVE";
    }
    retire() {
      if (this.status !== "ACTIVE" && this.status !== "SUSPENDED") {
        throw this.invalidTransition("RETIRED");
      }
      this.activeVersion?.[reportingEntityVersionAggregateTransition](
        "SUPERSEDE"
      );
      this.#activeVersionId = void 0;
      this.#operationalStatus = "RETIRED";
    }
    requireVersion(id) {
      const version = this.#versions.get(id.value);
      if (version === void 0) {
        throw new DomainError(
          "REPORTING_ENTITY_VERSION_NOT_FOUND",
          "Version does not belong to this Reporting Entity."
        );
      }
      return version;
    }
    hasVersionInStatus(status) {
      return this.versions.some((version) => version.status === status);
    }
    assertNotRetired() {
      if (this.#operationalStatus === "RETIRED") {
        throw new DomainError(
          "RE-INV-06",
          "A Retired Reporting Entity cannot receive new Versions or activations."
        );
      }
    }
    invalidTransition(target) {
      return new DomainError(
        "INVALID_STATE_TRANSITION",
        `ReportingEntity cannot transition from ${this.status} to ${target}.`
      );
    }
  };

  // packages/simulation-core/src/teaching-v080-r6r7-addendum.ts
  var teachingV080Seed1R6R7AddendumVersion = "V080_SEED_1_R6R7_A1";
  var teachingV080Seed1R6R7AddendumSource = "explicit Product Owner approved PR #129 R6/R7 additive Seed-1 calibration addendum";
  function createTeachingV080R6OpeningCommunicationStateV080() {
    return createCommunicationStateV080({
      awareness: 0.2,
      trust: 0.5,
      reputation: 0.4,
      greenMarketAccess: 0.3,
      disclosureCredibility: 0,
      latentDisclosureRisk: 0,
      governanceViolation: false
    });
  }
  var groups = {
    CHANNEL_COST: {
      FORMAL_REPORT: 2,
      CSR_REPORT: 2,
      WEBSITE: 1,
      PRESS_CONFERENCE: 3,
      DIRECT_GREEN_CUSTOMER: 1
    },
    EVIDENCE_COST: { BASIC: 1, VERIFIED: 2, ASSURED: 4 },
    INTENSITY_COST: { LOW: 0, STANDARD: 2, ACTIVE: 4 },
    TIMING_COST: {
      SCHEDULED: 0,
      IMMEDIATE: 1,
      BEFORE_GREEN_ORDER: 1,
      AFTER_MAJOR_CARBON_ACTION: 1
    },
    REACH: { LOW: 0.2, STANDARD: 0.5, ACTIVE: 0.8 },
    EVIDENCE_CREDIBILITY: { BASIC: 0.5, VERIFIED: 0.8, ASSURED: 0.95 },
    CLAIM_CREDIBILITY_FACTOR: { SUPPORTED: 1, FLAGGED: 0.25, AMBIGUOUS: 0.55 },
    RISK_EXPOSURE: { LOW: 0.35, STANDARD: 0.65, ACTIVE: 1 }
  };
  var scalars = {
    SUPPORTED_TRUST_GAIN: 0.2,
    SUPPORTED_REPUTATION_GAIN: 0.2,
    MARKET_ACCESS_GAIN: 0.25,
    FLAGGED_RISK_GAIN: 0.3,
    AMBIGUOUS_RISK_GAIN: 0.15,
    VERIFICATION_COST: 2,
    TRUST_LOSS: 0.5,
    REPUTATION_LOSS: 0.5,
    MARKET_ACCESS_LOSS: 0.5
  };
  function createTeachingV080Seed1R6R7AddendumRegistry() {
    let registry2 = ParameterRegistryV080.empty();
    for (const [group, values2] of Object.entries(groups))
      for (const [choice, value] of Object.entries(values2))
        registry2 = register(registry2, `P2_R6_${group}.${choice}`, value);
    for (const [name, value] of Object.entries(scalars))
      registry2 = register(
        registry2,
        `P2_${name.startsWith("VERIFICATION") || name.endsWith("_LOSS") ? "R7" : "R6"}_${name}`,
        value
      );
    return registry2;
  }
  function register(registry2, parameterId, value) {
    return registry2.register({
      parameterId,
      name: parameterId,
      value,
      unit: parameterId.includes("COST") ? "scenario currency" : "ratio",
      parameterClass: "P2_SIMULATION_PARAMETER",
      source: teachingV080Seed1R6R7AddendumSource,
      scenarioVersion: "CROCS_TEACHING_SIM_V080",
      calibrationVersion: teachingV080Seed1R6R7AddendumVersion
    });
  }
  function resolveTeachingV080R6Parameters(input) {
    const value = (id) => {
      const parameter3 = input.registry.require(id);
      if (typeof parameter3.value !== "number") throw new TypeError(id);
      return parameter3.value;
    };
    const map = (group, shape) => Object.fromEntries(
      Object.keys(shape).map((key) => [key, value(`P2_R6_${group}.${key}`)])
    );
    const parameters = {
      channelCost: map("CHANNEL_COST", groups.CHANNEL_COST),
      evidenceCost: map("EVIDENCE_COST", groups.EVIDENCE_COST),
      intensityCost: map("INTENSITY_COST", groups.INTENSITY_COST),
      timingCost: map("TIMING_COST", groups.TIMING_COST),
      reach: map("REACH", groups.REACH),
      evidenceCredibility: map(
        "EVIDENCE_CREDIBILITY",
        groups.EVIDENCE_CREDIBILITY
      ),
      claimCredibilityFactor: map(
        "CLAIM_CREDIBILITY_FACTOR",
        groups.CLAIM_CREDIBILITY_FACTOR
      ),
      riskExposure: map("RISK_EXPOSURE", groups.RISK_EXPOSURE),
      supportedTrustGain: value("P2_R6_SUPPORTED_TRUST_GAIN"),
      supportedReputationGain: value("P2_R6_SUPPORTED_REPUTATION_GAIN"),
      marketAccessGain: value("P2_R6_MARKET_ACCESS_GAIN"),
      flaggedRiskGain: value("P2_R6_FLAGGED_RISK_GAIN"),
      ambiguousRiskGain: value("P2_R6_AMBIGUOUS_RISK_GAIN")
    };
    return Object.freeze({
      parameters: Object.freeze(parameters),
      parameterReferences: Object.freeze(
        input.registry.list().filter((item) => item.parameterId.startsWith("P2_R6_")).map((item) => item.reference)
      )
    });
  }
  function resolveTeachingV080R7Parameters(input) {
    const required4 = [
      "P2_R7_VERIFICATION_COST",
      "P2_R7_TRUST_LOSS",
      "P2_R7_REPUTATION_LOSS",
      "P2_R7_MARKET_ACCESS_LOSS"
    ];
    const parameters = required4.map((id) => input.registry.require(id));
    const value = (index) => {
      const parameter3 = parameters[index];
      if (parameter3 === void 0 || typeof parameter3.value !== "number")
        throw new TypeError(required4[index]);
      return parameter3.value;
    };
    return Object.freeze({
      verificationCost: value(0),
      trustLoss: value(1),
      reputationLoss: value(2),
      marketAccessLoss: value(3),
      parameterReferences: Object.freeze(
        parameters.map((item) => item.reference)
      )
    });
  }

  // packages/simulation-core/src/teaching-v080-product-allocation-driver.ts
  var teachingV080ProductAllocationDriverDecision = "D-SIM-11=A";
  var teachingV080ProductAllocationDriverProvenance = "P2_SIMULATION_PARAMETER";
  var P2ProductAllocationDriverPackV080 = class _P2ProductAllocationDriverPackV080 {
    constructor(provenance, decisionAuthority, afterSource, afterDriverFact, allocationSemanticsReference, scenarioVersion2, calibrationVersion, parameterReferences, allocations, residual, reference) {
      this.provenance = provenance;
      this.decisionAuthority = decisionAuthority;
      this.afterSource = afterSource;
      this.afterDriverFact = afterDriverFact;
      this.allocationSemanticsReference = allocationSemanticsReference;
      this.scenarioVersion = scenarioVersion2;
      this.calibrationVersion = calibrationVersion;
      this.parameterReferences = parameterReferences;
      this.allocations = allocations;
      this.residual = residual;
      this.reference = reference;
      Object.freeze(this.parameterReferences);
      Object.freeze(this.allocations);
      Object.freeze(this);
    }
    #nominal = true;
    static create(input) {
      if (!(input.registry instanceof ParameterRegistryV080))
        throw simulationInvalid(
          "P2 product allocation driver requires a genuine ParameterRegistryV080."
        );
      if (!(input.afterSource instanceof GovernedInventorySource))
        throw simulationInvalid(
          "P2 product allocation driver requires a genuine governed After source."
        );
      input.afterSource.assertGenuine();
      assertExactAfterDriver(input.afterDriverFact, input.afterSource);
      const allocationSemanticsReference = nonBlank(
        input.allocationSemanticsReference,
        "allocationSemanticsReference"
      );
      if (input.shares.length === 0)
        throw simulationInvalid(
          "P2 product allocation driver requires at least one explicit product share."
        );
      const productSubjects = /* @__PURE__ */ new Set();
      const parameterIds = /* @__PURE__ */ new Set();
      const parameters = [];
      for (const [index, binding] of input.shares.entries()) {
        const productSubject = nonBlank(
          binding.productSubject,
          `shares[${String(index)}].productSubject`
        );
        const parameterId = nonBlank(
          binding.shareParameterId,
          `shares[${String(index)}].shareParameterId`
        );
        if (productSubjects.has(productSubject))
          throw simulationInvalid(
            "P2 product allocation driver product subjects must be unique.",
            { productSubject }
          );
        if (parameterIds.has(parameterId))
          throw simulationInvalid(
            "P2 product allocation driver parameter bindings must be unique.",
            { parameterId }
          );
        productSubjects.add(productSubject);
        parameterIds.add(parameterId);
        parameters.push(requireP2Share(input.registry, parameterId));
      }
      const scenarioVersions = new Set(
        parameters.map((item) => item.scenarioVersion)
      );
      const calibrationVersions = new Set(
        parameters.map((item) => item.calibrationVersion)
      );
      if (scenarioVersions.size !== 1 || calibrationVersions.size !== 1)
        throw simulationInvalid(
          "One P2 allocation driver pack must use one scenario and calibration version."
        );
      const scenarioVersion2 = parameters[0]?.scenarioVersion;
      const calibrationVersion = parameters[0]?.calibrationVersion;
      if (scenarioVersion2 === void 0 || calibrationVersion === void 0)
        throw simulationInvalid(
          "P2 allocation driver parameters require scenario and calibration versions."
        );
      const zero = CarbonQuantity.create(
        "0",
        input.afterSource.quantity.unit,
        input.afterSource.quantity.gasBasis
      );
      let allocatedTotal = zero;
      const allocations = input.shares.map((binding, index) => {
        const parameter3 = parameters[index];
        if (parameter3 === void 0 || typeof parameter3.value !== "number")
          throw simulationInvalid("P2 allocation share parameter is missing.");
        const productSubject = nonBlank(
          binding.productSubject,
          `shares[${String(index)}].productSubject`
        );
        const allocatedQuantity = input.afterSource.quantity.multiply(
          String(parameter3.value)
        );
        allocatedTotal = allocatedTotal.add(allocatedQuantity);
        return ProductAllocation.create({
          productSubject,
          allocatedQuantity,
          allocationReference: `p2-product-allocation-v080:${deterministicSha256({
            sourceId: input.afterSource.id.value,
            productSubject,
            parameterReference: parameter3.reference,
            allocationSemanticsReference
          })}`
        });
      });
      if (allocatedTotal.compare(input.afterSource.quantity) > 0)
        throw simulationInvalid(
          "P2 product allocation shares may not allocate more than the governed After source."
        );
      const residual = AllocationResidual.create(
        input.afterSource.quantity.subtractNonnegative(allocatedTotal),
        input.residualReason === void 0 ? "explicit P2 product-allocation residual" : nonBlank(input.residualReason, "residualReason"),
        `p2-product-allocation-residual-v080:${deterministicSha256({
          sourceId: input.afterSource.id.value,
          parameterReferences: parameters.map((item) => item.reference),
          allocationSemanticsReference
        })}`
      );
      const parameterReferences = Object.freeze(
        parameters.map((item) => item.reference)
      );
      const reference = `p2-product-allocation-driver-v080:${deterministicSha256({
        decisionAuthority: teachingV080ProductAllocationDriverDecision,
        sourceId: input.afterSource.id.value,
        activityDataRecordId: input.afterSource.activityDataRecord.id.value,
        activityId: input.afterSource.carbonActivity.id.value,
        driverMeasurementType: input.afterDriverFact.measurementType,
        driverLifecycleStatus: input.afterDriverFact.lifecycleStatus,
        driverQuantity: input.afterDriverFact.quantity?.value,
        allocationSemanticsReference,
        scenarioVersion: scenarioVersion2,
        calibrationVersion,
        parameterReferences
      })}`;
      return new _P2ProductAllocationDriverPackV080(
        teachingV080ProductAllocationDriverProvenance,
        teachingV080ProductAllocationDriverDecision,
        input.afterSource,
        input.afterDriverFact,
        allocationSemanticsReference,
        scenarioVersion2,
        calibrationVersion,
        parameterReferences,
        Object.freeze(allocations),
        residual,
        reference
      );
    }
    assertGenuine() {
      void this.#nominal;
    }
  };
  function requireP2Share(registry2, parameterId) {
    const parameter3 = registry2.require(parameterId);
    if (parameter3.parameterClass !== "P2_SIMULATION_PARAMETER" || parameter3.calibrationVersion === void 0 || typeof parameter3.value !== "number")
      throw simulationInvalid(
        "Product allocation driver shares must be explicit versioned P2 numeric parameters.",
        { parameterId }
      );
    unitInterval(parameter3.value, parameterId);
    return parameter3;
  }
  function assertExactAfterDriver(fact, source2) {
    if (!(fact instanceof ObservationFactReference))
      throw simulationInvalid(
        "P2 product allocation driver requires a genuine governed After driver fact."
      );
    if (!source2.activityDataRecord.observations.includes(fact))
      throw simulationInvalid(
        "P2 product allocation driver fact must be exact-owned by the After ActivityDataRecord."
      );
    if (fact.measurementType === "MISSING" || fact.quantity === void 0)
      throw simulationInvalid(
        "Missing product allocation driver evidence is not zero."
      );
    if (!["Captured", "Validated", "Consumed"].includes(fact.lifecycleStatus))
      throw simulationInvalid(
        "P2 product allocation driver fact lifecycle is not usable."
      );
    if (!fact.carbonActivityId.equals(source2.carbonActivity.id))
      throw simulationInvalid(
        "P2 product allocation driver fact must belong to the governed After activity."
      );
  }

  // packages/simulation-core/src/teaching-v080-genuine-carbon-builder.ts
  var sequence = 0;
  var fixtureInstant = /* @__PURE__ */ new Date("2025-06-01T00:00:00.000Z");
  var executionInstant = /* @__PURE__ */ new Date("2026-06-01T00:00:00.000Z");
  var actor = Actor.create({
    id: createActorId("actor-v080-dynamic-e2e"),
    actorType: "HUMAN"
  });
  var validity = () => ValidityPeriod.create(
    /* @__PURE__ */ new Date("2025-01-01T00:00:00.000Z"),
    /* @__PURE__ */ new Date("2027-01-01T00:00:00.000Z")
  );
  var metadata = () => ({
    eventId: createCarbonDomainEventId(
      `v080-dynamic-e2e-event-${String(++sequence)}`
    ),
    actorId: actor.id,
    occurredAt: fixtureInstant
  });
  function controlledChain(suffix, reportingEntity = suffix, existingVersion, contextIdentity = suffix, period = ["2025-01-01", "2025-12-31"]) {
    const version = existingVersion ?? ReportingEntityVersion.create({
      id: createReportingEntityVersionId(`version-${suffix}`),
      reportingEntityId: createReportingEntityId(`entity-${reportingEntity}`),
      validityPeriod: validity()
    });
    if (existingVersion === void 0) {
      version.addMembership(
        ReportingEntityMembership.create({
          id: createReportingEntityMembershipId(`membership-${suffix}`),
          reportingEntityVersionId: version.id,
          memberType: "FACILITY",
          memberId: createFacilityId(`facility-${suffix}`),
          inclusionBasis: "Operational control",
          consolidationMethod: "OperationalControl",
          controlBasis: "Confirmed",
          validityPeriod: validity()
        })
      );
      version.submitForReview();
      version.approve();
      const entity = ReportingEntity.create({
        id: version.reportingEntityId,
        enterprise: EnterpriseReference.create(
          createEnterpriseId(`enterprise-${reportingEntity}`)
        )
      });
      entity.addVersion(version);
      entity.activateVersion(version.id);
    }
    const organizationalBoundaryId = createOrganizationalBoundaryId(
      `org-${suffix}`
    );
    const operationalBoundaryId = createOperationalBoundaryId(`op-${suffix}`);
    const context = CarbonAccountingContext.create(
      {
        id: createCarbonAccountingContextId(`context-${contextIdentity}`),
        reportingEntityVersionId: version.id,
        reportingPeriod: ReportingPeriod.create(period[0], period[1]),
        organizationalBoundaryId,
        operationalBoundaryId,
        accountingPurpose: "v0.8 dynamic BD integration fixture",
        accountingStandardReferences: [
          AccountingStandardReference.create({
            code: `STD-${suffix}`,
            name: "Integration fixture standard",
            version: "1",
            issuer: "CROCS test authority",
            referenceRole: "Primary",
            effectiveDate: period[0],
            reference: `standard:${suffix}`
          })
        ],
        versionNumber: 1
      },
      { contextCreated: metadata(), reportingPeriodAssigned: metadata() }
    );
    const organizationalBoundary = OrganizationalBoundary.create(
      {
        id: organizationalBoundaryId,
        accountingContextId: context.id,
        consolidationApproach: "OperationalControl",
        versionNumber: 1,
        effectivePeriod: validity()
      },
      metadata()
    );
    organizationalBoundary.addEntry(
      OrganizationalBoundaryEntry.create({
        subject: OrganizationalSubjectReference.create({
          subjectType: "Facility",
          subjectId: createFacilityId(`boundary-facility-${suffix}`),
          validityPeriod: validity()
        }),
        treatment: "Included",
        controlAssessment: ControlAssessment.create({
          assessmentType: "OperationalControl",
          assessmentOutcome: "Confirmed",
          assessmentDate: "2025-01-15",
          evidenceReferenceIds: [],
          assessorActorId: actor.id
        }),
        boundaryDecisionIds: [],
        effectivePeriod: validity()
      }),
      metadata()
    );
    const operationalBoundary = OperationalBoundary.create(
      {
        id: operationalBoundaryId,
        accountingContextId: context.id,
        versionNumber: 1,
        effectivePeriod: validity()
      },
      metadata()
    );
    for (const scope of ["SCOPE_1", "SCOPE_2", "SCOPE_3"]) {
      operationalBoundary.addScopeCoverage(
        CarbonScopeCoverage.create({
          scope,
          coverageStatus: "Included",
          requirementStatus: "Required",
          boundaryDecisionIds: [],
          categories: [
            CarbonCategoryCoverage.create({
              category: SourceCategoryCode.create(scope, `category-${scope}`),
              coverageStatus: "Included",
              requirementStatus: "Required",
              materialityStatus: "Material",
              boundaryDecisionIds: []
            })
          ]
        }),
        metadata()
      );
    }
    context.submitForReview({
      organizationalBoundary,
      operationalBoundary,
      boundaryDecisions: [],
      eventMetadata: metadata()
    });
    context.makeEffective({
      reportingEntityVersion: version,
      organizationalBoundary,
      operationalBoundary,
      boundaryDecisions: [],
      actor,
      eventMetadata: metadata()
    });
    const freezing = (second) => FreezingMetadata.create({
      frozenByActorId: actor.id,
      frozenAt: /* @__PURE__ */ new Date(`2026-12-31T00:00:0${String(second)}.000Z`)
    });
    organizationalBoundary.freeze(freezing(0), [], metadata());
    operationalBoundary.freeze(freezing(1), [], metadata());
    context.freeze({
      organizationalBoundary,
      operationalBoundary,
      boundaryDecisions: [],
      freezingMetadata: freezing(2),
      eventMetadata: metadata()
    });
    return { version, context, organizationalBoundary, operationalBoundary };
  }
  function admitGovernedSource(inventory, chain, input) {
    const sourceAggregate = EmissionSourceAggregate.create(
      {
        id: createEmissionSourceId(`source-${input.suffix}`),
        reportingEntityVersionId: chain.version.id,
        accountingContextId: chain.context.id,
        sourceName: `source ${input.suffix}`,
        sourceCategory: SourceCategoryCode.create("SCOPE_1", "fixture"),
        validityPeriod: validity()
      },
      metadata()
    );
    sourceAggregate.register(metadata());
    sourceAggregate.activate(metadata());
    const activity = CarbonActivityAggregate.create(
      {
        id: createCarbonActivityId(`activity-${input.suffix}`),
        emissionSourceReference: sourceAggregate.toReference(),
        activityDefinitionCode: input.activityDefinitionCode,
        expectedUnit: "t",
        plannedPeriod: validity()
      },
      metadata()
    );
    activity.occur(ActivityOccurrence.at(fixtureInstant), metadata());
    const massObservationReference = ObservationReference.create({
      observationId: createObservationId(`mass-observation-${input.suffix}`),
      carbonActivityId: activity.id
    });
    activity.observe(massObservationReference, metadata());
    activity.record(metadata());
    const massFact = ObservationFactReference.create({
      observationReference: massObservationReference,
      fact: CapturedObservationFact.create({
        measurementType: "MEASURED",
        quantity: ActivityQuantity.create(input.carbonValue, "t"),
        expectedUnit: "t",
        capturedAt: fixtureInstant,
        evidenceReferenceIds: []
      }),
      lifecycleStatus: "Captured"
    });
    const countFact = (role, value) => ObservationFactReference.create({
      observationReference: ObservationReference.create({
        observationId: createObservationId(
          `${role}-observation-${input.suffix}`
        ),
        carbonActivityId: activity.id
      }),
      fact: CapturedObservationFact.create({
        measurementType: "MEASURED",
        quantity: ActivityQuantity.create(value, "item"),
        expectedUnit: "item",
        capturedAt: fixtureInstant,
        evidenceReferenceIds: []
      }),
      lifecycleStatus: "Captured"
    });
    const producedFact = input.producedQuantity === void 0 ? void 0 : countFact("produced", input.producedQuantity);
    const transferredFact = input.transferredQuantity === void 0 ? void 0 : countFact("transferred", input.transferredQuantity);
    const observations = [
      massFact,
      ...producedFact === void 0 ? [] : [producedFact],
      ...transferredFact === void 0 ? [] : [transferredFact]
    ];
    const record = ActivityDataRecordAggregate.create(
      {
        id: createActivityDataRecordId(`record-${input.suffix}`),
        carbonActivityId: activity.id,
        observations
      },
      metadata()
    );
    record.submit(metadata());
    record.accept(metadata());
    const trust = DataTrustAggregate.create(
      createDataTrustId(`trust-${input.suffix}`),
      ActivityDataRecordReference.create(record.id),
      metadata()
    );
    trust.addAssessment("assessment", "criterion", metadata());
    trust.completeAssessment("assessment", "pass", metadata());
    trust.linkEvidence(
      createEvidenceReferenceId(`trust-evidence-${input.suffix}`),
      metadata()
    );
    trust.recordLineage(`lineage-${input.suffix}`, metadata());
    trust.markNeedsReview(metadata());
    trust.verify(metadata());
    const applicability = FactorApplicability.create(
      "fixture",
      chain.context.id.value
    );
    const dataset = FactorDatasetVersion.create({
      id: createFactorDatasetVersionId(`dataset-${input.suffix}`),
      sourceIdentity: "fixture source",
      version: "1"
    });
    const factor = EmissionFactor.create({
      id: createEmissionFactorId(`factor-${input.suffix}`),
      datasetVersionReference: dataset.toReference(),
      value: ExactDecimal.parse("1"),
      unit: FactorUnit.create("t", "CO2E", "t"),
      applicability,
      validity: validity(),
      evidenceReferenceId: createEvidenceReferenceId(
        `factor-evidence-${input.suffix}`
      )
    });
    factor.publish();
    const selection = FactorSelection.create(
      createFactorSelectionId(`selection-${input.suffix}`),
      ActivityFactorSelectionContext.create({
        activityDataRecordId: record.id,
        admissionSnapshot: ActivityDataRecordAdmissionSnapshot.create(
          record.id,
          "Accepted"
        ),
        selectionSemanticsSnapshot: ActivityDataRecordSelectionSemanticsSnapshot.create({
          activityDataRecordId: record.id,
          applicability,
          quantityUnit: "t",
          relevantAt: fixtureInstant
        })
      })
    );
    selection.evaluate(
      trust,
      [factor],
      FactorSelectionPolicy.create(
        createFactorSelectionPolicyId(`policy-${input.suffix}`),
        "1"
      )
    );
    if (selection.frozenSelection === void 0)
      throw new Error("fixture selection did not freeze");
    const emissionResult = EmissionResult.calculate(
      createEmissionCalculationId(`calculation-${input.suffix}`),
      record.createCalculationSnapshot(massFact),
      selection.frozenSelection,
      fixtureInstant
    );
    const source2 = inventory.admitSource({
      id: createGovernedInventorySourceId(`governed-${input.suffix}`),
      emissionResult,
      activityDataRecord: record,
      carbonActivity: activity,
      emissionSource: sourceAggregate,
      accountingContext: chain.context,
      reportingEntityVersion: chain.version
    });
    return { source: source2, massFact, producedFact, transferredFact };
  }
  function closeInventory(inventory) {
    inventory.startReconciliation();
    inventory.markReconciled();
    inventory.close();
  }
  var baselineValues = ["160", "30", "12.5", "22.5", "120", "30", "50", "50"];
  var activityCodes = [
    "PROCUREMENT_STEEL",
    "PROCUREMENT_GLASS",
    "PROCUREMENT_PLASTIC",
    "PROCUREMENT_OTHER",
    "PRODUCTION_ELECTRICITY",
    "PRODUCTION_EQUIPMENT_OPERATION",
    "PRODUCTION_MATERIAL_PROCESS",
    "SALES_TRANSPORT_AND_EXHIBITION"
  ];
  function createBaseline(suffix) {
    const beforeChain = controlledChain(`${suffix}-before`);
    const baselineInventory = CarbonInventoryAggregate.create(
      createCarbonInventoryId(`baseline-inventory-${suffix}`),
      CarbonInventoryContextSnapshot.capture({
        reportingEntityVersion: beforeChain.version,
        accountingContext: beforeChain.context,
        reportingMassUnit: "t",
        carbonGasBasis: "CO2E"
      })
    );
    const baselineSources = baselineValues.map(
      (carbonValue, index) => admitGovernedSource(baselineInventory, beforeChain, {
        suffix: `${suffix}-baseline-${String(index)}`,
        carbonValue,
        activityDefinitionCode: activityCodes[index]
      })
    );
    const formation = [
      ["80", "40", "40"],
      ["16", "6", "8"],
      ["5", "1.5", "6"],
      ["12", "4.5", "6"],
      ["84", "36", "0"],
      ["21", "9", "0"],
      ["35", "15", "0"]
    ];
    formation.forEach(([c1, c2, residual], index) => {
      const source2 = baselineSources[index].source;
      baselineInventory.registerAllocation({
        source: source2,
        purpose: "PRODUCT_RESULT",
        allocationSemanticsReference: "governed-product-driver",
        allocations: [
          ProductAllocation.create({
            productSubject: "C1",
            allocatedQuantity: CarbonQuantity.create(c1, "t", "CO2E"),
            allocationReference: `baseline-c1-${suffix}-${String(index)}`
          }),
          ProductAllocation.create({
            productSubject: "C2",
            allocatedQuantity: CarbonQuantity.create(c2, "t", "CO2E"),
            allocationReference: `baseline-c2-${suffix}-${String(index)}`
          })
        ],
        residual: AllocationResidual.create(
          CarbonQuantity.create(residual, "t", "CO2E"),
          "P1 baseline explicit residual",
          `baseline-residual-${suffix}-${String(index)}`
        )
      });
    });
    baselineInventory.registerAllocation({
      source: baselineSources[7].source,
      purpose: "TRANSFER",
      allocationSemanticsReference: "governed-transfer-driver",
      allocations: [
        ProductAllocation.create({
          productSubject: "C1",
          allocatedQuantity: CarbonQuantity.create("39.9", "t", "CO2E"),
          allocationReference: `baseline-sales-c1-${suffix}`
        }),
        ProductAllocation.create({
          productSubject: "C2",
          allocatedQuantity: CarbonQuantity.create("10", "t", "CO2E"),
          allocationReference: `baseline-sales-c2-${suffix}`
        })
      ],
      residual: AllocationResidual.create(
        CarbonQuantity.create("0.1", "t", "CO2E"),
        "P1 baseline explicit sales residual",
        `baseline-sales-residual-${suffix}`
      )
    });
    closeInventory(baselineInventory);
    const baseline = ReductionBaselineSnapshot.capture({
      inventory: baselineInventory,
      governedSources: baselineSources.map((item) => item.source),
      capturedAt: fixtureInstant
    });
    const afterChain = controlledChain(
      `${suffix}-after`,
      `${suffix}-before`,
      beforeChain.version,
      `${suffix}-before`,
      ["2026-01-01", "2026-12-31"]
    );
    return { beforeChain, baseline, baselineSources, afterChain };
  }
  function createDynamicReductionPlan(fixture, suffix) {
    const targetIndexes = [4, 6, 5, 7];
    const plan = ReductionPlanAggregate.create({
      id: createReductionPlanId(`plan-${suffix}`),
      baseline: fixture.baseline,
      objective: ReductionObjective.create({
        statement: "Issue #127 dynamic P2 activity integration",
        targetPeriod: ReportingPeriod.create("2026-01-01", "2026-12-31"),
        targetSubject: OrganizationalSubjectReference.create({
          subjectType: "ReportingEntityVersion",
          subjectId: fixture.beforeChain.version.id
        })
      }),
      eventMetadata: metadata()
    });
    const measures = targetIndexes.map((sourceIndex, measureIndex) => {
      const baselineSource = fixture.baseline.governedSourceSnapshots[sourceIndex];
      return ReductionMeasure.create({
        id: createReductionMeasureId(`measure-${suffix}-${String(measureIndex)}`),
        target: ReductionTarget.create({
          baseline: fixture.baseline,
          governedInventorySourceId: baselineSource.governedInventorySourceId,
          emissionSourceReference: baselineSource.emissionSourceReference,
          carbonActivityReference: baselineSource.carbonActivityReference
        }),
        description: `test-only governed measure ${String(measureIndex)}`,
        expectedReduction: ExpectedReduction.rate("0.05"),
        responsibleSubject: OrganizationalSubjectReference.create({
          subjectType: "ReportingEntityVersion",
          subjectId: fixture.beforeChain.version.id
        })
      });
    });
    measures.forEach((measure) => {
      plan.addMeasure(measure, metadata());
    });
    plan.authorize(metadata());
    const facts = measures.map(
      (measure, index) => ReductionExecutionFact.create({
        id: createReductionExecutionFactId(
          `execution-${suffix}-${String(index)}`
        ),
        measureId: measure.id,
        target: measure.target,
        occurredAt: executionInstant,
        description: `P2 activity execution ${String(index)}`,
        evidenceReferenceIds: [
          createEvidenceReferenceId(
            `execution-evidence-${suffix}-${String(index)}`
          )
        ]
      })
    );
    facts.forEach((fact) => {
      plan.recordExecutionFact(fact, metadata());
    });
    const units = measures.map(
      (measure, index) => ReductionAccountingUnit.create({
        id: createReductionAccountingUnitId(`rau-${suffix}-${String(index)}`),
        baseline: fixture.baseline,
        baselineGovernedSourceIds: [measure.target.governedInventorySourceId],
        contributingMeasureIds: [measure.id]
      })
    );
    units.forEach((unit) => {
      plan.defineAccountingUnit(unit);
    });
    measures.forEach((measure) => {
      plan.completeMeasure(measure.id, metadata());
    });
    plan.completePlan(metadata());
    return { targetIndexes, plan, measures, facts, units };
  }
  function p2AllocationRegistry() {
    const scenarioVersion2 = "CROCS_TEACHING_SIM_V080_ISSUE_127";
    const calibrationVersion = "V080_DSIM11_ACCEPTANCE_1";
    const source2 = "Issue #127 explicit non-P1 acceptance input authorized by D-SIM-11=A";
    return [
      ["P2_127_FORMATION.C1", 0.61],
      ["P2_127_FORMATION.C2", 0.29],
      ["P2_127_TRANSFER.C1", 0.63],
      ["P2_127_TRANSFER.C2", 0.27]
    ].reduce(
      (registry2, [parameterId, value]) => registry2.register({
        parameterId: String(parameterId),
        name: `Issue #127 ${String(parameterId)} share`,
        value: Number(value),
        unit: "fraction",
        parameterClass: "P2_SIMULATION_PARAMETER",
        source: source2,
        scenarioVersion: scenarioVersion2,
        calibrationVersion
      }),
      ParameterRegistryV080.empty()
    );
  }
  function recordOffsetFact(requirement, input) {
    return OffsetResourceFact.record({
      id: createOffsetResourceFactId(`offset-fact-${input.suffix}`),
      resourceKind: input.resourceKind,
      movement: input.movement,
      quantity: CarbonQuantity.create(input.quantity, "t", "CO2E"),
      reportingEntityVersionId: requirement.reportingEntityVersionId,
      accountingContextId: requirement.accountingContextId,
      reportingPeriod: requirement.reportingPeriod,
      resourceLotReference: `lot:${input.suffix}`,
      evidenceReference: `evidence:${input.suffix}`,
      occurredAt: executionInstant
    });
  }
  function createGenuineBdCarbonChainV080(input) {
    const suffix = input.suffix;
    const fixture = createBaseline(suffix);
    const seed1 = createTeachingV080Seed1ParameterRegistry();
    const projects = input.projectIds ?? [
      "SOLAR_ENERGY_SHARE",
      "DECARBONIZATION_TECHNOLOGY",
      "EQUIPMENT_OPERATION_EFFICIENCY",
      "LOW_CARBON_SALES_LOGISTICS"
    ];
    const investmentHorizon = input.investmentHorizon ?? "SHORT";
    const c1Production = input.c1Production ?? 20;
    const c2Production = input.c2Production ?? 10;
    const d5 = PlayerDecisionRecordV080.create({
      decisionId: `${suffix}:d5`,
      slotId: "D5",
      round: 3,
      selectionCode: input.intensity
    });
    const d6 = PlayerDecisionRecordV080.create({
      decisionId: `${suffix}:d6`,
      slotId: "D6",
      round: 3,
      selectionCode: projects.join("+")
    });
    const d7 = PlayerDecisionRecordV080.create({
      decisionId: `${suffix}:d7`,
      slotId: "D7",
      round: 3,
      selectionCode: investmentHorizon
    });
    const investment = resolveR3InvestmentV080({
      registry: seed1,
      openingBusiness: createBusinessStateV080({
        cash: 500,
        liquidityReserve: 50,
        productionCapacity: 100
      }),
      intensity: bindReductionInvestmentDecisionV080({
        decision: d5,
        value: input.intensity
      }),
      portfolio: bindReductionPortfolioDecisionV080({
        decision: d6,
        projectIds: projects
      }),
      technologyCostIndex: input.technologyCostIndex,
      horizon: bindInvestmentHorizonDecisionV080({
        decision: d7,
        value: investmentHorizon
      })
    });
    const openingCapability = createCapabilityStateV080({
      energyEfficiency: 20,
      equipmentEfficiency: 20,
      processReduction: 20,
      carbonManagement: 20,
      data: 20,
      disclosure: 20
    });
    const openingValueByProject = {
      SOLAR_ENERGY_SHARE: 120,
      DECARBONIZATION_TECHNOLOGY: 50,
      EQUIPMENT_OPERATION_EFFICIENCY: 30,
      LOW_CARBON_SALES_LOGISTICS: 50
    };
    const executed = executePendingR3ProjectsSequentiallyV080({
      registry: seed1,
      actions: investment.pendingActions,
      executedRound: investmentHorizon === "SHORT" ? 4 : investmentHorizon === "MEDIUM" ? 5 : 6,
      openingCapability,
      openingActivities: Object.fromEntries(
        investment.pendingActions.map((action) => [
          action.projectId,
          {
            reference: `${suffix}:opening:${action.projectId}`,
            value: openingValueByProject[action.projectId],
            unit: "t"
          }
        ])
      )
    });
    const afterInventory = CarbonInventoryAggregate.create(
      createCarbonInventoryId(`after-inventory-${suffix}`),
      CarbonInventoryContextSnapshot.capture({
        reportingEntityVersion: fixture.afterChain.version,
        accountingContext: fixture.afterChain.context,
        reportingMassUnit: "t",
        carbonGasBasis: "CO2E"
      })
    );
    const executedValue = Object.fromEntries(
      executed.map((activity) => [
        activity.projectId,
        activity.resultingGovernedActivity.value
      ])
    );
    const afterValues = [
      "160",
      "30",
      "12.5",
      "22.5",
      String(executedValue.SOLAR_ENERGY_SHARE ?? 120),
      String(executedValue.EQUIPMENT_OPERATION_EFFICIENCY ?? 30),
      String(executedValue.DECARBONIZATION_TECHNOLOGY ?? 50),
      String(executedValue.LOW_CARBON_SALES_LOGISTICS ?? 50)
    ];
    const afterSources = afterValues.map(
      (carbonValue, index) => admitGovernedSource(afterInventory, fixture.afterChain, {
        suffix: `${suffix}-after-${String(index)}`,
        carbonValue,
        activityDefinitionCode: activityCodes[index],
        ...index === 0 ? { producedQuantity: String(c1Production), transferredQuantity: "15" } : {},
        ...index === 1 ? { producedQuantity: String(c2Production), transferredQuantity: "5" } : {}
      })
    );
    afterSources.slice(0, 4).forEach((item) => {
      afterInventory.postSource("IN", item.source);
    });
    afterSources.slice(4, 7).forEach((item) => {
      afterInventory.postSource("ADD", item.source);
    });
    const governedPlan = createDynamicReductionPlan(fixture, suffix);
    const reductionOutcome = ReductionOutcomeAggregate.create({
      id: createReductionOutcomeId(`outcome-${suffix}`),
      baseline: fixture.baseline,
      targetPeriod: ReportingPeriod.create("2026-01-01", "2026-12-31"),
      plan: governedPlan.plan
    });
    const measureIndexBySource = /* @__PURE__ */ new Map([
      [4, 0],
      [6, 1],
      [5, 2],
      [7, 3]
    ]);
    const projectBySource = /* @__PURE__ */ new Map([
      [4, "SOLAR_ENERGY_SHARE"],
      [6, "DECARBONIZATION_TECHNOLOGY"],
      [5, "EQUIPMENT_OPERATION_EFFICIENCY"],
      [7, "LOW_CARBON_SALES_LOGISTICS"]
    ]);
    afterSources.forEach((item, sourceIndex) => {
      const measureIndex = measureIndexBySource.get(sourceIndex);
      const project2 = projectBySource.get(sourceIndex);
      const attribution = measureIndex === void 0 || project2 === void 0 || !executed.some((activity) => activity.projectId === project2) ? ReductionAttribution.otherOrUnresolved() : ReductionAttribution.active({
        accountingUnitId: governedPlan.units[measureIndex].id,
        measureId: governedPlan.measures[measureIndex].id,
        executionFactId: governedPlan.facts[measureIndex].id
      });
      reductionOutcome.assess({
        baselineSourceId: fixture.baseline.governedSourceSnapshots[sourceIndex].governedInventorySourceId,
        afterSource: item.source,
        attribution,
        eventMetadata: metadata()
      });
    });
    const reductionResult = reductionOutcome.finalize(metadata());
    const afterIndexByExecuted = [4, 6, 5, 7];
    const projectIndex = new Map(
      [
        "SOLAR_ENERGY_SHARE",
        "DECARBONIZATION_TECHNOLOGY",
        "EQUIPMENT_OPERATION_EFFICIENCY",
        "LOW_CARBON_SALES_LOGISTICS"
      ].map((projectId, index) => [projectId, index])
    );
    const handoffs = executed.map((activity) => {
      const index = projectIndex.get(activity.projectId);
      const after = afterSources[afterIndexByExecuted[index]];
      const baseline = fixture.baselineSources[afterIndexByExecuted[index]];
      return ExecutedActivityCoreReductionHandoffV080.create({
        executedActivity: activity,
        plan: governedPlan.plan,
        measure: governedPlan.measures[index],
        executionFact: governedPlan.facts[index],
        accountingUnit: governedPlan.units[index],
        targetCarbonActivity: baseline.source.carbonActivity,
        resultingActivityDataRecord: after.source.activityDataRecord,
        afterSource: after.source
      });
    });
    const reduction = admitExecutedActivitiesToReductionV080({
      executedActivities: executed,
      handoffs,
      outcome: reductionOutcome
    });
    const priorCarbonTruth = createCarbonTruthStateV080({ reduction });
    const propagation = ReductionProductPropagation.create({
      finalizedOutcome: reductionOutcome,
      afterInventory
    });
    const c1Produced = propagation.recognizeProductQuantity({
      productSubject: "C1",
      quantityRole: "PRODUCED",
      source: afterSources[0].source,
      observationFact: afterSources[0].producedFact
    });
    const allocationRegistry = p2AllocationRegistry();
    const contributionTypes = [
      "DIRECT",
      "DIRECT",
      "DIRECT",
      "DIRECT",
      "ALLOCATED",
      "AMORTIZED",
      "ALLOCATED",
      "ALLOCATED"
    ];
    afterSources.forEach((item, index) => {
      const transfer = index === 7;
      const pack = P2ProductAllocationDriverPackV080.create({
        registry: allocationRegistry,
        afterSource: item.source,
        afterDriverFact: item.massFact,
        allocationSemanticsReference: transfer ? "governed-transfer-driver" : "governed-product-driver",
        shares: transfer ? [
          { productSubject: "C1", shareParameterId: "P2_127_TRANSFER.C1" },
          { productSubject: "C2", shareParameterId: "P2_127_TRANSFER.C2" }
        ] : [
          {
            productSubject: "C1",
            shareParameterId: "P2_127_FORMATION.C1"
          },
          {
            productSubject: "C2",
            shareParameterId: "P2_127_FORMATION.C2"
          }
        ]
      });
      propagation.register({
        contribution: RecognizedCarbonContribution.recognize({
          id: `${suffix}-contribution-${String(index)}`,
          afterSource: item.source,
          quantity: item.source.quantity,
          type: contributionTypes[index],
          allocationSemanticsReference: pack.allocationSemanticsReference,
          afterDriverFact: pack.afterDriverFact,
          afterDriverActivity: item.source.carbonActivity.toReference()
        }),
        allocations: pack.allocations,
        residual: pack.residual
      });
    });
    const c2Produced = propagation.recognizeProductQuantity({
      productSubject: "C2",
      quantityRole: "PRODUCED",
      source: afterSources[1].source,
      observationFact: afterSources[1].producedFact
    });
    const c1 = propagation.issueProductResult(
      createProductCarbonResultId(`${suffix}-product-c1`),
      c1Produced
    );
    const c2 = propagation.issueProductResult(
      createProductCarbonResultId(`${suffix}-product-c2`),
      c2Produced
    );
    const c1Transferred = propagation.recognizeProductQuantity({
      productSubject: "C1",
      quantityRole: "TRANSFERRED",
      source: afterSources[0].source,
      observationFact: afterSources[0].transferredFact
    });
    const c2Transferred = propagation.recognizeProductQuantity({
      productSubject: "C2",
      quantityRole: "TRANSFERRED",
      source: afterSources[1].source,
      observationFact: afterSources[1].transferredFact
    });
    const transferC1 = propagation.issueTransferResult(
      createProductCarbonTransferResultId(`${suffix}-transfer-c1`),
      c1,
      c1Transferred
    );
    const transferC2 = propagation.issueTransferResult(
      createProductCarbonTransferResultId(`${suffix}-transfer-c2`),
      c2,
      c2Transferred
    );
    afterInventory.postTransfer(transferC1);
    afterInventory.postTransfer(transferC2);
    const d8 = PlayerDecisionRecordV080.create({
      decisionId: `${suffix}:d8`,
      slotId: "D8",
      round: 4,
      selectionCode: `c1Production=${String(c1Production)};c2Production=${String(c2Production)}`
    });
    const r4Business = resolveR4ProductionV080({
      openingBusiness: input.r4OpeningBusiness ?? investment.business.closing,
      energyOperatingCost: input.baseEnergyOperatingCost * input.energyPriceIndex,
      production: bindProductionMixDecisionV080({
        decision: d8,
        c1Production,
        c2Production,
        productionCapacity: 100
      })
    });
    const r4 = resolveR4ProductCarbonV080({
      business: r4Business,
      priorCarbonTruth,
      results: [c1, c2],
      coreSourceReference: `${suffix}:genuine-core-product-carbon`
    });
    closeInventory(afterInventory);
    const requirement = OffsetRequirementSnapshot.capture({
      id: createOffsetRequirementSnapshotId(`${suffix}-requirement`),
      inventory: afterInventory,
      capturedAt: executionInstant
    });
    const d11 = PlayerDecisionRecordV080.create({
      decisionId: `${suffix}:d11`,
      slotId: "D11",
      round: 5,
      selectionCode: input.offsetIntensity
    });
    const d12 = PlayerDecisionRecordV080.create({
      decisionId: `${suffix}:d12`,
      slotId: "D12",
      round: 5,
      selectionCode: input.buffer
    });
    const economics = resolveR5EconomicsV080({
      registry: seed1,
      openingBusiness: input.r5OpeningBusiness ?? r4Business.closing,
      requirement,
      offset: bindOffsetIntensityDecisionV080({
        decision: d11,
        value: input.offsetIntensity
      }),
      carbonPriceIndex: input.carbonPriceIndex,
      buffer: bindCarbonAssetBufferDecisionV080({
        decision: d12,
        value: input.buffer
      })
    });
    const settlement = OffsetSettlementAggregate.create({
      id: createOffsetSettlementId(`${suffix}-settlement`),
      requirement
    });
    settlement.register(
      recordOffsetFact(requirement, {
        suffix: `${suffix}-opening`,
        resourceKind: "OPENING_BALANCE",
        movement: "OPENING",
        quantity: "0"
      })
    );
    settlement.register(
      recordOffsetFact(requirement, {
        suffix: `${suffix}-coverage`,
        resourceKind: "MARKET_ALLOWANCE",
        movement: "ACQUIRE",
        quantity: String(economics.requestedCoverageQuantity)
      })
    );
    settlement.register(
      recordOffsetFact(requirement, {
        suffix: `${suffix}-buffer`,
        resourceKind: "MARKET_ALLOWANCE",
        movement: "ACQUIRE",
        quantity: String(economics.bufferQuantity)
      })
    );
    settlement.register(
      recordOffsetFact(requirement, {
        suffix: `${suffix}-disposal`,
        resourceKind: "MARKET_ALLOWANCE",
        movement: "DISPOSE",
        quantity: "0"
      })
    );
    const settlementResult = settlement.finalize();
    const foreignRequirement = OffsetRequirementSnapshot.capture({
      id: createOffsetRequirementSnapshotId(`${suffix}-foreign-requirement`),
      inventory: afterInventory,
      capturedAt: executionInstant
    });
    const foreignSettlement = OffsetSettlementAggregate.create({
      id: createOffsetSettlementId(`${suffix}-foreign-settlement`),
      requirement: foreignRequirement
    });
    const r5 = admitR5OffsetSettlementV080({
      settlement,
      economics,
      priorCarbonTruth: r4.carbonTruth,
      coreSourceReference: `${suffix}:genuine-core-offset`
    });
    return {
      investment,
      openingCapability,
      executed,
      r4Business,
      r4,
      economics,
      r5,
      requirement
    };
  }

  // packages/simulation-core/src/teaching-v080-genuine-calibration-authority.ts
  var teachingV080Genuine510EnvironmentIdentity = "V080_GENUINE_510_ENV_A1";
  var teachingV080Genuine510MarketIdentity = "V080_GENUINE_510_MARKET_A1";
  var source = "CROCS_TEACHING_SIM_V0_8_GENUINE_510_CALIBRATION_A1 / D-129-P2-08..12 Option A";
  var scenarioVersion = "CROCS_TEACHING_SIM_V0_8";
  var approvedMarketValues = Object.freeze({
    productSubject: "C2",
    productThreshold: 13,
    minimumDisclosureCredibility: 0.5,
    minimumGreenMarketAccess: 0.5,
    requiredCapacityPerAward: 10,
    regularRevenueFull: 100,
    mixedRegularRevenueShare: 0.5,
    greenRevenuePerAwardAtDemandIndex1: 50,
    productCarbonWeight: 1,
    trustWeight: 1,
    reputationWeight: 1,
    disclosureCredibilityWeight: 1,
    availableGreenOrders: 1
  });
  function registry(entries, calibrationVersion) {
    return entries.reduce(
      (current, [parameterId, name, value, unit]) => current.register({
        parameterId,
        name,
        value,
        unit,
        parameterClass: "P2_SIMULATION_PARAMETER",
        source,
        scenarioVersion,
        calibrationVersion
      }),
      ParameterRegistryV080.empty()
    );
  }
  function createTeachingV080Genuine510EnvironmentRegistry() {
    const entries = [];
    for (const dimension of [
      "carbonPriceIndex",
      "energyPriceIndex",
      "greenDemandIndex",
      "technologyCostIndex"
    ])
      for (const [level, value] of [
        ["LOW", 0.8],
        ["BASE", 1],
        ["HIGH", 1.2]
      ])
        entries.push([
          `genuine510.environment.${dimension}.${level}`,
          `${dimension} ${level}`,
          value,
          "index"
        ]);
    for (const [level, value] of [
      ["LOW", 0.25],
      ["BASE", 0.5],
      ["HIGH", 0.75]
    ])
      entries.push([
        `genuine510.environment.verificationIntensity.${level}`,
        `verificationIntensity ${level}`,
        value,
        "intensity"
      ]);
    entries.push([
      "genuine510.environment.calibrationScrutinyBaseline",
      "Calibration scrutiny baseline",
      0.5,
      "intensity"
    ]);
    entries.push([
      "genuine510.environment.baseEnergyOperatingCost",
      "Base production energy operating cost",
      10,
      "scenario currency"
    ]);
    return registry(entries, teachingV080Genuine510EnvironmentIdentity);
  }
  function resolveTeachingV080Genuine510OpeningEnvironment(environment) {
    const r = createTeachingV080Genuine510EnvironmentRegistry();
    const value = (dimension, level) => environmentNumber(
      r,
      `genuine510.environment.${dimension}.${level}`,
      level === "LOW" ? dimension === "verificationIntensity" ? 0.25 : 0.8 : level === "HIGH" ? dimension === "verificationIntensity" ? 0.75 : 1.2 : dimension === "verificationIntensity" ? 0.5 : 1
    );
    const baseEnergyOperatingCost = environmentNumber(
      r,
      "genuine510.environment.baseEnergyOperatingCost",
      10
    );
    const baseVerificationIntensity = environmentNumber(
      r,
      "genuine510.environment.verificationIntensity.BASE",
      0.5
    );
    return Object.freeze({
      energyPriceIndex: value("energyPriceIndex", environment.energyPrice),
      carbonPriceIndex: value("carbonPriceIndex", environment.carbonPrice),
      greenDemandIndex: value("greenDemandIndex", environment.greenDemand),
      technologyCostIndex: value(
        "technologyCostIndex",
        environment.technologyCost
      ),
      verificationIntensity: value(
        "verificationIntensity",
        environment.verificationIntensity
      ),
      scrutinyIntensity: Number(
        r.require("genuine510.environment.calibrationScrutinyBaseline").value
      ),
      baseEnergyOperatingCost,
      baseVerificationIntensity,
      parameterReferences: Object.freeze(r.list().map((item) => item.reference))
    });
  }
  function createTeachingV080Genuine510MarketRegistry() {
    return registry(
      [
        [
          "genuine510.market.productSubject",
          "Calibration market subject",
          approvedMarketValues.productSubject,
          "subject"
        ],
        [
          "genuine510.market.productThreshold",
          "Product threshold",
          approvedMarketValues.productThreshold,
          "tCO2e/unit"
        ],
        [
          "genuine510.market.minimumDisclosureCredibility",
          "Minimum disclosure credibility",
          approvedMarketValues.minimumDisclosureCredibility,
          "ratio"
        ],
        [
          "genuine510.market.minimumGreenMarketAccess",
          "Minimum green market access",
          approvedMarketValues.minimumGreenMarketAccess,
          "ratio"
        ],
        [
          "genuine510.market.requiredCapacityPerAward",
          "Required capacity per award",
          approvedMarketValues.requiredCapacityPerAward,
          "unit"
        ],
        [
          "genuine510.market.regularRevenueFull",
          "Regular revenue full",
          approvedMarketValues.regularRevenueFull,
          "scenario currency"
        ],
        [
          "genuine510.market.mixedRegularRevenueShare",
          "Mixed regular revenue share",
          approvedMarketValues.mixedRegularRevenueShare,
          "ratio"
        ],
        [
          "genuine510.market.greenRevenuePerAwardAtDemandIndex1",
          "Green revenue per award",
          approvedMarketValues.greenRevenuePerAwardAtDemandIndex1,
          "scenario currency"
        ],
        ...[
          "productCarbon",
          "trust",
          "reputation",
          "disclosureCredibility"
        ].map(
          (weight) => [
            `genuine510.market.weight.${weight}`,
            `${weight} weight`,
            approvedMarketValues[`${weight}Weight`],
            "weight"
          ]
        ),
        [
          "genuine510.market.availableGreenOrders.BASE",
          "Base available green orders",
          approvedMarketValues.availableGreenOrders,
          "order"
        ]
      ],
      teachingV080Genuine510MarketIdentity
    );
  }
  function resolveTeachingV080Genuine510MarketParameters(input = {}) {
    const registry2 = input.registry ?? createTeachingV080Genuine510MarketRegistry();
    const required4 = (id, expected) => {
      const parameter3 = registry2.require(id);
      if (parameter3.parameterClass !== "P2_SIMULATION_PARAMETER" || parameter3.source !== source || parameter3.scenarioVersion !== scenarioVersion || parameter3.calibrationVersion !== teachingV080Genuine510MarketIdentity || parameter3.value !== expected)
        throw simulationInvalid(
          "Invalid genuine 510 governed market parameter.",
          { parameterId: id }
        );
      return parameter3;
    };
    const values2 = {
      productSubject: required4(
        "genuine510.market.productSubject",
        approvedMarketValues.productSubject
      ),
      productThreshold: required4(
        "genuine510.market.productThreshold",
        approvedMarketValues.productThreshold
      ),
      minimumDisclosureCredibility: required4(
        "genuine510.market.minimumDisclosureCredibility",
        approvedMarketValues.minimumDisclosureCredibility
      ),
      minimumGreenMarketAccess: required4(
        "genuine510.market.minimumGreenMarketAccess",
        approvedMarketValues.minimumGreenMarketAccess
      ),
      requiredCapacityPerAward: required4(
        "genuine510.market.requiredCapacityPerAward",
        approvedMarketValues.requiredCapacityPerAward
      ),
      regularRevenueFull: required4(
        "genuine510.market.regularRevenueFull",
        approvedMarketValues.regularRevenueFull
      ),
      mixedRegularRevenueShare: required4(
        "genuine510.market.mixedRegularRevenueShare",
        approvedMarketValues.mixedRegularRevenueShare
      ),
      greenRevenuePerAwardAtDemandIndex1: required4(
        "genuine510.market.greenRevenuePerAwardAtDemandIndex1",
        approvedMarketValues.greenRevenuePerAwardAtDemandIndex1
      ),
      productCarbon: required4(
        "genuine510.market.weight.productCarbon",
        approvedMarketValues.productCarbonWeight
      ),
      trust: required4(
        "genuine510.market.weight.trust",
        approvedMarketValues.trustWeight
      ),
      reputation: required4(
        "genuine510.market.weight.reputation",
        approvedMarketValues.reputationWeight
      ),
      disclosureCredibility: required4(
        "genuine510.market.weight.disclosureCredibility",
        approvedMarketValues.disclosureCredibilityWeight
      ),
      availableGreenOrders: required4(
        "genuine510.market.availableGreenOrders.BASE",
        approvedMarketValues.availableGreenOrders
      )
    };
    const number = (parameter3) => {
      if (typeof parameter3.value !== "number")
        throw simulationInvalid(
          "Genuine 510 market numeric parameter is unavailable.",
          { parameterId: parameter3.parameterId }
        );
      return parameter3.value;
    };
    return Object.freeze({
      productSubject: String(values2.productSubject.value),
      parameters: Object.freeze({
        productThreshold: {
          value: number(values2.productThreshold),
          unit: "t",
          gasBasis: "CO2E"
        },
        minimumDisclosureCredibility: number(values2.minimumDisclosureCredibility),
        minimumGreenMarketAccess: number(values2.minimumGreenMarketAccess),
        requiredCapacityPerAward: number(values2.requiredCapacityPerAward),
        regularRevenueFull: number(values2.regularRevenueFull),
        mixedRegularRevenueShare: number(values2.mixedRegularRevenueShare),
        greenRevenuePerAwardAtDemandIndex1: number(
          values2.greenRevenuePerAwardAtDemandIndex1
        ),
        weights: {
          productCarbon: number(values2.productCarbon),
          trust: number(values2.trust),
          reputation: number(values2.reputation),
          disclosureCredibility: number(values2.disclosureCredibility)
        }
      }),
      availableGreenOrders: number(values2.availableGreenOrders),
      opportunityParameterReferences: Object.freeze([
        values2.regularRevenueFull.reference,
        values2.mixedRegularRevenueShare.reference,
        values2.greenRevenuePerAwardAtDemandIndex1.reference,
        values2.availableGreenOrders.reference
      ]),
      parameterReferences: Object.freeze(
        Object.values(values2).map((parameter3) => parameter3.reference)
      )
    });
  }
  function environmentNumber(registry2, parameterId, expected) {
    const parameter3 = registry2.require(parameterId);
    if (parameter3.parameterClass !== "P2_SIMULATION_PARAMETER" || parameter3.source !== source || parameter3.scenarioVersion !== scenarioVersion || parameter3.calibrationVersion !== teachingV080Genuine510EnvironmentIdentity || parameter3.value !== expected)
      throw simulationInvalid(
        "Invalid genuine 510 governed environment parameter.",
        { parameterId }
      );
    return expected;
  }
  function createTeachingV080Genuine510EventSchedule(eventSeed) {
    const definitions = {
      11: [],
      23: [
        event(23, 3, "LOW_CARBON_TECH_COST_DECLINE", "MEDIUM", {
          technologyCostDelta: -0.2
        }),
        event(23, 4, "ENERGY_PRICE_RELIEF", "LOW", { energyPriceDelta: -0.1 })
      ],
      37: [
        event(37, 5, "CARBON_PRICE_INCREASE", "HIGH", { carbonPriceDelta: 0.3 }),
        event(37, 7, "VERIFICATION_CAMPAIGN", "MEDIUM", {
          verificationIntensityDelta: 0.2
        })
      ],
      53: [
        event(53, 6, "GREEN_DEMAND_SURGE", "MEDIUM", { greenDemandDelta: 0.2 }),
        event(53, 6, "MAJOR_GREEN_BUYER_TENDER", "LOW", { greenOrderDelta: 1 })
      ],
      71: [
        event(71, 6, "GREENWASHING_SCRUTINY", "HIGH", {
          scrutinyIntensityDelta: 0.3
        }),
        event(71, 7, "VERIFICATION_CAMPAIGN", "MEDIUM", {
          verificationIntensityDelta: 0.2
        })
      ],
      97: [
        event(97, 4, "ENERGY_PRICE_INCREASE", "HIGH", { energyPriceDelta: 0.3 }),
        event(97, 5, "CARBON_PRICE_INCREASE", "MEDIUM", {
          carbonPriceDelta: 0.2
        }),
        event(97, 6, "GREEN_DEMAND_COOLING", "LOW", { greenDemandDelta: -0.1 })
      ]
    };
    const selected2 = definitions[eventSeed];
    if (selected2 === void 0)
      throw new Error(`Unsupported genuine 510 event seed: ${String(eventSeed)}`);
    return createEventScheduleV080({
      eventSeed: String(eventSeed),
      events: selected2.map(createSimulationEventV080)
    });
  }
  function event(seed, round, eventKind, severity, effect) {
    return {
      eventId: `genuine510:${String(seed)}:r${String(round)}:${eventKind}`,
      eventKind,
      round,
      severity,
      description: `${eventKind} governed by deterministic seed ${String(seed)}`,
      effect
    };
  }

  // packages/simulation-core/src/teaching-v080-market-opportunity.ts
  var teachingV080AddressableMarketOpportunityAuthority = "ADDRESSABLE_MARKET_OPPORTUNITY_A1";
  function resolveAddressableMarketOpportunityV080(input) {
    if (!(input.environment instanceof MarketEnvironmentV080))
      throw simulationInvalid(
        "Addressable opportunity requires a genuine MarketEnvironmentV080."
      );
    input.environment.assertGenuine();
    const regularRevenueFull = nonNegative(
      input.parameters.regularRevenueFull,
      "regularRevenueFull"
    );
    const mixedRegularRevenueShare = unitInterval2(
      input.parameters.mixedRegularRevenueShare,
      "mixedRegularRevenueShare"
    );
    const greenRevenue = nonNegative(
      input.parameters.greenRevenuePerAwardAtDemandIndex1,
      "greenRevenuePerAwardAtDemandIndex1"
    );
    const parameterReferences = Object.freeze(
      input.parameterReferences.map((reference) => {
        if (reference.trim().length === 0)
          throw simulationInvalid(
            "Addressable opportunity parameter reference must be non-blank."
          );
        return reference;
      })
    );
    if (parameterReferences.length === 0)
      throw simulationInvalid(
        "Addressable opportunity requires governed parameter references."
      );
    const regularOpportunity = input.marketTarget === "REGULAR" ? regularRevenueFull : input.marketTarget === "MIXED" ? regularRevenueFull * mixedRegularRevenueShare : 0;
    const greenOpportunity = input.marketTarget !== "REGULAR" && input.environment.availableGreenOrders > 0 ? greenRevenue * input.environment.greenDemandIndex : 0;
    const payload = Object.freeze({
      provenance: "SIMULATION_OUTCOME",
      authorityIdentity: teachingV080AddressableMarketOpportunityAuthority,
      marketTarget: input.marketTarget,
      greenDemandIndex: input.environment.greenDemandIndex,
      availableGreenOrders: input.environment.availableGreenOrders,
      regularOpportunity,
      greenOpportunity,
      totalOpportunity: regularOpportunity + greenOpportunity,
      environmentReference: input.environment.reference,
      parameterReferences
    });
    return Object.freeze({
      ...payload,
      reference: `addressable-market-opportunity-v080:${deterministicSha256(payload)}`
    });
  }
  function nonNegative(value, field) {
    if (!Number.isFinite(value) || value < 0)
      throw simulationInvalid(`${field} must be a non-negative finite number.`);
    return value;
  }
  function unitInterval2(value, field) {
    if (!Number.isFinite(value) || value < 0 || value > 1)
      throw simulationInvalid(`${field} must be within [0,1].`);
    return value;
  }

  // packages/simulation-core/src/teaching-v080-genuine-round-shared.ts
  function createGenuineTeachingR8OutcomeV080(input) {
    const sincerity = TextbookSincerityEvaluationV080.evaluate({
      normalizedComponents: Object.fromEntries(
        Array.from({ length: 9 }, (_, index) => [`Q${String(index + 1)}`, 0.5])
      ),
      weights: Object.fromEntries(
        Array.from({ length: 9 }, (_, index) => [`Q${String(index + 1)}`, 1 / 9])
      ),
      weightParameterClass: "P2",
      weightParameterReference: "genuine510:sincerity"
    });
    const enterpriseProfile = EnterpriseProfileV080.create({
      dimensions: Object.fromEntries(
        enterpriseProfileDimensionsV080.map((dimension) => [
          dimension,
          { band: "MEDIUM", evidenceReferences: input.evidenceReferences }
        ])
      ),
      tags: [],
      sincerity,
      classificationParameterClass: "P2",
      classificationParameterReference: "genuine510:profile"
    });
    const nextCycleCommitment = NextCycleCommitmentV080.create(input);
    const nextCycleSeed = NextCycleSeedV080.create({
      commitment: nextCycleCommitment,
      carryForwardEvidenceReferences: input.evidenceReferences
    });
    return Object.freeze({
      enterpriseProfile,
      nextCycleCommitment,
      nextCycleSeed
    });
  }
  function resolveD13ContentCausalityV080(input) {
    const assessments = [];
    const causality = input.contentKinds.map((contentKind) => {
      if (contentKind === "FUTURE_COMMITMENT")
        return Object.freeze({
          contentKind,
          provenance: "PLAYER_DECISION",
          supportStatus: "FORWARD_LOOKING_NOT_HISTORICAL",
          authorityReference: input.decisionReference
        });
      const reduction = input.carbonTruth.reduction?.enterpriseActualReduction;
      const product = input.carbonTruth.productCarbon?.results.find(
        (item) => item.productSubject === input.productSubject
      );
      if (contentKind === "ACTUAL_REDUCTION" && reduction === void 0)
        throw new Error("D13_ACTUAL_REDUCTION_CORE_TRUTH_UNAVAILABLE");
      if (contentKind === "PRODUCT_CARBON" && product === void 0)
        throw new Error("D13_PRODUCT_CARBON_CORE_TRUTH_UNAVAILABLE");
      if (contentKind === "OFFSET" && input.carbonTruth.offset === void 0)
        throw new Error("D13_OFFSET_CORE_TRUTH_UNAVAILABLE");
      const assertion = contentKind === "ACTUAL_REDUCTION" ? {
        assertionId: `${input.decisionReference}:actual-reduction`,
        assertionType: contentKind,
        assertedValue: reduction.value
      } : contentKind === "PRODUCT_CARBON" ? {
        assertionId: `${input.decisionReference}:product-carbon`,
        assertionType: contentKind,
        productSubject: input.productSubject,
        assertedValue: product.perUnitCarbonQuantity.value
      } : contentKind === "OFFSET" ? {
        assertionId: `${input.decisionReference}:offset`,
        assertionType: contentKind,
        assertedValue: input.carbonTruth.offset.closingBalance.value
      } : void 0;
      const assessment = assertion === void 0 ? ClaimSupportAssessmentV080.issue({
        assertionId: `${input.decisionReference}:carbon-neutrality`,
        assertionType: "CARBON_NEUTRALITY",
        status: "AMBIGUOUS",
        authoritativeFactReference: void 0,
        authoritativeValue: void 0,
        assertedValue: "NO_AUTHORITATIVE_NEUTRALITY_FACT",
        productSubject: void 0
      }) : assessPromotionalAssertionV080({
        assertion,
        carbonTruth: input.carbonTruth
      });
      assessments.push(assessment);
      return Object.freeze({
        contentKind,
        provenance: assessment.authoritativeFactReference === void 0 ? "SIMULATION_OUTCOME" : "CORE_FACT",
        supportStatus: assessment.status,
        authorityReference: assessment.authoritativeFactReference ?? assessment.reference
      });
    });
    return Object.freeze({
      assessments: Object.freeze(assessments),
      causality: Object.freeze(causality)
    });
  }
  function resolveR7ResponseOutcomeV080(input) {
    const responsePath = input.d17.response === "SUBMIT_EXISTING_EVIDENCE" ? "EXISTING_EVIDENCE" : input.d17.response === "OBTAIN_ADDITIONAL_VERIFICATION" ? "ADDITIONAL_VERIFICATION" : "ACKNOWLEDGE_AND_REMEDIATE";
    const remediation = input.d18.response === "CORRECT_CLAIM" ? "CORRECT_CLAIM" : input.d18.response === "WITHDRAW_CLAIM" ? "WITHDRAW_CLAIM" : "MAINTAIN_WITH_AVAILABLE_SUPPORT";
    const payload = Object.freeze({
      provenance: "SIMULATION_OUTCOME",
      findingSource: "RESOLVER_OWNED",
      finding: input.verification.finding,
      verificationResponse: input.d17.response,
      correctionResponse: input.d18.response,
      responsePath,
      remediation,
      numericalRecoveryApplied: input.numericalRecoveryApplied ?? false,
      decisionReferences: Object.freeze([
        input.d17.decisionReference,
        input.d18.decisionReference
      ])
    });
    return Object.freeze({
      ...payload,
      reference: `r7-response-outcome-v080:${deterministicSha256(payload)}`
    });
  }

  // packages/simulation-core/src/teaching-v080-response-p2-diagnostic.ts
  var teachingV080ResponseP2CandidateProfiles = Object.freeze([
    Object.freeze({
      candidateId: "C0_CONTROL",
      costRatio: 0,
      recoveryRatio: 0,
      penaltyRatio: 0
    }),
    Object.freeze({
      candidateId: "C1_LOW",
      costRatio: 0.25,
      recoveryRatio: 0.25,
      penaltyRatio: 0.25
    }),
    Object.freeze({
      candidateId: "C2_RECOVERY_FOCUSED",
      costRatio: 0.25,
      recoveryRatio: 0.5,
      penaltyRatio: 0.25
    }),
    Object.freeze({
      candidateId: "C3_COST_DISCIPLINED",
      costRatio: 0.5,
      recoveryRatio: 0.25,
      penaltyRatio: 0.5
    }),
    Object.freeze({
      candidateId: "C4_BALANCED_RESPONSE",
      costRatio: 0.5,
      recoveryRatio: 0.5,
      penaltyRatio: 0.5
    })
  ]);
  function resolveTeachingV080ResponseP2Consequence(input) {
    const correct = input.correctionResponse === "CORRECT_CLAIM";
    const withdraw = input.correctionResponse === "WITHDRAW_CLAIM";
    const recover = correct && input.verification.finding !== "CLEARED";
    const responseCashCost = correct || withdraw ? input.candidate.costRatio * input.candidate.baseVerificationCost : 0;
    const trustRecovery = recover ? input.candidate.recoveryRatio * input.candidate.baseSupportedTrustGain : 0;
    const reputationRecovery = recover ? input.candidate.recoveryRatio * input.candidate.baseSupportedReputationGain : 0;
    const reputationPenalty = withdraw ? input.candidate.penaltyRatio * input.candidate.baseReputationLoss : 0;
    const opening = input.verification.closingState;
    const closingState = createCommunicationStateV080({
      awareness: opening.awareness,
      trust: clamp012(opening.trust + trustRecovery),
      reputation: clamp012(
        opening.reputation + reputationRecovery - reputationPenalty
      ),
      greenMarketAccess: opening.greenMarketAccess,
      disclosureCredibility: opening.disclosureCredibility,
      latentDisclosureRisk: opening.latentDisclosureRisk,
      governanceViolation: opening.governanceViolation
    });
    const payload = Object.freeze({
      provenance: "SIMULATION_OUTCOME",
      responseCashCost,
      trustRecovery,
      reputationRecovery,
      reputationPenalty,
      closingState,
      candidateParameterReferences: input.candidate.candidateParameterReferences,
      approvedParameterReferences: input.candidate.approvedParameterReferences
    });
    return Object.freeze({
      ...payload,
      reference: `response-p2-consequence-v080:${deterministicSha256(payload)}`
    });
  }
  function clamp012(value) {
    return Math.max(0, Math.min(1, value));
  }

  // packages/simulation-core/src/teaching-v080-genuine-round-authority.ts
  var GenuineTeachingRoundAuthorityV080 = class {
    constructor(sessionId, teamId, options = {}) {
      this.sessionId = sessionId;
      this.teamId = teamId;
      this.options = options;
    }
    submitted = /* @__PURE__ */ new Map();
    businessResolutions = /* @__PURE__ */ new Map();
    latestChain;
    roundStates = /* @__PURE__ */ new Map();
    communication;
    responseConsequence;
    verification;
    d13Causality;
    r7ResponseOutcome;
    market;
    opportunity;
    nextCycleCommitment;
    nextCycleSeed;
    activeEnvironment;
    bind(decisions) {
      for (const decision of decisions)
        this.submitted.set(decision.decision.slotId, decision);
    }
    resolveRound(input) {
      this.activeEnvironment = isMarketEnvironment(input.environment) ? input.environment : void 0;
      const resolved = this.resolve(input.round, input.currentState);
      this.roundStates.set(input.round, resolved.nextState);
      return resolved;
    }
    get outcomes() {
      return Object.freeze({
        communication: this.communication,
        verification: this.verification,
        responseConsequence: this.responseConsequence,
        r7ResponseOutcome: this.r7ResponseOutcome,
        d13Causality: this.d13Causality,
        marketOpportunity: this.opportunity,
        realizedMarketOutcome: this.market,
        nextCycleCommitment: this.nextCycleCommitment,
        nextCycleSeed: this.nextCycleSeed,
        businessResolutions: this.businessResolutions,
        chain: this.latestChain
      });
    }
    resolve(round, currentState) {
      const unchanged = () => IntegratedRuntimeStateV080.create({
        business: currentState.business,
        capability: currentState.capability,
        carbonTruth: currentState.carbonTruth,
        marketOutcomeReferences: currentState.marketOutcomeReferences,
        communicationOutcomeReferences: currentState.communicationOutcomeReferences,
        teachingEvidenceReferences: currentState.teachingEvidenceReferences,
        pendingR3ProjectActions: currentState.pendingR3ProjectActions,
        executedActivityFacts: currentState.executedActivityFacts
      });
      if (round === 6) return this.resolveR6(currentState);
      if (round === 7) return this.resolveR7(currentState);
      if (round < 3 || round > 5)
        return {
          nextState: unchanged(),
          receipt: round === 8 ? this.resolveR8Receipt(currentState) : {},
          eventContextReferences: this.environmentFor(round).eventReferences
        };
      const selection = (slotId) => this.submitted.get(slotId)?.decision.selectionCode;
      const production = this.submitted.get("D8")?.value;
      const r3State = this.roundStates.get(3);
      const horizon = selection("D7");
      const chain = this.submitted.size === 20 && this.latestChain !== void 0 ? this.latestChain : createGenuineBdCarbonChainV080({
        suffix: this.options.suffix ?? `session-${this.sessionId}`,
        intensity: selection("D5"),
        projectIds: selection("D6")?.split("+"),
        investmentHorizon: horizon,
        c1Production: Number(production?.c1Production ?? 20),
        c2Production: Number(production?.c2Production ?? 20),
        offsetIntensity: selection("D11") ?? "NONE",
        buffer: selection("D12") ?? "NO_BUFFER",
        technologyCostIndex: this.environmentFor(3).technologyCostIndex,
        energyPriceIndex: this.environmentFor(4).energyPriceIndex,
        baseEnergyOperatingCost: this.options.baseEnergyOperatingCost ?? 10,
        carbonPriceIndex: this.environmentFor(5).carbonPriceIndex,
        ...round === 4 ? { r4OpeningBusiness: currentState.business } : {},
        ...round === 5 ? {
          r4OpeningBusiness: (() => {
            if (r3State === void 0)
              throw simulationInvalid(
                "R5 requires the genuine R3 state."
              );
            return r3State.business;
          })(),
          r5OpeningBusiness: currentState.business
        } : {}
      });
      this.latestChain = chain;
      this.businessResolutions.set(
        round,
        round === 3 ? chain.investment.business : round === 4 ? chain.r4Business : chain.economics.business
      );
      if (round === 3)
        return {
          nextState: IntegratedRuntimeStateV080.create({
            business: chain.investment.business.closing,
            capability: currentState.capability,
            carbonTruth: currentState.carbonTruth,
            pendingR3ProjectActions: chain.investment.pendingActions
          }),
          receipt: { businessEffectReferences: [chain.investment.reference] },
          eventContextReferences: this.environmentFor(3).eventReferences
        };
      if (round === 4 && horizon !== "SHORT")
        return {
          nextState: IntegratedRuntimeStateV080.create({
            business: chain.r4Business.closing,
            capability: currentState.capability,
            carbonTruth: currentState.carbonTruth,
            pendingR3ProjectActions: currentState.pendingR3ProjectActions,
            executedActivityFacts: currentState.executedActivityFacts
          }),
          receipt: { businessEffectReferences: [chain.r4Business.reference] },
          eventContextReferences: this.environmentFor(4).eventReferences
        };
      if (round === 4)
        return {
          nextState: IntegratedRuntimeStateV080.create({
            business: chain.r4Business.closing,
            capability: chain.executed.at(-1)?.capabilityChange.closing ?? currentState.capability,
            carbonTruth: chain.r4.carbonTruth,
            executedActivityFacts: chain.executed
          }),
          receipt: {
            businessEffectReferences: [chain.r4Business.reference],
            carbonTruth: chain.r4.carbonTruth,
            priorCarbonTruth: currentState.carbonTruth,
            executedReductionActivityReference: (() => {
              const reduction = chain.r4.carbonTruth.reduction;
              if (reduction === void 0)
                throw simulationInvalid("R4 genuine Reduction is unavailable.");
              return reduction.coreSourceReference;
            })(),
            productCarbonAuthorityReference: chain.r4.productCarbon.reference
          },
          eventContextReferences: this.environmentFor(4).eventReferences
        };
      if (horizon === "LONG")
        return {
          nextState: unchanged(),
          receipt: {},
          eventContextReferences: this.environmentFor(5).eventReferences
        };
      const closingCarbonTruth = horizon === "MEDIUM" ? chain.r5.carbonTruth : createCarbonTruthStateV080({
        ...currentState.carbonTruth.reduction === void 0 ? {} : { reduction: currentState.carbonTruth.reduction },
        ...currentState.carbonTruth.productCarbon === void 0 ? {} : { productCarbon: currentState.carbonTruth.productCarbon },
        ...chain.r5.carbonTruth.offset === void 0 ? {} : { offset: chain.r5.carbonTruth.offset }
      });
      return {
        nextState: IntegratedRuntimeStateV080.create({
          business: chain.economics.business.closing,
          capability: horizon === "MEDIUM" ? chain.executed.at(-1)?.capabilityChange.closing ?? currentState.capability : currentState.capability,
          carbonTruth: closingCarbonTruth,
          executedActivityFacts: horizon === "MEDIUM" ? chain.executed : currentState.executedActivityFacts
        }),
        receipt: {
          businessEffectReferences: [chain.economics.reference],
          carbonTruth: closingCarbonTruth,
          priorCarbonTruth: currentState.carbonTruth,
          ...horizon === "MEDIUM" ? {
            executedReductionActivityReference: (() => {
              const reduction = chain.r5.carbonTruth.reduction;
              if (reduction === void 0)
                throw simulationInvalid("R5 due Reduction is unavailable.");
              return reduction.coreSourceReference;
            })(),
            productCarbonAuthorityReference: (() => {
              const productCarbon = chain.r5.carbonTruth.productCarbon;
              if (productCarbon === void 0)
                throw simulationInvalid(
                  "R5 due Product Carbon is unavailable."
                );
              return productCarbon.reference;
            })()
          } : {}
        },
        eventContextReferences: this.environmentFor(5).eventReferences
      };
    }
    environmentFor(round) {
      if (this.activeEnvironment?.round === round) return this.activeEnvironment;
      return this.options.environmentForRound?.(round) ?? this.roundEnvironment(round);
    }
    roundEnvironment(round) {
      const environment = {
        environmentId: "SESSION_BASE",
        carbonPrice: "BASE",
        energyPrice: "BASE",
        greenDemand: "BASE",
        verificationIntensity: "BASE",
        technologyCost: "BASE"
      };
      const opening = resolveTeachingV080Genuine510OpeningEnvironment(environment);
      const market = resolveTeachingV080Genuine510MarketParameters();
      return resolveMarketEnvironmentV080({
        round,
        schedule: createTeachingV080Genuine510EventSchedule(11),
        opening: {
          ...opening,
          availableGreenOrders: market.availableGreenOrders
        }
      });
    }
    resolveR6(currentState) {
      let openingState = currentState;
      if (this.requireSubmitted("D7").decision.selectionCode === "LONG") {
        const r3State = this.roundStates.get(3);
        const production = this.requireSubmitted("D8").value;
        if (r3State === void 0)
          throw simulationInvalid("R6 requires the genuine R3 state.");
        const chain = this.submitted.size === 20 && this.latestChain !== void 0 ? this.latestChain : createGenuineBdCarbonChainV080({
          suffix: this.options.suffix ?? `session-${this.sessionId}`,
          intensity: this.requireSubmitted("D5").decision.selectionCode,
          projectIds: this.requireSubmitted(
            "D6"
          ).decision.selectionCode.split("+"),
          investmentHorizon: "LONG",
          c1Production: Number(production.c1Production),
          c2Production: Number(production.c2Production),
          offsetIntensity: this.requireSubmitted("D11").decision.selectionCode,
          buffer: this.requireSubmitted("D12").decision.selectionCode,
          technologyCostIndex: this.environmentFor(3).technologyCostIndex,
          energyPriceIndex: this.environmentFor(4).energyPriceIndex,
          baseEnergyOperatingCost: this.options.baseEnergyOperatingCost ?? 10,
          carbonPriceIndex: this.environmentFor(5).carbonPriceIndex,
          r4OpeningBusiness: r3State.business,
          r5OpeningBusiness: currentState.business
        });
        this.latestChain = chain;
        openingState = IntegratedRuntimeStateV080.create({
          business: chain.economics.business.closing,
          capability: chain.executed.at(-1)?.capabilityChange.closing ?? currentState.capability,
          carbonTruth: chain.r5.carbonTruth,
          executedActivityFacts: chain.executed
        });
      }
      const get = (slot2) => this.submitted.get(slot2)?.binding;
      const what = get("D13");
      const channel = get("D14");
      const timing = get("D15");
      const evidence = get("D16");
      const addendum = createTeachingV080Seed1R6R7AddendumRegistry();
      const parameters = resolveTeachingV080R6Parameters({ registry: addendum });
      const environment = this.environmentFor(6);
      const marketAuthority = resolveTeachingV080Genuine510MarketParameters();
      const claimEvidence = resolveD13ContentCausalityV080({
        contentKinds: what.selection.contentKinds,
        carbonTruth: openingState.carbonTruth,
        productSubject: marketAuthority.productSubject,
        decisionReference: what.decisionReference
      });
      this.d13Causality = claimEvidence.causality;
      this.communication = resolveCommunicationV080({
        opening: createTeachingV080R6OpeningCommunicationStateV080(),
        decision: createCommunicationDecisionV080({
          decisionReference: [
            what.reference,
            channel.reference,
            timing.reference,
            evidence.reference
          ].join("|"),
          selectedClaimTypes: what.selection.coreClaimTypes,
          channel: channel.channel,
          timing: timing.timing,
          evidenceLevel: evidence.evidenceLevel,
          intensity: evidence.intensity
        }),
        claimAssessments: claimEvidence.assessments,
        scrutinyIntensity: environment.scrutinyIntensity,
        parameters: parameters.parameters
      });
      const marketTarget = get("D9").marketTarget;
      this.market = resolveSharedGreenMarketV080({
        environment,
        teams: [
          {
            teamId: this.teamId,
            marketTarget,
            productSubject: marketAuthority.productSubject,
            carbonTruth: openingState.carbonTruth,
            communication: this.communication.state,
            availableCapacity: openingState.business.c2Production
          }
        ],
        parameters: marketAuthority.parameters
      });
      this.opportunity = resolveAddressableMarketOpportunityV080({
        environment,
        marketTarget,
        parameters: marketAuthority.parameters,
        parameterReferences: marketAuthority.opportunityParameterReferences ?? marketAuthority.parameterReferences
      });
      const result = this.market.teamResults[0];
      if (result === void 0)
        throw simulationInvalid("R6 market result is unavailable.");
      const business = resolveBusinessRoundV080({
        opening: openingState.business,
        roundRevenue: result.totalMarketRevenue,
        operatingCost: this.communication.communicationCost,
        investmentSpend: 0,
        carbonComplianceCost: 0,
        dataEvidenceCost: 0,
        carbonAssetBufferCashOutflow: 0,
        c1Production: openingState.business.c1Production,
        c2Production: openingState.business.c2Production,
        c1Inventory: openingState.business.c1Inventory,
        c2Inventory: openingState.business.c2Inventory,
        productionCapacity: openingState.business.productionCapacity
      });
      this.businessResolutions.set(6, business);
      return {
        nextState: IntegratedRuntimeStateV080.create({
          business: business.closing,
          capability: openingState.capability,
          carbonTruth: openingState.carbonTruth,
          executedActivityFacts: openingState.executedActivityFacts,
          marketOutcomeReferences: [
            this.market.reference,
            this.opportunity.reference
          ],
          communicationOutcomeReferences: [this.communication.reference]
        }),
        receipt: {
          businessEffectReferences: [business.reference],
          ...openingState.carbonTruth.reference === currentState.carbonTruth.reference ? {} : {
            carbonTruth: openingState.carbonTruth,
            priorCarbonTruth: currentState.carbonTruth,
            executedReductionActivityReference: (() => {
              const reduction = openingState.carbonTruth.reduction;
              if (reduction === void 0)
                throw simulationInvalid(
                  "Due project Reduction is unavailable."
                );
              return reduction.coreSourceReference;
            })(),
            productCarbonAuthorityReference: (() => {
              const productCarbon = openingState.carbonTruth.productCarbon;
              if (productCarbon === void 0)
                throw simulationInvalid(
                  "Due project Product Carbon is unavailable."
                );
              return productCarbon.reference;
            })()
          },
          communicationEffectReferences: [this.communication.reference],
          marketEffectReferences: [
            this.market.reference,
            this.opportunity.reference
          ]
        },
        eventContextReferences: environment.eventReferences
      };
    }
    resolveR7(currentState) {
      if (this.communication === void 0)
        throw simulationInvalid("R7 communication state is unavailable.");
      const d17 = this.submitted.get("D17")?.binding;
      const d18 = this.submitted.get("D18")?.binding;
      const parameters = resolveTeachingV080R7Parameters({
        registry: createTeachingV080Seed1R6R7AddendumRegistry()
      });
      this.verification = resolveVerificationConsequenceV080({
        communication: this.communication,
        finding: resolveVerificationFindingV080(this.communication),
        verificationCost: d17.response === "OBTAIN_ADDITIONAL_VERIFICATION" ? parameters.verificationCost * this.environmentFor(7).verificationIntensity / (this.options.baseVerificationIntensity ?? this.environmentFor(7).verificationIntensity) : 0,
        trustLoss: parameters.trustLoss,
        reputationLoss: parameters.reputationLoss,
        marketAccessLoss: parameters.marketAccessLoss
      });
      this.responseConsequence = this.options.responseCandidate === void 0 ? void 0 : resolveTeachingV080ResponseP2Consequence({
        verification: this.verification,
        correctionResponse: d18.response,
        candidate: this.options.responseCandidate
      });
      this.r7ResponseOutcome = resolveR7ResponseOutcomeV080({
        verification: this.verification,
        d17,
        d18,
        numericalRecoveryApplied: (this.responseConsequence?.trustRecovery ?? 0) !== 0 || (this.responseConsequence?.reputationRecovery ?? 0) !== 0
      });
      const business = resolveBusinessRoundV080({
        opening: currentState.business,
        roundRevenue: 0,
        operatingCost: this.verification.verificationCost + (this.responseConsequence?.responseCashCost ?? 0),
        investmentSpend: 0,
        carbonComplianceCost: 0,
        dataEvidenceCost: 0,
        carbonAssetBufferCashOutflow: 0,
        c1Production: currentState.business.c1Production,
        c2Production: currentState.business.c2Production,
        c1Inventory: currentState.business.c1Inventory,
        c2Inventory: currentState.business.c2Inventory,
        productionCapacity: currentState.business.productionCapacity
      });
      this.businessResolutions.set(7, business);
      return {
        nextState: IntegratedRuntimeStateV080.create({
          business: business.closing,
          capability: currentState.capability,
          carbonTruth: currentState.carbonTruth,
          executedActivityFacts: currentState.executedActivityFacts,
          marketOutcomeReferences: currentState.marketOutcomeReferences,
          communicationOutcomeReferences: [
            ...currentState.communicationOutcomeReferences,
            this.verification.reference
          ]
        }),
        receipt: {
          businessEffectReferences: [business.reference],
          communicationEffectReferences: [
            this.verification.reference,
            this.r7ResponseOutcome.reference,
            ...this.responseConsequence === void 0 ? [] : [this.responseConsequence.reference],
            d17.reference,
            d18.reference
          ]
        },
        eventContextReferences: this.environmentFor(7).eventReferences
      };
    }
    resolveR8Receipt(state) {
      const priority = this.submitted.get("D19")?.binding;
      const ambition = this.submitted.get("D20")?.binding;
      if (priority === void 0 || ambition === void 0)
        throw simulationInvalid("R8 decisions are unavailable.");
      const evidenceReferences = Object.freeze([
        state.reference,
        state.carbonTruth.reference,
        ...state.marketOutcomeReferences,
        ...state.communicationOutcomeReferences
      ]);
      const boundPriority = priority;
      const boundAmbition = ambition;
      const outcome2 = createGenuineTeachingR8OutcomeV080({
        strategicPriority: boundPriority.strategicPriority,
        ambition: boundAmbition.ambition,
        target: boundAmbition.target,
        capabilityGap: boundAmbition.capabilityGap,
        budgetIntent: boundAmbition.budgetIntent,
        evidenceReferences
      });
      const {
        nextCycleCommitment: commitment,
        nextCycleSeed: seed,
        enterpriseProfile
      } = outcome2;
      this.nextCycleCommitment = commitment;
      this.nextCycleSeed = seed;
      return {
        enterpriseProfile,
        nextCycleCommitment: commitment,
        nextCycleSeed: seed,
        teachingFeedbackReferences: [state.reference]
      };
    }
    requireSubmitted(slotId) {
      const result = this.submitted.get(slotId);
      if (result === void 0)
        throw simulationInvalid("Submitted decision is unavailable.", { slotId });
      return result;
    }
  };
  function isMarketEnvironment(value) {
    return typeof value === "object" && value !== null && "scrutinyIntensity" in value && "round" in value;
  }

  // packages/simulation-core/src/teaching-v080-session.ts
  var pair = (left, right) => left.flatMap((a) => right.map((b) => `${a}+${b}`));
  var schemas = /* @__PURE__ */ new Map();
  var authorities = "teaching-v080-decision-values.ts / teaching-v080-execution-policy.ts";
  var values = {
    D1: teachingV080StrategicCommitments,
    D2: teachingV080ResourcePostures,
    D3: teachingV080UncertaintyResponses,
    D4: pair(teachingV080RemediationDomains, teachingV080RemediationIntensities),
    D5: teachingV080ReductionInvestmentIntensities,
    D6: teachingV080ReductionProjectIds,
    D7: teachingV080InvestmentHorizons,
    D9: teachingV080MarketTargets,
    D10: teachingV080RemainingReductionResponses,
    D11: teachingV080OffsetIntensities,
    D12: teachingV080CarbonAssetBuffers,
    D13: teachingV080DisclosureContentKinds,
    D14: teachingV080CommunicationChannels,
    D15: teachingV080CommunicationTimings,
    D16: pair(teachingV080EvidenceLevels, teachingV080CommunicationIntensities),
    D17: teachingV080VerificationResponses,
    D18: teachingV080DisclosureCorrectionResponses,
    D19: nextCycleStrategicPrioritiesV080
  };
  for (const contract of teachingV080DecisionSlotContracts) {
    const special = contract.slotId === "D8" || contract.slotId === "D20";
    schemas.set(
      contract.slotId,
      Object.freeze({
        slotId: contract.slotId,
        round: contract.round,
        inputType: contract.slotId === "D8" ? "PRODUCTION_MIX" : contract.slotId === "D20" ? "NEXT_CYCLE_COMMITMENT" : ["D4", "D16"].includes(contract.slotId) ? "ENUM_PAIR" : ["D6", "D13"].includes(contract.slotId) ? "ENUM_SET" : "ENUM",
        ...special ? {
          structure: contract.slotId === "D8" ? {
            c1Production: "nonnegative number",
            c2Production: "nonnegative number",
            productionCapacity: "positive number"
          } : {
            ambition: `enum:${nextCycleAmbitionsV080.join("|")}`,
            target: "nonblank text",
            capabilityGap: "nonblank text",
            budgetIntent: "nonblank text"
          }
        } : { legalValues: values[contract.slotId] },
        authorityReference: `${authorities}#${contract.slotId}`
      })
    );
  }
  function getTeachingDecisionSchemaV080(slotId) {
    requireTeachingV080DecisionSlot(slotId);
    const schema = schemas.get(slotId);
    if (schema === void 0)
      throw simulationInvalid("Teaching decision schema is unavailable.", {
        slotId
      });
    return schema;
  }
  var teachingDecisionSchemasV080 = Object.freeze(
    teachingV080DecisionSlotContracts.map(
      ({ slotId }) => getTeachingDecisionSchemaV080(slotId)
    )
  );
  function bindTeachingSessionDecisionV080(input) {
    const schema = getTeachingDecisionSchemaV080(input.slotId);
    const object = typeof input.value === "object" && !Array.isArray(input.value) ? input.value : void 0;
    const list = Array.isArray(input.value) ? input.value : void 0;
    const code = input.slotId === "D8" ? `c1Production=${String(object?.c1Production)};c2Production=${String(object?.c2Production)}` : input.slotId === "D20" ? String(object?.ambition) : list?.join("+") ?? scalarString(input.value, input.slotId);
    const decision = PlayerDecisionRecordV080.create({
      decisionId: `${input.sessionId}:${input.slotId}`,
      slotId: input.slotId,
      round: schema.round,
      selectionCode: code,
      ...input.rationale === void 0 ? {} : { rationale: input.rationale }
    });
    const parts = code.split("+");
    const common = { decision };
    const binding = (() => {
      switch (input.slotId) {
        case "D1":
          return bindStrategicCommitmentDecisionV080({
            ...common,
            value: code
          });
        case "D2":
          return bindResourcePostureDecisionV080({
            ...common,
            value: code
          });
        case "D3":
          return bindUncertaintyResponseDecisionV080({
            ...common,
            value: code
          });
        case "D4":
          return bindRemediationPriorityDecisionV080({
            ...common,
            domain: parts[0],
            intensity: parts[1]
          });
        case "D5":
          return bindReductionInvestmentDecisionV080({
            ...common,
            value: code
          });
        case "D6":
          return bindReductionPortfolioDecisionV080({
            ...common,
            projectIds: list ?? parts
          });
        case "D7":
          return bindInvestmentHorizonDecisionV080({
            ...common,
            value: code
          });
        case "D8":
          return bindProductionMixDecisionV080({
            ...common,
            c1Production: Number(object?.c1Production),
            c2Production: Number(object?.c2Production),
            productionCapacity: Number(object?.productionCapacity)
          });
        case "D9":
          return bindMarketTargetDecisionV080({
            ...common,
            marketTarget: code
          });
        case "D10":
          return bindRemainingReductionDecisionV080({
            ...common,
            response: code
          });
        case "D11":
          return bindOffsetIntensityDecisionV080({
            ...common,
            value: code
          });
        case "D12":
          return bindCarbonAssetBufferDecisionV080({
            ...common,
            value: code
          });
        case "D13":
          return bindDisclosureWhatDecisionV080({
            ...common,
            selection: createDisclosureContentSelectionV080({
              contentKinds: list ?? parts
            })
          });
        case "D14":
          return bindCommunicationChannelDecisionV080({
            ...common,
            channel: code
          });
        case "D15":
          return bindCommunicationTimingDecisionV080({
            ...common,
            timing: code
          });
        case "D16":
          return bindEvidenceIntensityDecisionV080({
            ...common,
            evidenceLevel: parts[0],
            intensity: parts[1]
          });
        case "D17":
          return bindVerificationResponseDecisionV080({
            ...common,
            response: code
          });
        case "D18":
          return bindDisclosureCorrectionDecisionV080({
            ...common,
            response: code
          });
        case "D19":
          return bindNextCyclePriorityDecisionV080({
            ...common,
            strategicPriority: code
          });
        case "D20":
          return bindNextCycleAmbitionDecisionV080({
            ...common,
            ambition: object?.ambition,
            target: scalarString(object?.target ?? "", "D20.target"),
            capabilityGap: scalarString(
              object?.capabilityGap ?? "",
              "D20.capabilityGap"
            ),
            budgetIntent: scalarString(
              object?.budgetIntent ?? "",
              "D20.budgetIntent"
            )
          });
      }
    })();
    return Object.freeze({ decision, binding, value: input.value });
  }
  function bindTeachingSessionRoundDecisionsV080(input) {
    const slots = teachingV080DecisionSlotsForRound(input.round);
    return Object.freeze(
      slots.map(({ slotId }) => {
        const value = input.values[slotId];
        if (value === void 0)
          throw simulationInvalid("Current round decision is missing.", {
            slotId
          });
        return bindTeachingSessionDecisionV080({
          sessionId: input.sessionId,
          slotId,
          value
        });
      })
    );
  }
  var TeachingSessionExecutionFacadeV080 = class _TeachingSessionExecutionFacadeV080 {
    constructor(sessionId, teamId) {
      this.sessionId = sessionId;
      this.teamId = teamId;
      this.sharedAuthority = new GenuineTeachingRoundAuthorityV080(
        sessionId,
        teamId
      );
      this.orchestration = IntegratedTeachingOrchestrationV080.create({
        sessionId,
        teamId,
        rolePlan: RolePlanV080.create({
          firstHalf: { CEO: "a", CFO: "b", COO: "c", CCO: "d", CMO: "e" },
          secondHalf: { CEO: "e", CFO: "a", COO: "b", CCO: "c", CMO: "d" }
        }),
        runtimeState: IntegratedRuntimeStateV080.create({
          business: createBusinessStateV080({
            cash: 500,
            liquidityReserve: 50,
            productionCapacity: 100
          }),
          capability: createCapabilityStateV080({
            energyEfficiency: 20,
            equipmentEfficiency: 20,
            processReduction: 20,
            carbonManagement: 20,
            data: 20,
            disclosure: 20
          }),
          carbonTruth: createCarbonTruthStateV080({})
        })
      });
    }
    round = 1;
    submitted = /* @__PURE__ */ new Map();
    orchestration;
    sharedAuthority;
    static create(input = {}) {
      return new _TeachingSessionExecutionFacadeV080(
        input.sessionId ?? "teaching-session-v080",
        input.teamId ?? "learner-team-v080"
      );
    }
    getCurrentRound() {
      return this.round > 8 ? void 0 : this.round;
    }
    getCurrentRoundSchema() {
      return this.round > 8 ? Object.freeze([]) : Object.freeze(
        teachingV080DecisionSlotsForRound(this.round).map(
          ({ slotId }) => getTeachingDecisionSchemaV080(slotId)
        )
      );
    }
    submitCurrentRoundDecisions(values2) {
      if (this.round > 8)
        throw simulationInvalid("Teaching session is already complete.");
      const bound = bindTeachingSessionRoundDecisionsV080({
        sessionId: this.sessionId,
        round: this.round,
        values: values2
      });
      for (const item of bound) this.submitted.set(item.decision.slotId, item);
      return bound;
    }
    executeCurrentRound() {
      const expected = teachingV080DecisionSlotsForRound(this.round);
      if (!expected.every(({ slotId }) => this.submitted.has(slotId)))
        throw simulationInvalid(
          "Current round decisions must be submitted before execution."
        );
      const currentState = this.orchestration.runtimeState;
      if (currentState === void 0)
        throw simulationInvalid("Session runtime state is unavailable.");
      const round = this.round;
      const decisions = expected.map(
        ({ slotId }) => this.requireSubmitted(slotId).decision
      );
      this.sharedAuthority.bind(
        expected.map(({ slotId }) => this.requireSubmitted(slotId))
      );
      const resolved = resolveGenuineTeachingRoundV080({
        round,
        currentRuntimeState: currentState,
        boundRoundDecisions: decisions,
        environment: Object.freeze({ level: "BASE", eventSeed: 11, round }),
        eventContext: Object.freeze({
          reference: `teaching-v080:event-seed-11:r${String(round)}`
        }),
        authorities: {
          resolve: ({ currentState: currentState2 }) => this.sharedAuthority.resolveRound({ round, currentState: currentState2 })
        }
      });
      const decisionSet = IntegratedRoundDecisionSetV080.create({
        round,
        decisions,
        actionPackages: decisions.map(
          (decision) => AuthorizedActionPackageV080.authorize({ decision })
        )
      });
      const receipt = IntegratedRoundExecutionReceiptV080.issue({
        ...resolved.receipt,
        round,
        stateBeforeReference: currentState.reference,
        stateAfterReference: resolved.nextState.reference
      });
      this.orchestration = this.orchestration.completeRound({
        decisionSet,
        execution: receipt,
        timestamp: `2026-09-${String(round).padStart(2, "0")}T00:00:00Z`,
        checkpointId: `${this.teamId}:checkpoint:r${String(round)}`,
        runtimeStateReference: resolved.nextState.reference,
        teamStateReference: `${this.teamId}:state:r${String(round)}`,
        ...resolved.eventContextReferences === void 0 ? {} : { eventContextReferences: resolved.eventContextReferences },
        nextRuntimeState: resolved.nextState
      });
      this.round += 1;
      return this.orchestration.checkpoints.at(-1);
    }
    getRuntimeState() {
      return this.orchestration.runtimeState;
    }
    getJournal() {
      return this.orchestration.journal.entries;
    }
    getCheckpoints() {
      return this.orchestration.checkpoints;
    }
    getFinalResult() {
      return this.round === 9 ? Object.freeze({
        roundCount: 8,
        checkpointCount: this.orchestration.checkpoints.length,
        journalEntryCount: this.orchestration.journal.entries.length,
        finalState: this.orchestration.runtimeState,
        orchestration: this.orchestration,
        ...this.sharedAuthority.outcomes
      }) : void 0;
    }
    requireSubmitted(slotId) {
      const result = this.submitted.get(slotId);
      if (result === void 0)
        throw simulationInvalid("Submitted decision is unavailable.", { slotId });
      return result;
    }
  };
  function scalarString(value, field) {
    if (typeof value !== "string")
      throw simulationInvalid("Teaching decision requires a string value.", {
        field
      });
    return value;
  }

  // packages/simulation-core/src/product-market-economic.ts
  var priceIndexByDecision = Object.freeze({
    LOW: 0.95,
    BASE: 1,
    PREMIUM: 1.08
  });

  // packages/simulation-core/src/competitor-policy.ts
  var sandboxV01CompetitorPolicyVersion = "CROCS_SANDBOX_COMPETITOR_POLICY_V0_1";
  function resolve(competitorId, roundNumber) {
    const competitor = normalizeCompetitorId(competitorId);
    const round = positiveSafeInteger(roundNumber, "roundNumber");
    if (round > 3)
      throw simulationInvalid(
        "Sandbox v0.1 competitor policy defines exactly three visible rounds.",
        { roundNumber: round }
      );
    const shape = competitor === "CE" ? ceDecision(round) : fgDecision(round);
    const hashInput = {
      competitorId: competitor,
      roundNumber: round,
      policyVersion: sandboxV01CompetitorPolicyVersion,
      ...shape,
      provenance: "SCENARIO_ASSUMPTION"
    };
    return Object.freeze({
      ...hashInput,
      decisionHash: deterministicSha256(hashInput)
    });
  }
  function resolveRound(roundNumber) {
    return Object.freeze([
      resolve("CE", roundNumber),
      resolve("FG", roundNumber)
    ]);
  }
  var DeterministicCompetitorPolicyV01 = Object.freeze({
    resolve,
    resolveRound
  });
  function normalizeCompetitorId(competitorId) {
    if (competitorId === "CE" || competitorId === "FG") return competitorId;
    throw simulationInvalid(
      "Sandbox v0.1 competitor policy only resolves CE or FG.",
      { competitorId }
    );
  }
  function ceDecision(roundNumber) {
    if (roundNumber === 1)
      return {
        pricing: "LOW",
        managementPosture: "COMPLIANCE_COST_CONTROL",
        reductionIntensity: "LOW",
        capabilityIntensity: "LOW",
        offsetReliance: "HIGH",
        disclosureIntensity: "MINIMUM"
      };
    if (roundNumber === 2)
      return {
        pricing: "LOW",
        managementPosture: "BALANCED_TRANSITION",
        reductionIntensity: "MEDIUM",
        capabilityIntensity: "LOW",
        offsetReliance: "MEDIUM",
        disclosureIntensity: "STANDARD"
      };
    return {
      pricing: "BASE",
      managementPosture: "BALANCED_TRANSITION",
      reductionIntensity: "MEDIUM",
      capabilityIntensity: "MEDIUM",
      offsetReliance: "MEDIUM",
      disclosureIntensity: "STANDARD"
    };
  }
  function fgDecision(roundNumber) {
    if (roundNumber === 1)
      return {
        pricing: "PREMIUM",
        managementPosture: "CAPABILITY_PREMIUM_TRANSITION",
        reductionIntensity: "MEDIUM",
        capabilityIntensity: "HIGH",
        offsetReliance: "LOW",
        disclosureIntensity: "PROACTIVE"
      };
    return {
      pricing: "PREMIUM",
      managementPosture: "CAPABILITY_PREMIUM_TRANSITION",
      reductionIntensity: "HIGH",
      capabilityIntensity: "HIGH",
      offsetReliance: "LOW",
      disclosureIntensity: "PROACTIVE"
    };
  }

  // packages/simulation-core/src/enterprise-profile.ts
  var profiles = Object.freeze([
    profile({
      enterpriseId: "BD",
      role: "PLAYER",
      archetype: "STUDENT_MANAGED_REFERENCE_ENTERPRISE",
      businessPosition: "STABLE",
      marketPosition: "ESTABLISHED",
      lowCarbonCapabilityPosition: "EARLY_STAGE",
      carbonAssetPosition: "SOME_EXISTING_ASSETS"
    }),
    profile({
      enterpriseId: "CE",
      role: "SCRIPTED_COMPETITOR",
      archetype: "COMPLIANCE_COST_CONTROL",
      businessPosition: "COST_DISCIPLINED",
      marketPosition: "VALUE_ORIENTED",
      lowCarbonCapabilityPosition: "LOW_TO_MEDIUM",
      carbonAssetPosition: "LIMITED_FLEXIBILITY"
    }),
    profile({
      enterpriseId: "FG",
      role: "SCRIPTED_COMPETITOR",
      archetype: "CAPABILITY_PREMIUM_TRANSITION",
      businessPosition: "INVESTMENT_ORIENTED",
      marketPosition: "PREMIUM_TRANSITION",
      lowCarbonCapabilityPosition: "MEDIUM_TO_HIGH",
      carbonAssetPosition: "SELECTIVE_USE"
    })
  ]);
  function profile(input) {
    return Object.freeze({ ...input, provenance: "SCENARIO_ASSUMPTION" });
  }

  // packages/simulation-core/src/sandbox-scenario.ts
  var sandboxV01ScenarioId = "BD_CE_FG_2027_2029";
  var sandboxV01ScenarioVersion = "v0.1";
  var sandboxV01ContinuationYears = Object.freeze(["2030", "2031"]);
  var scenarioAssumption = "SCENARIO_ASSUMPTION";
  var roundBriefs = Object.freeze(
    {
      1: brief({
        roundNumber: 1,
        year: "2027",
        chapterTitle: "\u63A5\u7BA1 BD\uFF1A\u7B2C\u4E00\u6B21\u771F\u6B63\u7BA1\u7406\u78B3",
        storyBrief: "\u7ECF\u8425\u73AF\u5883\u603B\u4F53\u7A33\u5B9A\u3002\u8463\u4E8B\u4F1A\u8981\u6C42\u65B0\u7BA1\u7406\u56E2\u961F\u5728\u7EF4\u6301\u8FDE\u7EED\u7ECF\u8425\u7684\u540C\u65F6\u5EFA\u7ACB\u53EF\u6301\u7EED\u7684\u78B3\u7BA1\u7406\u673A\u5236\uFF0C\u800C\u4E0D\u662F\u53EA\u5B8C\u6210\u4E00\u6B21\u78B3\u6838\u7B97\u3002",
        predecessorScenarioReference: void 0,
        stateInheritance: "BASELINE_OPENING_STATE",
        parameters: [
          parameter2("carbonMarketPriceChangePct", 0, "ratio"),
          parameter2("industrialElectricityPriceChangePct", 0, "ratio"),
          parameter2("lowCarbonProductPreferenceTrend", "EMERGING"),
          parameter2("disclosureRequirement", "BASELINE")
        ]
      }),
      2: brief({
        roundNumber: 2,
        year: "2028",
        chapterTitle: "\u538B\u529B\u6765\u4E86\uFF1A\u8FC7\u53BB\u7684\u9009\u62E9\u5F00\u59CB\u4EA7\u751F\u540E\u679C",
        storyBrief: "\u4E0A\u4E00\u8F6E\u7ECF\u8425\u72B6\u6001\u4E0E\u672A\u5B8C\u6210\u9879\u76EE\u7EE7\u7EED\u6709\u6548\u3002\u78B3\u5E02\u573A\u548C\u80FD\u6E90\u6210\u672C\u4E0A\u5347\uFF0C\u6D88\u8D39\u8005\u5BF9\u4F4E\u78B3\u4EA7\u54C1\u7684\u5173\u6CE8\u589E\u5F3A\uFF0C\u7BA1\u7406\u56E2\u961F\u5FC5\u987B\u5904\u7406\u5F53\u671F\u6210\u672C\u4E0E\u957F\u671F\u80FD\u529B\u4E4B\u95F4\u7684\u5F20\u529B\u3002",
        predecessorScenarioReference: scenarioReference(1),
        stateInheritance: "INHERIT_PREVIOUS_ENTERPRISE_STATE",
        parameters: [
          parameter2("carbonMarketPriceChangePct", 0.25, "ratio"),
          parameter2("industrialElectricityPriceChangePct", 0.1, "ratio"),
          parameter2("lowCarbonProductPreferenceTrend", "RISING"),
          parameter2("disclosureRequirement", "BASELINE")
        ]
      }),
      3: brief({
        roundNumber: 3,
        year: "2029",
        chapterTitle: "\u4F4E\u78B3\u662F\u6210\u672C\uFF0C\u8FD8\u662F\u80FD\u529B\uFF1F",
        storyBrief: "\u524D\u4E24\u8F6E\u5F62\u6210\u7684\u7ECF\u8425\u72B6\u6001\u3001\u80FD\u529B\u79EF\u7D2F\u548C\u9879\u76EE\u65F6\u6EDE\u7EE7\u7EED\u5B58\u5728\u3002\u4F4E\u78B3\u94A2\u8FDB\u5165\u53EF\u9009\u4F9B\u5E94\u5E02\u573A\uFF0C\u7EFF\u8272\u6280\u672F\u6210\u672C\u4E0B\u964D\uFF0C\u540C\u65F6\u62AB\u9732\u8981\u6C42\u6536\u7D27\uFF0C\u4F01\u4E1A\u9700\u8981\u5224\u65AD\u4F4E\u78B3\u80FD\u529B\u80FD\u5426\u8F6C\u5316\u4E3A\u7ECF\u8425\u4F18\u52BF\u3002",
        predecessorScenarioReference: scenarioReference(2),
        stateInheritance: "INHERIT_PREVIOUS_ENTERPRISE_STATE",
        parameters: [
          parameter2("lowCarbonSteelAvailable", true),
          parameter2("lowCarbonSteelProcurementPremiumPct", 0.08, "ratio"),
          parameter2("greenTechnologyCostChangePct", -0.2, "ratio"),
          parameter2("disclosureRequirement", "TIGHTENED"),
          parameter2("lowCarbonProductPreferenceTrend", "MATERIAL")
        ]
      })
    }
  );
  function scenarioReference(roundNumber) {
    return `${sandboxV01ScenarioId}@${sandboxV01ScenarioVersion}:round:${String(roundNumber)}`;
  }
  function parameter2(key, value, unit) {
    return Object.freeze({
      key,
      value,
      unit,
      provenance: scenarioAssumption
    });
  }
  function brief(input) {
    return Object.freeze({
      scenarioId: sandboxV01ScenarioId,
      scenarioVersion: sandboxV01ScenarioVersion,
      ...input,
      parameters: Object.freeze([...input.parameters])
    });
  }

  // packages/simulation-core/src/teaching-v080-probe-bindings.ts
  var allProjects = [
    "SOLAR_ENERGY_SHARE",
    "DECARBONIZATION_TECHNOLOGY",
    "EQUIPMENT_OPERATION_EFFICIENCY",
    "LOW_CARBON_SALES_LOGISTICS"
  ];
  var balanced = {
    D1: "STABILIZE_CARBON_TRUTH",
    D2: "DISCIPLINED_DEPLOYMENT",
    D3: "REMEDIATE_BEFORE_ACTION",
    D4: "ACTIVITY_DATA+STANDARD",
    D5: "MODERATE",
    D6: allProjects.join("+"),
    D7: "SHORT",
    D8: "c1Production=20;c2Production=20",
    D9: "MIXED",
    D10: "CONTINUE_APPROVED_PLAN",
    D11: "PARTIAL",
    D12: "LIMITED_BUFFER",
    D13: "ACTUAL_REDUCTION+PRODUCT_CARBON",
    D14: "CSR_REPORT",
    D15: "SCHEDULED",
    D16: "VERIFIED+STANDARD",
    D17: "OBTAIN_ADDITIONAL_VERIFICATION",
    D18: "CORRECT_CLAIM",
    D19: "BALANCED_TRANSITION",
    D20: "MODERATE"
  };
  var teachingV080ProbeBindingOverlays = Object.freeze({
    BALANCED: {},
    REAL_REDUCTION: {
      D1: "PRIORITIZE_REAL_REDUCTION",
      D2: "TRANSFORMATION_CAPACITY",
      D4: "ACTIVITY_DATA+DEEP",
      D5: "HIGH",
      D6: "SOLAR_ENERGY_SHARE+DECARBONIZATION_TECHNOLOGY",
      D8: "c1Production=20;c2Production=10",
      D9: "GREEN",
      D10: "ACCELERATE_APPROVED_PLAN",
      D11: "NONE",
      D12: "NO_BUFFER",
      D14: "DIRECT_GREEN_CUSTOMER",
      D15: "AFTER_MAJOR_CARBON_ACTION",
      D16: "ASSURED+STANDARD",
      D17: "SUBMIT_EXISTING_EVIDENCE",
      D18: "MAINTAIN_WITH_SUPPORTING_EVIDENCE"
    },
    OFFSET_HEAVY: {
      D3: "PROCEED_WITH_LIMITATION",
      D4: "ACTIVITY_DATA+BASIC",
      D5: "LOW",
      D6: "EQUIPMENT_OPERATION_EFFICIENCY+LOW_CARBON_SALES_LOGISTICS",
      D8: "c1Production=20;c2Production=10",
      D9: "REGULAR",
      D10: "HOLD_CURRENT_PLAN",
      D11: "FULL_REMAINING_REQUIREMENT",
      D12: "ROBUST_BUFFER",
      D14: "FORMAL_REPORT",
      D17: "OBTAIN_ADDITIONAL_VERIFICATION",
      D18: "CORRECT_CLAIM"
    },
    DISCLOSURE_AGGRESSIVE: {
      D1: "BUILD_LOW_CARBON_VALUE",
      D4: "ACTIVITY_DATA+STANDARD",
      D5: "LOW",
      D6: "LOW_CARBON_SALES_LOGISTICS",
      D8: "c1Production=25;c2Production=10",
      D9: "GREEN",
      D11: "PARTIAL",
      D12: "LIMITED_BUFFER",
      D13: "ACTUAL_REDUCTION+PRODUCT_CARBON+OFFSET+CARBON_NEUTRALITY",
      D14: "PRESS_CONFERENCE",
      D15: "IMMEDIATE",
      D16: "BASIC+ACTIVE",
      D17: "SUBMIT_EXISTING_EVIDENCE",
      D18: "MAINTAIN_WITH_SUPPORTING_EVIDENCE"
    },
    CASH_PRESERVATION: {
      D2: "LIQUIDITY_PROTECTED",
      D3: "PROCEED_WITH_LIMITATION",
      D4: "ACTIVITY_DATA+BASIC",
      D5: "LOW",
      D6: "SOLAR_ENERGY_SHARE",
      D8: "c1Production=25;c2Production=10",
      D9: "REGULAR",
      D10: "HOLD_CURRENT_PLAN",
      D11: "NONE",
      D12: "NO_BUFFER",
      D13: "ACTUAL_REDUCTION",
      D14: "WEBSITE",
      D15: "SCHEDULED",
      D16: "BASIC+LOW",
      D17: "SUBMIT_EXISTING_EVIDENCE",
      D18: "WITHDRAW_CLAIM"
    }
  });
  var teachingV080NeutralProbeNextCyclePayload = Object.freeze({
    target: "calibration next-cycle target",
    capabilityGap: "calibration capability gap",
    budgetIntent: "calibration budget intent"
  });

  // packages/teaching-runtime/src/runtime.ts
  var TeachingRuntimeCoordinatorV080 = class {
    sessions = /* @__PURE__ */ new Map();
    schema() {
      return {
        source: "getTeachingDecisionSchemaV080()",
        slots: teachingDecisionSchemasV080.map(projectSchema)
      };
    }
    createSession(input = {}) {
      const id = stringOr(
        input.sessionId,
        `teaching-${globalThis.crypto.randomUUID()}`
      );
      if (this.sessions.has(id)) throw new Error("Session already exists.");
      const teamId = stringOr(input.teamId, "learner-team-v080");
      this.sessions.set(id, {
        id,
        teamId,
        facade: TeachingSessionExecutionFacadeV080.create({
          sessionId: id,
          teamId
        }),
        decisions: /* @__PURE__ */ new Map()
      });
      return this.project(this.requireSession(id));
    }
    session(id) {
      return this.project(this.requireSession(id));
    }
    decisions(id, values2) {
      const session = this.requireSession(id);
      const bound = session.facade.submitCurrentRoundDecisions(values2);
      for (const item of bound)
        session.decisions.set(item.decision.slotId, item.value);
      return {
        accepted: bound.map(({ decision }) => decision.reference),
        session: this.project(session)
      };
    }
    execute(id) {
      const session = this.requireSession(id);
      session.lastCheckpoint = session.facade.executeCurrentRound();
      return this.project(session);
    }
    cf1(id, slotId) {
      return counterfactual(this.requireSession(id), slotId);
    }
    requireSession(id) {
      const session = this.sessions.get(id);
      if (!session) throw new Error("Session not found.");
      return session;
    }
    project(session) {
      return projectSession(session);
    }
  };
  var BrowserTeachingRuntimeV080 = class {
    constructor(coordinator = new TeachingRuntimeCoordinatorV080()) {
      this.coordinator = coordinator;
    }
    schema() {
      return this.coordinator.schema();
    }
    createSession(input = {}) {
      return this.coordinator.createSession(input);
    }
    session(id) {
      return this.coordinator.session(id);
    }
    decisions(id, values2) {
      return this.coordinator.decisions(id, values2);
    }
    execute(id) {
      return this.coordinator.execute(id);
    }
    cf1(id, slotId) {
      return this.coordinator.cf1(id, slotId);
    }
  };
  function projectSession(session) {
    return {
      sessionId: session.id,
      teamId: session.teamId,
      currentRound: session.facade.getCurrentRound() ?? null,
      currentSchema: session.facade.getCurrentRoundSchema().map(projectSchema),
      currentRole: "TEAM (CEO / CFO / COO / CCO / CMO)",
      decisions: Object.fromEntries(session.decisions),
      checkpointCount: session.facade.getCheckpoints().length,
      journalEntryCount: session.facade.getJournal().length,
      lastCheckpoint: session.lastCheckpoint,
      runtimeState: session.facade.getRuntimeState(),
      finalResult: session.facade.getFinalResult()
    };
  }
  function projectSchema(schema) {
    const contract = requireTeachingV080DecisionSlot(schema.slotId);
    const inputTypes = {
      ENUM: "ENUM",
      ENUM_PAIR: "COMPOSITE_ENUM",
      ENUM_SET: "SET_COMBINATION",
      PRODUCTION_MIX: "BOUNDED_TUPLE",
      NEXT_CYCLE_COMMITMENT: "STRUCTURED_INPUT"
    };
    return {
      ...schema,
      inputType: inputTypes[schema.inputType],
      stage: contract.stage,
      name: contract.name
    };
  }
  function counterfactual(actual, slotId) {
    const schema = teachingDecisionSchemasV080.find(
      (item) => item.slotId === slotId
    );
    const actualValue = actual.decisions.get(slotId);
    if (!schema || actualValue === void 0)
      throw new Error("CF1 requires an already completed learner decision slot.");
    const completedRound = (actual.facade.getCurrentRound() ?? 9) - 1;
    if (schema.round > completedRound)
      throw new Error("CF1 requires an already completed learner decision slot.");
    const alternatives = finiteAlternatives(schema).filter(
      (value) => JSON.stringify(value) !== JSON.stringify(actualValue)
    );
    if (alternatives.length === 0)
      return {
        status: "UNAVAILABLE_NO_GOVERNED_FINITE_ALTERNATIVE_SET",
        slotId,
        actualSelection: actualValue
      };
    const actualSnapshot = JSON.stringify(projectSession(actual));
    const results = alternatives.map((alternative) => {
      const replay = TeachingSessionExecutionFacadeV080.create({
        sessionId: `${actual.id}:cf1:${slotId}:${JSON.stringify(alternative)}`,
        teamId: actual.teamId
      });
      for (let round = 1; round <= completedRound; round += 1) {
        const values2 = Object.fromEntries(
          replay.getCurrentRoundSchema().map(({ slotId: id }) => [
            id,
            id === slotId ? alternative : actual.decisions.get(id)
          ])
        );
        replay.submitCurrentRoundDecisions(values2);
        replay.executeCurrentRound();
      }
      const outcome2 = {
        runtimeState: replay.getRuntimeState(),
        finalResult: replay.getFinalResult(),
        checkpoint: replay.getCheckpoints().at(-1)
      };
      const actualOutcome = {
        runtimeState: actual.facade.getRuntimeState(),
        finalResult: actual.facade.getFinalResult(),
        checkpoint: actual.facade.getCheckpoints().at(completedRound - 1)
      };
      const left = cf1SemanticProjection(actualOutcome);
      const right = cf1SemanticProjection(outcome2);
      const changedDimensions = Object.freeze(
        cf1SemanticDimensions.filter(
          (dimension) => JSON.stringify(left[dimension]) !== JSON.stringify(right[dimension])
        )
      );
      return {
        alternativeSelection: alternative,
        changedDimensions,
        genuineResultingOutcome: outcome2,
        materialDifference: changedDimensions.length > 0
      };
    });
    if (JSON.stringify(projectSession(actual)) !== actualSnapshot)
      throw new Error("CF1 mutated the actual session.");
    return {
      status: "AVAILABLE",
      executor: "TeachingSessionExecutionFacadeV080",
      slotId,
      actualSelection: actualValue,
      results
    };
  }
  var cf1SemanticDimensions = [
    "BUSINESS",
    "CAPABILITY",
    "REDUCTION",
    "PRODUCT_CARBON",
    "OFFSET",
    "MARKET_OPPORTUNITY",
    "REALIZED_REVENUE",
    "COMMUNICATION",
    "VERIFICATION",
    "NEXT_CYCLE_COMMITMENT",
    "NEXT_CYCLE_SEED"
  ];
  function cf1SemanticProjection(outcome2) {
    const truth = outcome2.runtimeState?.carbonTruth;
    const final = outcome2.finalResult;
    return Object.freeze({
      BUSINESS: semanticValue(outcome2.runtimeState?.business),
      CAPABILITY: semanticValue(outcome2.runtimeState?.capability),
      REDUCTION: semanticValue(truth?.reduction),
      PRODUCT_CARBON: semanticValue(truth?.productCarbon),
      OFFSET: semanticValue(truth?.offset),
      MARKET_OPPORTUNITY: semanticValue(final?.marketOpportunity),
      REALIZED_REVENUE: semanticValue(final?.realizedMarketOutcome),
      COMMUNICATION: semanticValue(final?.communication),
      VERIFICATION: semanticValue(final?.verification),
      NEXT_CYCLE_COMMITMENT: semanticValue(final?.nextCycleCommitment),
      NEXT_CYCLE_SEED: semanticValue(final?.nextCycleSeed)
    });
  }
  function semanticValue(value) {
    if (Array.isArray(value)) return value.map(semanticValue);
    if (value === null || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value).filter(([key]) => !isIdentityMetadata(key)).map(([key, nested]) => [key, semanticValue(nested)])
    );
  }
  function isIdentityMetadata(key) {
    const normalized = key.toLowerCase();
    return normalized === "id" || normalized.endsWith("id") || normalized.includes("reference") || normalized.includes("provenance") || normalized.includes("lineage") || normalized.endsWith("at");
  }
  function finiteAlternatives(schema) {
    if (!schema.legalValues) return [];
    if (schema.inputType !== "ENUM_SET") return [...schema.legalValues];
    const values2 = schema.legalValues;
    return Array.from(
      { length: 2 ** values2.length - 1 },
      (_, index) => values2.filter((_2, bit) => Boolean(index + 1 & 1 << bit))
    );
  }
  function stringOr(value, fallback) {
    return typeof value === "string" && value.trim() ? value : fallback;
  }

  // 13_Demo/BD_Manufacturing/teaching-ui/playable.js
  var roles = {
    CEO: ["CEO \xB7 \u603B\u7ECF\u7406", "\u4F01\u4E1A\u603B\u4F53\u65B9\u5411\u3001\u73B0\u91D1\u5B89\u5168\u4E0E\u957F\u671F\u7ADE\u4E89\u529B"],
    CFO: ["CFO \xB7 \u8D22\u52A1\u8D1F\u8D23\u4EBA", "\u73B0\u91D1\u3001\u7ECF\u8425\u7ED3\u679C\u3001\u6295\u8D44\u652F\u51FA\u4E0E\u78B3\u6210\u672C"],
    COO: ["COO \xB7 \u8FD0\u8425\u8D1F\u8D23\u4EBA", "\u751F\u4EA7\u3001\u8BBE\u5907\u3001\u6D41\u7A0B\u4E0E\u80FD\u529B\u80FD\u5426\u8F6C\u5316\u4E3A\u6267\u884C"],
    CCO: ["CCO \xB7 \u78B3\u7BA1\u7406\u8D1F\u8D23\u4EBA", "Carbon Truth\u3001\u8BC1\u636E\u3001\u51CF\u6392\u4E0E\u62B5\u78B3\u8FB9\u754C"],
    CMO: ["CMO \xB7 \u5E02\u573A\u8D1F\u8D23\u4EBA", "\u4EA7\u54C1\u78B3\u3001\u7EFF\u8272\u5E02\u573A\u673A\u4F1A\u3001\u62AB\u9732\u4E0E\u58F0\u8A89"]
  };
  var rounds = [
    {
      no: 1,
      stage: "COMMITMENT / \u786E\u78B3",
      short: "\u63A5\u7BA1\u4F01\u4E1A",
      title: "\u63A5\u7BA1BD\u6C7D\u8F66\uFF1A\u5148\u51B3\u5B9A\u600E\u4E48\u7ECF\u8425\uFF0C\u518D\u627F\u62C5\u78B3\u8D23\u4EFB",
      question: "\u8D44\u6E90\u6709\u9650\u3002\u56E2\u961F\u9996\u5148\u8981\u5F62\u6210\u4F01\u4E1A\u7ECF\u8425\u59FF\u6001\u4E0E\u78B3\u7BA1\u7406\u627F\u8BFA\u3002",
      context: "\u672C\u8F6E\u4E0D\u662F\u7B97\u78B3\uFF0C\u800C\u662F\u660E\u786E\u4F01\u4E1A\u51C6\u5907\u5982\u4F55\u7ECF\u8425\u4E0E\u914D\u7F6E\u8D44\u6E90\u3002",
      goal: "\u5F62\u6210\u521D\u59CB\u627F\u8BFA",
      constraint: "\u73B0\u91D1\u4E0E\u80FD\u529B",
      lesson: "\u51B3\u7B56\u4E0D\u7B49\u4E8E\u4E8B\u5B9E",
      leads: ["CEO", "CFO", "CCO"]
    },
    {
      no: 2,
      stage: "COMMITMENT / \u786E\u78B3",
      short: "\u78B3\u4E8B\u5B9E\u5371\u673A",
      title: "\u6570\u636E\u51FA\u73B0\u51B2\u7A81\uFF1A\u4F60\u770B\u5230\u7684\u6570\u5B57\uFF0C\u80FD\u4E0D\u80FD\u76F4\u63A5\u5F53\u6210\u78B3\u4E8B\u5B9E\uFF1F",
      question: "\u7F3A\u5931\u3001\u51B2\u7A81\u4E0E\u8BC1\u636E\u4E0D\u8DB3\u540C\u65F6\u51FA\u73B0\u3002\u56E2\u961F\u5FC5\u987B\u5148\u51B3\u5B9A\u5982\u4F55\u5904\u7406\u4E0D\u786E\u5B9A\u6027\u3002",
      context: "\u5148\u5904\u7406\u6570\u636E\u4E0E\u8BC1\u636E\u6CBB\u7406\uFF0C\u518D\u51B3\u5B9A\u54EA\u4E9B\u7BA1\u7406\u884C\u52A8\u53EF\u4EE5\u7EE7\u7EED\u3002",
      goal: "\u5F62\u6210\u53EF\u4FE1\u78B3\u4E8B\u5B9E\u57FA\u7840",
      constraint: "\u7F3A\u5931\u4E0E\u8BC1\u636E\u4E0D\u8DB3",
      lesson: "Missing \u2260 Zero",
      leads: ["CCO", "CFO"]
    },
    {
      no: 3,
      stage: "REDUCTION / \u51CF\u78B3",
      short: "\u51CF\u6392\u6295\u8D44",
      title: "\u94B1\u8BE5\u82B1\u5728\u54EA\u91CC\uFF0C\u80FD\u529B\u4EC0\u4E48\u65F6\u5019\u624D\u4F1A\u53D8\u6210\u771F\u6B63\u7684\u51CF\u6392\uFF1F",
      question: "\u73B0\u91D1\u3001\u6295\u8D44\u5F3A\u5EA6\u3001\u6280\u672F\u7EC4\u5408\u548C\u5B9E\u73B0\u5468\u671F\u53D1\u751F\u6B63\u9762\u51B2\u7A81\u3002",
      context: "\u6295\u8D44\u4F1A\u6539\u53D8\u80FD\u529B\u548C\u672A\u6765\u6D3B\u52A8\uFF0C\u4F46\u80FD\u529B\u672C\u8EAB\u4E0D\u662F Actual Reduction\u3002",
      goal: "\u5EFA\u7ACB\u51CF\u6392\u6267\u884C\u8DEF\u5F84",
      constraint: "\u6295\u8D44\u4E0E\u6D41\u52A8\u6027",
      lesson: "Capability \u2260 Reduction",
      leads: ["COO", "CFO", "CCO"]
    },
    {
      no: 4,
      stage: "REDUCTION / \u51CF\u78B3",
      short: "\u4F4E\u78B3\u7ADE\u4E89",
      title: "\u4EA7\u54C1\u78B3\u5F00\u59CB\u8FDB\u5165\u5E02\u573A\uFF1A\u4F4E\u78B3\u80FD\u529B\u80FD\u4E0D\u80FD\u6362\u6765\u8BA2\u5355\uFF1F",
      question: "\u4EA7\u54C1\u7ED3\u6784\u3001\u4EA7\u80FD\u4E0E\u7EFF\u8272\u5E02\u573A\u673A\u4F1A\u5FC5\u987B\u540C\u65F6\u8003\u8651\u3002",
      context: "\u4EA7\u54C1\u4E0E\u751F\u4EA7\u7EC4\u5408\u4F1A\u540C\u65F6\u5F71\u54CD\u7ECF\u8425\u4F9B\u7ED9\u3001\u4EA7\u54C1\u78B3\u548C\u5E02\u573A\u673A\u4F1A\u3002",
      goal: "\u8FDE\u63A5\u4EA7\u54C1\u78B3\u4E0E\u5E02\u573A",
      constraint: "\u4EA7\u80FD\u4E0E\u5E02\u573A\u8D44\u683C",
      lesson: "Opportunity \u2260 Revenue",
      leads: ["CMO", "COO", "CCO"]
    },
    {
      no: 5,
      stage: "OFFSET / \u62B5\u78B3",
      short: "\u62B5\u78B3\u8BF1\u60D1",
      title: "\u5DF2\u7ECF\u51CF\u8FC7\u4EE5\u540E\uFF1A\u4E70\u62B5\u6D88\uFF0C\u8FD8\u662F\u7EE7\u7EED\u4FDD\u7559\u73B0\u91D1\u548C\u51CF\u6392\u80FD\u529B\uFF1F",
      question: "\u62B5\u78B3\u53EF\u4EE5\u6539\u5584\u78B3\u5934\u5BF8\uFF0C\u4F46\u4E0D\u80FD\u6539\u5199 Actual Reduction\u3002",
      context: "\u62B5\u78B3\u662F\u78B3\u5934\u5BF8\u7BA1\u7406\uFF0C\u4E0D\u662F\u628A\u672A\u5B8C\u6210\u7684\u771F\u5B9E\u51CF\u6392\u201C\u8865\u6210\u201D\u51CF\u6392\u3002",
      goal: "\u7BA1\u7406\u5269\u4F59\u78B3\u5934\u5BF8",
      constraint: "\u73B0\u91D1\u4E0E\u78B3\u8D44\u4EA7",
      lesson: "Offset \u2260 Reduction",
      leads: ["CFO", "CCO", "CEO"]
    },
    {
      no: 6,
      stage: "COMMUNICATION / \u62AB\u78B3",
      short: "\u62AB\u9732\u4E0E\u58F0\u8A89",
      title: "\u6709\u4E86\u4E8B\u5B9E\u4EE5\u540E\uFF1A\u8BF4\u4EC0\u4E48\u3001\u600E\u4E48\u8BF4\u3001\u4EC0\u4E48\u65F6\u5019\u8BF4\uFF1F",
      question: "\u4F20\u64AD\u53EF\u4EE5\u521B\u9020\u8BA4\u77E5\u4E0E\u673A\u4F1A\uFF0C\u4F46\u8BC1\u636E\u8FB9\u754C\u4E0D\u80FD\u88AB\u8425\u9500\u8986\u76D6\u3002",
      context: "\u62AB\u78B3\u7531\u5185\u5BB9\u3001\u6E20\u9053\u3001\u65F6\u70B9\u3001\u8BC1\u636E\u548C\u4F20\u64AD\u5F3A\u5EA6\u5171\u540C\u6784\u6210\u3002",
      goal: "\u5F62\u6210\u53EF\u4FE1\u62AB\u9732\u7B56\u7565",
      constraint: "\u8BC1\u636E\u4E0E\u4F20\u64AD\u6210\u672C",
      lesson: "Claim needs Evidence",
      leads: ["CMO", "CCO", "CFO"]
    },
    {
      no: 7,
      stage: "COMMUNICATION / \u62AB\u78B3",
      short: "\u6838\u9A8C\u4E0E\u540E\u679C",
      title: "\u62AB\u9732\u88AB\u6838\u9A8C\uFF1A\u88AB\u6807\u8BB0\u4E0D\u7B49\u4E8E\u5DF2\u7ECF\u8FDD\u89C4",
      question: "\u56E2\u961F\u8981\u5728\u6838\u9A8C\u3001\u7EA0\u6B63\u3001\u4FE1\u8A89\u4E0E\u5E02\u573A\u540E\u679C\u4E4B\u95F4\u505A\u51FA\u6CBB\u7406\u54CD\u5E94\u3002",
      context: "\u6838\u9A8C\u7ED3\u679C\u9700\u8981\u6CBB\u7406\u54CD\u5E94\uFF0C\u4F46 FLAGGED \u4E0D\u80FD\u88AB\u754C\u9762\u76F4\u63A5\u89E3\u91CA\u6210\u8FDD\u89C4\u3002",
      goal: "\u5904\u7406\u6838\u9A8C\u4E0E\u7EA0\u6B63",
      constraint: "\u53EF\u4FE1\u5EA6\u4E0E\u6574\u6539\u6210\u672C",
      lesson: "Flag \u2260 Violation",
      leads: ["CCO", "CMO", "CEO"]
    },
    {
      no: 8,
      stage: "STIMULATION / \u6FC0\u78B3",
      short: "\u6FC0\u78B3\u4E0E\u4E0B\u4E00\u5468\u671F",
      title: "\u8FD9\u4E00\u8F6E\u7ED3\u675F\u4E86\uFF1A\u4F01\u4E1A\u771F\u6B63\u5B66\u5230\u4E86\u4EC0\u4E48\uFF0C\u4E0B\u4E00\u5468\u671F\u627F\u8BFA\u4EC0\u4E48\uFF1F",
      question: "\u7ECF\u8425\u3001\u51CF\u6392\u3001\u4EA7\u54C1\u78B3\u3001\u62B5\u78B3\u4F9D\u8D56\u3001\u62AB\u9732\u4E0E\u80FD\u529B\u5FC5\u987B\u5206\u7EF4\u5EA6\u590D\u76D8\u3002",
      context: "Feedback \u7528\u4E8E\u5B66\u4E60\uFF1B\u4E0B\u4E00\u5468\u671F\u627F\u8BFA\u5FC5\u987B\u91CD\u65B0\u7531\u56E2\u961F\u4F5C\u51FA\u3002",
      goal: "\u5F62\u6210\u4E0B\u4E00\u5468\u671F\u627F\u8BFA",
      constraint: "\u957F\u671F\u80FD\u529B\u4E0E\u8D44\u6E90",
      lesson: "Feedback \u2260 Commitment",
      leads: ["CEO", "CFO", "COO", "CCO", "CMO"]
    }
  ];
  var slotLabels = {
    D1: "\u521D\u59CB\u6218\u7565\u627F\u8BFA",
    D2: "\u521D\u59CB\u8D44\u6E90\u59FF\u6001",
    D3: "\u6570\u636E\u4E0D\u786E\u5B9A\u6027\u54CD\u5E94",
    D4: "\u6570\u636E\u4E0E\u8BC1\u636E\u6574\u6539\u4F18\u5148\u7EA7",
    D5: "\u51CF\u6392\u6295\u8D44\u5F3A\u5EA6",
    D6: "\u51CF\u6392\u9879\u76EE\u7EC4\u5408",
    D7: "\u6295\u8D44\u671F\u9650",
    D8: "\u4EA7\u54C1\u4E0E\u751F\u4EA7\u7EC4\u5408",
    D9: "\u5E02\u573A\u76EE\u6807\u9009\u62E9",
    D10: "\u5269\u4F59\u51CF\u6392\u627F\u8BFA",
    D11: "\u62B5\u78B3\u5F3A\u5EA6",
    D12: "\u78B3\u8D44\u4EA7\u7F13\u51B2",
    D13: "\u62AB\u9732\u4EC0\u4E48",
    D14: "\u5982\u4F55 / \u5728\u54EA\u91CC\u62AB\u9732",
    D15: "\u4F55\u65F6\u62AB\u9732",
    D16: "\u8BC1\u636E \xD7 \u4F20\u64AD\u5F3A\u5EA6",
    D17: "\u6838\u9A8C / \u5BA1\u8BA1\u54CD\u5E94",
    D18: "\u62AB\u9732\u7EA0\u6B63 / \u5371\u673A\u54CD\u5E94",
    D19: "\u4E0B\u4E00\u5468\u671F\u6218\u7565\u4F18\u5148\u7EA7",
    D20: "\u4E0B\u4E00\u5468\u671F\u627F\u8BFA\u96C4\u5FC3"
  };
  var valueLabels = {
    STABILIZE_CARBON_TRUTH: "\u7A33\u5B9A\u78B3\u4E8B\u5B9E\u57FA\u7840",
    PRIORITIZE_REAL_REDUCTION: "\u4F18\u5148\u771F\u5B9E\u51CF\u6392",
    BUILD_LOW_CARBON_VALUE: "\u5EFA\u7ACB\u4F4E\u78B3\u4EF7\u503C",
    LIQUIDITY_PROTECTED: "\u4F18\u5148\u4FDD\u969C\u6D41\u52A8\u6027",
    DISCIPLINED_DEPLOYMENT: "\u5BA1\u614E\u914D\u7F6E\u8D44\u6E90",
    TRANSFORMATION_CAPACITY: "\u5F3A\u5316\u8F6C\u578B\u80FD\u529B",
    PROCEED_WITH_LIMITATION: "\u5728\u660E\u786E\u9650\u5236\u6761\u4EF6\u4E0B\u7EE7\u7EED",
    REMEDIATE_BEFORE_ACTION: "\u5148\u6574\u6539\u518D\u884C\u52A8",
    WITHHOLD_AFFECTED_ACTION: "\u6682\u7F13\u53D7\u5F71\u54CD\u884C\u52A8",
    ACTIVITY_DATA: "\u6D3B\u52A8\u6570\u636E",
    PRODUCT_TRACEABILITY: "\u4EA7\u54C1\u53EF\u8FFD\u6EAF\u6027",
    DISCLOSURE_EVIDENCE: "\u62AB\u9732\u8BC1\u636E",
    BASIC: "\u57FA\u7840",
    STANDARD: "\u6807\u51C6",
    DEEP: "\u6DF1\u5EA6",
    LOW: "\u4F4E",
    MODERATE: "\u4E2D\u7B49",
    HIGH: "\u9AD8",
    SHORT: "\u77ED\u671F",
    MEDIUM: "\u4E2D\u671F",
    LONG: "\u957F\u671F",
    NONE: "\u4E0D\u4F7F\u7528\u62B5\u6D88",
    PARTIAL: "\u90E8\u5206\u62B5\u6D88",
    FULL_REMAINING_REQUIREMENT: "\u8986\u76D6\u5269\u4F59\u78B3\u9700\u6C42",
    NO_BUFFER: "\u4E0D\u8BBE\u7F6E\u7F13\u51B2",
    LIMITED_BUFFER: "\u6709\u9650\u7F13\u51B2",
    ROBUST_BUFFER: "\u7A33\u5065\u7F13\u51B2"
  };
  var dimensionLabels = {
    BUSINESS: "\u7ECF\u8425\u72B6\u6001",
    CAPABILITY: "\u7BA1\u7406\u80FD\u529B",
    REDUCTION: "\u771F\u5B9E\u51CF\u6392",
    PRODUCT_CARBON: "\u4EA7\u54C1\u78B3",
    OFFSET: "\u62B5\u78B3",
    MARKET_OPPORTUNITY: "\u5E02\u573A\u673A\u4F1A",
    REALIZED_REVENUE: "\u5DF2\u5B9E\u73B0\u6536\u5165",
    COMMUNICATION: "\u62AB\u78B3\u4F20\u64AD",
    VERIFICATION: "\u6838\u9A8C",
    NEXT_CYCLE_COMMITMENT: "\u4E0B\u4E00\u5468\u671F\u627F\u8BFA",
    NEXT_CYCLE_SEED: "\u4E0B\u4E00\u5468\u671F\u73AF\u5883"
  };
  function mountPlayableTeachingUI(runtimePort, documentRoot = document) {
    const status = documentRoot.querySelector("#service-status");
    const form = documentRoot.querySelector("#decision-form");
    const output = documentRoot.querySelector("#outcome");
    const progress = documentRoot.querySelector("#progress");
    const cfSlot = documentRoot.querySelector("#cf-slot");
    let session;
    documentRoot.querySelector("#new-session").addEventListener("click", start);
    documentRoot.querySelector("#run-cf1").addEventListener("click", runCf1);
    form.addEventListener("submit", submit);
    async function start() {
      try {
        await runtimePort.schema();
        session = await runtimePort.createSession();
        status.textContent = "\u6559\u5B66\u8FD0\u884C\u73AF\u5883 \xB7 \u53EF\u7528";
        render();
      } catch (error3) {
        status.textContent = `\u6559\u5B66\u8FD0\u884C\u73AF\u5883\u6682\u4E0D\u53EF\u7528 \xB7 ${error3.message}`;
      }
    }
    function render() {
      form.replaceChildren();
      const roundNo = session.currentRound;
      const data = roundNo ? rounds[roundNo - 1] : rounds[7];
      if (roundNo) {
        progress.textContent = `R${roundNo} / R8 \xB7 ${data.stage} \xB7 \u5DF2\u5B8C\u6210 ${session.checkpointCount} \u8F6E`;
        for (const schema of session.currentSchema) form.append(field(schema));
        const button = documentRoot.createElement("button");
        button.type = "submit";
        button.className = "primary";
        button.textContent = `\u63D0\u4EA4\u56E2\u961F\u51B3\u7B56\u5E76\u6267\u884C R${roundNo} \u2192`;
        form.append(button);
      } else {
        progress.textContent = `\u6559\u5B66\u5468\u671F\u5B8C\u6210 \xB7 8 \u4E2A\u68C0\u67E5\u70B9 \xB7 ${session.journalEntryCount} \u9879\u51B3\u7B56\u8BB0\u5F55`;
        const done = documentRoot.createElement("div");
        done.className = "decision-option selected";
        done.textContent = "\u672C\u8F6E\u6559\u5B66\u5468\u671F\u5DF2\u7ECF\u5B8C\u6210\u3002\u53EF\u4EE5\u67E5\u770B\u6700\u7EC8\u7ED3\u679C\u6216\u91CD\u65B0\u5F00\u59CB\u3002";
        form.append(done);
      }
      renderRoundMeta(data, roundNo);
      renderRoundNav(roundNo);
      renderRoles(data);
      renderCfSlots();
      renderSessionOutcome();
    }
    function renderRoundMeta(data, roundNo) {
      setText("#round-kicker", `ROUND ${data.no} \xB7 ${data.stage}`);
      setText("#round-title", data.title);
      setText("#round-question", data.question);
      setText("#round-context", data.context);
      setText("#context-goal", data.goal);
      setText("#context-constraint", data.constraint);
      setText("#context-lesson", data.lesson);
      setText("#round-counter", roundNo ? `${roundNo} / 8` : "8 / 8 \xB7 COMPLETE");
    }
    function renderRoundNav(roundNo) {
      const nav = documentRoot.querySelector("#round-nav");
      if (!nav) return;
      nav.replaceChildren(
        ...rounds.map((item) => {
          const button = documentRoot.createElement("button");
          button.type = "button";
          button.className = `round-button ${item.no === roundNo ? "active" : ""}`;
          button.disabled = true;
          const state = roundNo === null || item.no < roundNo ? "\u5DF2\u5B8C\u6210" : item.no === roundNo ? "\u5F53\u524D\u8F6E\u6B21" : "\u672A\u89E3\u9501";
          button.innerHTML = `<span class="round-number">R${item.no}</span><span class="round-copy"><b>${item.short}</b><small>${item.stage} \xB7 ${state}</small></span>`;
          return button;
        })
      );
    }
    function renderRoles(data) {
      const root = documentRoot.querySelector("#lead-roles");
      if (!root) return;
      root.replaceChildren(
        ...data.leads.map((role) => {
          const tag = documentRoot.createElement("span");
          tag.className = "role-tab active";
          tag.textContent = roles[role][0];
          return tag;
        })
      );
      setText(
        "#role-insight",
        data.leads.map((role) => `${roles[role][0]}\uFF1A${roles[role][1]}`).join("\uFF1B")
      );
    }
    function renderCfSlots() {
      cfSlot.replaceChildren(
        ...Object.keys(session.decisions).map(
          (slotId) => option(`${slotId} \xB7 ${slotLabels[slotId] ?? "\u5DF2\u5B8C\u6210\u51B3\u7B56"}`, slotId)
        )
      );
    }
    function field(schema) {
      const wrapper = documentRoot.createElement("div");
      wrapper.className = "decision-option playable-decision-field";
      wrapper.dataset.slot = schema.slotId;
      wrapper.dataset.type = schema.inputType;
      const heading = documentRoot.createElement("b");
      heading.textContent = `${schema.slotId} \xB7 ${slotLabels[schema.slotId] ?? humanize(schema.name)}`;
      wrapper.append(heading);
      const hint = documentRoot.createElement("small");
      hint.textContent = decisionHint(schema.slotId);
      wrapper.append(hint);
      if (schema.legalValues) {
        const select = documentRoot.createElement("select");
        select.multiple = schema.inputType === "SET_COMBINATION";
        select.setAttribute(
          "aria-label",
          `${schema.slotId} ${slotLabels[schema.slotId] ?? ""}`
        );
        if (select.multiple) select.size = Math.min(5, schema.legalValues.length);
        for (const value of schema.legalValues)
          select.append(option(labelValue(value), value));
        wrapper.append(select);
      } else if (schema.inputType === "BOUNDED_TUPLE") {
        wrapper.append(numberField("C1 \u4EA7\u91CF", "c1Production", 20));
        wrapper.append(numberField("C2 \u4EA7\u91CF", "c2Production", 20));
        wrapper.append(numberField("\u603B\u4EA7\u80FD\u4E0A\u9650", "productionCapacity", 100));
      } else {
        const ambitions = String(schema.structure?.ambition ?? "").replace(/^enum:/, "").split("|").filter(Boolean);
        const ambition = documentRoot.createElement("select");
        ambition.dataset.field = "ambition";
        for (const value of ambitions)
          ambition.append(option(labelValue(value), value));
        wrapper.append(ambition);
        wrapper.append(textField("\u4E0B\u4E00\u5468\u671F\u76EE\u6807", "target"));
        wrapper.append(textField("\u5173\u952E\u80FD\u529B\u7F3A\u53E3", "capabilityGap"));
        wrapper.append(textField("\u9884\u7B97\u6295\u5165\u610F\u5411", "budgetIntent"));
      }
      return wrapper;
    }
    async function submit(event2) {
      event2.preventDefault();
      try {
        const values2 = {};
        for (const wrapper of form.querySelectorAll("[data-slot][data-type]")) {
          const slot2 = wrapper.dataset.slot;
          if (wrapper.dataset.type === "BOUNDED_TUPLE") {
            values2[slot2] = Object.fromEntries(
              [...wrapper.querySelectorAll("[data-field]")].map((input) => [
                input.dataset.field,
                Number(input.value)
              ])
            );
          } else if (wrapper.dataset.type === "STRUCTURED_INPUT") {
            values2[slot2] = Object.fromEntries(
              [...wrapper.querySelectorAll("[data-field]")].map((input) => [
                input.dataset.field,
                input.value
              ])
            );
          } else {
            const select = wrapper.querySelector("select");
            values2[slot2] = select.multiple ? [...select.selectedOptions].map(({ value }) => value) : select.value;
          }
        }
        await runtimePort.decisions(session.sessionId, values2);
        session = await runtimePort.execute(session.sessionId);
        render();
        documentRoot.querySelector(".mission-card")?.scrollIntoView?.({
          behavior: "smooth",
          block: "start"
        });
      } catch (error3) {
        renderNotice("\u672C\u8F6E\u5C1A\u672A\u6267\u884C", friendlyError(error3));
      }
    }
    async function runCf1() {
      if (!session || !cfSlot.value) return;
      try {
        renderCf1(await runtimePort.cf1(session.sessionId, cfSlot.value));
      } catch (error3) {
        renderNotice("\u6682\u65F6\u65E0\u6CD5\u6BD4\u8F83", friendlyError(error3));
      }
    }
    function renderSessionOutcome() {
      if (!session.lastCheckpoint && !session.finalResult) {
        renderNotice(
          "\u7B49\u5F85\u672C\u8F6E\u51B3\u7B56",
          "\u5B8C\u6210\u5E76\u63D0\u4EA4\u672C\u8F6E\u5168\u90E8\u9009\u62E9\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u771F\u5B9E\u8FD0\u884C\u7ED3\u679C\u3002"
        );
        return;
      }
      const cards = [];
      const runtime = session.runtimeState ?? {};
      if (runtime.business !== void 0)
        cards.push(resultCard("\u7ECF\u8425\u72B6\u6001", semanticSummary(runtime.business)));
      if (runtime.capability !== void 0)
        cards.push(resultCard("\u7BA1\u7406\u80FD\u529B", semanticSummary(runtime.capability)));
      if (runtime.carbonTruth !== void 0)
        cards.push(
          resultCard("Carbon Truth", semanticSummary(runtime.carbonTruth))
        );
      if (session.finalResult)
        cards.push(
          resultCard("\u5468\u671F\u7EFC\u5408\u7ED3\u679C", semanticSummary(session.finalResult))
        );
      if (cards.length === 0)
        cards.push(
          resultCard(
            "\u672C\u8F6E\u5DF2\u5B8C\u6210",
            `\u771F\u5B9E\u8FD0\u884C\u68C0\u67E5\u70B9 ${session.checkpointCount} \u5DF2\u751F\u6210\u3002`
          )
        );
      output.replaceChildren(...cards);
    }
    function renderCf1(result) {
      if (result.status !== "AVAILABLE") {
        renderNotice(
          "\u672C\u51B3\u7B56\u6682\u4E0D\u80FD\u505A\u53CD\u4E8B\u5B9E\u6BD4\u8F83",
          "\u5F53\u524D\u6CA1\u6709\u53D7\u6CBB\u7406\u7684\u6709\u9650\u5907\u9009\u96C6\u5408\u3002"
        );
        return;
      }
      const cards = [
        resultCard(
          `\u5B9E\u9645\u9009\u62E9 \xB7 ${slotLabels[result.slotId] ?? result.slotId}`,
          displayValue(result.actualSelection)
        )
      ];
      for (const candidate of result.results) {
        const dimensions = candidate.changedDimensions?.length ? candidate.changedDimensions.map((item) => dimensionLabels[item] ?? humanize(item)).join("\u3001") : "\u6CA1\u6709\u4EA7\u751F\u5B9E\u8D28\u6027\u7ED3\u679C\u5DEE\u5F02";
        cards.push(
          resultCard(
            `\u5982\u679C\u6539\u4E3A\uFF1A${displayValue(candidate.alternativeSelection)}`,
            candidate.materialDifference ? `\u4F1A\u6539\u53D8\uFF1A${dimensions}` : dimensions
          )
        );
      }
      output.replaceChildren(...cards);
    }
    function renderNotice(title, message) {
      output.replaceChildren(resultCard(title, message));
    }
    function resultCard(title, message) {
      const article = documentRoot.createElement("article");
      const small = documentRoot.createElement("small");
      small.textContent = "TEACHING VIEW";
      const strong = documentRoot.createElement("b");
      strong.textContent = title;
      const span = documentRoot.createElement("span");
      span.textContent = message;
      article.append(small, strong, span);
      return article;
    }
    function numberField(label, fieldName, initialValue) {
      const container = documentRoot.createElement("label");
      container.textContent = label;
      const input = documentRoot.createElement("input");
      input.type = "number";
      input.min = "0";
      input.step = "1";
      input.value = String(initialValue);
      input.dataset.field = fieldName;
      container.append(input);
      return container;
    }
    function textField(label, fieldName) {
      const container = documentRoot.createElement("label");
      container.textContent = label;
      const input = documentRoot.createElement("input");
      input.type = "text";
      input.required = true;
      input.dataset.field = fieldName;
      container.append(input);
      return container;
    }
    function option(label, value) {
      const item = documentRoot.createElement("option");
      item.textContent = label;
      item.value = value;
      return item;
    }
    function setText(selector, value) {
      const target = documentRoot.querySelector(selector);
      if (target) target.textContent = value;
    }
    return Object.freeze({ start });
  }
  function labelValue(value) {
    return String(value).split("+").map((part) => valueLabels[part] ?? humanize(part)).join(" + ");
  }
  function humanize(value) {
    return String(value ?? "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
  }
  function decisionHint(slotId) {
    const hints = {
      D1: "\u4F60\u5E0C\u671B\u4F01\u4E1A\u9996\u5148\u5B88\u4F4F\u4EC0\u4E48\uFF1F",
      D2: "\u8D44\u6E90\u914D\u7F6E\u5E94\u66F4\u504F\u5411\u73B0\u91D1\u5B89\u5168\u3001\u5BA1\u614E\u6295\u5165\u8FD8\u662F\u8F6C\u578B\u80FD\u529B\uFF1F",
      D3: "\u9762\u5BF9\u6570\u636E\u4E0D\u786E\u5B9A\u6027\uFF0C\u884C\u52A8\u5E94\u8BE5\u7EE7\u7EED\u3001\u6574\u6539\u8FD8\u662F\u6682\u7F13\uFF1F",
      D4: "\u628A\u6709\u9650\u6574\u6539\u8D44\u6E90\u4F18\u5148\u6295\u5165\u54EA\u4E2A\u8BC1\u636E\u9886\u57DF\u3001\u505A\u5230\u591A\u6DF1\uFF1F",
      D5: "\u4F60\u613F\u610F\u627F\u62C5\u591A\u5927\u5F3A\u5EA6\u7684\u51CF\u6392\u6295\u8D44\uFF1F",
      D6: "\u9009\u62E9\u51C6\u5907\u771F\u6B63\u6267\u884C\u7684\u51CF\u6392\u9879\u76EE\u7EC4\u5408\u3002\u53EF\u591A\u9009\u3002",
      D7: "\u4F60\u63A5\u53D7\u591A\u957F\u7684\u6295\u8D44\u5B9E\u73B0\u5468\u671F\uFF1F",
      D8: "\u5728\u603B\u4EA7\u80FD\u7EA6\u675F\u4E0B\u51B3\u5B9A C1 \u4E0E C2 \u7684\u751F\u4EA7\u7EC4\u5408\u3002",
      D9: "\u4F01\u4E1A\u51C6\u5907\u4F18\u5148\u4E89\u53D6\u54EA\u7C7B\u5E02\u573A\uFF1F",
      D10: "\u9762\u5BF9\u5269\u4F59\u51CF\u6392\u4EFB\u52A1\uFF0C\u56E2\u961F\u51C6\u5907\u5982\u4F55\u7EE7\u7EED\uFF1F",
      D11: "\u5BF9\u5269\u4F59\u78B3\u5934\u5BF8\u4F7F\u7528\u591A\u5927\u7A0B\u5EA6\u7684\u62B5\u6D88\uFF1F",
      D12: "\u662F\u5426\u4E3A\u672A\u6765\u4E0D\u786E\u5B9A\u6027\u4FDD\u7559\u78B3\u8D44\u4EA7\u7F13\u51B2\uFF1F",
      D13: "\u9009\u62E9\u51C6\u5907\u6B63\u5F0F\u5BF9\u5916\u62AB\u9732\u7684\u5185\u5BB9\u3002\u53EF\u591A\u9009\u3002",
      D14: "\u9009\u62E9\u62AB\u9732\u6E20\u9053\u4E0E\u89E6\u8FBE\u65B9\u5F0F\u3002",
      D15: "\u51B3\u5B9A\u62AB\u9732\u65F6\u70B9\u3002",
      D16: "\u8BC1\u636E\u5F3A\u5EA6\u4E0E\u4F20\u64AD\u5F3A\u5EA6\u5FC5\u987B\u4E00\u8D77\u8003\u8651\u3002",
      D17: "\u9762\u5BF9\u6838\u9A8C\u7ED3\u679C\uFF0C\u9009\u62E9\u6CBB\u7406\u54CD\u5E94\u3002",
      D18: "\u5982\u9700\u7EA0\u6B63\u62AB\u9732\u6216\u5904\u7406\u5371\u673A\uFF0C\u56E2\u961F\u600E\u4E48\u505A\uFF1F",
      D19: "\u4E0B\u4E00\u5468\u671F\u6700\u4F18\u5148\u89E3\u51B3\u4EC0\u4E48\uFF1F",
      D20: "\u7531\u56E2\u961F\u4EB2\u81EA\u5199\u51FA\u4E0B\u4E00\u5468\u671F\u627F\u8BFA\uFF0C\u800C\u4E0D\u662F\u8BA9\u7CFB\u7EDF\u66FF\u4F60\u751F\u6210\u3002"
    };
    return hints[slotId] ?? "\u8BF7\u9009\u62E9\u4E00\u4E2A\u53D7\u6CBB\u7406\u7684\u7BA1\u7406\u65B9\u6848\u3002";
  }
  function displayValue(value) {
    if (Array.isArray(value)) return value.map(labelValue).join("\u3001");
    if (value && typeof value === "object")
      return Object.entries(value).filter(([key]) => !isTechnicalKey(key)).map(([key, nested]) => `${friendlyKey(key)}\uFF1A${displayValue(nested)}`).join("\uFF1B");
    return labelValue(value);
  }
  function semanticSummary(value) {
    const leaves = [];
    collectSemanticLeaves(value, leaves);
    if (leaves.length === 0) return "\u672C\u8F6E\u5DF2\u7531\u771F\u5B9E\u8FD0\u884C\u65F6\u5B8C\u6210\uFF0C\u7ED3\u679C\u8BC1\u636E\u5DF2\u4FDD\u7559\u3002";
    return leaves.slice(0, 6).map(([key, nested]) => `${friendlyKey(key)}\uFF1A${displayValue(nested)}`).join("\uFF1B");
  }
  function collectSemanticLeaves(value, leaves, prefix = "") {
    if (leaves.length >= 8 || value === null || value === void 0) return;
    if (Array.isArray(value)) {
      if (value.every(
        (item) => ["string", "number", "boolean"].includes(typeof item)
      ))
        leaves.push([prefix || "\u7ED3\u679C", value]);
      return;
    }
    if (typeof value !== "object") {
      leaves.push([prefix || "\u7ED3\u679C", value]);
      return;
    }
    for (const [key, nested] of Object.entries(value)) {
      if (isTechnicalKey(key)) continue;
      const next = prefix ? `${prefix}.${key}` : key;
      if (nested === null || ["string", "number", "boolean"].includes(typeof nested))
        leaves.push([next, nested]);
      else collectSemanticLeaves(nested, leaves, next);
      if (leaves.length >= 8) break;
    }
  }
  function isTechnicalKey(key) {
    const normalized = String(key).toLowerCase();
    return normalized === "id" || normalized.endsWith("id") || normalized.includes("reference") || normalized.includes("provenance") || normalized.includes("lineage") || normalized.includes("authority") || normalized.includes("hash") || normalized.endsWith("at");
  }
  function friendlyKey(key) {
    const last = String(key).split(".").at(-1);
    const labels = {
      cash: "\u73B0\u91D1",
      liquidityReserve: "\u6D41\u52A8\u6027\u50A8\u5907",
      productionCapacity: "\u751F\u4EA7\u80FD\u529B",
      actualReduction: "\u771F\u5B9E\u51CF\u6392",
      operatingCarbonNetChange: "\u7ECF\u8425\u78B3\u51C0\u53D8\u5316",
      carbonPosition: "\u78B3\u5934\u5BF8",
      capability: "\u80FD\u529B",
      status: "\u72B6\u6001",
      score: "\u8BC4\u5206",
      revenue: "\u6536\u5165",
      realizedRevenue: "\u5DF2\u5B9E\u73B0\u6536\u5165",
      marketOpportunity: "\u5E02\u573A\u673A\u4F1A",
      strategicPriority: "\u6218\u7565\u4F18\u5148\u7EA7",
      ambition: "\u627F\u8BFA\u96C4\u5FC3",
      target: "\u76EE\u6807",
      capabilityGap: "\u80FD\u529B\u7F3A\u53E3",
      budgetIntent: "\u9884\u7B97\u610F\u5411"
    };
    return labels[last] ?? humanize(last);
  }
  function friendlyError(error3) {
    const message = String(error3?.message ?? error3 ?? "Unknown error");
    if (message.includes("requires unique frozen BD project IDs"))
      return "\u51CF\u6392\u9879\u76EE\u7EC4\u5408\u81F3\u5C11\u9700\u8981\u9009\u62E9\u4E00\u4E2A\u9879\u76EE\uFF0C\u5E76\u4E14\u4E0D\u80FD\u91CD\u590D\u3002";
    if (message.includes("nonblank")) return "\u8BF7\u628A\u672C\u8F6E\u9700\u8981\u586B\u5199\u7684\u5185\u5BB9\u8865\u5145\u5B8C\u6574\u3002";
    if (message.includes("Unknown frozen"))
      return "\u5B58\u5728\u4E0D\u7B26\u5408\u672C\u8F6E\u6CBB\u7406\u89C4\u5219\u7684\u9009\u62E9\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002";
    return message.replaceAll("FAIL-CLOSED", "\u7CFB\u7EDF\u5DF2\u963B\u6B62\u65E0\u6548\u63D0\u4EA4");
  }

  // 13_Demo/BD_Manufacturing/teaching-ui/playable-browser-entry.js
  void mountPlayableTeachingUI(new BrowserTeachingRuntimeV080()).start();
})();
