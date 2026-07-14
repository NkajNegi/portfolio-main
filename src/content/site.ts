export type SocialLink = {
  label: string
  href: string
}

export type Project = {
  title: string
  description: string
  impact: string
  tags: string[]
  category: 'Full Stack Web Dev' | 'DevOps'
  href?: string
  repoHref?: string
  caseStudyHref?: string
  images: string[]
  // Optional case-study depth. When present, the card tells a
  // problem → approach → outcome story instead of a flat description.
  problem?: string
  approach?: string[]
}

export type Experience = {
  company: string
  role: string
  kind: 'Full-time' | 'Internship' | 'Contract' | 'Freelance'
  start: string
  end: string
  location?: string
  highlights: string[]
}

export type BlogPost = {
  title: string
  summary: string
  date: string
  readTime: string
  href: string
  tags: string[]
}

/**
 * -----------------------------------------------------------------------------
 *  SINGLE SOURCE OF TRUTH FOR THE WHOLE SITE.
 *  Replace every value marked  // TODO  with your real information.
 * -----------------------------------------------------------------------------
 */
export const site = {
  // -- Identity ---------------------------------------------------------------
  name: 'Ashish', // TODO: your full name
  headline: 'Software Engineer',
  location: 'India',
  email: 'at.best.ashish@gmail.com',

  // -- Handles (GitHub stats, command palette, social links) ------------------
  github: 'NkajNegi', // GitHub username (powers the live stats card)
  linkedin: 'https://www.linkedin.com/in/ashish-negi-security/',
  twitter: '', // TODO: optional e.g. https://x.com/your-handle ('' hides it)
  hashnodeUsername: 'ashishnegi', // TODO: Hashnode username (powers the Writing section)
  resumeHref: '/resume.pdf', // TODO: drop a resume.pdf into /public

  // -- Public site URL (used for SEO/OpenGraph tags) --------------------------
  // Single source of truth: set VITE_SITE_URL in your host's env. index.html,
  // robots.txt and sitemap.xml are all generated from it (see vite.config.ts).
  url: (import.meta.env.VITE_SITE_URL ?? 'https://your-domain.com').replace(/\/$/, ''),

  // -- Contact form (https://web3forms.com - free, no backend) ----------------
  // 1. Go to web3forms.com, enter your email, get an Access Key.
  // 2. Paste it below. The contact form then emails you submissions directly.
  web3formsKey: 'YOUR_WEB3FORMS_ACCESS_KEY', // TODO

  // -- Short bio for the About section -----------------------------------------
  about: {
    summary:
      "I'm a software engineer who enjoys turning ambiguous problems into reliable, well-crafted software. I care about performance, clean architecture, and shipping experiences that feel effortless to use.",
    facts: [
      'Building production web apps with React, TypeScript & Node.js',
      'Comfortable across the stack - UI, APIs, databases and infra',
      'Strong focus on performance, accessibility and DX',
    ],
    // Optional headshot. Drop an image in /public and point to it (e.g. '/me.jpg').
    photo: '', // TODO: optional path to your photo ('' = monogram avatar)
  },

  socials: [
    { label: 'GitHub', href: 'https://github.com/NkajNegi' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ashish-negi-security/' },
  ] satisfies SocialLink[],

  experience: [
    {
      company: 'Company Name', // TODO
      role: 'Frontend Developer',
      kind: 'Full-time',
      start: '2025',
      end: 'Present',
      location: 'Remote',
      highlights: [
        'Built responsive UI components with React + TypeScript.',
        'Improved Core Web Vitals and accessibility across key pages.',
        'Collaborated with design to ship polished, reusable patterns.',
      ],
    },
    {
      company: 'Startup / Agency', // TODO
      role: 'Frontend Intern',
      kind: 'Internship',
      start: '2024',
      end: '2025',
      location: 'On-site',
      highlights: [
        'Worked on modern UI flows and API integrations.',
        'Owned features end-to-end from spec to deployment.',
      ],
    },
  ] satisfies Experience[],

  projects: [
    {
      title: 'MetroFlow AI — Feature to Production',
      description:
        'A multi-tenant SaaS platform that manages the entire software delivery lifecycle — from an AI-written PRD to an AI code review gated by human approval.',
      problem:
        'AI can write code faster, but great software is not shipped by generation alone. The delivery lifecycle around the code — clarifying the request, planning the work, reviewing diffs for correctness and security, and getting a human sign-off — is where quality is actually won or lost.',
      approach: [
        'An AI Product Manager clarifies the request and writes a structured PRD.',
        'An agent breaks the PRD into engineering tasks on a drag-and-drop Kanban board.',
        'GitHub pull requests sync in via a signature-verified webhook.',
        'An AI QA engineer reviews each diff against the PRD, acceptance criteria, OWASP Top 10 and performance — classifying issues as blocking or non-blocking and looping until clean.',
        'A human always makes the final call before anything ships.',
      ],
      impact: 'Full idea → PRD → tasks → AI review → human approval → ship loop, shipped end-to-end.',
      tags: ['Next.js', 'tRPC', 'Prisma', 'Anthropic Claude', 'Inngest', 'Turborepo'],
      category: 'Full Stack Web Dev',
      href: 'https://ship-flow-ai-feature-to-production.vercel.app',
      repoHref: 'https://github.com/NkajNegi/ShipFlow-AI-Feature-to-Production',
      // Real screenshot of the live deployment. Add more (e.g. dashboard,
      // Kanban board, AI review panel) as '/img/shipflow-2.jpg' etc.
      images: ['/img/shipflow-1.jpg'],
    },
    {
      title: 'Command Inbox — Cybernetic Workflow',
      description:
        'A hyper-fast, keyboard-driven email and calendar command center with a cyberpunk CRT-terminal aesthetic, built at the Corsair hackathon.',
      problem:
        'Email and calendar triage is slow and mouse-driven. Power users want to move through the whole inbox by keyboard, with an AI agent handling the multi-step busywork of drafting, scheduling and search.',
      approach: [
        'Wires directly into the Gmail and Google Calendar APIs for instant triage, drafting and scheduling.',
        'An autonomous "Decrypt" AI agent executes multi-step workflows from natural language.',
        'A pgvector store enables sub-second semantic search across email history.',
        'A Groq LLM auto-flags high-priority mail — all navigable entirely by keystroke.',
      ],
      impact: 'Sub-second semantic email search over local pgvector embeddings, plus agentic scheduling.',
      tags: ['Next.js 16', 'Drizzle ORM', 'pgvector', 'Groq', 'NextAuth', 'Corsair'],
      category: 'Full Stack Web Dev',
      repoHref: 'https://github.com/NkajNegi/Command-Inbox-Corsair-Hackathon',
      // Branded local placeholders (1600×1000, 16:10). Swap for real product
      // screenshots at the same size when available.
      images: ['/img/cmdinbox-1.jpg', '/img/cmdinbox-2.jpg', '/img/cmdinbox-3.jpg'],
    },
  ] satisfies Project[],

  blog: [
    {
      title: 'How I structure React projects (modular + scalable)',
      summary: 'A practical folder structure and patterns that stay maintainable.',
      date: '2026-01-10',
      readTime: '5 min read',
      href: 'https://example.com',
      tags: ['React', 'Architecture'],
    },
    {
      title: 'Advanced API Design with Node.js and Express',
      summary: 'Building resilient backend systems with proper error handling and scaling.',
      date: '2025-11-02',
      readTime: '7 min read',
      href: 'https://example.com',
      tags: ['Node.js', 'Backend'],
    },
    {
      title: 'Optimizing PostgreSQL Queries for High Traffic',
      summary: 'Indexing strategies and analyzing query plans for massive performance gains.',
      date: '2025-09-15',
      readTime: '6 min read',
      href: 'https://example.com',
      tags: ['PostgreSQL', 'Database'],
    },
    {
      title: 'Automating Deployments with Docker and GitHub Actions',
      summary: 'A complete guide to building a robust CI/CD pipeline from scratch.',
      date: '2025-08-20',
      readTime: '8 min read',
      href: 'https://example.com',
      tags: ['DevOps', 'CI/CD'],
    },
    {
      title: 'TypeScript best practices for 2026',
      summary: 'Beyond simple types-using generics and inference effectively.',
      date: '2025-07-10',
      readTime: '4 min read',
      href: 'https://example.com',
      tags: ['TypeScript', 'Best Practices'],
    },
  ] satisfies BlogPost[],
} as const
