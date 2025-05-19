import { use, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Peer from "simple-peer";
// Tạo một instance socket duy nhất
let socketInstance = null;

export function useWebSocket() {
  const currentUser = useSelector((state) => state.login?.userInfo);
  const socketRef = useRef();
  const [me, setMe] = useState("");
  const [caller, setCaller] = useState("");
  const [name, setName] = useState("");
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [followNotifications, setFollowNotifications] = useState(null);
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    if (!socketInstance) {
      const socketUrl =
        process.env.REACT_APP_SOCKET_URL || "http://localhost:9092";
      socketInstance = io(socketUrl, {
        transports: ["websocket"],
        withCredentials: true,
        query: { userId: currentUser?.id },
      });
      console.log(
        "Creating new WebSocket connection with userId:",
        currentUser?.id
      );
    }
    socketRef.current = socketInstance;

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully");
    });
    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    socketRef.current.on("me", (id) => {
      if (id) {
        localStorage.setItem("userId", id);
        setMe(id);
      }
    });
    socketRef.current.on("callUser", async (data) => {
      // Đảm bảo lấy đúng signal từ backend
      const signal = data.signalData || data.signal;
      console.log("📞 Nhận cuộc gọi từ:", data, "signal:", signal);
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(signal);
    });
    socketRef.current.on("callAccepted", (signal) => {
      console.log("✅ Cuộc gọi được chấp nhận, signal:", signal);
      setCallAccepted(true);
      setIsVideoCallActive(true);
      if (peer) {
        peer.signal(signal);
      }
    });
    socketRef.current.on("callEnded", () => {
      console.log("❌ Cuộc gọi kết thúc");
      leaveCall();
    });
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [currentUser?.id]);

  const setupMediaStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      return mediaStream;
    } catch (error) {
      console.error("Error setting up media stream:", error);
      throw error;
    }
  };

  const callUser = async (userToCall) => {
    try {
      const mediaStream = await setupMediaStream();
      const newPeer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
      });
      newPeer.on("signal", (data) => {
        // Gửi đúng key signalData
        socketRef.current.emit("callUser", {
          userToCall,
          signalData: data,
          from: currentUser.id,
          name: currentUser.userFullname,
        });
      });
      newPeer.on("stream", (remoteMediaStream) => {
        console.log("Received remote stream in caller");
        setRemoteStream(remoteMediaStream);
      });
      socketRef.current.on("callAccepted", (signal) => {
        setCallAccepted(true);
        setIsVideoCallActive(true);
        newPeer.signal(signal);
      });
      setPeer(newPeer);
    } catch (error) {
      console.error("Error in callUser:", error);
    }
  };

  const answerCall = async () => {
    try {
      const mediaStream = await setupMediaStream();
      const newPeer = new Peer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
      });
      newPeer.on("signal", (data) => {
        socketRef.current.emit("answerCall", { signal: data, to: caller });
      });
      newPeer.on("stream", (remoteMediaStream) => {
        console.log("Received remote stream in answerer");
        setRemoteStream(remoteMediaStream);
      });
      newPeer.signal(callerSignal);
      setCallAccepted(true);
      setIsVideoCallActive(true);
      setPeer(newPeer);
    } catch (error) {
      console.error("Error in answerCall:", error);
    }
  };

  const leaveCall = () => {
    try {
      if (socketRef.current) {
        socketRef.current.emit("endCall", { to: caller });
      }
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          stream.removeTrack(track);
        });
        setStream(null);
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => {
          track.stop();
          remoteStream.removeTrack(track);
        });
        setRemoteStream(null);
      }
      if (peer) {
        peer.destroy();
        setPeer(null);
      }
      setIsVideoCallActive(false);
      setCallAccepted(false);
      setReceivingCall(false);
      setCaller("");
      setCallerSignal(null);
    } catch (error) {
      console.error("Error in leaveCall:", error);
    }
  };

  const sendFollowNotification = ({ toUserId }) => {
    const payload = {
      fromUserId: String(currentUser.id),
      fromUserName: currentUser.name,
      toUserId,
      message: `${currentUser.name} vừa theo dõi bạn.`,
      sentAt: new Date().toISOString(),
    };
    socketRef.current.emit("followNotification", payload);
  };

  return {
    me,
    caller,
    name,
    callerSignal,
    receivingCall,
    callAccepted,
    isVideoCallActive,
    stream,
    remoteStream,
    socketRef,
    callUser,
    answerCall,
    leaveCall,
    sendFollowNotification,
    followNotifications,
  };
}
