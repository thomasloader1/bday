import { useRouter } from 'next/navigation'
import React, { FormEvent, useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa6'
import Button from './ui/Button'

const SearchInvitationForm = () => {
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
            <label htmlFor="search" className="sr-only">Buscar invitación</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-neutral-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <input type="search" id="search" className="block w-full p-4 ps-10 text-base text-neutral-900 border border-neutral-300 rounded-lg bg-neutral-50 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2" placeholder="Buscar invitación" required onChange={handleInputChange} value={inviteNumber} />
                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={<FaPaperPlane />}
                    aria-label="Buscar invitación"
                    className="absolute end-2.5 bottom-2.5"
                />
            </div>
        </form>

    )
}

export default SearchInvitationForm
