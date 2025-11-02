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
  setInStorage
} from './localStorage';

// REMOVED: Helper functions for rewards system

// Simulate API delay for realistic UX
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

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
    
    // REMOVED: Points awarding - no longer using reward system
    
    return newResult;
  },

  async getGameResults(studentId: string) {
    await delay();
    const results = getFromStorage('gameResults', []);
    return results.filter((result: any) => result.studentId === studentId);
  }
};