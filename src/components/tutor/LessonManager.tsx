import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Video, FileText } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: string;
  course_id: string;
  phase_number: number;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
}

interface LessonManagerProps {
  courses: Course[];
}

export function LessonManager({ courses }: LessonManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    video_url: "",
    phase_number: 1,
    order_index: 0
  });

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons();
    }
  }, [selectedCourse]);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("phase_number", { ascending: true })
      .order("order_index", { ascending: true });

    if (error) {
      toast.error("Failed to fetch lessons");
      return;
    }
    setLessons(data || []);
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !formData.title.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    const lessonData = {
      course_id: selectedCourse,
      title: formData.title.trim(),
      content: formData.content.trim() || null,
      video_url: formData.video_url.trim() || null,
      phase_number: formData.phase_number,
      order_index: formData.order_index
    };

    if (editingLesson) {
      const { error } = await supabase
        .from("lessons")
        .update(lessonData)
        .eq("id", editingLesson.id);

      if (error) {
        toast.error("Failed to update lesson");
        return;
      }
      toast.success("Lesson updated");
    } else {
      const { error } = await supabase
        .from("lessons")
        .insert(lessonData);

      if (error) {
        toast.error("Failed to create lesson");
        return;
      }
      toast.success("Lesson created");
    }

    resetForm();
    fetchLessons();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete lesson");
      return;
    }
    toast.success("Lesson deleted");
    fetchLessons();
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", video_url: "", phase_number: 1, order_index: 0 });
    setEditingLesson(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      phase_number: lesson.phase_number,
      order_index: lesson.order_index
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lesson Manager
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!selectedCourse} onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-1" /> Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Edit Lesson" : "Create Lesson"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Lesson title"
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
              <div>
                <Label>Order Index</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Video URL (optional)</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Lesson content..."
                  rows={5}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingLesson ? "Update" : "Create"}</Button>
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
          <p className="text-muted-foreground text-center py-4">Select a course to manage lessons</p>
        ) : lessons.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No lessons yet. Create your first lesson!</p>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {lesson.video_url ? (
                    <Video className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">Phase {lesson.phase_number} • Order {lesson.order_index}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(lesson)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(lesson.id)}>
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
