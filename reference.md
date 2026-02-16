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

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">get</a>(id, { ...params }) -> Corti.InteractionsGetResponse</code></summary>
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

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">delete</a>(id, { ...params }) -> void</code></summary>
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

**requestOptions:** `InteractionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Recordings
<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">list</a>(id, { ...params }) -> Corti.RecordingsListResponse</code></summary>
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

<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">get</a>(id, recordingId, { ...params }) -> core.BinaryResponse</code></summary>
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
await client.recordings.get("id", "recordingId");

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

<details><summary><code>client.recordings.<a href="/src/api/resources/recordings/client/Client.ts">delete</a>(id, recordingId, { ...params }) -> void</code></summary>
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
