import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL SCHEMA (Supabase):
 * 
 * -- Tasks table
 * CREATE TABLE tasks (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id),
 *   title TEXT NOT NULL,
 *   priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
 *   status TEXT CHECK (status IN ('Pending', 'Completed', 'In Progress')) DEFAULT 'Pending',
 *   deadline TIMESTAMP WITH TIME ZONE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Emails table
 * CREATE TABLE emails (
 *   id TEXT PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id),
 *   subject TEXT,
 *   sender TEXT,
 *   snippet TEXT,
 *   summary TEXT,
 *   priority TEXT,
 *   cta TEXT,
 *   timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable RLS
 * ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create policies
 * CREATE POLICY "Users can only see their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can only see their own emails" ON emails FOR ALL USING (auth.uid() = user_id);
 */
