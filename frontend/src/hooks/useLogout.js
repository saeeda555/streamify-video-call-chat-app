import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api.js";
import { useNavigate } from "react-router";


const useLogout = ()=>{
    const navigate = useNavigate()
    const queryClient = useQueryClient();

    const {mutate:logoutMutation, isPending, error} = useMutation({
        mutationFn: logout,
        onSuccess: ()=>{queryClient.invalidateQueries({queryKey:["authUser"]})

        
    }  
     });
    return {logoutMutation,isPending, error}
}

export default useLogout;

