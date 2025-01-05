import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InsertIngredient, SelectIngredient } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export function useInventory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ingredients, isLoading } = useQuery<SelectIngredient[]>({
    queryKey: ["/api/ingredients"],
  });

  const addIngredient = useMutation({
    mutationFn: async (ingredient: Omit<InsertIngredient, "userId">) => {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredient),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      toast({
        title: "Success",
        description: "Ingredient added to inventory",
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

  return {
    ingredients,
    isLoading,
    addIngredient: addIngredient.mutate,
  };
}
