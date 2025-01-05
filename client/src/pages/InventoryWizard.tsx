import { useState } from "react";
import { useInventory } from "@/hooks/use-inventory";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight, Plus } from "lucide-react";

const CATEGORIES = ["Produce", "Meat", "Dairy", "Pantry", "Spices", "Other"];
const UNITS = ["pieces", "grams", "kilograms", "cups", "tablespoons", "teaspoons"];

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
};

export default function InventoryWizard() {
  const [, setLocation] = useLocation();
  const { addIngredient, isLoading } = useInventory();
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({
    name: "",
    quantity: 0,
    unit: "",
    category: "",
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const handleAddIngredient = () => {
    if (currentIngredient.name && currentIngredient.quantity && currentIngredient.unit && currentIngredient.category) {
      addIngredient(currentIngredient);
      setIngredients([...ingredients, currentIngredient]);
      setCurrentIngredient({
        name: "",
        quantity: 0,
        unit: "",
        category: "",
      });
    }
  };

  const handleComplete = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Let's Stock Your Kitchen!</h1>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Ingredient Name</Label>
                  <Input
                    value={currentIngredient.name}
                    onChange={(e) =>
                      setCurrentIngredient({ ...currentIngredient, name: e.target.value })
                    }
                    placeholder="e.g., Tomatoes"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={currentIngredient.quantity || ""}
                      onChange={(e) =>
                        setCurrentIngredient({
                          ...currentIngredient,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label>Unit</Label>
                    <Select
                      value={currentIngredient.unit}
                      onValueChange={(value) =>
                        setCurrentIngredient({ ...currentIngredient, unit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={currentIngredient.category}
                    onValueChange={(value) =>
                      setCurrentIngredient({ ...currentIngredient, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAddIngredient} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Ingredient
              </Button>
            </div>
          </CardContent>
        </Card>

        {ingredients.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Added Ingredients:</h3>
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {ingredient.quantity} {ingredient.unit} {ingredient.name} ({ingredient.category})
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Button onClick={handleComplete} className="w-full" variant="default">
          Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
