import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Megaphone, Palette, Clock, Users, Star } from "lucide-react";

const courses = [
  {
    id: "web-development",
    icon: Code,
    title: "Web Development",
    description:
      "Master frontend and backend development with modern technologies like React, Node.js, and more.",
    duration: "6 months",
    students: "850+",
    rating: "4.9",
    color: "secondary",
    tags: ["React", "Node.js", "TypeScript", "Databases"],
  },
  {
    id: "digital-marketing",
    icon: Megaphone,
    title: "Digital Marketing",
    description:
      "Learn SEO, social media marketing, content strategy, and paid advertising to drive business growth.",
    duration: "4 months",
    students: "720+",
    rating: "4.8",
    color: "accent",
    tags: ["SEO", "Social Media", "Analytics", "Ads"],
  },
  {
    id: "graphic-design",
    icon: Palette,
    title: "Graphic Design",
    description:
      "Create stunning visuals with industry tools. Master branding, UI/UX design, and motion graphics.",
    duration: "5 months",
    students: "630+",
    rating: "4.9",
    color: "primary",
    tags: ["UI/UX", "Branding", "Figma", "Motion"],
  },
];

export function CoursesOverview() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4">
            Our Programs
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Industry-Ready <span className="text-secondary">Courses</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose your path in tech. Our hands-on courses combine theory with 
            real-world projects, preparing you for immediate employment.
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card
              key={course.id}
              className="group relative overflow-hidden border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  course.color === "secondary"
                    ? "bg-secondary"
                    : course.color === "accent"
                    ? "bg-accent"
                    : "bg-primary"
                }`}
              />

              <CardHeader className="pb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    course.color === "secondary"
                      ? "bg-secondary/10 text-secondary"
                      : course.color === "accent"
                      ? "bg-accent/10 text-accent"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <course.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-secondary transition-colors">
                  {course.title}
                </h3>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent fill-accent" />
                    <span>{course.rating}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link to={`/courses#${course.id}`}>
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/courses">
              View All Courses
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
