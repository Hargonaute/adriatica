import { auth } from '@/lib/auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Mount Better Auth handler at /api/auth/*
export const { GET, POST } = toNextJsHandler(auth);
