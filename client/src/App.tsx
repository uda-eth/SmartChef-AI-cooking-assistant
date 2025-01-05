import { Switch, Route, useLocation } from "wouter";
import { useUser } from "./hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import InventoryWizard from "./pages/InventoryWizard";
import Favorites from "./pages/Favorites";
import Navigation from "./components/Navigation";

function App() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-screen-xl mx-auto">
        <Switch>
          <Route path="/inventory" component={InventoryWizard} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/" component={Dashboard} />
        </Switch>
      </main>
    </div>
  );
}

export default App;