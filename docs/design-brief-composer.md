# Design Brief Composer

## Contract

The deterministic composer combines:

```text
wizard context
+ selected reference intelligence
+ selected content type
= adaptation brief
```

If wizard context is unavailable, the reference and its Intelligence record are sufficient. Direct links, restored sessions, and incomplete history must never crash the detail page.

## Inputs

- production reference metadata;
- one matching `ReferenceIntelligenceV1` record;
- optional wizard query: scenario, audience/persona, goal, tone/style, and selected content type.

The composer performs no ranking, inference request, network call, or data mutation.

## Output order

1. task and selected slide type;
2. available presentation context or an explicit neutral fallback;
3. visual principle;
4. ordered structural anatomy;
5. preserve rules;
6. content to replace with the user’s own data;
7. failure modes to avoid;
8. visual settings such as hierarchy, density, alignment, palette, and emphasis;
9. adaptation and copyright boundary.

## Adaptation and rights rule

The brief transfers a compositional principle, not a finished slide. It explicitly tells the user to supply their own text, facts, branding, imagery, and conclusions. Literal values, claims, logos, source images, and pixel-perfect layout must not be copied.

## Reliability

Output is deterministic for the same inputs, remains plain text for clipboard portability, and works without browser history or saved wizard context. Copy success is announced in the interface and recorded by the existing analytics channel.

