import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Trophy, ShoppingCart, History, Sparkles, Home, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { getStudent } from "@/lib/localStorage";
import type { StudentPoints, RewardItem, StudentReward, StudentAvatar, PointTransaction } from "@shared/schema";

const STUDENT_ID = "student-1";

// Helper function to get cost from unlockCondition
function getItemCost(item: RewardItem): number {
  if (item.unlockCondition && typeof item.unlockCondition === 'object' && 'type' in item.unlockCondition) {
    const condition = item.unlockCondition as { type: string; value: number };
    return condition.type === 'points' ? condition.value : 0;
  }
  return 0;
}

export default function StudentRewards() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const currentStudent = getStudent();

  // Fetch student data
  const { data: points, isLoading: pointsLoading } = useQuery<StudentPoints>({
    queryKey: [`/api/students/${STUDENT_ID}/points`],
  });

  const { data: avatar, isLoading: avatarLoading } = useQuery<StudentAvatar>({
    queryKey: [`/api/students/${STUDENT_ID}/avatar`],
  });

  const { data: rewardItems = [], isLoading: itemsLoading } = useQuery<RewardItem[]>({
    queryKey: ["/api/reward-items"],
  });

  const { data: studentRewards = [], isLoading: rewardsLoading } = useQuery<StudentReward[]>({
    queryKey: [`/api/students/${STUDENT_ID}/rewards`],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<PointTransaction[]>({
    queryKey: [`/api/students/${STUDENT_ID}/transactions`],
  });

  // Mutations
  const unlockRewardMutation = useMutation({
    mutationFn: async (rewardItemId: string) => {
      const response = await fetch(`/api/students/${STUDENT_ID}/rewards/${rewardItemId}/unlock`, {
        method: "POST",
      });
      if (!response.ok) throw new Error('Failed to unlock reward');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${STUDENT_ID}/rewards`] });
      queryClient.invalidateQueries({ queryKey: [`/api/students/${STUDENT_ID}/points`] });
    },
  });

  const equipRewardMutation = useMutation({
    mutationFn: async (rewardItemId: string) => {
      const response = await fetch(`/api/students/${STUDENT_ID}/rewards/${rewardItemId}/equip`, {
        method: "POST",
      });
      if (!response.ok) throw new Error('Failed to equip reward');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${STUDENT_ID}/rewards`] });
      queryClient.invalidateQueries({ queryKey: [`/api/students/${STUDENT_ID}/avatar`] });
    },
  });

  const spendPointsMutation = useMutation({
    mutationFn: async ({ points: pointsToSpend, reason }: { points: number; reason: string }) => {
      const response = await fetch(`/api/students/${STUDENT_ID}/points/spend`, {
        method: "POST",
        body: JSON.stringify({ points: pointsToSpend, reason }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to spend points');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${STUDENT_ID}/points`] });
      queryClient.invalidateQueries({ queryKey: [`/api/students/${STUDENT_ID}/transactions`] });
    },
  });

  const handleUnlockReward = async (item: RewardItem) => {
    const cost = getItemCost(item);
    if (!points || points.availablePoints < cost) {
      return;
    }

    try {
      await spendPointsMutation.mutateAsync({
        points: cost,
        reason: `Unlocked ${item.name}`,
      });
      await unlockRewardMutation.mutateAsync(item.id);
    } catch (error) {
      console.error("Failed to unlock reward:", error);
    }
  };

  const handleEquipReward = async (rewardItemId: string) => {
    await equipRewardMutation.mutateAsync(rewardItemId);
  };

  const isRewardUnlocked = (itemId: string) => {
    return studentRewards.some(reward => reward.rewardItemId === itemId);
  };

  const isRewardEquipped = (itemId: string) => {
    return studentRewards.some(reward => reward.rewardItemId === itemId && reward.isEquipped);
  };

  const canAffordReward = (item: RewardItem) => {
    const cost = getItemCost(item);
    return points && points.availablePoints >= cost;
  };

  const filteredRewardItems = selectedCategory === "all" 
    ? rewardItems 
    : rewardItems.filter(item => item.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getEquippedBackground = () => {
    const equippedBackgroundReward = studentRewards.find(reward => 
      reward.isEquipped && rewardItems.find(item => 
        item.id === reward.rewardItemId && item.category === "background"
      )
    );
    
    if (equippedBackgroundReward) {
      const backgroundItem = rewardItems.find(item => item.id === equippedBackgroundReward.rewardItemId);
      if (backgroundItem?.id === "background-space-1") {
        return "bg-gradient-to-br from-purple-900 via-blue-900 to-black";
      }
      if (backgroundItem?.id === "background-ocean-1") {
        return "bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600";
      }
      if (backgroundItem?.id === "background-forest-1") {
        return "bg-gradient-to-br from-green-600 via-green-500 to-green-700";
      }
    }
    
    return "bg-gradient-to-br from-blue-400 to-purple-600"; // default
  };

  const getEquippedAccessories = () => {
    return studentRewards
      .filter(reward => reward.isEquipped)
      .map(reward => rewardItems.find(item => item.id === reward.rewardItemId))
      .filter(item => item && item.category === "accessory");
  };

  const getEquippedExpression = () => {
    const equippedExpressionReward = studentRewards.find(reward => 
      reward.isEquipped && rewardItems.find(item => 
        item.id === reward.rewardItemId && item.category === "expression"
      )
    );
    
    if (equippedExpressionReward) {
      const expressionItem = rewardItems.find(item => item.id === equippedExpressionReward.rewardItemId);
      if (expressionItem?.id === "expression-excited-1") return "😁";
      if (expressionItem?.id === "expression-happy-1") return "😊";
      if (expressionItem?.id === "expression-cool-1") return "😎";
    }
    
    return "😊"; // default
  };

  const AvatarPreview = () => {
    const backgroundClass = getEquippedBackground();
    const equippedAccessories = getEquippedAccessories();
    const expression = getEquippedExpression();

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Your Math Avatar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className={`w-32 h-32 rounded-full ${backgroundClass} flex items-center justify-center mb-4 relative overflow-hidden border-4 border-white shadow-lg`}>
            {/* Stars for space background */}
            {backgroundClass.includes("purple-900") && (
              <>
                <div className="absolute top-2 left-6 text-white text-xs">⭐</div>
                <div className="absolute top-8 right-4 text-white text-xs">✨</div>
                <div className="absolute bottom-6 left-4 text-white text-xs">⭐</div>
                <div className="absolute bottom-4 right-8 text-white text-xs">✨</div>
              </>
            )}
            
            {/* Main expression */}
            <div className="text-6xl z-10">{expression}</div>
            
            {/* Equipped accessories */}
            {equippedAccessories.map((accessory) => (
              <div key={accessory?.id} className="absolute">
                {accessory?.id === "accessory-hat-1" && (
                  <div className="absolute -top-2 text-4xl">🎩</div>
                )}
                {accessory?.id === "accessory-glasses-1" && (
                  <div className="absolute text-2xl">🤓</div>
                )}
                {accessory?.id === "accessory-bow-1" && (
                  <div className="absolute -top-1 text-3xl">🎀</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="font-semibold">{currentStudent?.name || 'Your'} Avatar</h3>
            <p className="text-sm text-muted-foreground">
              {equippedAccessories.length > 0 
                ? `Wearing ${equippedAccessories.length} item${equippedAccessories.length > 1 ? 's' : ''}` 
                : "Ready for math adventures!"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (pointsLoading || avatarLoading || itemsLoading || rewardsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading your rewards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">My Avatar & Rewards</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-lg">{points?.availablePoints || 0} points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar and Points */}
        <div className="lg:col-span-1">
          <AvatarPreview />
          
          {/* Points Display */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Math Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center mb-2">
                {points?.availablePoints || 0}
              </div>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Available Points
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Earned:</span>
                  <span>{points?.totalPoints || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Spent:</span>
                  <span>{points?.spentPoints || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Items Unlocked:</span>
                  <Badge variant="secondary">{studentRewards.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Items Equipped:</span>
                  <Badge variant="secondary">
                    {studentRewards.filter(r => r.isEquipped).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Store and History */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="store" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="store" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Reward Store
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Point History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="store" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Items
                </Button>
                <Button
                  variant={selectedCategory === "accessory" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("accessory")}
                >
                  Accessories
                </Button>
                <Button
                  variant={selectedCategory === "outfit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("outfit")}
                >
                  Outfits
                </Button>
                <Button
                  variant={selectedCategory === "background" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("background")}
                >
                  Backgrounds
                </Button>
                <Button
                  variant={selectedCategory === "expression" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("expression")}
                >
                  Expressions
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRewardItems.map((item) => {
                  const unlocked = isRewardUnlocked(item.id);
                  const equipped = isRewardEquipped(item.id);
                  const affordable = canAffordReward(item);

                  return (
                    <Card key={item.id} className="relative">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{item.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <Badge className={getRarityColor(item.rarity)}>
                            {item.rarity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">
                              {getItemCost(item)} points
                            </span>
                          </div>
                          <div>
                            {equipped ? (
                              <Badge variant="default">Equipped</Badge>
                            ) : unlocked ? (
                              <Button
                                size="sm"
                                onClick={() => handleEquipReward(item.id)}
                                disabled={equipRewardMutation.isPending}
                              >
                                Equip
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleUnlockReward(item)}
                                disabled={!affordable || unlockRewardMutation.isPending || spendPointsMutation.isPending}
                                variant={affordable ? "default" : "secondary"}
                              >
                                {affordable ? "Unlock" : "Need more points"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div>Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <p className="text-muted-foreground">No transactions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 10).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-2 border-b">
                          <div>
                            <p className="font-medium">{transaction.reason}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                          <div className={`font-semibold ${
                            transaction.points > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaction.points > 0 ? "+" : ""}{transaction.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </div>
  );
}