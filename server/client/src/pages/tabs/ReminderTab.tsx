import { useState, ReactNode, useCallback, useEffect } from "react";
import { Alert, ReminderPost, Success } from "../../components/index.ts";
import { getPosts, deletePost, createPost, updatePost } from "../../controllers/ReminderPostsController.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useErrorHandler } from "../../hooks/index.ts";
import PostList from "../../components/PostList.tsx";
import { ReminderPost as ReminderPostType } from "../../types/index.ts";

const ReminderTab = () => {
  const { reminderPosts, setReminderPosts } = useApp();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();

  // Post being updated or created
  const [popupReminder, setPopupReminder] = useState<{
    reminderId: string;
    title: string;
    body: string;
    priorityColor: number;
  }>({
    reminderId: "",
    title: "",
    body: "",
    priorityColor: 0
  });

  const updatePopup = (key: string, value: string | number) => {
    setPopupReminder(prevState => ({
      ...prevState,
      [key]: value
    }));
  };


  const setTitle = (title: string) => {
    updatePopup("title", title);
  };

  const setBody = (body: string) => {
    updatePopup("body", body);
  };

  const setPriorityColor = (priorityColor: number) => {
    updatePopup("priorityColor", priorityColor);
  };

  const resetAllFields = () => {
    setPopupReminder({ reminderId: "", title: "", body: "", priorityColor: 0 });
  };

  const setAllFields = (post: ReminderPostType) => {
    setPopupReminder({ reminderId: post._id, title: post.title, body: post.body, priorityColor: post.priorityColor });
  };

  const sortReminderPosts = useCallback(async () => {
    try {
      const data = await getPosts();
      if (data && data.posts) {
        const sortedPosts = [...data.posts].sort((a, b) => b.priorityColor - a.priorityColor);
        setReminderPosts(sortedPosts);
      }
    } catch (error) {
      console.error('Error loading reminder posts:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des rappels');
    }
  }, [setReminderPosts, setError]);

  // Charger les posts au montage
  useEffect(() => {
    sortReminderPosts();
  }, [sortReminderPosts]);

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

  const handleDelete = async (_id: string) => {
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

  const bodyInput = (): ReactNode => {
    return <textarea
      rows={3}
      placeholder={`reminder body`}
      className="input resize-none"
      value={popupReminder.body}
      onChange={(e) => setBody(e.target.value)}
    />;
  };

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

