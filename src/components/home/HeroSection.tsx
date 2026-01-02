import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, BookOpen, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "2,500+", label: "Students Trained" },
  { icon: BookOpen, value: "50+", label: "Courses Available" },
  { icon: Award, value: "95%", label: "Success Rate" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium">Enrollments Open for 2025</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Master the Skills of{" "}
              <span className="text-secondary">Tomorrow,</span>{" "}
              <span className="text-accent">Today</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl leading-relaxed">
              Industry-ready training in Web Development, Digital Marketing, and 
              Graphic Design. Learn from experts, build real projects, and launch 
              your tech career.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/courses">
                  Explore Courses
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/about">
                  <Play className="h-5 w-5" />
                  Watch Our Story
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-primary-foreground/10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <stat.icon className="h-5 w-5 text-secondary" />
                    <span className="font-display text-2xl md:text-3xl font-bold">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-sm text-primary-foreground/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative hidden lg:block animate-float">
            <div className="relative z-10 p-8">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-secondary/20 to-accent/20 backdrop-blur-lg border border-primary-foreground/10 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-8">
                  <div className="space-y-4">
                    <div className="h-32 rounded-2xl bg-secondary/30 backdrop-blur-sm animate-pulse-slow" />
                    <div className="h-24 rounded-2xl bg-accent/30 backdrop-blur-sm" />
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="h-24 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm" />
                    <div className="h-32 rounded-2xl bg-secondary/20 backdrop-blur-sm animate-pulse-slow" />
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 rounded-2xl bg-accent/40 blur-xl" />
            <div className="absolute bottom-8 left-0 w-24 h-24 rounded-full bg-secondary/30 blur-2xl" />
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
