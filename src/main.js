 
 
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import { FIREBASECONF } from './config.js'


 
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASECONF)
}

const firestore = firebase.firestore()

 
const servers = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
}

let pc = new RTCPeerConnection(servers)
let localStream = null
let remoteStream = null


const webCamButton = document.getElementById('webCamButton')
const webCamVideo = document.getElementById('webCamVideo')
const callButton = document.getElementById('callButton')
const callInput = document.getElementById('callInput')
const answerButton = document.getElementById('answerButton')
const remoteVideo = document.getElementById('remoteVideo')
const hangupButton = document.getElementById('hangupButton')

if (webCamButton && webCamVideo && remoteVideo) {
  webCamButton.onclick = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    remoteStream = new MediaStream()

    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream)
    })

    pc.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track)
      })
    }

    webCamVideo.srcObject = localStream
    remoteVideo.srcObject = remoteStream
  }
}

 
 
if (callButton && callInput && hangupButton) {
  callButton.onclick = async () => {
    const callDoc = firestore.collection('calls').doc()
    const offerCandidates = callDoc.collection('offerCandidates')
    const answerCandidates = callDoc.collection('answerCandidates')

    callInput.value = callDoc.id

    pc.onicecandidate = event => {
      if (event.candidate) {
        offerCandidates.add(event.candidate.toJSON())
      }
    }

    const offerDescription = await pc.createOffer()
    await pc.setLocalDescription(offerDescription)

    const offer = {
      type: offerDescription.type,
      sdp: offerDescription.sdp,
    }

    await callDoc.set({ offer })

    callDoc.onSnapshot(snapshot => {
      const data = snapshot.data()
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer)
        pc.setRemoteDescription(answerDescription)
      }
    })

    answerCandidates.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data())
          pc.addIceCandidate(candidate)
        }
      })
    })

    hangupButton.disabled = false
  }
}

 
if (answerButton && callInput) {
  answerButton.onclick = async () => {
    const callId = callInput.value
    if (!callId) return

    const callDoc = firestore.collection('calls').doc(callId)
    const answerCandidates = callDoc.collection('answerCandidates')
    const offerCandidates = callDoc.collection('offerCandidates')

    pc.onicecandidate = event => {
      if (event.candidate) {
        answerCandidates.add(event.candidate.toJSON())
      }
    }

    const callData = (await callDoc.get()).data()
    if (!callData?.offer) return

    const offerDescription = callData.offer
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription))

    const answerDescription = await pc.createAnswer()
    await pc.setLocalDescription(answerDescription)

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    }

    await callDoc.update({ answer })

    offerCandidates.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data()
          pc.addIceCandidate(new RTCIceCandidate(data))
        }
      })
    })
  }
}
