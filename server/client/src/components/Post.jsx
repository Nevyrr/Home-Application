const Post = ({ post, userId, onUpdate, onDelete, body }) => {
  return (
    <div className="mb-6 relative">

      <div className="flex items-start justify-between w-4/5">
        <div className="w-4/5">
          <h2 className="post-title-input">{post.title}</h2>
          <p className="text-[10px] text-slate-500">{post.username}</p>
          <p className="text-[10px] text-slate-500">{"Created Date: " + new Date(post.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-2">
          {userId === post.user && (
            <div>
              <button
                className="fa-solid fa-pen-to-square nav-link text-green-500 hover:bg-green-200"
                title="Update"
                onClick={() => onUpdate(post)}
              ></button>
              <button
                className="fa-solid fa-trash-can nav-link text-red-500 hover:bg-red-200"
                title="Delete"
                onClick={() => onDelete(post._id)}
              ></button>
            </div>
          )}
        </div>
      </div>

      {body}
      <div className="h-px w-full bg-gradient-to-r from-indigo-50 via-indigo-500/70 to-indigo-50 mt-6"></div>
    </div>
  );
};

export default Post;
