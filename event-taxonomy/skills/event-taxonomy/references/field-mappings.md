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
