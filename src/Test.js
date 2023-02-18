import React, { useState, useEffect } from "react";
import { AgoraVideoPlayer } from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";

const Test = () => {
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);

  const appId = "84e6846fa5ca43c68fe534ebd95b4730";
  const channelName = "test100";
  const token =
    "007eJxTYJiqrd5wKnyVmt+cuzPjC58rzI9Sl+T5Z/FS5/T9kNVFH+wVGCxMUs0sTMzSEk2TE02Mk80s0lJNjU1Sk1IsTZNMzI0NDvR9SG4IZGR4MsOJgREKQXx2hpLU4hJDAwMGBgCyzSDa";

  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  useEffect(() => {
    async function startCall() {
      await client.join(appId, channelName, token, null);
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      await client.publish([audioTrack, videoTrack]);

      setAudioTrack(audioTrack);
      setVideoTrack(videoTrack);
    }

    startCall();
  }, []);

  return (
    <div className="App">
      {videoTrack && audioTrack && (
        <AgoraVideoPlayer
          className="video-player"
          videoTrack={videoTrack}
          audioTrack={audioTrack}
          width={640}
          height={480}
        />
      )}
    </div>
  );
};

export default Test;
