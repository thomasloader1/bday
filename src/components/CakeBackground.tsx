import React,{useState, useEffect,FC, ReactNode} from 'react'
import { FaBirthdayCake } from 'react-icons/fa';
interface Position{
    left: string;
    top: string;
  }

interface IconBackgroundProps{
    icon: ReactNode
}
const IconBackground: FC<IconBackgroundProps> = ({icon}) => {

    const iconCount = 20;
  const [positions, setPositions] = useState<Position[]>([]);

  const getRandomPosition = (): Position => {
    const minDistance = 15;
    let left: number, top: number;

    do {
      left = Math.random() * (100 - minDistance);
      top = Math.random() * (100 - minDistance);

      // Asegurar que los valores no sean mayores a 100
      left = Math.min(left, 100 - minDistance);
      top = Math.min(top, 100 - minDistance);
    } while (
      positions.some(
        (position) =>
          Math.abs(left - parseFloat(position.left)) < minDistance &&
          Math.abs(top - parseFloat(position.top)) < minDistance
      )
    );

    return { left: `${left}vw`, top: `${top}vh` };
  };

  useEffect(() => {
    const generateInitialPositions = (): void => {
      const initialPositions = Array.from({ length: iconCount }, (_, index) => getRandomPosition());
      setPositions(initialPositions);
    };

    generateInitialPositions();

    const intervalId = setInterval(() => {
      setPositions((prevPositions) => prevPositions.map(() => getRandomPosition()));
    }, 700);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 h-screen overflow-hidden -z-10">
      {positions.map((position, index) => (
        <div
          key={index}
          className="absolute cake-icon text-5xl text-gray-900"
          style={{
            left: position.left,
            top: position.top,
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  )
}

export default IconBackground