import { useContext, useState } from "react";
import { Alert, ReminderPost, Success } from "../../components";
import { getPosts, deletePost, createPost, updatePost } from "../../controllers/ReminderPostsController";
import { ReminderPostContext } from "../../contexts/ReminderPostContext";
import PostList from "../../components/PostList";

const ReminderTab = () => {
  // Use post context
  const { reminderPosts, setReminderPosts } = useContext(ReminderPostContext);

  // Post being updated or created
  const [popupReminder, setPopupReminder] = useState({
    reminderId: "",
    title: "",
    body: "",
    priorityColor: 0
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const updatePopup = (key, value) => {
    setPopupReminder(prevState => ({
      ...prevState,
      [key]: value
    }));
  };


  const setTitle = (title) => {
    updatePopup("title", title);
  }

  const setBody = (body) => {
    updatePopup("body", body);
  }

  const setPriorityColor = (priorityColor) => {
    updatePopup("priorityColor", priorityColor);
  }

  const resetAllFields = () => {
    setPopupReminder({ reminderId: "", title: "", body: "", priorityColor: 0 });
  }

  const setAllFields = (post) => {
    setPopupReminder({ reminderId: post._id, title: post.title, body: post.body, priorityColor: post.priorityColor });
  }

  const sortReminderPosts = async () => {
    const data = await getPosts();
    data.posts.sort((a, b) => b.priorityColor - a.priorityColor);
    setReminderPosts(data.posts);
  };

  const handleCreate = async () => {
    try {
      // Create a new post
      const msg = await createPost(popupReminder.title, popupReminder.body, popupReminder.priorityColor);
      // Update posts state
      sortReminderPosts();
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
      const msg = await updatePost(popupReminder.reminderId, popupReminder.title, popupReminder.body, popupReminder.priorityColor);
      // Update posts state
      sortReminderPosts();
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
        sortReminderPosts();
        // Set the success message
        setSuccess(msg.success);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const bodyInput = () => {
    return <textarea
      type="text"
      rows="3"
      placeholder={`reminder body`}
      className="input resize-none"
      value={popupReminder.body}
      onChange={(e) => setBody(e.target.value)}
    />;
  }

  return (
    <section className="card">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError}/>}

      <div className="reminder-tab">
        <PostList
          title={<h1 className="font-bold text-2xl underline">{"Reminder Board"}</h1>}
          posts={reminderPosts}
          PostComposant={ReminderPost}
          sortPosts={sortReminderPosts}
          popupPost={popupReminder}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          setTitle={setTitle}
          setPriorityColor={setPriorityColor}
          setAllFields={setAllFields}
          resetAllFields={resetAllFields}
          popupInputs={bodyInput()}
        />
      </div>

    </section>
  );
};

export default ReminderTab;
