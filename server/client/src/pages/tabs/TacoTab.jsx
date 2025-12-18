import { useEffect, useState } from "react";
import { Alert, Success } from "../../components";
import ImageUpload from "../../components/ImageUpload";
import { getTacoData, updateVermifugeDate, updateVermifugeReminder, updateAntiPuceDate, updateAntiPuceReminder} from "../../controllers/TacoController";
import { useApp } from "../../contexts/AppContext";
import { useErrorHandler, useDateConverter } from "../../hooks";
import DatePicker, { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import 'react-datepicker/dist/react-datepicker.css';

const TacoTab = () => {
  const { taco, setTaco } = useApp();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const { convertStringToDate } = useDateConverter();

  registerLocale('fr', fr);

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

  const handleUpdateVermifugeDate = async (date) => {
    await handleAsyncOperation(
      async () => {
        const msg = await updateVermifugeDate(date);
        getTaco();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleUpdateVermifugeReminder = async (date) => {
    await handleAsyncOperation(
      async () => {
        const msg = await updateVermifugeReminder(date);
        getTaco();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleUpdateAntiPuceDate = async (date) => {
    await handleAsyncOperation(
      async () => {
        const msg = await updateAntiPuceDate(date);
        getTaco();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleUpdateAntiPuceReminder = async (date) => {
    await handleAsyncOperation(
      async () => {
        const msg = await updateAntiPuceReminder(date);
        getTaco();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
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
              selected={convertStringToDate(taco.vermifugeDate)}
              onChange={(date) => {
                if (date && !isNaN(date.getTime())) {
                  handleUpdateVermifugeDate(date.toLocaleDateString());
                }
              }}
              locale="fr"
              dateFormat="P"
              className="datepicker-input"
            />
            <DatePicker
              selected={convertStringToDate(taco.vermifugeReminder)}
              onChange={(date) => {
                if (date && !isNaN(date.getTime())) {
                  handleUpdateVermifugeReminder(date.toLocaleDateString());
                }
              }}
              locale="fr"
              dateFormat="P"
              className="datepicker-input"
            />
          </div>


          <div className="taco-tab-reminder-div">
            <h1 className="font-semibold text-xl">Dernier Anti-Puce: </h1>
            <h1 className="font-semibold text-xl">Rappel: </h1>
            <DatePicker
              selected={convertStringToDate(taco.antiPuceDate)}
              onChange={(date) => {
                if (date && !isNaN(date.getTime())) {
                  handleUpdateAntiPuceDate(date.toLocaleDateString());
                }
              }}
              locale="fr"
              dateFormat="P"
              className="datepicker-input"
            />
            <DatePicker
              selected={convertStringToDate(taco.antiPuceReminder)}
              onChange={(date) => {
                if (date && !isNaN(date.getTime())) {
                  handleUpdateAntiPuceReminder(date.toLocaleDateString());
                }
              }}
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
