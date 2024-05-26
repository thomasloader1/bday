import React, {FC, ReactElement, ReactNode} from 'react';
import Button from "@/components/Button";
import { UserAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import FadeUp from "@/components/Styling/FadeUp";
import {useParams} from "next/navigation";

export default function Authenticated(){
    const { user, googleSignIn, logOut} = UserAuth();
    const authUser: {displayName?: string} = user;
    const { id} = useParams();

    const handleLoginGoogle = async () => {
        try{
            await googleSignIn()
        }catch(e){
            console.log(e)
        }
    }

    if(typeof user === 'undefined'){
        return <LoadingSpinner text="Verificando datos" />
    }

    return(
        <FadeUp>
            {!authUser?.displayName ? (
                <div className="flex flex-col">
                    <Button onClick={handleLoginGoogle} text="Ingresar con Google" className="mb-5" />
                    <p >Inicia sesión para subir imágenes</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    <p className="text-center">¡Hola, {authUser.displayName}! </p>
                    <div className="flex mt-4 gap-x-2">
                        <Button onClick={logOut} text="Salir" color="red"  />
                        <Button isLink={{ href: `/${id}/media` }} color="blue" text="Dashboard" />
                    </div>
                </div>
            )}
        </FadeUp>
        )
}