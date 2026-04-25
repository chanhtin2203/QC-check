import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zhqzqyorubvomcplnrlq.supabase.co';
const supabaseAnonKey = 'sb_publishable_YVTsCj7W24ljVf4oDCroEQ_hXpyZZWq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
