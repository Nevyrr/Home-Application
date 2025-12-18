import { useEffect, useState } from "react";
import { Alert, ShoppingPost, Success, PostList } from "../../components";
import { getPosts, createDate, updateDateItem, deletePost, deletePosts, createPost, updatePost } from "../../controllers/ShoppingPostsController";
import { useApp } from "../../contexts/AppContext";
import { useErrorHandler } from "../../hooks";
import { convertStringToDate } from "../../utils";
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';
import QuantityInput from "../../components/QuantityInput";

const ShoppingTab = () => {
  const { shoppingItems, setShoppingItems } = useApp();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();

  const countRegex = /^[1-9]([0-9]{0,2})([.,][0-9]+)?$/;

  // Post being updated or created
  const [popupShopping, setPopupShopping] = useState({
    shoppingId: "",
    title: "",
    count: 1,
    unit: '',
    priorityColor: 0
  });
  const [isCountValid, setIsCountValid] = useState(true);
  registerLocale('fr', fr);

  useEffect(() => {
    setTimeout(async () => {
      // Grab all posts
      sortShoppingPosts();
    }, 1000);
  }, []);

  const unrollPanel = (event) => {
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

  const updatePopup = (key, value) => {
    setPopupShopping(prevState => ({
      ...prevState,
      [key]: value
    }));
  };

  const setTitle = (title) => {
    updatePopup("title", title);
  }

  const setCount = (count) => {
    updatePopup("count", count);
  }

  const setUnit = (unit) => {
    updatePopup("unit", unit);
  }

  const setPriorityColor = (priorityColor) => {
    updatePopup("priorityColor", priorityColor);
  }

  const resetAllFields = () => {
    setPopupShopping({ shoppingId: "", title: "", count: 1, unit: "", priorityColor: 0 });
  }

  const setAllFields = (post) => {
    setPopupShopping({ shoppingId: post._id, title: post.title, count: post.count, unit: post.unit, priorityColor: post.priorityColor });
  }

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

  const handleUpdateDateItem = async (shoppingListId, name, date) => {
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

  const handleCreatePost = async (id) => {
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

  const handleDelete = async (_id) => {
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

  const handleCleanDate = async (shoppingListId) => {
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


  const handleCountChange = (quantity) => {
    setIsCountValid(countRegex.test(quantity.count));
    setCount(quantity.count);
    setUnit(quantity.unit);
  };

  const nameInput = (shoppingItem) => {
    return <input
      type="string"
      className="input-field"
      value={shoppingItem.name}
      onChange={(e) => handleNameChange(shoppingItem._id, e.target.value)}
      onBlur={() => handleUpdateDateItem(shoppingItem._id, shoppingItem.name, shoppingItem.date)}
    />;
  }

  const handleNameChange = (shoppingItemId, name) => {
    setShoppingItems((oldShoppingItems) =>
      oldShoppingItems.map((shoppingItem) =>
        shoppingItem._id === shoppingItemId ? { ...shoppingItem, name: name } : shoppingItem
      )
    );
  };

  const countInput = () => {
    return <QuantityInput
      count={popupShopping.count}
      unit={popupShopping.unit}
      onChange={handleCountChange}
    />;
  }


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
                  onChange={(date) => {
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
