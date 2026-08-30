# Non-League Betting Edge — Requirements

## Overview

A mobile-first web application providing advanced betting insights, statistical analysis, and tactical data for English Non-League Football (National League, National League North, National League South). The goal is to surface value bets by comparing algorithmically-derived true probabilities against live bookmaker odds, and to give users a genuine analytical and tactical edge.

---

## User Stories & Acceptance Criteria

---

### Epic 1: Data Integration & Aggregation

---

#### US-1.1 — Match Data Ingestion

**As a** system,  
**I want to** ingest historical and live match data from an external football data API,  
**so that** all statistical models and UI views are powered by accurate, up-to-date information.

**Acceptance Criteria (EARS):**

- **WHEN** the system initialises, **THEN** the system shall fetch historical match results, xG, possession, shot locations, corners, and cards for all fixtures in the National League, National League North, and National League South for the current and previous two seasons.
- **WHILE** a matchday is live, **THE SYSTEM SHALL** poll the data provider API at a maximum interval of 60 seconds to refresh in-progress match statistics.
- **WHERE** an API response contains incomplete or missing data fields, **THE SYSTEM SHALL** log the gap, populate the field with a null value, and exclude that fixture from any model calculations that require the missing field.
- **WHEN** a new fixture is published by the data provider, **THE SYSTEM SHALL** add it to the local data store within 5 minutes of publication.

---

#### US-1.2 — Player Availability Data

**As a** user,  
**I want to** see up-to-date player availability (injuries, suspensions) for each fixture,  
**so that** I can factor squad depth and key absences into my betting decisions.

**Acceptance Criteria (EARS):**

- **WHEN** a player's availability status changes in the data source, **THE SYSTEM SHALL** reflect the update in the Match Hub within 10 minutes.
- **WHEN** a player is suspended or injured, **THE SYSTEM SHALL** display their name, status, and expected return date (if available) on the relevant fixture's Match Hub page.
- **IF** no availability data is available for a team, **THEN** the system shall display a "Squad data unavailable" notice rather than an empty section.

---

#### US-1.3 — Weather Condition Integration

**As a** user,  
**I want to** see forecast weather conditions for each upcoming fixture's venue,  
**so that** I can assess how conditions may affect match outcomes (e.g., heavy rain favouring low-scoring games).

**Acceptance Criteria (EARS):**

- **WHEN** a fixture is within 72 hours of kick-off, **THE SYSTEM SHALL** fetch and display forecast weather data (temperature, precipitation probability, wind speed) for the stadium's location.
- **WHEN** weather data cannot be retrieved, **THE SYSTEM SHALL** display a "Weather data unavailable" notice.
- **THE SYSTEM SHALL** surface a contextual note when forecast wind speed exceeds 30 mph or precipitation probability exceeds 70%, flagging potential impact on playing style and goal markets.

---

#### US-1.4 — Live Bookmaker Odds Ingestion

**As a** system,  
**I want to** ingest live bookmaker odds for 1X2, Over/Under goals, Asian Handicap, BTTS, and Corners markets,  
**so that** the value bet engine has current market data to compare against model probabilities.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** ingest odds from at least three bookmakers per fixture for each supported market.
- **WHEN** a fixture is more than 7 days away, **THE SYSTEM SHALL** refresh odds every 6 hours.
- **WHEN** a fixture is within 24 hours of kick-off, **THE SYSTEM SHALL** refresh odds every 5 minutes.
- **WHEN** odds are unavailable for a market from any bookmaker, **THE SYSTEM SHALL** mark that market as "Odds unavailable" and exclude it from value bet calculations.

---

### Epic 2: Predictive Modelling & Insights Engine

---

#### US-2.1 — True Probability Calculation

**As a** user,  
**I want** the system to calculate statistically-derived true probabilities for match outcomes,  
**so that** I have a model-based alternative to bookmaker implied probabilities.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** calculate home win, draw, and away win probabilities for every upcoming fixture using a model trained on at minimum xG, historical results, and home/away form over the last 20 fixtures per team.
- **THE SYSTEM SHALL** calculate Over/Under 2.5 goals and BTTS probabilities for every upcoming fixture.
- **WHEN** a team has fewer than 5 historical fixtures in the current data set, **THE SYSTEM SHALL** flag the prediction as "Low confidence" and display it with a visual indicator.
- **THE SYSTEM SHALL** update calculated probabilities whenever underlying data (team form, player availability) changes.

---

#### US-2.2 — Value Bet Identification

**As a** user,  
**I want** the system to compare model probabilities against bookmaker implied probabilities and surface value bets,  
**so that** I can quickly identify markets where the bookmaker odds are more generous than my model suggests.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** calculate a Value Bet score for each market as: `(model probability − implied bookmaker probability) × 100`, expressed in percentage points.
- **WHEN** the Value Bet score for any market exceeds 5 percentage points, **THE SYSTEM SHALL** flag that market as a Value Bet.
- **THE SYSTEM SHALL** rank all Value Bets in descending order of score on the Dashboard.
- **WHEN** no value bets are identified for the current day, **THE SYSTEM SHALL** display a "No value bets identified for today" message on the Dashboard.
- **THE SYSTEM SHALL** use the best available bookmaker odds (highest price) when calculating the implied probability for a given market.

