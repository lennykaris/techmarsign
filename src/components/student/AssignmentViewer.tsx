import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardList, Clock, CheckCircle, Send, MessageSquare, Upload, FileText, X, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Helper component for viewing submission files with signed URLs
function ViewSubmissionFile({ fileUrl }: { fileUrl: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewFile = async () => {
    setLoading(true);
    try {
      // Extract file path from URL if it's a full URL, otherwise use as-is
      let filePath = fileUrl;
      if (fileUrl.includes('/storage/v1/object/public/assignments/')) {
        const parts = fileUrl.split('/public/assignments/');
        if (parts.length === 2) {
          filePath = parts[1];
        }
      }

      const { data, error } = await supabase.storage
        .from('assignments')
        .createSignedUrl(filePath, 3600);

      if (error || !data?.signedUrl) {
        toast.error("Failed to access file");
        return;
      }

      setSignedUrl(data.signedUrl);
      window.open(data.signedUrl, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Label>Attached File</Label>
      <Button
        variant="link"
        className="flex items-center gap-2 text-primary p-0 h-auto mt-1"
        onClick={handleViewFile}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
        View Attached File
      </Button>
    </div>
  );
}

interface Assignment {
  id: string;
  course_id: string;
  phase_number: number;
  title: string;
  description: string | null;
  due_days: number | null;
  max_score: number | null;
}

interface Submission {
  id: string;
  assignment_id: string;
  submission_text: string | null;
  file_url: string | null;
  score: number | null;
  feedback: string | null;
  status: string;
  submitted_at: string;
}

interface CourseInfo {
  id: string;
  title: string;
  current_phase: number;
}

interface AssignmentViewerProps {
  courses: CourseInfo[];
}

export function AssignmentViewer({ courses }: AssignmentViewerProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({});
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState<Submission | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (courses.length > 0 && user) {
      fetchAssignments();
      fetchSubmissions();
    }
  }, [courses, user]);

  const fetchAssignments = async () => {
    const courseIds = courses.map((c) => c.id);
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .in("course_id", courseIds)
      .order("phase_number", { ascending: true });

    if (error) {
      console.error("Failed to fetch assignments:", error);
      return;
    }

    const grouped: Record<string, Assignment[]> = {};
    (data || []).forEach((assignment) => {
      if (!grouped[assignment.course_id]) {
        grouped[assignment.course_id] = [];
      }
      grouped[assignment.course_id].push(assignment);
    });
    setAssignments(grouped);
  };

  const fetchSubmissions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("student_id", user.id);

    setSubmissions(data || []);
  };

  const getSubmission = (assignmentId: string) => {
    return submissions.find((s) => s.assignment_id === assignmentId);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedAssignment) {
      return;
    }

    const trimmedText = submissionText.trim();
    
    if (!trimmedText && !selectedFile) {
      toast.error("Please enter text or attach a file");
      return;
    }

    // Input validation - max 10,000 characters for submission text
    if (trimmedText && trimmedText.length > 10000) {
      toast.error("Submission text is too long (max 10,000 characters)");
      return;
    }

    setUploading(true);
    let filePath: string | null = null;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${selectedAssignment.id}-${Date.now()}.${fileExt}`;
        filePath = `submissions/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("assignments")
          .upload(filePath, selectedFile);

        if (uploadError) {
          toast.error("Failed to upload file");
          setUploading(false);
          return;
        }
      }

      // Store file path instead of public URL for security
      const { error } = await supabase
        .from("assignment_submissions")
        .insert({
          assignment_id: selectedAssignment.id,
          student_id: user.id,
          submission_text: trimmedText || null,
          file_url: filePath,
          status: "pending"
        });

      if (error) {
        toast.error("Failed to submit assignment");
        return;
      }

      toast.success("Assignment submitted successfully!");
      setSelectedAssignment(null);
      setSubmissionText("");
      setSelectedFile(null);
      fetchSubmissions();
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (submission: Submission | undefined) => {
    if (!submission) {
      return <Badge variant="outline" className="text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Not submitted</Badge>;
    }
    switch (submission.status) {
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "graded":
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Graded</Badge>;
      default:
        return <Badge variant="secondary">{submission.status}</Badge>;
    }
  };

  const getAssignmentCountForCourse = (courseId: string) => {
    return assignments[courseId]?.length || 0;
  };

  const getCompletedCountForCourse = (courseId: string) => {
    const courseAssignments = assignments[courseId] || [];
    return courseAssignments.filter((a) => getSubmission(a.id)).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          My Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Enroll in a course to see assignments</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {courses.map((course) => (
              <AccordionItem key={course.id} value={course.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{course.title}</span>
                    <Badge variant="secondary">
                      {getCompletedCountForCourse(course.id)}/{getAssignmentCountForCourse(course.id)} submitted
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {!assignments[course.id] || assignments[course.id].length === 0 ? (
                    <p className="text-muted-foreground text-sm py-2">No assignments available yet</p>
                  ) : (
                    <div className="space-y-3 py-2">
                      {assignments[course.id].map((assignment) => {
                        const submission = getSubmission(assignment.id);

                        return (
                          <div key={assignment.id} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{assignment.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Phase {assignment.phase_number} • {assignment.due_days} days • {assignment.max_score} pts
                                </p>
                              </div>
                              {getStatusBadge(submission)}
                            </div>
                            
                            {assignment.description && (
                              <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                            )}

                            <div className="flex gap-2">
                              {!submission && (
                                <Button size="sm" onClick={() => setSelectedAssignment(assignment)}>
                                  <Send className="h-4 w-4 mr-1" /> Submit
                                </Button>
                              )}
                              {submission?.status === "graded" && (
                                <Button size="sm" variant="outline" onClick={() => setViewingFeedback(submission)}>
                                  <MessageSquare className="h-4 w-4 mr-1" /> View Feedback
                                </Button>
                              )}
                              {submission?.status === "pending" && (
                                <p className="text-sm text-muted-foreground">Awaiting tutor review...</p>
                              )}
                            </div>
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

        {/* Submit Dialog */}
        <Dialog open={!!selectedAssignment} onOpenChange={(open) => { if (!open) { setSelectedAssignment(null); setSelectedFile(null); setSubmissionText(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
            </DialogHeader>
            {selectedAssignment && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedAssignment.title}</p>
                  {selectedAssignment.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedAssignment.description}</p>
                  )}
                </div>
                <div>
                  <Label>Your Submission</Label>
                  <Textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter your assignment response..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Attach File (optional)</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg mt-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full mt-1" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Choose File
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Max 10MB • PDF, DOC, DOCX, TXT, PNG, JPG</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedAssignment(null)} disabled={uploading}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                    {uploading ? "Uploading..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={!!viewingFeedback} onOpenChange={(open) => !open && setViewingFeedback(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assignment Feedback</DialogTitle>
            </DialogHeader>
            {viewingFeedback && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Score</span>
                  <span className="text-xl font-bold text-primary">{viewingFeedback.score} pts</span>
                </div>
                {viewingFeedback.feedback && (
                  <div>
                    <Label>Tutor Feedback</Label>
                    <div className="bg-muted p-3 rounded mt-1 text-sm">
                      {viewingFeedback.feedback}
                    </div>
                  </div>
                )}
                {viewingFeedback.submission_text && (
                  <div>
                    <Label>Your Submission</Label>
                    <div className="bg-muted/50 p-3 rounded mt-1 text-sm">
                      {viewingFeedback.submission_text}
                    </div>
                  </div>
                )}
                {viewingFeedback.file_url && (
                  <ViewSubmissionFile fileUrl={viewingFeedback.file_url} />
                )}
                <Button className="w-full" onClick={() => setViewingFeedback(null)}>Close</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
