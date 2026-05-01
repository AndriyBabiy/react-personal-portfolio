import Desktop from "../desktop/Desktop";
import MobileSpringboard from "../desktop/MobileSpringboard";
import { useViewportMode } from "../desktop/hooks/useViewportMode";

function DesktopPage() {
  const mode = useViewportMode();
  return mode === "mobile" ? <MobileSpringboard /> : <Desktop />;
}

export default DesktopPage;
