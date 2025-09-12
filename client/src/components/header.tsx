import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { UserSwitcher } from "./user-switcher";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b-2 border-primary-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-calculator text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-serif">Math Fact Fluency</h1>
              <p className="text-xs text-gray-600">based on Bay-Williams Framework</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
            <UserSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}