import { useContext, useState } from "react";
import { Alert, ShoppingPost, Success } from "../../components";
import { getPosts, deletePost, deletePosts, createPost, updatePost } from "../../controllers/ShoppingPostsController";
import { ShoppingPostContext } from "../../contexts/ShoppingPostContext";
import PostList from "../../components/PostList";

const ShoppingTab = () => {
  // Use post context
  const { shoppingPosts, setShoppingPosts } = useContext(ShoppingPostContext);

  // Post being updated or created
  const [popupShopping, setPopupShopping] = useState({
    shoppingId: "",
    title: "",
    count: 1,
    priorityColor: 0
  });
  const [isCountValid, setIsCountValid] = useState(true);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const setPriorityColor = (priorityColor) => {
    updatePopup("priorityColor", priorityColor);
  }

  const resetAllFields = () => {
    setPopupShopping({ shoppingId: "", title: "", count: 1, priorityColor: 0 });
  }

  const setAllFields = (post) => {
    setPopupShopping({ shoppingId: post._id, title: post.title, count: post.count, priorityColor: post.priorityColor });
  }

  const sortShoppingPosts = async () => {
    const data = await getPosts();
    data.posts.sort((a, b) => b.priorityColor - a.priorityColor);
    setShoppingPosts(data.posts);
  };

  const handleCreate = async () => {
    try {
      // Create a new post
      const msg = await createPost(popupShopping.title, popupShopping.count, popupShopping.priorityColor);
      // Update posts state
      sortShoppingPosts();
      // Set the success message
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle delete post
  const handleUpdate = async () => {
    try {
      // Create a new post
      const msg = await updatePost(popupShopping.shoppingId, popupShopping.title, popupShopping.count, popupShopping.priorityColor);
      // Update posts state
      sortShoppingPosts();
      // Set the success message
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle delete post
  const handleDelete = async (_id) => {
    if (confirm("Confirm delete?")) {
      try {
        // Delete the post
        const msg = await deletePost(_id);
        // Update posts state
        sortShoppingPosts();
        // Set the success message
        setSuccess(msg.success);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Handle delete all posts
  const handleDeleteAll = async (_id) => {
    if (confirm("Confirm delete?")) {
      try {
        // Delete the post
        const msg = await deletePosts();
        // Update posts state
        sortShoppingPosts();
        // Set the success message
        setSuccess(msg.success);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleCountChange = (e) => {
    const newValue = e.target.value;
    setIsCountValid(/^\d*$/.test(newValue) && (parseInt(newValue) > 0 && parseInt(newValue) <= 99));
    setCount(newValue);
  };

  const countInput = () => {
    return <input
      type="number"
      min="0"
      max="99"
      step="1"
      placeholder={`shopping count`}
      className="input"
      value={popupShopping.count}
      onChange={handleCountChange}
      title="Enter a number between 0 and 99"
    />;
  }

  return (
    <section className="card">
      {success && <Success msg={success} />}
      {error && <Alert msg={error} />}

      <div className="shopping-tab">
        <PostList
          title={"Shopping"}
          posts={shoppingPosts}
          PostComposant={ShoppingPost}
          sortPosts={sortShoppingPosts}
          popupPost={popupShopping}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          setTitle={setTitle}
          setPriorityColor={setPriorityColor}
          setAllFields={setAllFields}
          resetAllFields={resetAllFields}
          popupInputs={countInput()}
          isFieldValid={isCountValid}
        />
      </div>

      {shoppingPosts.length !== 0 && (
        <div className="shopping-total-bar">
          <button className="delete-button shopping-delete-all-button" onClick={handleDeleteAll}>Clear the cart</button>
          <p className="shopping-total-text">Total Items: {shoppingPosts.length}</p>
        </div>
      )}
    </section>
  );
};

export default ShoppingTab;
