# CROCS Teaching v1 Sandbox — Phase A

**Status:** `TEACHER / PRODUCT REVIEW CANDIDATE — PARTIAL AUTHORITY`  
**Authority baseline:** `main@3938b3204eb3be31c624a3d8d8be25617e932fd9`  
**Implementation contract:** `SANDBOX_V1_CONSOLIDATED_IMPLEMENTATION_CONTRACT_V1_0`

## Purpose

This directory is the first browser-visible Teaching v1 sandbox slice after the Design Master recovery and D1–D20 catalog/workspace mapping were frozen.

It presents exactly six Teaching v1 learner workspaces:

1. Business Decision — D1–D2
2. Commitment / 确碳 — D3–D4
3. Reduction / 减碳 — D5–D10
4. Offset / 抵碳 — D11–D12
5. Communication / 披碳 — D13–D18
6. Stimulation / 激碳 — D19–D20

Phase A is deliberately conservative. It exposes incomplete authority instead of inventing missing model behavior.

## Authority boundary

```text
Teaching UI != Carbon Truth authority
UI_DRAFT != PLAYER_DECISION
PLAYER_DECISION != EXECUTED FACT
Simulation Outcome != Carbon Truth
Enterprise Actual Reduction != Operating Carbon Net Change
Reduction != Offset
Missing != Zero
WITHHELD != FAIL
```

The browser does not calculate Carbon Truth.

Displayed BD facts are read-only source-backed projections from existing governed/reference evidence.

## Decision behavior

The browser may save local `UI_DRAFT` records in browser storage.

- D1–D18 do not gain execution authority merely because the learner selects a value.
- D17/D18 direct execution remains `CONFORMANCE_DRIFT`; the browser may capture the approved catalog choice as a draft but must not silently translate it into current v1 Communication follow-up semantics.
- D19/D20 have an existing governed domain capture boundary in `teaching-interaction.ts`, but the static browser remains a presentation/draft surface. Formal authoritative capture requires that domain boundary and explicit learner authorization.

Open production policies and unavailable adapters remain shown as `BLOCKED_POLICY`, `UNRESOLVED`, `WITHHELD`, or `CONFORMANCE_DRIFT`.

## Files

- `index.html` — six-workspace Phase-A shell.
- `styles.css` — desktop/mobile review layout and accessibility treatment.
- `app.js` — navigation, projection rendering, local UI drafts, and evidence drawer. Contains no carbon/business calculation.
- `projection.json` — deterministic static review projection and approved catalog/status data.
- `README.md` — this authority/operation record.

Generated publication assets are produced by the repository export command into a separate generated directory; do not edit generated output as a source of business semantics.

## Local review

The UI loads `projection.json` through `fetch`, so serve this directory through a local HTTP server rather than opening it only as `file://`.

Example:

```bash
cd 13_Demo/BD_Manufacturing/teaching-ui-v100
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

No database, API, login, external service, or Carbon calculation service is required for Phase A review.

## Known governed limitations

Phase A intentionally preserves:

- A1 Scale-200 governed runtime adapter — `UNRESOLVED`;
- A3 production comparison protocol — `BLOCKED_POLICY`;
- some A4 executable paths — `UNRESOLVED`;
- production market / organization / qualification policy — OPEN / `BLOCKED_POLICY`;
- product-level `PARAM-HASH-*` — OPEN;
- K1–K8 approved identities — present, substantive card bodies `CONTENT_UNAVAILABLE`;
- broader Stimulation evidence — `UNRESOLVED / WITHHELD`;
- D17/D18 current v1 execution mismatch — `CONFORMANCE_DRIFT`.

## Publication gate

Do not publish this directory as final `/v100-sandbox/` until:

1. exact implementation-head CI passes;
2. cumulative Design Master + all three active Teaching ledgers are reviewed;
3. `Baseline Requirements Lost = 0`;
4. `Unreviewed Semantic Substitutions = 0`;
5. PR #195 is independently reviewed and merged.

Even after Phase-A publication, the page must retain the visible:

`TEACHING v1 · PHASE A / PARTIAL AUTHORITY`

banner until a later approved gate explicitly closes the remaining governed model gaps.
