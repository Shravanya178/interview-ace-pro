import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Video, Mic, Settings, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/use-toast";

// Note: Jitsi Meet External API will be loaded dynamically
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const InterviewSession = () => {
  const apiRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  const roomName = searchParams.get("room") || "interview-default";
  const interviewType = searchParams.get("type") || "mock";
  const company = searchParams.get("company") || "";
  const role = searchParams.get("role") || "";

  useEffect(() => {
    // Initialize Jitsi when component mounts
    const initJitsi = () => {
      if (
        containerRef.current &&
        typeof window.JitsiMeetExternalAPI !== "undefined" &&
        !apiRef.current
      ) {
        // Set up config for Jitsi Meet
        const domain = "meet.jit.si";
        const options = {
          roomName: roomName,
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          lang: "en",
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: true,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            APP_NAME: "Interview Ace Pro",
            NATIVE_APP_NAME: "Interview Ace Pro",
            PROVIDER_NAME: "Interview Ace Pro",
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "chat",
              "recording",
              "settings",
              "raisehand",
              "videoquality",
            ],
          },
          userInfo: {
            displayName: "Candidate",
          },
        };

        try {
          // Create the Jitsi Meet external API instance
          apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

          // Event listeners
          apiRef.current.addEventListeners({
            readyToClose: handleClose,
            videoConferenceJoined: handleJoined,
            participantJoined: handleParticipantJoined,
          });
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to initialize Jitsi:", error);
          toast({
            title: t("error"),
            description: t("failed_to_initialize_interview"),
            variant: "destructive",
          });
        }
      }
    };

    // Check if the API is already loaded
    if (typeof window.JitsiMeetExternalAPI !== "undefined") {
      initJitsi();
    } else {
      // Load the Jitsi Meet External API script if not already loaded
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = initJitsi;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }

    // Cleanup on unmount
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomName, toast, t]);

  const handleJoined = () => {
    setIsJoined(true);
    toast({
      title: t("success"),
      description: t("interview_session_started"),
    });
  };

  const handleParticipantJoined = (participant: any) => {
    toast({
      title: t("participant_joined"),
      description: `${participant.displayName} ${t("has_joined_the_session")}`,
    });
  };

  const handleClose = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
    }
    navigate("/interview");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/interview")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Back to Interview")}
          </Button>
          <div className="flex items-center gap-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold">
                {company || t("Mock Interview")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {role || t("General Interview")}
              </p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="relative h-[600px] overflow-hidden">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : null}
              <div ref={containerRef} className="h-full" />
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("Interview Controls")}
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => apiRef.current?.executeCommand("toggleAudio")}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {t("Toggle Audio")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => apiRef.current?.executeCommand("toggleVideo")}
                >
                  <Video className="mr-2 h-4 w-4" />
                  {t("Toggle Video")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    apiRef.current?.executeCommand("toggleFullScreen")
                  }
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t("Settings")}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleClose}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("End Interview")}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("Interview Info")}
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">{t("Room")}:</span> {roomName}
                </p>
                <p>
                  <span className="font-medium">{t("Type")}:</span>{" "}
                  {interviewType}
                </p>
                <p>
                  <span className="font-medium">{t("Status")}:</span>{" "}
                  {isJoined ? t("Connected") : t("Connecting")}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
