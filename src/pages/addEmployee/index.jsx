import React, { useMemo } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import "./styles.scss";
import { useGetRolesQuery } from "../../services/role";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { Home } from "../../routes/routepath";
import { useAddEmployeeMutation } from "../../services/employee";
import { useNavigate } from "react-router-dom";
import { AllEmployeesRoute } from "../../routes/routepath";

// using `options` prop for Selects

const AddEmployee = () => {
  const [form] = Form.useForm();
  const { data: rolesData } = useGetRolesQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const [triggerAddEmployee, { isLoading: adding }] = useAddEmployeeMutation();
  const navigate = useNavigate();
  // separate handler for adding employee (do not inline mutation inside JSX)
  const handleAddEmployee = async (values) => {
    // Build payload using only fields provided in the example payload; hardcode employeeType
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

    // Remove undefined / null empty fields so only provided fields are sent
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });

    const res = await triggerAddEmployee(payload).unwrap();
    if (res && res.success) {
      // message.success('Employee added successfully');
      form.resetFields();
      navigate(AllEmployeesRoute);
    }
  };

  const rolesOptions = useMemo(() => {
    if (rolesData && Array.isArray(rolesData.data) && rolesData.data.length) {
      return rolesData.data.map((r) => ({ label: r.name, value: r._id }));
    }
    return [
      
    ];
  }, [rolesData]);

  const branchOptions = useMemo(() => {
    if (!branchesData || !Array.isArray(branchesData.data)) return [];
    return branchesData.data.map((b) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

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
        <h2 style={{ margin: 0 }}>Add Employee</h2>

        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home, icon: null },
            { label: "EMPLOYEE MANAGEMENT", to: Home, icon: null },
            { label: "Add Employee" },
          ]}
        />
      </div>
     

      <Form form={form} layout="vertical" className="employee-form" onFinish={handleAddEmployee}>

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

          {/* Conditional ID inputs + ID images rendered together when idType selected */}
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

        {/* Note: ID images are rendered above inside the combined conditional block */}

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
          <Button className="delete-btn">
            <DeleteOutlined /> RESET
          </Button>

          <Button className="save-btn" type="primary" htmlType="submit" loading={adding}>SAVE</Button>
        </div>
      </Form>
    </div>
  );
};

export default AddEmployee;
