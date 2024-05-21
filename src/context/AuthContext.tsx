'use client'
import { useContext, createContext, useState, useEffect, FC } from "react";
import {signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, User} from "firebase/auth";
import { auth } from "@/config/firebase";

const AuthContext = createContext({
    user: {},
    googleSignIn: () => {},
    logOut: () => {}
});

export const AuthContextProvider: FC<{children:any}> = ({ children }) => {

    const [user, setUser] = useState<User>()

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
    }

    const logOut = () => {
        signOut(auth)
    }


    useEffect(()=>{
        const unsuscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser as User)
        })

        return () => unsuscribe()
    },[])

    return (<AuthContext.Provider value={{user: user as User, googleSignIn, logOut }} >{children}</AuthContext.Provider>)
}

export const UserAuth = () =>{
    return useContext(AuthContext)
}