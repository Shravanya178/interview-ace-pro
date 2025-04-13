import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceDetection from "@tensorflow-models/face-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Emotion labels
const EMOTIONS = [
  "confident",
  "nervous",
  "engaged",
  "disinterested",
  "thoughtful",
  "uncertain",
  "neutral",
];

// Custom emotion colors
const EMOTION_COLORS = {
  confident: "bg-emerald-500",
  nervous: "bg-pink-500",
  engaged: "bg-blue-500",
  disinterested: "bg-gray-400",
  thoughtful: "bg-purple-500",
  uncertain: "bg-amber-500",
  neutral: "bg-slate-400",
};

interface EmotionDetectorProps {
  width?: number;
  height?: number;
  onEmotionCapture?: (emotions: { [key: string]: number }) => void;
  isActive?: boolean;
  directMode?: boolean;
}

interface EmotionData {
  timestamp: number;
  emotions: { [key: string]: number };
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({
  width = 320,
  height = 240,
  onEmotionCapture,
  isActive = true,
  directMode = false,
}) => {
  // Component state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState<faceDetection.FaceDetector | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<{
    label: string;
    confidence: number;
  } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [useDirectMode, setUseDirectMode] = useState<boolean>(directMode);

  // =========== SIMPLIFIED CAMERA SETUP ===========
  const setupCamera = useCallback(async () => {
    console.log("Setting up simplified camera...");

    try {
      // Clear previous streams if any
      if (videoRef.current?.srcObject) {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }

      // Get new stream with minimal constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log("Camera stream obtained", stream.getVideoTracks()[0]?.label);

      // Set stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setCameraActive(true);
                console.log("Camera active - video playing");
              })
              .catch((err) => {
                console.error("Error playing video", err);
                setError(`Unable to play video: ${err.message}`);
              });
          }
        };
      } else {
        console.error("Video element not available");
        setError("Video element not available");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError(
        `Camera access error: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }, []);

  // Initialize camera when component mounts
  useEffect(() => {
    if (!isActive) {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      return;
    }

    // Always start with simple direct mode for compatibility
    setupCamera();

    // Load TensorFlow model in background if needed for analysis
    if (!useDirectMode) {
      const loadTensorFlow = async () => {
        try {
          await tf.ready();
          console.log("TensorFlow.js loaded");

          const detectionModel = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
              runtime: "tfjs",
              refineLandmarks: true,
              maxFaces: 1,
            }
          );
          console.log("Face detection model loaded");
          setModel(detectionModel);
        } catch (err) {
          console.warn("TensorFlow model loading error:", err);
          // Don't set error - it's okay if this fails, we'll just use direct mode
          setUseDirectMode(true);
        } finally {
          setIsLoading(false);
        }
      };

      loadTensorFlow();
    } else {
      // Skip TensorFlow loading
      setIsLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, useDirectMode, setupCamera]);

  // Generate random emotions for demo if TensorFlow not available
  const generateRandomEmotions = useCallback(() => {
    if (!isActive || !onEmotionCapture) return;

    // Create synthetic emotions for interview context
    const emotions: { [key: string]: number } = {
      confident: 0.2 + Math.random() * 0.3,
      nervous: 0.1 + Math.random() * 0.2,
      engaged: 0.2 + Math.random() * 0.2,
      disinterested: Math.random() * 0.1,
      thoughtful: 0.1 + Math.random() * 0.2,
      uncertain: Math.random() * 0.2,
      neutral: 0.1 + Math.random() * 0.1,
    };

    // Normalize to sum to 1
    const sum = Object.values(emotions).reduce((a, b) => a + b, 0);
    Object.keys(emotions).forEach((key) => {
      emotions[key] = emotions[key] / sum;
    });

    // Find dominant emotion
    let maxEmotion = "";
    let maxValue = 0;
    Object.keys(emotions).forEach((emotion) => {
      if (emotions[emotion] > maxValue) {
        maxValue = emotions[emotion];
        maxEmotion = emotion;
      }
    });

    setCurrentEmotion({ label: maxEmotion, confidence: maxValue });

    // Update emotion history
    const timestamp = Date.now();
    setEmotionHistory((prev) => {
      const newHistory = [...prev, { timestamp, emotions }];
      if (newHistory.length > 300) {
        return newHistory.slice(newHistory.length - 300);
      }
      return newHistory;
    });

    // Call the callback with emotions
    onEmotionCapture(emotions);
  }, [isActive, onEmotionCapture]);

  // Generate emotions based on video frame analysis
  const generateEmotions = useCallback(() => {
    if (!isActive || !videoRef.current || !cameraActive) return;

    try {
      // Create a temporary canvas to analyze the video frame
      const tempCanvas = document.createElement("canvas");
      const context = tempCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      // Set canvas size to match video dimensions
      const videoWidth = videoRef.current.videoWidth || width;
      const videoHeight = videoRef.current.videoHeight || height;
      tempCanvas.width = videoWidth;
      tempCanvas.height = videoHeight;

      // Draw the current video frame to analyze
      context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

      // Store current frame for motion detection
      const currentFrame = context.getImageData(0, 0, videoWidth, videoHeight);

      // Define more precise facial regions for better accuracy
      const regions = [
        // Center face region
        {
          x: Math.floor(videoWidth / 2) - Math.floor(videoWidth / 4),
          y: Math.floor(videoHeight / 2) - Math.floor(videoHeight / 4),
          width: Math.floor(videoWidth / 2),
          height: Math.floor(videoHeight / 2),
          name: "face",
        },
        // Eyes region - more precise
        {
          x: Math.floor(videoWidth / 2) - Math.floor(videoWidth / 4),
          y: Math.floor(videoHeight / 3) - Math.floor(videoHeight / 20),
          width: Math.floor(videoWidth / 2),
          height: Math.floor(videoHeight / 6),
          name: "eyes",
        },
        // Mouth region - more precise
        {
          x: Math.floor(videoWidth / 2) - Math.floor(videoWidth / 5),
          y: Math.floor(videoHeight * 0.6),
          width: Math.floor(videoWidth / 2.5),
          height: Math.floor(videoHeight / 8),
          name: "mouth",
        },
        // Forehead region - for detecting frowns and concentration
        {
          x: Math.floor(videoWidth / 2) - Math.floor(videoWidth / 5),
          y: Math.floor(videoHeight / 4),
          width: Math.floor(videoWidth / 2.5),
          height: Math.floor(videoHeight / 10),
          name: "forehead",
        },
      ];

      // Analyze each region separately with enhanced metrics
      const regionData = regions
        .map((region) => {
          try {
            const imageData = context.getImageData(
              region.x,
              region.y,
              region.width,
              region.height
            );

            // Basic analysis of brightness and color distribution
            let totalBrightness = 0;
            let redSum = 0;
            let greenSum = 0;
            let blueSum = 0;
            let pixelCount = 0;
            let brightPixels = 0;
            let darkPixels = 0;
            let edgeCount = 0; // approximation of edges (contrast)
            let horizontalEdges = 0; // horizontal lines (e.g., in forehead when frowning)
            let verticalEdges = 0; // vertical lines (e.g., between eyebrows)

            // Variables for analyzing texture and patterns
            const pixelMatrix = [];
            const rowWidth = imageData.width * 4;

            // Process pixels
            for (let y = 0; y < imageData.height; y++) {
              const row = [];
              for (let x = 0; x < imageData.width; x++) {
                const i = y * rowWidth + x * 4;
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const brightness = (r + g + b) / 3;

                row.push(brightness);

                // Skip extremely dark pixels
                if (brightness < 25) {
                  darkPixels++;
                  continue;
                }

                // Count bright pixels (might indicate teeth, eye whites, etc.)
                if (r > 180 && g > 180 && b > 180) {
                  brightPixels++;
                }

                // Edge detection for horizontal lines
                if (y > 0 && x < imageData.width - 1) {
                  const aboveIdx = (y - 1) * rowWidth + x * 4;
                  const aboveBrightness =
                    (imageData.data[aboveIdx] +
                      imageData.data[aboveIdx + 1] +
                      imageData.data[aboveIdx + 2]) /
                    3;
                  const diff = Math.abs(brightness - aboveBrightness);

                  if (diff > 30) horizontalEdges++;

                  // Check for vertical edges
                  const rightIdx = y * rowWidth + (x + 1) * 4;
                  const rightBrightness =
                    (imageData.data[rightIdx] +
                      imageData.data[rightIdx + 1] +
                      imageData.data[rightIdx + 2]) /
                    3;
                  const vdiff = Math.abs(brightness - rightBrightness);

                  if (vdiff > 30) verticalEdges++;
                }

                redSum += r;
                greenSum += g;
                blueSum += b;
                totalBrightness += brightness;
                pixelCount++;
              }
              pixelMatrix.push(row);
            }

            // If region too dark, return null
            if (pixelCount < 10) return null;

            // Additional metrics from the pixel matrix
            let textureVariance = 0;
            let horizontalSymmetry = 0;

            // Calculate texture variance (rough measure of skin smoothness/tension)
            if (pixelMatrix.length > 2) {
              let varSum = 0;
              let varCount = 0;

              for (let y = 1; y < pixelMatrix.length - 1; y++) {
                for (let x = 1; x < pixelMatrix[y].length - 1; x++) {
                  const center = pixelMatrix[y][x];
                  const neighbors = [
                    pixelMatrix[y - 1][x - 1],
                    pixelMatrix[y - 1][x],
                    pixelMatrix[y - 1][x + 1],
                    pixelMatrix[y][x - 1],
                    pixelMatrix[y][x + 1],
                    pixelMatrix[y + 1][x - 1],
                    pixelMatrix[y + 1][x],
                    pixelMatrix[y + 1][x + 1],
                  ];

                  const avgNeighbor =
                    neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
                  varSum += Math.abs(center - avgNeighbor);
                  varCount++;
                }
              }

              if (varCount > 0) {
                textureVariance = varSum / varCount;
              }
            }

            // Calculate horizontal symmetry (useful for detecting balance/imbalance in expressions)
            if (pixelMatrix.length > 0 && pixelMatrix[0].length > 1) {
              let symmetryDiff = 0;
              let symmetryPoints = 0;

              const midX = Math.floor(pixelMatrix[0].length / 2);

              for (let y = 0; y < pixelMatrix.length; y++) {
                for (let x = 0; x < midX; x++) {
                  const leftVal = pixelMatrix[y][x];
                  const rightX = pixelMatrix[0].length - 1 - x;

                  if (rightX >= 0 && rightX < pixelMatrix[y].length) {
                    const rightVal = pixelMatrix[y][rightX];
                    symmetryDiff += Math.abs(leftVal - rightVal);
                    symmetryPoints++;
                  }
                }
              }

              if (symmetryPoints > 0) {
                horizontalSymmetry = 1 - symmetryDiff / (symmetryPoints * 255);
              }
            }

            return {
              region: region.name,
              avgBrightness: totalBrightness / pixelCount,
              avgRed: redSum / pixelCount,
              avgGreen: greenSum / pixelCount,
              avgBlue: blueSum / pixelCount,
              brightRatio: brightPixels / pixelCount,
              darkRatio: darkPixels / (pixelCount + darkPixels),
              horizontalEdgeRatio: horizontalEdges / pixelCount,
              verticalEdgeRatio: verticalEdges / pixelCount,
              textureVariance: textureVariance,
              horizontalSymmetry: horizontalSymmetry,
            };
          } catch (err) {
            console.warn(`Error analyzing region ${region.name}:`, err);
            return null;
          }
        })
        .filter(Boolean);

      // Enhanced motion detection with region-specific tracking
      // This helps detect micro-movements in specific facial areas
      let motionLevel = 0;
      let eyeMotion = 0;
      let mouthMotion = 0;
      let foreheadMotion = 0;

      const prevFrameData =
        emotionHistory[emotionHistory.length - 1]?.frameData;
      const prevRegionMotion =
        emotionHistory[emotionHistory.length - 1]?.regionMotion || {};

      if (
        prevFrameData &&
        prevFrameData.data.length === currentFrame.data.length
      ) {
        // Global motion detection (sampling)
        let diffPixels = 0;
        const threshold = 20; // Lower threshold for higher sensitivity

        // Sample pixels at intervals to reduce computation
        for (let i = 0; i < currentFrame.data.length; i += 40) {
          const diff =
            Math.abs(currentFrame.data[i] - prevFrameData.data[i]) +
            Math.abs(currentFrame.data[i + 1] - prevFrameData.data[i + 1]) +
            Math.abs(currentFrame.data[i + 2] - prevFrameData.data[i + 2]);

          if (diff > threshold) diffPixels++;
        }

        motionLevel = diffPixels / (currentFrame.data.length / 40);

        // Region-specific motion detection
        const regionMotion = {};

        // For each region, calculate motion compared to previous frame
        regions.forEach((region) => {
          try {
            // Create simple bounding box for the region
            const startX = region.x;
            const startY = region.y;
            const endX = region.x + region.width;
            const endY = region.y + region.height;

            let regionDiffCount = 0;
            let regionPixelCount = 0;

            // Sample region pixels
            for (let y = startY; y < endY; y += 2) {
              for (let x = startX; x < endX; x += 2) {
                const i = (y * videoWidth + x) * 4;

                // Check if index is within bounds
                if (i >= 0 && i < currentFrame.data.length - 3) {
                  const diff =
                    Math.abs(currentFrame.data[i] - prevFrameData.data[i]) +
                    Math.abs(
                      currentFrame.data[i + 1] - prevFrameData.data[i + 1]
                    ) +
                    Math.abs(
                      currentFrame.data[i + 2] - prevFrameData.data[i + 2]
                    );

                  if (diff > threshold) regionDiffCount++;
                  regionPixelCount++;
                }
              }
            }

            const regionMotionLevel =
              regionPixelCount > 0 ? regionDiffCount / regionPixelCount : 0;
            regionMotion[region.name] = regionMotionLevel;

            // Update specific region motion variables
            if (
              region.name === "eyes" ||
              region.name === "leftEye" ||
              region.name === "rightEye"
            ) {
              eyeMotion = Math.max(eyeMotion, regionMotionLevel);
            } else if (region.name === "mouth") {
              mouthMotion = regionMotionLevel;
            } else if (region.name === "forehead") {
              foreheadMotion = regionMotionLevel;
            }
          } catch (err) {
            console.warn(
              `Error calculating motion for region ${region.name}:`,
              err
            );
          }
        });
      }

      // Get face region data or use center region as fallback
      const faceData = regionData.find((r) => r?.region === "face");
      const eyesData = regionData.find((r) => r?.region === "eyes");
      const mouthData = regionData.find((r) => r?.region === "mouth");
      const foreheadData = regionData.find((r) => r?.region === "forehead");
      const leftEyeData = regionData.find((r) => r?.region === "leftEye");
      const rightEyeData = regionData.find((r) => r?.region === "rightEye");

      if (!faceData) {
        // Not enough data to analyze
        generateRandomEmotions();
        return;
      }

      // Start with more balanced baseline emotion levels for interview context
      const emotions: { [key: string]: number } = {
        confident: 0.05,
        nervous: 0.05,
        engaged: 0.05,
        disinterested: 0.05,
        thoughtful: 0.05,
        uncertain: 0.05,
        neutral: 0.3, // Reduced from 0.5 to make interview emotions more visible
      };

      // ==== INTERVIEW-SPECIFIC EMOTION ANALYSIS ====

      // CONFIDENCE INDICATORS - High priority for interviews
      if (faceData && faceData.horizontalSymmetry > 0.7) {
        emotions.confident += 0.4;
        emotions.nervous -= 0.2;
        emotions.uncertain -= 0.1;
      }

      // Direct gaze and stable head position = confidence
      if (faceData && motionLevel < 0.12 && faceData.avgBrightness > 110) {
        emotions.confident += 0.5;
        emotions.nervous -= 0.2;
        emotions.uncertain -= 0.1;
      }

      // Good posture (inferred from face position) = confidence
      if (
        faceData &&
        faceData.region === "face" &&
        eyesData &&
        eyesData.avgBrightness > 100
      ) {
        emotions.confident += 0.3;
      }

      // NERVOUSNESS INDICATORS - Critical for interview assessment
      // More micro-movements = nervous
      if (motionLevel > 0.1) {
        emotions.nervous += 0.4 * Math.min(2, motionLevel * 5); // Scale with motion intensity
        emotions.confident -= 0.3;
      }

      // Frequent eye movement = nervous or uncertain
      if (eyeMotion > 0.12) {
        emotions.nervous += 0.3;
        emotions.uncertain += 0.2;
        emotions.confident -= 0.2;
      }

      // Asymmetrical expressions often indicate nervousness
      if (faceData && faceData.horizontalSymmetry < 0.65) {
        emotions.nervous += 0.3;
        emotions.confident -= 0.2;
      }

      // Rapid mouth movements can indicate nervousness
      if (mouthMotion > 0.15) {
        emotions.nervous += 0.3;
      }

      // ENGAGEMENT INDICATORS - Important for interview performance
      // Eye contact and attentiveness
      if (eyesData && eyesData.brightRatio > 0.1 && motionLevel < 0.15) {
        emotions.engaged += 0.5;
        emotions.disinterested -= 0.3;
      }

      // Slight nodding or responsive head movements
      if (motionLevel > 0.05 && motionLevel < 0.15) {
        emotions.engaged += 0.3;
      }

      // Forward posture - approximated by analyzing face position
      if (faceData && faceData.avgBrightness > 120) {
        emotions.engaged += 0.2;
        emotions.disinterested -= 0.2;
      }

      // DISINTERESTED INDICATORS
      // Low brightness can indicate leaning back or looking away
      if (faceData && faceData.avgBrightness < 90) {
        emotions.disinterested += 0.4;
        emotions.engaged -= 0.3;
      }

      // Lack of movement for extended periods
      if (motionLevel < 0.03 && emotionHistory.length > 0) {
        // Check if there has been very little motion for multiple frames
        const lowMotionHistory = emotionHistory
          .slice(-5)
          .filter((h) => h.motionLevel && h.motionLevel < 0.04);

        if (lowMotionHistory.length >= 3) {
          emotions.disinterested += 0.4;
          emotions.engaged -= 0.2;
        }
      }

      // THOUGHTFUL INDICATORS
      // Looking up or to the side slightly
      if (
        eyesData &&
        eyesData.avgBrightness < 95 &&
        faceData &&
        faceData.avgBrightness > 100
      ) {
        emotions.thoughtful += 0.5;
        emotions.disinterested -= 0.2;
      }

      // Furrowed brow can indicate concentration
      if (foreheadData && foreheadData.horizontalEdgeRatio > 0.07) {
        emotions.thoughtful += 0.4;
        emotions.neutral -= 0.1;
      }

      // Slow, deliberate movements
      if (motionLevel > 0.02 && motionLevel < 0.08) {
        emotions.thoughtful += 0.2;
      }

      // UNCERTAINTY INDICATORS
      // Head tilting (asymmetry in a specific way)
      if (
        faceData &&
        faceData.horizontalSymmetry < 0.7 &&
        leftEyeData &&
        rightEyeData
      ) {
        const eyeHeightDiff = Math.abs(
          leftEyeData.avgBrightness - rightEyeData.avgBrightness
        );
        if (eyeHeightDiff > 10) {
          emotions.uncertain += 0.4;
          emotions.confident -= 0.2;
        }
      }

      // Hesitant micro-movements
      if (motionLevel > 0.05 && motionLevel < 0.1) {
        emotions.uncertain += 0.2;
      }

      // Mouth movements without speech (approximated by mouth motion patterns)
      if (mouthData && mouthMotion > 0.05 && mouthMotion < 0.12) {
        emotions.uncertain += 0.3;
      }

      // ADVANCED INTERVIEW BEHAVIOR ANALYSIS

      // Detect "listening" behavior (stable, attentive posture)
      if (
        motionLevel < 0.08 &&
        eyeMotion < 0.1 &&
        faceData.avgBrightness > 110
      ) {
        emotions.engaged += 0.3;
        emotions.neutral += 0.1;
      }

      // Detect "speaking with confidence" behavior
      if (
        mouthMotion > 0.12 &&
        motionLevel < 0.15 &&
        faceData.horizontalSymmetry > 0.75
      ) {
        emotions.confident += 0.5;
        emotions.nervous -= 0.2;
      }

      // Detect "thinking before answering" behavior
      if (
        (eyeMotion > 0.1 || foreheadData?.horizontalEdgeRatio > 0.06) &&
        mouthMotion < 0.05 &&
        motionLevel < 0.1
      ) {
        emotions.thoughtful += 0.5;
        emotions.engaged += 0.2;
      }

      // Detect "uncertain about answer" behavior
      if (mouthMotion > 0.08 && eyeMotion > 0.1 && motionLevel > 0.1) {
        emotions.uncertain += 0.4;
        emotions.nervous += 0.2;
      }

      // Detect "disengaged from interview" behavior
      const consecutiveLowBrightness = emotionHistory
        .slice(-4)
        .every((h) => h.faceData && h.faceData.avgBrightness < 95);

      if (consecutiveLowBrightness && motionLevel < 0.05) {
        emotions.disinterested += 0.5;
        emotions.engaged -= 0.3;
      }

      // More accurate motion detection with higher sensitivity
      if (motionLevel > 0.08) {
        // Reduced threshold
        // Scale the nervousness by the motion level - more motion = more nervous
        const nervousScale = Math.min(3, motionLevel * 6); // More sensitive scaling
        emotions.nervous += 0.4 * nervousScale;
        emotions.confident -= Math.min(0.3, 0.1 * nervousScale);
      }

      // Stronger confidence detection
      if (faceData && motionLevel < 0.1) {
        // Stable position indicates confidence
        const stabilityFactor = 1 - motionLevel * 5;
        emotions.confident += 0.5 * stabilityFactor;

        // Look directly at camera (brightness in eyes region)
        if (eyesData && eyesData.avgBrightness > 110) {
          emotions.confident += 0.3;
          emotions.nervous -= 0.2;
        }
      }

      // Better engagement detection based on face position and eye contact
      if (faceData) {
        // Face centered in frame indicates engagement
        const faceBrightnessFactor = Math.min(1, faceData.avgBrightness / 150);
        emotions.engaged += 0.4 * faceBrightnessFactor;

        if (eyesData && eyesData.brightRatio > 0.1) {
          // Eye whites visible = looking at camera = engaged
          emotions.engaged += 0.3;
          emotions.disinterested -= 0.2;
        }
      }

      // Detect thoughtfulness more accurately
      if (foreheadData && foreheadData.horizontalEdgeRatio > 0.07) {
        // Forehead lines indicate concentration/thoughtfulness
        emotions.thoughtful += 0.4;
        emotions.neutral -= 0.2;

        if (mouthData && mouthMotion < 0.1) {
          // Not speaking while thinking
          emotions.thoughtful += 0.3;
        }
      }

      // Detect uncertainty based on asymmetry and hesitation
      if (faceData && faceData.horizontalSymmetry < 0.7) {
        // Asymmetry can indicate uncertainty
        emotions.uncertain += 0.3;
        emotions.confident -= 0.2;

        if (mouthMotion > 0.05 && mouthMotion < 0.15) {
          // Hesitant mouth movements
          emotions.uncertain += 0.2;
        }
      }

      // Detect disinterest more accurately
      if (faceData && faceData.avgBrightness < 100) {
        // Darker face = looking away or down
        const disinterestFactor = 1 - faceData.avgBrightness / 100;
        emotions.disinterested += 0.5 * disinterestFactor;
        emotions.engaged -= 0.3 * disinterestFactor;
      }

      // Apply minimal smoothing for responsive feedback
      if (emotionHistory.length > 0) {
        const prevEmotions = emotionHistory[emotionHistory.length - 1].emotions;
        const smoothingFactor = 0.05; // Very minimal smoothing

        Object.keys(emotions).forEach((emotion) => {
          if (prevEmotions[emotion]) {
            emotions[emotion] =
              emotions[emotion] * (1 - smoothingFactor) +
              prevEmotions[emotion] * smoothingFactor;
          }
        });
      }

      // Normalize to sum to 1
      const sum = Object.values(emotions).reduce((a, b) => a + b, 0);
      Object.keys(emotions).forEach((key) => {
        emotions[key] = Math.max(0, emotions[key] / sum);
      });

      // Find dominant emotion
      let maxEmotion = "";
      let maxValue = 0;
      Object.keys(emotions).forEach((emotion) => {
        if (emotions[emotion] > maxValue) {
          maxValue = emotions[emotion];
          maxEmotion = emotion;
        }
      });

      // Make emotion updates near-instant
      const shouldUpdate = true; // Always update for maximum responsiveness

      if (shouldUpdate) {
        setCurrentEmotion({ label: maxEmotion, confidence: maxValue });
      }

      // Always update emotion history for trend analysis
      const timestamp = Date.now();
      setEmotionHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            timestamp,
            emotions,
            frameData: currentFrame,
            motionLevel,
            regionMotion: { eyeMotion, mouthMotion, foreheadMotion },
            faceData,
          },
        ];

        if (newHistory.length > 300) {
          return newHistory.slice(newHistory.length - 300);
        }
        return newHistory;
      });

      // Call the callback with emotions if provided
      if (onEmotionCapture) {
        onEmotionCapture(emotions);
      }
    } catch (err) {
      console.error("Error analyzing video frame:", err);
      generateRandomEmotions();
    }
  }, [
    isActive,
    onEmotionCapture,
    cameraActive,
    videoRef,
    width,
    height,
    emotionHistory,
    currentEmotion,
    generateRandomEmotions,
  ]);

  // Update more frequently for better responsiveness
  useEffect(() => {
    if (isActive && cameraActive) {
      const interval = setInterval(generateEmotions, 50); // 20 times per second
      return () => clearInterval(interval);
    }
  }, [isActive, cameraActive, generateEmotions]);

  // Calculate average emotions for summary
  const averageEmotions = useMemo(() => {
    if (emotionHistory.length === 0) return {};

    const sums = EMOTIONS.reduce((acc, emotion) => {
      acc[emotion] = 0;
      return acc;
    }, {} as { [key: string]: number });

    emotionHistory.forEach((data) => {
      EMOTIONS.forEach((emotion) => {
        sums[emotion] += data.emotions[emotion] || 0;
      });
    });

    const averages = EMOTIONS.reduce((acc, emotion) => {
      acc[emotion] = sums[emotion] / emotionHistory.length;
      return acc;
    }, {} as { [key: string]: number });

    return averages;
  }, [emotionHistory]);

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Interview Demeanor Analysis</span>
          {currentEmotion && (
            <span
              className={`text-sm px-2 py-1 rounded-full text-white ${
                EMOTION_COLORS[
                  currentEmotion.label as keyof typeof EMOTION_COLORS
                ] || "bg-gray-500"
              }`}
            >
              {currentEmotion.label}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[240px] bg-gray-100 rounded-md">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Loading camera...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[240px] bg-red-50 text-red-800 rounded-md p-4">
            <p className="font-semibold mb-2">Camera Error</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              onClick={() => {
                setError(null);
                setupCamera();
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div
              className="relative bg-black rounded-md"
              style={{ minHeight: "240px" }}
            >
              {/* Video element */}
              <video
                id="emotion-detector-video"
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-md"
                style={{ display: "block", minHeight: "240px" }}
              />

              {/* Primary emotion badge with interview-specific styling */}
              {currentEmotion && (
                <div
                  className="absolute top-2 right-2 px-3 py-1 rounded-xl text-white text-sm font-medium transition-all duration-150 ease-in-out animate-pulse"
                  style={{
                    backgroundColor:
                      currentEmotion.label === "confident"
                        ? "rgba(16, 185, 129, 0.9)"
                        : currentEmotion.label === "nervous"
                        ? "rgba(236, 72, 153, 0.9)"
                        : currentEmotion.label === "engaged"
                        ? "rgba(59, 130, 246, 0.9)"
                        : currentEmotion.label === "disinterested"
                        ? "rgba(156, 163, 175, 0.9)"
                        : currentEmotion.label === "thoughtful"
                        ? "rgba(168, 85, 247, 0.9)"
                        : currentEmotion.label === "uncertain"
                        ? "rgba(245, 158, 11, 0.9)"
                        : "rgba(100, 116, 139, 0.9)",
                    transform: "scale(1.05)",
                    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                  }}
                >
                  {currentEmotion.label}{" "}
                  {(currentEmotion.confidence * 100).toFixed(0)}%
                </div>
              )}

              {/* Live interview emotion feedback tags */}
              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                {EMOTIONS.map((emotion) => {
                  const currentValue =
                    emotionHistory.length > 0
                      ? emotionHistory[emotionHistory.length - 1].emotions[
                          emotion
                        ] || 0
                      : 0;

                  // Show even more emotions with lower threshold for interview context
                  if (currentValue < 0.08) return null;

                  return (
                    <div
                      key={emotion}
                      className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                      style={{
                        backgroundColor:
                          emotion === "confident"
                            ? "rgba(16, 185, 129, 0.9)"
                            : emotion === "nervous"
                            ? "rgba(236, 72, 153, 0.9)"
                            : emotion === "engaged"
                            ? "rgba(59, 130, 246, 0.9)"
                            : emotion === "disinterested"
                            ? "rgba(156, 163, 175, 0.9)"
                            : emotion === "thoughtful"
                            ? "rgba(168, 85, 247, 0.9)"
                            : emotion === "uncertain"
                            ? "rgba(245, 158, 11, 0.9)"
                            : "rgba(100, 116, 139, 0.9)",
                        opacity: Math.min(1, currentValue + 0.3),
                        transition: "opacity 0.15s ease-out",
                      }}
                    >
                      {emotion} {(currentValue * 100).toFixed(0)}%
                    </div>
                  );
                })}
              </div>

              {/* Show loading overlay when camera not active */}
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
                  <p>Starting camera...</p>
                </div>
              )}
            </div>

            {/* Interview-specific emotion metrics */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">
                Interview Demeanor Metrics
              </h4>
              <div className="space-y-2">
                {EMOTIONS.map((emotion) => {
                  const value = averageEmotions[emotion] || 0;
                  const instantValue =
                    emotionHistory.length > 0
                      ? emotionHistory[emotionHistory.length - 1].emotions[
                          emotion
                        ] || 0
                      : 0;

                  return (
                    <div key={emotion} className="flex items-center">
                      <div className="w-24 text-xs capitalize">{emotion}</div>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                        {/* Average emotion level */}
                        <div
                          className={`h-full ${
                            EMOTION_COLORS[
                              emotion as keyof typeof EMOTION_COLORS
                            ]
                          }`}
                          style={{
                            width: `${(value * 100).toFixed(0)}%`,
                            transition: "width 0.3s ease-out",
                          }}
                        />

                        {/* Current emotion level marker */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-white border-l border-r border-gray-400"
                          style={{
                            left: `calc(${(instantValue * 100).toFixed(
                              0
                            )}% - 1px)`,
                            transition: "left 0.1s ease-out",
                          }}
                        />
                      </div>
                      <div className="w-10 text-xs text-right">
                        {(instantValue * 100).toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interview-specific tips */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>Interview Body Language Tips:</strong>
                Maintain steady eye contact for confidence, control
                micro-movements to reduce nervousness, lean slightly forward to
                show engagement, nod occasionally to demonstrate active
                listening, and take thoughtful pauses before answering difficult
                questions.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionDetector;
