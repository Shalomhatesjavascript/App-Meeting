# BU Connect — Frontend

Babcock University Campus Meetup Application — Frontend MVP

> Built with React + Vite. All functionality is mocked — no backend required to run.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

---

## Demo Flow

Since everything is mocked, here's how to experience the full app:

1. **Register** → `/register`
   - Use any email ending in `@student.babcock.edu.ng` or any `.edu` email
   - e.g. `demo@student.babcock.edu.ng`

2. **Verify Email** → `/verify-email`
   - Enter any 6-digit code (try `123456`)

3. **Set Up Profile** → `/setup-profile`
   - Choose an avatar, fill in your department/level, select an intent and interests, write a bio (min 30 chars)

4. **Discover** → `/app/discover`
   - Browse mock student profiles, swipe like (💛) or pass (✕)
   - ~40% chance of a match triggering the Match Modal

5. **Matches** → `/app/matches`
   - See matched profiles with last message previews

6. **Messages** → `/app/messages`
   - Open a conversation, send messages, get auto-replies

7. **Profile** → `/app/profile`
   - Edit avatar, bio, intent, and interests inline

---

## Project Structure

```
frontend/
├── index.html                     # Entry HTML, Google Fonts
├── vite.config.js                 # Vite config
├── package.json
└── src/
    ├── main.jsx                   # React entry point
    ├── App.jsx                    # Router + providers
    ├── index.css                  # Global styles, CSS variables, animations
    │
    ├── api/                       # Mock API layer (swap for real calls later)
    │   ├── auth.js                # register, login, verify, logout
    │   ├── profile.js             # saveProfile, getProfile, updateProfile
    │   └── matches.js             # getDiscoverUsers, swipeUser, getMatches, messages
    │
    ├── context/
    │   ├── AuthContext.jsx        # User auth state, login/logout
    │   └── AppContext.jsx         # Toast notifications, match modal state
    │
    ├── components/
    │   ├── Avatar.jsx             # DiceBear avatar renderer
    │   ├── AvatarPicker.jsx       # Style + seed picker with live preview
    │   ├── BottomNav.jsx          # Tab bar navigation
    │   ├── MatchModal.jsx         # Full-screen match celebration overlay
    │   ├── RouteGuards.jsx        # RequireAuth, RequireVerified, RequireGuest
    │   └── ui/
    │       ├── Button.jsx         # Multi-variant button (primary, secondary, amber, ghost, danger)
    │       ├── Input.jsx          # Input + Textarea with validation states
    │       ├── Badge.jsx          # Badge, IntentBadge, VerifiedBadge
    │       └── Toast.jsx          # Animated toast notification
    │
    ├── pages/
    │   ├── auth/
    │   │   ├── LoginPage.jsx      # Split-panel login
    │   │   ├── RegisterPage.jsx   # Register with password strength meter
    │   │   └── VerifyEmailPage.jsx # OTP-style 6-digit code input
    │   ├── onboarding/
    │   │   └── SetupProfilePage.jsx # 5-step profile wizard
    │   └── app/
    │       ├── DiscoverPage.jsx   # Swipe card UI
    │       ├── MatchesPage.jsx    # Match list + conversation previews
    │       ├── MessagesPage.jsx   # Message list + full chat view
    │       └── ProfilePage.jsx    # View + inline-edit own profile
    │
    └── utils/
        ├── mockData.js            # Mock users, matches, messages, constants
        └── validators.js          # Email/password/name validation
```

---

## Design System

### Typography
- **Display**: Fraunces (serif) — headings, bios, expressive text
- **Body**: DM Sans — UI elements, labels, messages

### Color Palette
```
--color-navy:   #12174a  (primary brand)
--color-amber:  #e8a020  (accent, CTAs)
--color-coral:  #e06b5a  (like actions, errors)
--color-cream:  #faf6f0  (page background)
--color-sage:   #5a8a72  (success, online status)
```

### Aesthetic Direction
**Warm Academia** — emphasizes reading bios and personality over swiping on looks. Profile cards foreground the written bio. Avatar system replaces photos entirely.

---

## Backend Integration Guide

When the Elysia/Bun backend is ready, swap the mock functions:

### Auth (`src/api/auth.js`)
```js
// Replace mock localStorage logic with real HTTP calls:
export async function loginUser({ email, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json(); // { user, token }
}
```

### Profile (`src/api/profile.js`)
```js
export async function saveProfile(profileData) {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(profileData),
  });
  return res.json();
}
```

### Matches (`src/api/matches.js`)
```js
export async function getDiscoverUsers() {
  const res = await fetch('/api/discover', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}
```

The `AuthContext` already stores the user object — add token storage there.

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Avatar API: DiceBear | Free, no API key, multiple styles, SVG-based |
| No image uploads | Spec requirement — personality-first design |
| localStorage for mock persistence | Survives page refresh during development |
| 40% match rate simulation | Realistic demo feel |
| 5-step onboarding wizard | Reduces cognitive load, better data quality |
| Fraunces serif font | Warm, intellectual — signals "read the bio" |
| Split-panel auth layout | Utilizes desktop space, mobile collapses gracefully |

---

## SRS Feature Coverage

| Feature | Status |
|---|---|
| University email verification | ✅ Validated in RegisterPage + VerifyEmailPage |
| Avatar-based profiles | ✅ AvatarPicker with 6 styles × 18 seeds |
| Interest-based discovery | ✅ DiscoverPage with mock users |
| Intent system | ✅ 4 intents (friendship, dating, networking, study buddy) |
| Match on mutual like | ✅ Simulated in matches API |
| Messaging after match | ✅ ChatView in MessagesPage |
| Premium upgrade prompt | ✅ UI prompt in ProfilePage |
| Verified badge | ✅ VerifiedBadge component |
| Admin dashboard | 🔲 Backend scope |
| Real payments | 🔲 Backend scope |
