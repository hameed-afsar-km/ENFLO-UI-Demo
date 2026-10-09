# ⚡ ENFLO Energy Management System (EMS) & AI Simulator

ENFLO is a next-generation Energy Management System (EMS) demonstration interface built with **Next.js**, **React**, and **TypeScript**. It simulates the real-time monitoring, management, and predictive optimization of distributed energy assets (Solar PV arrays, Battery Energy Storage Systems, and Factory Loads) across multiple geographical sites. 

The crown jewel of this application is its **Context-Aware AI Assistant**, which uses live telemetry data to answer complex operational queries and generate dynamic scenario simulations (What-If Analysis).

---

## 🌟 Core Features

### 1. Live Telemetry & Simulation Engine (`SimulationContext`)
- **Real-Time Data Jittering:** The application simulates a live operating environment by running a 3-second `useEffect` loop that injects micro-fluctuations into solar generation and factory loads.
- **Power Flow Engine:** Dynamically calculates energy distribution—routing solar surpluses to the BESS (Battery Energy Storage System) or exporting to the grid, while ensuring factory demand is always met.
- **Dynamic Weather Integration:** Fetches live weather forecasts via the **Open-Meteo API** to adjust expected PV generation dynamically.

### 2. Context-Aware AI Chatbot (`ChatbotWidget`)
An intelligent floating assistant that acts as the plant operator's co-pilot. 
- **Dual AI Providers:** Supports seamless switching between **Cloud AI (Groq)** for speed and complex reasoning, and **Local AI (Ollama)** for air-gapped, high-privacy environments.
- **Deep Grounding:** The AI isn't just a wrapper; it is deeply grounded in the application's state. It reads the live metrics, current faults, weather forecasts, and tariff schedules directly from the `SimulationContext` (serialized via `src/lib/assistant/context.ts`) to provide mathematically sound, operationally relevant answers.
- **Interactive UI Responses:** Instead of returning plain text for complex scenarios, the AI can trigger custom UI components (like the What-If Analysis CTA) directly inside the chat bubble.

### 3. Interactive "What-If" AI Scenario Simulator (`/what-if`)
A dedicated, full-screen dashboard designed for capacity planning and capital expenditure (CapEx) analysis.
- **Dynamic Parameter Sliders:** Modify Battery Capacity (MWh), Solar PV Capacity (MW), and Factory Load (MW).
- **Instant ROI & Investment Metrics:** Calculates the total system investment (e.g., ₹4 Cr/MW for Solar, ₹2.5 Cr/MWh for BESS) and outputs the estimated Payback period (ROI in years).
- **24-Hour Grid Cost Flattening:** Uses `Recharts` to visualize how the proposed system offsets peak-tariff grid imports compared to the current baseline.

### 4. Interactive Plant Map (`/plant-map`)
A visual geographical overview of all operational sites (Chennai, Coimbatore, Madurai).
- **Dynamic Health Indicators:** Map pins dynamically change color (Green/Normal, Orange/Warning, Red/Critical) based on the aggregate health of the underlying solar panels. If even one panel is overheating, the plant is flagged.
- **Asset Filtering:** Drill down from a macro state-level view to individual array metrics.

---

## 🏗️ Architecture & Key Files

For AI agents and developers navigating this repository, here is the structural breakdown:

* **`src/context/SimulationContext.tsx`**: The heart of the application. Holds the `emsState` which acts as the single source of truth for all telemetry, tariffs, and battery statuses. It also houses the 3-second live jitter loop and Open-Meteo fetches.
* **`src/lib/assistant/context.ts`**: The AI Prompt Engineering engine. This file takes the raw numbers from `emsState`, derives human-readable insights (like percentage gaps, headroom, and verdicts), and serializes them into a compact text prompt for the LLMs.
* **`src/components/ChatbotWidget.tsx`**: The UI for the AI Assistant. Includes full-screen and minimize capabilities, and parses special tokens (like `[WHAT_IF_ANALYSIS_UI]`) to render custom rich media.
* **`src/app/what-if/page.tsx`**: The standalone premium dashboard for running AI-driven capacity simulations.
* **`src/data/mock.ts`**: The foundational baseline data (including 39 specific solar panels, their operating temperatures, PR, and baseline tariffs) that the simulation mutates.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

### Environment Variables
Depending on the LLM provider you wish to use, ensure you have the appropriate keys set up in your `.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key_here
```
*(Note: Ollama runs locally and does not require an API key by default).*

---

## 🧠 AI Agent Context Guidelines
*If you are an AI assistant reading this repository:*
1. **Always refer to `SimulationContext.tsx`** for any logic related to numbers changing on the screen.
2. **Never hardcode static values for live metrics**; always pull from `emsState`.
3. When adding new features to the Chatbot, remember that the Chatbot does not generate standard markdown for complex widgets. Instead, use the `context.ts` prompt generator to instruct the AI to return a unique token (like `[MY_NEW_WIDGET]`), and intercept that token inside `ChatbotWidget.tsx` to render the React component.
4. **Design Aesthetic:** Use `TailwindCSS` with `lucide-react` icons. Maintain a premium, modern, glass-morphic aesthetic with subtle micro-animations (e.g., `animate-in fade-in slide-in-from-bottom-2`).
