import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, Search, Bell, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/", hasDropdown: false },
  { name: "Courses", path: "/courses", hasDropdown: true },
  { name: "About", path: "/about", hasDropdown: false },
  { name: "Contact", path: "/contact", hasDropdown: false },
];

const courseCategories = [
  { name: "Web Development", path: "/courses?category=web" },
  { name: "Digital Marketing", path: "/courses?category=marketing" },
  { name: "Graphic Design", path: "/courses?category=design" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div
        className={`container mx-auto transition-all duration-300 ${
          scrolled
            ? "bg-card/95 backdrop-blur-xl shadow-lg rounded-full px-6"
            : "bg-card rounded-full px-6 shadow-md"
        }`}
      >
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-secondary text-secondary-foreground group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Tecmarsign
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <DropdownMenu key={link.path}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-muted ${
                        location.pathname === link.path
                          ? "text-secondary"
                          : "text-foreground"
                      }`}
                    >
                      {link.name}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="z-50 bg-card border border-border shadow-lg rounded-xl mt-2"
                  >
                    {courseCategories.map((category) => (
                      <DropdownMenuItem key={category.path} asChild>
                        <Link
                          to={category.path}
                          className="cursor-pointer px-4 py-2 hover:bg-muted rounded-lg"
                        >
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-muted ${
                    location.pathname === link.path
                      ? "text-secondary"
                      : "text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-muted transition-colors text-foreground">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-muted transition-colors text-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full font-medium border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
              asChild
            >
              <Link to="/login">Login / Register</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground rounded-full hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden mt-2 mx-auto container">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-secondary/10 text-secondary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                <Button
                  variant="outline"
                  asChild
                  className="w-full rounded-full border-secondary text-secondary"
                >
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Login / Register
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
