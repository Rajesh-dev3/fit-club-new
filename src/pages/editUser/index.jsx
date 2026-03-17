import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Home as HomePath, AllUsersRoute } from "../../routes/routepath";
import { HomeOutlined } from "@ant-design/icons";
import countryStateList from "../../data/countryStateList.json";
import {
  ConfigProvider,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  message,
  Spin,
} from "antd";
import ImagePicker from "../../components/form/ImagePicker";
import PageBreadcrumb from "../../components/breadcrumb";
import "./styles.scss";
import { useTheme } from "../../context/ThemeContext";
import dayjs from "dayjs";
import { useUserDetailDataQuery, useUpdateUserMutation, useGetAttachUserListQuery } from "../../services/user";
import { useGetCountriesQuery } from "../../services/countries";
import { useGetBranchesQuery } from "../../services/branches";
import { useImageUploadMutation } from "../../services/imageService";

const { Title } = Typography;

const EditUser = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState({});
  const [form] = Form.useForm();
  const { id } = useParams();
  
  const [imageUplaoder, { data: imageUplaodResponse }] = useImageUploadMutation();
  const { data: getAttachUserList } = useGetAttachUserListQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const { data: userData, isLoading: isLoadingUser, error: userError } = useUserDetailDataQuery(id);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [attachMode, setAttachMode] = useState(false);
  const { data: countriesData } = useGetCountriesQuery();
  const [selectedCountry, setSelectedCountry] = useState(() => {
    try {
      return (typeof window !== 'undefined' && window?.localStorage?.getItem('selectedCountry')) || "IN";
    } catch (e) {
      return "IN";
    }
  });

  // attach users will be loaded from the API
  const { data: attachUsersData } = useGetAttachUserListQuery();
  const attachUserOptions = (attachUsersData && attachUsersData.users)
    ? attachUsersData.users.map((u) => ({ label: `${u.name} - ${u.phoneNumber}`, value: u.phoneNumber }))
    : [];

  // Define countryOptions and branchOptions before useEffect hooks that depend on them
  const countryOptions = useMemo(() => {
    if (!countriesData) return [];
    const opts = [];
    countriesData.forEach((c) => {
      const name = c?.name?.common || c.name || "";
      const flag = c?.flags?.png || c?.flags?.svg || null;
      const iso = (c?.cca2 || c?.cca3 || "").toUpperCase();
      const idd = c && c.idd;
      // compute a display dial code (e.g. +91) if present
      let dial = null;
      if (idd && idd.root && Array.isArray(idd.suffixes) && idd.suffixes.length) {
        dial = `${idd.root}${idd.suffixes[0]}`.replace(/\s+/g, "");
      } else if (idd && idd.root) {
        dial = `${idd.root}`.replace(/\s+/g, "");
      }

      // use ISO (cca2) as option value, keep dial for display
      if (iso) {
        opts.push({ labelText: `${name}${dial ? ` (${dial})` : ''}`, value: iso, flag, name, dial });
      }
    });
    const map = new Map();
    opts.forEach((o) => {
      if (!map.has(o.value)) map.set(o.value, o);
    });
    const deduped = Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return deduped;
  }, [countriesData]);

  const branchOptions = useMemo(() => {
    if (!branchesData || !branchesData.data) return [];
    return branchesData.data.map((b) => ({
      label: `${b.name} — ${b.branchArea || ''} (${b.branchId ?? b._id})`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

  const getCssVar = (name, fallback) =>
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;

  useEffect(() => {
    const colorPrimary = getCssVar("--accent", "#A6FF4D");
    const colorBgContainer = getCssVar("--card-bg", "#252528");
    const colorBgLayout = getCssVar("--bg", "#181A20");
    const colorText = getCssVar("--sider-text", "#ffffff");
    const colorBorder = getCssVar("--muted", "#444");
    const colorTextPlaceholder = getCssVar("--placeholder", "#aaa");

    setTokens({
      colorPrimary,
      colorBgContainer,
      colorBgLayout,
      colorText,
      colorBorder,
      colorTextPlaceholder,
    });
  }, [theme]);

  // Populate form with user data
  useEffect(() => {
    if (userData && userData.user) {
      const user = userData.user;
      const member = user.member || {};
      
      // Determine if user is in attach mode
      if (user.attachedToPhoneNumber || user.isAttached) {
        setAttachMode(true);
      }
      
      // Update selected country if available
      if (member.countryCode) {
        const countryCodeValue = member.countryCode.replace('+', '');
        // Find the country by dial code
        const foundCountry = countryOptions.find(c => c.dial === member.countryCode);
        if (foundCountry) {
          setSelectedCountry(foundCountry.value);
          try { 
            window.localStorage.setItem('selectedCountry', foundCountry.value); 
          } catch(e) {}
        }
      }

      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        countryCode: member.countryCode || "+91",
        alternativePhoneNumber: member.alternativePhoneNumber,
        address: member.address,
        age: member.age,
        dob: member.dob ? dayjs(member.dob) : null,
        idNumber: member.idNumber,
        idFront: member.idFront,
        idBack: member.idBack,
        photo: member.photo,
        gender: member.gender,
        work: member.work,
        stateName: member.stateName,
        zipCode: member.zipCode,
        nationality: member.nationality,
        emergencyCall: member.emergencyContactNumber,
        emergencyName: member.emergencyContactName,
        emergencyRelation: member.healthInfo?.emergencyContact?.relation,
        heardFrom: member.hearAbout,
        referredBy: member.referred,
        height: member.height,
        weight: member.weight,
        bmiMeasurement: member.bmiMeasurement,
        bmiNote: member.bmi,
        branchId: user.branchIds && user.branchIds.length > 0 ? (user.branchIds[0].branchId ?? user.branchIds[0]._id) : null,
        medicalHistory: member.medicalHistory,
        bloodGroup: member.healthInfo?.bloodGroup,
        maritalStatus: member.maritalStatus,
        anniversaryDate: member.anniversaryDate ? dayjs(member.anniversaryDate) : null,
        idType: member.idType,
        userType: user.userType || 'user',
        attachedToPhoneNumber: user.attachedToPhoneNumber,
        userMode: user.attachedToPhoneNumber || user.isAttached ? 'attach' : 'fresh',
        passportNumber: member.passportNumber,
        companyName: member.companyName,
        fitnessGoalPrimary: member.fitnessGoals?.primary,
        targetWeight: member.fitnessGoals?.targetWeight,
        fitnessNotes: member.fitnessGoals?.notes,
      });
    }
  }, [userData, form, countryOptions]);

  const onFinish = async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      phoneNumber: values.phoneNumber,
      branchIds: values.branchId ? [values.branchId] : [],
      
      dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
      age: values.age || null,
      gender: values.gender,
      address: values.address,
      stateName: values.stateName,
      zipCode: values.zipCode || null,
      nationality: values.nationality,
      maritalStatus: values.maritalStatus,
      anniversaryDate: values.anniversaryDate ? values.anniversaryDate.format('YYYY-MM-DD') : null,
      countryCode: values.countryCode || selectedCountry,
      alternativePhoneNumber: values.alternativePhoneNumber,
      
      photo: values.photo,
      height: values.height,
      weight: values.weight,
      bmi: values.bmiNote || null,
      bmiMeasurement: values.bmiMeasurement,
      medicalHistory: values.medicalHistory,
      
      idType: values.idType,
      idNumber: values.idNumber,
      idFront: values.idFront,
      idBack: values.idBack,
      passportNumber: values.passportNumber,
      
      emergencyContactName: values.emergencyName,
      emergencyContactNumber: values.emergencyCall,
      
      work: values.work,
      companyName: values.companyName,
      
      hearAbout: values.heardFrom || values.hearAbout,
      referred: values.referredBy || values.referred,
      canTransfer: false,
      delivered: "Undelivered",
      
      assessmentStatus: "pending",
      
      assignedTrainer: null,
      healthInfo: {
        bloodGroup: values.bloodGroup || null,
        medicalConditions: values.medicalHistory ? [values.medicalHistory] : [],
        allergies: [],
        emergencyContact: {
          name: values.emergencyName || null,
          relation: values.emergencyRelation || null,
          phoneNumber: values.emergencyCall || null,
        }
      },
      fitnessGoals: {
        primary: values.fitnessGoalPrimary || null,
        targetWeight: values.targetWeight || null,
        notes: values.fitnessNotes || null,
      },
      
      userType: values.userType || 'user',
      attachedToPhoneNumber: values.attachedToPhoneNumber || null,
    };

    // Remove null/undefined values
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    try {
      const res = await updateUser({ id, body: payload }).unwrap();
      console.log('Update user response:', res);
      // message.success('User updated successfully');
      navigate(AllUsersRoute);
    } catch (err) {
      console.error('Update user failed', err);
      // message.error('Failed to update user');
    }
  };

  // Loading state
  if (isLoadingUser) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading user data...</p>
      </div>
    );
  }

  // Error state
  if (userError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>Error loading user data. Please try again.</p>
      </div>
    );
  }

  return (
    <ConfigProvider theme={{ token: tokens }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Edit User</h2>

        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: HomePath, icon: null },
            { label: "User Management", to: HomePath },
            { label: "Edit User" },
          ]}
        />
      </div>

      {/* MAIN FORM WRAPPER */}
      <div className="page-edit-user">
        <Card
          style={{
            border: "none",
            margin: "0 auto",
            // background: "var(--card-bg)",
            color: "var(--sider-text)",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            {/* ==================================================
               SECTION : PERSONAL INFORMATION
            ================================================== */}
            <Title level={4} className="section-title">
              Personal Information
            </Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ type: "email", }]}
                >
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="gender" label="Gender">
                  <Select
                    placeholder="Select gender"
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="dob" label="Date of birth">
                  <DatePicker
                    style={{ width: "100%" }}
                    onChange={(date) => {
                      if (date) {
                        const age = dayjs().diff(date, "year");
                        form.setFieldsValue({ age });
                      } else {
                        form.setFieldsValue({ age: undefined });
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="age" label="Age (auto)">
                  <Input placeholder="Calculated automatically" disabled />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="maritalStatus" label="Marital Status" initialValue="unmarried">
                  <Select
                    options={[
                      { label: 'Unmarried', value: 'unmarried' },
                      { label: 'Married', value: 'married' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.maritalStatus !== currentValues.maritalStatus}>
                {({ getFieldValue }) => {
                  const ms = getFieldValue('maritalStatus');
                  if (ms === 'married') {
                    return (
                      <Col span={8}>
                        <Form.Item name="anniversaryDate" label="Anniversary Date" rules={[{ required: true, message: 'Please select anniversary date' }]}>
                          <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              <Col span={8}>
                <Form.Item name="stateName" label="State">
                  <Select
                    placeholder="Select state"
                    options={
                      countryStateList
                  }
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="address" label="Address">
                  <Input.TextArea rows={2} placeholder="Enter address" />
                </Form.Item>
              </Col>
            </Row>

            {/* ==================================================
               SECTION : CONTACT DETAILS
            ================================================== */}
            <Title level={4} className="section-title">
              Contact Details
            </Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="userMode"
                  label="User Mode"
                  initialValue="fresh"
                >
                  <Select
                    options={[
                      { label: "Fresh User", value: "fresh" },
                      { label: "Attach User", value: "attach" },
                    ]}
                    onChange={(val) => {
                      const isAttach = val === "attach";
                      setAttachMode(isAttach);
                      if (isAttach) {
                        form.setFieldsValue({ phoneNumber: undefined });
                      } else {
                        form.setFieldsValue({ attachedToPhoneNumber: undefined });
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                {attachMode ? (
                  <Form.Item name="attachedToPhoneNumber" label="Attach existing user">
                    <Select
                        showSearch
                        placeholder="Search user"
                        options={attachUserOptions}
                      />
                  </Form.Item>
                ) : (
                  <Form.Item label="Phone Number">
                    <div className="country-phone">
                      <Form.Item
                        name="countryCode"
                        noStyle
                        rules={[{ required: true, message: "Please select country code" }]}
                      >
                        <div className="cc-selected-wrapper">
                          {(() => {
                            const found = countryOptions.find((c) => c.value === selectedCountry);
                            if (found && found.flag) {
                              return (
                                <img src={found.flag} alt={found.name} className="cc-flag" />
                              );
                            }
                            return <div className="cc-flag-placeholder" />;
                          })()}

                          <Select
                            showSearch
                            placeholder="+91"
                            optionLabelProp="data-code"
                            dropdownClassName="country-code-dropdown"
                            bordered={false}
                            onChange={(val) => {
                              setSelectedCountry(val);
                              try { window.localStorage.setItem('selectedCountry', val); } catch(e){}
                            }}
                            filterOption={(input, option) => {
                              const children = option && option.children;
                              let txt = '';
                              if (!children) txt = '';
                              else if (typeof children === 'string') txt = children;
                              else if (children.props && children.props.children) {
                                const kids = children.props.children;
                                if (Array.isArray(kids)) {
                                  txt = kids.map((k) => (typeof k === 'string' ? k : (k.props && k.props.children ? (Array.isArray(k.props.children) ? k.props.children.join('') : k.props.children) : ''))).join(' ');
                                } else if (typeof kids === 'string') txt = kids;
                              }
                              const value = (option && option.value) || '';
                              return (txt + ' ' + value).toLowerCase().includes(input.toLowerCase());
                            }}
                            style={{ width:70,border:"none",paddingInline:0, }}
                          >
                            {countryOptions.map((co) => (
                              <Select.Option key={co.value} value={co.value} data-code={co.value}>
                                <span className="cc-option">
                                  {co.flag ? (
                                    <img src={co.flag} alt={co.name} style={{ width: 20, height: 14, objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }} />
                                  ) : null}
                                  {co.labelText}
                                </span>
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </Form.Item>

                      <Form.Item name="phoneNumber" noStyle rules={[{ required: true, message: 'Please enter phone number' }]}> 
                        <Input bordered={false} className="cc-input" placeholder="Enter phone number" />
                      </Form.Item>
                    </div>
                  </Form.Item>
                )}
              </Col>

              <Col span={8}>
                <Form.Item
                  name="alternativePhoneNumber"
                  label="Alternative Phone"
                >
                  <Input placeholder="Enter alternative phone" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="branchId" label="Branch">
                  <Select
                    placeholder="Select branch"
                    options={branchOptions}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="photo" label="Photo">
                  <ImagePicker form={form} name="photo" />
                </Form.Item>
              </Col>
            </Row>

            {/* ==================================================
               SECTION : IDENTITY DETAILS
            ================================================== */}
            <Title level={4} className="section-title">
              Identity Information
            </Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="idType" label="ID Type">
                  <Select
                    placeholder="Select ID type"
                    options={[
                      { label: "Aadhar", value: "aadhar" },
                      { label: "Driving Licence", value: "driving_license" },
                      { label: "Passport", value: "passport" },
                    ]}
                  />
                </Form.Item>
              </Col>

              {/* conditional ID fields based on selected idType */}
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.idType !== cur.idType}>
                {({ getFieldValue }) => {
                  const idType = getFieldValue('idType');
                  if (idType === 'passport') {
                    return (
                      <>
                        <Col span={8}>
                          <Form.Item name="passportNumber" label="Passport Number" rules={[{ required: true, message: 'Please enter passport number' }]}>
                            <Input placeholder="Enter passport number" />
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Please enter nationality' }]}>
                            <Input placeholder="Enter nationality" />
                          </Form.Item>
                        </Col>
                      </>
                    );
                  }

                  if (idType === 'aadhar') {
                    return (
                      <Col span={8}>
                        <Form.Item name="idNumber" label="Aadhar Number" rules={[{ required: true, message: 'Please enter Aadhar number' }]}>
                          <Input placeholder="Enter Aadhar number" />
                        </Form.Item>
                      </Col>
                    );
                  }

                  if (idType === 'driving_license') {
                    return (
                      <Col span={8}>
                        <Form.Item name="idNumber" label="Driving Licence Number" rules={[{ required: true, message: 'Please enter driving licence number' }]}>
                          <Input placeholder="Enter driving licence number" />
                        </Form.Item>
                      </Col>
                    );
                  }

                  // default: generic ID number field
                  return (
                    <Col span={8}>
                      <Form.Item name="idNumber" label="ID Number">
                        <Input placeholder="Enter ID number" />
                      </Form.Item>
                    </Col>
                  );
                }}
              </Form.Item>

              <Col span={8}>
                <Form.Item name="work" label="Designation">
                  <Input placeholder="Enter designation" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="companyName" label="Company Name">
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>

              {/* <Col span={8}>
                <Form.Item name="password" label="Password" rules={[{ min: 6, message: 'Password must be at least 6 characters' }] }>
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
              </Col> */}

              <Col span={8}>
                <Form.Item name="heardFrom" label="How did you hear about FitClub">
                  <Select
                    placeholder="Select source"
                    options={[
                      { label: 'Friend / Family', value: 'friend' },
                      { label: 'Social Media', value: 'social' },
                      { label: 'Google / Search', value: 'google' },
                      { label: 'Advertisement', value: 'ad' },
                      { label: 'Walk-in', value: 'walkin' },
                      { label: 'Other', value: 'other' },
                    ]}
                    allowClear
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="referredBy" label="Referred By">
                  <Input placeholder="Enter referrer name or code (optional)" />
                </Form.Item>
              </Col>
            </Row>

            {/* ==================================================
               SECTION : BMI & BODY METRICS
            ================================================== */}
            <Title level={4} className="section-title">
              Health & Body Metrics
            </Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="bmiMeasurement"
                  label="BMI Measurement"
                  initialValue="other"
                >
                  <Select
                    options={[
                      { label: "Standard (cm/kg)", value: "standardMeasure" },
                      { label: "Metric (m/kg)", value: "metricMeasure" },
                      { label: "Other", value: "other" },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) =>
                  prev.bmiMeasurement !== cur.bmiMeasurement
                }
              >
                {({ getFieldValue }) => {
                  const val = getFieldValue("bmiMeasurement");
                  if (val === "standardMeasure" || val === "metricMeasure") {
                    return (
                      <>
                        <Col span={8}>
                          <Form.Item
                            name="height"
                            label={val === "metric" ? "Height (m)" : "Height (cm)"}
                          >
                            <Input placeholder="Enter height" />
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item name="weight" label="Weight (kg)">
                            <Input placeholder="Enter weight" />
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item name="bmiNote" label="BMI Note">
                            <Input placeholder="BMI note" />
                          </Form.Item>
                        </Col>
                      </>
                    );
                  }
                  return null;
                }}
              </Form.Item>
              {/* Full width Medical History */}
              <Col span={24}>
                <Form.Item name="medicalHistory" label="Medical History">
                  <Input.TextArea rows={3} placeholder="Enter any relevant medical history (allergies, conditions, medications)" />
                </Form.Item>
              </Col>

            </Row>

            {/* ==================================================
               SECTION : EMERGENCY INFO
            ================================================== */}
            <Title level={4} className="section-title">
              Emergency Contact
            </Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="emergencyName" label="Contact Name">
                  <Input placeholder="Enter emergency contact name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="emergencyCall"
                  label="Contact Number"
                >
                  <Input placeholder="Enter emergency number" />
                </Form.Item>
              </Col>
            </Row>

         

            {/* BUTTONS */}
            <div style={{ textAlign: "right", marginTop: 24 }}>
              <Space>
                <Button className="reset-btn" onClick={() => form.resetFields()}>Reset</Button>

                <Button className="save-btn" type="primary" htmlType="submit" loading={isUpdating}>
                  Update
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default EditUser;
