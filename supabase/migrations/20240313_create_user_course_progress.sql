-- Create the user_course_progress table
CREATE TABLE IF NOT EXISTS public.user_course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    subjects_data JSONB DEFAULT '{}'::jsonb,
    performance_goal INTEGER DEFAULT 85,
    exam_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, course_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to view and edit only their own progress
CREATE POLICY "Users can view own progress"
    ON public.user_course_progress
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
    ON public.user_course_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON public.user_course_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_course
    ON public.user_course_progress(user_id, course_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before update
CREATE TRIGGER update_user_course_progress_updated_at
    BEFORE UPDATE ON public.user_course_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
