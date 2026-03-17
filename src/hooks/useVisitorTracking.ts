import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisit = async () => {
      // Only track once per session
      const tracked = sessionStorage.getItem("visitor_tracked");
      if (tracked) return;

      try {
        await supabase.functions.invoke("track-visitor", {
          body: {
            user_agent: navigator.userAgent,
            page_url: window.location.pathname,
          },
        });
        sessionStorage.setItem("visitor_tracked", "true");
      } catch (err) {
        console.error("Visitor tracking failed:", err);
      }
    };

    trackVisit();
  }, []);
};

export default useVisitorTracking;
