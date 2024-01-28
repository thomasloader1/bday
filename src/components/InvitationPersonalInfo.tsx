import React from 'react'
import RequirementList from './RequirementList';
import PlacesToGo from './PlacesToGo';

const InvitationPersonalInfo = () => {
  return (
    <div className='my-5 mb-48'>
      <h2 className='text-3xl mb-3 font-bold'>Invitacion Personal</h2>
         <div className='mb-10'>
            <p className="mb-5">
                La verdad que no tengo la mas puta idea de que hacer,
                simplemente quiero pasar mi dia junto a vos y ver que sale
                dentro de las posibilidades de todos
            </p>

            <div className="p-4 text-sm text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300" role="alert">
            <span className="font-medium">PD:</span>  seguramente pidamos pizzas de Domenico
          </div>
         </div>


        <RequirementList items={[{name:"Vestimenta", description:"Sport"},{name:"Horario", description:"20hs a 00hs"}]} />

        <PlacesToGo />
    </div>
  )
}

export default InvitationPersonalInfo