import foto3 from '../assets/foto3.jpg'; 
import foto4 from '../assets/foto4.jpg'; 
import foto5 from '../assets/foto5.jpg';
import foto6 from '../assets/foto6.jpg';
export default function TopImg({ number }) {
  const getImage = () => {
    switch (number) {
      case 3:
        return foto3;
      case 4:
        return foto4; 
      case 5:
      return foto5;
      case 6:
      return foto6;
      default:
        return foto3;
    }
  };

  return (
    <div className="Admin-img-container">
      <img src={getImage()} alt={`Imagen número ${number}`} className="Admin-img" />
    </div>
  );
}
