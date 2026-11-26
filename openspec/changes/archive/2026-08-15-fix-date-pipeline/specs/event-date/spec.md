# event-date Specification

## Purpose

Single source of truth for the party date, consumed by countdown, calendar links, search gate, and invitation copy — no hardcoded years.

## Requirements

### Requirement: 1. Event date module

One event-date module MUST be the only source of truth for the party date: birthday constants (month, day, start hour/minute) and `getNextBirthday(now)` returning the next occurrence strictly after `now` — this year's if not started, else next year's. No consumer MAY hardcode a date or year.

#### Scenario: Before this year's party

- GIVEN party Dec 16 20:00, now Dec 10; WHEN `getNextBirthday(now)`; THEN Dec 16 20:00 of now's year.

#### Scenario: Event passed

- GIVEN now Dec 17 or equals the party instant; WHEN `getNextBirthday(now)`; THEN next year's Dec 16 20:00.

#### Scenario: Leap year

- GIVEN now Feb 29 2028; WHEN called; THEN Dec 16 2028; month/day unshifted.

### Requirement: 2. Timezone handling

`getNextBirthday` MUST compute in device-local time from `now`'s local components; UTC MUST NOT be used.

#### Scenario: Local vs UTC date

- GIVEN UTC-3 device, now Dec 16 22:00 local (Dec 17 01:00 UTC); WHEN called; THEN next year's Dec 16 — local date governs.

### Requirement: 3. Google Calendar link

The Google Calendar link MUST use the upcoming event date as `YYYYMMDDTHHMMSS` (no slashes; year-month-day; zero-padded; local components); both `dates` = event start instant, never today.

#### Scenario: Format and order

- GIVEN upcoming party Dec 16 2026 20:00 local; WHEN link built; THEN `dates` contains `20261216T200000`.

### Requirement: 4. iOS calendario link

iOS MUST open `calendario://x-callback-url/add` with `date` = upcoming event date (ISO 8601); scheme/`alarm=30`/title unchanged. Non-iOS MUST use Google Calendar.

#### Scenario: iOS device

- GIVEN iPhone, upcoming party Dec 16 20:00; WHEN button tapped; THEN `calendario://` opens with `date` containing `-12-16T20:00:00`.

#### Scenario: Desktop

- GIVEN non-iOS device; WHEN tapped; THEN Google Calendar link opens.

### Requirement: 5. Countdown zero-crossing

The countdown MUST recompute every second, fire `onComplete` exactly once at the zero-crossing tick, then re-derive the next event date. Negative remaining time MUST render an event-over state, not clamped zeros. Initial value MUST be hydration-safe (server/client match).

#### Scenario: Zero crossing

- GIVEN 3 seconds remaining; WHEN tick reaches zero; THEN `onComplete` fires once; date re-derives.

#### Scenario: Rendered after the event

- GIVEN remaining time below zero; WHEN component renders; THEN event-over state shown, not "00 dias 00 horas".

#### Scenario: Hydration safety

- GIVEN server first paint; WHEN client hydrates; THEN value identical.

### Requirement: 6. Search gate proximity

The search form MUST show only when the upcoming event date is at most 30 days away (`eventDate - now <= 30 days`); otherwise hidden with message "Aun no estan disponibles las entradas de este año". The gate MUST use real remaining time, never clamped.

#### Scenario: Inside window

- GIVEN party in 20 days or today; WHEN home page renders; THEN form and prompt shown.

#### Scenario: Outside window

- GIVEN party in 40 days, or last week; WHEN home page renders; THEN form hidden; message shown.

#### Scenario: Exact boundary

- GIVEN party exactly 30 days away; WHEN home page renders; THEN form shown.

### Requirement: 7. Invitation copy dates

`__workInvitation.json`/`__familyInvitation.json` MUST use the current year's event dates (family Dec 16 13:00; work Dec 21 18:00) instead of 2023; other copy unchanged.

#### Scenario: Both invitations

- GIVEN current year Y; WHEN JSONs read; THEN family "16/12/Y" 13:00; work "21/12/Y" 18:00.

### Requirement: 8. Consumers derive from the module

Store init and countdown re-derive MUST come from `getNextBirthday`; `setFullYear` hack and `targetWorkDate`/`targetFamilyDate` MUST be removed. Pipeline code MUST NOT contain literal 2023.

#### Scenario: No hardcoded years

- GIVEN change applied; WHEN pipeline files searched for "2023"; THEN no match.

## Non-Goals

- Confirm/RSVP flow; security/Firebase/guest data; performance; cleanup beyond store fields + hack; copy rewrite beyond date strings; non-date JSON usage.
