export type Experience = {
  company: string;
  role: string;
  dates: string;
  location: string;
  focus: string;
  highlights: string[];
};

export const fallbackCv = {
  name: 'Marouane Bouakba',
  role: 'Content Producer · Video Editor · Director of Photography',
  location: 'Doha, Qatar',
  phone: '+974 7027 3027',
  email: 'bouakbamarouane@gmail.com',
  portfolio: 'https://mega.nz/folder/Wq4Q0T4K#giNkfTvU4BpdZ86JJHaqaQ',
  intro: 'Content producer with 7 years of end-to-end production across advertising, broadcast, documentary and branded social content, in Algeria and Qatar. Builds short-form and campaign video from brief to final master — camera, edit, colour, motion and full audio post. Native Arabic, English and French; based in Doha, available across the GCC.',
  education: {
    school: 'ISMAS',
    detail: 'Institut Supérieur des Métiers des Arts du Spectacle',
    degree: "Bachelor's Degree in Visual Arts",
    location: 'Algiers, Algeria',
  },
  experience: [
    {
      company: 'Al Asmakh Real Estate Development',
      role: 'Director of Photography / Video Editor',
      dates: 'Jul 2026 - Sep 2026',
      location: 'Doha, Qatar',
      focus: 'Residential developments · advertising campaigns',
      highlights: [
        'Shot and edited two advertising campaigns for Al Asmakh residential developments — Paramount Residence and Les Maisons Blanches.',
        'Owned production end to end, from brief and shot planning through edit, colour grade and final master delivery.',
      ],
    },
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
  ],
  skills: [
    { label: 'Cinematography', detail: 'Director of Photography · camera operation · commercial · documentary · broadcast · shot composition · focus pulling · on-set problem solving · equipment handling' },
    { label: 'Post-Production & Motion', detail: 'Editing · colour grading · motion graphics · typography · logo animation · infographics · transitions' },
    { label: 'Audio Production', detail: 'Sound design · studio & field recording · dialogue editing · mixing · mastering · music composition' },
    { label: 'Production Management', detail: 'Pre-production planning · logistics · post-production workflow management · crew coordination · client management' },
    { label: 'Software', detail: 'DaVinci Resolve · Premiere Pro · After Effects · Photoshop · Illustrator · InDesign · Audition · Nuendo · AI tools' },
  ],
  languages: [
    { label: 'Arabic', detail: 'Native' },
    { label: 'English', detail: 'Proficient' },
    { label: 'French', detail: 'Proficient' },
  ],
};
