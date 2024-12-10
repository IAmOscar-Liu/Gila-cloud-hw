import EditingArea from "./components/EditingArea";
import PreviewArea from "./components/PreviewArea";

function App() {
  return (
    <div className="grid h-screen grid-cols-[1fr,1fr]">
      <EditingArea />
      <PreviewArea />
    </div>
  );
}

export default App;
