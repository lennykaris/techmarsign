-- Create lessons table for course content
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  phase_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  due_days INTEGER DEFAULT 7,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  submission_text TEXT,
  file_url TEXT,
  score INTEGER,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE
);

-- Create lesson progress table
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, student_id)
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Lessons policies
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Tutors can manage lessons for their courses" ON public.lessons FOR ALL 
  USING (EXISTS (SELECT 1 FROM tutor_courses tc WHERE tc.tutor_id = auth.uid() AND tc.course_id = lessons.course_id));
CREATE POLICY "Admins can manage all lessons" ON public.lessons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Assignments policies
CREATE POLICY "Anyone can view assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Tutors can manage assignments for their courses" ON public.assignments FOR ALL 
  USING (EXISTS (SELECT 1 FROM tutor_courses tc WHERE tc.tutor_id = auth.uid() AND tc.course_id = assignments.course_id));
CREATE POLICY "Admins can manage all assignments" ON public.assignments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Submission policies
CREATE POLICY "Students can view own submissions" ON public.assignment_submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can submit assignments" ON public.assignment_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Tutors can view submissions for their courses" ON public.assignment_submissions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM assignments a JOIN tutor_courses tc ON tc.course_id = a.course_id WHERE a.id = assignment_submissions.assignment_id AND tc.tutor_id = auth.uid()));
CREATE POLICY "Tutors can grade submissions" ON public.assignment_submissions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM assignments a JOIN tutor_courses tc ON tc.course_id = a.course_id WHERE a.id = assignment_submissions.assignment_id AND tc.tutor_id = auth.uid()));
CREATE POLICY "Admins can manage all submissions" ON public.assignment_submissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Lesson progress policies
CREATE POLICY "Students can view own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can update own progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can mark lessons complete" ON public.lesson_progress FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Tutors can view student progress" ON public.lesson_progress FOR SELECT 
  USING (EXISTS (SELECT 1 FROM lessons l JOIN tutor_courses tc ON tc.course_id = l.course_id WHERE l.id = lesson_progress.lesson_id AND tc.tutor_id = auth.uid()));
CREATE POLICY "Admins can view all progress" ON public.lesson_progress FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();