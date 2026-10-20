import type { MouseEvent as ReactMouseEvent } from 'react';

export type Experience = {
  company: string;
  role: string;
  dates: string;
  location: string;
  focus: string;
  highlights: string[];
};

export type CV = {
  name: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  portfolio: string;
  intro: string;
  education: { school: string; detail: string; degree: string; location: string };
  experience: Experience[];
  skills: { label: string; detail: string }[];
  languages: { label: string; detail: string }[];
};

export type Route = 'home' | 'portfolio';

export type Link = { href: string; onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void };

/** A real href plus client-side routing; `query` starts with "?" when given. */
export type LinkTo = (route: Route, hash?: string, query?: string) => Link;
