import React, { useState } from 'react'
import RequirementList from './RequirementList';
import PlacesToGo from './PlacesToGo';
import Button from './Button';

const InvitationPersonalInfo = () => {

  const [requirements] = useState([{name:"Vestimenta", description:"Sport"},{name:"Horario", description:"20hs a 00hs"}])

  return (
    <div className='px-2 py-4 rounded-md'>
      <h2 className='text-3xl mb-3 font-bold'>Invitacion Personal</h2>
         <div className='mb-10'>
            <p>Honestamente, no tengo ni idea de qué hacer.</p>
            <p  className="mb-5" >Simplemente quiero pasar el día contigo y ver qué onda, dentro de las posibilidades que tengamos.</p>

            <div className="p-4 text-sm text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300" role="alert">
            <span className="font-medium">PD:</span> Seguramente pidamos pizza
          </div>
         </div>


        <RequirementList items={requirements} />
        <Button text="Saber mas" onClick={()=>{}} className='text-xl w-full' />
        {/* <PlacesToGo /> */}
    </div>
  )
}

export default InvitationPersonalInfo