import { useState } from "react";
import { Alert, ReminderPost, Success } from "../../components";
import { getPosts, deletePost, createPost, updatePost } from "../../controllers/ReminderPostsController";
import { useApp } from "../../contexts/AppContext";
import { useErrorHandler } from "../../hooks";
import PostList from "../../components/PostList";

const ReminderTab = () => {
  const { reminderPosts, setReminderPosts } = useApp();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();

  // Post being updated or created
  const [popupReminder, setPopupReminder] = useState({
    reminderId: "",
    title: "",
    body: "",
    priorityColor: 0
  });

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
    await handleAsyncOperation(
      async () => {
        const msg = await createPost(popupReminder.title, popupReminder.body, popupReminder.priorityColor);
        sortReminderPosts();
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
        const msg = await updatePost(popupReminder.reminderId, popupReminder.title, popupReminder.body, popupReminder.priorityColor);
        sortReminderPosts();
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
          sortReminderPosts();
          return msg;
        },
        null
      ).then((msg) => {
        if (msg?.success) setSuccess(msg.success);
      });
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
