# PLAN-spiritual-chinese-dict.md

## Overview
Build "Từ điển tiếng Trung thuộc Linh" (Spiritual Chinese Dictionary), a React-based web application. The dictionary fetches data directly from Google Sheets and features an intelligent search bar that automatically detects the input language (Vietnamese, Chinese, or English) to return accurate results. The application prioritizes a premium, intuitive UI/UX for both mobile and desktop users.

## Project Type
**WEB**
-   **Primary Agent**: `frontend-specialist`
-   **Do Not Use**: `mobile-developer` (this is a responsive web app, not native mobile)

## Success Criteria
1.  **Data Connection**: Successfully fetches and parses data from the specified Google Sheet.
2.  **Auto-Detection**: Accurately classifies user input into Vietnamese, Chinese, or English.
3.  **Search Accuracy**: Returns correct dictionary entries based on the detected language and keyword.
4.  **UI/UX**:
    -   Responsive design (Mobile first).
    -   Aesthetic "premium" look (clean typography, harmonious colors suitable for spiritual content).
    -   Instant visual feedback during search.
5.  **Performance**: Fast load times and instant search filtering (assuming reasonable dataset size).

## Tech Stack
-   **Framework**: React (Vite) - *Existing in workspace*
-   **Styling**: Tailwind CSS (for rapid, high-quality styling) + Lucide React (icons)
-   **State Management**: React Hooks (Context API if needed for global theme/data)
-   **Data Source**: Google Sheets (via Public CSV export or API)
-   **Utils**: Regex for language detection

## File Structure
```
src/
├── assets/
├── components/
│   ├── SearchBar.tsx       # Input with auto-detect feedback
│   ├── ResultList.tsx      # Container for results
│   ├── ResultCard.tsx      # Individual word display card
│   └── Header.tsx          # App title and branding
├── services/
│   ├── api.ts              # Google Sheets fetching logic
│   └── detector.ts         # Language detection logic (Regex)
├── hooks/
│   ├── useDictionary.ts    # Hook to manage data fetching and search state
│   └── useDebounce.ts      # Optimization for search input
├── styles/
│   └── index.css           # Tailwind directives & custom animations
├── App.tsx
└── main.tsx
```

## Task Breakdown

### Phase 1: Foundation & Setup
| Task ID | Name | Agent | Skill | Priority | Input | Output | Verify |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1** | Setup Tailwind CSS | `frontend-specialist` | `tailwind-patterns` | P0 | `package.json` | `tailwind.config.js`, `index.css` | Run app, verify Tailwind styles apply. |
| **1.2** | Define Design System | `frontend-specialist` | `frontend-design` | P1 | Requirements | `index.css` (variables) | Verify colors/fonts match "premium & spiritual" vibe. |
| **1.3** | Install Dependencies | `frontend-specialist` | `clean-code` | P1 | Command `npm i` | `node_modules` | `papaparse` (for CSV), `lucide-react`, `clsx`. |

### Phase 2: Core Logic Services
| Task ID | Name | Agent | Skill | Priority | Input | Output | Verify |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2.1** | Implement Language Detector | `frontend-specialist` | `clean-code` | P1 | Regex Rules | `src/services/detector.ts` | Unit test: Input "nguồn" -> VN, "origin" -> EN, "由來" -> CN. |
| **2.2** | Create Google Sheets Service | `frontend-specialist` | `api-patterns` | P1 | Sheet URL | `src/services/api.ts` | Fetch data and console.log correct JSON array. |
| **2.3** | Create useDictionary Hook | `frontend-specialist` | `nextjs-react-expert` | P2 | `api.ts`, `detector.ts` | `src/hooks/useDictionary.ts` | React DevTools: Verify hook returns search results based on input. |

### Phase 3: UI Components
| Task ID | Name | Agent | Skill | Priority | Input | Output | Verify |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **3.1** | Build Header & Layout | `frontend-specialist` | `frontend-design` | P2 | Design Theory | `App.tsx`, `Header.tsx` | Responsive layout check. |
| **3.2** | Build SearchBar | `frontend-specialist` | `frontend-design` | P1 | Interaction Design | `SearchBar.tsx` | Typing triggers detection visual; looks premium. |
| **3.3** | Build ResultCard | `frontend-specialist` | `frontend-design` | P1 | Data Structure | `ResultCard.tsx` | Displays EN/CN/VN/Verse clearly and beautifully. |
| **3.4** | Build ResultList | `frontend-specialist` | `performance-profiling` | P2 | `ResultCard` | `ResultList.tsx` | Scroll works smoothly, handles "No results". |

### Phase 4: Integration & Polish
| Task ID | Name | Agent | Skill | Priority | Input | Output | Verify |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **4.1** | Assemble App | `frontend-specialist` | `clean-code` | P1 | All Components | `App.tsx` | Full flow: Search -> Detect -> Result -> View. |
| **4.2** | UX Polish & Animations | `frontend-specialist` | `frontend-design` | P2 | App flow | Code improvements | Hover effects, smooth transitions, loading skeletons. |
| **4.3** | Mobile Responsiveness Check | `frontend-specialist` | `mobile-design` | P1 | Completed App | CSS Adjustments | Chrome DevTools device mode (iPhone/Pixel). |

## Phase X: Verification Checklist
- [ ] **Lint**: `npm run lint` passes without errors.
- [ ] **Build**: `npm run build` succeeds.
- [ ] **Functionality**:
    - [ ] Search "origin" -> Detects English -> Shows correct result.
    - [ ] Search "nguồn gốc" -> Detects Vietnamese -> Shows correct result.
    - [ ] Search "由來" -> Detects Chinese -> Shows correct result.
- [ ] **UI/UX**:
    - [ ] No layout shifts (CLS).
    - [ ] Colors are accessible and "spiritual" (not generic).
    - [ ] Mobile view is optimized (touch targets > 44px).
