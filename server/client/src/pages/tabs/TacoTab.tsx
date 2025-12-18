import { useEffect, useState } from "react";
import { Alert, Success } from "../../components/index.ts";
import ImageUpload from "../../components/ImageUpload.tsx";
import { getTacoData, updateVermifugeDate, updateVermifugeReminder, updateAntiPuceDate, updateAntiPuceReminder} from "../../controllers/TacoController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useErrorHandler, useDateConverter } from "../../hooks/index.ts";
import DatePicker, { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import 'react-datepicker/dist/react-datepicker.css';

const TacoTab = () => {
  const { taco, setTaco } = useApp();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const { convertStringToDate } = useDateConverter();

  registerLocale('fr', fr);

  useEffect(() => {
    let mounted = true;
    const loadTaco = async () => {
      try {
        const data = await getTacoData();
        if (mounted && data) {
          setTaco(data);
        }
      } catch (error) {
        console.error('Error loading taco data:', error);
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement des données Taco');
      }
    };

    loadTaco();

    return () => {
      mounted = false;
    };
  }, [setTaco, setError]);

  const getTaco = async () => {
    const data = await getTacoData();
    setTaco(data);
  };

  const handleUpdateVermifugeDate = async (date: string) => {
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

  const handleUpdateVermifugeReminder = async (date: string) => {
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

  const handleUpdateAntiPuceDate = async (date: string) => {
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

  const handleUpdateAntiPuceReminder = async (date: string) => {
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

      {taco && (taco.vermifugeDate || taco.antiPuceDate) && (
        <div className="space-y-8">
          {/* Section Traitements - Vermifuge et Anti-Puce fusionnés */}
          <div className="bg-bg-panel rounded-lg border border-theme p-6">
            <h2 className="text-2xl font-bold mb-6 text-text-heading flex items-center gap-2">
              <i className="fa-solid fa-syringe text-primary"></i>
              Traitements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Carte Vermifuge */}
              <div className="bg-bg-panel rounded-lg border border-theme p-5 hover:shadow-lg transition-shadow" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500 dark:bg-blue-600 text-white rounded-full p-3 shadow-md">
                    <i className="fa-solid fa-pills text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-text-heading">Vermifuge</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">
                      <i className="fa-solid fa-calendar-check mr-2 text-blue-500 dark:text-blue-400"></i>
                      Dernier traitement
                    </label>
                    <DatePicker
                      selected={convertStringToDate(taco.vermifugeDate)}
                      onChange={(date: Date | null) => {
                        if (date && !isNaN(date.getTime())) {
                          handleUpdateVermifugeDate(date.toLocaleDateString());
                        }
                      }}
                      locale="fr"
                      dateFormat="P"
                      className="datepicker-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">
                      <i className="fa-solid fa-bell mr-2 text-blue-500 dark:text-blue-400"></i>
                      Prochain rappel
                    </label>
                    <DatePicker
                      selected={convertStringToDate(taco.vermifugeReminder)}
                      onChange={(date: Date | null) => {
                        if (date && !isNaN(date.getTime())) {
                          handleUpdateVermifugeReminder(date.toLocaleDateString());
                        }
                      }}
                      locale="fr"
                      dateFormat="P"
                      className="datepicker-input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Carte Anti-Puce */}
              <div className="bg-bg-panel rounded-lg border border-theme p-5 hover:shadow-lg transition-shadow" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500 dark:bg-green-600 text-white rounded-full p-3 shadow-md">
                    <i className="fa-solid fa-spray-can text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-text-heading">Anti-Puce</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">
                      <i className="fa-solid fa-calendar-check mr-2 text-green-500 dark:text-green-400"></i>
                      Dernier traitement
                    </label>
                    <DatePicker
                      selected={convertStringToDate(taco.antiPuceDate)}
                      onChange={(date: Date | null) => {
                        if (date && !isNaN(date.getTime())) {
                          handleUpdateAntiPuceDate(date.toLocaleDateString());
                        }
                      }}
                      locale="fr"
                      dateFormat="P"
                      className="datepicker-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-text-muted mb-2">
                      <i className="fa-solid fa-bell mr-2 text-green-500 dark:text-green-400"></i>
                      Prochain rappel
                    </label>
                    <DatePicker
                      selected={convertStringToDate(taco.antiPuceReminder)}
                      onChange={(date: Date | null) => {
                        if (date && !isNaN(date.getTime())) {
                          handleUpdateAntiPuceReminder(date.toLocaleDateString());
                        }
                      }}
                      locale="fr"
                      dateFormat="P"
                      className="datepicker-input w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Ordonnances */}
          <div className="bg-bg-panel rounded-lg border border-theme p-6">
            <h2 className="text-2xl font-bold mb-6 text-text-heading flex items-center gap-2">
              <i className="fa-solid fa-file-prescription text-primary"></i>
              Ordonnances
            </h2>
            <ImageUpload />
          </div>
        </div>
      )}
    </section>
  );
};

export default TacoTab;

