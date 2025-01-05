import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RecipeView from "@/components/RecipeView";
import { Clock } from "lucide-react";

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
  const { data: favorites, isLoading } = useQuery<FavoriteRecipe[]>({
    queryKey: ["/api/recipes/favorites"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-[300px] animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
