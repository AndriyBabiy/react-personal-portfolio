import { profile } from '../../data/content';
import './PDFViewer.css';

const PDFViewer = () => {
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