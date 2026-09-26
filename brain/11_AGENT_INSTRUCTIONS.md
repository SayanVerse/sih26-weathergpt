# WeatherGPT Agent Instructions

## BEFORE EVERY EXECUTION

1. Read `brain/00_PROJECT_MASTER.md`.
2. Read `brain/04_CURRENT_STATUS.md`.
3. Read `brain/03_PHASE_ROADMAP.md`.
4. Read the relevant phase information.
5. Read `brain/09_DECISIONS.md`.
6. Read `brain/10_KNOWN_ISSUES.md`.
7. Inspect the actual repository before modifying code.

## DEVELOPMENT RULES

- Never assume a feature exists.
- Never claim implementation without verification.
- Never skip testing.
- Never modify unrelated phases.
- Never silently change architecture.
- Never expose secrets.
- Never invent APIs or data.
- Never fabricate test results.
- Do not automatically proceed to the next phase.
- Work only on the requested phase.
- Preserve existing working functionality.
- Prefer small incremental changes.
- Test after implementation.

## PHASE RULE

For every requested phase:

1. Read brain.
2. Inspect repository.
3. Understand current status.
4. Identify existing implementation.
5. Identify missing requirements.
6. Propose changes.
7. Implement ONLY requested scope.
8. Test.
9. Report.
10. Update brain.
11. STOP.

## AFTER EVERY EXECUTION

MANDATORY:

Update:

- `04_CURRENT_STATUS.md`
- `05_IMPLEMENTATION_LOG.md`
- `06_TESTING_STATUS.md`
- `10_KNOWN_ISSUES.md` if applicable

Update other brain files only if architecture, requirements, roadmap, or decisions actually changed.

Never erase historical information.
