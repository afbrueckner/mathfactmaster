// Local storage utilities for browser-based data persistence
import type { 
  Student, 
  StudentProgress, 
  StudentPoints, 
  StudentReward, 
  StudentAvatar, 
  PointTransaction,
  RewardItem,
  FactCategory,
  Game
} from '@shared/schema';

// Storage keys
const STORAGE_KEYS = {
  STUDENT: 'math-fluency-student',
  PROGRESS: 'math-fluency-progress',
  POINTS: 'math-fluency-points',
  REWARDS: 'math-fluency-rewards',
  AVATAR: 'math-fluency-avatar',
  TRANSACTIONS: 'math-fluency-transactions',
  OBSERVATIONS: 'math-fluency-observations',
  STUDENTS_LIST: 'math-fluency-students-list',
  CURRENT_STUDENT: 'math-fluency-current-student'
} as const;

// Generate scoped storage key for multi-user support
function getScopedKey(baseKey: string, studentId: string): string {
  return `${baseKey}-${studentId}`;
}

// Helper functions
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setInStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Current student management
export function getCurrentStudentId(): string {
  return getFromStorage(STORAGE_KEYS.CURRENT_STUDENT, "");
}

export function setCurrentStudentId(studentId: string): void {
  setInStorage(STORAGE_KEYS.CURRENT_STUDENT, studentId);
}

// Students list management
export function getAllStudents(): Student[] {
  return getFromStorage(STORAGE_KEYS.STUDENTS_LIST, []);
}

export function addStudent(student: Student): void {
  const students = getAllStudents();
  const existingIndex = students.findIndex(s => s.id === student.id);
  
  if (existingIndex >= 0) {
    students[existingIndex] = student;
  } else {
    students.push(student);
  }
  
  setInStorage(STORAGE_KEYS.STUDENTS_LIST, students);
}

export function removeStudent(studentId: string): void {
  const students = getAllStudents().filter(s => s.id !== studentId);
  setInStorage(STORAGE_KEYS.STUDENTS_LIST, students);
  
  // Clean up student data
  const keys = Object.values(STORAGE_KEYS);
  keys.forEach(key => {
    if (key !== STORAGE_KEYS.STUDENTS_LIST && key !== STORAGE_KEYS.CURRENT_STUDENT) {
      localStorage.removeItem(getScopedKey(key, studentId));
    }
  });
  
  // Switch to another student if current was deleted
  const currentId = getCurrentStudentId();
  if (currentId === studentId && students.length > 0) {
    setCurrentStudentId(students[0].id);
  }
}

// Student data (scoped to current user)
export function getStudent(): Student | null {
  const currentId = getCurrentStudentId();
  if (!currentId) return null;
  
  const students = getAllStudents();
  return students.find(s => s.id === currentId) || null;
}

export function setStudent(student: Student): void {
  addStudent(student);
}

// Progress data (scoped to current user)
export function getProgress(): StudentProgress[] {
  const currentId = getCurrentStudentId();
  if (!currentId) return [];
  
  const key = getScopedKey(STORAGE_KEYS.PROGRESS, currentId);
  return getFromStorage(key, []);
}

export function setProgress(progress: StudentProgress[]): void {
  const currentId = getCurrentStudentId();
  const key = getScopedKey(STORAGE_KEYS.PROGRESS, currentId);
  setInStorage(key, progress);
}

export function updateProgress(categoryId: string, updates: Partial<StudentProgress>): void {
  const currentId = getCurrentStudentId();
  const progress = getProgress();
  const index = progress.findIndex(p => p.factCategoryId === categoryId);
  
  if (index >= 0) {
    progress[index] = { ...progress[index], ...updates };
  } else {
    progress.push({
      id: `progress-${Date.now()}`,
      studentId: currentId,
      factCategoryId: categoryId,
      phase: "counting",
      accuracy: 0,
      efficiency: 0,
      flexibility: 0,
      strategyUse: 0,
      lastPracticed: new Date(),
      updatedAt: new Date(),
      ...updates
    });
  }
  
  setProgress(progress);
}

// Points data (scoped to current user)
export function getPoints(): StudentPoints | null {
  const currentId = getCurrentStudentId();
  if (!currentId) return null;
  
  const key = getScopedKey(STORAGE_KEYS.POINTS, currentId);
  return getFromStorage(key, null);
}

export function setPoints(points: StudentPoints): void {
  const currentId = getCurrentStudentId();
  const key = getScopedKey(STORAGE_KEYS.POINTS, currentId);
  setInStorage(key, points);
}

export function addPoints(amount: number, reason: string): void {
  const points = getPoints();
  const newPoints = {
    ...points,
    totalPoints: points.totalPoints + amount,
    availablePoints: points.availablePoints + amount,
    updatedAt: new Date()
  };
  setPoints(newPoints);
  
  // Add transaction
  addTransaction(amount, reason);
}

