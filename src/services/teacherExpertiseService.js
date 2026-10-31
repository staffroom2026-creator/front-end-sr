export const TEACHER_EXPERTISE_CATEGORIES = [
  {
    key: 'teachingSkills',
    title: 'Teaching Skills',
    description: 'Key skills used in your teaching practice.',
    defaults: ['Lesson Planning', 'Classroom Management', 'Student Assessment', 'Differentiated Instruction'],
  },
  {
    key: 'curriculumExperience',
    title: 'Curriculum & Examination Experience',
    description: 'Curricula and examinations you are familiar with.',
    defaults: ['Nigerian Curriculum', 'WAEC', 'NECO', 'JSCE', 'Cambridge (Lower Secondary)'],
  },
  {
    key: 'classroomTools',
    title: 'Digital & Classroom Tools',
    description: 'Digital platforms and classroom tools you use.',
    defaults: ['Google Classroom', 'Microsoft Office', 'Zoom', 'PowerPoint', 'Interactive Whiteboards'],
  },
  {
    key: 'languages',
    title: 'Languages',
    description: 'Languages you can teach in or communicate with.',
    defaults: ['English — Fluent', 'Igbo — Basic'],
  },
];

export const normalizeTeacherExpertise = (value) =>
  Object.fromEntries(
    TEACHER_EXPERTISE_CATEGORIES.map(({ key, defaults }) => {
      const items = value?.[key];
      return [
        key,
        Array.isArray(items)
          ? [...new Set(items.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean))]
          : [...defaults],
      ];
    }),
  );

export const toTeacherExpertisePayload = (value) => normalizeTeacherExpertise(value);

export const createTeacherExpertiseAdapter = ({ loadCategories, saveCategories }) => ({
  load: async () => normalizeTeacherExpertise(await loadCategories()),
  save: async (value) => normalizeTeacherExpertise(await saveCategories(toTeacherExpertisePayload(value))),
});
