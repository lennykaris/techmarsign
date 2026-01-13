import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Video, FileText, Upload, Paperclip, X } from "lucide-react";
import { toast } from "sonner";

interface LessonMaterial {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

interface Lesson {
  id: string;
  course_id: string;
  phase_number: number;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
  materials?: LessonMaterial[];
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
  const [materialsDialogOpen, setMaterialsDialogOpen] = useState(false);
  const [selectedLessonForMaterials, setSelectedLessonForMaterials] = useState<Lesson | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    // Fetch materials for each lesson
    const lessonsWithMaterials = await Promise.all(
      (data || []).map(async (lesson) => {
        const { data: materials } = await supabase
          .from("lesson_materials")
          .select("*")
          .eq("lesson_id", lesson.id);
        return { ...lesson, materials: materials || [] };
      })
    );

    setLessons(lessonsWithMaterials);
  };

  // Validate video URL is from allowed domains
  const isValidVideoUrl = (url: string): boolean => {
    if (!url) return true;
    const allowedPatterns = [
      /^https:\/\/(www\.)?youtube\.com\//,
      /^https:\/\/youtu\.be\//,
      /^https:\/\/(www\.)?vimeo\.com\//,
      /^https:\/\/player\.vimeo\.com\//,
    ];
    return allowedPatterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async () => {
    const trimmedTitle = formData.title.trim();
    const trimmedContent = formData.content.trim();
    const trimmedVideoUrl = formData.video_url.trim();
    
    if (!selectedCourse || !trimmedTitle) {
      toast.error("Please fill in required fields");
      return;
    }

    // Input validation - enforce length limits
    if (trimmedTitle.length > 200) {
      toast.error("Title is too long (max 200 characters)");
      return;
    }

    if (trimmedContent && trimmedContent.length > 50000) {
      toast.error("Content is too long (max 50,000 characters)");
      return;
    }

    // Validate video URL domain
    if (trimmedVideoUrl && !isValidVideoUrl(trimmedVideoUrl)) {
      toast.error("Video URL must be from YouTube or Vimeo");
      return;
    }

    const lessonData = {
      course_id: selectedCourse,
      title: trimmedTitle,
      content: trimmedContent || null,
      video_url: trimmedVideoUrl || null,
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

  const openMaterialsDialog = (lesson: Lesson) => {
    setSelectedLessonForMaterials(lesson);
    setMaterialsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedLessonForMaterials) return;
    
    const file = e.target.files[0];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${selectedLessonForMaterials.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("lesson-materials")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload file");
      setUploading(false);
      return;
    }

    // Store file path instead of public URL for security
    const { error: insertError } = await supabase
      .from("lesson_materials")
      .insert({
        lesson_id: selectedLessonForMaterials.id,
        file_name: file.name,
        file_url: filePath,
        file_type: file.type,
        file_size: file.size
      });

    if (insertError) {
      toast.error("Failed to save material record");
    } else {
      toast.success("Material uploaded successfully");
      fetchLessons();
      // Update selected lesson materials
      const { data: materials } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", selectedLessonForMaterials.id);
      setSelectedLessonForMaterials({ ...selectedLessonForMaterials, materials: materials || [] });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteMaterial = async (materialId: string, fileUrl: string) => {
    // Extract file path from URL
    const urlParts = fileUrl.split("/lesson-materials/");
    if (urlParts[1]) {
      await supabase.storage.from("lesson-materials").remove([urlParts[1]]);
    }

    const { error } = await supabase.from("lesson_materials").delete().eq("id", materialId);
    
    if (error) {
      toast.error("Failed to delete material");
      return;
    }

    toast.success("Material deleted");
    fetchLessons();
    if (selectedLessonForMaterials) {
      const { data: materials } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", selectedLessonForMaterials.id);
      setSelectedLessonForMaterials({ ...selectedLessonForMaterials, materials: materials || [] });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
                  <Button size="icon" variant="ghost" onClick={() => openMaterialsDialog(lesson)}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
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

      {/* Materials Dialog */}
      <Dialog open={materialsDialogOpen} onOpenChange={setMaterialsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lesson Materials: {selectedLessonForMaterials?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.mp3,.zip"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Material"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                PDF, DOC, PPT, XLS, MP4, MP3, ZIP (max 50MB)
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedLessonForMaterials?.materials?.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No materials uploaded yet</p>
              ) : (
                selectedLessonForMaterials?.materials?.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline truncate block"
                        >
                          {material.file_name}
                        </a>
                        <p className="text-xs text-muted-foreground">{formatFileSize(material.file_size)}</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteMaterial(material.id, material.file_url)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
