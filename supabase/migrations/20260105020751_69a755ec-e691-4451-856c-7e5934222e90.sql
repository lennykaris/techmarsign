-- Create storage bucket for assignment files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('assignments', 'assignments', false, 10485760); -- 10MB limit

-- Policy for students to upload their submissions
CREATE POLICY "Students can upload submission files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignments' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'submissions'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy for students to view their own submission files
CREATE POLICY "Students can view own submission files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignments' 
  AND (storage.foldername(name))[1] = 'submissions'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy for tutors to view submission files for their courses
CREATE POLICY "Tutors can view submission files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = 'submissions'
  AND EXISTS (
    SELECT 1 FROM public.tutor_courses tc
    WHERE tc.tutor_id = auth.uid()
  )
);

-- Policy for admins to manage all files
CREATE POLICY "Admins can manage all assignment files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'assignments'
  AND public.has_role(auth.uid(), 'admin')
);