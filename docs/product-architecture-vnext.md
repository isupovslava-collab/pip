# PIP Product Architecture vNext

## Production path

The single-slide wizard produces one exact `contentTypeId`. Production results are assembled by `selectCuratedCore`: an explicit quality gate, an exact primary-content gate, internal deterministic scoring, composition-family diversity, and a maximum of three cards. No legacy compatible/fallback result is inserted into this surface. Internal scores remain diagnostic and are not displayed.

Fresh Discovery v3 is the breadth and freshness layer. It is a handoff, not a verified PIP result source: PIP copies the context-rich prompt first, then exposes provider buttons. External results never enter ranking or the local library automatically.

## Preserved systems

The physical 100-reference dataset, legacy ranking, Inspiration Board, feedback history, Test Mode, dashboard, JSON/CSV export, verified-source layer, Product Approval, Reference Intelligence, and missing-reference feedback remain available. Legacy results are collapsed in Test Mode under “Показать прежние варианты”.

## Future mode

“Подобрать структуру всей презентации” remains roadmap-only. It must not reuse single-slide ranking without a separate product model and user evidence.
