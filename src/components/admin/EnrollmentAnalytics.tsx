import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, BookOpen, GraduationCap, Activity } from "lucide-react";

interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
}

interface CourseEnrollment {
  courseTitle: string;
  count: number;
}

interface StatusDistribution {
  name: string;
  value: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export function EnrollmentAnalytics() {
  const [stats, setStats] = useState<EnrollmentStats>({
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0
  });
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch all enrollments with course info
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        id,
        status,
        progress,
        enrolled_at,
        course_id,
        student_id,
        courses(title)
      `)
      .order("enrolled_at", { ascending: false });

    if (enrollments) {
      // Calculate stats
      const total = enrollments.length;
      const active = enrollments.filter(e => e.status === "active").length;
      const completed = enrollments.filter(e => e.status === "completed").length;
      const avgProgress = total > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / total)
        : 0;

      setStats({
        totalEnrollments: total,
        activeEnrollments: active,
        completedEnrollments: completed,
        averageProgress: avgProgress
      });

      // Course enrollment counts
      const courseCounts: Record<string, number> = {};
      enrollments.forEach(e => {
        const title = (e.courses as any)?.title || "Unknown";
        courseCounts[title] = (courseCounts[title] || 0) + 1;
      });
      setCourseEnrollments(
        Object.entries(courseCounts)
          .map(([courseTitle, count]) => ({ courseTitle, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

      // Status distribution
      const statusCounts: Record<string, number> = {};
      enrollments.forEach(e => {
        statusCounts[e.status || "unknown"] = (statusCounts[e.status || "unknown"] || 0) + 1;
      });
      setStatusDistribution(
        Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
      );

      // Recent enrollments with profiles
      const recent = enrollments.slice(0, 5);
      const studentIds = recent.map(e => e.student_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", studentIds);

      setRecentEnrollments(
        recent.map(e => ({
          ...e,
          studentName: profiles?.find(p => p.user_id === e.student_id)?.full_name || "Unknown",
          courseName: (e.courses as any)?.title || "Unknown"
        }))
      );
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <Progress value={stats.averageProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Enrollments Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Courses by Enrollment</CardTitle>
            <CardDescription>Most popular courses</CardDescription>
          </CardHeader>
          <CardContent>
            {courseEnrollments.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={courseEnrollments} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="courseTitle" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No enrollment data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistribution.length > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No enrollment data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>Latest student enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEnrollments.length > 0 ? (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div 
                  key={enrollment.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{enrollment.studentName}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.courseName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                      {enrollment.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(enrollment.enrolled_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No enrollments yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
