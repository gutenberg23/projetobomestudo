import { Subject } from '../types/subjects';

export const subjects: Subject[] = [
  {
    name: 'Mathematics',
    rating: 4.5,
    lessons: [
      {
        id: 'math-lesson-1',
        title: 'Introduction to Algebra',
        description: 'Learn the basics of algebraic expressions and equations.',
        rating: '4.2',
        sections: [
          { id: 'math-sec-1', title: 'Variables and Constants', isActive: true },
          { id: 'math-sec-2', title: 'Expressions', isActive: false },
        ],
        question: {
          id: 'math-q-1',
          year: '2022',
          institution: 'Example University',
          organization: 'Math Department',
          role: 'Professor',
          content: 'Solve for x: 2x + 3 = 7',
          options: [
            { id: 'math-opt-1', text: 'x = 1', isCorrect: false },
            { id: 'math-opt-2', text: 'x = 2', isCorrect: true },
            { id: 'math-opt-3', text: 'x = 3', isCorrect: false },
          ],
          comments: [
            {
              id: 'math-comment-1',
              author: 'Alice',
              avatar: 'alice.jpg',
              content: 'Great explanation!',
              timestamp: '2024-01-20',
              likes: 5,
            },
          ],
        },
      },
      {
        id: 'math-lesson-2',
        title: 'Geometry Fundamentals',
        description: 'Explore basic geometric shapes and theorems.',
        rating: '4.0',
        sections: [
          { id: 'geo-sec-1', title: 'Triangles', isActive: true },
          { id: 'geo-sec-2', title: 'Circles', isActive: false },
        ],
        question: {
          id: 'geo-q-1',
          year: '2022',
          institution: 'Example University',
          organization: 'Math Department',
          role: 'Professor',
          content: 'What is the area of a circle with radius 5?',
          options: [
            { id: 'geo-opt-1', text: '10π', isCorrect: false },
            { id: 'geo-opt-2', text: '25π', isCorrect: true },
            { id: 'geo-opt-3', text: '50π', isCorrect: false },
          ],
          comments: [
            {
              id: 'geo-comment-1',
              author: 'Bob',
              avatar: 'bob.jpg',
              content: 'Very helpful lesson.',
              timestamp: '2024-01-21',
              likes: 3,
            },
          ],
        },
      },
    ],
  },
  {
    name: 'Science',
    rating: 4.2,
    lessons: [
      {
        id: 'science-lesson-1',
        title: 'Introduction to Biology',
        description: 'Discover the basics of living organisms and their functions.',
        rating: '4.5',
        sections: [
          { id: 'bio-sec-1', title: 'Cells', isActive: true },
          { id: 'bio-sec-2', title: 'Genetics', isActive: false },
        ],
        question: {
          id: 'bio-q-1',
          year: '2022',
          institution: 'Example University',
          organization: 'Science Department',
          role: 'Professor',
          content: 'What is the powerhouse of the cell?',
          options: [
            { id: 'bio-opt-1', text: 'Nucleus', isCorrect: false },
            { id: 'bio-opt-2', text: 'Mitochondria', isCorrect: true },
            { id: 'bio-opt-3', text: 'Ribosome', isCorrect: false },
          ],
          comments: [
            {
              id: 'bio-comment-1',
              author: 'Charlie',
              avatar: 'charlie.jpg',
              content: 'Excellent introduction!',
              timestamp: '2024-01-22',
              likes: 7,
            },
          ],
        },
      },
      {
        id: 'science-lesson-2',
        title: 'Basics of Chemistry',
        description: 'Learn about atoms, molecules, and chemical reactions.',
        rating: '4.3',
        sections: [
          { id: 'chem-sec-1', title: 'Atoms', isActive: true },
          { id: 'chem-sec-2', title: 'Molecules', isActive: false },
        ],
        question: {
          id: 'chem-q-1',
          year: '2022',
          institution: 'Example University',
          organization: 'Science Department',
          role: 'Professor',
          content: 'What is the chemical symbol for water?',
          options: [
            { id: 'chem-opt-1', text: 'CO2', isCorrect: false },
            { id: 'chem-opt-2', text: 'H2O', isCorrect: true },
            { id: 'chem-opt-3', text: 'O2', isCorrect: false },
          ],
          comments: [
            {
              id: 'chem-comment-1',
              author: 'David',
              avatar: 'david.jpg',
              content: 'Clear and concise.',
              timestamp: '2024-01-23',
              likes: 4,
            },
          ],
        },
      },
    ],
  },
  {
    name: 'History',
    rating: 4.0,
    lessons: [
      {
        id: 'history-lesson-1',
        title: 'World War I',
        description: 'An overview of the causes, events, and consequences of World War I.',
        rating: '3.9',
        sections: [
          { id: 'hist-sec-1', title: 'Causes of the War', isActive: true },
          { id: 'hist-sec-2', title: 'Key Battles', isActive: false },
        ],
        question: {
          id: 'hist-q-1',
          year: '2022',
          institution: 'Example University',
          organization: 'History Department',
          role: 'Professor',
          content: 'When did World War I begin?',
          options: [
            { id: 'hist-opt-1', text: '1914', isCorrect: true },
            { id: 'hist-opt-2', text: '1917', isCorrect: false },
            { id: 'hist-opt-3', text: '1939', isCorrect: false },
          ],
          comments: [
            {
              id: 'hist-comment-1',
              author: 'Eve',
              avatar: 'eve.jpg',
              content: 'Informative and well-structured.',
              timestamp: '2024-01-24',
              likes: 6,
            },
          ],
        },
      },
      {
        id: 'history-lesson-2',
        title: 'The Renaissance',
        description: 'Explore the cultural, artistic, and intellectual changes during the Renaissance.',
        rating: '4.1',
        sections: [
          { id: 'ren-sec-1', title: 'Art and Architecture', isActive: true },
          { id: 'ren-sec-2', title: 'Key Figures', isActive: false },
        ],
        question: {
          id: 'ren-q-1',
          year: '2022',
          institution: 'Example University',
          organization: 'History Department',
          role: 'Professor',
          content: 'Who painted the Mona Lisa?',
          options: [
            { id: 'ren-opt-1', text: 'Michelangelo', isCorrect: false },
            { id: 'ren-opt-2', text: 'Leonardo da Vinci', isCorrect: true },
            { id: 'ren-opt-3', text: 'Raphael', isCorrect: false },
          ],
          comments: [
            {
              id: 'ren-comment-1',
              author: 'Frank',
              avatar: 'frank.jpg',
              content: 'Great overview of the Renaissance.',
              timestamp: '2024-01-25',
              likes: 5,
            },
          ],
        },
      },
    ],
  },
];
