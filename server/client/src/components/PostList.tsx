import { ReactNode, useState } from "react";
import type { ComponentType } from "react";
import { Post } from "../components/index.ts";
import PostValidationPopup from "./PostValidationPopup.tsx";

interface BasePost {
  _id: string;
}

interface PostComponentProps<TPost extends BasePost> {
  post: TPost;
  onUpdate: (post: TPost) => void;
  onDelete: (id: string) => void;
}

interface PostListProps<TPost extends BasePost> {
  title: ReactNode;
  posts: TPost[];
  popupEntityName?: string;
  PostComposant?: ComponentType<PostComponentProps<TPost>>;
  popupPost: { title?: string; priorityColor?: number; [key: string]: unknown };
  handleCreate: () => void | Promise<void>;
  handleUpdate: () => void | Promise<void>;
  handleDelete: (id: string) => void | Promise<void>;
  setTitle: (title: string) => void;
  setPriorityColor: (priority: number) => void;
  setAllFields: (post: TPost) => void;
  resetAllFields: () => void;
  popupInputs?: ReactNode;
  isFieldValid?: boolean;
  emptyState?: ReactNode;
  sectionClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  addButtonClassName?: string;
  addButtonContent?: ReactNode;
  addButtonTitle?: string;
  compactPriorityPicker?: boolean;
  showAddButton?: boolean;
}

const PostList = <TPost extends BasePost>({
  title,
  posts,
  popupEntityName = "element",
  PostComposant,
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
  emptyState,
  sectionClassName = "",
  headerClassName = "",
  bodyClassName = "",
  addButtonClassName = "fa-solid fa-circle-plus hover:scale-125 transition-transform duration-500",
  addButtonContent,
  addButtonTitle = "Ajouter",
  compactPriorityPicker = false,
  showAddButton = true,
}: PostListProps<TPost>) => {
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
  const ResolvedPostComponent = (PostComposant ||
    (Post as ComponentType<PostComponentProps<TPost>>)) as ComponentType<PostComponentProps<TPost>>;

  const openCreationPopup = () => {
    resetAllFields();
    setShowCreatePopup(true);
  };

  const closeCreationPopup = () => {
    setShowCreatePopup(false);
  };

  const openUpdatePopup = (post: TPost) => {
    setAllFields(post);
    setShowUpdatePopup(true);
  };

  const closeUpdatePopup = () => {
    setShowUpdatePopup(false);
  };

  const handleCreatePost = async () => {
    await handleCreate();
    closeCreationPopup();
  };

  const handleUpdatePost = async () => {
    await handleUpdate();
    closeUpdatePopup();
  };

  const renderCreatePopup = () => {
    return (
      <PostValidationPopup
        postName={popupEntityName}
        actionType={"Ajouter"}
        showPopup={showCreatePopup}
        togglePopup={closeCreationPopup}
        handleValidate={handleCreatePost}
        popupPost={popupPost}
        setPopupPost={setTitle}
        setPriorityColor={setPriorityColor}
        inputs={popupInputs}
        isFieldValid={isFieldValid}
        compactPriorityPicker={compactPriorityPicker}
      />
    );
  };

  const renderUpdatePopup = () => {
    return (
      <PostValidationPopup
        postName={popupEntityName}
        actionType={"Modifier"}
        showPopup={showUpdatePopup}
        togglePopup={closeUpdatePopup}
        handleValidate={handleUpdatePost}
        popupPost={popupPost}
        setPopupPost={setTitle}
        setPriorityColor={setPriorityColor}
        inputs={popupInputs}
        isFieldValid={isFieldValid}
        compactPriorityPicker={compactPriorityPicker}
      />
    );
  };

  const sectionClasses = ["post-list-section", sectionClassName].filter(Boolean).join(" ");
  const headerClasses = ["post-list-header", headerClassName].filter(Boolean).join(" ");
  const bodyClasses = ["post-info-panel", bodyClassName].filter(Boolean).join(" ");

  return (
    <section className={sectionClasses}>
      <div className={headerClasses}>
        {title}
        {showAddButton && (
          <button type="button" className={addButtonClassName} onClick={openCreationPopup} title={addButtonTitle}>
            {addButtonContent}
          </button>
        )}
      </div>

      {renderCreatePopup()}
      {renderUpdatePopup()}

      <div className={bodyClasses}>
        {posts.length === 0 && emptyState}
        {posts &&
          posts.length > 0 &&
          posts.map((post) => (
            <div key={post._id}>
              <ResolvedPostComponent post={post} onUpdate={openUpdatePopup} onDelete={handleDelete} />
            </div>
          ))}
      </div>
    </section>
  );
};

export default PostList;
