# PIP Curated Core Strategy

## Purpose

Curated Core is the small set of finished-slide patterns for which PIP is prepared to take product responsibility. It is a Product Owner-approved whitelist, not a catalogue of everything the system can draw. Fresh Discovery remains the breadth and freshness layer.

## Production gate

Visual quality, content-type verification, and Product Owner disposition are separate, explicit gates. A production reference must satisfy every condition:

1. `curatedCoreStatus === eligible`;
2. `visualReferenceQuality === premium`;
3. `contentTypePoVerificationStatus === verified`;
4. `poReviewDisposition === approved`;
5. `screenSuitable === true` and `productionApproved === true`;
6. the existing rights/source gate or an approved PIP-original Hero/Gold interpretation;
7. `primaryContentTypeId` exactly matches the selected content type.

Missing metadata normalizes to `pending`. Proposed reclassification never affects production. Synthetic schematics, wireframes, generic chart templates, and prototype placeholders are excluded.

The authoritative Sprint 9.2 decision source is `src/data/curatedCore/po-review-round-1.json`. Applying a decision requires changing that map, regenerating metadata, validating it, and committing the result. Review-page local state never changes production.

## Coverage policy

The default desired target is 2–3 approved references per content type with useful composition diversity. Cover prefers three strong references because visual diversity matters more for opening slides. These targets are explicitly non-binding: never fill a quota with a schematic, weak filler, or wrong type.

The post-round production baseline is 17 references: KPI 3, Comparison 2, Timeline 2, Process 3, Dashboard 2, Cover 0, Story 2, Table 3. Cover therefore remains an honest production gap until a future explicit PO approval.

For Cover, the desired future production mix is image-led/editorial, typography-led, and atmospheric/abstract or large-year. Decorative geometry must earn its place. A Cover candidate cannot be approved if the dominant visual behaves like arbitrary filler rather than a meaningful visual or strong atmospheric treatment.

## Future candidate intake

A candidate enters PO review only when it looks like a finished slide, is screen suitable, has a plausible exact content type, is not an obvious wireframe, and offers a new composition or a material quality improvement. The intent is to avoid flooding review with low-value synthetic schemes.

## Review and measurement

`#/test-curated-core-review` defaults to Needs PO Attention and separates Production, Reclassification, Revise, Pending, Archive, and All. Decisions and notes are local and exportable. Compare mode supports up to three same-type references and explains the limit.

Reports distinguish production-approved references, composition and direction coverage, reclassification/revise queues, archive dispositions, wrong-type exposure, and PO review workload. Review-efficiency counts are diagnostic only and are not a market KPI.
