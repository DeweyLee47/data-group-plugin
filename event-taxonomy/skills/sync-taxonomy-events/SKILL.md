---
name: sync-taxonomy-events
description: This skill should be used when the user asks to "sync events to taxonomy", "update Aqueduct taxonomy", "add events from Change History", "sync change history to Aqueduct", "create events from Notion", or provides a Notion Event Change History URL (e.g., notion.so/droomws/...). Syncs events, screens, and properties from Event Change History pages to Aqueduct Taxonomy databases.
version: 1.0.0
argument-hint: [notion-url]
user-invocable: true
allowed-tools: [Read, Grep, Glob, AskUserQuestion, Task, ToolSearch]
---

Sync events from Event Change History Notion page to Aqueduct Taxonomy.

## Definition

```
FETCH_SOURCE → CHECK_EXISTING → SYNC_SCREENS → SYNC_PROPERTIES → UPDATE_PROPERTY_VALUES → SYNC_EVENTS → ADD_FIGMA → REPORT
```

## Phase Transitions

1. **FETCH_SOURCE**: Retrieve data from Event Change History Notion page
2. **CHECK_EXISTING**: Query Aqueduct Taxonomy databases for existing entries
3. **SYNC_SCREENS**: Create missing screens in Screen New database
4. **SYNC_PROPERTIES**: Create missing event properties in Event Property New database
5. **UPDATE_PROPERTY_VALUES**: Update existing properties with new enum values (Add Value changes)
6. **SYNC_EVENTS**: Create/update events in Event New database with relations
7. **ADD_FIGMA**: Add Figma design links to event pages
8. **REPORT**: Output summary of changes made

## Input

$ARGUMENTS should be an Event Change History Notion page URL.
Example: https://www.notion.so/droomws/2cc3c341ddd780d2a87bdbbd3f3a3418

## Database IDs (Constants)

```
AQUEDUCT_TAXONOMY:
  Event New:          collection://db7f2569-5a68-4bfe-a162-bcd2ea8105df
  Screen New:         collection://5ba352a6-7361-4681-96a1-b9496583c210
  Event Property New: collection://600574e6-833d-43d9-ab03-9e39a8ec202c
```

## Process

### Step 1: Fetch Source Data

1. Use `mcp__notion__notion-fetch` to get the Event Change History page
2. Extract 디자인 링크 (Figma URL) from page content
3. Identify inline database URLs:
   - 이벤트 database (events)
   - 이벤트 프로퍼티 database (event properties)
   - 스크린 database (screens)
4. Use `mcp__notion__notion-query-data-sources` to get all entries from each

### Step 2: Check Existing in Aqueduct Taxonomy

Query these databases to find existing entries:
- Event New: `collection://db7f2569-5a68-4bfe-a162-bcd2ea8105df`
- Screen New: `collection://5ba352a6-7361-4681-96a1-b9496583c210`
- Event Property New: `collection://600574e6-833d-43d9-ab03-9e39a8ec202c`

### Step 3: Sync Screens

**Maintain a `screenUrlMap` (screen_name → page_url) for use in Step 5.**

For each screen from source:
- Query: `SELECT url, "Screen Name" FROM "Screen New" WHERE "Screen Name" = '<screen_name>'`
- If found → **Store mapping: `screenUrlMap[screen_name] = found_url`**
- If not found → Create with Screen Name, Category (default "K.퀘스트"), Description, Type="Screen", Status="Live" → **Store mapping: `screenUrlMap[screen_name] = new_page_url`**

### Step 4: Sync Event Properties

**Maintain a `propertyUrlMap` (property_name → page_url) for use in Step 5.**

For each event property from source:
- Query: `SELECT url FROM "Event Property New" WHERE "Event Property Name" = '<property_name>'`
- If found → **Store mapping: `propertyUrlMap[property_name] = found_url`**
- If not found → Create with Event Property Name, Data_Type (mapped), Description, Type=["Event Property"], Status="Live" → **Store mapping: `propertyUrlMap[property_name] = new_page_url`**

### Step 4.5: Update Property Values (Add Value Changes)

For existing properties with new enum values:

1. **Detect "Add Value" changes**
   - Property already exists in Aqueduct Taxonomy (found in Step 4 query)
   - Source contains new values in "예시 혹은 가능한 값 목록" field

2. **Fetch property page** using `mcp__notion__notion-fetch` to get current content

3. **Update "value 예시" property field**
   - Use `mcp__notion__notion-update-page` with `update_properties`
   - Append new values to existing "value 예시" field

4. **Update page body content**
   - If page has structured sections (e.g., `### 각 Screen별 step_id 정의`):
     - Use `insert_content_after` to add values under relevant event section
     - Match existing format: `▶ new_value_name`
   - If page body is empty or has flat value list:
     - Add new section with values or append to end of list
   - Include event context only if values vary by event/screen

5. **Handle body update failures**
   - If `insert_content_after` fails (e.g., API 500 error):
     - Continue with sync (don't block on body update failure)
     - Record the failure for the final report
   - The "value 예시" property field update is the essential part

See `references/field-mappings.md` for detailed body update patterns.

### Step 5: Sync Events

For each event from source:
- Auto-detect event_type from name prefix (`page_view_` → Page View, `tap_`/`click_` → Tap/Click, else → Server/System)
- Query: `SELECT url, "Event Property New" FROM "Event New" WHERE event_name = '<event_name>'`
- If not found → Create new event with all fields and relations
- If found → Check for new properties, update relations if needed

**Event fields:**
- event_name, platform (JSON array), type=["Event"], event_type, description
- source="Client", Snowplow (if 백엔드 contains "Snowplow")

**Relation fields (MUST use URLs from Steps 3-4, NOT names):**
- `screen_name`: Use `screenUrlMap[screen_name]` from Step 3
- `Event Property New`: Use `propertyUrlMap[property_name]` for each property from Step 4

> **CRITICAL**: Notion relation fields require page URLs/IDs to link to existing pages.
> Passing text names to relation fields causes Notion API to create NEW pages instead of linking to existing ones.
> Always look up the URL from the stored mappings before setting relation fields.

### Step 6: Add Figma Links

For each event page created/updated:
- Use `mcp__notion__notion-update-page` with replace_content
- Add content with Figma link from 디자인 링크

## Clarification Guidelines

**Clarify with user when:**
- Screen category is unclear (not obviously K.퀘스트)
- Event source is ambiguous (could be Client or Server)
- Event type cannot be determined from name prefix
- Multiple Figma links exist and it's unclear which to use
- Platform field is empty or unclear
- Property data type mapping is ambiguous (e.g., "enum" type)
- Property page has complex body structure and insertion point is unclear
- Multiple events use the same property with different values
- Existing body format doesn't match expected patterns (▶ value or section-based)

**Example clarification:**
"The event `reward_granted` doesn't start with `page_view_` or `tap_`. Should this be:
1. Server/System (backend triggered)
2. Tap/Click (user action)
3. Page View (screen display)"

## Output

Report summary:
- Screens: X created, Y skipped (existing)
- Event Properties: X created, Y skipped (existing)
- Property Values: X updated (Add Value changes)
- Events: X created, Y updated, Z skipped
- Figma links: X added

**Manual Follow-up Required** (if any body update failures):

| Page | Property | Failed Update | Values to Add |
|------|----------|---------------|---------------|
| [page_url] | property_name | Body content | value1, value2, ... |

Provide clickable Notion URLs so user can manually update failed body content.

## Additional Resources

### Reference Files

For detailed field mappings between source and target databases:
- **`references/field-mappings.md`** - Complete field mappings for Events, Screens, and Event Properties including data type conversions
