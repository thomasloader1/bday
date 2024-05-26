'use client';

import React, { useState, ChangeEvent } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { UserAuth } from "@/context/AuthContext";
import Authenticated from "@/components/Authenticated";
import FadeUp from "@/components/Styling/FadeUp";
import DropZoneFile from "@/components/DropZoneFile";
import {updateGuest} from "@/lib/firebase";
import useGuest from "@/hooks/useGuestData";
import Button from "@/components/Button";

export interface FileWithPreview extends File {
    name: string;
    preview: string;
}

export interface UploadingFiles {
    up: boolean;
    id: string;
}

export default function UploadImage({ params }: { params: { id: number } }) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploading, setUploading] = useState<UploadingFiles[]>([]);
    const [message, setMessage] = useState<string>('');
    const {findGuest, guestData} = useGuest({id: params.id});
    console.log(findGuest, guestData)
   // const { user} = UserAuth();

    const handleUpload = async (file: FileWithPreview) => {
        const [uploadTheFile] = uploading.filter( (u) => u.id.includes(file.name))
        //console.log({uploading,name: file.name, uploadTheFile})

        const newStateShow = uploading.map((u) => {
            //console.log(u)
            if (u.id.includes(uploadTheFile.id)) {
                return {...uploadTheFile, up: true};
            } else {
                return {...u};
            }
        });

        const storageRef = ref(storage, `images/${guestData.id}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',(snapshot) => {
            setUploading(newStateShow)
            },(error) => {
                console.error('Error al subir la imagen: ', error);
            },() => {

            getDownloadURL(uploadTask.snapshot.ref).then((download) => {
                guestData.images.push(download)
                updateGuest(guestData.id.toString(),guestData, null)
                removeImage(file.name)
                console.log('Imagen subida: ', download)
            });
            })

    }

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage('');
        const fileList = e.target.files;

        if (fileList) {
            const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
            const newFiles: FileWithPreview[] = [];
            const newUploads: UploadingFiles[] = [];

            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (validImageTypes.includes(file.type)) {
                    newFiles.push({...file,name: file.name, preview: URL.createObjectURL(file)});
                    newUploads.push({up: false, id: `${file.name}_${i}`})
                    console.log({newFiles, newUploads})
                } else {
                    setMessage('Only images accepted');
                }
            }

            setFiles(() => {
                setUploading([...uploading, ...newUploads]);
                return [...files, ...newFiles]
            });
        }
    };

    const removeImage = (fileName: string) => {
        setFiles(() =>{
            setUploading(uploading.filter(upload => !upload.id.includes(fileName)));
            return files.filter(file => file.name !== fileName)
        });
    };

    return (
        <div className="h-screen flex flex-col justify-center items-center px-2">
            { guestData && (
                <FadeUp delay={1}>

                    <div className="p-3 md:w-[600px] w-[360px] rounded-md">
                        <Button text="Volver a media" isLink={{href: `/${guestData.id}/media`}} color="blue" className="flex justify-center mx-2 "/>

                        <span className="flex justify-center items-center bg-white text-[12px] mb-1 text-red-500">{message}</span>
                        <DropZoneFile
                           files={files}
                           uploading={uploading}
                           handleFile={handleFile}
                           handleUpload={handleUpload}
                           removeImage={removeImage}
                       />
                    </div>
                </FadeUp>
            )}

        </div>
    );
}
