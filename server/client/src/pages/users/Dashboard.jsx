import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { UserContext } from "../../contexts/UserContext";
import { deletePost, getUserPosts } from "../../controllers/ShoppingPostsController";
import ShoppingPost from "../../components/ShoppingPost";
import Alert from "../../components/Alert";
import Success from "../../components/Success";

const Dashboard = () => {
  // Use user context
  const { user, setUser } = useContext(UserContext);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error state
  const [error, setError] = useState(null);

  // Success state
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setTimeout(async () => {
      // Grab user's posts
      const { name, email, userPosts } = await getUserPosts();
      // Update user state
      setUser({ name, email, posts: userPosts });
      // Remove the loading
      setLoading(false);
    }, 500);
  }, []);

  // Handle delete post
  const handleDelete = async (_id) => {
    if (confirm("Confirm delete?")) {
      try {
        // Delete the post
        const data = await deletePost(_id);
        // Set the success message
        setSuccess(data.success);
      } catch (error) {
        setError(error.message);
      }

      const newPosts = user.posts.filter((post) => post._id !== _id);
      setUser({ ...user, posts: newPosts });
    }
  };
  return (
    <section className="card">
      <h1 className="title m-0">{user.name} Dashboard</h1>
      <p className="mb-4">{user.email}</p>

      {loading && (
        <i className="fa-solid fa-spinner animate-spin text-3xl text-center block"></i>
      )}

      {success && <Success msg={success} />}
      {error && <Alert msg={error} />}

      {user.posts &&
        user.posts.map((post) => (
          <div key={post._id}>
            <ShoppingPost post={post}>
              <div className="flex items-center gap-2">
                <Link
                  className="fa-solid fa-pen-to-square nav-link text-green-500 hover:bg-green-200"
                  title="Update"
                  state={post} // Send the posts to the Update page
                  to="/update"
                ></Link>
                <button
                  className="fa-solid fa-trash-can nav-link text-red-500 hover:bg-red-200"
                  title="Delete"
                  onClick={() => handleDelete(post._id)}
                ></button>
              </div>
            </ShoppingPost>
          </div>
        ))}
    </section>
  );
};

export default Dashboard;
