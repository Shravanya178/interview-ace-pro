/**
 * Anti-Cheating Measures for Interview Pro
 * This script enforces anti-cheating measures during interviews:
 * - Ensures camera remains on
 * - Ensures microphone remains on
 * - Detects tab switching
 * - Prevents copy/paste operations
 */

class AntiCheatingSystem {
  constructor(interviewServer) {
    this.interviewServer = interviewServer; // Server connection
    this.isCameraActive = false;
    this.isMicrophoneActive = false;
    this.isTabFocused = true;
    this.warningCount = 0;
    this.maxWarnings = 3;
    this.interviewTerminated = false;

    // Bind methods
    this.initializeAntiCheating = this.initializeAntiCheating.bind(this);
    this.monitorCamera = this.monitorCamera.bind(this);
    this.monitorMicrophone = this.monitorMicrophone.bind(this);
    this.trackTabFocus = this.trackTabFocus.bind(this);
    this.preventCopyPaste = this.preventCopyPaste.bind(this);
    this.reportViolation = this.reportViolation.bind(this);
    this.terminateInterview = this.terminateInterview.bind(this);
  }

  /**
   * Initialize all anti-cheating measures
   */
  async initializeAntiCheating() {
    console.log("Initializing anti-cheating measures");

    // Display initial warning
    this.displayRequirements();

    // Start monitoring systems
    this.monitorCamera();
    this.monitorMicrophone();
    this.trackTabFocus();
    this.preventCopyPaste();

    // Check initial permissions
    await this.checkInitialPermissions();

    return true;
  }

