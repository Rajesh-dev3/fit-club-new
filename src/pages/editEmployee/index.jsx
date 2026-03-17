import React, { useMemo, useEffect } from "react";
import { Form, Input, Select, Button, message, Spin } from "antd";
import { DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import "./styles.scss";
import { useGetRolesQuery } from "../../services/role";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { Home, AllEmployeesRoute } from "../../routes/routepath";
import { useGetEmployeeDetailQuery, useUpdateEmployeeMutation } from "../../services/employee";
import { useNavigate, useParams } from "react-router-dom";

const EditEmployee = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rolesData } = useGetRolesQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const { data: employeeData, isLoading: isLoadingEmployee, error: employeeError } = useGetEmployeeDetailQuery(id);
  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();

  const rolesOptions = useMemo(() => {
    if (rolesData && Array.isArray(rolesData.data) && rolesData.data.length) {
      return rolesData.data.map((r) => ({ label: r.name, value: r._id }));
    }
    return [];
  }, [rolesData]);

  const branchOptions = useMemo(() => {
    if (!branchesData || !Array.isArray(branchesData.data)) return [];
    return branchesData.data.map((b) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

  // Populate form with employee data
  useEffect(() => {
    if (employeeData && employeeData.data) {
      const employee = employeeData.data;
      const userInfo = employee.user || {};
      
      form.setFieldsValue({
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phoneNumber,
        role: userInfo.roleId?._id,
        gender: employee.gender,
        address: employee.address,
        nationality: employee.nationality,
        idType: employee.idType,
        idNumber: employee.idNumber,
        passportNumber: employee.passportNumber,
        idFront: employee.idFront,
        idBack: employee.idBack,
        height: employee.height,
        weight: employee.weight,
        branchId: userInfo.branchIds ? userInfo.branchIds.map(b => b.branchId || b._id) : [],
        photo: employee.photo,
      });
    }
  }, [employeeData, form]);

  const handleUpdateEmployee = async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      phoneNumber: values.phone,
      roleId: values.role || null,
      employeeType: 'employee',
      gender: values.gender,
      address: values.address,
      nationality: values.nationality,
      idType: values.idType,
      idNumber: values.idNumber,
      idFront: values.idFront,
      idBack: values.idBack,
      height: values.height,
      weight: values.weight,
      branchIds: values.branchId,
      photo: values.photo,
    };

    if (values.passportNumber) payload.passportNumber = values.passportNumber;

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });

    try {
      const res = await updateEmployee({ id, body: payload }).unwrap();
      if (res && res.success) {
        // message.success('Employee updated successfully');
        navigate(AllEmployeesRoute);
      }
    } catch (err) {
      console.error('Update employee failed', err);
      // message.error('Failed to update employee');
    }
  };

  if (isLoadingEmployee) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading employee data...</p>
      </div>
    );
  }

  if (employeeError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>Error loading employee data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="employee-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Edit Employee</h2>

        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home, icon: null },
            { label: "EMPLOYEE MANAGEMENT", to: Home, icon: null },
            { label: "Edit Employee" },
          ]}
        />
      </div>

      <Form form={form} layout="vertical" className="employee-form" onFinish={handleUpdateEmployee}>
        <div className="row">
          <Form.Item label="Employee Name" name="name">
            <Input placeholder="Employee Name" />
          </Form.Item>

          <Form.Item label="Employee Email" name="email">
            <Input placeholder="Employee Email" />
          </Form.Item>

          <Form.Item label="Phone No." name="phone">
            <Input placeholder="Phone No." />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input placeholder="Address" />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Upload Your Photo" name="photo">
            <ImagePicker form={form} name="photo" />
          </Form.Item>

          <Form.Item label="Role" name="role">
            <Select placeholder="Select" showSearch optionFilterProp="children" options={rolesOptions} />
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

          <Button className="save-btn" type="primary" htmlType="submit" loading={updating}>
            UPDATE
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditEmployee;
