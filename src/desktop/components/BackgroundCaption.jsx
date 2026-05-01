import { backgroundCaptions } from "../../data/content";
import "./BackgroundCaption.css";

const BackgroundCaption = ({ background }) => {
  const caption = backgroundCaptions[background];
  if (!caption) return null;
  return (
    <div className="bg-caption" aria-label={`Background: ${caption.title}, ${caption.detail}`}>
      <span className="bg-caption-title">{caption.title}</span>
      <span className="bg-caption-detail">{caption.detail}</span>
    </div>
  );
};

export default BackgroundCaption;
