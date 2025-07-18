import { supabase } from "@/lib/supabaseClient";
import { string } from "zod";
import { useAuth } from "./useAuth";
import useSWR from "swr";
import { add, format } from "date-fns";
import { toast } from "sonner";

export interface Moment {
    id : string;
    user_id : string;
    created_at : string;
    text : string;
    moment_date : string;
}

const fetcher = async ([ _key , userId ] : [ string , string] ) : Promise<Moment[]> => {
    const { data , error } = await supabase.from('memorable_moments').select('*').eq('user_id',userId).order('moment_date',{ ascending : false }).order('created_at' , { ascending : false });
    if(error) {
        console.error('Error fetching moments',error);
        throw error;
    }

    return data || [];
}

export function useMoments() {
    const { user } = useAuth();
    const { data: moments , error , mutate } = useSWR<Moment[]>( user ? [ 'moments' , user.id ] : null , fetcher );

    const addMoment = async ( newMoment : { text : string } ) => {
        if(!user || !newMoment.text.trim()) return;

        try {
            const momentData = {
                text : newMoment.text,
                user_id : user.id,
                moment_date : format(new Date() , 'yyyy-MM-dd'),
            };

            const { error } = await supabase.from('memorable_moments').insert(momentData);
            if(error) throw error;
            toast.success("Moment saved");
            mutate();
        } catch(err : any) {
            console.error("Error adding moment : ",err);
            toast.error("Failed to save moment.");
        }
    };

    const deleteMoment = async ( momentId : string ) => {
        if(!user) return;
        const originalMoments = moments || [];
        const updatedMoments = originalMoments.filter(m => m.id !== momentId);
        mutate(updatedMoments , false);

        try {
            const { error } = await supabase.from('memorable_moments').delete().eq('id',momentId);
            if(error) throw error;
            toast.success("Moment deleted");
        } catch (error : any) {
            console.error("Error deleting");
            toast.error("Failed to delete moment");
            mutate(originalMoments,false);
        }
    };

    return {
        moments : moments || [],
        isLoading : !error && !moments,
        error,
        addMoment,
        deleteMoment,
    };
}