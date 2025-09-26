// HeroSection
export type Metric = {
  value: string;
  label: string;
};

export type PreviewCopy = {
  before: string;
  after: string;
  original: string;
  processed: string;
};

// UploadSection
export type UploadPreset = {
  name: string;
  description: string;
};

// PricingSection
export type Plan = {
  name: string;
  price: string;
  cadence?: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
};

// Header
export type NavColumn = {
  heading: string;
  items: string[];
};

export type NavItem = {
  id: string;
  label: string;
  description?: string;
  columns?: NavColumn[];
  href?: string;
};