export function spendPoints(amount: number, reason: string): boolean {
  const points = getPoints();
  if (points.availablePoints >= amount) {
    const newPoints = {
      ...points,
      spentPoints: points.spentPoints + amount,
      availablePoints: points.availablePoints - amount,
      updatedAt: new Date()
    };
    setPoints(newPoints);
    addTransaction(-amount, reason);
    return true;
  }
  return false;
}

// Transactions (scoped to current user)
export function getTransactions(): PointTransaction[] {
  const currentId = getCurrentStudentId();
  const key = getScopedKey(STORAGE_KEYS.TRANSACTIONS, currentId);
  return getFromStorage(key, []);
}

export function addTransaction(points: number, reason: string): void {
  const currentId = getCurrentStudentId();
  const transactions = getTransactions();
  transactions.unshift({
    id: `transaction-${Date.now()}`,
    studentId: currentId,
    category: points > 0 ? "earned" : "spent",
    points,
    reason,
    metadata: {},
    createdAt: new Date()
  });
  const key = getScopedKey(STORAGE_KEYS.TRANSACTIONS, currentId);
  setInStorage(key, transactions);
}

// Rewards (scoped to current user)
export function getStudentRewards(): StudentReward[] {
  const currentId = getCurrentStudentId();
  const key = getScopedKey(STORAGE_KEYS.REWARDS, currentId);
  return getFromStorage(key, []);
}

export function setStudentRewards(rewards: StudentReward[]): void {
  const currentId = getCurrentStudentId();
  const key = getScopedKey(STORAGE_KEYS.REWARDS, currentId);
  setInStorage(key, rewards);
}

export function unlockReward(rewardItemId: string): StudentReward {
  const currentId = getCurrentStudentId();
  const rewards = getStudentRewards();
  const newReward: StudentReward = {
    id: `reward-${Date.now()}`,
    studentId: currentId,
    rewardItemId,
    isEquipped: false,
    unlockedAt: new Date()
  };
  rewards.push(newReward);
  setStudentRewards(rewards);
  return newReward;
}

export function equipReward(rewardItemId: string, category: string): void {
  const rewards = getStudentRewards();
  
  // Unequip other items in the same category
  rewards.forEach(reward => {
    if (reward.isEquipped) {
      const item = getRewardItems().find(item => item.id === reward.rewardItemId);
      if (item?.category === category) {
        reward.isEquipped = false;
      }
    }
  });
  
  // Equip the new item
  const reward = rewards.find(r => r.rewardItemId === rewardItemId);
  if (reward) {
    reward.isEquipped = true;
  }
  
  setStudentRewards(rewards);
}

// Avatar (scoped to current user)
export function getAvatar(): StudentAvatar | null {
  const currentId = getCurrentStudentId();
  if (!currentId) return null;
  
  const key = getScopedKey(STORAGE_KEYS.AVATAR, currentId);
  return getFromStorage(key, null);
}

export function setAvatar(avatar: StudentAvatar): void {
  const currentId = getCurrentStudentId();
  const key = getScopedKey(STORAGE_KEYS.AVATAR, currentId);
  setInStorage(key, avatar);
}

// Observations (scoped to current user)
export function getObservations(): any[] {
  const currentId = getCurrentStudentId();
  const key = getScopedKey(STORAGE_KEYS.OBSERVATIONS, currentId);
  return getFromStorage(key, []);
}

export function addObservation(observation: any): void {
  const currentId = getCurrentStudentId();
  const observations = getObservations();
  observations.unshift({
    ...observation,
    id: `obs-${Date.now()}`,
    createdAt: new Date()
  });
  const key = getScopedKey(STORAGE_KEYS.OBSERVATIONS, currentId);
  setInStorage(key, observations);
}

