# PIP Content Type Rubric

## Human-first rule

A content type is exact only when a reviewer can identify it from the preview in 3–5 seconds without reading metadata. Metadata never overrules the visible communication device. Visual approval and content-type approval are separate decisions.

## KPI (`kpi`)

- Definition: an executive view where a small set of major numbers is the primary message.
- Must-have signals: 3–6 major metrics or an equivalent executive metric structure, clear hierarchy, numbers visually dominant.
- Acceptable variants: plan/fact, metric cards with small trends, focused KPI set with concise commentary.
- Not this: multi-section operational dashboard, long table, roadmap.
- Common confusion: Dashboard. KPI focuses attention on a few numbers; Dashboard monitors a system through multiple views.

## Comparison (`comparison`)

- Definition: two or more alternatives evaluated through a shared decision logic.
- Must-have signals: 2+ visible alternatives, common criteria or differences, a recommendation or decision implication.
- Acceptable variants: pricing packages, comparison matrix, side-by-side option cards, before/after explicitly framed as alternatives.
- Not this: project phases, a single business case, generic story.
- Common confusion: Table and Story. A table is Comparison only when alternatives and decision criteria are its message; an argument with stages remains Story.

## Timeline (`timeline`)

- Definition: a time-led sequence showing when phases, dates, periods, or milestones happen.
- Must-have signals: explicit temporal order plus dates, periods, phases, or milestones.
- Acceptable variants: horizontal milestone line, phased roadmap, milestone matrix, staged implementation.
- Not this: process without time, dashboard.
- Common confusion: Process. Timeline answers “when”; Process answers “what happens next and by what logic.”

## Process (`process`)

- Definition: a sequence of actions or decisions that explains operational flow.
- Must-have signals: ordered steps, action/decision logic, visible progression or hand-offs.
- Acceptable variants: workflow, operating model, learning journey, decision tree with a clear path.
- Not this: calendar roadmap where time is primary, dashboard.
- Common confusion: Timeline and Story. Supporting dates do not make a flow a Timeline; a narrative is Process only when actions and transitions are primary.

## Dashboard (`dashboard`)

- Definition: a summary monitoring view that combines multiple metrics, statuses, or trends for management.
- Must-have signals: several metrics/statuses/trends, summary logic, monitoring or management purpose.
- Acceptable variants: RAG status, plan/fact overview, multiple mini charts, status matrix, multi-panel operations summary.
- Not this: a single KPI set, roadmap, strategic map.
- Common confusion: KPI and Table. Dashboard combines signals to monitor a system; a table or KPI set may be one panel but cannot be the whole logic.

## Cover (`cover`)

- Definition: the opening/title slide that establishes topic, event, and visual identity.
- Must-have signals: presentation title or event/topic, opening function, clear identity or hero visual.
- Acceptable variants: typographic cover, image-led cover, restrained executive title, event opener.
- Not this: story slide, ordinary section divider unless it clearly functions as the presentation cover.
- Common confusion: Story. A Cover introduces; a Story makes an argument or advances a narrative.

## Story (`story`)

- Definition: a message-led slide built around a thesis, problem, argument, or narrative.
- Must-have signals: an explicit takeaway and visual evidence or progression that supports it.
- Acceptable variants: problem–insight–response, business case, keynote metaphor, transformation argument.
- Not this: pure cover, pure comparison matrix, pure KPI set.
- Common confusion: Comparison and Cover. Stages inside one argument are not alternatives; a strong headline does not make an argument slide a Cover.

## Table (`table`)

- Definition: a structured row/column matrix is the primary device for reading and deciding.
- Must-have signals: meaningful row/column headers, consistent cells, scan-friendly structure.
- Acceptable variants: status matrix, decision matrix, financial table, compact tabular comparison.
- Not this: dashboard where the table is secondary.
- Common confusion: Comparison and Dashboard. Table describes the primary structure; comparison or monitoring intent must be visibly dominant to use those types instead.

## Calibration decision

If a preview fails the must-have signals, use `reclassify` with `proposedPrimaryContentType`; do not change production behavior until Product Owner verification. If no exact type is defensible, use `rejected`. New or migrated records default to `pending`.
