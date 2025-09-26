import { NavColumn, NavItem, Plan, UploadPreset } from '../models/home';

export const filterMetrics = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as { value: string; label: string }[];
  }

  return value.filter((item: any) => typeof item?.value === 'string' && typeof item?.label === 'string') as {
    value: string;
    label: string;
  }[];
};

export const castPreviewCopy = (raw: unknown) => {
  if (!raw || typeof raw !== 'object') {
    return null as null | { before: string; after: string; original: string; processed: string };
  }
  return raw as { before: string; after: string; original: string; processed: string };
};

export const filterUploadPresets = (value: unknown): UploadPreset[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item: any) => typeof item?.name === 'string' && typeof item?.description === 'string') as UploadPreset[];
};

export const isPlan = (item: unknown): item is Plan => {
  if (!item || typeof item !== 'object') {
    return false;
  }
  const candidate = item as Record<string, unknown>;
  return typeof candidate.name === 'string' && typeof candidate.price === 'string' && Array.isArray(candidate.features);
};

export const filterPlans = (value: unknown): Plan[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isPlan) as Plan[];
};

export const isNavItem = (value: unknown): value is NavItem => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.label === 'string';
};

export const isNavColumn = (value: unknown): value is NavColumn => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate.heading === 'string' && Array.isArray(candidate.items);
};

export const filterNavItems = (value: unknown): NavItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isNavItem).map((item) => ({
    ...item,
    columns: Array.isArray(item.columns) ? item.columns.filter(isNavColumn) : undefined,
    href: typeof item.href === 'string' ? item.href : undefined,
  }));
};


