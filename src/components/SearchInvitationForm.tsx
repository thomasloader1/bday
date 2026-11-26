import { useRouter } from 'next/navigation'
import React, { FormEvent, useState } from 'react'
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
        <form onSubmit={handleSubmit} className="w-full max-w-xl">
            <label htmlFor="search" className="mb-2 block text-sm font-medium text-ink">
                Tu número de teléfono
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="search"
                    id="search"
                    name="telefono"
                    inputMode="tel"
                    autoComplete="tel"
                    className="h-[3.25rem] w-full min-w-0 rounded-input sm:flex-1 border border-rule bg-surface px-4 shadow-sm text-base text-ink placeholder:text-muted"
                    placeholder="11XXXXXXXX"
                    required
                    onChange={handleInputChange}
                    value={inviteNumber}
                />
                <Button type="submit" variant="primary" size="lg">
                    Buscar invitación
                </Button>
            </div>
        </form>
    )
}

export default SearchInvitationForm
