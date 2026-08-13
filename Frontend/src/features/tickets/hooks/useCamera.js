import { useState, useRef, useCallback, useEffect } from 'react'; // Tambahkan useEffect

const useCamera = () => {
  const [isCameraOpen, setIsCameraOpen]     = useState(false);
  const [devices, setDevices]               = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [image, setImage]                   = useState(null);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ── EFEK BARU: Ikat stream ke video secara berkala saat elemen video muncul ──
  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      stopCamera(); 

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Browser Anda tidak mendukung akses kamera.');
        return;
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);

      const deviceIdToUse = selectedDevice || (videoDevices[0] ? videoDevices[0].deviceId : undefined);

      const constraints = {
        video: deviceIdToUse
          ? { deviceId: { exact: deviceIdToUse } }
          : { facingMode: 'environment' },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraOpen(true); 
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      alert('Gagal membuka kamera. Pastikan Anda telah memberikan izin akses kamera.');
      setIsCameraOpen(false);
    }
  }, [selectedDevice, stopCamera]);

  const takePicture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const width  = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width  = width;
    canvas.height = height;

    context.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImage(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const resetImage = useCallback(() => {
    setImage(null);
  }, []);

  return {
    isCameraOpen,
    devices,
    selectedDevice,
    setSelectedDevice,
    image,
    setImage,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    takePicture,
    resetImage,
  };
};

export default useCamera;