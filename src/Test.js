import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

export default function Test() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef([]);

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    const joinChannel = async () => {
      await client.join(
        "84e6846fa5ca43c68fe534ebd95b4730",
        "test1",
        "007eJxTYLiyx/Jdja7En7cs7wpDZ0xRdchZqtW461/agjKOZ89nzulRYLAwSTWzMDFLSzRNTjQxTjazSEs1NTZJTUqxNE0yMTc2kOxmTGkIZGQ4t82GkZEBAkF8VoaS1OISQwYGANrmIKo=",
        null
      );

      let localVideoTrack = null;
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const tracks = [localAudioTrack];
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      } catch (error) {
        console.warn("Camera is not accessible.", error);
      }
      if (localVideoTrack) {
        tracks.push(localVideoTrack);
      }
      const localStream = AgoraRTC.createStream({ tracks });
      setLocalStream(localStream);
      await client.publish(localStream);

      client.on("user-published", async (user, mediaType) => {
        if (mediaType === "video") {
          const remoteVideoTrack = await user.videoTrack();
          const remoteStream = AgoraRTC.createStream({
            video: remoteVideoTrack,
          });
          setRemoteStreams((prev) => [...prev, remoteStream]);
        }
      });
    };

    joinChannel();

    return () => {
      client.unpublish(localStream);
      localStream.stop();
      client.leave();
    };
  }, []);

  useEffect(() => {
    if (localStream) {
      localStream.play(localVideoRef.current);
    }
    remoteStreams.forEach((remoteStream, index) => {
      remoteStream.play(remoteVideosRef.current[index]);
    });
  }, [localStream, remoteStreams]);

  const startScreenSharing = async () => {
    const screenSharingTrack = await AgoraRTC.createScreenVideoTrack();
    const tracks = [localStream.getAudioTrack(), screenSharingTrack];
    const localStreamWithScreenSharing = AgoraRTC.createStream({ tracks });
    await localStream.unpublish();
    setLocalStream(localStreamWithScreenSharing);
    await localStreamWithScreenSharing.publish();
  };

  const stopScreenSharing = async () => {
    const cameraVideoTrack = await AgoraRTC.createCameraVideoTrack();
    const tracks = [localStream.getAudioTrack(), cameraVideoTrack];
    const localStreamWithCamera = AgoraRTC.createStream({ tracks });
    await localStream.unpublish();
    setLocalStream(localStreamWithCamera);
    await localStreamWithCamera.publish();
  };

  return (
    <div>
      {localStream && (
        <video ref={localVideoRef} id="localVideo" autoPlay muted></video>
      )}
      {remoteStreams.map((_, index) => (
        <video
          key={index}
          ref={(el) => (remoteVideosRef.current[index] = el)}
          autoPlay
        ></video>
      ))}
      <button onClick={startScreenSharing}>Start Screen Sharing</button>
      <button onClick={stopScreenSharing}>Stop Screen Sharing</button>
    </div>
  );
}
