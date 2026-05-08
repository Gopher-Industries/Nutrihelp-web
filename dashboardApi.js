import baseApi from "./baseApi";

const fallbackDashboard = {
  name: 'Jeramy',
  water: { currentMl: 1250, goalMl: 2200 },
  calories: { current: 1320, goal: 2000 },
  meals: { current: 3, goal: 3, items: [] },
  stats: [
    { label: 'Calories', value: '1,320', helper: '680 left' },
    { label: 'Protein', value: '82g', helper: '91% goal' },
    { label: 'Steps', value: '7,450', helper: '5.2 km' },
  ],
  carousel: [
    { id: 'meal', title: 'Plan dinner', subtitle: 'High-protein bowl', color: '#DDF2E4' },
    { id: 'scan', title: 'Scan food', subtitle: 'Check calories fast', color: '#FFF0D7' },
    { id: 'news', title: 'Health News', subtitle: 'Latest wellness tips', color: '#E3EEF9' },
  ],
};

export async function getDashboard() {
  try {
    const response = await baseApi.get("/auth/dashboard");   
    return response.data || response;   
  } catch (error) {
    console.log("⚠️ Backend error, using fallback data");
    return fallbackDashboard;
  }
}