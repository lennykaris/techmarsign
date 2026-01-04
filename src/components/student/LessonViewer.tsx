import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Circle, Video, FileText, Play } from "lucide-react";
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

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

interface CourseInfo {
  id: string;
  title: string;
  current_phase: number;
}

interface LessonViewerProps {
  courses: CourseInfo[];
  onProgressUpdate?: () => void;
}

export function LessonViewer({ courses, onProgressUpdate }: LessonViewerProps) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  useEffect(() => {
    if (courses.length > 0 && user) {
      fetchLessons();
      fetchProgress();
    }
  }, [courses, user]);

  const fetchLessons = async () => {
    const courseIds = courses.map((c) => c.id);
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .in("course_id", courseIds)
      .order("phase_number", { ascending: true })
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Failed to fetch lessons:", error);
      return;
    }

    // Group lessons by course
    const grouped: Record<string, Lesson[]> = {};
    (data || []).forEach((lesson) => {
      if (!grouped[lesson.course_id]) {
        grouped[lesson.course_id] = [];
      }
      grouped[lesson.course_id].push(lesson);
    });
    setLessons(grouped);
  };

  const fetchProgress = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("student_id", user.id);

    setProgress(data || []);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.completed);
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;

    const existing = progress.find((p) => p.lesson_id === lessonId);
    
    if (existing) {
      const { error } = await supabase
        .from("lesson_progress")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("lesson_id", lessonId)
        .eq("student_id", user.id);

      if (error) {
        toast.error("Failed to update progress");
        return;
      }
    } else {
      const { error } = await supabase
        .from("lesson_progress")
        .insert({
          lesson_id: lessonId,
          student_id: user.id,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) {
        toast.error("Failed to mark lesson complete");
        return;
      }
    }

    toast.success("Lesson marked as complete!");
    fetchProgress();
    onProgressUpdate?.();
  };

  const getLessonCountForCourse = (courseId: string) => {
    return lessons[courseId]?.length || 0;
  };

  const getCompletedCountForCourse = (courseId: string) => {
    const courseLessons = lessons[courseId] || [];
    return courseLessons.filter((l) => isLessonCompleted(l.id)).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Lessons
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Enroll in a course to start learning</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {courses.map((course) => (
              <AccordionItem key={course.id} value={course.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{course.title}</span>
                    <Badge variant="secondary">
                      {getCompletedCountForCourse(course.id)}/{getLessonCountForCourse(course.id)} complete
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {!lessons[course.id] || lessons[course.id].length === 0 ? (
                    <p className="text-muted-foreground text-sm py-2">No lessons available yet</p>
                  ) : (
                    <div className="space-y-2 py-2">
                      {lessons[course.id].map((lesson) => {
                        const completed = isLessonCompleted(lesson.id);
                        const isExpanded = expandedLesson === lesson.id;

                        return (
                          <div key={lesson.id} className="border rounded-lg">
                            <div
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                              onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                            >
                              <div className="flex items-center gap-3">
                                {completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-medium text-sm">{lesson.title}</p>
                                  <p className="text-xs text-muted-foreground">Phase {lesson.phase_number}</p>
                                </div>
                              </div>
                              {lesson.video_url && <Video className="h-4 w-4 text-primary" />}
                            </div>
                            
                            {isExpanded && (
                              <div className="px-3 pb-3 pt-1 border-t">
                                {lesson.video_url && (
                                  <a
                                    href={lesson.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary text-sm mb-3 hover:underline"
                                  >
                                    <Play className="h-4 w-4" /> Watch Video
                                  </a>
                                )}
                                {lesson.content && (
                                  <div className="bg-muted/50 p-3 rounded text-sm mb-3 whitespace-pre-wrap">
                                    {lesson.content}
                                  </div>
                                )}
                                {!completed && (
                                  <Button size="sm" onClick={() => markLessonComplete(lesson.id)}>
                                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Complete
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
