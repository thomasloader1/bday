import React, {ChangeEvent, FC} from 'react'
import Image from "next/image";
import Button from "@/components/Button";
import {FileWithPreview, UploadingFiles} from "@/app/[id]/media/upload/page";

interface Props {
    handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
    handleUpload: (file: FileWithPreview) => void;
    removeImage: (fileName: string) => void;
    uploading: UploadingFiles[] ;
    files: FileWithPreview[]
}

const DropZoneFile: FC<Props> = ({files,uploading, handleUpload, handleFile, removeImage}) => {

    return (
        <>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file"
                       className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                            className="font-semibold">Tap to upload</span></p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
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
                {files.map((file, key) =>
                    <div key={`${file.name}_${key}`}
                         className="w-full h-16 flex items-center justify-between p-3 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-row items-center gap-2">
                            <div className="size-12">
                                <Image className="w-full h-full rounded" width={12} height={12}
                                       src={file.preview} alt={file.name}/>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
                        </div>
                        <div className="flex items-center">
                            <Button text={`Subir`}
                                    className={`transition-all text-xs mb-0 ${uploading[key]?.up}`}
                                    disabled={uploading[key]?.up}
                                    loading={uploading[key]?.up}
                                    onClick={() => handleUpload(file)}/>
                            <Button text="Eliminar" className="transition-all text-xs mb-0"
                                    disabled={uploading[key]?.up} onClick={() => removeImage(file.name)}
                                    color="red"/>
                        </div>
                    </div>
                )}
            </div>
        </>
)
}

export default DropZoneFile