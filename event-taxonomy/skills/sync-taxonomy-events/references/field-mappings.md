# Field Mappings Reference

Detailed field mappings from Event Change History source to Aqueduct Taxonomy targets.

## Event: Change History → Taxonomy

| Source (이벤트) | Target (Event New) | Notes |
|-----------------|-------------------|-------|
| 이벤트 이름 | event_name | Title field |
| 플랫폼 | platform | Multi-select |
| 설명 | description | Text |
| 백엔드 contains "Snowplow" | Snowplow | Checkbox |
| - | event_type | Auto-detect from name |
| - | source | Default "Client" |
| - | type | Always ["Event"] |
| 스크린 이름 | screen_name | Relation (lookup/create) |
| 이벤트 프로퍼티 | Event Property New | Relation (lookup/create) |

### Event Type Detection Rules

| Name Pattern | event_type |
|--------------|------------|
| `page_view_*` | "Page View" |
| `tap_*` or `click_*` | "Tap/Click" |
| Other | "Server/System" |

## Screen: Change History → Taxonomy

| Source (스크린) | Target (Screen New) | Notes |
|-----------------|-------------------|-------|
| 스크린 이름 | Screen Name | Title field |
| 설명 | Description | Text |
| - | Category | Default "K.퀘스트" or infer |
| - | Type | Always "Screen" |
| - | Status | Always "Live" |

## Event Property: Change History → Taxonomy

| Source (이벤트 프로퍼티) | Target (Event Property New) | Notes |
|-------------------------|---------------------------|-------|
| 프로퍼티 이름 | Event Property Name | Title field |
| 타입 | Data_Type | See type mapping below |
| 설명 or 예시 혹은 가능한 값 목록 | Description | Text |
| - | Type | Always ["Event Property"] |
| - | Status | Always "Live" |

### Data Type Mapping

| Source Type | Target Data_Type |
|-------------|------------------|
| int | number |
| float | number |
| string | string |
| bool | boolean |
| enum | string (ask user if ambiguous) |

## Add Value Changes

When change type is "Add Value", update existing property pages instead of creating new ones.

### Detection

- Property already exists in Aqueduct Taxonomy (found during Step 4 query)
- Source has new values in "예시 혹은 가능한 값 목록" field

### Update Strategy

| Body Pattern | Update Method |
|--------------|---------------|
| Screen-based sections (`### 각 Screen별...`) | `insert_content_after` relevant section |
| Flat value list (`▶ value1\n▶ value2`) | Append to end of list |
| Empty body | Add new values section |

### Body Update Format

- Follow existing format in page (typically `▶ value_name`)
- Include event context if values vary by event/screen
- Use unique selection patterns to avoid multiple matches with `insert_content_after`

### Example Body Patterns

**Screen-based sections:**
```markdown
### 각 Screen별 step_id 정의

#### quest_main
▶ value1
▶ value2

#### quest_detail
▶ value3
```

**Flat value list:**
```markdown
▶ value1
▶ value2
▶ value3
```

### Property Field Update

Use `mcp__notion__notion-update-page` with `update_properties` to append new values to the "value 예시" property field.

### Fallback for Complex Pages

When body content update fails (API 500 errors due to embedded images or large pages):

1. **Property field update succeeds** - The "value 예시" field is updated (essential)
2. **Body update fails** - Report to user for manual follow-up

**Report format for failed body updates:**

| Field | Description |
|-------|-------------|
| Page URL | Clickable link to the property page |
| Property Name | Name of the property (e.g., `step_id`) |
| Event Context | Which event the values belong to |
| Values to Add | List of values that couldn't be added |
| Format | Expected format (e.g., `▶ value_name`) |

**Example failure report:**
> **Manual Follow-up Required:**
> - Page: [step_id](https://www.notion.so/ba36d085...)
> - Add section for `page_view_quest_onboarding_step`:
>   - `▶ intro`
>   - `▶ first_claim`
>   - `▶ outro`
