import React, { createRef, useEffect, useState } from 'react';
let pc;

function App() {
  // const localVideoRef = createRef();
  // const remoteVideoRef = createRef();

  const [localVideoRef, setLocalVideoRef] = useState(createRef());
  const [remoteVideoRef, setRemoteVideoRef] = useState(createRef());
  const [textInput, setTextInput] = useState('');

  const createOffer = () => {
    console.log('Offer');
    pc.createOffer({ offerToReceiveVideo: 1 })
      .then((sdp) => {
        console.log(JSON.stringify(sdp));
        pc.setLocalDescription(sdp);
      })
      .catch((error) => console.log(error));
  };

  const createAnswer = () => {
    console.log('Answer');
    pc.createAnswer({ offerToReceiveVideo: 1 })
      .then((sdp) => {
        console.log(JSON.stringify(sdp));
        pc.setLocalDescription(sdp);
      })
      .catch((error) => console.log(error));
  };

  const addCandidate = () => {
    const candidate = JSON.parse(textInput);
    console.log('Adding Candidate: ', candidate);
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const setRemoteDesc = () => {
    const desc = JSON.parse(textInput);
    console.log('Adding Description', desc);
    pc.setRemoteDescription(new RTCSessionDescription(desc));
  };

  useEffect(
    () => {
      console.log('Running once ...');
      const pc_config = null;

      pc = new RTCPeerConnection(pc_config);

      pc.onicecandidate = (event) => {
        console.log('onicecandidate', event);
        if (event.candidate) {
          console.log(JSON.stringify(event.candidate));
        } else {
          console.log(
            ' new ICE Candidate:',
            JSON.stringify(pc.localDescription)
          );
        }
      };

      pc.oniceconnectionstatechange = (event) => {
        console.log(event);
      };

      pc.onsignalingstatechange = (event) => {
        console.log(pc.signalingState);
      };

      pc.onnegotiationneeded = (event) => {
        console.log(event);
      };

      pc.ontrack = (event) => {
        console.log('remoteVideoRef', remoteVideoRef);
        remoteVideoRef.current.srcObject = event.streams[0]; //CHANGED
      };

      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: { width: 320 /*320-640-1280*/ },
        }) //CHANGED
        .then((stream) => {
          localVideoRef.current.srcObject = stream;
          pc.addStream(stream);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // [localVideoRef, remoteVideoRef]
    []
  );

  return (
    <div>
      <h1>Hello World</h1>
      <video
        style={{
          // width: 240,
          // height: 240,
          background: '#000',
          margin: 5,
        }}
        ref={localVideoRef}
        autoPlay
        muted
      ></video>
      <video
        style={{
          // width: 240,
          // height: 240,
          background: '#000',
          margin: 5,
        }}
        ref={remoteVideoRef}
        autoPlay
      ></video>
      <br />
      <button onClick={() => createOffer()}>Offer</button>
      <button onClick={() => createAnswer()}>Answer</button>
      <br />
      <textarea
        placeholder='Enter here'
        onChange={(event) => setTextInput(event.target.value)}
      />
      <br />
      <button onClick={() => setRemoteDesc()}>Set Remote Desc</button>
      <button onClick={() => addCandidate()}>Add Candidate</button>
    </div>
  );
}

export default App;
