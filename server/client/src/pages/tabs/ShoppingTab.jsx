import { useContext, useEffect, useState } from "react";
import { Alert, Success, ShoppingPost } from "../../components";
import { getPosts } from "../../controllers/ShoppingPostsController";
import { deletePost } from "../../controllers/ShoppingPostsController";
import { PostContext } from "../../contexts/PostContext";

const ShoppingTab = () => {
  // Use post context
  const { posts, setPosts } = useContext(PostContext);

  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState(null);
  // Success state
  const [success, setSuccess] = useState(null);

  // Grab all the posts on page load
  useEffect(() => {
    setTimeout(async () => {
      // Grab all posts
      const data = await getPosts();
      // Update posts state
      setPosts(data.posts);
      // Remove the loading
      setLoading(false);
    }, 1000);
  }, []);

  // Handle delete post
  const handleDelete = async (_id) => {
    if (confirm("Confirm delete?")) {
      try {
        // Delete the post
        const msg = await deletePost(_id);
        // Update posts state
        const data = await getPosts();
        setPosts(data.posts);
        // Set the success message
        setSuccess(msg.success);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <section className="card">
      <h1 className="title">Shopping Cart</h1>

      {loading && (
        <i className="fa-solid fa-spinner animate-spin text-3xl text-center block"></i>
      )}

      {success && <Success msg={success} />}
      {error && <Alert msg={error} />}

      {posts &&
        posts.map((post) => (
          <div key={post._id}>
            <ShoppingPost
              post={post}
              onDelete={handleDelete}
            />
          </div>
        ))}
    </section>
  );
};

export default ShoppingTab;
