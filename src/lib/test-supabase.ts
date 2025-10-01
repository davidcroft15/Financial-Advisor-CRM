import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('advisors').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connected successfully!');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
};

export const testAuth = async () => {
  try {
    console.log('Testing Supabase Auth...');
    
    // Check current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error:', error);
      return false;
    }
    
    console.log('Auth working! Session:', session ? 'Active' : 'No session');
    return true;
  } catch (err) {
    console.error('Auth test failed:', err);
    return false;
  }
};
