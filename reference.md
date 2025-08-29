# Reference

## Interactions

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">listAllInteractions</a>({ ...params }) -> core.Page<Corti.InteractionsListResponseInteractionsItem></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Lists all existing interactions. Results can be filtered by encounter status and patient identifier.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.interactions.listAllInteractions();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.interactions.listAllInteractions();
while (page.hasNextPage()) {
    page = page.getNextPage();
}
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Corti.GetInteractionsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Interactions.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">createInteraction</a>({ ...params }) -> Corti.InteractionsCreateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a new interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.interactions.createInteraction({
    encounter: {
        identifier: "identifier",
        status: "planned",
        type: "first_consultation",
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Corti.InteractionsCreateRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Interactions.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">getExistingInteraction</a>(id) -> Corti.InteractionsGetResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a previously recorded interaction by its unique identifier (interaction ID).

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.interactions.getExistingInteraction("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction to retrieve. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Interactions.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">deleteInteraction</a>(id) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes an existing interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.interactions.deleteInteraction("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction to delete. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Interactions.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">updateInteraction</a>(id, { ...params }) -> Corti.InteractionsGetResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Modifies an existing interaction by updating specific fields without overwriting the entire record.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.interactions.updateInteraction("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction to update. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.InteractionsUpdateRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Interactions.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Recordings

<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">listRecordings</a>(id) -> Corti.RecordingsListResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of recordings for a given interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.recordings.listRecordings("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction for which recordings should be retrieved. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Recordings.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">deleteRecording</a>(id, recordingId) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a specific recording for a given interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.recordings.deleteRecording("id", "recordingId");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction for which the recording should be deleted from. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**recordingId:** `string` — The unique identifier of the recording to be deleted. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Recordings.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Transcripts

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">listTranscripts</a>(id, { ...params }) -> Corti.TranscriptsListResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of transcripts for a given interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.transcripts.listTranscripts("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction for which transcripts should be retrieved. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.GetInteractionsIdTranscriptsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Transcripts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">createTranscript</a>(id, { ...params }) -> Corti.TranscriptsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a new transcript for an interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.transcripts.createTranscript("id", {
    recordingId: "recordingId",
    primaryLanguage: "primaryLanguage",
    modelName: "modelName",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction for which the transcript is created. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.TranscriptsCreateRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Transcripts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">getTranscript</a>(id, transcriptId) -> Corti.TranscriptsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves the transcript for a specific interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.transcripts.getTranscript("id", "transcriptId");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction containing the transcript. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**transcriptId:** `string` — The unique identifier of the transcript to retrieve. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Transcripts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">deleteTranscript</a>(id, transcriptId) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a specific transcript associated with an interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.transcripts.deleteTranscript("id", "transcriptId");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction to which the transcript belongs. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**transcriptId:** `string` — The unique identifier of the transcript to delete. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Transcripts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Facts

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">listFactGroups</a>() -> Corti.FactsFactGroupsListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.facts.listFactGroups();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Facts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">listFacts</a>(id) -> Corti.FactsListResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of facts for a given interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.facts.listFacts("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction for which facts should be retrieved. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Facts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">addFacts</a>(id, { ...params }) -> Corti.FactsCreateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Adds new facts to an interaction.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.facts.addFacts("id", {
    facts: [
        {
            text: "text",
            group: "other",
        },
    ],
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction to which the facts belong. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.FactsCreateRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Facts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">updateFacts</a>(id, { ...params }) -> Corti.FactsBatchUpdateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates multiple facts associated with an interaction. If the interaction `status = "in progress"`, the updated facts will be sent to the client over WebSocket.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.facts.updateFacts("id", {
    facts: [
        {
            factId: "factId",
        },
    ],
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction for which facts are being updated. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.FactsBatchUpdateRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Facts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">updateFact</a>(id, factId, { ...params }) -> Corti.FactsUpdateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates an existing fact within a specific interaction. If the interaction `status = "in progress"`, the updated fact will be sent to the client via WebSocket. To discard a fact, simply set `discarded = true`.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.facts.updateFact("id", "factId", {
    text: "text",
    source: "core",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The unique identifier of the interaction to which the fact belongs. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**factId:** `string` — The unique identifier of the fact to update. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.FactsUpdateRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Facts.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Documents

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">listDocuments</a>(id) -> Corti.DocumentsListResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List Documents

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.listDocuments("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The interaction ID representing the context for the request. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Documents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">generateDocument</a>(id, { ...params }) -> Corti.DocumentsGetResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generate Document.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.generateDocument("id", {
    cortiRetentionPolicy: "none",
    body: {
        context: [],
        templateKey: "templateKey",
        outputLanguage: "outputLanguage",
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The interaction ID representing the context for the request. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.PostInteractionsIdDocumentsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Documents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">getDocument</a>(id, documentId, { ...params }) -> Corti.DocumentsGetResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get Document.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.getDocument("id", "documentId");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The interaction ID representing the context for the request. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**documentId:** `string` — The document ID representing the context for the request. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.GetInteractionsIdDocumentsDocumentIdRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Documents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">deleteDocument</a>(id, documentId) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.deleteDocument("id", "documentId");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The interaction ID representing the context for the request. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**documentId:** `string` — The document ID representing the context for the request. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Documents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">updateDocument</a>(id, documentId, { ...params }) -> Corti.DocumentsGetResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.updateDocument("id", "documentId");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string` — The interaction ID representing the context for the request. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**documentId:** `string` — The document ID representing the context for the request. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.DocumentsUpdateRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Documents.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Templates

<details><summary><code>client.templates.<a href="/src/api/resources/templates/client/Client.ts">listTemplateSections</a>({ ...params }) -> Corti.TemplatesSectionListResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of template sections with optional filters for organization and language.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.templates.listTemplateSections();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Corti.GetTemplateSectionsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Templates.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.templates.<a href="/src/api/resources/templates/client/Client.ts">listTemplates</a>({ ...params }) -> Corti.TemplatesListResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of templates with optional filters for organization, language, and status.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.templates.listTemplates();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Corti.GetTemplatesRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Templates.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.templates.<a href="/src/api/resources/templates/client/Client.ts">getTemplate</a>(key) -> Corti.TemplatesItem</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves template by key.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.templates.getTemplate("key");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**key:** `string` — The key of the template

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Templates.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Auth

<details><summary><code>client.auth.<a href="/src/api/resources/auth/client/Client.ts">getToken</a>({ ...params }) -> Corti.GetTokenResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Obtain an OAuth2 access token using client credentials

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.auth.getToken({
    clientId: "client_id",
    clientSecret: "client_secret",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Corti.AuthGetTokenRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Auth.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
