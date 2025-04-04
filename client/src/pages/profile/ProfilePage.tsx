import React from 'react';
import { Layout } from '@/components/layout/Layout';
import StudentProfile from '@/components/profile/StudentProfile';

export default function ProfilePage() {
  return (
    <Layout title="Profile">
      <StudentProfile />
    </Layout>
  );
}