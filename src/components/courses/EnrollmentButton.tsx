import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EnrollmentButtonProps {
  courseId: string;
  courseTitle: string;
}

export function EnrollmentButton({ courseId, courseTitle }: EnrollmentButtonProps) {
  const { user } = useAuth();
  const { enrollInCourse, isEnrolled } = useCourses();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();

  const enrolled = isEnrolled(courseId);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmEnrollment = async () => {
    setLoading(true);
    const result = await enrollInCourse(courseId);
    setLoading(false);
    setShowConfirmDialog(false);
    
    if (result.success) {
      if (result.pendingPayment) {
        // Stay on the page for paid courses pending payment
        return;
      }
      navigate("/dashboard");
    }
  };

  if (enrolled) {
    return (
      <Button className="w-full" size="lg" variant="secondary" asChild>
        <Link to="/dashboard">
          <CheckCircle className="h-5 w-5 mr-2" />
          View in Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button 
        className="w-full" 
        size="lg" 
        onClick={handleEnroll}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Enroll Now
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>
              You are about to enroll in <strong>{courseTitle}</strong>. 
              This will start your learning journey with Phase 1.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmEnrollment}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
