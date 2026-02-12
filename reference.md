# Reference
## Interactions
<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">list</a>({ ...params }) -> core.Page&lt;Corti.InteractionsGetResponse, Corti.InteractionsListResponse&gt;</code></summary>
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
const pageableResponse = await client.interactions.list();
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.interactions.list();
while (page.hasNextPage()) {
    page = page.getNextPage();
}

// You can also access the underlying response
const response = page.response;

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

**requestOptions:** `InteractionsClient.RequestOptions` 
    
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
        type: "first_consultation"
    }
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

**requestOptions:** `InteractionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">get</a>({ ...params }) -> Corti.InteractionsGetResponse</code></summary>
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
await client.interactions.get({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.InteractionsGetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InteractionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">delete</a>({ ...params }) -> void</code></summary>
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
await client.interactions.delete({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.InteractionsDeleteRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InteractionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">update</a>({ ...params }) -> Corti.InteractionsGetResponse</code></summary>
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
await client.interactions.update({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.InteractionsUpdateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InteractionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Recordings
<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">list</a>({ ...params }) -> Corti.RecordingsListResponse</code></summary>
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
await client.recordings.list({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.RecordingsListRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RecordingsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">get</a>({ ...params }) -> core.BinaryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a specific recording for a given interaction.
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
await client.recordings.get({
    id: "id",
    recordingId: "recordingId"
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

**request:** `Corti.RecordingsGetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RecordingsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">delete</a>({ ...params }) -> void</code></summary>
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
await client.recordings.delete({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    recordingId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.RecordingsDeleteRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RecordingsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Transcripts
<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">list</a>({ ...params }) -> Corti.TranscriptsListResponse</code></summary>
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
await client.transcripts.list({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.TranscriptsListRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TranscriptsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">create</a>({ ...params }) -> Corti.TranscriptsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a transcript from an audio file attached, via `/recordings` endpoint, to the interaction.<br/><Note>Each interaction may have more than one audio file and transcript associated with it. While audio files up to 60min in total duration, or 150MB in total size, may be attached to an interaction, synchronous processing is only supported for audio files less than ~2min in duration.<br/><br/>If an audio file takes longer to transcribe than the 25sec synchronous processing timeout, then it will continue to process asynchronously. In this scenario, an incomplete or empty transcript with `status=processing` will be returned with a location header that can be used to retrieve the final transcript.<br/><br/>The client can poll the Get Transcript endpoint (`GET /interactions/{id}/transcripts/{transcriptId}/status`) for transcript status changes:<br/>- `200 OK` with status `processing`, `completed`, or `failed`<br/>- `404 Not Found` if the `interactionId` or `transcriptId` are invalid<br/><br/>The completed transcript can be retrieved via the Get Transcript endpoint (`GET /interactions/{id}/transcripts/{transcriptId}/`).</Note>
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
await client.transcripts.create({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    recordingId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    primaryLanguage: "en"
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

**request:** `Corti.TranscriptsCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TranscriptsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">get</a>({ ...params }) -> Corti.TranscriptsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a transcript from a specific interaction.<br/><Note>Each interaction may have more than one transcript associated with it. Use the List Transcript request (`GET /interactions/{id}/transcripts/`) to see all transcriptIds available for the interaction.<br/><br/>The client can poll this Get Transcript endpoint (`GET /interactions/{id}/transcripts/{transcriptId}/status`) for transcript status changes:<br/>- `200 OK` with status `processing`, `completed`, or `failed`<br/>- `404 Not Found` if the `interactionId` or `transcriptId` are invalid<br/><br/>Status of `completed` indicates the transcript is finalized. If the transcript is retrieved while status is `processing`, then it will be incomplete.</Note>
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
await client.transcripts.get({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    transcriptId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.TranscriptsGetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TranscriptsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">delete</a>({ ...params }) -> void</code></summary>
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
await client.transcripts.delete({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    transcriptId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.TranscriptsDeleteRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TranscriptsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.transcripts.<a href="/src/api/resources/transcripts/client/Client.ts">getStatus</a>({ ...params }) -> Corti.TranscriptsStatusResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Poll for transcript creation status.<br/><Note>Status of `completed` indicates the transcript is finalized.<br/>If the transcript is retrieved while status is `processing`, then it will be incomplete.<br/>Status of `failed` indicate the transcript was not created successfully; please retry.</Note>
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
await client.transcripts.getStatus({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    transcriptId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.TranscriptsGetStatusRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TranscriptsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Facts
<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">factGroupsList</a>() -> Corti.FactsFactGroupsListResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of available fact groups, used to categorize facts associated with an interaction.
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

**requestOptions:** `FactsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">list</a>({ ...params }) -> Corti.FactsListResponse</code></summary>
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
await client.facts.list({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.FactsListRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FactsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">create</a>({ ...params }) -> Corti.FactsCreateResponse</code></summary>
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
await client.facts.create({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    facts: [{
            text: "text",
            group: "other"
        }]
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

**request:** `Corti.FactsCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FactsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">batchUpdate</a>({ ...params }) -> Corti.FactsBatchUpdateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates multiple facts associated with an interaction.
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
await client.facts.batchUpdate({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    facts: [{
            factId: "3c9d8a12-7f44-4b3e-9e6f-9271c2bbfa08"
        }]
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

**request:** `Corti.FactsBatchUpdateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FactsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">update</a>({ ...params }) -> Corti.FactsUpdateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates an existing fact associated with a specific interaction.
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
await client.facts.update({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    factId: "3c9d8a12-7f44-4b3e-9e6f-9271c2bbfa08"
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

**request:** `Corti.FactsUpdateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FactsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.facts.<a href="/src/api/resources/facts/client/Client.ts">extract</a>({ ...params }) -> Corti.FactsExtractResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Extract facts from provided text, without storing them.
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
await client.facts.extract({
    context: [{
            type: "text",
            text: "text"
        }],
    outputLanguage: "outputLanguage"
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

**request:** `Corti.FactsExtractRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `FactsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Documents
<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">list</a>({ ...params }) -> Corti.DocumentsListResponse</code></summary>
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
await client.documents.list({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.DocumentsListRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DocumentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">create</a>({ ...params }) -> Corti.DocumentsGetResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint offers different ways to generate a document. Find guides to document generation [here](/textgen/documents-standard).
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
await client.documents.create({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    body: {
        context: [{
                type: "facts",
                data: [{
                        text: "text",
                        source: "core"
                    }]
            }],
        templateKey: "templateKey",
        outputLanguage: "outputLanguage"
    }
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

**request:** `Corti.DocumentsCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DocumentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">get</a>({ ...params }) -> Corti.DocumentsGetResponse</code></summary>
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
await client.documents.get({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    documentId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.DocumentsGetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DocumentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">delete</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.delete({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    documentId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.DocumentsDeleteRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DocumentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.documents.<a href="/src/api/resources/documents/client/Client.ts">update</a>({ ...params }) -> Corti.DocumentsGetResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.documents.update({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    documentId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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

**request:** `Corti.DocumentsUpdateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DocumentsClient.RequestOptions` 
    
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

**requestOptions:** `TemplatesClient.RequestOptions` 
    
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

**requestOptions:** `TemplatesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.templates.<a href="/src/api/resources/templates/client/Client.ts">get</a>({ ...params }) -> Corti.TemplatesItem</code></summary>
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
await client.templates.get({
    key: "key"
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

**request:** `Corti.TemplatesGetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TemplatesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Codes
<details><summary><code>client.codes.<a href="/src/api/resources/codes/client/Client.ts">predict</a>({ ...params }) -> Corti.CodesGeneralResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Predict medical codes from provided context.<br/><Note>This is a stateless endpoint, designed to predict ICD-10-CM, ICD-10-PCS, and CPT codes based on input text string or documentId.<br/><br/>More than one code system may be defined in a single request, and the maximum number of codes to return per system can also be defined.<br/><br/>Code prediction requests have two possible values for context:<br/>- `text`: One set of code prediction results will be returned based on all input text defined.<br/>- `documentId`: Code prediction will be based on that defined document only.<br/><br/>The response includes two sets of results:<br/>- `Codes`: Highest confidence bundle of codes, as selected by the code prediction model<br/>- `Candidates`: Full list of candidate codes as predicted by the model, rank sorted by model confidence with maximum possible value of 50.<br/><br/>All predicted code results are based on input context defined in the request only (not other external data or assets associated with an interaction).</Note>
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
await client.codes.predict({
    system: ["icd10cm", "cpt"],
    context: [{
            type: "text",
            text: "Short arm splint applied in ED for pain control."
        }],
    maxCandidates: 5
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

**request:** `Corti.CodesGeneralPredictRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CodesClient.RequestOptions` 
    
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
    clientId: "client_id_123",
    clientSecret: "my_secret_value"
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

**request:** `Corti.GetTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Agents
<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">list</a>({ ...params }) -> Corti.AgentsAgentResponse[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint retrieves a list of all agents that can be called by the Corti Agent Framework.
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
await client.agents.list();

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

**request:** `Corti.AgentsListRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">create</a>({ ...params }) -> Corti.AgentsAgent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint allows the creation of a new agent that can be utilized in the `POST /agents/{id}/v1/message:send` endpoint.
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
await client.agents.create({
    name: "name",
    description: "description"
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

**request:** `Corti.AgentsCreateAgent` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">get</a>({ ...params }) -> Corti.AgentsAgentResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint retrieves an agent by its identifier. The agent contains information about its capabilities and the experts it can call.
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
await client.agents.get({
    id: "12345678-90ab-cdef-gh12-34567890abc"
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

**request:** `Corti.AgentsGetRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">delete</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint deletes an agent by its identifier. Once deleted, the agent can no longer be used in threads.
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
await client.agents.delete({
    id: "12345678-90ab-cdef-gh12-34567890abc"
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

**request:** `Corti.AgentsDeleteRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">update</a>({ ...params }) -> Corti.AgentsAgent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint updates an existing agent. Only the fields provided in the request body will be updated; other fields will remain unchanged.
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
await client.agents.update({
    id: "12345678-90ab-cdef-gh12-34567890abc",
    body: {
        id: "id",
        name: "name",
        description: "description",
        systemPrompt: "systemPrompt"
    }
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

**request:** `Corti.AgentsUpdateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getCard</a>({ ...params }) -> Corti.AgentsAgentCard</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint retrieves the agent card in JSON format, which provides metadata about the agent, including its name, description, and the experts it can call.
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
await client.agents.getCard({
    id: "12345678-90ab-cdef-gh12-34567890abc"
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

**request:** `Corti.AgentsGetCardRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">messageSend</a>({ ...params }) -> Corti.AgentsMessageSendResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint sends a message to the specified agent to start or continue a task. The agent processes the message and returns a response. If the message contains a task ID that matches an ongoing task, the agent will continue that task; otherwise, it will start a new task.
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
await client.agents.messageSend({
    id: "12345678-90ab-cdef-gh12-34567890abc",
    message: {
        role: "user",
        parts: [{
                kind: "text",
                text: "text"
            }],
        messageId: "messageId",
        kind: "message"
    }
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

**request:** `Corti.AgentsMessageSendParams` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getTask</a>({ ...params }) -> Corti.AgentsTask</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint retrieves the status and details of a specific task associated with the given agent. It provides information about the task's current state, history, and any artifacts produced during its execution.
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
await client.agents.getTask({
    id: "12345678-90ab-cdef-gh12-34567890abc",
    taskId: "taskId"
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

**request:** `Corti.AgentsGetTaskRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getContext</a>({ ...params }) -> Corti.AgentsContext</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint retrieves all tasks and top-level messages associated with a specific context for the given agent.
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
await client.agents.getContext({
    id: "12345678-90ab-cdef-gh12-34567890abc",
    contextId: "contextId"
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

**request:** `Corti.AgentsGetContextRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getRegistryExperts</a>({ ...params }) -> Corti.AgentsRegistryExpertsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint retrieves the experts registry, which contains information about all available experts that can be referenced when creating agents through the AgentsCreateExpertReference schema.
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
await client.agents.getRegistryExperts({
    limit: 100,
    offset: 0
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

**request:** `Corti.AgentsGetRegistryExpertsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
