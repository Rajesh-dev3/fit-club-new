import React from 'react';
import { Layout, Drawer } from 'antd';
import SiderComponent from '../../components/sider';
import MainHeader from '../../components/mainHeader'; 
import { Outlet } from 'react-router-dom';

const { Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <Layout style={{ width: "100vw", height: "100vh", background: 'var(--bg)' }}>
      
      {/* SIDEBAR - Desktop */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          width={260}
          collapsedWidth={70}
          trigger={null}
          style={{ background: 'var(--sider-bg)' }}
        >
          <SiderComponent collapsed={collapsed} />
        </Sider>
      )}

      {/* SIDEBAR - Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={toggleMobileDrawer}
          open={mobileDrawerOpen}
          width={260}
          styles={{
            body: { padding: 0, background: 'var(--sider-bg)' },
            header: { display: 'none' }
          }}
          className="mobile-sidebar-drawer"
        >
          <SiderComponent collapsed={false} />
        </Drawer>
      )}

      {/* RIGHT SIDE LAYOUT */}
      <Layout>
        
        <MainHeader 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          toggleMobileDrawer={toggleMobileDrawer}
        />

        <Content style={{ padding: 15,overflowY:"scroll", background: 'var(--content-bg)', color: 'var(--sider-text)' }}>
          <Outlet />
        </Content>

      </Layout>
    </Layout>
  );
};

export default MainLayout;
