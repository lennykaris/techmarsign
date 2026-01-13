-- Add audit logging for role changes and enrollment actions
-- This addresses the security_definer_role_funcs warning

-- Create role change audit table
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role public.app_role,
  new_role public.app_role NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on role_change_audit
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view role change audit logs
CREATE POLICY "Admins can view role change audit"
ON public.role_change_audit
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by)
  VALUES (NEW.user_id, OLD.role, NEW.role, auth.uid());
  RETURN NEW;
END;
$$;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS audit_role_changes ON public.user_roles;
CREATE TRIGGER audit_role_changes
AFTER UPDATE ON public.user_roles
FOR EACH ROW
WHEN (OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION public.log_role_change();

-- Create enrollment attempt tracking table for rate limiting
CREATE TABLE IF NOT EXISTS public.enrollment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_enrollment_attempts_user_time 
ON public.enrollment_attempts(user_id, attempted_at DESC);

-- Enable RLS on enrollment_attempts
ALTER TABLE public.enrollment_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view enrollment attempts
CREATE POLICY "Admins can view enrollment attempts"
ON public.enrollment_attempts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Update request_enrollment function to include rate limiting and audit logging
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
  _recent_attempts INTEGER;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 10 enrollment attempts in last hour
  SELECT COUNT(*) INTO _recent_attempts
  FROM public.enrollment_attempts
  WHERE user_id = auth.uid()
    AND attempted_at > now() - INTERVAL '1 hour';
  
  IF _recent_attempts >= 10 THEN
    -- Log failed attempt due to rate limit
    INSERT INTO public.enrollment_attempts (user_id, course_id, success)
    VALUES (auth.uid(), _course_id, false);
    
    RAISE EXCEPTION 'Too many enrollment attempts. Please try again later.';
  END IF;

  -- Check if course exists and is active
  SELECT price INTO _course_price
  FROM public.courses
  WHERE id = _course_id AND is_active = true;
  
  IF NOT FOUND THEN
    -- Log failed attempt
    INSERT INTO public.enrollment_attempts (user_id, course_id, success)
    VALUES (auth.uid(), _course_id, false);
    
    RAISE EXCEPTION 'Course not found or not active';
  END IF;

  -- Check for existing enrollment
  SELECT id INTO _existing_enrollment
  FROM public.enrollments
  WHERE student_id = auth.uid() AND course_id = _course_id;
  
  IF _existing_enrollment IS NOT NULL THEN
    -- Log failed attempt
    INSERT INTO public.enrollment_attempts (user_id, course_id, success)
    VALUES (auth.uid(), _course_id, false);
    
    RAISE EXCEPTION 'Already enrolled in this course';
  END IF;

  -- For free courses (price is null or 0), allow direct enrollment
  -- For paid courses, this is where payment verification would go
  IF _course_price IS NOT NULL AND _course_price > 0 THEN
    -- Create enrollment in 'pending_payment' status for paid courses
    INSERT INTO public.enrollments (student_id, course_id, status, current_phase, progress)
    VALUES (auth.uid(), _course_id, 'pending_payment', 1, 0)
    RETURNING id INTO _enrollment_id;
  ELSE
    -- Free courses get immediate active enrollment
    INSERT INTO public.enrollments (student_id, course_id, status, current_phase, progress)
    VALUES (auth.uid(), _course_id, 'active', 1, 0)
    RETURNING id INTO _enrollment_id;
  END IF;

  -- Log successful attempt
  INSERT INTO public.enrollment_attempts (user_id, course_id, success)
  VALUES (auth.uid(), _course_id, true);

  RETURN _enrollment_id;
END;
$$;