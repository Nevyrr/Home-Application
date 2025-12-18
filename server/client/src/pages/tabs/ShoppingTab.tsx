import { useEffect, useState, ReactNode } from "react";
import { Alert, ShoppingPost, Success, PostList } from "../../components/index.ts";
import { getPosts, createDate, updateDateItem, deletePost, deletePosts, createPost, updatePost } from "../../controllers/ShoppingPostsController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useErrorHandler } from "../../hooks/index.ts";
import { convertStringToDate } from "../../utils/index.ts";
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';
import QuantityInput from "../../components/QuantityInput.tsx";
import { ShoppingDay, ShoppingPost as ShoppingPostType } from "../../types/index.ts";

const ShoppingTab = () => {
  const { shoppingItems, setShoppingItems } = useApp();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();

  const countRegex = /^[1-9]([0-9]{0,2})([.,][0-9]+)?$/;

  // Post being updated or created
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
    unit: '',
    priorityColor: 0
  });
  const [isCountValid, setIsCountValid] = useState<boolean>(true);
  registerLocale('fr', fr);

  useEffect(() => {
    setTimeout(async () => {
      // Grab all posts
      sortShoppingPosts();
    }, 1000);
  }, []);

  const unrollPanel = (event: React.MouseEvent<HTMLDivElement>) => {
    const panel = event.currentTarget;
    panel.classList.toggle('rolled');
    if (panel.classList.contains('rolled')) {
      panel.classList.remove('fa-chevron-down');
      panel.classList.add('fa-chevron-right');
    } else {
      panel.classList.remove('fa-chevron-right');
      panel.classList.add('fa-chevron-down');
    }
  };

  const updatePopup = (key: string, value: string | number) => {
    setPopupShopping(prevState => ({
      ...prevState,
      [key]: value
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
    setPopupShopping({ shoppingId: post._id, title: post.title, count: post.count, unit: post.unit || "", priorityColor: post.priorityColor });
  };

  const sortShoppingPosts = async () => {
    const data = await getPosts();
    for (const shoppingDay of data.posts) {
      shoppingDay.shoppingList.sort((a, b) => b.priorityColor - a.priorityColor);
    }
    setShoppingItems(data.posts);
  };

  const handleCreateDate = async () => {
    await handleAsyncOperation(
      async () => {
        const msg = await createDate(new Date().toLocaleDateString(), "Shopping Title");
        sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleUpdateDateItem = async (shoppingListId: string, name: string, date: string) => {
    await handleAsyncOperation(
      async () => {
        const msg = await updateDateItem(shoppingListId, name, date);
        sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleCreatePost = async (id: string) => {
    await handleAsyncOperation(
      async () => {
        const msg = await createPost(id, popupShopping.title, popupShopping.count, popupShopping.unit, popupShopping.priorityColor);
        sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleUpdate = async () => {
    await handleAsyncOperation(
      async () => {
        const msg = await updatePost(popupShopping.shoppingId, popupShopping.title, popupShopping.count, popupShopping.unit, popupShopping.priorityColor);
        sortShoppingPosts();
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleDelete = async (_id: string) => {
    if (confirm("Confirmer la suppression ?")) {
      await handleAsyncOperation(
        async () => {
          const msg = await deletePost(_id);
          sortShoppingPosts();
          return msg;
        },
        null
      ).then((msg) => {
        if (msg?.success) setSuccess(msg.success);
      });
    }
  };

  const handleCleanDate = async (shoppingListId: string) => {
    if (confirm("Confirmer la suppression ?")) {
      await handleAsyncOperation(
        async () => {
          const msg = await deletePosts(shoppingListId);
          sortShoppingPosts();
          return msg;
        },
        null
      ).then((msg) => {
        if (msg?.success) setSuccess(msg.success);
      });
    }
  };


  const handleCountChange = (quantity: { count: number; unit: string }) => {
    setIsCountValid(countRegex.test(String(quantity.count)));
    setCount(quantity.count);
    setUnit(quantity.unit);
  };

  const nameInput = (shoppingItem: ShoppingDay): ReactNode => {
    return <input
      type="text"
      className="input-field"
      value={shoppingItem.name}
      onChange={(e) => handleNameChange(shoppingItem._id, e.target.value)}
      onBlur={() => handleUpdateDateItem(shoppingItem._id, shoppingItem.name, shoppingItem.date)}
    />;
  };

  const handleNameChange = (shoppingItemId: string, name: string) => {
    setShoppingItems((oldShoppingItems) =>
      oldShoppingItems.map((shoppingItem) =>
        shoppingItem._id === shoppingItemId ? { ...shoppingItem, name: name } : shoppingItem
      )
    );
  };

  const countInput = (): ReactNode => {
    return <QuantityInput
      count={popupShopping.count}
      unit={popupShopping.unit}
      onChange={handleCountChange}
    />;
  };


  return (
    <section className="card">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError}/>}

      <div className="flex justify-evenly mb-8 text-3xl h-&1/10">
        <h1 className="font-bold text-xl underline">Shopping Board</h1>
        <span className="border-2 border-indigo-600 select-none text-xs inline-block px-2 py-2 text-indigo-600 font-semibold rounded-lg shadow-xl hover:text-indigo-800 cursor-pointer hover:scale-110 transition-transform duration-200" onClick={handleCreateDate}>New Shopping List</span>
      </div>

      <div className="shopping-tab">
        {shoppingItems && shoppingItems.map(shoppingItem => (
          <div className="shopping-day-list" key={shoppingItem._id}>
            <div className="shopping-chevron-icon fa-solid fa-chevron-down" onClick={unrollPanel}></div>
            <PostList
              title={<div className="flex text-sm w-4/5 ml-8">
                {nameInput(shoppingItem)}
                <DatePicker
                  selected={convertStringToDate(shoppingItem.date)}
                  onChange={(date: Date | null) => {
                    if (date && !isNaN(date.getTime())) {
                      handleUpdateDateItem(shoppingItem._id, shoppingItem.name, date.toLocaleDateString());
                    }
                  }}
                  locale="fr"
                  dateFormat="P"
                  className="datepicker-input"
                />
              </div>}
              posts={shoppingItem.shoppingList}
              PostComposant={ShoppingPost}
              sortPosts={() => { }}
              popupPost={popupShopping}
              handleCreate={() => { handleCreatePost(shoppingItem._id) }}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              setTitle={setTitle}
              setPriorityColor={setPriorityColor}
              setAllFields={setAllFields}
              resetAllFields={resetAllFields}
              popupInputs={countInput()}
              isFieldValid={isCountValid} />
            {
              shoppingItems.length !== 0 && (
                <div className="shopping-total-bar">
                  <button className="delete-button shopping-delete-all-button" onClick={() => { handleCleanDate(shoppingItem._id) }}>Clear the cart</button>
                  <p className="shopping-total-text">Total Items: {shoppingItem.shoppingList.length}</p>
                </div>
              )
            }
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShoppingTab;

