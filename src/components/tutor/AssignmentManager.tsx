import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ClipboardList } from "lucide-react";
import { toast } from "sonner";

interface Assignment {
  id: string;
  course_id: string;
  lesson_id: string | null;
  phase_number: number;
  title: string;
  description: string | null;
  due_days: number | null;
  max_score: number | null;
}

interface Course {
  id: string;
  title: string;
}

interface AssignmentManagerProps {
  courses: Course[];
}

export function AssignmentManager({ courses }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    phase_number: 1,
    due_days: 7,
    max_score: 100
  });

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments();
    }
  }, [selectedCourse]);

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("phase_number", { ascending: true });

    if (error) {
      toast.error("Failed to fetch assignments");
      return;
    }
    setAssignments(data || []);
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !formData.title.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    const assignmentData = {
      course_id: selectedCourse,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      phase_number: formData.phase_number,
      due_days: formData.due_days,
      max_score: formData.max_score
    };

    if (editingAssignment) {
      const { error } = await supabase
        .from("assignments")
        .update(assignmentData)
        .eq("id", editingAssignment.id);

      if (error) {
        toast.error("Failed to update assignment");
        return;
      }
      toast.success("Assignment updated");
    } else {
      const { error } = await supabase
        .from("assignments")
        .insert(assignmentData);

      if (error) {
        toast.error("Failed to create assignment");
        return;
      }
      toast.success("Assignment created");
    }

    resetForm();
    fetchAssignments();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete assignment");
      return;
    }
    toast.success("Assignment deleted");
    fetchAssignments();
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", phase_number: 1, due_days: 7, max_score: 100 });
    setEditingAssignment(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      phase_number: assignment.phase_number,
      due_days: assignment.due_days || 7,
      max_score: assignment.max_score || 100
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Assignment Manager
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!selectedCourse} onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-1" /> Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAssignment ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Assignment title"
                />
              </div>
              <div>
                <Label>Phase Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.phase_number}
                  onChange={(e) => setFormData({ ...formData, phase_number: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Days</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.due_days}
                    onChange={(e) => setFormData({ ...formData, due_days: parseInt(e.target.value) || 7 })}
                  />
                </div>
                <div>
                  <Label>Max Score</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) || 100 })}
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assignment instructions..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingAssignment ? "Update" : "Create"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>Select Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedCourse ? (
          <p className="text-muted-foreground text-center py-4">Select a course to manage assignments</p>
        ) : assignments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No assignments yet. Create your first assignment!</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Phase {assignment.phase_number} • {assignment.due_days} days • {assignment.max_score} pts
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(assignment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(assignment.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
