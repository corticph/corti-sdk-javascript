# Quickstart

Get your first medical code predictions in under 5 minutes.

This guide walks you through making a request to the Code Prediction API — from setting up credentials to reading the structured response.

---

## Prerequisites

Before you start, you'll need:

- **A Corti account** — all accounts include access to the Medical Coding API. If you don't have one yet, sign up at the [Corti API Console](https://corti-api-console.web.app/).
- **An API client** — your tenant name, `clientId`, and `clientSecret` are all found in your API client configuration. See [Creating API clients](https://docs.corti.ai/authentication/creating_clients) to set one up and retrieve these values.

---

## Step 1: Send a prediction request

The endpoint accepts a clinical note as plain text and returns predicted codes with supporting evidence.

**Endpoint:** `POST https://api.{environment}.corti.app/v2/tools/coding/`

> **Which environment to use?** Your environment (`eu` or `us`) is determined by your API client configuration — see the [Authentication guide](https://corti-docs-medical-coding.mintlify.app/authentication) for details. Replace `{environment}` in the URL below with the correct value for your account. When using the SDK, pass the matching `CortiEnvironment` constant.

### Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `system` | `string[]` | Yes | One or more coding systems to apply. Up to 4 systems per request. See [Coding Systems](https://corti-docs-medical-coding.mintlify.app/coding/coding-systems) for all options and recommended pairings. |
| `context` | `object[]` | Yes | The clinical input to code. Each item is either a `text` object (a string) or a `documentId` reference to a document stored in Corti. |
| `filter` | `object` | No | Optionally restrict predictions to a specific set of codes or categories. See [Code Prediction](https://corti-docs-medical-coding.mintlify.app/coding/code-prediction) for details. |

The example below uses `icd10cm-outpatient` — the right choice for outpatient, emergency, and office visits in the US.

```typescript (SDK)
// Install: npm install @corti/sdk
import { CortiClient, CortiEnvironment } from "@corti/sdk";

// CortiEnvironment.Eu or CortiEnvironment.Us — see the Authentication guide
const client = new CortiClient({
  environment: CortiEnvironment.Eu,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  tenantName: TENANT_NAME,
});

const result = await client.codes.predict({
  system: ["icd10cm-outpatient"],
  context: [
    {
      type: "text",
      text: "58-year-old male presents for routine diabetes management. HbA1c is 7.2%. Patient reports occasional mild hypoglycemia. Currently on metformin 1000mg twice daily. Also notes bilateral knee pain consistent with osteoarthritis.",
    },
  ],
});
```

```bash
curl -X POST https://api.{environment}.corti.app/v2/tools/coding/ \
  -H "Authorization: Bearer <token>" \
  -H "Tenant-Name: <tenant-name>" \
  -H "Content-Type: application/json" \
  -d '{
    "system": ["icd10cm-outpatient"],
    "context": [
      {
        "type": "text",
        "text": "58-year-old male presents for routine diabetes management. HbA1c is 7.2%. Patient reports occasional mild hypoglycemia. Currently on metformin 1000mg twice daily. Also notes bilateral knee pain consistent with osteoarthritis."
      }
    ]
  }'
```

```javascript
const response = await fetch('https://api.{environment}.corti.app/v2/tools/coding/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Tenant-Name': '<tenant-name>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    system: ['icd10cm-outpatient'],
    context: [
      {
        type: 'text',
        text: '58-year-old male presents for routine diabetes management. HbA1c is 7.2%. Patient reports occasional mild hypoglycemia. Currently on metformin 1000mg twice daily. Also notes bilateral knee pain consistent with osteoarthritis.',
      },
    ],
  }),
});
const result = await response.json();
```

```python
import requests

result = requests.post(
    'https://api.{environment}.corti.app/v2/tools/coding/',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Tenant-Name': '<tenant-name>',
    },
    json={
        'system': ['icd10cm-outpatient'],
        'context': [
            {
                'type': 'text',
                'text': '58-year-old male presents for routine diabetes management. HbA1c is 7.2%. Patient reports occasional mild hypoglycemia. Currently on metformin 1000mg twice daily. Also notes bilateral knee pain consistent with osteoarthritis.',
            },
        ],
    },
).json()
```

> **SDK authentication:** The SDK handles OAuth 2.0 token acquisition and refresh automatically using your `clientId` and `clientSecret`. You don't need to manage bearer tokens manually.

---

## Step 2: Read the response

A successful `200` response returns a JSON object with three top-level keys: `codes`, `candidates`, and `usageInfo`.

```json
{
  "codes": [
    {
      "system": "icd10cm-outpatient",
      "code": "E11649",
      "display": "Type 2 diabetes mellitus with hypoglycemia without coma",
      "evidences": [
        {
          "contextIndex": 0,
          "text": "occasional mild hypoglycemia",
          "start": 90,
          "end": 118
        }
      ],
      "alternatives": [
        {
          "code": "E1165",
          "display": "Type 2 diabetes mellitus with hyperglycemia"
        }
      ]
    },
    {
      "system": "icd10cm-outpatient",
      "code": "M1711",
      "display": "Primary osteoarthritis, right knee",
      "evidences": [
        {
          "contextIndex": 0,
          "text": "bilateral knee pain consistent with osteoarthritis",
          "start": 174,
          "end": 224
        }
      ]
    }
  ],
  "candidates": [
    {
      "system": "icd10cm-outpatient",
      "code": "Z794",
      "display": "Long-term (current) use of insulin"
    }
  ],
  "usageInfo": {
    "creditsConsumed": 1.5
  }
}
```

### `codes` — primary predictions

These are the codes the model predicts with high confidence. Each code object contains:

- **`system`** — the coding system the code belongs to (mirrors what you passed in `system`)
- **`code`** — the code value (e.g. `"E11649"`)
- **`display`** — human-readable description of the code
- **`evidences`** — passages from the clinical note that support this prediction:
  - `contextIndex` — which item in your `context` array this evidence came from (0-indexed, so `0` = the first text block)
  - `text` — the exact supporting phrase
  - `start` / `end` — character offsets of that phrase within the source text (`start` is inclusive, `end` is exclusive)
- **`alternatives`** — other codes the model considered for the same clinical finding; useful for human review

### `candidates` — lower-confidence suggestions

Codes the model flagged as potentially relevant but did not predict with high confidence. In the example above, `Z794` (long-term insulin use) appears as a candidate because the patient's diabetes history is consistent with insulin therapy, even though it isn't explicitly documented.

Candidates are intended for coder review rather than automatic assignment.

### `usageInfo`

- **`creditsConsumed`** — the number of credits deducted for this request

---

## Step 3: Combine coding systems (common pattern)

Most US encounters require more than one coding system. For an outpatient office visit you'd typically pair ICD-10-CM with CPT:

```typescript (SDK)
const result = await client.codes.predict({
  system: ["icd10cm-outpatient", "cpt"],
  context: [
    {
      type: "text",
      text: "58-year-old male presents for routine diabetes management. HbA1c is 7.2%. Patient reports occasional mild hypoglycemia. Currently on metformin 1000mg twice daily. Also notes bilateral knee pain consistent with osteoarthritis.",
    },
  ],
});
```

```bash
curl -X POST https://api.{environment}.corti.app/v2/tools/coding/ \
  -H "Authorization: Bearer <token>" \
  -H "Tenant-Name: <tenant-name>" \
  -H "Content-Type: application/json" \
  -d '{
    "system": ["icd10cm-outpatient", "cpt"],
    "context": [
      {
        "type": "text",
        "text": "58-year-old male presents for routine diabetes management. HbA1c is 7.2%. Patient reports occasional mild hypoglycemia. Currently on metformin 1000mg twice daily. Also notes bilateral knee pain consistent with osteoarthritis."
      }
    ]
  }'
```

The response will include codes from both systems in the same `codes` array, each tagged with their respective `system` value. See [Coding Systems](https://corti-docs-medical-coding.mintlify.app/coding/coding-systems) for recommended pairings by encounter type.

---

## Next steps

- [Coding Systems](https://corti-docs-medical-coding.mintlify.app/coding/coding-systems) — full list of supported systems, feature availability by system, and recommended pairings by encounter type
- [Code Prediction](https://corti-docs-medical-coding.mintlify.app/coding/code-prediction) — deeper look at request options, using `documentId` input, and the `filter` parameter for restricting predictions
- [How It Works](https://corti-docs-medical-coding.mintlify.app/coding/how-it-works) — explanation of the model's prediction logic and confidence thresholds
- [Use Cases](https://corti-docs-medical-coding.mintlify.app/coding/use-cases) — encounter coding and revenue cycle workflow examples
- [API Reference](https://corti-docs-medical-coding.mintlify.app/api-reference/codes/predict-codes) — complete request/response schema
