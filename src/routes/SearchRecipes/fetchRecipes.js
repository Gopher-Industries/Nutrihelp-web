import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
let supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
let supabase = createClient(supabaseUrl, supabaseKey);


export async function fetchRecipes() {
    try {
        let { data, error } = await supabase
            .from('recipes')
            .select('*');

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.log(error)
    }
}