  /**
   * Display anti-cheating requirements to the user
   */
  displayRequirements() {
    const requirementsContainer = document.createElement("div");
    requirementsContainer.className = "anti-cheating-requirements";
    requirementsContainer.innerHTML = `
      <h3>Interview Requirements</h3>
      <p>To ensure the integrity of your interview, please note the following requirements:</p>
      <ul>
        <li>Camera must remain on throughout the interview</li>
        <li>Microphone must remain on throughout the interview</li>
        <li>Do not switch tabs or applications during the interview</li>
        <li>Copy-paste functionality is disabled during the interview</li>
      </ul>
      <p><strong>Warning:</strong> Violating these requirements may result in your interview being terminated.</p>
    `;

    document.body.appendChild(requirementsContainer);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      requirementsContainer.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(requirementsContainer)) {
          document.body.removeChild(requirementsContainer);
        }
      }, 1000);
    }, 10000);
  }

  /**
   * Check initial camera and microphone permissions
   */
  async checkInitialPermissions() {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Store stream for future reference
      this.mediaStream = stream;

      // Update status
      this.isCameraActive = true;
      this.isMicrophoneActive = true;

      // Update server
      await this.interviewServer.update_camera_status(true);
      await this.interviewServer.update_microphone_status(true);

      console.log("Initial permissions granted for camera and microphone");
      return true;
    } catch (error) {
      console.error("Error getting media permissions:", error);

      // Display error message
      alert(
        "Camera and microphone access is required for this interview. Please enable them and refresh the page."
      );

      return false;
    }
  }

  /**
   * Monitor camera status
   */
  monitorCamera() {
    // Check for existing video elements, or create one if needed
    let videoElement = document.querySelector("video.interview-camera");
    if (!videoElement) {
      videoElement = document.createElement("video");
      videoElement.className = "interview-camera";
      videoElement.style.opacity = "0";
      videoElement.style.position = "absolute";
      videoElement.style.width = "1px";
      videoElement.style.height = "1px";
      videoElement.autoplay = true;
      document.body.appendChild(videoElement);
    }

    // Check if camera track exists
    const checkCameraStatus = () => {
      if (this.interviewTerminated) return;

      const hasActiveVideoTrack =
        this.mediaStream &&
        this.mediaStream
          .getVideoTracks()
          .some((track) => track.enabled && track.readyState === "live");

      const newStatus = !!hasActiveVideoTrack;

      // If status changed, report to server
      if (this.isCameraActive !== newStatus) {
        this.isCameraActive = newStatus;
        this.interviewServer
          .update_camera_status(newStatus)
          .catch((error) =>
            console.error("Error updating camera status:", error)
          );

        if (!newStatus) {
          this.reportViolation("Camera has been turned off", "camera_off");
        }
      }
    };

    // Check camera status every 2 seconds
    this.cameraInterval = setInterval(checkCameraStatus, 2000);
  }

  /**
   * Monitor microphone status
   */
  monitorMicrophone() {
    // Check if microphone track exists
    const checkMicrophoneStatus = () => {
      if (this.interviewTerminated) return;

      const hasActiveAudioTrack =
        this.mediaStream &&
        this.mediaStream
          .getAudioTracks()
          .some((track) => track.enabled && track.readyState === "live");

      const newStatus = !!hasActiveAudioTrack;

      // If status changed, report to server
      if (this.isMicrophoneActive !== newStatus) {
        this.isMicrophoneActive = newStatus;
        this.interviewServer
          .update_microphone_status(newStatus)
          .catch((error) =>
            console.error("Error updating microphone status:", error)
          );

        if (!newStatus) {
          this.reportViolation(
            "Microphone has been turned off",
            "microphone_off"
          );
        }
      }
    };

    // Check microphone status every 2 seconds
    this.microphoneInterval = setInterval(checkMicrophoneStatus, 2000);
  }

  /**
   * Track tab focus changes
   */
  trackTabFocus() {
    // Handle tab losing focus
    window.addEventListener("blur", () => {
      if (this.interviewTerminated) return;

      this.isTabFocused = false;
      this.interviewServer
        .update_tab_focus(false)
        .catch((error) => console.error("Error updating tab focus:", error));

      this.reportViolation("Tab switching detected", "tab_switch");
    });

    // Handle tab regaining focus
    window.addEventListener("focus", () => {
      if (this.interviewTerminated) return;

      this.isTabFocused = true;
      this.interviewServer
        .update_tab_focus(true)
        .catch((error) => console.error("Error updating tab focus:", error));
    });

    // Handle visibility change (minimized window)
    document.addEventListener("visibilitychange", () => {
      if (this.interviewTerminated) return;

      const isVisible = document.visibilityState === "visible";

      if (!isVisible) {
        this.isTabFocused = false;
        this.interviewServer
          .update_tab_focus(false)
          .catch((error) => console.error("Error updating tab focus:", error));

        this.reportViolation(
          "Application minimized or tab switched",
          "tab_switch"
        );
      } else {
        this.isTabFocused = true;
        this.interviewServer
          .update_tab_focus(true)
          .catch((error) => console.error("Error updating tab focus:", error));
      }
    });
  }

  /**
   * Prevent copy and paste operations
   */
  preventCopyPaste() {
    // Prevent copy
    document.addEventListener("copy", (e) => {
      if (this.interviewTerminated) return;

      e.preventDefault();
      this.reportViolation("Copy attempt detected", "copy_paste");
      this.interviewServer
        .report_copy_paste_attempt()
        .catch((error) =>
          console.error("Error reporting copy attempt:", error)
        );
    });

    // Prevent paste
    document.addEventListener("paste", (e) => {
      if (this.interviewTerminated) return;

      e.preventDefault();
      this.reportViolation("Paste attempt detected", "copy_paste");
      this.interviewServer
        .report_copy_paste_attempt()
        .catch((error) =>
          console.error("Error reporting paste attempt:", error)
        );
    });

    // Prevent right-click
    document.addEventListener("contextmenu", (e) => {
      if (this.interviewTerminated) return;

      e.preventDefault();
      return false;
    });

    // Prevent keyboard shortcuts for copy/paste
    document.addEventListener("keydown", (e) => {
      if (this.interviewTerminated) return;

      // Check for Ctrl+C, Ctrl+V, Command+C, Command+V
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || e.key === "v" || e.key === "x")
      ) {
        e.preventDefault();
        this.reportViolation(
          "Keyboard shortcut for copy/paste detected",
          "copy_paste"
        );
        this.interviewServer
          .report_copy_paste_attempt()
          .catch((error) =>
            console.error("Error reporting copy/paste attempt:", error)
          );
        return false;
      }
    });
  }

  /**
   * Report a violation with UI notification
   */
  reportViolation(message, type) {
    console.warn(`Violation detected: ${message} (${type})`);
    this.warningCount++;

    // Create warning element
    const warningElement = document.createElement("div");
    warningElement.className = "anti-cheating-warning";
    warningElement.innerHTML = `
      <div class="warning-icon">⚠️</div>
      <div class="warning-message">
        <strong>Warning ${this.warningCount}/${this.maxWarnings}:</strong> ${message}
      </div>
    `;

    // Style warning
    warningElement.style.position = "fixed";
    warningElement.style.top = "20px";
    warningElement.style.left = "50%";
    warningElement.style.transform = "translateX(-50%)";
    warningElement.style.backgroundColor = "rgba(255, 0, 0, 0.9)";
    warningElement.style.color = "white";
    warningElement.style.padding = "10px 20px";
    warningElement.style.borderRadius = "5px";
    warningElement.style.zIndex = "9999";
    warningElement.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    warningElement.style.display = "flex";
    warningElement.style.alignItems = "center";

    document.body.appendChild(warningElement);

    // Remove after 5 seconds
    setTimeout(() => {
      warningElement.style.opacity = "0";
      warningElement.style.transition = "opacity 0.5s";
      setTimeout(() => {
        if (document.body.contains(warningElement)) {
          document.body.removeChild(warningElement);
        }
      }, 500);
    }, 5000);

    // Check if max warnings reached
    if (this.warningCount >= this.maxWarnings) {
      this.terminateInterview();
    }
  }

  /**
   * Terminate the interview due to excessive violations
   */
  terminateInterview() {
    if (this.interviewTerminated) return;

    this.interviewTerminated = true;
    console.error("Interview terminated due to excessive violations");

    // Report to server
    this.interviewServer
      .terminate_interview({
        reason: "excessive_violations",
        violations: {
          camera_off: !this.isCameraActive ? 1 : 0,
          microphone_off: !this.isMicrophoneActive ? 1 : 0,
          tab_switch: !this.isTabFocused ? 1 : 0,
          total_warnings: this.warningCount,
        },
      })
      .catch((error) => console.error("Error terminating interview:", error));

    // Stop monitoring
    clearInterval(this.cameraInterval);
    clearInterval(this.microphoneInterval);

    // Release media streams
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    // Display termination message
    const terminationElement = document.createElement("div");
    terminationElement.className = "interview-terminated";
    terminationElement.innerHTML = `
      <div class="termination-content">
        <h2>Interview Terminated</h2>
        <p>Your interview has been terminated due to multiple violations of the interview rules.</p>
        <p>Violations detected:</p>
        <ul>
          ${!this.isCameraActive ? "<li>Camera disabled</li>" : ""}
          ${!this.isMicrophoneActive ? "<li>Microphone disabled</li>" : ""}
          ${!this.isTabFocused ? "<li>Tab switching detected</li>" : ""}
          <li>Total warnings: ${this.warningCount}</li>
        </ul>
        <p>Please contact the interviewer for further instructions.</p>
      </div>
    `;

    // Style termination screen
    terminationElement.style.position = "fixed";
    terminationElement.style.top = "0";
    terminationElement.style.left = "0";
    terminationElement.style.width = "100%";
    terminationElement.style.height = "100%";
    terminationElement.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    terminationElement.style.color = "white";
    terminationElement.style.display = "flex";
    terminationElement.style.justifyContent = "center";
    terminationElement.style.alignItems = "center";
    terminationElement.style.zIndex = "10000";

    document.body.appendChild(terminationElement);

    // Play error sound
    const audio = new Audio("/static/sounds/interview-terminated.mp3");
    audio
      .play()
      .catch((err) => console.error("Could not play termination sound", err));
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Stop intervals
    if (this.cameraInterval) clearInterval(this.cameraInterval);
    if (this.microphoneInterval) clearInterval(this.microphoneInterval);

    // Release media streams
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    console.log("Anti-cheating system cleaned up");
  }
}

// Initialize when document is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing anti-cheating system...");

  // Wait for the interview server connection to be established
  window.initializeAntiCheating = async (interviewServer) => {
    const antiCheating = new AntiCheatingSystem(interviewServer);
    const initialized = await antiCheating.initializeAntiCheating();

    if (initialized) {
      console.log("Anti-cheating system activated");

      // Store for later access
      window.antiCheatingSystem = antiCheating;

      return true;
    }

    return false;
  };
});
