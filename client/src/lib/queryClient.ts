import { QueryClient } from "@tanstack/react-query";
import { mockApi } from "./mockApi";

// Map API endpoints to mock functions
const apiRouteMap: Record<string, (params?: any) => Promise<any>> = {
  // Student endpoints  
  '/api/students/current': () => mockApi.getStudent('current'),
  '/api/students/student-1': () => mockApi.getStudent('student-1'),
  
  // Progress endpoints
  '/api/students/student-1/progress': () => mockApi.getStudentProgress('student-1'),
  
  // Points endpoints
  '/api/students/student-1/points': () => mockApi.getStudentPoints('student-1'),
  
  // Rewards endpoints
  '/api/students/student-1/rewards': () => mockApi.getStudentRewards('student-1'),
  
  // Avatar endpoints
  '/api/students/student-1/avatar': () => mockApi.getStudentAvatar('student-1'),
  
  // Transaction endpoints
  '/api/students/student-1/transactions': () => mockApi.getStudentTransactions('student-1'),
  
  // Observation endpoints
  '/api/observations/student-1': () => mockApi.getObservations('student-1'),
  '/api/students/student-1/observations': () => mockApi.getObservations('student-1'),
  
  // Static data endpoints
  '/api/reward-items': () => mockApi.getRewardItems(),
  '/api/fact-categories': () => mockApi.getFactCategories(),
  '/api/games': () => mockApi.getGames(),
  
  // Game results
  '/api/students/student-1/game-results': () => mockApi.getGameResults('student-1'),
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const mockFn = apiRouteMap[url];
        
        if (mockFn) {
          return await mockFn();
        }
        
        // Fallback for unknown routes
        console.warn(`No mock implementation for: ${url}`);
        return null;
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;
  
  // Handle POST requests for spending points
  if (url === '/api/students/student-1/points/spend' && method === 'POST') {
    return await mockApi.spendStudentPoints('student-1', body.amount, body.reason);
  }
  
  // Handle POST requests for adding points
  if (url === '/api/students/student-1/points/add' && method === 'POST') {
    return await mockApi.addStudentPoints('student-1', body.amount, body.reason);
  }
  
  // Handle POST requests for unlocking rewards
  if (url.includes('/rewards/') && url.includes('/unlock') && method === 'POST') {
    const rewardItemId = url.split('/rewards/')[1].split('/unlock')[0];
    return await mockApi.unlockStudentReward('student-1', rewardItemId);
  }
  
  // Handle POST requests for equipping rewards
  if (url.includes('/rewards/') && url.includes('/equip') && method === 'POST') {
    const rewardItemId = url.split('/rewards/')[1].split('/equip')[0];
    return await mockApi.equipStudentReward('student-1', rewardItemId);
  }
  
  // Handle POST requests for observations
  if (url === '/api/observations' && method === 'POST') {
    return await mockApi.createObservation(body);
  }
  
  // Handle POST requests for student observations
  if (url === '/api/students/student-1/observations' && method === 'POST') {
    return await mockApi.createObservation(body);
  }
  
  // Handle POST requests for progress updates
  if (url.includes('/progress/') && method === 'POST') {
    const categoryId = url.split('/progress/')[1];
    return await mockApi.updateStudentProgress('student-1', categoryId, body);
  }
  
  // Handle POST requests for game results
  if (url === '/api/students/student-1/game-results' && method === 'POST') {
    return await mockApi.createGameResult(body);
  }
  
  // For GET requests, use the query function
  const mockFn = apiRouteMap[url];
  if (mockFn) {
    return await mockFn();
  }
  
  throw new Error(`No mock implementation for: ${method} ${url}`);
}
