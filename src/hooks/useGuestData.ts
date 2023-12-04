"use client"
import { getGuest } from '@/lib/firebase';
import { Guest } from '@/types/Guest';
import { useEffect, useState } from 'react';

interface UseGuestProps {
  id: string;
}

const useGuest = ({ id }: UseGuestProps) => {
    const [guestData, setGuestData] = useState<Guest>({
        id: "",
        name: "",
        group: [],
        place: [],
        lunch: [21.0836907,-101.6887252],
        confirmed: false,
        isDrity: false,
      });
    
      const [findGuest, setFindGuest] = useState(false);
      const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getGuestData = async () => {
      try {
        await getGuest(id, setFindGuest, setGuestData, setLoading);
      } catch (error) {
        console.error({error})
      } 
    };

    getGuestData();
  }, [id]);

  return { findGuest, guestData, loading };
};

export default useGuest;