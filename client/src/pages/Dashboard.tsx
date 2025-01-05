import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useInventory } from "@/hooks/use-inventory";
import { useMealPlan } from "@/hooks/use-meal-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { Loader2, LogOut, Plus } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();
  const { ingredients, isLoading: isLoadingInventory } = useInventory();
  const { currentPlan, generatePlan, isLoading: isLoadingMealPlan } = useMealPlan();

  useEffect(() => {
    if (ingredients?.length === 0) {
      setLocation("/inventory");
    }
  }, [ingredients, setLocation]);

  const handleLogout = async () => {
    await logout();
  };

  const handleGeneratePlan = () => {
    generatePlan({
      mealCount: 7,
      dietary: [],
      cuisineTypes: [],
    });
  };

  if (isLoadingInventory || isLoadingMealPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}!</h1>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/inventory")}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Ingredients
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Weekly Meal Plan</h2>
                <Button onClick={handleGeneratePlan}>
                  Generate New Plan
                </Button>
              </div>
              {currentPlan ? (
                <WeeklyCalendar plan={currentPlan} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No meal plan generated yet.</p>
                  <Button onClick={handleGeneratePlan}>
                    Generate Your First Meal Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ingredients?.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="font-medium">{ingredient.name}</p>
                    <p className="text-sm text-gray-600">
                      {ingredient.quantity} {ingredient.unit}
                    </p>
                    <p className="text-xs text-gray-500">{ingredient.category}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
