import baseApi from "./baseApi";

export const mockArticles = [
  {
    id: 'hydration-basics',
    title: 'Hydration habits that actually stick',
    date: '2026-04-28',
    image:
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=900',
    summary: 'Simple ways to spread water intake through the day.',
    content:
      '<p>Hydration works best when it is attached to routines you already have. Start with water after waking, before meals, and after walks.</p><p>For most people, urine color, thirst, activity, and climate are useful daily signals.</p>',
  },
  {
    id: 'protein-breakfast',
    title: 'Building a balanced breakfast plate',
    date: '2026-04-24',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900',
    summary: 'Protein, fibre, and colour make mornings easier.',
    content:
      '<p>A balanced breakfast usually includes protein, slow carbohydrates, healthy fats, and fruit or vegetables.</p><p>Greek yogurt with oats and berries, eggs with toast and spinach, or tofu scramble are practical options.</p>',
  },
  {
    id: 'sleep-routine',
    title: 'Small sleep changes with big wellness impact',
    date: '2026-04-18',
    image:
      'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=900',
    summary: 'A calmer evening routine can support nutrition goals.',
    content:
      '<p>Sleep affects hunger hormones, energy, and food choices. A steady wind-down routine makes healthy decisions easier the next day.</p>',
  },
];

export async function getHealthArticles() {
  try {
    const response = await baseApi.get("/health/news");
    return response?.data || response?.articles || response || [];
  } catch {
    return mockArticles;
  }
}

export async function getHealthArticleById(id) {
  try {
    const response = await baseApi.get(`/health/news/${id}`);
    return response?.data || response?.article || response;
  } catch {
    return mockArticles.find((article) => article.id === id) || mockArticles[0];
  }
}
