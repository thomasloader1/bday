import React, { useState } from 'react'
import RequirementList from './RequirementList';
import Button from './ui/Button';
import { FaCalendar } from 'react-icons/fa6';
import { saveTheDate } from '@/lib/saveTheDate';

const InvitationPersonalInfo = () => {

  const [requirements] = useState([{name:"Vestimenta", description:"Sport"},{name:"Horario", description:"20hs a 00hs"}])

  return (
    <div className='px-2 py-4 md:px-5 rounded-md'>
      <h2 className='text-3xl mb-5 font-bold'>Invitacion Personal</h2>
         <div className='mb-10'>
            <p>Honestamente, no tengo ni idea de qué hacer.</p>
            <p  className="mb-5" >Simplemente quiero pasar el día contigo y ver qué onda, dentro de las posibilidades que tengamos.</p>

            <div className="p-4 text-sm text-gray-800 rounded-lg dark:text-gray-300" role="alert">
            <span className="font-medium">PD:</span> Seguramente pidamos pizza
          </div>
         </div>


        <RequirementList items={requirements} />
        <Button
            variant="secondary"
            fullWidth
            icon={<FaCalendar />}
            onClick={() => saveTheDate("", "")}
        >
            Agendar en calendario
        </Button>
    </div>
  )
}

export default InvitationPersonalInfo
