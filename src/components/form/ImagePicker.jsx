import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Drawer, Space, Tooltip, Spin, message, Modal, Slider, Radio, Row, Col } from 'antd';
import { CameraOutlined, PictureOutlined, CloudUploadOutlined, CloseOutlined, CheckOutlined, UploadOutlined, RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined, UndoOutlined, BorderOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Cropper from 'react-easy-crop';
import { useImageUploadMutation, useDeleteImageMutation } from '../../services/imageService';
import "./styles.scss"
const ImagePicker = ({ form, name = 'photo', aspectRatio = 1, initialImageUrl }) => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(() => {
    // First check for initialImageUrl prop
    if (initialImageUrl) {
      return initialImageUrl;
    }
    
    const val = form.getFieldValue(name);
    if (Array.isArray(val) && val.length > 0 && val[0].url) {
      return val[0].url;
    }
    return typeof val === 'string' ? val : null;
  });
  const [uploadingLocal, setUploadingLocal] = useState(false);
  const [uploadImage] = useImageUploadMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [deletingLocal, setDeletingLocal] = useState(false);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropShape, setCropShape] = useState('rect'); // 'rect' or 'round'
  const [selectedFile, setSelectedFile] = useState(null);

  const [storedImageUrl, setStoredImageUrl] = useState(null);

 
  useEffect(() => {
    // Check for initialImageUrl first
    if (initialImageUrl && !preview) {
      setPreview(initialImageUrl);
      setStoredImageUrl(initialImageUrl);
      return;
    }
    
    const val = form.getFieldValue(name);
    if (Array.isArray(val) && val.length > 0 && val[0].url) {
      setPreview(val[0].url);
      setStoredImageUrl(val[0].url);
    } else if (typeof val === 'string' && val) {
      setPreview(val);
      setStoredImageUrl(val);
    }
  }, [form, name, initialImageUrl, preview]);

  // Image processing functions
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

  const rotateSize = (width, height, rotation) => {
    const rotRad = getRadianAngle(rotation);
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const rotRad = getRadianAngle(rotation);
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return null;
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;
    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    // Circle mask if needed
    if (cropShape === 'round') {
      const roundCanvas = document.createElement('canvas');
      const roundCtx = roundCanvas.getContext('2d');
      roundCanvas.width = pixelCrop.width;
      roundCanvas.height = pixelCrop.height;
      roundCtx.beginPath();
      roundCtx.arc(
        pixelCrop.width / 2,
        pixelCrop.height / 2,
        Math.min(pixelCrop.width, pixelCrop.height) / 2,
        0,
        Math.PI * 2
      );
      roundCtx.closePath();
      roundCtx.clip();
      roundCtx.drawImage(croppedCanvas, 0, 0);
      return new Promise((resolve) => {
        roundCanvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg');
      });
    }
    return new Promise((resolve) => {
      croppedCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result);
      setCropModalOpen(true);
      setOpen(false);
    });
    reader.readAsDataURL(file);
  };

  const processAndUploadImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCropModalOpen(false);
    setUploadingLocal(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const previewUrl = URL.createObjectURL(croppedImageBlob);
      setPreview(previewUrl);
      const fd = new FormData();
      fd.append('images', croppedImageBlob, 'cropped-image.jpg');
      const res = await uploadImage(fd).unwrap();
      const imageUrl = res?.images?.[0];
      if (!imageUrl) {
        message.error('Upload succeeded but no image URL returned');
      } else {
        setPreview(imageUrl);
        setStoredImageUrl(imageUrl); // Store the actual uploaded URL
        form.setFieldsValue({ [name]: imageUrl });
      
      }
      URL.revokeObjectURL(previewUrl);
    } catch (err) {
      console.error('Image processing/upload failed', err);
      message.error('Image processing failed');
    } finally {
      setUploadingLocal(false);
      resetCropState();
    }
  };

  const resetCropState = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setSelectedFile(null);
  };

  const openGallery = () => {
    if (galleryRef.current) {
      galleryRef.current.value = null;
      galleryRef.current.click();
    }
  };

  const openCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.value = null;
      cameraRef.current.click();
    }
  };

  const openDrive = () => {
    openGallery();
  };
