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
  role: 'Visual artist / cinematographer / editor',
  location: 'Doha, Qatar',
  phone: '+974 7027 3027',
  email: 'bouakbamarouane@gmail.com',
  portfolio: 'https://mega.nz/folder/Wq4Q0T4K#giNkfTvU4BpdZ86JJHaqaQ',
  intro: 'I build image-led stories from first frame to final mix, moving fluidly between camera, edit, sound and design.',
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
        'Managed pre-production and production for a range of client projects.',
        'Shot, edited and color-graded work for more than 10 recurring agency clients.',
        'Composed and mixed music for videos across multiple client briefs.',
        'Maintained production software and equipment workflows.',
      ],
    },
    {
      company: 'Vintage Blue Productions',
      role: 'Production Manager / Main Video Editor',
      dates: 'Jan 2024 - Jul 2024',
      location: 'Algiers, Algeria',
      focus: 'Institutional film · documentary · digital department',
      highlights: [
        'Managed production logistics and led the edit for an Air Algérie institutional film.',
        'Worked as video editor, music composer, head of digital and sound mixer on One Day Documentary.',
        'Owned comprehensive post-production, sound mixing and digital department delivery.',
      ],
    },
    {
      company: '2 Horloges Production',
      role: 'Camera Operator / Sound Engineer',
      dates: 'Jul 2023 - Dec 2023',
      location: 'Algiers, Algeria',
      focus: 'Commercial production',
      highlights: [
        'Operated camera for commercial advertisements with a focus on high-quality visual capture.',
        'Managed sound recording and engineering on set.',
      ],
    },
    {
      company: 'Mediacorp Production',
      role: 'Camera Operator / Video Editor',
      dates: 'May 2023 - Jun 2023',
      location: 'Algiers, Algeria',
      focus: 'Advertising campaigns',
      highlights: [
        'Served as camera operator for commercial shoots.',
        'Edited video content for advertising campaigns.',
      ],
    },
    {
      company: 'Ciné Rêve Production',
      role: 'Camera Operator / Sound Engineer / Post Production Manager / 1st Sound Assistant',
      dates: 'Dec 2021 - Apr 2023',
      location: 'Algiers, Algeria',
      focus: 'Commercials · sitcom · series',
      highlights: [
        'Operated camera for commercial advertisements.',
        'Worked as sound engineer and post-production manager on the sitcom Aziz and Lynda.',
        'Served as 1st sound assistant on the Leyam series.',
      ],
    },
    {
      company: 'Wellcom Production',
      role: '1st Sound Assistant',
      dates: 'Aug 2021 - Nov 2021',
      location: 'Algiers, Algeria',
      focus: 'Television series · Bent Leblad',
      highlights: [
        'Provided primary sound assistance for Bent Leblad, ensuring clear audio capture.',
      ],
    },
    {
      company: 'X Motion Production',
      role: 'Post Production Manager',
      dates: 'Mar 2020 - Jul 2020',
      location: 'Algiers, Algeria',
      focus: 'Post-production workflows',
      highlights: [
        'Managed post-production workflows and deliverables from edit through delivery.',
      ],
    },
    {
      company: 'EL Djazair N1 TV',
      role: 'Sound Engineer (Channel Production / Post Production)',
      dates: 'Sep 2019 - Feb 2020',
      location: 'Algiers, Algeria',
      focus: 'Broadcast production',
      highlights: [
        'Handled sound engineering across channel production and post-production.',
      ],
    },
  ] satisfies Experience[],
  skills: [
    { label: 'Camera operation', detail: 'Focus pulling · shot composition · on-set problem-solving · equipment handling' },
    { label: 'Edit & motion', detail: 'Typography · logos · transitions · infographics · branded formats' },
    { label: 'Design direction', detail: 'Static graphics · layouts · illustration · print · digital · social · events' },
    { label: 'Sound', detail: 'Studio & field recording · sound design · editing · mixing · mastering' },
    { label: 'Software', detail: 'DaVinci Resolve · Adobe Creative Suite · Nuendo · Topaz AI · Canva Pro' },
  ],
  languages: [
    { label: 'Arabic', detail: 'Native' },
    { label: 'English', detail: 'Proficient' },
    { label: 'French', detail: 'Proficient' },
  ],
};

export type CV = typeof cv;
