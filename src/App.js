// import React from 'react';
// import './App.css';

// function App() {
//   const localRef = React.createRef();
//   const remoteVideoRef = React.createRef();
//   let textRef;

//   // create new Peer connection
//   const pc_config1 = null;
//   // const pc_config1 = {
//   //   "iceServers": [
//   //     {
//   //       urls: 'stun:[STUN_IP]:[PORT]',
//   //       'credentials': '[YOR CREDENTIALS]',
//   //       'username': '[USERNAME]'
//   //     }
//   //   ]
//   // }
//   const pc = new RTCPeerConnection(pc_config1);

//   const constraint = {
//     video: true,
//   };
//   const success = (stream) => {
//     localRef.current.srcObject = stream;
//     pc.addStream(stream);
//   };
//   const failure = (e) => {
//     console.log('getUserMidea Error!,', e);
//   };

//   // #1
//   const createOffer = () => {
//     console.log('offer');
//     pc.createOffer({ offerToReceiveVideo: 1 })
//       .then((sdp) => {
//         console.log('createOffer', JSON.stringify(sdp));
//         pc.setLocalDescription(sdp);
//       })
//       .catch((e) => console.log('error when createOffer', e));
//   };
//   // #2
//   const setRemoteDescription = () => {
//     const desc = JSON.parse(textRef.value);
//     console.log('desc', desc);
//     pc.setRemoteDescription(new RTCSessionDescription(desc));
//   };

//   // #3
//   const createAnswer = () => {
//     console.log('answer');
//     pc.createAnswer({ offerToReceiveVideo: 1 })
//       .then((sdp) => {
//         console.log('createAnswer', JSON.stringify(sdp));
//         pc.setLocalDescription(sdp);
//       })
//       .catch((e) => console.log('error when createAnswer', e));
//   };

//   // #4
//   const addCandiDate = () => {
//     const condidate = JSON.parse(textRef.value);
//     console.log('Adding condidate', condidate);
//     pc.addIceCandidate(new RTCIceCandidate(condidate));
//   };

//   React.useEffect(() => {
//     pc.onicecandidate = (e) => {
//       if (e.candidate) {
//         console.log('candidate', JSON.stringify(e.candidate));
//       }
//     };

//     pc.oniceconnectionstatechange = (e) => {
//       console.log(e);
//     };

//     pc.ontrack = (e) => {
//       remoteVideoRef.current.srcObject = e.streams[0];
//     };

//     // getting access to webcam
//     navigator.mediaDevices
//       .getUserMedia(constraint)
//       .then(success)
//       .catch(failure);
//   }, []);

//   return (
//     <div>
//       <video
//         style={{
//           width: 240,
//           height: 240,
//           background: '#000',
//           margin: 5,
//         }}
//         ref={localRef}
//         autoPlay
//       />

//       {/* Remote Video */}
//       <video
//         style={{
//           width: 240,
//           height: 240,
//           background: '#000',
//           margin: 5,
//         }}
//         ref={remoteVideoRef}
//         autoPlay
//       />

//       <br />

//       {/* Buttons */}
//       <button onClick={createOffer}>Offer</button>
//       <button onClick={createAnswer}>Answer</button>
//       <br />
//       <textarea
//         ref={(ref) => {
//           textRef = ref;
//         }}
//       />
//       <br />
//       <button onClick={setRemoteDescription}>Set Remote Disc</button>
//       <button onClick={addCandiDate}>Add CandiDate</button>
//     </div>
//   );
// }

// export default App;

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
