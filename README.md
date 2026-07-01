# Madad (مدد) - Saudi Smart Rescue Platform

Madad (مدد) is a high-fidelity Saudi Smart Rescue Platform MVP designed for remote, desert, flood, mountain, and vehicle breakdown emergency operations. Built as an interactive single-page application with a dual-dashboard interface.

## Core Features
1. **Saudi National Portal Identity:** Inspired by official Saudi digital services, featuring official colors, Arabic/English bilingual support (RTL/LTR dynamic switching), and secure Single Sign-On (Nafath) login flows.
2. **User Dashboard (Light Emerald Theme):**
   - **Start Safe Trip:** Registers desert, mountain, or flood wadi trips, generating local simulated GPS logs (Time, Coordinates, Speed, Heading, Battery).
   - **Signal Loss Simulation:** Toggle internet disconnection to simulate entry into remote cellular dead zones, demonstrating how the app caches telemetry and pauses live uploads.
   - **SOS Emergency Alert:** Pulse SOS buttons, emergency categorization, and real-time step status tracking.
   - **Missing Person Registry:** Search registered citizens by National ID to fetch their last synced coordinates and telemetry.
   - **Bilingual Survival Guide:** Offline-friendly, wadi safety, heat conservation, sand vehicle recovery, and mountain trauma guides.
3. **Rescue Operations Dashboard (Dark Command Center Theme):**
   - **Interactive Leaflet Command Map:** CartoDB dark matter mapping displaying incident coordinate pins.
   - **AI Priority Scorecard:** Real-time priority calculations based on battery decay, time passed since signal loss, chronic illnesses, terrain multipliers, and demographic age indicators.
   - **Predictive Search Geometry:** Plots a vector from the last coordinate based on speed and heading, then draws growing confidence search zones (50%, 75%, 92% confidence rings) expanding over time elapsed since last contact.
   - **Incident Dispatch Controller:** Fields to assign nearest regional rescue hubs, assign officers, and update timeline logs.

## Project Structure
- `index.html`: Contains structures, layout containers, Leaflet mapping assets, SVGs, and translation tags.
- `styles.css`: CSS styles, layout custom properties, typography rules, Command Center dark configurations, and animations.
- `app.js`: Script containing application routing states, coordinate trigonometry, AI priority weighting, translation lookups, and Leaflet drawing.

## How to Run & Preview
You can preview and run the application by simply opening the `index.html` file in any modern web browser.

No installation, build scripts, or databases are required. All features (simulators, map renderings, registrations) run client-side.
