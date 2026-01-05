-- Create lesson_materials table
CREATE TABLE public.lesson_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

-- Anyone can view materials for lessons they can access
CREATE POLICY "Anyone can view lesson materials"
ON public.lesson_materials
FOR SELECT
USING (true);

-- Tutors can manage materials for their courses
CREATE POLICY "Tutors can manage materials for their courses"
ON public.lesson_materials
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN tutor_courses tc ON tc.course_id = l.course_id
    WHERE l.id = lesson_materials.lesson_id AND tc.tutor_id = auth.uid()
  )
);

-- Admins can manage all materials
CREATE POLICY "Admins can manage all materials"
ON public.lesson_materials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for lesson materials
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('lesson-materials', 'lesson-materials', true, 52428800);

-- Storage policies for lesson materials
CREATE POLICY "Anyone can view lesson materials files"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-materials');

CREATE POLICY "Tutors can upload lesson materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-materials' AND
  EXISTS (
    SELECT 1 FROM tutor_courses tc WHERE tc.tutor_id = auth.uid()
  )
);

CREATE POLICY "Tutors can delete their lesson materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-materials' AND
  EXISTS (
    SELECT 1 FROM tutor_courses tc WHERE tc.tutor_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all lesson materials files"
ON storage.objects FOR ALL
USING (bucket_id = 'lesson-materials' AND has_role(auth.uid(), 'admin'::app_role));