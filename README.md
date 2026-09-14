# QuinutDB 🎮

> **A curated, community-driven database for emulation frontends, launchers, and retro gaming operating systems.**
> Built with an achromatic blueprint aesthetic, powered by Vite, React, TypeScript, Tailwind CSS, and Supabase.

---

## ✨ Features

- **📐 Achromatic Blueprint Aesthetic**: Clean, high-contrast monochrome design compliant with strict design standards (`#0a0a0a`, `#ffffff`, Geist typography, full-bleed 1:1 boxart).
- **⭐ Community Ratings & Voting**: Logged-in users can evaluate and vote on 3 benchmark criteria (Adoption, Ease of Use, Activity: 1–5 scale).
- **💬 Real-time Reviews & Feedback**: Community user review feed with user avatars, timestamps, and author deletion.
- **⚡ Dynamic Database with Graceful Fallback**: Loads live from Supabase (`public.items`), with instant zero-downtime offline fallback to local curated catalog data.
- **🛠️ Web-Based Catalog Editor (`/edit`)**: Add or edit items through a reactive GUI with live card preview, direct Supabase save, and GitHub PR/issue code generation.
- **🔍 Advanced 2-Column Filtering & Sorting**: Real-time multi-attribute search, platform filters, pricing models, and sorting by popularity, ease of setup, or update activity.

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone repository
git clone https://github.com/quinut/quinutDB.git
cd quinutDB

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note**: Even without Supabase credentials, the site operates 100% cleanly using the local curated baseline data.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
```

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase dashboard.
3. Run `supabase/schema.sql` to initialize tables (`profiles`, `items`, `item_ratings`, `item_reviews`), views, and Row Level Security (RLS) policies.
4. Run `supabase/seed.sql` to pre-populate the database with all curated frontends.
5. In **Authentication > Providers**, enable GitHub or Email (Magic Link) as desired.

---

## 📄 License

MIT © [quinut](https://github.com/quinut)
