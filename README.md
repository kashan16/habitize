````markdown
# Habitize

> A modern habit‑tracking web app built with Next.js, Supabase & TypeScript.

**Habitize** helps you record your daily “memorable moment,” track multiple habits in a clickable grid, and log your sleep hours to visualize monthly patterns.

---

## 🚀 Features

- **Memorable Moment**  
  Save one text note per day to capture your highlight or reflection.  
- **Habit Grid**  
  Define any number of habits and toggle each day’s checkmark in a calendar‑style grid.  
- **Sleep Tracker**  
  Input hours slept each day and view a month‑long chart of your sleep patterns.  

---

## 🧰 Tech Stack

- **Next.js 15** (App Router)  
- **TypeScript**  
- **Supabase**  
  - Auth (Email/Password)  
  - Row‑Level Security on  
    `memorable_moments`, `habits`, `habit_logs`, `sleep_logs`  
- **Tailwind CSS** + shadcn/ui + lucide-react for styling & icons  
- **React Context** for auth & Supabase client  
- **Custom React Hooks** (`useHabits`, `useMoment`, `useSleepLogs`)  

---

## 💻 Getting Started

### 1. Clone repo

```bash
git clone https://github.com/kashan16/habitize.git
cd habitize
````

### 2. Install dependencies

```bash
npm install
# or
yarn
# or
pnpm install
```

### 3. Configure environment

Create a `.env.local` file at project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂 Folder Structure

```
.
├── app/                   # Next.js App Router pages & layouts
├── components/            # Shared UI components (Navbar, HabitGrid, SleepChart…)
├── context/               # React Context providers (Auth, Supabase)
├── hooks/                 # Custom data hooks (useHabits, useMoment, useSleepLogs)
├── lib/                   # singleton Supabase client & helpers
├── supabase/              # SQL migrations, RLS policies, table definitions
├── store/                 # (optional) Zustand / global state
├── public/                # Static assets
├── styles/                # Tailwind configuration & global styles
├── database.types.ts      # Type‑safe Database schema (generated)
└── next.config.ts         # Next.js configuration
```

---

## 🔧 Scripts

* `npm run dev`
  Start dev server with Turbopack.
* `npm run build`
  Create an optimized production build.
* `npm run start`
  Run the production build locally.
* `npm run lint`
  Run ESLint across the codebase.

---

## 📦 Environment & Deployment

This app is Vercel‑ready—just connect your GitHub repo and set the same `NEXT_PUBLIC_…` variables in Vercel’s dashboard.

---

## 🤝 Contributing

1. Fork this repo
2. Create your feature branch:
   `git checkout -b feature/your-feature`
3. Commit your changes:
   `git commit -m "feat: add awesome feature"`
4. Push to your branch:
   `git push origin feature/your-feature`
5. Open a Pull Request

Please follow conventional commits and run `npm run lint` before submitting.

---

## ❤️ License

[MIT](./LICENSE) © 2025 Kashan Yunus

```
::contentReference[oaicite:0]{index=0}
```
