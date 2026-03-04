import { useEffect, useState } from "react";

function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Blog</h1>

      {posts.map((post) => (
        <div key={post._id} style={{ marginBottom: "20px" }}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;