const handleRemove = async (e) => {
    e?.preventDefault(); // Prevent any default behavior
    e?.stopPropagation(); // Stop event bubbling
    
    if (!storedImageUrl) return;
    console.log('Removing image:', storedImageUrl);
    setDeletingLocal(true);
    try {
      // Only delete if it's an actual server URL (http/https), not a blob URL
      if (storedImageUrl.startsWith('http')) {
        await deleteImage(storedImageUrl).unwrap();
      }
      setPreview(null);
      setStoredImageUrl(null);
      form.setFieldsValue({ [name]: null });
    } catch (err) {
    
    } finally {
      setDeletingLocal(false);
    }
  }
  return (
    <div className="image-picker">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="upload-control" style={{ width: '100%', position: 'relative' }}>
          {deletingLocal ? (
            <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spin size="small" />
              <span>Deleting...</span>
            </div>
          ) : !preview ? (
            <div>
              <Button
                type="default"
                className="upload-btn"
                onClick={() => !deletingLocal && setOpen(true)}
                disabled={uploadingLocal || deletingLocal}
              >
                {uploadingLocal ? (
                  <>
                    <Spin size="small" />
                    <span style={{ marginLeft: 8 }}>Uploading...</span>
                  </>
                ) : (
                  'Upload Image'
                )}
              </Button>
            </div>
          ) : (
            <div className="image-preview-wrapper" style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
              <Tooltip title="Remove image">
                <Button
                  className="image-remove"
                  type="text"
                  shape="circle"
                  size="small"
                  icon={deletingLocal ? <Spin size="small" /> : <CloseOutlined />} 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(e);
                  }}
                  style={{ position: 'absolute', top: 6, right: 6, zIndex: 2, background: 'rgba(0,0,0,0.35)', color: '#fff' }}
                />
              </Tooltip>
              <img 
                src={preview} 
                alt="preview" 
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: cropShape === 'round' ? '50%' : 6, 
                  display: 'block', 
                  opacity: deletingLocal ? 0.5 : 1,
                  aspectRatio: aspectRatio 
                }} 
              />
            </div>
          )}
        </div>

        {/* hidden inputs */}
        {/* Hidden file inputs */}
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        {/* Image Crop Modal */}
        <Modal
          title="Edit Image"
          open={cropModalOpen}
          onCancel={() => {
            setCropModalOpen(false);
            resetCropState();
          }}
          footer={null}
          width={800}
        >
          {imageSrc && (
            <div style={{ padding: '20px 0' }}>
              <div style={{ position: 'relative', height: 300, width: '100%', marginBottom: 24 }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  cropShape={cropShape}
                  showGrid={false}
                />
              </div>

              {/* Controls at the bottom */}
              <div className="crop-controls">
                {/* ROW 1 – Shape + Rotate buttons */}
                <div className="crop-row top-row" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                  <Radio.Group
                    value={cropShape}
                    onChange={(e) => setCropShape(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="rect">
                      <BorderOutlined /> Square
                    </Radio.Button>
                    <Radio.Button value="round">
                      <CheckCircleOutlined /> Circle
                    </Radio.Button>
                  </Radio.Group>
                  <div className="rotate-btn-group" style={{ display: 'flex', gap: 8 }}>
                    <Button
                      icon={<RotateLeftOutlined />}
                      onClick={() => setRotation(rotation - 90)}
                    >
                      -90°
                    </Button>
                    <Button
                      icon={<UndoOutlined />}
                      onClick={() => {
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                        setRotation(0);
                        setCroppedAreaPixels(null);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      icon={<RotateRightOutlined />}
                      onClick={() => setRotation(rotation + 90)}
                    >
                      +90°
                    </Button>
                  </div>
                </div>
                {/* ROW 2 – Sliders */}
                <div className="crop-row slider-row" style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 16 }}>
                  <div className="slider-box">
                    <label>
                      <ZoomInOutlined /> Zoom
                    </label>
                    <Slider
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={setZoom}
                      style={{ width: 120 }}
                    />
                  </div>
                  <div className="slider-box">
                    <label>
                      <RotateRightOutlined /> Rotation
                    </label>
                    <Slider
                      min={0}
                      max={360}
                      value={rotation}
                      onChange={setRotation}
                      style={{ width: 120 }}
                    />
                  </div>
                </div>
                {/* ROW 3 – Action buttons bottom right */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                  <Button
                    onClick={() => {
                      setCropModalOpen(false);
                      resetCropState();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={processAndUploadImage}
                    loading={uploadingLocal}
                  >
                    Upload
                  </Button>
                </div>
              </div>


            </div>
          )}
        </Modal>

        {/* ✅ Fixed camera input */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"         // correct
          capture="environment"     // forces back camera
          onChange={handleFile}
          style={{ display: 'none' }}
        />

        <Drawer className='image-picker-drawer' placement="bottom" closeIcon={false} onClose={() => setOpen(false)} open={open} height={60}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'center',

            // paddingTop: 12
          }}>
            <Tooltip title="Camera">
              <Button
                type="default"
                shape="circle"
                size="large"
                icon={<CameraOutlined />}
                onClick={openCamera}
              />
            </Tooltip>

            <Tooltip title="Gallery">
              <Button
                type="default"
                shape="circle"
                size="large"
                icon={<PictureOutlined />}
                onClick={openGallery}
              />
            </Tooltip>

            <Tooltip title="Google Drive">
              <Button
                type="default"
                shape="circle"
                size="large"
                icon={<CloudUploadOutlined />}
                onClick={openDrive}
              />
            </Tooltip>
          </div>
        </Drawer>
      </Space>
    </div>
  );
};

export default ImagePicker;
