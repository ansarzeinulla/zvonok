let pc;

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

function generateShortId(length = 4) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createCall() {
  pc = new RTCPeerConnection(servers);
  const callId = generateShortId();
  const callDoc = db.collection("calls").doc(callId);

  
  const offerCandidates = callDoc.collection("offerCandidates");
  const answerCandidates = callDoc.collection("answerCandidates");

  // Collect ICE candidates
  pc.onicecandidate = e => {
    if (e.candidate) offerCandidates.add(e.candidate.toJSON());
  };

  // Setup media
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  pc.ontrack = e => {
    const remoteAudio = new Audio();
    remoteAudio.srcObject = e.streams[0];
    remoteAudio.play();
  };

  const offerDesc = await pc.createOffer();
  await pc.setLocalDescription(offerDesc);

  const offer = {
    sdp: offerDesc.sdp,
    type: offerDesc.type
  };

  await callDoc.set({ offer });

  // Listen for answer
  callDoc.onSnapshot(snapshot => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDesc = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDesc);
    }
  });

  // Listen for answer ICE
  answerCandidates.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  return callDoc.id;
}

async function answerCall(callId) {
  pc = new RTCPeerConnection(servers);
  const callDoc = db.collection("calls").doc(callId);
  const offerCandidates = callDoc.collection("offerCandidates");
  const answerCandidates = callDoc.collection("answerCandidates");

  pc.onicecandidate = e => {
    if (e.candidate) answerCandidates.add(e.candidate.toJSON());
  };

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  pc.ontrack = e => {
    const remoteAudio = new Audio();
    remoteAudio.srcObject = e.streams[0];
    remoteAudio.play();
  };

  const callData = (await callDoc.get()).data();
  const offerDesc = new RTCSessionDescription(callData.offer);
  await pc.setRemoteDescription(offerDesc);

  const answerDesc = await pc.createAnswer();
  await pc.setLocalDescription(answerDesc);

  const answer = {
    type: answerDesc.type,
    sdp: answerDesc.sdp
  };

  await callDoc.update({ answer });

  offerCandidates.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
}


let mediaRecorder;
let recordedChunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordedChunks = [];

  mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const transcription = await recognizeSpeechJS(blob);
    document.getElementById("transcript").textContent = transcription;
  };

  mediaRecorder.start();
  console.log("🎤 Recording started...");
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("🛑 Recording stopped.");
  }
}

async function recognizeSpeechJS(audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");

  try {
    const response = await fetch("https://<your-project>.cloudfunctions.net/transcribeAudio", {
    method: "POST",
    body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("📝 Transcription:", result.transcription_text);
      return result.transcription_text;
    } else {
      const error = await response.text();
      console.error("❌ Proxy Error:", error);
      return `Error: ${response.status}, ${error}`;
    }
  } catch (err) {
    console.error("🚫 Network error:", err.message);
    return "Network error: " + err.message;
  }
}