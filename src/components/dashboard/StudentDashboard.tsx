import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Users, LogOut, User, FileText, ClipboardList } from "lucide-react";
import { LessonViewer } from "@/components/student/LessonViewer";
import { AssignmentViewer } from "@/components/student/AssignmentViewer";

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface Enrollment {
  id: string;
  current_phase: number;
  status: string;
  progress: number;
  course: {
    id: string;
    title: string;
    category: string;
    image_url: string | null;
  };
}

interface TutorInfo {
  tutor_id: string;
  profile: Profile;
}

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tutors, setTutors] = useState<TutorInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);

    // Fetch enrollments with course info
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select(`
        id,
        current_phase,
        status,
        progress,
        course:courses(id, title, category, image_url)
      `)
      .eq("student_id", user.id);

    if (enrollmentData) {
      setEnrollments(enrollmentData as unknown as Enrollment[]);

      // Fetch tutors for enrolled courses
      const courseIds = enrollmentData.map((e: any) => e.course?.id).filter(Boolean);
      if (courseIds.length > 0) {
        const { data: tutorData } = await supabase
          .from("tutor_courses")
          .select(`
            tutor_id,
            profile:profiles!tutor_courses_tutor_id_fkey(full_name, email, avatar_url)
          `)
          .in("course_id", courseIds);

        if (tutorData) {
          const uniqueTutors = Array.from(
            new Map((tutorData as unknown as TutorInfo[]).map(t => [t.tutor_id, t])).values()
          );
          setTutors(uniqueTutors);
        }
      }
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600";
      case "completed": return "bg-blue-500/10 text-blue-600";
      case "paused": return "bg-yellow-500/10 text-yellow-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {profile ? getInitials(profile.full_name) : <User />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome, {profile?.full_name || "Student"}!
              </h1>
              <p className="text-muted-foreground">{profile?.email}</p>
              <Badge variant="secondary" className="mt-1">Student</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enrollments.filter(e => e.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Tutors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutors.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Learning Content */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Courses
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Lessons
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Assignments
            </TabsTrigger>
            <TabsTrigger value="tutors" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Tutors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Courses you are currently enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                    <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{enrollment.course.title}</h3>
                            <Badge className={getStatusColor(enrollment.status)}>
                              {enrollment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Category: {enrollment.course.category} • Phase {enrollment.current_phase}
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress value={enrollment.progress} className="flex-1 h-2" />
                            <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <LessonViewer 
              courses={enrollments.map((e) => ({ 
                id: e.course.id, 
                title: e.course.title, 
                current_phase: e.current_phase 
              }))}
              onProgressUpdate={fetchData}
            />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentViewer 
              courses={enrollments.map((e) => ({ 
                id: e.course.id, 
                title: e.course.title, 
                current_phase: e.current_phase 
              }))}
            />
          </TabsContent>

          <TabsContent value="tutors">
            <Card>
              <CardHeader>
                <CardTitle>My Tutors</CardTitle>
                <CardDescription>Tutors assigned to your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {tutors.length === 0 ? (
                  <p className="text-muted-foreground">No tutors assigned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tutors.map((tutor) => (
                      <div key={tutor.tutor_id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={tutor.profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-secondary">
                            {tutor.profile ? getInitials(tutor.profile.full_name) : "T"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{tutor.profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{tutor.profile?.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
