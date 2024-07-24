import { Post } from "../components";
import { useEffect, useState } from "react";
import PostValidationPopup from "./PostValidationPopup";

const PostList = ({ title, posts, PostComposant = Post, sortPosts, popupPost, handleCreate, handleUpdate, handleDelete, setTitle, setPriorityColor, setAllFields, resetAllFields, popupInputs }) => {

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Grab all the posts on page load
  useEffect(() => {
    setTimeout(async () => {
      // Grab all posts
      sortPosts();

      // Remove the loading
      setLoading(false);
    }, 1000);
  }, []);

  const toggleCreationPopup = () => {
    resetAllFields();
    setShowCreatePopup(!showCreatePopup);
  };

  const toggleUpdatePopup = (post) => {
    if (!showUpdatePopup) {
      setAllFields(post);
    }

    setShowUpdatePopup(!showUpdatePopup);
  };

  const handleCreatePost = () => {
    handleCreate();
    // Close Popup
    toggleCreationPopup();
  }

  const handleUpdatePost = () => {
    handleUpdate();
    // Close Popup
    toggleUpdatePopup();
  }

  const renderCreatePopup = () => {
    return <PostValidationPopup
      postName={title}
      actionType={"Add"}
      showPopup={showCreatePopup}
      togglePopup={toggleCreationPopup}
      handleValidate={handleCreatePost}
      popupPost={popupPost}
      setPopupPost={setTitle}
      setPriorityColor={setPriorityColor}
      inputs={popupInputs}
    />;
  }

  const renderUpdatePopup = () => {
    return <PostValidationPopup
      postName={title}
      actionType={"Update"}
      showPopup={showUpdatePopup}
      togglePopup={toggleUpdatePopup}
      handleValidate={handleUpdatePost}
      popupPost={popupPost}
      setPopupPost={setTitle}
      setPriorityColor={setPriorityColor}
      inputs={popupInputs}
    />;
  }


  return (
    <section className="h-full">
      <div className="flex justify-evenly mb-8 text-3xl h-1/10">
        <h1 className="font-bold text-2xl">{title + " Board"}</h1>
        <button className="fa-solid fa-circle-plus" onClick={toggleCreationPopup}></button>
      </div>

      {loading && (<i className="fa-solid fa-spinner animate-spin text-3xl fixed inset-0 flex items-center justify-center"></i>)}

      {/* Popup for post creation */}
      {renderCreatePopup()}

      {/* Popup for post update */}
      {renderUpdatePopup()}
      <div className="overflow-auto h-4/5">
        {posts &&
          posts.map((post) => (
            <div key={post._id}>
              <PostComposant
                post={post}
                onUpdate={toggleUpdatePopup}
                onDelete={handleDelete} />
            </div>
          ))}
      </div>

    </section>
  );
};

export default PostList;
