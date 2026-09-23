export function validateSimUi2BrowserSelection(slotId, selection, catalog) {
  if (slotId === 'D6' || slotId === 'D13') {
    if (!Array.isArray(selection) || selection.length === 0)
      throw new Error(`${slotId} requires at least one selection.`);
    if (new Set(selection).size !== selection.length)
      throw new Error(`${slotId} selections must be unique.`);
    if (selection.some((item) => !catalog[slotId].includes(item)))
      throw new Error(`${slotId} uses an unknown active catalog value.`);
    return;
  }
  if (slotId === 'D16') {
    if (
      typeof selection !== 'object' ||
      selection === null ||
      Array.isArray(selection) ||
      !catalog.D16_EVIDENCE.includes(selection.evidence) ||
      !catalog.D16_INTENSITY.includes(selection.intensity)
    )
      throw new Error('D16 uses an unknown governed catalog value.');
    return;
  }
  if (slotId === 'D20') {
    if (
      typeof selection !== 'object' ||
      selection === null ||
      Array.isArray(selection) ||
      !catalog.D20.includes(selection.ambition) ||
      ['target', 'capabilityGap', 'budgetIntent'].some(
        (field) =>
          typeof selection[field] !== 'string' ||
          selection[field].trim() === '',
      )
    )
      throw new Error(
        'D20 requires explicit ambition, target, capability gap and budget intent.',
      );
    return;
  }
  if (slotId === 'D4') {
    if (
      typeof selection !== 'object' ||
      selection === null ||
      Array.isArray(selection) ||
      !catalog.D4_DOMAIN.includes(selection.domain) ||
      !catalog.D4_INTENSITY.includes(selection.intensity)
    )
      throw new Error('D4 uses an unknown catalog value.');
    return;
  }
  if (selection === '')
    throw new Error(`${slotId} requires explicit learner selection.`);
  if (!catalog[slotId]?.includes(selection))
    throw new Error(`${slotId} uses an unknown catalog value.`);
}

export async function buildSimUi2BrowserDraft(input) {
  validateSimUi2BrowserSelection(input.slotId, input.selection, input.catalog);
  if (typeof input.sha256 !== 'function')
    throw new TypeError('Browser draft builder requires a sha256 function.');

  const payload = {
    provenance: 'UI_DRAFT',
    authoritative: false,
    draftId: input.draftId,
    slotId: input.slotId,
    workspace: input.workspace,
    selection: input.selection,
    captureStatus: input.captureStatus,
    effectStatus: input.effectStatus,
  };
  const reference =
    'teaching-v100-ui-draft:' +
    (await input.sha256(canonicalizeSimUi2BrowserDraft(payload)));
  return Object.freeze({ ...payload, reference });
}

export function buildSimUi4BrowserAuthorizationRequest(input) {
  const { draft, authorizationContext, lifecycleStatus } = input;
  if (
    typeof draft !== 'object' ||
    draft === null ||
    draft.provenance !== 'UI_DRAFT' ||
    draft.authoritative !== false ||
    !['D19', 'D20'].includes(draft.slotId)
  )
    throw new Error(
      'SIM-UI-4 authorization requires an actual browser D19/D20 UI_DRAFT.',
    );
  if (lifecycleStatus !== 'CONFIRMED')
    throw new Error(
      `${lifecycleStatus} cannot authorize; explicit CONFIRMED authorization is required.`,
    );
  if (!authorizationContext)
    throw new Error(
      'MISSING_AUTHORITY: exact authorization context is required.',
    );
  return Object.freeze({ draft, authorizationContext, lifecycleStatus });
}

export function formatGovernedBrowserValue(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export async function buildSimUi3ProductionBrowserDraft(input) {
  if (!['D14', 'D15', 'D16'].includes(input.slotId))
    throw new Error('Production Communication draft supports D14-D16 only.');
  if (typeof input.sha256 !== 'function')
    throw new TypeError('Browser draft builder requires a sha256 function.');
  const governedSelections = {};
  const add = async (key, dimension, member, catalog) => {
    if (!catalog || !member)
      throw new Error(
        `BLOCKED_POLICY: ${dimension} Production admission is unavailable.`,
      );
    const governedSelectionReference =
      'communication-selection-v100:' +
      (await input.sha256(
        canonicalizeSimUi2BrowserDraft({
          catalog: catalog.catalogReference,
          member,
          context: catalog.contextReference,
        }),
      ));
    governedSelections[key] = Object.freeze({
      dimension,
      memberReference: member,
      governedSelectionReference,
      catalogPolicyReference: catalog.catalogReference,
      catalogId: catalog.catalogId,
      catalogVersion: catalog.catalogVersion,
      contextReference: catalog.contextReference,
      sourceReference: catalog.sourceReference,
      sourceVersion: catalog.sourceVersion,
    });
  };
  if (input.slotId === 'D16') {
    await add(
      'evidence',
      'EVIDENCE',
      input.selection.evidence,
      input.catalogs.D16_EVIDENCE,
    );
    await add(
      'intensity',
      'INTENSITY',
      input.selection.intensity,
      input.catalogs.D16_INTENSITY,
    );
  } else {
    await add(
      'primary',
      input.slotId === 'D14' ? 'HOW_WHERE' : 'WHEN',
      input.selection,
      input.catalogs[input.slotId],
    );
  }
  const normalizedSelection =
    input.slotId === 'D16'
      ? Object.freeze({
          evidence: governedSelections.evidence.memberReference,
          intensity: governedSelections.intensity.memberReference,
        })
      : governedSelections.primary.memberReference;
  const payload = Object.freeze({
    provenance: 'UI_DRAFT',
    authoritative: false,
    draftId: input.draftId,
    slotId: input.slotId,
    workspace: 'COMMUNICATION',
    selection: normalizedSelection,
    captureStatus: input.captureStatus,
    effectStatus: 'CAPTURE_ONLY',
    catalogAdmissionStatus: 'PRODUCTION_AVAILABLE',
    downstreamExecutionReadiness: 'BLOCKED_MISSING_CONTEXT',
    contextReference: input.contextReference,
    governedSelections: Object.freeze({ ...governedSelections }),
  });
  return Object.freeze({
    ...payload,
    reference:
      'teaching-v100-ui-draft:' +
      (await input.sha256(canonicalizeSimUi2BrowserDraft(payload))),
  });
}

export function canonicalizeSimUi2BrowserDraft(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean')
    return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new TypeError('Deterministic values must use finite numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value))
    return `[${value.map((item) => canonicalizeSimUi2BrowserDraft(item)).join(',')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    return `{${entries
      .map(
        ([key, item]) =>
          `${JSON.stringify(key)}:${canonicalizeSimUi2BrowserDraft(item)}`,
      )
      .join(',')}}`;
  }
  throw new TypeError(`Unsupported deterministic value type: ${typeof value}.`);
}
