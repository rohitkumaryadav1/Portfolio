import { z } from 'zod';
const text = z.string().trim().max(12000);
const short = z.string().trim().max(300);
const required = short.min(1);
const url = z.union([
  z.literal(''),
  z.url().refine((v) => v.startsWith('https://'), 'Use an HTTPS URL'),
]);
const list = z.array(short.min(1)).max(100);
const date = z.union([z.literal(''), z.iso.date()]);
const media = z
  .string()
  .max(300)
  .regex(/^(|[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg))$/);
export const schemas = {
  profile: z.object({
    name: required,
    headline: required,
    introduction: text,
    about: text,
    email: z.email(),
    linkedin: url,
    github: url,
    x: url,
    location: short,
    focus: short,
    image: media,
    resume_path: z
      .string()
      .max(300)
      .regex(/^(|[a-zA-Z0-9/_-]+\.pdf)$/)
      .default(''),
  }),
  projects: z
    .object({
      title: required,
      short_description: short,
      description: text,
      technologies: list,
      status: z.enum(['Completed', 'In Progress', 'Experiment']),
      github: url,
      demo: url,
      blog_url: url.default(''),
      youtube_url: url.default(''),
      blog_content: text.default(''),
      highlights: list.default([]),
      currently_building: z.boolean().default(false),
      start_date: date,
      completion_date: date,
      featured: z.boolean(),
      image: media,
      screenshots: z.array(media.min(1)).max(20),
    })
    .refine((v) => !v.start_date || !v.completion_date || v.completion_date >= v.start_date, {
      message: 'Completion must follow start date',
      path: ['completion_date'],
    })
    .refine((v) => !v.currently_building || v.status === 'In Progress', {
      message: 'A current build must have In Progress status',
      path: ['currently_building'],
    }),
  experiences: z.object({
    organization: required,
    position: required,
    parent_organization: short,
    location: short,
    start_date: date,
    completion_date: date,
    description: text,
    responsibilities: list,
    achievements: list,
    technologies: list,
  }),
  skills: z.object({ name: required, category: required }),
  education: z.object({
    university: required,
    degree: required,
    graduation_year: z.number().int().min(1900).max(2200),
    cgpa: short,
    coursework: list,
  }),
  interests: z.object({ title: required, description: text }),
  site_settings: z.object({
    title: required,
    meta_description: short,
    footer_text: short,
    show_about: z.boolean(),
    show_projects: z.boolean(),
    show_experiences: z.boolean(),
    show_skills: z.boolean(),
    show_education: z.boolean(),
    show_interests: z.boolean(),
    featured_only: z.boolean(),
  }),
};
export type Table = keyof typeof schemas;
export type Content<K extends Table> = z.infer<(typeof schemas)[K]>;
export type Row<K extends Table> = {
  id: string;
  data: Content<K>;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};
export const tables = Object.keys(schemas) as Table[];
export function isTable(value: string): value is Table {
  return tables.includes(value as Table);
}
export const envelope = z.object({
  data: z.unknown(),
  published: z.boolean(),
  display_order: z.number().int().min(0).max(100000),
});
export const defaults: { [K in Table]: Content<K> } = {
  profile: {
    name: '',
    headline: '',
    introduction: '',
    about: '',
    email: '',
    linkedin: '',
    github: '',
    x: '',
    location: '',
    focus: '',
    image: '',
    resume_path: '',
  },
  projects: {
    title: '',
    short_description: '',
    description: '',
    technologies: [],
    status: 'In Progress',
    github: '',
    demo: '',
    blog_url: '',
    youtube_url: '',
    blog_content: '',
    highlights: [],
    currently_building: false,
    start_date: '',
    completion_date: '',
    featured: false,
    image: '',
    screenshots: [],
  },
  experiences: {
    organization: '',
    position: '',
    parent_organization: '',
    location: '',
    start_date: '',
    completion_date: '',
    description: '',
    responsibilities: [],
    achievements: [],
    technologies: [],
  },
  skills: { name: '', category: '' },
  education: { university: '', degree: '', graduation_year: 2029, cgpa: '', coursework: [] },
  interests: { title: '', description: '' },
  site_settings: {
    title: '',
    meta_description: '',
    footer_text: '',
    show_about: true,
    show_projects: true,
    show_experiences: true,
    show_skills: true,
    show_education: true,
    show_interests: false,
    featured_only: false,
  },
};
