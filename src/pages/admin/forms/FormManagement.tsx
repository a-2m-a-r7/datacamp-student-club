/**
 * src/pages/admin/forms/FormManagement.tsx
 * Admin Sub-router for Form Management, Builder, and Responses
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormList } from './FormList';
import { FormBuilder } from './FormBuilder';
import { FormResponses } from './FormResponses';

export const FormManagement: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<FormList />} />
      <Route path="/new" element={<FormBuilder />} />
      <Route path="/builder/:id" element={<FormBuilder />} />
      <Route path="/:id/responses" element={<FormResponses />} />
    </Routes>
  );
};

export default FormManagement;
