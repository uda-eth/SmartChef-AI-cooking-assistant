import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RecipeView from "./RecipeView";
import { Clock } from "lucide-react";

type Meal = {
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

type MealCardProps = {
  meal: Meal;
  day: string;
};

export default function MealCard({ meal, day }: MealCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{day}</CardTitle>
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
