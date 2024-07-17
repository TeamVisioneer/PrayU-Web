import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import useBearStore from "./stores/baseStore";

function App() {
  const [count, setCount] = useState(0);

  const groupList = useBearStore((state) => state.groupList);
  const fetchGroupListByUserId = useBearStore(
    (state) => state.fetchGroupListByUserId
  );

  useEffect(() => {
    fetchGroupListByUserId("d8d752e0-b236-401f-ba52-9ebd905c09ab");
  }, []);

  console.log(groupList);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs"></p>
    </>
  );
}

export default App;
