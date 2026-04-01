import './PlaceholderApp.css';

const PlaceholderApp = ({ appName, color }) => {
  return (
    <div className="placeholder-app" style={{ '--app-color': color }}>
      <div className="placeholder-content">
        <h2>Add {appName} functionality later</h2>
        <p>This window is a placeholder for future features.</p>
      </div>
    </div>
  );
};

export default PlaceholderApp;