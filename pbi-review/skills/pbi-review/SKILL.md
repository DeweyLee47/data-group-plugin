---
name: pbi-review
description: Review PBI documents for logical soundness using content-level critique patterns. Use when asked to "review PBI", "check hypothesis", "그루밍 도와줘", or given a Notion PBI page URL.
argument-hint: [notion-pbi-url]
user-invocable: true
allowed-tools: [Read, Grep, Glob, AskUserQuestion, Task, ToolSearch]
---

Review PBI (Product Backlog Item) documents using content-level critique patterns derived from actual team grooming feedback.

## Definition

```
FETCH_PBI → EXTRACT_HYPOTHESIS → APPLY_PATTERNS → IDENTIFY_GAPS → GENERATE_FEEDBACK → REPORT
```

## Phase Transitions

1. **FETCH_PBI**: Retrieve PBI content from Notion page
2. **EXTRACT_HYPOTHESIS**: Identify hypothesis, goals, metrics, and key assumptions
3. **APPLY_PATTERNS**: Apply 10 critique patterns systematically
4. **IDENTIFY_GAPS**: Find areas needing clarification or improvement
5. **GENERATE_FEEDBACK**: Create specific, actionable feedback items
6. **REPORT**: Output structured review with prioritized recommendations

## Input

$ARGUMENTS should be a Notion PBI page URL.
Example: https://www.notion.so/droomws/iOS-1933c341ddd780f3b5d9ed196f329b45

## Critique Patterns (10 Categories)

### 1. 가설-목표 정합성 (Hypothesis-Goal Alignment)
Check if hypothesis actually addresses the core goal.
- "이게 핵심 지표에 영향을 주는가?"
- "가설이 ~에 집중되어있는 느낌. 진짜 목표가 뭔지?"

### 2. 수치 기준 도전 (Threshold Challenges)
Question specific numbers and thresholds.
- "+N이 되었을 때 괜찮을까?"
- "왜 N번/N일인가? 근거는?"

### 3. 리스크 지적 (Risk Identification)
Identify unintended negative consequences.
- "오히려 역효과가 날 수 있음"
- "** 이탈하는 risk"

### 4. 부정지표 누락 (Missing Guardrail Metrics)
Check for guardrail/failure metrics.
- "부정지표를 고려해야 함"
- "실패 기준은 뭔지?"

### 5. 구현/UX 우려 (Implementation Concerns)
Flag practical UX or technical concerns.
- "Concern) ~"
- "실제로 유저가 ~할 수 있음"

### 6. 대안 제시 요청 (Alternative Approaches)
Ask about other considered approaches.
- "다른 방법은 고려 안 했는지?"
- "A 대신 B는 어떤지?"

### 7. 가정 검증 (Assumption Validation)
Question underlying assumptions.
- "전제가 맞는지?"
- "~라는 가정이 사실인지?"

### 8. 인과관계 질문 (Cause-Effect Chain)
Examine "→" logical connections.
- "A → B → C 경로가 맞는지?"
- "상관관계 vs 인과관계 구분"

### 9. 범위 명확화 (Scope Clarification)
Clarify feature/experiment boundaries.
- "어디까지가 범위인지?"
- "iOS만인지 Android도인지?"

### 10. 데이터/근거 요청 (Evidence Request)
Request data backing claims.
- "어디서 나온 수치인지?"
- "통계적으로 유의미한지?"

## Process

### Step 1: Fetch PBI Content

Use `mcp__notion__notion-fetch` to retrieve the PBI page.

Extract key sections:
- Background/Problem
- Hypothesis (가설)
- Solution
- Impact/Expected Results
- Metrics (주요 지표, 가드레일)
- Discussion notes

### Step 2: Extract Core Elements

Identify:
1. **Goal**: What is the PBI trying to achieve?
2. **Hypothesis**: What is the cause-effect assumption?
3. **Solution**: What is proposed?
4. **Metrics**: Primary and guardrail metrics
5. **Numbers**: Any specific thresholds or estimates
6. **Assumptions**: Implicit premises

### Step 3: Apply Critique Patterns

For each pattern, generate a question if applicable:

```
Pattern: 가설-목표 정합성
Question: Does the hypothesis align with the stated goal?
Finding: [Assessment]

Pattern: 수치 기준 도전
Question: Are thresholds justified?
Finding: [Assessment]
...
```

### Step 4: Prioritize Findings

Categorize findings by severity:
- **Critical**: Blocks understanding or has major logical flaw
- **High**: Missing important consideration
- **Medium**: Could be clarified
- **Low**: Nice to have

### Step 5: Generate Report

Output format:

```markdown
## PBI Review: [Title]

### Summary
[1-2 sentence overview of the PBI and review conclusion]

### Critical Issues (Must Address)
1. [Issue with pattern tag]

### High Priority (Should Address)
1. [Issue with pattern tag]

### Medium Priority (Consider)
1. [Issue with pattern tag]

### Strengths
- [What's well done]

### Recommended Questions for Grooming
1. [Specific question to ask]
```

## Clarification Guidelines

**Ask user when:**
- PBI has no clear hypothesis section
- Multiple goals are stated and priority is unclear
- Technical constraints are unknown
- Domain-specific terms need context

## Output Example

```markdown
## PBI Review: [iOS] 온보딩에서 만든 알람 미리 체험시키기

### Summary
D1 리텐션 향상을 위한 미리 체험 기능. 가설은 명확하나 일부 수치 기준과 리스크 고려가 필요합니다.

### Critical Issues (Must Address)
None

### High Priority (Should Address)
1. [수치 기준] 50% 참여율 가정의 근거가 명확하지 않음
2. [리스크] 미리 체험 후 알람이 마음에 안 들면 오히려 이탈할 리스크 언급되었으나 대응 방안 불명확

### Medium Priority (Consider)
1. [가정 검증] "30분 안에 울려본 유저의 높은 리텐션"이 인과관계인지 확인 필요
2. [범위] 미리 체험 스킵 유저 대응 범위 명확화 필요

### Strengths
- 문제 정의와 데이터 분석이 상세함
- 예상 임팩트 시뮬레이션이 구체적

### Recommended Questions for Grooming
1. "50% 참여율 가정은 어떤 이전 실험 데이터인지?"
2. "미리 체험 후 마음에 안 들었을 때의 대응 플로우는?"
3. "30분 기준 데이터가 인과관계로 검증된 건지?"
```

## Additional Resources

### Reference Files

- **`references/critique-patterns.md`** - Detailed critique pattern examples with Korean phrasing
