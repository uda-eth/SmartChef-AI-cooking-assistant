import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SelectMealPlan } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

type MealPlanPreferences = {
  dietary?: string[];
  cuisineTypes?: string[];
  mealCount: number;
};

export function useMealPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: currentPlan, isLoading } = useQuery<SelectMealPlan>({
    queryKey: ["/api/meal-plan/current"],
  });

  const generatePlan = useMutation({
    mutationFn: async (preferences: MealPlanPreferences) => {
      const response = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plan/current"] });
      toast({
        title: "Success",
        description: "New meal plan generated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSubstitutions = useMutation({
    mutationFn: async ({
      recipe,
    }: {
      recipe: {
        name: string;
        ingredients: Array<{ name: string; quantity: number; unit: string }>;
      };
    }) => {
      const response = await fetch("/api/recipe/substitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
  });

  return {
    currentPlan,
    isLoading,
    generatePlan: generatePlan.mutate,
    getSubstitutions: getSubstitutions.mutateAsync,
  };
}
