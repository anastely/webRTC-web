import { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
const App = () => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pc = useRef(new RTCPeerConnection(null));
  const textRef = useRef();
  const socket = useRef();

  useEffect(() => {
    const constraints = {
      audio: false,
      video: true,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // display video
        localVideoRef.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
          _pc.addTrack(track, stream);
        });
      })
      .catch((e) => {
        console.log('getUserMedia Error ...', e);
      });

    const pc_config = {
      iceServers: [
        // {
        //   urls: 'stun:[STUN_IP]:[PORT]',
        //   'credentials': '[YOR CREDENTIALS]',
        //   'username': '[USERNAME]'
        // },
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    };
    const _pc = new RTCPeerConnection(pc_config);

    _pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendToPeer('candidate', e.candidate);
        console.log(JSON.stringify(e.candidate));
      }
    };

    _pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    _pc.ontrack = (e) => {
      // we got remote stream ...
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    socket.current = io('/webrtcPeer', {
      path: '/webrtc',
      query: {},
    });

    socket.current.on('connection-success', (success) => {
      console.log('success', success);
    });

    socket.current.on('offerOrAnswer', (sdp) => {
      console.log('sdp', sdp);
      textRef.current.value = JSON.stringify(sdp);
      _pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.current.on('candidate', (candidate) => {
      console.log('candidate', candidate);

      _pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    pc.current = _pc;
  }, []);

  const sendToPeer = (messageType, payload) => {
    socket.current.emit(messageType, {
      socketID: socket.current.id,
      payload,
    });
  };

  const createOffer = () => {
    pc.current
      .createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      })
      .then((sdp) => {
        console.log(JSON.stringify(sdp));
        pc.current.setLocalDescription(sdp);
        sendToPeer('offerOrAnswer', sdp);
      })
      .catch((e) => console.log(e));
  };

  const createAnswer = () => {
    pc.current
      .createAnswer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      })
      .then((sdp) => {
        console.log(JSON.stringify(sdp));
        pc.current.setLocalDescription(sdp);
        sendToPeer('offerOrAnswer', sdp);
      })
      .catch((e) => console.log(e));
  };

  return (
    <div style={{ margin: 10 }}>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        ref={localVideoRef}
        autoPlay
      ></video>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        ref={remoteVideoRef}
        autoPlay
      ></video>
      <br />
      <button onClick={createOffer}>Create Offer</button>
      <button onClick={createAnswer}>Create Answer</button>
      <br />
      <textarea ref={textRef}></textarea>
      {/* <br />
      <button onClick={setRemoteDescription}>Set Remote Description</button>
      <button onClick={addCandidate}>Add Candidates</button> */}
    </div>
  );
};

export default App;
