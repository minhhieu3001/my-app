import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

function App() {
  const options = {
    // Pass your App ID here.
    appId: "84e6846fa5ca43c68fe534ebd95b4730",
    // Set the channel name.
    channel: "test1",
    // Pass your temp token here.
    token:
      "007eJxTYLiou6e9flPAd6d7gV4ltTwbJFLePwl+bLh+Yc78giijs98VGCxMUs0sTMzSEk2TE02Mk80s0lJNjU1Sk1IsTZNMzI0N2JxeJzcEMjIcadnIyMgAgSA+K0NJanGJIQMDANu7ITI=",
    // Set the user ID.
    uid: "wweb",
  };

  const rtc = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
  };

  const [users, setUsers] = useState([
    {
      uid: "19021275",
      audio: false,
      video: false,
      client: false,
      videoTrack: null,
    },
  ]);
  const [start, setStart] = useState(false);

  const joinChannel = async () => {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    // initClientEvents();

    const _uid = await rtc.client.join(
      options.appId,
      options.channel,
      options.token,
      options.uid
    );

    // rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    // setUsers((prevUsers) => {
    //   return [
    //     ...prevUsers,
    //     {
    //       uid: _uid,
    //       audio: true,
    //       video: true,
    //       client: true,
    //       videoTrack: rtc.localVideoTrack,
    //     },
    //   ];
    // });

    // await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    setStart(true);
  };

  const initClientEvents = () => {
    rtc.client.on("user-published", async (user, mediaType) => {
      // New User Enters
      await rtc.client.subscribe(user, mediaType);
      if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        setUsers((prevUsers) => {
          return [
            ...prevUsers,
            {
              uid: user.uid,
              audio: user.hasAudio,
              video: user.hasVideo,
              client: false,
              videoTrack: remoteVideoTrack,
            },
          ];
        });
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
        setUsers((prevUsers) => {
          return prevUsers.map((User) => {
            if (User.uid === user.uid) {
              return { ...User, audio: user.hasAudio };
            }
            return User;
          });
        });
      }
    });

    rtc.client.on("user-unpublished", (user, type) => {
      //User Leaves
      if (type === "audio") {
        setUsers((prevUsers) => {
          return prevUsers.map((User) => {
            if (User.uid === user.uid) {
              return { ...User, audio: !User.audio };
            }
            return User;
          });
        });
      }
      if (type === "video") {
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      }
    });
  };

  const leaveChannel = () => {
    // await rtc.localAudioTrack.close();
    // await rtc.localVideoTrack.close();
    // await rtc.client.leave();
    rtc.client.leave(
      () => {
        console.log("Client left");
      },
      (err) => {
        console.log("Client leave failed ", err);
      }
    );
    setUsers([]);
    setStart(false);
  };

  const mute = (type, id) => {
    if (type === "audio") {
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.uid === id) {
            user.client && rtc.localAudioTrack.setEnabled(!user.audio);
            return { ...user, audio: !user.audio };
          }
          return user;
        });
      });
    } else if (type === "video") {
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.uid === id) {
            user.client && rtc.localVideoTrack.setEnabled(!user.video);
            return { ...user, video: !user.video };
          }
          return user;
        });
      });
    }
  };

  useEffect(() => {}, []);

  return (
    <div className="App">
      <h2>CHUẨN BỊ CALL NÀO</h2>
      <div class="row">
        <div>
          <button type="button" onClick={() => joinChannel()}>
            Vào call
          </button>
          <button type="button" onClick={() => leaveChannel()}>
            Rời call
          </button>
        </div>
      </div>
      <div
        id="local_stream"
        className="local_stream"
        style={{ width: "400px", height: "400px" }}
      ></div>
      <div id="remote_video_" style={{ width: "400px", height: "400px" }} />
    </div>
  );
}

export default App;
