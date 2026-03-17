import { ReactNode, useState } from "react";
import { Post } from "../components/index.ts";
import PostValidationPopup from "./PostValidationPopup.tsx";

interface PostListProps {
  title: ReactNode;
  posts: unknown[];
  popupEntityName?: string;
  PostComposant?: React.ComponentType<{
    post: unknown;
    onUpdate: (post: unknown) => void;
    onDelete: (id: string) => void;
  }>;
  popupPost: { title?: string; priorityColor?: number; [key: string]: unknown };
  handleCreate: () => void | Promise<void>;
  handleUpdate: () => void | Promise<void>;
  handleDelete: (id: string) => void | Promise<void>;
  setTitle: (title: string) => void;
  setPriorityColor: (priority: number) => void;
  setAllFields: (post: unknown) => void;
  resetAllFields: () => void;
  popupInputs?: ReactNode;
  isFieldValid?: boolean;
}

const PostList = ({
  title,
  posts,
  popupEntityName = "item",
  PostComposant = Post,
  popupPost,
  handleCreate,
  handleUpdate,
  handleDelete,
  setTitle,
  setPriorityColor,
  setAllFields,
  resetAllFields,
  popupInputs,
  isFieldValid = true,
}: PostListProps) => {
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);

  const toggleCreationPopup = () => {
    resetAllFields();
    setShowCreatePopup(!showCreatePopup);
  };

  const toggleUpdatePopup = (post: unknown) => {
    if (!showUpdatePopup) {
      setAllFields(post);
    }

    setShowUpdatePopup(!showUpdatePopup);
  };

  const handleCreatePost = async () => {
    await handleCreate();
    toggleCreationPopup();
  };

  const handleUpdatePost = async () => {
    await handleUpdate();
    toggleUpdatePopup({});
  };

  const renderCreatePopup = () => {
    return (
      <PostValidationPopup
        postName={popupEntityName}
        actionType={"Add"}
        showPopup={showCreatePopup}
        togglePopup={toggleCreationPopup}
        handleValidate={handleCreatePost}
        popupPost={popupPost}
        setPopupPost={setTitle}
        setPriorityColor={setPriorityColor}
        inputs={popupInputs}
        isFieldValid={isFieldValid}
      />
    );
  };

  const renderUpdatePopup = () => {
    return (
      <PostValidationPopup
        postName={popupEntityName}
        actionType={"Update"}
        showPopup={showUpdatePopup}
        togglePopup={toggleUpdatePopup}
        handleValidate={handleUpdatePost}
        popupPost={popupPost}
        setPopupPost={setTitle}
        setPriorityColor={setPriorityColor}
        inputs={popupInputs}
        isFieldValid={isFieldValid}
      />
    );
  };

  return (
    <section className="post-list-section">
      <div className="post-list-header">
        {title}
        <button className="fa-solid fa-circle-plus hover:scale-125 transition-transform duration-500" onClick={toggleCreationPopup}></button>
      </div>

      {renderCreatePopup()}
      {renderUpdatePopup()}

      <div className="post-info-panel">
        {posts &&
          posts.map((post: { _id: string }) => (
            <div key={post._id}>
              <PostComposant post={post} onUpdate={toggleUpdatePopup} onDelete={handleDelete} />
            </div>
          ))}
      </div>
    </section>
  );
};

export default PostList;
