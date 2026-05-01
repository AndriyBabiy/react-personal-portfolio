import { useStudioContent } from '../hooks/useStudioContent';
import './PDFViewer.css';

const PDFViewer = () => {
  const profile = useStudioContent('profile') || {};
  return (
    <div className="pdf-viewer">
      <iframe
        src={profile.cvPath}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="Andriy Babiy CV"
      />
    </div>
  );
};

export default PDFViewer;