import React, { useEffect, useRef } from "react";
import {
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaExclamationTriangle,
} from "react-icons/fa";

const VideoCallModal = ({
  stream,
  remoteStream,
  onEndCall,
  callAccepted,
  name,
  error,
}) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [connectionStatus, setConnectionStatus] = React.useState("connecting");

  useEffect(() => {
    if (error) {
      setConnectionStatus("error");
    } else if (callAccepted && stream && remoteStream) {
      setConnectionStatus("connected");
    } else if (callAccepted) {
      setConnectionStatus("connecting");
    }
  }, [stream, remoteStream, callAccepted, error]);

  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch((err) => {
        console.error("Error playing local video:", err);
      });
    }
  }, [stream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => {
        console.error("Error playing remote video:", err);
      });
    }
  }, [remoteStream]);

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case "connecting":
        return "Đang kết nối...";
      case "error":
        return "Lỗi kết nối. Vui lòng thử lại.";
      case "connected":
        return "Đã kết nối";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="w-full h-full relative">
        {/* Status Bar */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-white text-xs bg-black bg-opacity-50 p-2 rounded">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              } animate-pulse`}
            />
            <span>{getStatusMessage()}</span>
          </div>
          {error && (
            <div className="flex items-center space-x-2 text-yellow-500">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {(!remoteStream || !callAccepted) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                  <FaVideo className="text-white text-2xl" />
                </div>
                <p>Đang chờ video từ người dùng khác...</p>
              </div>
            </div>
          )}
          {callAccepted && (
            <div className="absolute bottom-4 left-4 text-white text-lg bg-black bg-opacity-50 px-3 py-2 rounded">
              {name || "Người dùng khác"}
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="absolute top-4 right-4 w-[300px] aspect-video bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          {!stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 mx-auto mb-2 flex items-center justify-center">
                  <FaVideo className="text-white text-xl" />
                </div>
                <p className="text-sm">Camera đã tắt</p>
              </div>
            </div>
          )}
          {/* Optional name display for self (bạn) */}
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
            Bạn
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={isAudioEnabled ? "Tắt mic" : "Bật mic"}
          >
            {isAudioEnabled ? (
              <FaMicrophone className="text-white text-xl" />
            ) : (
              <FaMicrophoneSlash className="text-white text-xl" />
            )}
          </button>
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Kết thúc cuộc gọi"
          >
            <FaPhoneSlash className="text-2xl" />
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={isVideoEnabled ? "Tắt camera" : "Bật camera"}
          >
            {isVideoEnabled ? (
              <FaVideo className="text-white text-xl" />
            ) : (
              <FaVideoSlash className="text-white text-xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
