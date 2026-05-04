import { useState } from "react";
import CreateTest from "./pages/CreateTest";
import AddQuestions from "./pages/AddQuestions";

function App() {
  const [testData, setTestData] = useState(null);

  // called when user clicks "Add Another Test" on the done screen
  const handleDone = () => setTestData(null);

  return (
    <>
      {!testData ? (
        <CreateTest setTestData={setTestData} />
      ) : (
        <AddQuestions testData={testData} onDone={handleDone} />
      )}
    </>
  );
}

export default App;
