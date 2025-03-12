# Next.js Frontend Project

This is a modern Next.js project built with TypeScript and Tailwind CSS.

## Project Structure

```
├── src/
│   ├── app/                 # App router directory
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable components
│   ├── lib/               # Utility functions and shared logic
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Component-specific styles
├── public/                # Static assets
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- ESLint
- PostCSS 