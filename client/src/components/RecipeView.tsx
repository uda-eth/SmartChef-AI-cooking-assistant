import { useState } from "react";
import { useMealPlan } from "@/hooks/use-meal-plan";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChefHat, AlertTriangle } from "lucide-react";

type Recipe = {
  name: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  prepTime: number;
  servings: number;
};

type RecipeViewProps = {
  recipe: Recipe;
};

export default function RecipeView({ recipe }: RecipeViewProps) {
  const { getSubstitutions } = useMealPlan();
  const [substitutions, setSubstitutions] = useState<Array<{ original: string; substitute: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSubstitutions = async () => {
    setIsLoading(true);
    try {
      const result = await getSubstitutions({ recipe });
      setSubstitutions(result.substitutions);
    } catch (error) {
      console.error("Failed to get substitutions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{recipe.name}</h2>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Prep time: {recipe.prepTime} minutes</span>
          <span>Servings: {recipe.servings}</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
        <ScrollArea className="h-[200px]">
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2">
                <Badge variant="outline">
                  {ingredient.quantity} {ingredient.unit}
                </Badge>
                {ingredient.name}
              </li>
            ))}
          </ul>
        </ScrollArea>

        <Button
          variant="outline"
          className="mt-4"
          onClick={handleGetSubstitutions}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ChefHat className="mr-2 h-4 w-4" />
          )}
          Find Substitutions
        </Button>

        {substitutions.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Possible Substitutions:</h4>
            <ul className="space-y-2">
              {substitutions.map((sub, index) => (
                <li key={index} className="text-sm">
                  <span className="text-gray-600">{sub.original}</span> →{" "}
                  <span className="font-medium">{sub.substitute}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Instructions</h3>
        <ScrollArea className="h-[300px]">
          <ol className="space-y-4 list-decimal list-inside">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-gray-600">
                {step}
              </li>
            ))}
          </ol>
        </ScrollArea>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Remember to always follow basic kitchen safety: wash your hands, use sharp knives carefully, and ensure food is cooked to safe temperatures.
        </p>
      </div>
    </div>
  );
}
