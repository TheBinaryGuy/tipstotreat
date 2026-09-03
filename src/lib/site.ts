import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export const SITE_NAME = 'TipsToTreat';
export const SITE_DESCRIPTION =
    'Indian home remedies, health tips, and home recipes from one kitchen, written down the way they are told at home.';

/** The public origin of the current request, for canonical URLs and structured data. */
export const getOriginServerFn = createServerFn().handler(() => new URL(getRequest().url).origin);
