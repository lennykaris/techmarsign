import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  Code,
  Megaphone,
  Palette,
  Clock,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Building2,
} from "lucide-react";

const courses = [
  {
    id: "web-development",
    icon: Code,
    title: "Web Development",
    tagline: "Build the Future of the Web",
    description:
      "Master full-stack web development with modern technologies. Learn to build responsive, scalable web applications from scratch.",
    duration: "6 months",
    students: "850+",
    rating: "4.9",
    color: "secondary",
    phases: [
      {
        name: "Foundation",
        duration: "6 weeks",
        topics: ["HTML5 & CSS3", "JavaScript Fundamentals", "Git & Version Control", "Responsive Design"],
      },
      {
        name: "Frontend Mastery",
        duration: "8 weeks",
        topics: ["React.js", "TypeScript", "State Management", "API Integration"],
      },
      {
        name: "Backend Development",
        duration: "8 weeks",
        topics: ["Node.js & Express", "Databases (SQL & NoSQL)", "Authentication", "RESTful APIs"],
      },
      {
        name: "Career Launch",
        duration: "4 weeks",
        topics: ["Portfolio Projects", "Code Reviews", "Interview Prep", "Job Placement"],
      },
    ],
    outcomes: [
      "Build full-stack web applications",
      "Work with modern frameworks and tools",
      "Deploy and maintain production apps",
      "Collaborate using industry practices",
    ],
  },
  {
    id: "digital-marketing",
    icon: Megaphone,
    title: "Digital Marketing",
    tagline: "Drive Growth in the Digital Age",
    description:
      "Learn to create and execute data-driven marketing strategies. Master SEO, social media, content marketing, and paid advertising.",
    duration: "4 months",
    students: "720+",
    rating: "4.8",
    color: "accent",
    phases: [
      {
        name: "Marketing Fundamentals",
        duration: "4 weeks",
        topics: ["Digital Strategy", "Customer Journey", "Brand Positioning", "Market Research"],
      },
      {
        name: "Content & SEO",
        duration: "6 weeks",
        topics: ["Content Strategy", "SEO & SEM", "Keyword Research", "Analytics"],
      },
      {
        name: "Social & Paid Media",
        duration: "6 weeks",
        topics: ["Social Media Marketing", "Facebook & Google Ads", "Email Marketing", "Conversion Optimization"],
      },
      {
        name: "Career Launch",
        duration: "2 weeks",
        topics: ["Campaign Portfolio", "Certifications", "Interview Prep", "Job Placement"],
      },
    ],
    outcomes: [
      "Create comprehensive marketing strategies",
      "Run profitable advertising campaigns",
      "Analyze and optimize performance",
      "Build and engage audiences",
    ],
  },
  {
    id: "graphic-design",
    icon: Palette,
    title: "Graphic Design",
    tagline: "Create Visual Impact",
    description:
      "Master visual design principles and industry-standard tools. Create stunning graphics, brand identities, and user interfaces.",
    duration: "5 months",
    students: "630+",
    rating: "4.9",
    color: "primary",
    phases: [
      {
        name: "Design Foundations",
        duration: "4 weeks",
        topics: ["Design Principles", "Color Theory", "Typography", "Composition"],
      },
      {
        name: "Digital Tools",
        duration: "6 weeks",
        topics: ["Adobe Creative Suite", "Figma", "Vector Graphics", "Photo Editing"],
      },
      {
        name: "Specialization",
        duration: "8 weeks",
        topics: ["Brand Identity", "UI/UX Design", "Motion Graphics", "Print Design"],
      },
      {
        name: "Career Launch",
        duration: "2 weeks",
        topics: ["Portfolio Development", "Client Projects", "Interview Prep", "Job Placement"],
      },
    ],
    outcomes: [
      "Create professional brand identities",
      "Design user-friendly interfaces",
      "Produce motion graphics",
      "Work with clients professionally",
    ],
  },
];

export default function Courses() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Our Programs
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Transform Your Career with{" "}
              <span className="text-secondary">Industry-Ready</span> Skills
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Choose from our comprehensive courses in Technology, Marketing, and Design. 
              Each program is designed to take you from beginner to job-ready professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#courses">
                  Explore Courses
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Get Guidance</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Modes */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                <Monitor className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Online Learning</h3>
                <p className="text-sm text-muted-foreground">Learn from anywhere, anytime</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">In-Person Classes</h3>
                <p className="text-sm text-muted-foreground">Hands-on experience at our campus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Detail */}
      <section id="courses" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="web-development" className="space-y-12">
            <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">
              {courses.map((course) => (
                <TabsTrigger
                  key={course.id}
                  value={course.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-3 rounded-lg"
                >
                  <course.icon className="h-5 w-5 mr-2" />
                  {course.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {courses.map((course) => (
              <TabsContent key={course.id} value={course.id} id={course.id}>
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Course Overview */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`p-4 rounded-2xl ${
                            course.color === "secondary"
                              ? "bg-secondary/10 text-secondary"
                              : course.color === "accent"
                              ? "bg-accent/10 text-accent"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <course.icon className="h-8 w-8" />
                        </div>
                        <div>
                          <h2 className="font-display text-3xl font-bold text-foreground">
                            {course.title}
                          </h2>
                          <p className="text-muted-foreground">{course.tagline}</p>
                        </div>
                      </div>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{course.students} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-accent fill-accent" />
                        <span className="font-medium">{course.rating} rating</span>
                      </div>
                    </div>

                    {/* Phases */}
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-6">
                        Course Phases
                      </h3>
                      <div className="space-y-4">
                        {course.phases.map((phase, index) => (
                          <Card key={phase.name} className="border-border/50">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      course.color === "secondary"
                                        ? "bg-secondary text-secondary-foreground"
                                        : course.color === "accent"
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-primary text-primary-foreground"
                                    }`}
                                  >
                                    {index + 1}
                                  </span>
                                  <h4 className="font-semibold text-foreground">
                                    {phase.name}
                                  </h4>
                                </div>
                                <Badge variant="outline">{phase.duration}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {phase.topics.map((topic) => (
                                  <span
                                    key={topic}
                                    className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Enrollment Card */}
                    <Card className="border-border/50 shadow-card sticky top-24">
                      <CardHeader>
                        <h3 className="font-display text-xl font-bold text-foreground">
                          Ready to Enroll?
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Start your journey in {course.title}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Outcomes */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">
                            What You'll Achieve
                          </h4>
                          <ul className="space-y-2">
                            {course.outcomes.map((outcome) => (
                              <li
                                key={outcome}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <CheckCircle2 className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button className="w-full" size="lg" asChild>
                          <Link to="/enroll">
                            Enroll Now
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        </Button>

                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/contact">Request Info</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </PageLayout>
  );
}
