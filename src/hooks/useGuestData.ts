"use client";
import { getGuest } from "@/lib/firebase";
import { Guest } from "@/types/Guest";
import { useEffect, useState } from "react";

interface UseGuestProps {
  id: string;
}

const useGuest = ({ id }: UseGuestProps) => {
  const [guestData, setGuestData] = useState<Guest>({
    id: "",
    name: "",
    group: [],
    isConfirmed: false,
    isDrity: false,
  });

  const [findGuest, setFindGuest] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGuestData = async () => {
      try {
        await getGuest(id, setFindGuest, setGuestData, setLoading, setError);
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
