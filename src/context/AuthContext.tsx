'use client'
import { useContext, createContext, useState, useEffect, FC } from "react";
import {signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, User} from "firebase/auth";
import { auth } from "@/config/firebase";

interface UserData extends User {
    displayName: string,
    email: string,
}

const AuthContext = createContext({
    user: {} as UserData,
    googleSignIn: () => {},
    logOut: () => {}
});

export const AuthContextProvider: FC<{children:any}> = ({ children }) => {

    const [user, setUser] = useState<UserData>()

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
    }

    const logOut = () => {
        signOut(auth)
    }


    useEffect(()=>{
        const unsuscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser as UserData)
        })

        return () => unsuscribe()
    },[])

    return (<AuthContext.Provider value={{ user: user as UserData, googleSignIn, logOut }} >{children}</AuthContext.Provider>)
}

export const UserAuth = () =>{
    return useContext(AuthContext)
}