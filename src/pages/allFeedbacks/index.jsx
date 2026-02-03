import React, { useMemo, useState } from "react";
import { Modal, Carousel } from "antd";
import { Image, Tag, Select, Button } from "antd";
import GoodSmileIcon from "../../assets/svg/goodSmile";
import BadSmileIcon from "../../assets/svg/badSmile";
import NeutralSmileIcon from "../../assets/svg/neutralIcon";
import QRModal from "../../components/modals/QRModal";
import DepartmentModal from "../../components/modals/DepartmentModal";
import { useAssignToMutation, useGetAllFeedbacksQuery, useGetEmployeesByBranchQuery, useUpdateFeedbackStatusMutation } from "../../services/feedbacks";
import { useGetDepartmentsQuery } from "../../services/departments";
import CommonTable from "../../components/commonTable";
import CustomPagination from "../../components/pagination";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import "./styles.scss";
import { useSelector } from "react-redux";
import StatusTabs from "../../components/statusTabs";
import { getColumns } from "./colums";



// Helper to determine sentiment from feedback (simple keyword-based)
function getSentiment(feedback) {
  if (!feedback) return "neutral";
  const text = feedback.toLowerCase();
  if (/(accha|good|excellent|awesome|best|satisfied|great|very good|nice|helpful|supportive|positive)/.test(text)) return "good";
  if (/(bura|bad|poor|worst|not good|disappointed|negative|rude|problem|issue|complain|complaint)/.test(text)) return "bad";
  return "neutral";
}

const mapFeedbackToRow = (fb, idx) => {
  // Check for assignTo structure
  let assignToId = undefined;
  let assignToName = undefined;
  
  if (fb.assignTo) {
    // Your feedback response shows assignTo._id = "696a0a777393b17225544396"
    // और assignTo.user._id = "696a0a777393b17225544390" (यह अलग है)
    // So we should use assignTo._id (not assignTo.user._id)
    
    if (fb.assignTo._id) {
      assignToId = fb.assignTo._id;
    }
    // If there's a user name, use it
    if (fb.assignTo.user && fb.assignTo.user.name) {
      assignToName = fb.assignTo.user.name;
    }
  }
  
  const feedbackText = fb.messageText || fb.feedback || fb.message || "-";
  return {
    key: fb._id || idx,
    ticketId: fb.ticketId || "-",
    department: fb.departmentId?.name || fb.department || "-",
    branch: fb.branchId?.name || fb.branch || "-",
    customerName: fb.customerName || fb.name || "-",
    mobileNumber: fb.mobileNumber || fb.phoneNumber || fb.phone || "-",
    email: fb.email || "-",
    feedback: feedbackText,
    sentiment: getSentiment(feedbackText),
    images: fb.images || [],
    staffBehavior: fb.staffBehavior || "-",
    gymHygiene: fb.gymHygiene || "-",
    dateTime: fb.dateTime ? new Date(fb.dateTime).toLocaleString() : (fb.createdAt ? new Date(fb.createdAt).toLocaleString() : "-"),
    status: fb.status || "-",
    assignToId: assignToId,
    assignToName: assignToName, // For display purposes
  };
};

const defaultVisibleColumns = getColumns(() => {}, () => {}, [], () => {}).reduce((acc, col) => {
  acc[col.key] = true;
  return acc;
}, {});

const AllFeedbacks = () => {
  const branchId = useSelector(state => state.branch.selectedBranch);
  const [searchText, setSearchText] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, msg: "" });
  const [imageModal, setImageModal] = useState({ open: false, images: [], index: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartmentsQuery();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, refetch } = useGetAllFeedbacksQuery({
    status: activeTab === 'all' ? undefined : activeTab,
    department: selectedDepartment || undefined,
    branchId: branchId || undefined,
    page,
    limit: pageSize,
  });
  const [assignTo] = useAssignToMutation();
  const { data: employeesData, isLoading: employeesLoading } = useGetEmployeesByBranchQuery(branchId);

  const feedbacks = useMemo(() => {
    if (!Array.isArray(data?.data)) return [];
    return data.data.map(mapFeedbackToRow);
  }, [data]);

  const employees = useMemo(() => {
    if (!Array.isArray(employeesData?.data)) return [];
    return employeesData.data;
  }, [employeesData]);

  const handleAssignTo = async (selectedValue, feedbackId) => {
    try {
      await assignTo({ assignTo: selectedValue, feedbackId }).unwrap();
    } catch (err) {
      // Optionally show error message
      console.error("Failed to assign employee:", err);
    }
  };

  // Tab counts from API response (array of objects)
  const statusTabs = useMemo(() => {
    if (Array.isArray(data?.counts)) {
      // Map API keys to display keys if needed
      return data.counts.map(tab => {
        let key = tab.key;
        if (key === 'in_process') key = 'in_progress';
        return { ...tab, key };
      });
    }
    // fallback (should not happen if API always returns counts)
    return [
      { key: "all", label: "All", count: 0 },
      { key: "pending", label: "Pending", count: 0 },
      { key: "in_progress", label: "In Progress", count: 0 },
      { key: "completed", label: "Completed", count: 0 },
    ];
  }, [data]);

  // Only search filter is frontend now
  const filteredFeedbacks = useMemo(() => {
    if (!searchText) return feedbacks;
    return feedbacks.filter(fb =>
      Object.values(fb).some(val =>
        typeof val === "string" && val.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [feedbacks, searchText]);

  const [updateFeedbackStatus] = useUpdateFeedbackStatusMutation();

  const handleStatusChange = async (status, feedbackId) => {
    try {
      await updateFeedbackStatus({ feedbackId, status }).unwrap();
    } catch (err) {
      // Optionally show error message
      console.error("Failed to update status:", err);
    }
  };

  const visibleCols = getColumns(
    row => setFeedbackModal({ open: true, msg: row.feedback }),
    (imgs, idx) => setImageModal({ open: true, images: imgs, index: idx }),
    employees,
    handleAssignTo,
    handleStatusChange
  ).filter(col => visibleColumns[col.key]);

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="all-feedbacks-page">
      <div className="header-section">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search feedbacks..."
        />
        <StatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={statusTabs}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 12 }}>
          <Select
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={Array.isArray(departmentsData?.data) ? departmentsData.data.filter(d => d.status === 'active').map(d => ({ label: d.name, value: d._id })) : []}
            placeholder="Select Department"
            className="select-department"
            allowClear
            loading={departmentsLoading}
            style={{ width: 180 }}
          />
          <Button className="create-dept-btn" style={{ fontWeight: 500 }} type="default" onClick={() => setDeptModalOpen(true)}>
            Create Department
          </Button>
          <Button className="generate-qr-btn" style={{ fontWeight: 500 }} onClick={() => setQrModalOpen(true)}>
            Create QR
          </Button>
          <ColumnVisibility
            columns={getColumns(() => {}, () => {}, [])}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>
      <div className="feedbacks-table-wrapper">
        <CommonTable
          columns={visibleCols}
          dataSource={filteredFeedbacks}
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
      </div>
      <QRModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      <DepartmentModal open={deptModalOpen} onClose={() => setDeptModalOpen(false)} />
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

export default AllFeedbacks;