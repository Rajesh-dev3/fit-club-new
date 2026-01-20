import React, { useMemo, useState } from "react";
import { Modal, Carousel, Button } from "antd";
import CommonTable from "../../../components/commonTable";
import { useGetFeedbacksByPhoneQuery } from "../../../services/feedbacks";
import CustomPagination from "../../../components/pagination";
import getColumns from "./columns";
import { useOutletContext } from "react-router-dom";

const mapFeedbackToRow = (fb, idx) => {
  let assignToId = undefined;
  let assignToName = undefined;
  if (fb.assignTo) {
    if (fb.assignTo._id) {
      assignToId = fb.assignTo._id;
    }
    if (fb.assignTo.user && fb.assignTo.user.name) {
      assignToName = fb.assignTo.user.name;
    }
  }
  return {
    key: fb._id || idx,
    ticketId: fb.ticketId || "-",
    department: fb.departmentId?.name || fb.department || "-",
    branch: fb.branchId?.name || fb.branch || "-",
    customerName: fb.customerName || fb.name || "-",
    mobileNumber: fb.mobileNumber || fb.phoneNumber || fb.phone || "-",
    email: fb.email || "-",
    feedback: fb.messageText || fb.feedback || fb.message || "-",
    images: fb.images || [],
    staffBehavior: fb.staffBehavior || "-",
    gymHygiene: fb.gymHygiene || "-",
    dateTime: fb.dateTime ? new Date(fb.dateTime).toLocaleString() : (fb.createdAt ? new Date(fb.createdAt).toLocaleString() : "-"),
    status: fb.status || "-",
    assignToId: assignToId,
    assignToName: assignToName,
  };
};


const UserFeedback = () => {
  // Get user data from parent Outlet context
  const { userData } = useOutletContext() || {};
  // Ensure mobileNumber is always a string (or empty string)
  let mobileNumber = userData?.phoneNumber;
  if (typeof mobileNumber !== 'string') mobileNumber = '';
  // Only log once if mobileNumber is defined
  if (mobileNumber) {
    console.log(mobileNumber, "userData");
  }
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Only pass the mobileNumber string to the hook
  const { data, isLoading } = useGetFeedbacksByPhoneQuery(
    mobileNumber,
    { skip: !mobileNumber }
  );
  const [feedbackModal, setFeedbackModal] = useState({ open: false, msg: "" });
  const [imageModal, setImageModal] = useState({ open: false, images: [], index: 0 });

  const feedbacks = useMemo(() => {
    if (!Array.isArray(data?.data)) return [];
    return data.data.map(mapFeedbackToRow);
  }, [data]);

  const handleViewFeedback = (row) => {
    setFeedbackModal({ open: true, msg: row.feedback });
  };

  const handleViewImages = (imgs, idx) => {
    setImageModal({ open: true, images: imgs, index: idx });
  };

  return (
    <div>
      <CommonTable
        columns={getColumns(handleViewFeedback, handleViewImages)}
        dataSource={feedbacks}
        loading={isLoading}
        rowKey="key"
        scroll={{ x: 1200 }}
      />
      <CustomPagination
        current={data?.pagination?.page || page}
        pageSize={data?.pagination?.limit || pageSize}
        total={data?.pagination?.total || 0}
        onPageChange={p => setPage(p)}
        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
      />
      <Modal
        open={feedbackModal.open}
        onCancel={() => setFeedbackModal({ open: false, msg: "" })}
        footer={null}
        centered
        title={null}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Feedback Message</div>
          <div style={{ fontSize: 17, color: '#444', textAlign: 'center', wordBreak: 'break-word', padding: '8px 0 24px' }}>{feedbackModal.msg}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button type="primary" onClick={() => setFeedbackModal({ open: false, msg: "" })}>
            OK
          </Button>
        </div>
      </Modal>
      <Modal
        open={imageModal.open}
        onCancel={() => setImageModal({ open: false, images: [], index: 0 })}
        footer={null}
        centered
        width={600}
        title={null}
        bodyStyle={{ padding: 0 }}
      >
        <Carousel
          initialSlide={imageModal.index}
          dots={true}
          style={{ width: '100%', textAlign: 'center', background: '#000', borderRadius: 12 }}
        >
          {imageModal.images.map((img, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <img src={img} alt={`slide-${i}`} style={{ maxHeight: 380, maxWidth: '100%', objectFit: 'contain', margin: '0 auto' }} />
            </div>
          ))}
        </Carousel>
      </Modal>
    </div>
  );
};

export default UserFeedback;