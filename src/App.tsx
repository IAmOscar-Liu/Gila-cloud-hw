import EditingArea from "./components/EditingArea";
import ErrorBoundary from "./components/ErrorBoundary";
import PreviewArea from "./components/PreviewArea";

function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col-reverse md:grid md:grid-cols-[1fr,1fr]">
        <EditingArea />
        <PreviewArea />
      </div>
    </ErrorBoundary>
  );
}

export default App;
