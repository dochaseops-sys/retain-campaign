# Retain Social Growth Challenge &bull; Multi-Page Architecture

A responsive, high-performance web application designed for the **Retain Social Growth Challenge** (matching [https://retaindigital.io/](https://retaindigital.io/) brand colors and clean modern layout), cleanly partitioned into standalone public follower and authenticated internal portals.

---

## 🌟 Dedicated Pages

1. **Standalone External Follower & Confirmation Page (`index.html` / `follow.html`)**:
   - **Intended Audience**: External people and network contacts invited to follow Retain.
   - **Content**:
     - Welcoming intro to Retain social channels
     - **Follow Retain Everywhere**: Official platform cards (LinkedIn, Instagram, X, TikTok, Facebook, YouTube) with direct follow links
     - **Confirm Your Follow & Support**: Simple confirmation form (Full Name, Email, Social Handle, Platforms Followed checkboxes, Referral Code auto-filled via `?code=...`, Engagement check, Consent check)
     - Exact confirmation message: *"Thank you for supporting Retain. Your submission has been received and will be verified."*
   - **Security / Privacy**: **Zero access to other pages**. No navigation to employee dashboard, admin portal, internal prizes, points rules, leaderboard, or sprint timelines.

2. **Internal Employee Portal (`employee.html`)**:
   - **Access**: Protected by Employee Login / Registration.
   - **Login & Registration**: Sign in with official Retain email or referral code, or register as a new employee.
   - **Authenticated Dashboard**:
     - Personalized referral link (`https://.../index.html?code=...`) & unique code with 1-click copy
     - 1-Click sharing toolkit for WhatsApp, LinkedIn, X, Facebook, Email
     - Key metrics: Verified Referrals, Pending Review, Total Points, Leaderboard Rank
     - Milestone progress bar with rewards
     - Masked referral activity log (`@m****e`)
     - Complete internal campaign details: Hero with dates & prize showcase, How It Works, Scoring rules & calculator, Live Leaderboard (Top 3 podium + filtered table), 4-Week Timeline, and Rules & Fair Play.

3. **Administrator Control Center (`admin.html`)**:
   - **Access**: Protected by Administrator Authentication (`admin@retaindigital.io` / `retain2026!`).
   - **Authenticated Control Center**:
     - Submissions review queue with duplicate warnings, one-click Verify / Reject with reason categories and custom audit notes
     - **Editable Social Links & Channels**: Directly edit platform names, handles, URLs, and baseline counts from the dashboard
     - Manage employees with auto-generated codes
     - Point adjustments with mandatory audit trail
     - Campaign settings (dates, copy, platform toggles, pinned broadcast banner)
     - Campaign analytics (8 KPIs, Follower Growth by Platform Doughnut chart, Department Performance Bar chart)
     - CSV export for Submissions, Leaderboard, and Audit Logs
     - Firebase Cloud Firestore & Auth synchronization config modal
     - Finalize and publish winner

---

## 📁 File Structure

```
dochase-growth-challenge/
├── index.html                   # Standalone external follower page (Follow & Confirm only, NO internal links)
├── follow.html                  # Alias standalone external follower page
├── employee.html                # Internal employee portal (Login, Registration, Dashboard & Leaderboard)
├── admin.html                   # Administrator control center (Login, Queue, Settings & Analytics)
├── README.md                    # Documentation and setup guide
├── css/
│   └── styles.css               # Brand styles, Retain coral/rose gradients, modern layout
├── assets/
│   └── logo.svg                 # Retain SVG vector brand logo
└── js/
    ├── follow-app.js            # Coordinator for standalone external follower page
    ├── employee-app.js          # Coordinator & auth manager for employee portal
    ├── admin-app.js             # Coordinator & auth manager for admin portal
    ├── store.js                 # Unified state store, session auth & calculations
    ├── scoring.js               # Points rules, bonuses, milestone & badge engine
    ├── firebase-config.js       # Firebase Firestore & Auth integration service
    └── components/
        ├── hero.js              # Hero section, countdown timer, stats
        ├── howItWorks.js        # 4-step process flow
        ├── socialCards.js       # Social platform follow cards
        ├── scoringSection.js    # Scoring breakdown & interactive calculator
        ├── employeeDashboard.js # Employee profile, unique link, 1-click share
        ├── referralForm.js      # Referral confirmation form with duplicate checks
        ├── leaderboard.js       # Live filtered leaderboard with top-3 podium
        ├── timeline.js          # 4-week campaign journey
        ├── sharingToolkit.js    # Pre-written copy templates
        ├── rulesAccordion.js    # Expandable 9-point fair play rules
        ├── adminPortal.js       # Submissions review, audit trail, editable social links, CSV export
        └── analytics.js         # KPI metrics & interactive Chart.js graphs
```
