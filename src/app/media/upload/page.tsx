'use client';

import { useState, ChangeEvent } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import Image from "next/image";
import Button from "@/components/Button";
import {UserAuth} from "@/context/AuthContext";

interface FileWithPreview extends File {
    name: string;
    preview: string;
}

export default function UploadImage() {
    const [image, setImage] = useState<File | null>(null);
    const [url, setUrl] = useState<string>('');
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [message, setMessage] = useState<string>('');
    const { user, googleSignIn, logOut} = UserAuth();
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleLoginGoogle = async () => {
        try{
            await googleSignIn()
        }catch(e){
            console.log(e)
        }
    }

    const handleUpload = () => {
        if (image) {
            const storageRef = ref(storage, `images/${image.name}`);
            const uploadTask = uploadBytesResumable(storageRef, image);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Opcional: puedes agregar un manejador de progreso aquí
                },
                (error) => {
                    console.error('Error al subir la imagen: ', error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setUrl(downloadURL);
                        console.log('Imagen disponible en: ', downloadURL);
                    });
                }
            );
        }
    };

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage('');
        const fileList = e.target.files;

        if (fileList) {
            const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
            const newFiles: FileWithPreview[] = [];

            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (validImageTypes.includes(file.type)) {
                    newFiles.push({...file,name: file.name, preview: URL.createObjectURL(file)});
                    console.log({newFiles})
                } else {
                    setMessage('Only images accepted');
                }
            }
            setFiles([...files, ...newFiles]);
        }
    };

    const removeImage = (fileName: string) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    return (
        <div className="h-screen flex justify-center items-center bg-gray-900 px-2">
            {!user ? (<Button onClick={handleLoginGoogle} text="Ingresar con Google" />) :(
                <div className="block">
                    <p>¡Hola, {user.displayName}! </p>
                    <div className="flex mt-4 gap-x-2">
                        <Button onClick={logOut} text="Salir" color="red"  />
                        <Button isLink={{href:"/dashboard"}} color="blue" text="Dashboard" />
                    </div>
                </div>
            )}
            {!user ? <p >Inicia sesión para subir imágenes</p> : <div className="p-3 md:w-[600px] w-[360px] rounded-md">
                <span
                    className="flex justify-center items-center bg-white text-[12px] mb-1 text-red-500">{message}</span>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file"
                           className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                className="font-semibold">Tap to upload</span></p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX.
                                800x400px)</p>
                        </div>
                        <input
                            type="file"
                            onChange={handleFile}
                            className=" hidden"
                            multiple
                            name="files[]"
                            id="dropzone-file"
                        />
                    </label>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((file, key) => (
                        <div key={key}
                             className="w-full h-16 flex items-center justify-between p-3 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                            <div className="flex flex-row items-center gap-2">
                                <div className="size-12">
                                    <Image className="w-full h-full rounded" width={12} height={12} src={file.preview}
                                           alt={file.name}/>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
                            </div>

                            <Button text="Eliminar" onClick={() => removeImage(file.name)} color="red"
                                    className="transition-all text-xs"/>

                        </div>
                    ))}
                </div>
                <Button text={`Subir ${files.length > 1 ? `(${files.length}) imagenes` : ''}`}
                        className="transition-all mt-5 w-full" disabled={files.length == 0}/>
            </div>}
        </div>
    );
}
