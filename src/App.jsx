import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button } from "./components/ui/ui/button";
import CreateTrip from "./create-trip";

function App() {
  const [count, setCount] = useState(0);
  const [showCreateTrip, setShowCreateTrip] = useState(false);

  if (showCreateTrip) {
    return <CreateTrip />;
  }

  return (
    <>
      <Button onClick={() => setShowCreateTrip(true)}>SecurityFirst - Create Trip</Button>
    </>
  );
}

export default App;
