import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RecipeView from "@/components/RecipeView";
import { Clock, Loader2 } from "lucide-react";

type FavoriteRecipe = {
  id: number;
  name: string;
  instructions: string[];
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  imageUrl?: string;
  prepTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
};

export default function Favorites() {
  const { data: favorites, isLoading, error } = useQuery<FavoriteRecipe[]>({
    queryKey: ["/api/recipes/favorites"],
    // Handle errors gracefully
    onError: (error) => {
      console.error("Failed to fetch favorites:", error);
    }
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">My Favorite Recipes</h1>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">My Favorite Recipes</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Failed to load favorite recipes. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">My Favorite Recipes</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">You haven't added any favorite recipes yet.</p>
            <p className="text-gray-600 mt-2">Click the star icon on any recipe to add it to your favorites.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Favorite Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((recipe) => (
          <Card key={recipe.id}>
            <CardContent className="p-6">
              <h3 className="font-medium text-lg mb-2">{recipe.name}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>{recipe.prepTime} minutes</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p>Main ingredients:</p>
                <ul className="list-disc list-inside">
                  {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                    <li key={index}>
                      {ingredient.name}
                    </li>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <li>+{recipe.ingredients.length - 3} more</li>
                  )}
                </ul>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    View Recipe
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <RecipeView recipe={recipe} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}