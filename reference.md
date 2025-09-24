# Reference

## interactions

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">list</a>({ ...params }) -> core.Page<Corti.InteractionsGetResponse></code></summary>
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
const response = await client.interactions.list();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.interactions.list();
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

**request:** `Corti.InteractionsListRequest`

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

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">create</a>({ ...params }) -> Corti.InteractionsCreateResponse</code></summary>
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
await client.interactions.create({
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

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">get</a>(id) -> Corti.InteractionsGetResponse</code></summary>
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
await client.interactions.get("f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">delete</a>(id) -> void</code></summary>
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
await client.interactions.delete("f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">update</a>(id, { ...params }) -> Corti.InteractionsGetResponse</code></summary>
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
await client.interactions.update("f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

## recordings

<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">list</a>(id) -> Corti.RecordingsListResponse</code></summary>
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
await client.recordings.list("f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">delete</a>(id, recordingId) -> void</code></summary>
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
await client.recordings.delete("f47ac10b-58cc-4372-a567-0e02b2c3d479", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**recordingId:** `Corti.Uuid` — The unique identifier of the recording. Must be a valid UUID.

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

## transcripts

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">list</a>(id, { ...params }) -> Corti.TranscriptsListResponse</code></summary>
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
await client.transcripts.list("f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.TranscriptsListRequest`

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

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">create</a>(id, { ...params }) -> Corti.TranscriptsResponse</code></summary>
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
await client.transcripts.create("f47ac10b-58cc-4372-a567-0e02b2c3d479", {
    recordingId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    primaryLanguage: "en",
    modelName: "base",
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">get</a>(id, transcriptId) -> Corti.TranscriptsResponse</code></summary>
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
await client.transcripts.get("f47ac10b-58cc-4372-a567-0e02b2c3d479", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**transcriptId:** `Corti.Uuid` — The unique identifier of the transcript. Must be a valid UUID.

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

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">delete</a>(id, transcriptId) -> void</code></summary>
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
await client.transcripts.delete("f47ac10b-58cc-4372-a567-0e02b2c3d479", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**transcriptId:** `Corti.Uuid` — The unique identifier of the transcript. Must be a valid UUID.

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

## facts

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">factGroupsList</a>() -> Corti.FactsFactGroupsListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.facts.factGroupsList();
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

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">list</a>(id) -> Corti.FactsListResponse</code></summary>
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
await client.facts.list("f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">create</a>(id, { ...params }) -> Corti.FactsCreateResponse</code></summary>
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
await client.facts.create("f47ac10b-58cc-4372-a567-0e02b2c3d479", {
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">batchUpdate</a>(id, { ...params }) -> Corti.FactsBatchUpdateResponse</code></summary>
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
await client.facts.batchUpdate("f47ac10b-58cc-4372-a567-0e02b2c3d479", {
    facts: [
        {
            factId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">update</a>(id, factId, { ...params }) -> Corti.FactsUpdateResponse</code></summary>
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
await client.facts.update("f47ac10b-58cc-4372-a567-0e02b2c3d479", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**factId:** `Corti.Uuid` — The unique identifier of the fact to update. Must be a valid UUID.

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

## documents

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">list</a>(id) -> Corti.DocumentsListResponse</code></summary>
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
await client.documents.list("f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

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

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">create</a>(id, { ...params }) -> Corti.DocumentsGetResponse</code></summary>
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
await client.documents.create("f47ac10b-58cc-4372-a567-0e02b2c3d479", {
    context: [
        {
            type: "facts",
            data: [
                {
                    text: "text",
                    source: "core",
                },
            ],
        },
    ],
    templateKey: "templateKey",
    outputLanguage: "outputLanguage",
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**request:** `Corti.DocumentsCreateRequest`

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

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">get</a>(id, documentId) -> Corti.DocumentsGetResponse</code></summary>
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
await client.documents.get("f47ac10b-58cc-4372-a567-0e02b2c3d479", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**documentId:** `Corti.Uuid` — The document ID representing the context for the request. Must be a valid UUID.

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

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">delete</a>(id, documentId) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.delete("f47ac10b-58cc-4372-a567-0e02b2c3d479", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**documentId:** `Corti.Uuid` — The document ID representing the context for the request. Must be a valid UUID.

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

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">update</a>(id, documentId, { ...params }) -> Corti.DocumentsGetResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.update("f47ac10b-58cc-4372-a567-0e02b2c3d479", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
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

**id:** `Corti.Uuid` — The unique identifier of the interaction. Must be a valid UUID.

</dd>
</dl>

<dl>
<dd>

**documentId:** `Corti.Uuid` — The document ID representing the context for the request. Must be a valid UUID.

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

<details><summary><code>client.templates.<a href="/src/api/resources/templates/client/Client.ts">sectionList</a>({ ...params }) -> Corti.TemplatesSectionListResponse</code></summary>
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
await client.templates.sectionList();
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

**request:** `Corti.TemplatesSectionListRequest`

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

<details><summary><code>client.templates.<a href="/src/api/resources/templates/client/Client.ts">list</a>({ ...params }) -> Corti.TemplatesListResponse</code></summary>
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
await client.templates.list();
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

**request:** `Corti.TemplatesListRequest`

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

<details><summary><code>client.templates.<a href="/src/api/resources/templates/client/Client.ts">get</a>(key) -> Corti.TemplatesItem</code></summary>
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
await client.templates.get("key");
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
