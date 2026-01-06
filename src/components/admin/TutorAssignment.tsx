import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Tutor {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface Course {
  id: string;
  title: string;
  category: string;
}

interface TutorCourse {
  id: string;
  tutor_id: string;
  course_id: string;
  assigned_at: string;
  tutor: Tutor;
  course: Course;
}

export function TutorAssignment() {
  const [tutorCourses, setTutorCourses] = useState<TutorCourse[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch tutors (users with tutor role)
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "tutor");

    if (rolesData && rolesData.length > 0) {
      const tutorIds = rolesData.map(r => r.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", tutorIds);

      if (profilesData) {
        setTutors(profilesData.map(p => ({
          user_id: p.user_id,
          full_name: p.full_name,
          email: p.email,
          avatar_url: p.avatar_url
        })));
      }
    }

    // Fetch courses
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title, category")
      .eq("is_active", true);

    if (coursesData) {
      setCourses(coursesData);
    }

    // Fetch tutor-course assignments
    await fetchAssignments();
    setLoading(false);
  };

  const fetchAssignments = async () => {
    const { data: assignmentsData } = await supabase
      .from("tutor_courses")
      .select(`
        id,
        tutor_id,
        course_id,
        assigned_at,
        courses(id, title, category)
      `);

    if (assignmentsData && assignmentsData.length > 0) {
      const tutorIds = [...new Set(assignmentsData.map(a => a.tutor_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", tutorIds);

      const enriched = assignmentsData.map(a => {
        const tutor = profilesData?.find(p => p.user_id === a.tutor_id);
        return {
          id: a.id,
          tutor_id: a.tutor_id,
          course_id: a.course_id,
          assigned_at: a.assigned_at,
          tutor: tutor ? {
            user_id: tutor.user_id,
            full_name: tutor.full_name,
            email: tutor.email,
            avatar_url: tutor.avatar_url
          } : { user_id: "", full_name: "Unknown", email: "", avatar_url: null },
          course: a.courses as unknown as Course
        };
      });

      setTutorCourses(enriched);
    } else {
      setTutorCourses([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedTutor || !selectedCourse) {
      toast.error("Please select both a tutor and a course");
      return;
    }

    // Check if assignment already exists
    const existing = tutorCourses.find(
      tc => tc.tutor_id === selectedTutor && tc.course_id === selectedCourse
    );

    if (existing) {
      toast.error("This tutor is already assigned to this course");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("tutor_courses")
      .insert({
        tutor_id: selectedTutor,
        course_id: selectedCourse
      });

    if (error) {
      toast.error("Failed to assign tutor");
    } else {
      toast.success("Tutor assigned successfully");
      setDialogOpen(false);
      setSelectedTutor("");
      setSelectedCourse("");
      await fetchAssignments();
    }

    setSaving(false);
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase
      .from("tutor_courses")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove assignment");
    } else {
      toast.success("Assignment removed");
      setTutorCourses(tutorCourses.filter(tc => tc.id !== id));
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Group assignments by tutor
  const assignmentsByTutor = tutorCourses.reduce((acc, tc) => {
    if (!acc[tc.tutor_id]) {
      acc[tc.tutor_id] = { tutor: tc.tutor, courses: [] };
    }
    acc[tc.tutor_id].courses.push({ id: tc.id, course: tc.course });
    return acc;
  }, {} as Record<string, { tutor: Tutor; courses: { id: string; course: Course }[] }>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tutor Assignments</CardTitle>
          <CardDescription>Assign tutors to courses</CardDescription>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Tutor
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : Object.keys(assignmentsByTutor).length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tutor assignments yet</p>
        ) : (
          <div className="space-y-6">
            {Object.values(assignmentsByTutor).map(({ tutor, courses }) => (
              <div key={tutor.user_id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={tutor.avatar_url || ""} />
                    <AvatarFallback className="bg-accent/20">
                      {getInitials(tutor.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{tutor.full_name}</p>
                    <p className="text-sm text-muted-foreground">{tutor.email}</p>
                  </div>
                  <Badge className="ml-auto">
                    <UserCheck className="mr-1 h-3 w-3" />
                    {courses.length} course{courses.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courses.map(({ id, course }) => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {course.title}
                      <button
                        onClick={() => handleRemove(id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Tutor to Course</DialogTitle>
              <DialogDescription>
                Select a tutor and a course to create an assignment
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tutor</Label>
                <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map((tutor) => (
                      <SelectItem key={tutor.user_id} value={tutor.user_id}>
                        {tutor.full_name} ({tutor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} ({course.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssign} disabled={saving}>
                {saving ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
