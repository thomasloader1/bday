'use client'
import React from 'react'
import IconBackground from "@/components/CakeBackground";
import { GiPartyPopper } from "react-icons/gi";
import FadeUp from "@/components/Styling/FadeUp";
import useGuest from "@/hooks/useGuestData";
import Button from "@/components/Button";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function Page({params}:{params:{id:number}}){

    const {guestData} = useGuest({id: params.id})
    console.log(guestData)

    return (
        <FadeUp>
            <IconBackground icon={<GiPartyPopper/>}/>
            <main className="container mx-auto my-auto sm:px-8 sm:pt-10 md:flex md:justify-center md:items-center">
                <div className="bg-white p-4 sm:p-10 text-gray-800 sm:rounded-lg shadow-md">
                    <Button text="Subir una foto del evento" className="mx-auto"
                            isLink={{href: `/${guestData.id}/media/upload`}} color="blue"/>

                    <hr className="border-2 my-8"/>

                    <div >
                        {
                            guestData.images.length > 0 ?
                                <>
                                    {guestData.images.map((image, index) => <Image width={100} height={100}
                                                                                   key={`${guestData.id}_${index}_img`}
                                                                                   src={image}
                                                                                   alt={`${guestData.id}_${index}_img`}
                                                                                   className="w-full h-64 object-cover"/>)}
                                </>
                                :
                                <h3 className=" text-2xl font-bold">No hay imagenes cargadas aun</h3>
                        }
                    </div>


                </div>
            </main>
        </FadeUp>
    )
}