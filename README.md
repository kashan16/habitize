# 📱 Habitize

![Habitize Logo](./public/images/habitize-logo.png)

> A modern, intuitive habit-tracking web application built with Next.js, Supabase, and TypeScript

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

## 🌟 Overview

Habitize is a comprehensive habit-tracking application that helps you build better daily routines. Track your habits, record memorable moments, and monitor your sleep patterns all in one beautiful, user-friendly interface.

![App Screenshot](./public/images/app-overview.png)

## ✨ Features

### 📝 Memorable Moments
Capture your daily highlights and reflections with a simple text note. Each day, record one meaningful moment that you want to remember.

![Memorable Moments Feature](./public/images/memorable-moments.png)

### 📊 Habit Grid
Create and track unlimited habits with an intuitive calendar-style grid interface. Simply click to toggle completion status for each day.

![Habit Grid Interface](./public/images/habit-grid.png)

### 😴 Sleep Tracker
Log your sleep hours and visualize your sleep patterns with beautiful monthly charts. Understanding your sleep trends has never been easier.

![Sleep Tracker Charts](./public/images/sleep-tracker.png)

### 🔐 Secure Authentication
Full user authentication system with email/password login, ensuring your data remains private and secure.

![Authentication Flow](https://ibb.co/d0dLKmY7)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Context + Custom Hooks
- **Styling**: Tailwind CSS with custom components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kashan16/habitize.git
   cd habitize
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

## 📁 Project Structure

```
habitize/
├── app/                    # Next.js App Router pages & layouts
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main app dashboard
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── HabitGrid.tsx     # Habit tracking grid
│   ├── SleepChart.tsx    # Sleep visualization
│   └── Navbar.tsx        # Navigation component
├── context/              # React Context providers
│   ├── AuthContext.tsx   # Authentication context
│   └── SupabaseContext.tsx # Supabase client context
├── hooks/                # Custom React hooks
│   ├── useHabits.ts      # Habit management hook
│   ├── useMoment.ts      # Daily moments hook
│   └── useSleepLogs.ts   # Sleep tracking hook
├── lib/                  # Utilities and configurations
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── supabase/             # Database schema & migrations
│   ├── migrations/       # SQL migration files
│   └── schema.sql        # Database schema
├── store/                # Global state management (optional)
├── public/               # Static assets
│   └── images/           # App screenshots and assets
├── database.types.ts     # Generated TypeScript types
└── next.config.ts        # Next.js configuration
```

## 🗄️ Database Schema

The application uses the following Supabase tables with Row-Level Security (RLS) enabled:

- **`profiles`**: User profile information
- **`habits`**: User-defined habits
- **`habit_logs`**: Daily habit completion records
- **`memorable_moments`**: Daily memorable moment entries
- **`sleep_logs`**: Sleep duration tracking

![Database Schema](./public/images/database-schema.png)

## 🎨 UI Components

Built with modern, accessible components using shadcn/ui:

- **Form Components**: Input fields, buttons, date pickers
- **Data Visualization**: Charts, grids, progress indicators
- **Navigation**: Responsive navbar, sidebar navigation
- **Feedback**: Toast notifications, loading states

![UI Components Showcase](./public/images/ui-components.png)

## 📱 Mobile Responsiveness

Habitize is fully responsive and works seamlessly across all devices:

![Mobile Screenshots](./public/images/mobile-responsive.png)

## 🧪 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create optimized production build |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm run type-check` | Run TypeScript type checking |

## 🚀 Deployment

### Vercel (Recommended)

This app is Vercel-ready for seamless deployment:

1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel's dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy with one click

![Deployment Flow](./public/images/deployment.png)

### Other Platforms

The app can be deployed to any platform that supports Next.js applications:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run type-check
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Ensure all tests pass and code is properly linted
- Add appropriate documentation for new features
- Keep PRs focused and atomic

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Kashan Yunus** - [@kashan16](https://github.com/kashan16)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [Lucide React](https://lucide.dev/) for the icon library

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/kashan16/habitize/issues) page
2. Create a new issue if your problem isn't already addressed
3. Join our [discussions](https://github.com/kashan16/habitize/discussions) for general questions

---

<div align="center">
  <strong>Built with ❤️ by Kashan Yunus</strong>
  <br>
  <em>Track your habits. Transform your life.</em>
</div>

![Footer Image](./public/images/footer-banner.png)