"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Plus, 
  ArrowLeft,
  Trophy,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { GoalCard } from "@/components/goals/goal-card";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { UpdateGoalDialog } from "@/components/goals/update-goal-dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Goal {
  goal_id: string;
  title: string;
  description: string;
  category: string;
  target_date: string;
  status: string;
  progress: number;
  created_at: string;
  milestones?: Array<any>;
  updates?: Array<any>;
}

export default function GoalsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchGoals();
  }, [businessId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/me/business/${businessId}/goals`);
      if (response.data.ok) {
        setGoals(response.data.goals || []);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = (goalId: string) => {
    const goal = goals.find(g => g.goal_id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setUpdateDialogOpen(true);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    // TODO: Implémenter l'édition complète
    console.log("Edit goal:", goal);
  };

  // Filtrer et trier les objectifs
  const filteredGoals = goals
    .filter(goal => {
      if (filter === "all") return true;
      if (filter === "active") return goal.status === "active";
      if (filter === "completed") return goal.status === "completed";
      return goal.category === filter;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "progress") {
        return b.progress - a.progress;
      }
      if (sortBy === "deadline") {
        return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
      }
      return 0;
    });

  // Calculer les statistiques
  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === "active").length,
    completed: goals.filter(g => g.status === "completed").length,
    avgProgress: goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/business/${businessId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Objectifs</h1>
                <p className="text-sm text-gray-500">Gérez et suivez vos objectifs business</p>
              </div>
            </div>
            <Button 
              className="bg-violet-600 hover:bg-violet-700"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel objectif
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total objectifs</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="w-8 h-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En cours</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Complétés</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Progression moy.</p>
                  <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
              <Progress value={stats.avgProgress} className="mt-3 h-1" />
            </CardContent>
          </Card>
        </div>

        {/* Filtres et tri */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="active">En cours</TabsTrigger>
              <TabsTrigger value="completed">Complétés</TabsTrigger>
              <TabsTrigger value="revenue">Revenus</TabsTrigger>
              <TabsTrigger value="growth">Croissance</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date de création</SelectItem>
              <SelectItem value="progress">Progression</SelectItem>
              <SelectItem value="deadline">Échéance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste des objectifs */}
        {filteredGoals.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {filter === "all" 
                ? "Aucun objectif défini"
                : "Aucun objectif dans cette catégorie"
              }
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Les objectifs vous aident à rester concentré et à mesurer votre progression.
            </p>
            <Button 
              className="bg-violet-600 hover:bg-violet-700"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre premier objectif
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.goal_id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onEdit={handleEditGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        businessId={businessId}
        onSuccess={fetchGoals}
      />
      
      {selectedGoal && (
        <UpdateGoalDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          businessId={businessId}
          goalId={selectedGoal.goal_id}
          currentProgress={selectedGoal.progress}
          currentStatus={selectedGoal.status}
          onSuccess={fetchGoals}
        />
      )}
    </div>
  );
}