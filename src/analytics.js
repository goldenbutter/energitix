import { inject } from '@vercel/analytics';

// Shared by the homepage and standalone teaser. Development logs stay local.
inject({ mode: import.meta.env.DEV ? 'development' : 'production' });
