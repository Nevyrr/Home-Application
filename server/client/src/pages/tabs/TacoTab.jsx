import { useContext, useEffect, useState } from "react";
import { Alert, Success } from "../../components";
import ImageUpload from "../../components/ImageUpload";
import { getTacoData, updateVermifugeDate, updateVermifugeReminder, updateAntiPuceDate, updateAntiPuceReminder} from "../../controllers/TacoController";
import { TacoContext } from "../../contexts/TacoContext";
import DatePicker, { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import 'react-datepicker/dist/react-datepicker.css';

const TacoTab = () => {
  const { taco, setTaco } = useContext(TacoContext);

  registerLocale('fr', fr);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setTimeout(async () => {
      // Grab all posts
      getTaco();
    }, 1000);
  }, []);

  const getTaco = async () => {
    const data = await getTacoData();
    setTaco(data);
  };

  // Fonction pour convertir la chaîne de caractères en objet Date
  const convertStringToDate = (dateString) => {
    if (dateString) {
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date();
  };

  const handleUpdateVermifugeDate = async (date) => {
    try {
      // Create a new post
      const msg = await updateVermifugeDate(date);
      getTaco();
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateVermifugeReminder = async (date) => {
    try {
      // Create a new post
      const msg = await updateVermifugeReminder(date);
      getTaco();
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateAntiPuceDate = async (date) => {
    try {
      // Create a new post
      const msg = await updateAntiPuceDate(date);
      getTaco();
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateAntiPuceReminder = async (date) => {
    try {
      // Create a new post
      const msg = await updateAntiPuceReminder(date);
      getTaco();
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <section className="card">

      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <h1 className="title">TACO</h1>

      {taco.vermifugeDate !== "" && (
        <div>
          <div className="taco-tab-reminder-div">
            <h1 className="font-semibold text-xl"> Dernier Vermifuge: </h1>
            <h1 className="font-semibold text-xl"> Rappel: </h1>
            <DatePicker
              selected={new Date(convertStringToDate(taco.vermifugeDate))}
              onChange={(date) => handleUpdateVermifugeDate(date.toLocaleDateString())}
              locale="fr"
              dateFormat="P"
              className="datepicker-input"
            />
            <DatePicker
              selected={new Date(convertStringToDate(taco.vermifugeReminder))}
              onChange={(date) => handleUpdateVermifugeReminder(date.toLocaleDateString())}
              locale="fr"
              dateFormat="P"
              className="datepicker-input"
            />
          </div>


          <div className="taco-tab-reminder-div">
            <h1 className="font-semibold text-xl">Dernier Anti-Puce: </h1>
            <h1 className="font-semibold text-xl">Rappel: </h1>
            <DatePicker
              selected={new Date(convertStringToDate(taco.antiPuceDate))}
              onChange={(date) => handleUpdateAntiPuceDate(date.toLocaleDateString())}
              locale="fr"
              dateFormat="P"
              className="datepicker-input"
            />
            <DatePicker
              selected={new Date(convertStringToDate(taco.antiPuceReminder))}
              onChange={(date) => handleUpdateAntiPuceReminder(date.toLocaleDateString())}
              locale="fr"
              dateFormat="P"
              className="datepicker-input"
            />
          </div>

          <h1 className="font-semibold mt-8 text-xl"> Feuilles de soin: </h1>

          <ImageUpload></ImageUpload>
        </div>
      )}

    </section>
  );
}

export default TacoTab;
