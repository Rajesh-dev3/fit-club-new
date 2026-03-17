import React, { useMemo, useEffect } from "react";
import { Form, Input, Select, Button, message, Checkbox, Spin } from "antd";
import { DeleteOutlined, HomeOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import "./styles.scss";
import { useGetBranchesQuery } from "../../services/branches";
import { useGetRolesQuery } from "../../services/role";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllTrainersRoute, Home } from "../../routes/routepath";
import { useGetTrainersDetailQuery, useUpdateTrainerMutation } from "../../services/trainer";
import { useNavigate, useParams } from "react-router-dom";

const EditTrainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: branchesData } = useGetBranchesQuery();
  const { data: rolesData } = useGetRolesQuery();
  const { data: trainerData, isLoading: isLoadingTrainer, error: trainerError } = useGetTrainersDetailQuery(id);
  const [updateTrainer, { isLoading: updating }] = useUpdateTrainerMutation();

  const branchOptions = useMemo(() => {
    if (!branchesData || !Array.isArray(branchesData.data)) return [];
    return branchesData.data.map((b) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

  const rolesOptions = useMemo(() => {
    if (rolesData && Array.isArray(rolesData.data) && rolesData.data.length) {
      return rolesData.data.map((r) => ({ label: r.name, value: r._id }));
    }
    return [];
  }, [rolesData]);

  const typeOptions = [
    { label: 'Personal Training', value: 'Personal Training' },
    { label: 'Pilates', value: 'Pilates' },
    { label: 'Therapy', value: 'Therapy' },
    { label: 'EMS', value: 'EMS' },
    { label: 'Paid Locker', value: 'Paid Locker' },
    { label: 'MMA', value: 'MMA' },
  ];

  // Populate form with trainer data
  useEffect(() => {
    if (trainerData && trainerData.data) {
      const data = trainerData.data;
      const user = data.user;
      
      form.setFieldsValue({
        coachName: user.name,
        trainerEmail: user.email,
        coachPhoneNumber: user.phoneNumber,
        yearsOfExperience: data.experience,
        type: data.specialization || [],
        role: user.roleId?._id,
        branchId: user.branchIds?.[0]?.branchId || user.branchIds?.[0]?._id,
        photo: data.photo,
        idType: data.idType,
        idNumber: data.idNumber,
        passportNumber: data.passportNumber,
        nationality: data.nationality,
        idFront: data.idFront,
        idBack: data.idBack,
        certificates: data.certifications ? data.certifications.map(cert => ({ title: cert })) : [],
      });
    }
  }, [trainerData, form]);

  const handleUpdateTrainer = async (values) => {
    const payload = {
      name: values.coachName,
      email: values.trainerEmail,
      phoneNumber: values.coachPhoneNumber,
      experience: values.yearsOfExperience,
      specialization: values.type || [],
      roleId: values.role || null,
      branchIds: values.branchId ? [values.branchId] : [],
      photo: values.photo,
      employeeType: 'coach',
      userType: 'coach',
      idType: values.idType,
      idNumber: values.idNumber,
      idFront: values.idFront,
      idBack: values.idBack,
      certificate: values.certificates ? values.certificates.map(cert => cert.title) : [],
    };

    if (values.passportNumber) payload.passportNumber = values.passportNumber;
    if (values.nationality) payload.nationality = values.nationality;

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });

    try {
      const res = await updateTrainer({ id, body: payload }).unwrap();
      if (res && res.success) {
        message.success('Trainer updated successfully');
        navigate(AllTrainersRoute);
      }
    } catch (err) {
      console.error('Update trainer failed', err);
      message.error('Failed to update trainer');
    }
  };

  if (isLoadingTrainer) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading trainer data...</p>
      </div>
    );
  }

  if (trainerError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>Error loading trainer data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="add-trainer-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Edit Trainer</h2>

        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home, icon: null },
            { label: "Trainer Management", to: Home },
            { label: "Edit Trainer" },
          ]}
        />
      </div>

      <Spin spinning={updating} tip="Updating trainer...">
        <Form form={form} layout="vertical" className="trainer-form" onFinish={handleUpdateTrainer}>
        <div className="row">
          <Form.Item label="Coach Name" name="coachName" rules={[{ required: true, message: 'Please enter coach name' }]}>
            <Input placeholder="Enter coach name" />
          </Form.Item>

          <Form.Item label="Trainer Email" name="trainerEmail" rules={[{ type: 'email', required: true, message: 'Please enter valid email' }]}>
            <Input placeholder="Enter trainer email" />
          </Form.Item>

          <Form.Item label="Coach Phone Number" name="coachPhoneNumber" rules={[{ required: true, message: 'Please enter phone number' }]}>
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item label="Years Of Experience" name="yearsOfExperience" rules={[{ required: true, message: 'Please enter years of experience' }]}>
            <Input type="number" placeholder="Enter years of experience" />
          </Form.Item>

          <Form.Item label="Select Branch" name="branchId" rules={[{ required: true, message: 'Please select branch' }]}>
            <Select placeholder="Select branch" options={branchOptions} showSearch optionFilterProp="label" allowClear />
          </Form.Item>

          <Form.Item label="Role" name="role">
            <Select placeholder="Select" showSearch optionFilterProp="children" options={rolesOptions} />
          </Form.Item>

          <Form.Item label="Upload Photo" name="photo">
            <ImagePicker form={form} name="photo" />
          </Form.Item>
        </div>

        <Form.Item label="Select Type" name="type" rules={[{ required: true, message: 'Please select at least one type' }]} className="full-width-field">
          <Checkbox.Group>
            <div className="checkbox-grid">
              {typeOptions.map(option => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>

        <div className="row">
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

        <div className="certificates-section">
          <h3 style={{ color: 'var(--sider-text)', marginBottom: 16 }}>Certificates</h3>
          <Form.List name="certificates">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="certificate-item">
                    <div className="row">
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="Certificate Name"
                        rules={[{ required: true, message: 'Please enter certificate name' }]}
                      >
                        <Input placeholder="Enter certificate name" />
                      </Form.Item>

                      <Button
                        type="link"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        style={{ marginTop: 30 }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Certificate
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
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
      </Spin>
    </div>
  );
};

export default EditTrainer;
