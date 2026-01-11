-- Fix 1: Make lesson-materials storage bucket private
UPDATE storage.buckets SET public = false WHERE id = 'lesson-materials';

-- Fix 2: Drop the permissive storage policy and add enrollment-based access
DROP POLICY IF EXISTS "Anyone can view lesson materials files" ON storage.objects;

-- Add policy: Enrolled students can download materials for their enrolled courses
CREATE POLICY "Enrolled students can view lesson materials files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'lesson-materials' AND
  (
    -- Admins can view all
    has_role(auth.uid(), 'admin'::app_role) OR
    -- Tutors assigned to courses can view
    EXISTS (
      SELECT 1 FROM tutor_courses tc
      WHERE tc.tutor_id = auth.uid()
    ) OR
    -- Enrolled students can view materials for their enrolled courses
    EXISTS (
      SELECT 1 FROM lesson_materials lm
      JOIN lessons l ON l.id = lm.lesson_id
      JOIN enrollments e ON e.course_id = l.course_id
      WHERE lm.file_url LIKE '%' || name || '%'
      AND e.student_id = auth.uid()
      AND e.status = 'active'
    )
  )
);

-- Fix 3: Drop the permissive lesson_materials table policy and add enrollment-based access
DROP POLICY IF EXISTS "Anyone can view lesson materials" ON public.lesson_materials;

-- Enrolled students can view materials for their enrolled courses
CREATE POLICY "Enrolled students can view lesson materials"
ON public.lesson_materials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN enrollments e ON e.course_id = l.course_id
    WHERE l.id = lesson_materials.lesson_id
    AND e.student_id = auth.uid()
    AND e.status = 'active'
  )
);

-- Fix 4: Handle enrollment security
-- Remove direct INSERT policy for students to prevent payment bypass
DROP POLICY IF EXISTS "Students can enroll themselves" ON public.enrollments;

-- Create a secure enrollment function that can be called by authenticated users
-- This gives us a centralized place to add payment verification later
CREATE OR REPLACE FUNCTION public.request_enrollment(_course_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enrollment_id UUID;
  _course_price NUMERIC;
  _existing_enrollment UUID;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if course exists and is active
  SELECT price INTO _course_price
  FROM courses
  WHERE id = _course_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found or not active';
  END IF;

  -- Check for existing enrollment
  SELECT id INTO _existing_enrollment
  FROM enrollments
  WHERE student_id = auth.uid() AND course_id = _course_id;
  
  IF _existing_enrollment IS NOT NULL THEN
    RAISE EXCEPTION 'Already enrolled in this course';
  END IF;

  -- For free courses (price is null or 0), allow direct enrollment
  -- For paid courses, this is where payment verification would go
  IF _course_price IS NOT NULL AND _course_price > 0 THEN
    -- TODO: Add payment verification here when Stripe is integrated
    -- For now, create enrollment in 'pending_payment' status for paid courses
    INSERT INTO enrollments (student_id, course_id, status, current_phase, progress)
    VALUES (auth.uid(), _course_id, 'pending_payment', 1, 0)
    RETURNING id INTO _enrollment_id;
  ELSE
    -- Free courses get immediate active enrollment
    INSERT INTO enrollments (student_id, course_id, status, current_phase, progress)
    VALUES (auth.uid(), _course_id, 'active', 1, 0)
    RETURNING id INTO _enrollment_id;
  END IF;

  RETURN _enrollment_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.request_enrollment(UUID) TO authenticated;

-- Admin function to activate enrollment (e.g., after manual payment verification)
CREATE OR REPLACE FUNCTION public.admin_activate_enrollment(_enrollment_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  UPDATE enrollments
  SET status = 'active'
  WHERE id = _enrollment_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users (function checks admin role internally)
GRANT EXECUTE ON FUNCTION public.admin_activate_enrollment(UUID) TO authenticated;