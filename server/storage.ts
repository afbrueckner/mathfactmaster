import { 
  type Student, 
  type InsertStudent,
  type FactCategory,
  type StudentProgress,
  type InsertStudentProgress,
  type Game,
  type GameResult,
  type InsertGameResult,
  type AssessmentObservation,
  type InsertAssessmentObservation,
  type QuickLooksSession,
  type InsertQuickLooksSession,
  type SelfAssessment,
  type InsertSelfAssessment,
  type StudentAvatar,
  type InsertStudentAvatar,
  type RewardItem,
  type InsertRewardItem,
  type StudentReward,
  type InsertStudentReward,
  type StudentPoints,
  type InsertStudentPoints,
  type PointTransaction,
  type InsertPointTransaction,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Students
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Fact Categories
  getFactCategories(): Promise<FactCategory[]>;
  getFactCategoriesByOperation(operation: string): Promise<FactCategory[]>;
  
  // Student Progress
  getStudentProgress(studentId: string): Promise<StudentProgress[]>;
  getStudentProgressByCategory(studentId: string, factCategoryId: string): Promise<StudentProgress | undefined>;
  updateStudentProgress(progress: InsertStudentProgress): Promise<StudentProgress>;
  
  // Games
  getGames(): Promise<Game[]>;
  getGamesByCategory(category: string): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  
  // Game Results
  saveGameResult(result: InsertGameResult): Promise<GameResult>;
  getGameResults(studentId: string): Promise<GameResult[]>;
  
  // Assessment Observations
  saveObservation(observation: InsertAssessmentObservation): Promise<AssessmentObservation>;
  getObservations(studentId: string): Promise<AssessmentObservation[]>;
  
  // Quick Looks Sessions
  saveQuickLooksSession(session: InsertQuickLooksSession): Promise<QuickLooksSession>;
  getQuickLooksSessions(studentId: string): Promise<QuickLooksSession[]>;
  
  // Self Assessments
  saveSelfAssessment(assessment: InsertSelfAssessment): Promise<SelfAssessment>;
  getSelfAssessments(studentId: string): Promise<SelfAssessment[]>;
  updateSelfAssessment(id: string, updates: Partial<InsertSelfAssessment>): Promise<SelfAssessment>;
  
  // Avatar system
  getStudentAvatar(studentId: string): Promise<StudentAvatar | undefined>;
  createStudentAvatar(avatar: InsertStudentAvatar): Promise<StudentAvatar>;
  updateStudentAvatar(studentId: string, updates: Partial<StudentAvatar>): Promise<StudentAvatar>;
  
  getRewardItems(): Promise<RewardItem[]>;
  getStudentRewards(studentId: string): Promise<StudentReward[]>;
  unlockReward(studentId: string, rewardItemId: string): Promise<StudentReward>;
  equipReward(studentId: string, rewardItemId: string): Promise<StudentReward>;
  
  getStudentPoints(studentId: string): Promise<StudentPoints>;
  addPoints(studentId: string, points: number, reason: string, category: string, metadata?: any): Promise<StudentPoints>;
  spendPoints(studentId: string, points: number, reason: string): Promise<StudentPoints>;
  getPointTransactions(studentId: string): Promise<PointTransaction[]>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private factCategories: Map<string, FactCategory>;
  private studentProgress: Map<string, StudentProgress>;
  private games: Map<string, Game>;
  private gameResults: Map<string, GameResult>;
  private observations: Map<string, AssessmentObservation>;
  private quickLooksSessions: Map<string, QuickLooksSession>;
  private selfAssessments: Map<string, SelfAssessment>;
  private avatars: Map<string, StudentAvatar>;
  private rewardItems: Map<string, RewardItem>;
  private studentRewards: Map<string, StudentReward>;
  private studentPoints: Map<string, StudentPoints>;
  private pointTransactions: Map<string, PointTransaction>;

  constructor() {
    this.students = new Map();
    this.factCategories = new Map();
    this.studentProgress = new Map();
    this.games = new Map();
    this.gameResults = new Map();
    this.observations = new Map();
    this.quickLooksSessions = new Map();
    this.selfAssessments = new Map();
    this.avatars = new Map();
    this.rewardItems = new Map();
    this.studentRewards = new Map();
    this.studentPoints = new Map();
    this.pointTransactions = new Map();
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // No default students - users start with clean slate

    // Initialize fact categories
    const factCategoriesData: FactCategory[] = [
      {
        id: "add-plus-minus-1-2",
        operation: "addition",
        category: "foundational",
        name: "+/- 1 or 2",
        description: "Adding or subtracting 1 or 2",
        examples: ["3+1", "7+2", "9-1", "5-2"],
        phase: "counting"
      },
      {
        id: "add-doubles",
        operation: "addition",
        category: "foundational",
        name: "Doubles",
        description: "Adding the same number to itself",
        examples: ["2+2", "6+6", "8+8", "9+9"],
        phase: "counting"
      },
      {
        id: "add-combinations-10",
        operation: "addition",
        category: "foundational",
        name: "Combinations of 10",
        description: "Number pairs that sum to 10",
        examples: ["3+7", "8+2", "5+5", "4+6"],
        phase: "deriving"
      },
      {
        id: "add-10-plus",
        operation: "addition",
        category: "foundational",
        name: "10 + facts",
        description: "Adding 10 to single digits",
        examples: ["10+3", "10+7", "10+9", "10+5"],
        phase: "deriving"
      },
      {
        id: "mult-2-5-10",
        operation: "multiplication",
        category: "foundational",
        name: "2s, 5s, 10s",
        description: "Multiplication by 2, 5, and 10",
        examples: ["7×2", "6×5", "8×10", "4×5"],
        phase: "counting"
      },
      {
        id: "mult-0-1",
        operation: "multiplication",
        category: "foundational",
        name: "0s, 1s",
        description: "Multiplication by 0 and 1",
        examples: ["6×0", "9×1", "1×8", "0×5"],
        phase: "counting"
      },
      {
        id: "mult-squares",
        operation: "multiplication",
        category: "foundational",
        name: "Squares",
        description: "Multiplying a number by itself",
        examples: ["3×3", "7×7", "9×9", "4×4"],
        phase: "deriving"
      }
    ];

    factCategoriesData.forEach(category => {
      this.factCategories.set(category.id, category);
    });

    // Initialize games
    const gamesData: Game[] = [
      {
        id: "racing-bears",
        name: "Racing Bears",
        description: "Practice +0, +1, +2 facts with racing theme",
        operation: "addition",
        category: "foundational",
        targetFacts: ["+0", "+1", "+2"],
        emoji: "🐻",
        difficulty: "beginner"
      },
      {
        id: "doubles-bingo",
        name: "Doubles Bingo",
        description: "Master doubles facts with bingo gameplay",
        operation: "addition",
        category: "foundational",
        targetFacts: ["doubles"],
        emoji: "🎯",
        difficulty: "beginner"
      },
      {
        id: "trios",
        name: "Trios",
        description: "Practice multiplication facts by making trios",
        operation: "multiplication",
        category: "foundational",
        targetFacts: ["×2", "×5", "×10"],
        emoji: "🎲",
        difficulty: "intermediate"
      },
      {
        id: "sum-war",
        name: "Sum War",
        description: "Battle with addition using derived strategies",
        operation: "addition",
        category: "derived",
        targetFacts: ["near doubles", "making ten"],
        emoji: "⚔️",
        difficulty: "intermediate"
      },
      {
        id: "salute",
        name: "Salute!",
        description: "Practice fact families with missing addends",
        operation: "mixed",
        category: "derived",
        targetFacts: ["fact families", "missing addends"],
        emoji: "👋",
        difficulty: "intermediate"
      },
      {
        id: "three-dice-take",
        name: "Three Dice Take",
        description: "Multi-operation practice with strategic thinking",
        operation: "mixed",
        category: "advanced",
        targetFacts: ["all operations"],
        emoji: "🎲",
        difficulty: "advanced"
      }
    ];

    gamesData.forEach(game => {
      this.games.set(game.id, game);
    });

    // Initialize reward items
    const rewardItemsData: RewardItem[] = [
      {
        id: "accessory-hat-1",
        name: "Math Wizard Hat",
        category: "accessory",
        type: "hat",
        description: "A magical hat for math masters",
        icon: "🎩",
        unlockCondition: { points: 50, type: "points" },
        rarity: "common",
        createdAt: new Date(),
      },
      {
        id: "accessory-glasses-1",
        name: "Smart Glasses",
        category: "accessory",
        type: "glasses",
        description: "Look smart while solving problems",
        icon: "🤓",
        unlockCondition: { points: 30, type: "points" },
        rarity: "common",
        createdAt: new Date(),
      },
      {
        id: "outfit-superhero-1",
        name: "Math Hero Cape",
        category: "outfit",
        type: "cape",
        description: "Show off your math superpowers",
        icon: "🦸",
        unlockCondition: { points: 100, type: "points" },
        rarity: "rare",
        createdAt: new Date(),
      },
      {
        id: "background-space-1",
        name: "Space Station",
        category: "background",
        type: "space",
        description: "Practice math among the stars",
        icon: "🚀",
        unlockCondition: { points: 75, type: "points" },
        rarity: "rare",
        createdAt: new Date(),
      },
      {
        id: "expression-excited-1",
        name: "Excited Expression",
        category: "expression",
        type: "excited",
        description: "Show how excited you are about math",
        icon: "😁",
        unlockCondition: { points: 25, type: "points" },
        rarity: "common",
        createdAt: new Date(),
      },
    ];
    rewardItemsData.forEach(item => {
      this.rewardItems.set(item.id, item);
    });

    // Initialize default avatar and some starter rewards for the default student
    const defaultAvatar: StudentAvatar = {
      id: randomUUID(),
      studentId: "student-1",
      avatarType: "character",
      baseColor: "#4F46E5",
      accessories: [],
      outfit: "casual",
      expression: "happy",
      background: "classroom",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.avatars.set(defaultAvatar.id, defaultAvatar);

    // Give the default student some starting points
    const defaultPoints: StudentPoints = {
      id: randomUUID(),
      studentId: "student-1",
      totalPoints: 150,
      spentPoints: 0,
      availablePoints: 150,
      updatedAt: new Date(),
    };
    this.studentPoints.set(defaultPoints.id, defaultPoints);

    // Add a welcome transaction
    const welcomeTransaction: PointTransaction = {
      id: randomUUID(),
      studentId: "student-1",
      points: 150,
      reason: "Welcome bonus!",
      category: "welcome",
      createdAt: new Date(),
    };
    this.pointTransactions.set(welcomeTransaction.id, welcomeTransaction);

    // Initialize sample progress data
    const progressData: StudentProgress[] = [
      {
        id: "progress-1",
        studentId: "student-1",
        factCategoryId: "add-plus-minus-1-2",
        phase: "mastery",
        accuracy: 95,
        efficiency: 90,
        flexibility: 80,
        strategyUse: 85,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "progress-2",
        studentId: "student-1",
        factCategoryId: "add-doubles",
        phase: "mastery",
        accuracy: 92,
        efficiency: 88,
        flexibility: 85,
        strategyUse: 90,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "progress-3",
        studentId: "student-1",
        factCategoryId: "add-combinations-10",
        phase: "deriving",
        accuracy: 80,
        efficiency: 70,
        flexibility: 75,
        strategyUse: 78,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "progress-4",
        studentId: "student-1",
        factCategoryId: "mult-2-5-10",
        phase: "mastery",
        accuracy: 88,
        efficiency: 85,
        flexibility: 80,
        strategyUse: 82,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      }
    ];

    progressData.forEach(progress => {
      this.studentProgress.set(progress.id, progress);
    });
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      ...insertStudent, 
      id,
      createdAt: new Date()
    };
    this.students.set(id, student);
    return student;
  }

  async getFactCategories(): Promise<FactCategory[]> {
    return Array.from(this.factCategories.values());
  }

  async getFactCategoriesByOperation(operation: string): Promise<FactCategory[]> {
    return Array.from(this.factCategories.values()).filter(
      category => category.operation === operation
    );
  }

  async getStudentProgress(studentId: string): Promise<StudentProgress[]> {
    return Array.from(this.studentProgress.values()).filter(
      progress => progress.studentId === studentId
    );
  }

  async getStudentProgressByCategory(studentId: string, factCategoryId: string): Promise<StudentProgress | undefined> {
    return Array.from(this.studentProgress.values()).find(
      progress => progress.studentId === studentId && progress.factCategoryId === factCategoryId
    );
  }

  async updateStudentProgress(insertProgress: InsertStudentProgress): Promise<StudentProgress> {
    const existing = await this.getStudentProgressByCategory(
      insertProgress.studentId, 
      insertProgress.factCategoryId
    );

    if (existing) {
      const updated: StudentProgress = {
        ...existing,
        ...insertProgress,
        updatedAt: new Date(),
      };
      this.studentProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const progress: StudentProgress = {
        ...insertProgress,
        id,
        accuracy: insertProgress.accuracy ?? 0,
        efficiency: insertProgress.efficiency ?? 0,
        flexibility: insertProgress.flexibility ?? 0,
        strategyUse: insertProgress.strategyUse ?? 0,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      };
      this.studentProgress.set(id, progress);
      return progress;
    }
  }

  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGamesByCategory(category: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      game => game.category === category
    );
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async saveGameResult(insertResult: InsertGameResult): Promise<GameResult> {
    const id = randomUUID();
    const result: GameResult = {
      ...insertResult,
      id,
      completedAt: new Date(),
    };
    this.gameResults.set(id, result);
    return result;
  }

  async getGameResults(studentId: string): Promise<GameResult[]> {
    return Array.from(this.gameResults.values()).filter(
      result => result.studentId === studentId
    );
  }

  async saveObservation(insertObservation: InsertAssessmentObservation): Promise<AssessmentObservation> {
    const id = randomUUID();
    const observation: AssessmentObservation = {
      ...insertObservation,
      id,
      createdAt: new Date(),
    };
    this.observations.set(id, observation);
    return observation;
  }

  async getObservations(studentId: string): Promise<AssessmentObservation[]> {
    return Array.from(this.observations.values()).filter(
      observation => observation.studentId === studentId
    );
  }

  async saveQuickLooksSession(insertSession: InsertQuickLooksSession): Promise<QuickLooksSession> {
    const id = randomUUID();
    const session: QuickLooksSession = {
      ...insertSession,
      id,
      completedAt: new Date(),
    };
    this.quickLooksSessions.set(id, session);
    return session;
  }

  async getQuickLooksSessions(studentId: string): Promise<QuickLooksSession[]> {
    return Array.from(this.quickLooksSessions.values()).filter(
      session => session.studentId === studentId
    );
  }

  async saveSelfAssessment(insertAssessment: InsertSelfAssessment): Promise<SelfAssessment> {
    const id = randomUUID();
    const assessment: SelfAssessment = {
      ...insertAssessment,
      id,
      createdAt: new Date(),
      notes: insertAssessment.notes || null,
    };
    this.selfAssessments.set(id, assessment);
    return assessment;
  }

  async getSelfAssessments(studentId: string): Promise<SelfAssessment[]> {
    return Array.from(this.selfAssessments.values()).filter(
      assessment => assessment.studentId === studentId
    );
  }

  async updateSelfAssessment(id: string, updates: Partial<InsertSelfAssessment>): Promise<SelfAssessment> {
    const existing = this.selfAssessments.get(id);
    if (!existing) {
      throw new Error(`Self assessment with id ${id} not found`);
    }
    
    const updated: SelfAssessment = {
      ...existing,
      ...updates,
    };
    this.selfAssessments.set(id, updated);
    return updated;
  }

  // Avatar system methods
  async getStudentAvatar(studentId: string): Promise<StudentAvatar | undefined> {
    return Array.from(this.avatars.values()).find(avatar => avatar.studentId === studentId);
  }

  async createStudentAvatar(insertAvatar: InsertStudentAvatar): Promise<StudentAvatar> {
    const id = randomUUID();
    const avatar: StudentAvatar = {
      ...insertAvatar,
      id,
      accessories: insertAvatar.accessories || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.avatars.set(id, avatar);
    return avatar;
  }

  async updateStudentAvatar(studentId: string, updates: Partial<StudentAvatar>): Promise<StudentAvatar> {
    const existing = Array.from(this.avatars.values()).find(avatar => avatar.studentId === studentId);
    if (!existing) {
      throw new Error(`Avatar for student ${studentId} not found`);
    }
    
    const updated: StudentAvatar = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.avatars.set(existing.id, updated);
    return updated;
  }

  async getRewardItems(): Promise<RewardItem[]> {
    return Array.from(this.rewardItems.values());
  }

  async getStudentRewards(studentId: string): Promise<StudentReward[]> {
    return Array.from(this.studentRewards.values()).filter(reward => reward.studentId === studentId);
  }

  async unlockReward(studentId: string, rewardItemId: string): Promise<StudentReward> {
    const id = randomUUID();
    const reward: StudentReward = {
      id,
      studentId,
      rewardItemId,
      unlockedAt: new Date(),
      isEquipped: false,
    };
    this.studentRewards.set(id, reward);
    return reward;
  }

  async equipReward(studentId: string, rewardItemId: string): Promise<StudentReward> {
    const rewardItem = this.rewardItems.get(rewardItemId);
    if (!rewardItem) {
      throw new Error("Reward item not found");
    }

    // Unequip other items in the same category first
    Array.from(this.studentRewards.values()).forEach(reward => {
      if (reward.studentId === studentId && reward.isEquipped) {
        const item = this.rewardItems.get(reward.rewardItemId);
        if (item && item.category === rewardItem.category) {
          reward.isEquipped = false;
          this.studentRewards.set(reward.id, reward);
        }
      }
    });

    // Equip the new item
    const reward = Array.from(this.studentRewards.values()).find(r => 
      r.studentId === studentId && r.rewardItemId === rewardItemId
    );
    if (!reward) {
      throw new Error("Reward not unlocked");
    }
    reward.isEquipped = true;
    this.studentRewards.set(reward.id, reward);
    return reward;
  }

  async getStudentPoints(studentId: string): Promise<StudentPoints> {
    let points = Array.from(this.studentPoints.values()).find(p => p.studentId === studentId);
    if (!points) {
      const id = randomUUID();
      points = {
        id,
        studentId,
        totalPoints: 0,
        spentPoints: 0,
        availablePoints: 0,
        updatedAt: new Date(),
      };
      this.studentPoints.set(id, points);
    }
    return points;
  }

  async addPoints(studentId: string, points: number, reason: string, category: string, metadata?: any): Promise<StudentPoints> {
    const studentPointsData = await this.getStudentPoints(studentId);
    
    // Update points
    studentPointsData.totalPoints += points;
    studentPointsData.availablePoints += points;
    studentPointsData.updatedAt = new Date();
    this.studentPoints.set(studentPointsData.id, studentPointsData);

    // Record transaction
    const transactionId = randomUUID();
    const transaction: PointTransaction = {
      id: transactionId,
      studentId,
      points,
      reason,
      category,
      metadata,
      createdAt: new Date(),
    };
    this.pointTransactions.set(transactionId, transaction);

    return studentPointsData;
  }

  async spendPoints(studentId: string, points: number, reason: string): Promise<StudentPoints> {
    const studentPointsData = await this.getStudentPoints(studentId);
    
    if (studentPointsData.availablePoints < points) {
      throw new Error("Insufficient points");
    }

    studentPointsData.spentPoints += points;
    studentPointsData.availablePoints -= points;
    studentPointsData.updatedAt = new Date();
    this.studentPoints.set(studentPointsData.id, studentPointsData);

    // Record transaction
    const transactionId = randomUUID();
    const transaction: PointTransaction = {
      id: transactionId,
      studentId,
      points: -points,
      reason,
      category: 'purchase',
      createdAt: new Date(),
    };
    this.pointTransactions.set(transactionId, transaction);

    return studentPointsData;
  }

  async getPointTransactions(studentId: string): Promise<PointTransaction[]> {
    return Array.from(this.pointTransactions.values())
      .filter(transaction => transaction.studentId === studentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
