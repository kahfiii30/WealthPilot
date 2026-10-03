-- Migration: Create goals table and configure RLS

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL DEFAULT 'auto',
    manual_target NUMERIC NOT NULL DEFAULT 0,
    auto_months INTEGER NOT NULL DEFAULT 6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- RLS Audit & Setup
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" 
    ON public.goals FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
    ON public.goals FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
    ON public.goals FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
    ON public.goals FOR DELETE 
    USING (auth.uid() = user_id);

-- Also ensure RLS is enabled on all other tables as part of the audit
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
