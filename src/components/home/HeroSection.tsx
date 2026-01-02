import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Star, Users } from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero min-h-[90vh] flex items-center">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Squiggly line left */}
        <svg
          className="absolute left-8 top-32 w-16 h-16 text-secondary/30"
          viewBox="0 0 64 64"
          fill="none"
        >
          <path
            d="M8 32C16 24 24 40 32 32C40 24 48 40 56 32"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Star icon */}
        <Star className="absolute right-[45%] top-24 w-8 h-8 text-accent/60" />

        {/* Dashed curved line top right */}
        <svg
          className="absolute right-0 top-0 w-96 h-96 text-secondary/20"
          viewBox="0 0 384 384"
          fill="none"
        >
          <path
            d="M384 0C384 212 212 384 0 384"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
        </svg>

        {/* Bottom squiggly line */}
        <svg
          className="absolute left-32 bottom-24 w-20 h-20 text-secondary/30"
          viewBox="0 0 80 80"
          fill="none"
        >
          <path
            d="M8 40C20 32 28 48 40 40C52 32 60 48 72 40"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Blue curved shape behind image */}
        <div className="absolute right-0 top-0 w-[55%] h-full">
          <svg
            className="absolute right-0 top-0 h-full w-full"
            viewBox="0 0 600 700"
            fill="none"
            preserveAspectRatio="xMaxYMid slice"
          >
            <path
              d="M200 0H600V700H200C200 700 100 600 100 350C100 100 200 0 200 0Z"
              className="fill-secondary"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-6 animate-slide-up">
            <span className="text-secondary font-medium text-lg">
              Online E-Learning Courses
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary-foreground">
              <span className="text-secondary">Creating</span> a Better Future{" "}
              <br className="hidden md:block" />
              through Education
            </h1>

            <p className="text-lg text-primary-foreground/70 max-w-md leading-relaxed">
              Industry-ready training in Web Development, Digital Marketing, and
              Graphic Design. Learn from experts and launch your tech career.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 rounded-full"
                asChild
              >
                <Link to="/courses">All Courses</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8 rounded-full"
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>

            {/* Avatar Stack */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {avatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Student ${index + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                  />
                ))}
              </div>
              <span className="text-primary-foreground font-medium">
                24k + Happy Students
              </span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            {/* Main Image */}
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Students learning together"
                className="w-full max-w-lg ml-auto rounded-3xl shadow-2xl object-cover aspect-[4/5]"
              />

              {/* Floating Stats Card - Top */}
              <div className="absolute -left-8 top-16 bg-card rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-float">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-foreground">2.5k</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>

              {/* Floating Stats Card - Bottom */}
              <div className="absolute -right-4 bottom-8 bg-card rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-float" style={{ animationDelay: "1s" }}>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-foreground">50+</p>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