// Static data (these don't change, so we can define them here)
export function getRewardItems(): RewardItem[] {
  return [
    {
      id: "background-space-1",
      name: "Space Station",
      category: "background",
      type: "space",
      description: "Explore the cosmos with this stellar background!",
      icon: null,
      unlockCondition: { type: "points", value: 50 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "background-ocean-1",
      name: "Ocean Paradise",
      category: "background",
      type: "ocean",
      description: "Dive into learning with ocean waves!",
      icon: null,
      unlockCondition: { type: "points", value: 50 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "background-forest-1",
      name: "Forest Adventure",
      category: "background",
      type: "forest",
      description: "Nature-inspired learning environment!",
      icon: null,
      unlockCondition: { type: "points", value: 50 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "expression-excited-1",
      name: "Super Excited",
      category: "expression",
      type: "excited",
      description: "Show your enthusiasm for math!",
      icon: null,
      unlockCondition: { type: "points", value: 25 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "expression-happy-1",
      name: "Happy Face",
      category: "expression",
      type: "happy",
      description: "Spread positive math vibes!",
      icon: null,
      unlockCondition: { type: "points", value: 25 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "expression-cool-1",
      name: "Cool & Confident",
      category: "expression",
      type: "cool",
      description: "Math is cool, and so are you!",
      icon: null,
      unlockCondition: { type: "points", value: 25 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "accessory-hat-1",
      name: "Math Wizard Hat",
      category: "accessory",
      type: "hat",
      description: "Channel your inner math wizard!",
      icon: null,
      unlockCondition: { type: "points", value: 75 },
      rarity: "rare",
      createdAt: new Date()
    },
    {
      id: "accessory-glasses-1",
      name: "Smart Glasses",
      category: "accessory",
      type: "glasses",
      description: "Look smart while solving problems!",
      icon: null,
      unlockCondition: { type: "points", value: 40 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "accessory-bow-1",
      name: "Victory Bow",
      category: "accessory",
      type: "bow",
      description: "Celebrate your math achievements!",
      icon: null,
      unlockCondition: { type: "points", value: 60 },
      rarity: "rare",
      createdAt: new Date()
    }
  ];
}

export function getFactCategories(): FactCategory[] {
  return [
    {
      id: "add-plus-minus-1-2",
      operation: "addition",
      category: "foundational",
      name: "Plus 1, Plus 2",
      description: "Adding 1 and 2 to numbers",
      examples: ["1+1", "2+1", "3+1", "4+1", "5+1", "1+2", "2+2", "3+2", "4+2", "5+2"],
      phase: "mastery"
    },
    {
      id: "add-doubles",
      operation: "addition",
      category: "foundational",
      name: "Doubles Facts",
      description: "Adding a number to itself",
      examples: ["1+1", "2+2", "3+3", "4+4", "5+5", "6+6", "7+7", "8+8", "9+9"],
      phase: "mastery"
    },
    {
      id: "mult-2s-5s-10s",
      operation: "multiplication",
      category: "foundational",
      name: "2s, 5s, and 10s",
      description: "Multiplication by 2, 5, and 10",
      examples: ["2×1", "2×2", "2×3", "5×1", "5×2", "5×3", "10×1", "10×2", "10×3"],
      phase: "deriving"
    }
  ];
}

export function getGames(): Game[] {
  return [
    {
      id: "racing-bears",
      name: "Racing Bears",
      description: "Help the bears race by solving addition facts quickly! Students take turns solving facts to move their bear forward.",
      operation: "addition",
      category: "foundational",
      targetFacts: ["1+1", "2+1", "3+1", "1+2", "2+2", "3+2", "4+1", "5+1", "6+1", "7+1", "8+1", "9+1"],
      emoji: "🐻",
      difficulty: "beginner"
    },
    {
      id: "doubles-bingo",
      name: "Doubles Bingo",
      description: "Classic bingo game focused on doubles facts. Mark spaces as you solve doubles problems!",
      operation: "addition",
      category: "foundational",
      targetFacts: ["1+1", "2+2", "3+3", "4+4", "5+5", "6+6", "7+7", "8+8", "9+9"],
      emoji: "🎯",
      difficulty: "beginner"
    },
    {
      id: "sum-war",
      name: "Sum War",
      description: "Card game where players compare sums. Higher sum wins the round!",
      operation: "addition",
      category: "derived",
      targetFacts: ["3+4", "5+6", "7+8", "4+5", "6+7", "8+9", "2+9", "3+8"],
      emoji: "⚔️",
      difficulty: "intermediate"
    },
    {
      id: "trios",
      name: "Trios",
      description: "Find three numbers that make the target sum. Great for developing addition fluency!",
      operation: "addition",
      category: "derived",
      targetFacts: ["combinations to 10", "combinations to 15", "combinations to 20"],
      emoji: "🔢",
      difficulty: "intermediate"
    },
    {
      id: "salute",
      name: "Salute",
      description: "Partner game where one player guesses the missing addend. Builds part-whole understanding!",
      operation: "addition",
      category: "derived",
      targetFacts: ["missing addends", "part-whole relationships"],
      emoji: "👋",
      difficulty: "intermediate"
    },
    {
      id: "three-dice-take",
      name: "Three Dice Take",
      description: "Roll three dice and use addition and subtraction to reach target numbers!",
      operation: "mixed",
      category: "advanced",
      targetFacts: ["mixed addition", "mixed subtraction", "strategic thinking"],
      emoji: "🎲",
      difficulty: "advanced"
    }
  ];
}

