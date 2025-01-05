import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Heart, PackageSearch } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-background">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex h-16 items-center space-x-4">
          <Link href="/">
            <Button variant={location === "/" ? "default" : "ghost"}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/favorites">
            <Button variant={location === "/favorites" ? "default" : "ghost"}>
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </Button>
          </Link>
          <Link href="/inventory">
            <Button variant={location === "/inventory" ? "default" : "ghost"}>
              <PackageSearch className="h-4 w-4 mr-2" />
              Inventory
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
