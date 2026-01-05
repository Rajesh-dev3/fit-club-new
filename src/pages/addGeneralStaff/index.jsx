import React, { useMemo } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import "./styles.scss";
import { useGetRolesQuery } from "../../services/role";
import { useAddGeneralStaffMutation, useGetGeneralStaffQuery, useStaffTypeQuery } from "../../services/generalStaff";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { Home, AllGeneralStaffRoute } from "../../routes/routepath";
import { useNavigate } from "react-router-dom";

const AddGeneralStaff = () => {
  const [form] = Form.useForm();
  const { data: staffTypeData } = useStaffTypeQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const [addGeneralStaff, { isLoading: adding }] = useAddGeneralStaffMutation();


  const navigate = useNavigate();
  const handleAddGeneralStaff = async (values) => {
    const payload = {
      name: values.name,
      phoneNumber: values.phone,
      staffTypeId: values.role || null, // role select sets staffTypeId
      employeeType: 'general-staff',
      address: values.address,
      idType: values.idType,
      idNumber: values.idNumber,
      idFront: values.idFront,
      idBack: values.idBack,
      branchIds: values.branchId,
      photo: values.photo,
      // email: values.email,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });

    const res = await addGeneralStaff(payload).unwrap();
    if (res && res.success) {
      message.success('General Staff added successfully');
      form.resetFields();

      navigate(AllGeneralStaffRoute);
    }
  };



  // Use staffTypeData for role options
  const rolesOptions = useMemo(() => {
    if (staffTypeData && Array.isArray(staffTypeData.data) && staffTypeData.data.length) {
      return staffTypeData.data.map((r) => ({ label: r.name, value: r._id }));
    }
    return [];
  }, [staffTypeData]);

  const branchOptions = useMemo(() => {
    if (!branchesData || !Array.isArray(branchesData.data)) return [];
    return branchesData.data.map((b) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

  return (
    <div className="general-staff-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Add General Staff</h2>

        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home, icon: null },
            { label: "EMPLOYEE MANAGEMENT", to: Home, icon: null },
            { label: "Add General Staff" },
          ]}
        />
      </div>

      <Form form={form} layout="vertical" className="general-staff-form" onFinish={handleAddGeneralStaff}>
        <div className="row">
          <Form.Item label="Staff Name" name="name">
            <Input placeholder="Staff Name" />
          </Form.Item>

          <Form.Item label="Phone No." name="phone">
            <Input placeholder="Phone No." />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input placeholder="Address" />
          </Form.Item>

          <Form.Item label="Select Role" name="role">
            <Select placeholder="Select Role" showSearch optionFilterProp="children" options={rolesOptions} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Upload Your Photo" name="photo">
            <ImagePicker form={form} name="photo" />
          </Form.Item>

          <Form.Item name="idType" label="ID Type">
            <Select placeholder="Select ID Type" options={[
              { label: 'Aadhar Card', value: 'aadhar' },
              { label: 'Passport', value: 'passport' },
              { label: 'Driving Licence', value: 'driving_license' },
              { label: 'PAN Card', value: 'pan' },
            ]} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.idType !== cur.idType}>
            {({ getFieldValue }) => {
              const idType = getFieldValue('idType');
              if (!idType) return null;

              const idField = (() => {
                if (idType === 'passport') {
                  return (
                    <>
                      <Form.Item name="passportNumber" label="Passport Number" rules={[{ required: true, message: 'Please enter passport number' }]}> 
                        <Input placeholder="Enter passport number" />
                      </Form.Item>

                      <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Please enter nationality' }]}> 
                        <Input placeholder="Enter nationality" />
                      </Form.Item>
                    </>
                  );
                }

                if (idType === 'aadhar') {
                  return (
                    <Form.Item name="idNumber" label="Aadhar Number" rules={[{ required: true, message: 'Please enter Aadhar number' }]}> 
                      <Input placeholder="Enter Aadhar number" />
                    </Form.Item>
                  );
                }

                if (idType === 'driving_license') {
                  return (
                    <Form.Item name="idNumber" label="Driving Licence Number" rules={[{ required: true, message: 'Please enter driving licence number' }]}> 
                      <Input placeholder="Enter driving licence number" />
                    </Form.Item>
                  );
                }

                if (idType === 'pan') {
                  return (
                    <Form.Item name="idNumber" label="PAN Number" rules={[{ required: true, message: 'Please enter PAN number' }]}> 
                      <Input placeholder="Enter PAN number" />
                    </Form.Item>
                  );
                }

                return (
                  <Form.Item name="idNumber" label="ID Number">
                    <Input placeholder="Enter ID number" />
                  </Form.Item>
                );
              })();

              return (
                <>
                  {idField}
                  <div className="row id-images-row">
                    <Form.Item name="idFront" label="ID Front">
                      <ImagePicker form={form} name="idFront" />
                    </Form.Item>

                    <Form.Item name="idBack" label="ID Back">
                      <ImagePicker form={form} name="idBack" />
                    </Form.Item>
                  </div>
                </>
              );
            }}
          </Form.Item>
        </div>

        <div className="branch-row">
          <Form.Item label="Select Branch(es)" name="branchId" className="branch-select">
            <Select
              mode="multiple"
              placeholder="Select Branch(es)"
              showSearch
              optionFilterProp="label"
              allowClear
              options={branchOptions}
            />
          </Form.Item>
        </div>

        <div className="footer-buttons">
          <Button className="delete-btn" onClick={() => form.resetFields()}>
            <DeleteOutlined /> RESET
          </Button>

          <Button className="save-btn" type="primary" htmlType="submit" loading={adding}>SAVE</Button>
        </div>
      </Form>
    </div>
  );
};

export default AddGeneralStaff;
