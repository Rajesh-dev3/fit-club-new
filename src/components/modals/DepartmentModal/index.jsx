import React, { useState } from "react";
import { Modal, Input, Button, Table, Switch } from "antd";
import "./styles.scss";
import CommonTable from "../../commonTable";

import { message } from "antd";
import { useAddDepartmentMutation, useGetDepartmentsQuery, useToggleDepartmentStatusMutation } from "../../../services/departments";

const DepartmentModal = ({ open, onClose }) => {
  const [deptName, setDeptName] = useState("");
  const [addDepartment, { isLoading }] = useAddDepartmentMutation();
  const { data, isLoading: loadingDepartments, refetch } = useGetDepartmentsQuery();
  const [toggleDepartmentStatus, { isLoading: isToggling }] = useToggleDepartmentStatusMutation();

  const handleToggle = async (id) => {
    console.log("Toggling department with id:", id);
    try {
      await toggleDepartmentStatus({ id }).unwrap();
      refetch();
    } catch (err) {}
  };

  const columns = [
    {
      title: "Department",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (enabled) => (
        <span>{enabled ? "Enabled" : "Disabled"}</span>
      ),
    },
    {
      title: "Action",
      dataIndex: "enabled",
      key: "action",
      align: "center",
      render: (enabled, record) => (
        <Switch checked={enabled} loading={isToggling} onChange={() => handleToggle(record?._id)} />
      ),
    },
  ];



  const handleAdd = async () => {
    if (!deptName.trim()) {
      message.warning("Please enter department name");
      return;
    }
    try {
      await addDepartment({ name: deptName.trim() }).unwrap();
      setDeptName("");
      refetch();
    } catch (err) {}
  };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      closeIcon={<span style={{ fontSize: 28, fontWeight: 600 }}>&times;</span>}
      bodyStyle={{ padding: 0 }}
    >
      <div  className="department-modal-content">
        <div className="department-modal-title">
          Manage Departments
        </div>
        <div className="department-modal-input-row">
          <Input
            value={deptName}
            onChange={(e)=>setDeptName(e.target.value)}
            placeholder="Create Department"
            className="department-modal-input"
          />
          <Button
            type="primary"
            className="department-modal-add-btn"
            onClick={handleAdd}
          >
            +
          </Button>
        </div>
        <hr style={{borderWidth:"0.1px",marginBottom:"15px"}}/>
        <div className="department-modal-section-title">
          Existing Departments
        </div>
        <CommonTable
          columns={columns}
          dataSource={Array.isArray(data?.data) ? data?.data?.map((d, i) => ({
            ...d,
            key: d._id || i,
            status: d.status === 'active' ? 'Enabled' : 'Disabled',
            enabled: d.status === 'active'
          })) : []}
          loading={loadingDepartments}
          pagination={false}
          bordered={false}
          className="department-modal-table"
          rowClassName={() => "department-row"}
        />
      </div>
    </Modal>
  );
};


export default DepartmentModal;
