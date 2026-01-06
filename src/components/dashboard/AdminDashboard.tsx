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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Users, GraduationCap, LogOut, User, Shield, UserCheck, BarChart3, Settings } from "lucide-react";
import { CourseManager } from "@/components/admin/CourseManager";
import { TutorAssignment } from "@/components/admin/TutorAssignment";
import { EnrollmentAnalytics } from "@/components/admin/EnrollmentAnalytics";
import { toast } from "sonner";

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface UserWithRole {
  user_id: string;
  role: string;
  profile: Profile;
}

interface CourseData {
  id: string;
  title: string;
  category: string;
  is_active: boolean;
}

interface EnrollmentData {
  id: string;
  status: string;
  progress: number;
  student_profile: Profile;
  course_title: string;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch admin profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);

    // Fetch all users with roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesData) {
      const userIds = rolesData.map((r: any) => r.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", userIds);

      const usersWithRoles = rolesData.map((r: any) => {
        const userProfile = profilesData?.find((p: any) => p.user_id === r.user_id);
        return {
          user_id: r.user_id,
          role: r.role,
          profile: userProfile || { full_name: "Unknown", email: "", avatar_url: null }
        };
      });

      setUsers(usersWithRoles);
    }

    // Fetch all courses
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title, category, is_active");

    if (coursesData) setCourses(coursesData);

    // Fetch all enrollments
    const { data: enrollmentsData } = await supabase
      .from("enrollments")
      .select(`
        id,
        status,
        progress,
        student_id,
        course:courses(title)
      `);

    if (enrollmentsData) {
      const studentIds = enrollmentsData.map((e: any) => e.student_id);
      const { data: studentProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", studentIds);

      const enrichedEnrollments = enrollmentsData.map((e: any) => {
        const studentProfile = studentProfiles?.find((p: any) => p.user_id === e.student_id);
        return {
          id: e.id,
          status: e.status,
          progress: e.progress,
          student_profile: studentProfile || { full_name: "Unknown", email: "", avatar_url: null },
          course_title: e.course?.title || "Unknown"
        };
      });

      setEnrollments(enrichedEnrollments);
    }

    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "student" | "tutor") => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to update role");
    } else {
      toast.success("Role updated successfully");
      setUsers(users.map(u => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-600";
      case "tutor": return "bg-accent/20 text-accent-foreground";
      case "student": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const students = users.filter(u => u.role === "student");
  const tutors = users.filter(u => u.role === "tutor");

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-destructive text-destructive-foreground text-lg">
                {profile ? getInitials(profile.full_name) : <User />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">{profile?.email}</p>
              <Badge className="mt-1 bg-destructive/10 text-destructive">
                <Shield className="mr-1 h-3 w-3" />
                Administrator
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tutors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="courses">
              <BookOpen className="mr-1 h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="tutors-assign">
              <UserCheck className="mr-1 h-4 w-4" />
              Tutor Assignment
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-1 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="students">
              <GraduationCap className="mr-1 h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-1 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CourseManager />
          </TabsContent>

          <TabsContent value="tutors-assign">
            <TutorAssignment />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.profile?.avatar_url || ""} />
                                <AvatarFallback className="text-xs">
                                  {u.profile ? getInitials(u.profile.full_name) : "U"}
                                </AvatarFallback>
                              </Avatar>
                              {u.profile?.full_name}
                            </div>
                          </TableCell>
                          <TableCell>{u.profile?.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(u.role)}>{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(value: "admin" | "student" | "tutor") => handleRoleChange(u.user_id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="tutor">Tutor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>All registered students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((s) => (
                    <div key={s.user_id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={s.profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10">
                          {s.profile ? getInitials(s.profile.full_name) : "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{s.profile?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{s.profile?.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <EnrollmentAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