---

#### US-2.3 — Tactical Edge Score

**As a** user,  
**I want** the system to generate a Tactical Edge score for each fixture,  
**so that** I can understand how stylistic mismatches may create exploitable betting angles.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** derive a Tactical Edge score (0–10) for each fixture based on playing style metrics including average possession share, progressive passes per game, defensive line height (proxy: opposition xG conceded in transition), and pressing intensity (proxy: high turnovers per game).
- **WHEN** the Tactical Edge score exceeds 6.5, **THE SYSTEM SHALL** display a highlighted tactical narrative (e.g., "High-possession team vs. low-block counter-attack — value may exist in Over 10.5 corners").
- **THE SYSTEM SHALL** display the individual style metric contributions to the Tactical Edge score in a breakdown view on the Match Hub.
- **WHERE** insufficient data exists to calculate the Tactical Edge score, **THE SYSTEM SHALL** display "Tactical data insufficient" rather than a numeric score.

---

### Epic 3: Dashboard

---

#### US-3.1 — Daily Value Bet Overview

**As a** user,  
**I want** a dashboard that surfaces the top value bets for today's fixtures at a glance,  
**so that** I can make quick, informed decisions without navigating through every fixture individually.

**Acceptance Criteria (EARS):**

- **WHEN** the user opens the application, **THE SYSTEM SHALL** display the Dashboard as the default view.
- **THE SYSTEM SHALL** display the top 5 value bets for today's fixtures ranked by Value Bet score, showing: fixture name, league, market, model probability, best bookmaker odds, and Value Bet score.
- **WHEN** fewer than 5 value bets are identified for the day, **THE SYSTEM SHALL** display all available value bets and fill remaining slots with "No further value bets identified".
- **THE SYSTEM SHALL** refresh the Dashboard value bet list whenever odds or model data is updated.
- **THE SYSTEM SHALL** display the time of last data refresh on the Dashboard.

---

#### US-3.2 — Fixture Schedule

**As a** user,  
**I want** to see all of today's fixtures across the three leagues on the Dashboard,  
**so that** I have a complete picture of the day's action.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** list all fixtures for the current day grouped by league, showing kick-off time, home team, away team, and current match status (upcoming / live / completed).
- **WHEN** a fixture kicks off, **THE SYSTEM SHALL** update its status to "Live" within 2 minutes.
- **WHEN** a fixture is completed, **THE SYSTEM SHALL** display the final score and update its status to "FT".

---

### Epic 4: Match Hub

---

#### US-4.1 — Pre-Match Analysis

**As a** user,  
**I want** a detailed pre-match analysis page for each fixture,  
**so that** I can perform deep-dive research before placing a bet.

**Acceptance Criteria (EARS):**

- **WHEN** the user selects a fixture, **THE SYSTEM SHALL** navigate to a Match Hub displaying: head-to-head record (last 10 meetings), home team last 5 results, away team last 5 results, model probabilities, Value Bet scores by market, Tactical Edge score and breakdown, and player availability.
- **THE SYSTEM SHALL** display xG, shots on target, possession, corners, and cards for each of the last 5 fixtures per team.
- **WHEN** a head-to-head record contains fewer than 3 meetings in the data set, **THE SYSTEM SHALL** display a "Limited H2H data" notice.

---

#### US-4.2 — Market-Level Predictions

**As a** user,  
**I want** to see predictions and value assessments broken down by market type,  
**so that** I can evaluate specific bet types (e.g., BTTS, Corners) rather than only match result.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** display predictions and Value Bet scores for: 1X2, Over/Under 1.5, Over/Under 2.5, Over/Under 3.5 goals, BTTS Yes/No, Asian Handicap (−0.5, −1, −1.5 where odds available), and Over/Under 9.5 corners.
- **WHEN** a bookmaker does not offer a specific market for a fixture, **THE SYSTEM SHALL** omit that market from the Match Hub rather than showing a zero value.

---

### Epic 5: League Hub

---

#### US-5.1 — League Table & Form Guide

**As a** user,  
**I want** to view the current league table and recent form for each of the three leagues,  
**so that** I can contextualise team performance when evaluating fixtures.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** display the current standings for the National League, National League North, and National League South, including: position, team name, played, won, drawn, lost, goals for, goals against, goal difference, and points.
- **THE SYSTEM SHALL** display a form guide showing the result (W/D/L) of each team's last 5 and last 10 games, colour-coded (green/grey/red).
- **WHEN** the user selects a team, **THE SYSTEM SHALL** navigate to that team's profile, showing their metric rankings within their league (xG per game, xGA per game, possession, press intensity).

