import React, {FC, useState} from 'react'
import RequirementList from './RequirementList';
import Button from './Button';
import LocationButton from "@/components/LocationButton";
import Badge from "@/components/Badge";
import {useRouter} from "next/navigation";
import {Guest} from "@/types/Guest";

interface InvitationPersonalInfoProps {
    guest: Guest;
}

const InvitationPersonalInfo: FC<InvitationPersonalInfoProps> = ({guest}) => {
    const router = useRouter()
  const [requirements] = useState([{name:"Vestimenta", description:"Sport"},{name:"Horario", description:"20hs a 00hs"}])

  return (
      <div className='px-2 py-4 md:px-5 rounded-md'>
          <RequirementList items={requirements}/>

          <div className="flex flex-col mb-8">
              <h3 className="text-3xl font-bold mb-3">Menu</h3>
              <Badge text='comida' color="blue"/>
          </div>

          <div className="flex flex-col mb-8">
              <h3 className="text-3xl font-bold mb-3">Galeria</h3>
              <Button text={"Ir a media"} color="blue" onClick={()=> router.push(`/${guest.id}/media`)} />
          </div>

          <LocationButton
              latitude={guest.lupe._lat}
              longitude={guest.lupe._long}
              loading={true}
          />
      </div>
  )
}

export default InvitationPersonalInfo