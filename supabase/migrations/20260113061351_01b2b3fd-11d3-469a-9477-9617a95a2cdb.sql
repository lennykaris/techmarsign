-- Fix enrollment status constraint to include 'pending_payment' status
-- The request_enrollment() function creates enrollments with 'pending_payment' status for paid courses
-- but the existing CHECK constraint doesn't allow this status

-- First, drop the existing constraint
ALTER TABLE public.enrollments 
DROP CONSTRAINT IF EXISTS enrollments_status_check;

-- Add the updated constraint that includes 'pending_payment' and 'payment_failed' statuses
ALTER TABLE public.enrollments
ADD CONSTRAINT enrollments_status_check
CHECK (status IN (
  'pending_payment',
  'active', 
  'completed', 
  'paused', 
  'cancelled',
  'payment_failed'
));