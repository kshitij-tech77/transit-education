# Transit Education

Transit Education is a premium study abroad consultancy platform designed to bridge the gap between Nepali students and international education opportunities. The platform features a high-conversion frontend and a custom-built content management system for managing blog posts, student applications, country guides, and more.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **CMS**: Custom JSON-based system with TipTap rich text editor
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the website.

## CMS Access
The CMS is accessible at `/cms/login`.
- **Development Login**: admin@transiteducation.com / admin123 (Check `.env.local` for actual credentials if configured)

## Folder Structure
- `src/app/(frontend)`: Public website pages and routing.
- `src/app/cms`: CMS specific routes and login.
- `src/components`: UI components organized by scope (home, layout, cms, shared, ui).
- `src/data`: JSON-based data storage for all dynamic content.
- `public/media`: Centralized storage for images and assets.
- `_archive`: Legacy data and migration artifacts (ignored by git).

## Environment Variables
Create a `.env.local` file with:
```env
RESEND_API_KEY=your_resend_key
```
