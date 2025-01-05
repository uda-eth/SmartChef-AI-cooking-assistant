import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RecipeView from "./RecipeView";
import { Clock, Star, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Meal = {
  id?: number;
  name: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  prepTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
};

type MealCardProps = {
  meal: Meal;
  day: string;
};

export default function MealCard({ meal, day }: MealCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to check if recipe is in favorites
  const { data: favorites = [] } = useQuery<Array<{ id: number }>>({
    queryKey: ["/api/recipes/favorites"],
  });

  const isFavorite = favorites.some(fav => fav.id === meal.id);

  // Mutation for toggling favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!meal.id) {
        // Save the recipe first if it doesn't have an ID
        const response = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(meal),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const savedRecipe = await response.json();
        meal.id = savedRecipe.id;
      }

      const response = await fetch(`/api/recipes/favorite/${meal.id}`, {
        method: isFavorite ? 'DELETE' : 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/favorites"] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite ? "Recipe removed from your favorites" : "Recipe added to your favorites",
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

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{day}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavoriteMutation.mutate()}
          disabled={toggleFavoriteMutation.isPending}
          className={`${isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'} transition-colors`}
        >
          {toggleFavoriteMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="font-medium">{meal.name}</h3>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>{meal.prepTime} minutes</span>
          </div>

          <div className="text-sm text-gray-600">
            <p>Main ingredients:</p>
            <ul className="list-disc list-inside">
              {meal.ingredients.slice(0, 3).map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name}
                </li>
              ))}
              {meal.ingredients.length > 3 && (
                <li>+{meal.ingredients.length - 3} more</li>
              )}
            </ul>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                View Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <RecipeView recipe={meal} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}