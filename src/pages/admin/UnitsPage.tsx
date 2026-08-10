import { useState, useRef } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import Iconify from '../../components/iconify';
import { PageShell } from '../../sections/interoperability/components';
import UnitListTab from './units/UnitListTab';
import CertificateTab, { CertificateTabRef } from './units/CertificateTab';

export default function UnitsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const certTabRef = useRef<CertificateTabRef>(null);

  const handleOpenCertForUnit = (unitCode: string, unitName: string) => {
    setActiveTab(1);
    setTimeout(() => {
      certTabRef.current?.openCreateForUnit(unitCode, unitName);
    }, 100);
  };

  return (
    <PageShell
      title="Quản lý Đơn vị & Kết nối Chứng thư số"
      subtitle="Quản lý danh mục các đơn vị hành chính, kết nối liên thông và Chứng thư số PKI / Chữ ký số."
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Danh sách Đơn vị kết nối" icon={<Iconify icon="solar:buildings-2-bold" />} iconPosition="start" />
          <Tab label="Chứng thư số & Chữ ký số" icon={<Iconify icon="solar:shield-keyhole-bold" />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && <UnitListTab onOpenCertForUnit={handleOpenCertForUnit} />}

      <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
        <CertificateTab ref={certTabRef} />
      </Box>
    </PageShell>
  );
}
