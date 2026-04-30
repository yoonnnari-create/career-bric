import { supabase } from './supabase';

export const isAdmin = async (email?: string | null): Promise<boolean> => {
  if (!email) return false;
  
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