---

#### US-5.2 — Team Metric Rankings

**As a** user,  
**I want** to see teams ranked by key analytical metrics within each league,  
**so that** I can identify analytically strong or weak sides beyond simple points totals.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** provide a sortable metric ranking table per league including: xG per game, xG Against per game, Shot conversion rate, Corners per game, and Cards per game.
- **WHEN** the user taps a column header, **THE SYSTEM SHALL** sort the table by that metric in descending order; a second tap shall sort in ascending order.

---

### Epic 6: Filter & Search

---

#### US-6.1 — Data Filtering

**As a** user,  
**I want** to filter fixtures, value bets, and form data by league, bet type, and date range,  
**so that** I can focus on the specific data most relevant to my betting strategy.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** provide filter controls allowing the user to select one or more of: National League, National League North, National League South.
- **THE SYSTEM SHALL** provide a bet-type filter allowing the user to select one or more of: 1X2, Over/Under goals, BTTS, Asian Handicap, Corners.
- **THE SYSTEM SHALL** provide a date-range picker allowing the user to view fixtures and value bets for any range up to 14 days in the future or 90 days in the past.
- **WHEN** a filter is applied, **THE SYSTEM SHALL** update all visible data lists within 500ms without a full page reload.
- **WHEN** no fixtures match the applied filters, **THE SYSTEM SHALL** display a "No fixtures match your filters" message.

---

#### US-6.2 — Team & Fixture Search

**As a** user,  
**I want** to search for a specific team or fixture by name,  
**so that** I can quickly navigate to the data I need.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** provide a search input that returns matching teams and upcoming fixtures as the user types, with results appearing after a minimum of 2 characters.
- **WHEN** the user selects a team from search results, **THE SYSTEM SHALL** navigate to that team's profile page.
- **WHEN** the user selects a fixture from search results, **THE SYSTEM SHALL** navigate to that fixture's Match Hub.

---

### Epic 7: Non-Functional Requirements

---

#### US-7.1 — Mobile-First Responsive UI

**As a** user,  
**I want** the application to be fully usable on a mobile device,  
**so that** I can check value bets and analysis on the go, including from a stadium.

**Acceptance Criteria (EARS):**

- **THE SYSTEM SHALL** render all views correctly on screens from 320px to 1440px wide without horizontal scrolling.
- **THE SYSTEM SHALL** use touch-friendly tap targets with a minimum size of 44×44px on all interactive elements.
- **THE SYSTEM SHALL** achieve a Lighthouse mobile performance score of 80 or above.
- **THE SYSTEM SHALL** function as a Progressive Web App (PWA), supporting installation on iOS and Android home screens.

---

#### US-7.2 — Data Refresh Performance

**As a** user,  
**I want** data to refresh quickly and reliably around kick-off times,  
**so that** the value bets and odds I see are not stale when I need to act.

**Acceptance Criteria (EARS):**

- **WHEN** it is within 1 hour of any scheduled kick-off, **THE SYSTEM SHALL** increase the odds refresh cadence to every 2 minutes.
- **THE SYSTEM SHALL** display a visible "last updated" timestamp on all data panels.
- **WHEN** a data refresh fails, **THE SYSTEM SHALL** display a non-blocking warning banner indicating stale data, and retry automatically within 30 seconds.
- **THE SYSTEM SHALL** load the Dashboard initial view (above the fold) within 3 seconds on a 4G mobile connection.

---

#### US-7.3 — Offline Capability

**As a** user,  
**I want** the app to be usable with limited or no connectivity,  
**so that** I can still view recently cached data when in areas with poor signal (e.g., inside a stadium).

**Acceptance Criteria (EARS):**

- **WHEN** the device loses internet connectivity, **THE SYSTEM SHALL** continue to display the most recently cached Dashboard, Match Hub, and League Hub data with a "You are offline — data may be out of date" banner.
- **THE SYSTEM SHALL** cache the last successful data fetch using a service worker with a maximum cache age of 2 hours.

---

## Out of Scope (v1)

- In-play (live) betting recommendations
- User accounts, authentication, and bet history tracking
- Direct bookmaker integration or bet placement
- Leagues outside National League, National League North, and National League South
- Native iOS / Android applications (PWA only for v1)

---

## Glossary

| Term | Definition |
|------|------------|
| xG | Expected Goals — a statistical measure of the quality of a goal-scoring chance |
| Value Bet | A bet where the model's true probability exceeds the implied probability of the bookmaker's odds |
| Implied Probability | The probability implied by bookmaker odds, calculated as `1 / decimal odds` |
| BTTS | Both Teams To Score |
| Asian Handicap | A bet type that eliminates the draw by giving a goal advantage/disadvantage to one team |
| Tactical Edge Score | A composite score (0–10) representing the degree of stylistic mismatch between two teams |
| EARS | Easy Approach to Requirements Syntax — a structured format for writing testable requirements |
