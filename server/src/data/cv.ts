export type Experience = {
  company: string;
  role: string;
  dates: string;
  location: string;
  focus: string;
  highlights: string[];
};

export const cv = {
  name: 'Marouane Bouakba',
  role: 'Content Producer · Video Editor · Director of Photography',
  location: 'Doha, Qatar',
  phone: '+974 7027 3027',
  email: 'bouakbamarouane@gmail.com',
  portfolio: 'https://mega.nz/folder/Wq4Q0T4K#giNkfTvU4BpdZ86JJHaqaQ',
  intro: 'Content producer with 7 years of end-to-end production across advertising, broadcast, documentary and branded social content, working in Algeria and Qatar. Builds short-form and campaign video from brief to final master — camera, edit, colour, motion graphics and full audio post under one pair of hands. Native Arabic, proficient English and French; based in Doha and available across the GCC.',
  education: {
    school: 'ISMAS',
    detail: 'Institut Supérieur des Métiers des Arts du Spectacle',
    degree: "Bachelor's Degree in Visual Arts",
    location: 'Algiers, Algeria',
  },
  experience: [
    {
      company: 'Digiturnal',
      role: 'Director of Photography / Video Editor',
      dates: 'Oct 2025 - Jul 2026',
      location: 'Doha, Qatar',
      focus: 'Agency production · 10+ recurring clients',
      highlights: [
        'Shot, edited and colour graded video for 10+ recurring agency clients across brand, social and commercial formats.',
        'Led pre-production and production as Director of Photography, owning each project from brief through to final master.',
        'Composed and mixed original music for client video deliverables.',
      ],
    },
    {
      company: 'Self-employed',
      role: 'Freelance Content Producer',
      dates: 'Aug 2024 - Sep 2025',
      location: 'Doha, Qatar / Remote',
      focus: 'Independent clients · healthcare · hospitality',
      highlights: [
        'Produced social media content for a roster of independent clients across the healthcare and hospitality sectors, including medical centres and restaurants.',
        'Owned the full cycle per client — brief, concept, shoot, edit and platform-ready delivery.',
        'Managed client relationships, revisions and delivery schedules independently.',
      ],
    },
    {
      company: 'Vintage Blue Productions',
      role: 'Production Manager / Lead Video Editor',
      dates: 'Jan 2024 - Jul 2024',
      location: 'Algiers, Algeria',
      focus: 'Institutional film · documentary · digital department',
      highlights: [
        'Managed production logistics and led editing on an institutional film for Air Algérie, Algeria’s national airline.',
        'Led full post-production of the documentary “Maybe One Day” — editing, music composition, sound mixing and digital department oversight.',
      ],
    },
    {
      company: '2 Horloges Production',
      role: 'Camera Operator / Sound Engineer',
      dates: 'Jul 2023 - Dec 2023',
      location: 'Algiers, Algeria',
      focus: 'Commercial production',
      highlights: [
        'Operated camera for commercial advertisements and managed on-set sound recording and engineering.',
      ],
    },
    {
      company: 'Mediacorp Production',
      role: 'Camera Operator / Video Editor',
      dates: 'May 2023 - Jun 2023',
      location: 'Algiers, Algeria',
      focus: 'Advertising campaigns',
      highlights: [
        'Operated camera for commercial shoots and edited video content for advertising campaigns.',
      ],
    },
    {
      company: 'Ciné Rêve Production',
      role: 'Camera Operator / Post-Production & Audio Lead',
      dates: 'Dec 2021 - Apr 2023',
      location: 'Algiers, Algeria',
      focus: 'Commercials · sitcom · series',
      highlights: [
        'Sound engineer and post-production manager for the sitcom “Aziz and Lynda”; operated camera for commercial advertisements.',
        'Served as first sound assistant for the television series “Leyam”.',
      ],
    },
    {
      company: 'EL Djazair N1 TV',
      role: 'Sound Engineer',
      dates: '2019 - 2020',
      location: 'Algiers, Algeria',
      focus: 'Broadcast production',
      highlights: [
        'Handled sound engineering across channel production and post-production.',
      ],
    },
    {
      company: 'X Motion Production',
      role: 'Post-Production Manager',
      dates: 'Mar 2020 - Jul 2020',
      location: 'Algiers, Algeria',
      focus: 'Post-production workflows',
      highlights: [
        'Managed post-production workflows and deliverables from edit through delivery.',
      ],
    },
    {
      company: 'Wellcom Production',
      role: '1st Sound Assistant',
      dates: 'Aug 2021 - Nov 2021',
      location: 'Algiers, Algeria',
      focus: 'Television series · Bent Leblad',
      highlights: [
        'Provided primary sound assistance for the television series “Bent Leblad” ensuring clear audio capture.',
      ],
    },
  ] satisfies Experience[],
  skills: [
    { label: 'Cinematography', detail: 'Director of Photography · camera operation · commercial · documentary · broadcast · shot composition · focus pulling · on-set problem solving · equipment handling' },
    { label: 'Post-Production & Motion', detail: 'Editing · colour grading · motion graphics · typography · logo animation · infographics · transitions' },
    { label: 'Audio Production', detail: 'Sound design · studio & field recording · dialogue editing · mixing · mastering · music composition' },
    { label: 'Production Management', detail: 'Pre-production planning · logistics · post-production workflow management · crew coordination · client management' },
    { label: 'Software', detail: 'DaVinci Resolve · Adobe Creative Suite · Premiere Pro · After Effects · Photoshop · Illustrator · InDesign · Audition · Nuendo · AI tools' },
  ],
  languages: [
    { label: 'Arabic', detail: 'Native' },
    { label: 'English', detail: 'Proficient' },
    { label: 'French', detail: 'Proficient' },
  ],
};

export type CV = typeof cv;
