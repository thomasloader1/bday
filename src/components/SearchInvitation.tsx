import { useRouter } from 'next/navigation'
import React, { FormEvent, useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa'

const SearchInvitation = () => {
    const router = useRouter()
  const [inviteNumber, setInviteNumber] = useState("");
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInviteNumber(event.target.value);
  };
  
  const handleSubmit = (e: FormEvent) =>{
        e.preventDefault()
        router.push(inviteNumber)
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-[500px] px-10">
            <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Buscar invitacion</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <input type="search" id="search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500" placeholder="Buscar invitacion" required onChange={handleInputChange} value={inviteNumber} />
                <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800"><FaPaperPlane /></button>
            </div>
        </form>

    )
}

export default SearchInvitation