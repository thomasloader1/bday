import React, { FC } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from "@/components/Button";
import {Guest} from "@/types/Guest";
import {ConfirmationData} from "@/components/Invitation";

interface FormData {
    name: string;
    email: string;
    phone: string;
    attending: string;
}

const validationSchema = Yup.object({
    name: Yup.string().required('El nombre es obligatorio').min(10,'El nombre completo'),
    email: Yup.string()
        .email('El correo electrónico no es válido')
        .required('El correo electrónico es obligatorio'),
    phone: Yup.string().required('El teléfono es obligatorio'),
    attending: Yup.string().required('Por favor seleccione una opción'),
});

interface Props {
    handleConfirm: (confirmedData: ConfirmationData) => void;
    handleNoConfirm: (confirmedData: ConfirmationData) => void;
    onRequestConfirm: boolean;
    onRequestNoConfirm: boolean;
    guestData: Guest;
}

const GuestForm: FC<Props> = ({handleConfirm, handleNoConfirm, onRequestConfirm, onRequestNoConfirm, guestData}) => {
    const initialValues: FormData = {
        name: guestData.name,
        email: guestData.email as string,
        phone: guestData.id.toString(),
        attending: '',
    };

    const handleSubmit = (values: FormData, { setSubmitting }: any) => {
        console.log(values);
        setSubmitting(false);
        if(values.attending === 'yes'){
            handleConfirm(values);
        }else{
            handleNoConfirm(values);
        }
    };

    return (

            <div className="text-gray-700 text-left border-[4px] p-6 rounded-xl">
                <h1 className="text-xl font-bold mb-6 md:text-center">Confirmacion de asistencia</h1>
                <hr className="mb-4 border-2"/>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({values, errors}) => (
                        <Form className="grid grid-cols-1 gap-6">
                            <div className="col-span-1">
                                <label htmlFor="name" className="block text-sm font-medium">Nombre Completo:</label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <ErrorMessage name="name" component="p" className="text-red-500 text-sm mt-1"/>
                            </div>
                            <div className="col-span-1">
                                <label htmlFor="email" className="block text-sm font-medium ">Correo
                                    Electrónico:</label>
                                <Field
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1"/>
                            </div>
                            <div className="col-span-1">
                                <label htmlFor="phone" className="block text-sm font-medium ">Teléfono:</label>
                                <Field
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <ErrorMessage name="phone" component="p" className="text-red-500 text-sm mt-1"/>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium ">¿Asistirás?</label>
                                <div className="mt-2 flex items-center space-x-6">
                                    <label className="inline-flex items-center">
                                        <Field
                                            type="radio"
                                            name="attending"
                                            value="yes"
                                            className="form-radio"
                                        />
                                        <span className="ml-2">Sí</span>
                                    </label>
                                    <label className="inline-flex items-center ">
                                        <Field
                                            type="radio"
                                            name="attending"
                                            value="no"
                                            className="form-radio"
                                        />
                                        <span className="ml-2">No</span>
                                    </label>
                                </div>
                                <ErrorMessage name="attending" component="p" className="text-red-500 text-sm mt-1"/>
                            </div>
                            <Button type="submit" text={"Enviar"} disabled={Object.entries(errors).length > 0}
                                    loading={onRequestConfirm}/>

                            {values.attending === 'no' && (
                                <div>
                                    <p className="mt-4 text-center text-gray-700 font-medium">Que pena no puedas
                                        asistir.</p>
                                    <p className="text-center text-gray-700 text-md">Completa el formulario para que
                                        quede acentado.</p>
                                </div>
                            )}
                        </Form>
                    )}
                </Formik>
            </div>
    );
}

export default GuestForm;
