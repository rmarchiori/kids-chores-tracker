# Kids Chores Tracker

A family chore management app where parents assign tasks to children, children complete tasks and self-rate quality (1-5 stars), and parents review and provide feedback.

## Tech Stack

- **Frontend**: Next.js 14 + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel + GitHub

## Project Structure

```
kids-chores-tracker/
├── src/                   # Source code
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   └── lib/
│       ├── supabase.ts   # Supabase client
│       └── schemas.ts    # Zod validation schemas
├── public/               # Static assets
├── docs/                 # Documentation
│   ├── README.md         # Documentation index
│   └── analysis/         # Analysis documents
│       ├── requirements.md
│       ├── tech-stack.md
│       ├── dev-ops.md
│       ├── implementation-plan-mvp-1.0.md
│       └── implementation-plan-next-release.md
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript config (strict mode)
├── tailwind.config.ts   # Tailwind CSS config
└── package.json         # Dependencies
```

## Getting Started

### 1. Setup Environment

Copy `.env.example` to `.env.local` and fill in Supabase credentials:

```bash
cp .env.example .env.local
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- **Type Checking**: `npm run type-check`
- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Production**: `npm start`

## Documentation

See `docs/README.md` for complete project documentation:

- **requirements.md** - MVP features and specifications
- **tech-stack.md** - Technology choices and rationale
- **dev-ops.md** - Deployment and operations
- **implementation-plan-mvp-1.0.md** - Sprint-by-sprint plan
- **implementation-plan-next-release.md** - Phase 2+ features

## License

Private project
