import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { getUserPosts } from "../../controllers/ShoppingPostsController";

const Dashboard = () => {
  // Use user context
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    setTimeout(async () => {
      // Update user state
      setUser({ name, email });
      // Remove the loading
      setLoading(false);
    }, 500);
  }, []);

  return (
    <section className="card">
      <h1 className="title m-0">{user.name} Dashboard</h1>
      <p className="mb-4">{user.email}</p>
    </section>
  );
};

export default Dashboard;
