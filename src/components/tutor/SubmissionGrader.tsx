import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  file_url: string | null;
  score: number | null;
  feedback: string | null;
  status: string;
  submitted_at: string;
  graded_at: string | null;
  assignment: {
    title: string;
    max_score: number | null;
    course: {
      title: string;
    };
  };
  student_profile?: {
    full_name: string;
    email: string;
  };
}

interface Course {
  id: string;
  title: string;
}

interface SubmissionGraderProps {
  courses: Course[];
}

export function SubmissionGrader({ courses }: SubmissionGraderProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeData, setGradeData] = useState({ score: 0, feedback: "" });

  useEffect(() => {
    if (selectedCourse) {
      fetchSubmissions();
    }
  }, [selectedCourse]);

  const fetchSubmissions = async () => {
    const { data: assignmentData } = await supabase
      .from("assignments")
      .select("id")
      .eq("course_id", selectedCourse);

    if (!assignmentData || assignmentData.length === 0) {
      setSubmissions([]);
      return;
    }

    const assignmentIds = assignmentData.map((a) => a.id);

    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
        *,
        assignment:assignments(title, max_score, course:courses(title))
      `)
      .in("assignment_id", assignmentIds)
      .order("submitted_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch submissions");
      return;
    }

    // Fetch student profiles
    const studentIds = [...new Set((data || []).map((s) => s.student_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", studentIds);

    const submissionsWithProfiles = (data || []).map((sub) => ({
      ...sub,
      student_profile: profiles?.find((p) => p.user_id === sub.student_id)
    }));

    setSubmissions(submissionsWithProfiles as Submission[]);
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    const { error } = await supabase
      .from("assignment_submissions")
      .update({
        score: gradeData.score,
        feedback: gradeData.feedback.trim() || null,
        status: "graded",
        graded_at: new Date().toISOString()
      })
      .eq("id", selectedSubmission.id);

    if (error) {
      toast.error("Failed to grade submission");
      return;
    }

    toast.success("Submission graded successfully");
    setSelectedSubmission(null);
    setGradeData({ score: 0, feedback: "" });
    fetchSubmissions();
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score || 0,
      feedback: submission.feedback || ""
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "graded":
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Graded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Student Submissions
        </CardTitle>
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
          <p className="text-muted-foreground text-center py-4">Select a course to view submissions</p>
        ) : submissions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No submissions yet</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{submission.student_profile?.full_name || "Unknown Student"}</p>
                    <p className="text-sm text-muted-foreground">{submission.assignment?.title}</p>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
                {submission.submission_text && (
                  <div className="bg-muted/50 p-2 rounded text-sm mb-2 line-clamp-2">
                    {submission.submission_text}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                  </p>
                  {submission.status === "graded" ? (
                    <p className="text-sm font-medium text-primary">
                      Score: {submission.score}/{submission.assignment?.max_score}
                    </p>
                  ) : (
                    <Button size="sm" onClick={() => openGradeDialog(submission)}>
                      Grade
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedSubmission.student_profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.assignment?.title}</p>
                </div>
                {selectedSubmission.submission_text && (
                  <div>
                    <Label>Submission</Label>
                    <div className="bg-muted p-3 rounded text-sm mt-1">
                      {selectedSubmission.submission_text}
                    </div>
                  </div>
                )}
                {selectedSubmission.file_url && (
                  <div>
                    <Label>Attached File</Label>
                    <a href={selectedSubmission.file_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm flex items-center gap-1">
                      <FileText className="h-4 w-4" /> View File
                    </a>
                  </div>
                )}
                <div>
                  <Label>Score (max: {selectedSubmission.assignment?.max_score})</Label>
                  <Input
                    type="number"
                    min={0}
                    max={selectedSubmission.assignment?.max_score || 100}
                    value={gradeData.score}
                    onChange={(e) => setGradeData({ ...gradeData, score: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Feedback</Label>
                  <Textarea
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    placeholder="Provide feedback to the student..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
                  <Button onClick={handleGrade}>Submit Grade</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
