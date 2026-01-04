import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, LogOut, User, GraduationCap, FileText, ClipboardList } from "lucide-react";
import { LessonManager } from "@/components/tutor/LessonManager";
import { AssignmentManager } from "@/components/tutor/AssignmentManager";
import { SubmissionGrader } from "@/components/tutor/SubmissionGrader";

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface AssignedCourse {
  id: string;
  course: {
    id: string;
    title: string;
    category: string;
    description: string | null;
  };
}

interface StudentInfo {
  student_id: string;
  current_phase: number;
  progress: number;
  status: string;
  profile: Profile;
  course_title: string;
}

export default function TutorDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
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

    // Fetch assigned courses
    const { data: courseData } = await supabase
      .from("tutor_courses")
      .select(`
        id,
        course:courses(id, title, category, description)
      `)
      .eq("tutor_id", user.id);

    if (courseData) {
      setAssignedCourses(courseData as unknown as AssignedCourse[]);

      // Fetch students enrolled in these courses
      const courseIds = courseData.map((c: any) => c.course?.id).filter(Boolean);
      if (courseIds.length > 0) {
        const { data: enrollmentData } = await supabase
          .from("enrollments")
          .select(`
            student_id,
            current_phase,
            progress,
            status,
            course:courses(title)
          `)
          .in("course_id", courseIds);

        if (enrollmentData) {
          // Fetch student profiles
          const studentIds = enrollmentData.map((e: any) => e.student_id);
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, full_name, email, avatar_url")
            .in("user_id", studentIds);

          const studentsWithProfiles = enrollmentData.map((e: any) => {
            const studentProfile = profilesData?.find((p: any) => p.user_id === e.student_id);
            return {
              student_id: e.student_id,
              current_phase: e.current_phase,
              progress: e.progress,
              status: e.status,
              profile: studentProfile || { full_name: "Unknown", email: "", avatar_url: null },
              course_title: e.course?.title || "Unknown Course"
            };
          });

          setStudents(studentsWithProfiles);
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
                Welcome, {profile?.full_name || "Tutor"}!
              </h1>
              <p className="text-muted-foreground">{profile?.email}</p>
              <Badge className="mt-1 bg-accent text-accent-foreground">Tutor</Badge>
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
              <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedCourses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.status === "active").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Courses */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Courses you are assigned to teach</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : assignedCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No courses assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedCourses.map((ac) => (
                  <div key={ac.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-1">{ac.course.title}</h3>
                    <Badge variant="outline">{ac.course.category}</Badge>
                    {ac.course.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {ac.course.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Content Management */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Students
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Lessons
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Assignments
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Students enrolled in your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-muted-foreground">No students enrolled yet.</p>
                ) : (
                  <div className="space-y-4">
                    {students.map((student, idx) => (
                      <div
                        key={`${student.student_id}-${idx}`}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                      >
                        <Avatar>
                          <AvatarImage src={student.profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-secondary">
                            {student.profile ? getInitials(student.profile.full_name) : "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{student.profile?.full_name}</h3>
                            <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {student.course_title} • Phase {student.current_phase} • {student.progress}% complete
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <LessonManager courses={assignedCourses.map((ac) => ({ id: ac.course.id, title: ac.course.title }))} />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentManager courses={assignedCourses.map((ac) => ({ id: ac.course.id, title: ac.course.title }))} />
          </TabsContent>

          <TabsContent value="submissions">
            <SubmissionGrader courses={assignedCourses.map((ac) => ({ id: ac.course.id, title: ac.course.title }))} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
