import { SelectMealPlan } from "@db/schema";
import MealCard from "./MealCard";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type WeeklyCalendarProps = {
  plan: SelectMealPlan;
};

export default function WeeklyCalendar({ plan }: WeeklyCalendarProps) {
  const meals = (plan.meals as any).meals;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {DAYS.map((day, index) => {
        const meal = meals[index];
        if (!meal) return null;

        return <MealCard key={day} day={day} meal={meal} />;
      })}
    </div>
  );
}
