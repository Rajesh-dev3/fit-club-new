import React, { useState } from "react";
import { Modal, Select, Button, Spin } from "antd";
import { useGetBranchesQuery } from "../../services/branches";
import { useGenerateQrCodeMutation } from "../../services/qrCodes";
import "./qrModal.scss";

const QRModal = ({ open, onClose }) => {
  const [selectedBranch, setSelectedBranch] = useState();
  // Call branch API and get branches
  const { data, isLoading } = useGetBranchesQuery();
  const [generateQrCode, { data: qrData, isLoading: qrLoading }] = useGenerateQrCodeMutation();
  const [qrError, setQrError] = useState("");

  const handleGenerate = async () => {
    setQrError("");
    try {
      await generateQrCode(selectedBranch).unwrap();
    //   onClose();
    } catch (err) {
      setQrError("Failed to generate QR code");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      destroyOnHidden
      className="qr-modal"
      closeIcon={<span style={{ fontSize: 28 }}>&times;</span>}
    >
      <div className="qr-modal-title">Generate QR Code</div>
      <div className="qr-modal-field">
        <label className="qr-modal-label">Select Branch</label>
        <Select
          showSearch
          placeholder="Choose a branch"
          value={selectedBranch}
          onChange={setSelectedBranch}
          style={{ width: "100%", fontSize: 15, }}
          size="large"
          optionFilterProp="children"
          loading={isLoading}
        >
          {(data?.branches || data?.data)?.map((b) => (
            <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>
          ))}
        </Select>
      </div>
      <Button
        type="primary"
        className="qr-modal-generate-btn"
        disabled={!selectedBranch || qrLoading}
        onClick={handleGenerate}
      >
        {qrLoading ? <Spin size="small" /> : "Generate QR"}
      </Button>
      <div className="qr-modal-preview-block">
        <div className="qr-modal-preview-title">Live QR Preview</div>
        <div className="qr-modal-preview-box">
          {qrLoading ? (
            <Spin />
          ) : qrData && (qrData.qrCodeUrl || qrData.data?.qrCodeUrl) ? (
            <img src={qrData.qrCodeUrl || qrData.data.qrCodeUrl} alt="QR Code" style={{ maxWidth: 120, maxHeight: 120 }} />
          ) : (
            <span className="qr-modal-preview-placeholder">QR code will appear here</span>
          )}
        </div>
        {qrError && <div style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{qrError}</div>}
      </div>
    </Modal>
  );
};

export default QRModal;
