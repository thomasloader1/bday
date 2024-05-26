"use client";
import { getGuest } from "@/lib/firebase";
import { Guest } from "@/types/Guest";
import { useEffect, useState } from "react";
import {redirect} from "next/navigation";

interface UseGuestProps {
  id: number;
}

const useGuest = ({ id }: UseGuestProps) => {
  const [guestData, setGuestData] = useState<Guest>({
    id: 0,
    name: "",
    group: [],
    isConfirmed: false,
    isDrity: false,
    email: "",
    images: [],
    lupe: { _lat: 0, _long: 0 },
  });

  const [findGuest, setFindGuest] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGuestData = async () => {
      const idPerson = id.toString();

      try {
        await getGuest(
          idPerson,
          setFindGuest,
          setGuestData,
          setLoading,
          setError
        );

      } catch (error) {
        console.error({ error });
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getGuestData();
  }, [id]);

  return { findGuest, guestData, loading, error };
};

export default useGuest;
