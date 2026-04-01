import { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  useEffect(() => {
    // Set initial volume to 50%
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        setShowOverlay(false);
      }
    }
  };

  const handleVideoClick = (e) => {
    // Prevent click when clicking on native controls
    if (e.target === videoRef.current) {
      togglePlay();
    }
  };

  const handleMouseEnter = () => {
    if (isPlaying) {
      setShowOverlay(true);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowOverlay(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setShowOverlay(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setShowOverlay(true);
  };

  return (
    <div 
      className="video-player"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        controls
        width="100%"
        height="100%"
        preload="metadata"
        controlsList="nodownload"
        onClick={handleVideoClick}
        onPlay={handlePlay}
        onPause={handlePause}
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {(showOverlay || !isPlaying) && (
        <div className="video-overlay" onClick={togglePlay}>
          <div className="play-button">
            {isPlaying ? (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
              </svg>
            )}
          </div>
          <div className="video-hint">
            {isPlaying ? 'Click to pause' : 'Click to play'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;