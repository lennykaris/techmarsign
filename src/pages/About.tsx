import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Lightbulb, Users, Award } from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We embrace new technologies and teaching methods to stay ahead of industry trends.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We foster a supportive learning environment where students help each other grow.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We maintain high standards in everything we do, from curriculum to career support.",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "We're driven by a genuine desire to see our students succeed in their careers.",
  },
];

const team = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    bio: "Former Google engineer with 15+ years in tech education.",
  },
  {
    name: "Michael Chen",
    role: "Head of Curriculum",
    bio: "EdTech specialist who has designed courses for 50k+ students.",
  },
  {
    name: "Emily Rodriguez",
    role: "Director of Student Success",
    bio: "Career coach with experience placing 1000+ graduates.",
  },
  {
    name: "David Kim",
    role: "Lead Instructor - Web Dev",
    bio: "Full-stack developer with experience at top startups.",
  },
];

export default function About() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              About Us
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Empowering the Next Generation of{" "}
              <span className="text-secondary">Tech Professionals</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Tecmarsign Academy was founded with a simple mission: make quality 
              tech education accessible, practical, and career-focused.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="p-8 lg:p-12 rounded-3xl bg-primary text-primary-foreground">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mb-6">
                <Target className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">
                Our Mission
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed">
                To bridge the gap between education and employment by providing 
                industry-relevant, hands-on training that prepares students for 
                immediate success in the tech industry. We believe everyone 
                deserves access to quality education that leads to meaningful careers.
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 lg:p-12 rounded-3xl bg-secondary text-secondary-foreground">
              <div className="w-16 h-16 rounded-2xl bg-secondary-foreground/10 flex items-center justify-center mb-6">
                <Eye className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">
                Our Vision
              </h2>
              <p className="text-secondary-foreground/80 leading-relaxed">
                To become the leading tech education institution in the region, 
                known for producing job-ready professionals who drive innovation 
                and growth in their organizations. We envision a future where 
                quality tech education is within everyone's reach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Our Story
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              From a Small Workshop to a Leading Academy
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="leading-relaxed mb-6">
                Tecmarsign Academy started in 2018 as a small weekend workshop 
                teaching web development to aspiring developers. Our founder, 
                Sarah Johnson, saw firsthand how traditional education often 
                failed to prepare students for real-world tech jobs.
              </p>
              <p className="leading-relaxed mb-6">
                What began with just 10 students in a co-working space has grown 
                into a comprehensive academy offering courses in Technology, 
                Marketing, and Design. Today, we've trained over 2,500 students, 
                with a 95% job placement rate within 6 months of graduation.
              </p>
              <p className="leading-relaxed">
                Our approach remains the same: combine theory with extensive 
                hands-on practice, bring in industry experts as mentors, and 
                provide ongoing career support even after graduation. We're not 
                just teaching skills—we're launching careers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              Our Values
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              The Principles That <span className="text-secondary">Guide Us</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <Card
                key={value.title}
                className="text-center border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              Our Team
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Meet the <span className="text-secondary">Experts</span> Behind Your Success
            </h2>
            <p className="text-muted-foreground">
              Our team brings decades of combined experience from leading tech 
              companies and educational institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <Card
                key={member.name}
                className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-display text-4xl font-bold text-primary">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <CardContent className="pt-6 pb-6 px-6 text-center">
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-secondary font-medium text-sm mb-3">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
