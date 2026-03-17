import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import { Alert, ShoppingPost, Success, PostList } from "../../components/index.ts";
import { getPosts, createDate, updateDateItem, deletePost, deletePosts, createPost, updatePost } from "../../controllers/ShoppingPostsController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useErrorHandler } from "../../hooks/index.ts";
import { convertStringToDate } from "../../utils/index.ts";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from "date-fns/locale/fr";
import QuantityInput from "../../components/QuantityInput.tsx";
import { ShoppingDay, ShoppingPost as ShoppingPostType } from "../../types/index.ts";

registerLocale("fr", fr);

const formatShoppingDate = (date: Date): string => date.toLocaleDateString("fr-FR");

const ShoppingTab = () => {
  const { shoppingItems, setShoppingItems } = useApp();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const hasLoadedLists = useRef(false);

  const countRegex = /^[1-9]([0-9]{0,2})([.,][0-9]+)?$/;

  const [popupShopping, setPopupShopping] = useState<{
    shoppingId: string;
    title: string;
    count: number;
    unit: string;
    priorityColor: number;
  }>({
    shoppingId: "",
    title: "",
    count: 1,
    unit: "",
    priorityColor: 0,
  });
  const [isCountValid, setIsCountValid] = useState<boolean>(true);
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(true);
  const [isCreatingList, setIsCreatingList] = useState<boolean>(false);

  const sortShoppingPosts = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsLoadingLists(true);
    }

    try {
      const data = await getPosts();
      const sortedShoppingDays = data.posts.map((shoppingDay) => ({
        ...shoppingDay,
        shoppingList: [...shoppingDay.shoppingList].sort((a, b) => b.priorityColor - a.priorityColor),
      }));

      setShoppingItems(sortedShoppingDays);
    } catch (shoppingError) {
      const errorMessage = shoppingError instanceof Error ? shoppingError.message : "Impossible de charger les listes";
      setError(errorMessage);
    } finally {
      if (showLoader) {
        setIsLoadingLists(false);
      }
    }
  }, [setError, setShoppingItems]);

  useEffect(() => {
    if (hasLoadedLists.current) {
      return;
    }

    hasLoadedLists.current = true;
    void sortShoppingPosts(true);
  }, [sortShoppingPosts]);

  const unrollPanel = (event: React.MouseEvent<HTMLDivElement>) => {
    const panel = event.currentTarget;
    panel.classList.toggle("rolled");

    if (panel.classList.contains("rolled")) {
      panel.classList.remove("fa-chevron-down");
      panel.classList.add("fa-chevron-right");
    } else {
      panel.classList.remove("fa-chevron-right");
      panel.classList.add("fa-chevron-down");
    }
  };

  const updatePopup = (key: string, value: string | number) => {
    setPopupShopping((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const setTitle = (title: string) => {
    updatePopup("title", title);
  };

  const setCount = (count: number) => {
    updatePopup("count", count);
  };

  const setUnit = (unit: string) => {
    updatePopup("unit", unit);
  };

  const setPriorityColor = (priorityColor: number) => {
    updatePopup("priorityColor", priorityColor);
  };

  const resetAllFields = () => {
    setPopupShopping({ shoppingId: "", title: "", count: 1, unit: "", priorityColor: 0 });
  };

  const setAllFields = (post: ShoppingPostType) => {
    setPopupShopping({
      shoppingId: post._id,
      title: post.title,
      count: post.count,
      unit: post.unit || "",
      priorityColor: post.priorityColor,
    });
  };

  const handleCreateDate = async () => {
    if (isCreatingList) {
      return;
    }

    setIsCreatingList(true);

    try {
      const msg = await handleAsyncOperation(
        async () => {
          const created = await createDate(formatShoppingDate(new Date()), "Shopping Title");
          await sortShoppingPosts();
          return created;
        },
        null
      );

      if (msg?.success) {
        setSuccess(msg.success);
      }
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleUpdateDateItem = async (shoppingListId: string, name: string, date: string) => {
    const trimmedName = name.trim();

    await handleAsyncOperation(
      async () => {
        const msg = await updateDateItem(shoppingListId, trimmedName, date);
        await sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) {
        setSuccess(msg.success);
      }
    });
  };

  const handleCreatePost = async (id: string) => {
    await handleAsyncOperation(
      async () => {
        const msg = await createPost(id, popupShopping.title, popupShopping.count, popupShopping.unit, popupShopping.priorityColor);
        await sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) {
        setSuccess(msg.success);
      }
    });
  };

  const handleUpdate = async () => {
    await handleAsyncOperation(
      async () => {
        const msg = await updatePost(popupShopping.shoppingId, popupShopping.title, popupShopping.count, popupShopping.unit, popupShopping.priorityColor);
        await sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) {
        setSuccess(msg.success);
      }
    });
  };

  const handleDelete = async (_id: string) => {
    if (confirm("Confirmer la suppression ?")) {
      await handleAsyncOperation(
        async () => {
          const msg = await deletePost(_id);
          await sortShoppingPosts();
          return msg;
        },
        null
      ).then((msg) => {
        if (msg?.success) {
          setSuccess(msg.success);
        }
      });
    }
  };

  const handleCleanDate = async (shoppingListId: string) => {
    if (confirm("Confirmer la suppression ?")) {
      await handleAsyncOperation(
        async () => {
          const msg = await deletePosts(shoppingListId);
          await sortShoppingPosts();
          return msg;
        },
        null
      ).then((msg) => {
        if (msg?.success) {
          setSuccess(msg.success);
        }
      });
    }
  };

  const handleCountChange = (quantity: { count: number; unit: string }) => {
    setIsCountValid(countRegex.test(String(quantity.count)));
    setCount(quantity.count);
    setUnit(quantity.unit);
  };

  const handleNameChange = (shoppingItemId: string, name: string) => {
    setShoppingItems((oldShoppingItems) =>
      oldShoppingItems.map((shoppingItem) =>
        shoppingItem._id === shoppingItemId ? { ...shoppingItem, name } : shoppingItem
      )
    );
  };

  const nameInput = (shoppingItem: ShoppingDay): ReactNode => {
    return (
      <input
        type="text"
        className="input-field shopping-list-name font-semibold"
        value={shoppingItem.name}
        onChange={(e) => handleNameChange(shoppingItem._id, e.target.value)}
        onBlur={() => handleUpdateDateItem(shoppingItem._id, shoppingItem.name, shoppingItem.date)}
        placeholder="Nom de la liste"
      />
    );
  };

  const countInput = (): ReactNode => {
    return (
      <div className="post-popup-field">
        <span className="post-popup-label">Quantite</span>
        <QuantityInput count={popupShopping.count} unit={popupShopping.unit} onChange={handleCountChange} />
      </div>
    );
  };

  return (
    <section className="card shopping-card">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <div className="shopping-toolbar">
        <h1 className="shopping-toolbar-title text-text-heading">
          <i className="fa-solid fa-shopping-cart text-primary"></i>
          Shopping Board
        </h1>

        <button
          onClick={handleCreateDate}
          disabled={isCreatingList}
          className="shopping-create-button inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          <i className="fa-solid fa-plus"></i>
          {isCreatingList ? "Creation..." : "Nouvelle liste"}
        </button>
      </div>

      <div className="shopping-tab space-y-4">
        {isLoadingLists && (
          <div className="shopping-loading-state">
            <i className="fa-solid fa-spinner animate-spin"></i>
            <span>Chargement des listes...</span>
          </div>
        )}

        {!isLoadingLists && shoppingItems.length === 0 && (
          <div className="shopping-empty-state">
            <i className="fa-solid fa-basket-shopping text-primary"></i>
            <p>Aucune liste pour le moment.</p>
            <span>Ajoute une nouvelle liste pour commencer.</span>
          </div>
        )}

        {shoppingItems.map((shoppingItem, index) => (
          <div className="shopping-day-list" key={shoppingItem._id} data-list-index={index}>
            <div className="shopping-chevron-icon fa-solid fa-chevron-down" onClick={unrollPanel}></div>

            <PostList
              title={
                <div className="shopping-list-title">
                  <div className="shopping-list-title-fields">
                    {nameInput(shoppingItem)}
                    <div className="shopping-list-date">
                      <DatePicker
                        selected={convertStringToDate(shoppingItem.date)}
                        onChange={(date: Date | null) => {
                          if (date && !isNaN(date.getTime())) {
                            void handleUpdateDateItem(shoppingItem._id, shoppingItem.name, formatShoppingDate(date));
                          }
                        }}
                        locale="fr"
                        dateFormat="P"
                        className="datepicker-input shopping-date-input"
                        calendarClassName="theme-datepicker"
                        popperClassName="theme-datepicker-popper"
                      />
                    </div>
                  </div>
                </div>
              }
              posts={shoppingItem.shoppingList}
              PostComposant={ShoppingPost}
              popupPost={popupShopping}
              handleCreate={() => handleCreatePost(shoppingItem._id)}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              setTitle={setTitle}
              setPriorityColor={setPriorityColor}
              setAllFields={setAllFields}
              resetAllFields={resetAllFields}
              popupInputs={countInput()}
              isFieldValid={isCountValid}
            />

            {shoppingItems.length !== 0 && (
              <div className="shopping-total-bar">
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-theme bg-bg-panel px-4 py-2 text-sm font-medium text-text-main transition-all duration-200 hover:border-red-500/50 hover:bg-hover hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => {
                    void handleCleanDate(shoppingItem._id);
                  }}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  Vider la liste
                </button>

                <p className="shopping-total-text flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-primary"></i>
                  {shoppingItem.shoppingList.length} {shoppingItem.shoppingList.length > 1 ? "articles" : "article"}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShoppingTab;
