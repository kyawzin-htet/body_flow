# BodyFlow - Gymnastics Training & Habit Tracker

A production-ready, offline-first React Native app built with Expo for gymnasts and calisthenics athletes to track training, build habits, and improve performance through structured progression.

## 🎯 Features

### Core Features

- **User Profile & Goals** - Set goals (strength, balance, mobility, endurance), target muscles, skill level, and weekly training frequency
- **Muscle Groups** - Interactive muscle group selector with exercise filtering
- **Skill Progressions** - Gymnastics skill trees (Handstand, Planche, Front Lever, L-Sit, Muscle-Up) with difficulty progression
- **Habit Tracking** - Create habits from exercises, track daily check-ins, view streaks and calendar heatmaps
- **Analytics & Insights** - Muscle balance charts, weekly training volume, consistency scores, and progress tracking
- **Smart Coach** - Rule-based recommendations for lighter sessions, progressions, and motivation
- **Recovery Tracking** - Soreness tracking (1-5 scale) with recovery day suggestions
- **Gamification** - Badges, titles, skill unlocks, streaks, and challenges
- **Offline-First** - Full SQLite database with exercise and media caching
- **Dark/Light Mode** - System-aware theme support

### Future-Ready Features

- **Google AdMob Integration** - Non-intrusive banner, interstitial, and rewarded ads
- **Cloud Sync** - Ready architecture for backend sync
- **Notifications** - Training reminders and streak alerts

## 🛠️ Tech Stack

- **Expo** (latest) - React Native framework
- **TypeScript** - Type-safe development
- **Expo Router** - File-based navigation with tabs
- **Zustand** - Global state management
- **Expo SQLite** - Offline-first local database
- **Axios** - API requests
- **NativeWind** - Tailwind CSS for React Native
- **@expo/vector-icons** - Icon library
- **AsyncStorage** - Settings persistence

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

## 🚀 Getting Started

### 1. Clone the repository

```bash
cd BodyFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure API Keys (Optional)

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```
EXPO_PUBLIC_EXERCISEDB_API_KEY=your_rapidapi_key_here
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

**Getting API Keys:**

- **ExerciseDB**: Sign up at [RapidAPI](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) (free tier available)
- **YouTube Data API v3**: Get from [Google Cloud Console](https://console.cloud.google.com/) (free with quotas)

> **Note:** The app works offline-first with mock data even without API keys!

### 4. Run the app

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web (limited functionality)
npm run web
```

## 📁 Project Structure

```
BodyFlow/
├── app/                          # Expo Router navigation
│   ├── (tabs)/                   # Tab-based screens
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Home screen
│   │   ├── muscles.tsx          # Muscle groups
│   │   ├── skills.tsx           # Skill trees
│   │   ├── habits.tsx           # Habit tracking
│   │   ├── analytics.tsx        # Analytics & insights
│   │   └── profile.tsx          # User profile
│   ├── exercise/[id].tsx        # Exercise detail (future)
│   ├── onboarding.tsx           # First-time setup
│   └── _layout.tsx              # Root layout
├── src/
│   ├── components/              # Reusable UI components
│   ├── store/                   # Zustand state stores
│   │   ├── userStore.ts
│   │   ├── habitStore.ts
│   │   └── settingsStore.ts
│   ├── database/                # SQLite database layer
│   │   ├── db.ts
│   │   └── repositories/
│   │       ├── userRepository.ts
│   │       └── habitRepository.ts
│   ├── api/                     # External API integrations
│   │   ├── config.ts
│   │   ├── exercisedb.ts
│   │   └── youtube.ts
│   ├── services/                # Business logic (future)
│   ├── utils/                   # Utility functions
│   │   └── constants.ts
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   └── assets/                  # Images, fonts
├── .env.example                 # Environment variables template
├── tailwind.config.js           # NativeWind config
├── babel.config.js              # Babel with NativeWind
└── package.json
```

## 🎨 Design System

### Colors

- **Primary**: `#6366f1` (Indigo) - CTAs and highlights
- **Secondary**: `#f97316` (Orange) - Energy and motivation
- **Success**: `#10b981` (Green) - Completed habits
- **Warning**: `#f59e0b` (Amber) - Recovery alerts
- **Danger**: `#ef4444` (Red) - High difficulty

### Dark Theme

- Background: `#0a0e27`
- Surface: `#1a1f3a`
- Border: `#2d3250`

### Light Theme

- Background: `#f8f9fa`
- Surface: `#ffffff`
- Border: `#e5e7eb`

## 🔌 API Integration

### ExerciseDB API

- Fetch exercises by muscle, target, equipment
- Filter for bodyweight/gymnastics exercises
- Access to 1000+ exercises with GIFs and instructions

### YouTube Data API v3

- Search for exercise tutorials
- Embed tutorial videos
- Quota-aware implementation

## 💾 Database Schema

The app uses SQLite with the following tables:

- **users** - User profile and preferences
- **exercises** - Cached exercise data
- **skills** - Gymnastics skill progression data
- **habits** - User-created training habits
- **habit_logs** - Daily habit completion tracking
- **recovery_logs** - Soreness and recovery tracking
- **achievements** - Gamification badges
- **workouts** - Completed workout sessions

## 🧪 Development

### Type Checking

```bash
npx tsc --noEmit
```

### Database Reset (Development)

The database automatically initializes on first launch. To reset:

```javascript
import { resetDatabase } from "./src/database/db";
await resetDatabase();
```

## 📱 Screens

1. **Home** - Dashboard with today's habits, quick stats, and quick actions
2. **Muscles** - Interactive muscle group grid with filters
3. **Skills** - Visual skill progression trees with difficulty indicators
4. **Habits** - Daily habit tracking with streaks and check-ins
5. **Analytics** - Charts, muscle balance, weekly volume, insights
6. **Profile** - User stats, settings, theme toggle, data management
7. **Onboarding** - 5-step first-time user setup flow

## 🎮 Usage

### Creating Your First Habit

1. Complete onboarding to set up your profile
2. Navigate to the Habits tab
3. Tap "Create Habit"
4. Select an exercise, set target sets/reps
5. Choose frequency (daily/weekly)
6. Start tracking!

### Tracking Progress

- Check in daily habits on the Habits screen
- View your streak on the Home dashboard
- Monitor muscle balance in Analytics
- Unlock skills as you progress

## 🚢 Deployment

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Environment Variables for Production

Set these in your EAS build configuration or app.json:

```
EXPO_PUBLIC_EXERCISEDB_API_KEY
EXPO_PUBLIC_YOUTUBE_API_KEY
EXPO_PUBLIC_ADMOB_BANNER_ID
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
EXPO_PUBLIC_ADMOB_REWARDED_ID
```

## 🎯 Roadmap

- [ ] Exercise detail screen with GIF/video playback
- [ ] Create habit from exercise flow
- [ ] Calendar heatmap (365-day view)
- [ ] Advanced filtering and search
- [ ] Recovery tracking interface
- [ ] Smart coach recommendations
- [ ] Achievement unlock animations
- [ ] Offline media caching (GIFs/videos)
- [ ] Google AdMob integration
- [ ] Cloud backup & sync
- [ ] Social features (friend challenges)
- [ ] Wearable integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for gymnasts and calisthenics athletes everywhere.

## 🙏 Acknowledgments

- **ExerciseDB** for the comprehensive exercise database
- **YouTube** for tutorial video integration
- **Expo** for the amazing development experience
- **React Native** community for the tools and libraries

---

**BodyFlow** - Master your body, track your progress, achieve your goals.
