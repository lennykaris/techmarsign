import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  Laptop, 
  Award, 
  HeartHandshake 
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with years of real-world experience in their fields.",
  },
  {
    icon: Briefcase,
    title: "Job-Ready Skills",
    description:
      "Our curriculum is designed in collaboration with employers to ensure industry relevance.",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description:
      "Personalized attention with a maximum of 20 students per cohort for optimal learning.",
  },
  {
    icon: Laptop,
    title: "Flexible Learning",
    description:
      "Choose between online, offline, or hybrid modes to fit your schedule and lifestyle.",
  },
  {
    icon: Award,
    title: "Certified Programs",
    description:
      "Earn recognized certifications that validate your skills to potential employers.",
  },
  {
    icon: HeartHandshake,
    title: "Career Support",
    description:
      "Get resume reviews, interview prep, and job placement assistance after graduation.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4">
            Why Tecmarsign?
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Success is Our <span className="text-secondary">Priority</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We've designed every aspect of our academy to maximize your learning 
            outcomes and career success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
