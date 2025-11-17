// Mock API client that uses localStorage instead of making HTTP requests
import {
  getStudent,
  getProgress,
  getObservations,
  getFactCategories,
  getGames,
  updateProgress,
  addObservation,
  getFromStorage,
  setInStorage,
  setProgress
} from './localStorage';

// REMOVED: Helper functions for rewards system

// Simulate API delay for realistic UX
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to sync progress from game results
function syncProgressFromGameResults(studentId: string) {
  // Get all game results for this student
  const allResults = getFromStorage('gameResults', []);
  const studentResults = allResults.filter((result: any) => result.studentId === studentId);
  
  if (studentResults.length === 0) {
    return; // No results to process
  }
  
  // Calculate overall metrics from all game results
  const totalGames = studentResults.length;
  const averageAccuracy = Math.round(
    studentResults.reduce((sum: number, result: any) => sum + result.accuracy, 0) / totalGames
  );
  
  // Collect all unique strategies used
  const allStrategies = new Set<string>();
  studentResults.forEach((result: any) => {
    if (result.strategiesUsed && Array.isArray(result.strategiesUsed)) {
      result.strategiesUsed.forEach((strategy: string) => allStrategies.add(strategy));
    }
  });
  
  // Calculate strategy usage percentage (more strategies = higher percentage)
  const strategyUsePercentage = Math.min(100, allStrategies.size * 15); // Each unique strategy adds 15%
  
  // Calculate efficiency based on time spent (lower time = higher efficiency)
  const avgTimeSpent = studentResults.reduce((sum: number, result: any) => sum + (result.timeSpent || 300), 0) / totalGames;
  const efficiencyPercentage = Math.max(0, Math.min(100, 100 - (avgTimeSpent - 60) / 5));
  
  // Update progress with calculated metrics
  // Using a general "overall" category - in a full implementation, this would map to specific fact categories
  updateProgress('overall-progress', {
    accuracy: averageAccuracy,
    efficiency: Math.round(efficiencyPercentage),
    flexibility: averageAccuracy, // Use accuracy as a proxy for flexibility
    strategyUse: strategyUsePercentage,
    phase: averageAccuracy >= 90 ? 'mastery' : averageAccuracy >= 70 ? 'deriving' : 'counting',
    lastPracticed: new Date()
  });
}

export const mockApi = {
  // Student endpoints
  async getStudent(id: string) {
    await delay();
    return getStudent();
  },

  // Progress endpoints
  async getStudentProgress(studentId: string) {
    await delay();
    return getProgress();
  },

  async updateStudentProgress(studentId: string, categoryId: string, updates: any) {
    await delay();
    updateProgress(categoryId, updates);
    return { success: true };
  },

  // REMOVED: Points, Rewards, Avatar, and Transaction endpoints
  // These features were removed to simplify the app and focus on strategy practice

  // Observation endpoints
  async getObservations(studentId: string) {
    await delay();
    return getObservations();
  },

  async createObservation(observation: any) {
    await delay();
    addObservation(observation);
    return { success: true };
  },

  // Static data endpoints

  async getFactCategories() {
    await delay();
    return getFactCategories();
  },

  async getGames() {
    await delay();
    return getGames();
  },

  // Game Results endpoints
  async createGameResult(data: any) {
    await delay();
    // Add to localStorage game results
    const results: any[] = getFromStorage('gameResults', []);
    const newResult = {
      id: `result-${Date.now()}`,
      studentId: data.studentId,
      gameId: data.gameId,
      score: data.score,
      accuracy: data.accuracy,
      timeSpent: data.timeSpent,
      strategiesUsed: data.strategiesUsed || [],
      completedAt: new Date()
    };
    results.unshift(newResult);
    setInStorage('gameResults', results);
    
    // Automatically sync progress metrics from all game results
    syncProgressFromGameResults(data.studentId);
    
    // REMOVED: Points awarding - no longer using reward system
    
    return newResult;
  },

  async getGameResults(studentId: string) {
    await delay();
    const results = getFromStorage('gameResults', []);
    return results.filter((result: any) => result.studentId === studentId);
  }
};