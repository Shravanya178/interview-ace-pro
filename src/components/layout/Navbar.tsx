import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, UserCircle, LogOut, Settings, Home } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import LanguageSelector from "@/components/layout/LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  // Helper function to capitalize the first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Resume Analysis", href: "/resume" },
    { name: "Interview Preparation", href: "/interview" },
    { name: "Mock Tests", href: "/mock-test" },
    { name: "Reports", href: "/reports" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-1 hover:opacity-90 transition-opacity">
                <span className="text-primary text-xl font-bold">
                  Interview
                </span>
                <span className="text-secondary text-xl font-bold">
                  Ace Pro
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium h-full transition-colors duration-200 ${
                    isActive(item.href)
                      ? "border-secondary text-gray-900 font-semibold"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {capitalize(item.name)}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            <LanguageSelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoUrl} alt={user.name} />
                      <AvatarFallback>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white w-56 shadow-lg rounded-md border border-gray-200">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50">
                    <Link to="/dashboard" className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>{capitalize(t("dashboard"))}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50">
                    <Link to="/profile" className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>{capitalize(t("profile"))}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50">
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{capitalize(t("settings"))}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{capitalize(t("logout"))}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" asChild className="px-4 py-2 rounded-md hover:opacity-90 transition-all">
                <Link to="/login">{capitalize(t("login"))}</Link>
              </Button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-4 pr-4 py-3 border-l-4 text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? "border-secondary text-secondary bg-secondary/10 font-semibold"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {capitalize(item.name)}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoUrl} alt={user.name} />
                      <AvatarFallback>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {capitalize(t("profile"))}
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {capitalize(t("settings"))}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    {capitalize(t("logout"))}
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4">
                <Button className="w-full py-2" asChild>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    {capitalize(t("login"))}
                  </Link>
                </Button>
              </div>
            )}
            <div className="mt-3 px-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {capitalize(t("language"))}
                </span>
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
