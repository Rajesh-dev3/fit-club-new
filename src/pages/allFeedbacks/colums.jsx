import { Select, Tag } from "antd";
import BadSmileIcon from "../../assets/svg/badSmile";
import GoodSmileIcon from "../../assets/svg/goodSmile";
import NeutralSmileIcon from "../../assets/svg/neutralIcon";
import { renderEmojiCell } from "./emojiRender";

export const getColumns = (onViewFeedback, onViewImages, employees = [], onAssignTo, onStatusChange) => [
  {
    title: "S.NO",
    dataIndex: "serial",
    key: "serial",
    align: "center",
    render: (_, __, idx) => idx + 1,
  },
  // Sentiment column removed. Emoji logic moved to Gym Hygiene and Staff Behavior below.
  { title: "Ticket Id", dataIndex: "ticketId", key: "ticketId" },
  { title: "Department", dataIndex: "department", key: "department" },
  { title: "Branch", dataIndex: "branch", key: "branch" },
  { title: "Customer Name", dataIndex: "customerName", key: "customerName" },
  { title: "Mobile Number", dataIndex: "mobileNumber", key: "mobileNumber" },
  { title: "Email", dataIndex: "email", key: "email" },
  {
    title: "Feedback",
    dataIndex: "feedback",
    key: "feedback",
    render: (text, row) => (
      <Tag color="blue" style={{ cursor: "pointer" }} onClick={() => onViewFeedback(row)}>
        View
      </Tag>
    ),
  },
  {
    title: "Images",
    dataIndex: "images",
    key: "images",
    render: (imgs, row) =>
      imgs && imgs.length ? (
        <Tag color="blue" style={{ cursor: "pointer" }} onClick={() => onViewImages(imgs, 0)}>
          View
        </Tag>
      ) : (
        "-"
      ),
  },
   { title: "Staff Behavior", dataIndex: "staffBehavior", key: "staffBehavior", render: (val) => renderEmojiCell(val, 'staffBehavior') },
  { title: "Gym Hygiene", dataIndex: "gymHygiene", key: "gymHygiene", render: (val) => renderEmojiCell(val, 'gymHygiene') },
  { title: "Date & Time", dataIndex: "dateTime", key: "dateTime" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status, row) => (
      <Select
        value={status}
        style={{ minWidth: 120 }}
        options={[
          { value: "pending", label: "Pending" },
          { value: "in_process", label: "In Process" },
          { value: "completed", label: "Completed" },
        ]}
        onChange={value => onStatusChange && onStatusChange(value, row.key)}
        disabled={false}
      />
    ),
  },
  {
    title: "Assign To",
    dataIndex: "assignToId",
    key: "assignTo",
    render: (assignToId, row) => {
      const employeeOptions = employees.map(emp => ({
        value: emp._id,
        label: emp.name
      }));
      const assignedEmployee = employees.find(emp => emp._id === assignToId);
      return (
        <Select
          value={assignedEmployee ? assignedEmployee._id : undefined}
          style={{ minWidth: 140 }}
          placeholder="Assign user"
          options={employeeOptions}
          onChange={(selectedValue) => {
            if (typeof onAssignTo === 'function' && selectedValue) {
              onAssignTo(selectedValue, row.key);
            }
          }}
          disabled={employees.length === 0}
          showSearch
          allowClear
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      );
    },
  },
];