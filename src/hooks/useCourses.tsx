import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;
type CoursePhase = Tables<"course_phases">;
type Enrollment = Tables<"enrollments">;

export interface CourseWithPhases extends Course {
  course_phases: CoursePhase[];
}

export interface EnrollmentWithCourse extends Enrollment {
  courses: Course | null;
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseWithPhases[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          course_phases (*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Sort phases by phase_number
      const coursesWithSortedPhases = (data || []).map(course => ({
        ...course,
        course_phases: (course.course_phases || []).sort((a, b) => a.phase_number - b.phase_number)
      }));
      
      setCourses(coursesWithSortedPhases);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const fetchEnrollments = async () => {
    if (!user) {
      setEnrollments([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses (*)
        `)
        .eq("student_id", user.id);

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error: any) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) {
      toast.error("Please log in to enroll in a course");
      return { success: false, pendingPayment: false };
    }

    // Check if already enrolled
    const existingEnrollment = enrollments.find(e => e.course_id === courseId);
    if (existingEnrollment) {
      if (existingEnrollment.status === 'pending_payment') {
        toast.error("Your enrollment is pending payment approval");
        return { success: false, pendingPayment: true };
      }
      toast.error("You are already enrolled in this course");
      return { success: false, pendingPayment: false };
    }

    try {
      // Use secure RPC function for enrollment
      const { data, error } = await supabase
        .rpc('request_enrollment', { _course_id: courseId });

      if (error) throw error;

      // Check if this is a paid course (enrollment created with pending_payment status)
      const course = courses.find(c => c.id === courseId);
      const isPaidCourse = course?.price && course.price > 0;

      if (isPaidCourse) {
        toast.info("Enrollment submitted! Your access will be activated after payment confirmation.");
        await fetchEnrollments();
        return { success: true, pendingPayment: true };
      }

      toast.success("Successfully enrolled in course!");
      await fetchEnrollments();
      return { success: true, pendingPayment: false };
    } catch (error: any) {
      console.error("Error enrolling:", error);
      const message = error.message || "Failed to enroll in course";
      toast.error(message);
      return { success: false, pendingPayment: false };
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(e => e.course_id === courseId);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchEnrollments()]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  return {
    courses,
    enrollments,
    loading,
    enrollInCourse,
    isEnrolled,
    refetch: () => Promise.all([fetchCourses(), fetchEnrollments()]),
  };
}
