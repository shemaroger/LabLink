import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  ArrowLeft, Download, RefreshCw,
  Users, FlaskConical, Activity,
  Stethoscope, Bell, Shield,
  CheckCircle, Clock, FileText,
  BarChart2,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  {
    id:          'general',
    label:       'General Report',
    description: 'Complete system overview — all modules, all data',
    icon:        BarChart2,
    color:       '#6b77c0',
    bg:          '#eeeffa',
  },
  {
    id:          'users',
    label:       'Staff Report',
    description: 'All registered staff users by role and activity',
    icon:        Users,
    color:       '#0891b2',
    bg:          '#e0f2fe',
  },
  {
    id:          'patients',
    label:       'Patients Report',
    description: 'All registered patients with demographics',
    icon:        Activity,
    color:       '#16a34a',
    bg:          '#dcfce7',
  },
  {
    id:          'results',
    label:       'Lab Results Report',
    description: 'Laboratory results by status and test type',
    icon:        FlaskConical,
    color:       '#7c3aed',
    bg:          '#ede9fe',
  },
  {
    id:          'triage',
    label:       'Triage Report',
    description: 'Triage assessments and urgency distribution',
    icon:        Clock,
    color:       '#ea580c',
    bg:          '#fff7ed',
  },
  {
    id:          'consultations',
    label:       'Consultations Report',
    description: 'Doctor consultations and diagnosis breakdown',
    icon:        Stethoscope,
    color:       '#d97706',
    bg:          '#fef3c7',
  },
];

const GeneralReport = () => {
  const navigate                        = useNavigate();
  const { user }                        = useAuth();
  const [loading, setLoading]           = useState(true);
  const [generating, setGenerating]     = useState(false);
  const [selectedType, setSelectedType] = useState('general');
  const [data, setData]                 = useState({
    users:         [],
    patients:      [],
    results:       [],
    triage:        [],
    consultations: [],
    notifications: [],
    auditLogs:     [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate:   '',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        usersRes, patientsRes, resultsRes,
        triageRes, consultationsRes,
        notificationsRes, auditRes,
      ] = await Promise.allSettled([
        api.get('/users/list/'),
        api.get('/patients/list/'),
        api.get('/results/list/'),
        api.get('/triage/list/'),
        api.get('/consultations/list/'),
        api.get('/notifications/list/'),
        api.get('/audit-logs/list/'),
      ]);
      setData({
        users:         usersRes.status         === 'fulfilled' ? usersRes.value.data         : [],
        patients:      patientsRes.status       === 'fulfilled' ? patientsRes.value.data       : [],
        results:       resultsRes.status        === 'fulfilled' ? resultsRes.value.data        : [],
        triage:        triageRes.status         === 'fulfilled' ? triageRes.value.data         : [],
        consultations: consultationsRes.status  === 'fulfilled' ? consultationsRes.value.data  : [],
        notifications: notificationsRes.status  === 'fulfilled' ? notificationsRes.value.data  : [],
        auditLogs:     auditRes.status          === 'fulfilled' ? auditRes.value.data          : [],
      });
    } catch { /* partial data fine */ }
    finally { setLoading(false); }
  };

  const fmtDate  = (d) => { try { return format(new Date(d), 'dd MMM yyyy, HH:mm'); } catch { return '—'; } };
  const fmtShort = (d) => { try { return format(new Date(d), 'dd MMM yyyy');         } catch { return '—'; } };

  // ── CSV export (admin data backup) ──
  const toCsv = (rows) => {
    if (!rows || rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const lines = [headers.join(',')];
    rows.forEach((row) => lines.push(headers.map((h) => escape(row[h])).join(',')));
    return lines.join('\n');
  };

  const downloadCsv = (filename, rows) => {
    const csv = toCsv(rows);
    if (!csv) return false;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  };

  const exportCsv = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const datasetMap = {
      users: data.users,
      patients: data.patients,
      results: data.results,
      triage: data.triage,
      consultations: data.consultations,
    };

    if (selectedType === 'general') {
      const exported = Object.entries(datasetMap)
        .filter(([, rows]) => rows && rows.length)
        .map(([name, rows]) => downloadCsv(`lablink-${name}-${today}.csv`, rows));
      if (!exported.some(Boolean)) toast.error('No data to export.');
      else toast.success('Exporting all datasets as CSV files.');
      return;
    }

    const rows = datasetMap[selectedType];
    if (!downloadCsv(`lablink-${selectedType}-${today}.csv`, rows)) {
      toast.error('No data to export for this report type.');
    } else {
      toast.success('CSV exported.');
    }
  };

  // ── Stats ──
  const stats = {
    totalUsers:         data.users.length,
    doctors:            data.users.filter((u) => u.role === 'doctor').length,
    nurses:             data.users.filter((u) => u.role === 'nurse').length,
    labStaff:           data.users.filter((u) => u.role === 'lab_staff').length,
    receptionists:      data.users.filter((u) => u.role === 'receptionist').length,
    admins:             data.users.filter((u) => u.role === 'admin' || u.role === 'hospital_admin').length,
    totalPatients:      data.patients.length,
    male:               data.patients.filter((p) => p.gender === 'male').length,
    female:             data.patients.filter((p) => p.gender === 'female').length,
    totalResults:       data.results.length,
    pending:            data.results.filter((r) => r.status === 'pending').length,
    processing:         data.results.filter((r) => r.status === 'processing').length,
    available:          data.results.filter((r) => r.status === 'available').length,
    reviewed:           data.results.filter((r) => r.status === 'reviewed').length,
    totalTriage:        data.triage.length,
    critical:           data.triage.filter((t) => t.urgency_level === 'critical').length,
    high:               data.triage.filter((t) => t.urgency_level === 'high').length,
    medium:             data.triage.filter((t) => t.urgency_level === 'medium').length,
    low:                data.triage.filter((t) => t.urgency_level === 'low').length,
    totalConsultations: data.consultations.length,
    provisional:        data.consultations.filter((c) => c.diagnosis_type === 'provisional').length,
    confirmed:          data.consultations.filter((c) => c.diagnosis_type === 'confirmed').length,
    referred:           data.consultations.filter((c) => c.diagnosis_type === 'referred').length,
    followUp:           data.consultations.filter((c) => c.diagnosis_type === 'follow_up').length,
    totalNotifications: data.notifications.length,
    totalAuditLogs:     data.auditLogs.length,
  };

  const currentType = REPORT_TYPES.find((r) => r.id === selectedType);

  // ── PDF sections per type ──
  const buildSections = () => {
    const summarySection = `
      <div class="section">
        <div class="section-title">Executive Summary</div>
        <div class="summary-box">
          ${[
            ['Total staff users',          stats.totalUsers],
            ['Total registered patients',  stats.totalPatients],
            ['Total laboratory results',   stats.totalResults],
            ['Total triage assessments',   stats.totalTriage],
            ['Total doctor consultations', stats.totalConsultations],
            ['Total notifications sent',   stats.totalNotifications],
            ['Total audit log entries',    stats.totalAuditLogs],
          ].map(([k, v]) => `
            <div class="summary-row">
              <span class="summary-key">${k}</span>
              <span class="summary-value">${v}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const usersSection = `
      <div class="section">
        <div class="section-title">Staff</div>
        <div class="stats-grid stats-6">
          ${[
            ['Total',         stats.totalUsers,    '#6b77c0'],
            ['Doctors',       stats.doctors,       '#0891b2'],
            ['Nurses',        stats.nurses,        '#16a34a'],
            ['Lab Staff',     stats.labStaff,      '#7c3aed'],
            ['Receptionists', stats.receptionists, '#d97706'],
            ['Admins',        stats.admins,        '#dc2626'],
          ].map(([l, v, c]) => `
            <div class="stat-box">
              <div class="stat-val" style="color:${c}">${v}</div>
              <div class="stat-label">${l}</div>
            </div>
          `).join('')}
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th>
            </tr>
          </thead>
          <tbody>
            ${data.users.slice(0, 30).map((u, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${u.first_name} ${u.last_name}</strong></td>
                <td>${u.email || '—'}</td>
                <td>${u.phone || '—'}</td>
                <td>
                  <span class="badge ${
                    u.role === 'doctor'          ? 'b-blue'   :
                    u.role === 'nurse'           ? 'b-green'  :
                    u.role === 'lab_staff'       ? 'b-purple' :
                    u.role === 'receptionist'    ? 'b-yellow' :
                    u.role === 'admin'           ? 'b-red'    :
                    u.role === 'hospital_admin'  ? 'b-red'    : 'b-gray'
                  }">${u.role?.replace('_', ' ')}</span>
                </td>
                <td>
                  <span class="badge ${u.is_active ? 'b-green' : 'b-gray'}">
                    ${u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>${fmtShort(u.created_at || u.date_joined)}</td>
              </tr>
            `).join('')}
            ${data.users.length > 30 ? `
              <tr><td colspan="7" style="text-align:center;font-style:italic;color:#6b7280;padding:10px;">
                ... and ${data.users.length - 30} more
              </td></tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;

    const patientsSection = `
      <div class="section">
        <div class="section-title">Patients</div>
        <div class="stats-grid stats-3">
          <div class="stat-box"><div class="stat-val" style="color:#6b77c0">${stats.totalPatients}</div><div class="stat-label">Total</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#2563eb">${stats.male}</div><div class="stat-label">Male</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#db2777">${stats.female}</div><div class="stat-label">Female</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Full Name</th><th>Gender</th>
              <th>Blood Group</th><th>Phone</th><th>Registered</th>
            </tr>
          </thead>
          <tbody>
            ${data.patients.slice(0, 30).map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${p.full_name || '—'}</strong></td>
                <td style="text-transform:capitalize">${p.gender || '—'}</td>
                <td><strong>${p.blood_group || '—'}</strong></td>
                <td>${p.phone || '—'}</td>
                <td>${fmtShort(p.created_at)}</td>
              </tr>
            `).join('')}
            ${data.patients.length > 30 ? `
              <tr><td colspan="6" style="text-align:center;font-style:italic;color:#6b7280;padding:10px;">
                ... and ${data.patients.length - 30} more
              </td></tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;

    const resultsSection = `
      <div class="section">
        <div class="section-title">Laboratory Results</div>
        <div class="stats-grid stats-4">
          <div class="stat-box"><div class="stat-val" style="color:#6b77c0">${stats.totalResults}</div><div class="stat-label">Total</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#ea580c">${stats.pending}</div><div class="stat-label">Pending</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#16a34a">${stats.available}</div><div class="stat-label">Available</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#7c3aed">${stats.reviewed}</div><div class="stat-label">Reviewed</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Patient</th><th>Test Name</th>
              <th>Type</th><th>Date</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.results.slice(0, 30).map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${r.patient?.full_name || '—'}</strong></td>
                <td>${r.test_name || '—'}</td>
                <td>${r.test_type_display || r.test_type || '—'}</td>
                <td>${fmtShort(r.test_date)}</td>
                <td>
                  <span class="badge ${
                    r.status === 'reviewed'   ? 'b-purple' :
                    r.status === 'available'  ? 'b-green'  :
                    r.status === 'processing' ? 'b-yellow' : 'b-gray'
                  }">${r.status || '—'}</span>
                </td>
              </tr>
            `).join('')}
            ${data.results.length > 30 ? `
              <tr><td colspan="6" style="text-align:center;font-style:italic;color:#6b7280;padding:10px;">
                ... and ${data.results.length - 30} more
              </td></tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;

    const triageSection = `
      <div class="section">
        <div class="section-title">Triage Assessments</div>
        <div class="stats-grid stats-4">
          <div class="stat-box"><div class="stat-val" style="color:#6b77c0">${stats.totalTriage}</div><div class="stat-label">Total</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#a21caf">${stats.critical}</div><div class="stat-label">Critical</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#dc2626">${stats.high}</div><div class="stat-label">High</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#d97706">${stats.medium}</div><div class="stat-label">Medium</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Patient</th><th>Nurse</th>
              <th>Chief Complaint</th><th>Urgency</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${data.triage.slice(0, 30).map((t, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${t.patient_name || '—'}</strong></td>
                <td>${t.nurse_name || '—'}</td>
                <td>${(t.chief_complaint || '—').slice(0, 60)}${(t.chief_complaint || '').length > 60 ? '...' : ''}</td>
                <td>
                  <span class="badge ${
                    t.urgency_level === 'critical' ? 'b-pink'   :
                    t.urgency_level === 'high'     ? 'b-red'    :
                    t.urgency_level === 'medium'   ? 'b-yellow' : 'b-green'
                  }">${t.urgency_level || '—'}</span>
                </td>
                <td>${fmtShort(t.created_at)}</td>
              </tr>
            `).join('')}
            ${data.triage.length > 30 ? `
              <tr><td colspan="6" style="text-align:center;font-style:italic;color:#6b7280;padding:10px;">
                ... and ${data.triage.length - 30} more
              </td></tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;

    const consultationsSection = `
      <div class="section">
        <div class="section-title">Consultations</div>
        <div class="stats-grid stats-4">
          <div class="stat-box"><div class="stat-val" style="color:#6b77c0">${stats.totalConsultations}</div><div class="stat-label">Total</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#d97706">${stats.provisional}</div><div class="stat-label">Provisional</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#16a34a">${stats.confirmed}</div><div class="stat-label">Confirmed</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#2563eb">${stats.referred}</div><div class="stat-label">Referred</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Patient</th><th>Doctor</th>
              <th>Diagnosis</th><th>Type</th><th>Follow-up</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${data.consultations.slice(0, 30).map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${c.patient_name || '—'}</strong></td>
                <td>${c.doctor_name || '—'}</td>
                <td>${(c.diagnosis || '—').slice(0, 45)}${(c.diagnosis || '').length > 45 ? '...' : ''}</td>
                <td>
                  <span class="badge ${
                    c.diagnosis_type === 'confirmed'   ? 'b-green'  :
                    c.diagnosis_type === 'provisional' ? 'b-yellow' :
                    c.diagnosis_type === 'referred'    ? 'b-blue'   : 'b-purple'
                  }">${(c.diagnosis_type || '—').replace('_', ' ')}</span>
                </td>
                <td>${c.follow_up_date ? fmtShort(c.follow_up_date) : '—'}</td>
                <td>${fmtShort(c.created_at)}</td>
              </tr>
            `).join('')}
            ${data.consultations.length > 30 ? `
              <tr><td colspan="7" style="text-align:center;font-style:italic;color:#6b7280;padding:10px;">
                ... and ${data.consultations.length - 30} more
              </td></tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;

    switch (selectedType) {
      case 'users':         return usersSection;
      case 'patients':      return patientsSection;
      case 'results':       return resultsSection;
      case 'triage':        return triageSection;
      case 'consultations': return consultationsSection;
      default:
        return summarySection + usersSection + patientsSection +
               resultsSection + triageSection + consultationsSection;
    }
  };

  const generatePDF = () => {
    setGenerating(true);
    const win = window.open('', '_blank');
    const now = new Date();

    const html = `
      <!DOCTYPE html><html>
      <head>
        <title>LabLink — ${currentType?.label}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body {
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
            line-height:1.5; color:#111827; background:white;
            padding:24px; font-size:13px;
          }
          .container { max-width:1100px; margin:0 auto; }

          /* ── Header ── */
          .header {
            background:linear-gradient(135deg,#9ba4d4 0%,#6b77c0 100%);
            color:white; padding:32px;
          }
          .header-inner {
            display:flex; justify-content:space-between; align-items:center;
          }
          .brand {
            display:flex; align-items:center; gap:20px;
          }
          .logo-box {
            background:white; padding:10px; border-radius:12px;
            box-shadow:0 4px 12px rgba(0,0,0,0.15); flex-shrink:0;
          }
          .logo-box img { height:64px; width:auto; display:block; }
          .brand-text h1 {
            font-size:28px; font-weight:800; letter-spacing:-0.025em;
          }
          .brand-text p { font-size:12px; opacity:0.85; margin-top:3px; }
          .report-meta { text-align:right; }
          .report-meta h2 { font-size:20px; font-weight:700; margin-bottom:6px; }
          .report-meta p  { font-size:12px; opacity:0.9; margin-top:2px; }
          .report-type-badge {
            display:inline-block;
            background:rgba(255,255,255,0.2);
            border:1px solid rgba(255,255,255,0.3);
            border-radius:8px; padding:4px 12px;
            font-size:12px; font-weight:600; margin-bottom:8px;
          }

          /* ── Section ── */
          .section { margin:28px 0; }
          .section-title {
            font-size:15px; font-weight:700; color:#111827;
            border-bottom:3px solid #6b77c0; padding-bottom:8px;
            margin-bottom:16px; text-transform:uppercase; letter-spacing:0.05em;
          }

          /* ── Stats grids ── */
          .stats-grid { display:grid; gap:12px; margin-bottom:8px; }
          .stats-3 { grid-template-columns:repeat(3,1fr); }
          .stats-4 { grid-template-columns:repeat(4,1fr); }
          .stats-6 { grid-template-columns:repeat(6,1fr); }
          .stat-box {
            border:1px solid #e5e7eb; border-radius:8px;
            padding:14px 12px; text-align:center;
          }
          .stat-val   { font-size:26px; font-weight:800; line-height:1; }
          .stat-label { font-size:11px; color:#6b7280; margin-top:4px; }

          /* ── Summary box ── */
          .summary-box {
            background:#f9fafb; border:1px solid #e5e7eb;
            border-radius:8px; padding:16px; margin-bottom:16px;
          }
          .summary-row {
            display:flex; justify-content:space-between;
            font-size:12px; padding:5px 0;
            border-bottom:1px solid #f3f4f6;
          }
          .summary-row:last-child { border-bottom:none; }
          .summary-key   { color:#6b7280; }
          .summary-value { font-weight:600; color:#111827; }

          /* ── Table ── */
          table { width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; }
          thead th {
            background:#f3f4f6; padding:10px 8px; text-align:left;
            font-weight:600; color:#6b7280; text-transform:uppercase;
            font-size:10px; letter-spacing:0.05em;
            border-bottom:2px solid #e5e7eb;
          }
          tbody td { padding:9px 8px; border-bottom:1px solid #f3f4f6; }
          tbody tr:last-child td { border-bottom:none; }
          tbody tr:nth-child(even) { background:#fafafa; }

          /* ── Badges ── */
          .badge {
            display:inline-block; padding:2px 8px; border-radius:99px;
            font-size:10px; font-weight:600; text-transform:capitalize;
          }
          .b-purple { background:#eeeffa; color:#6b77c0; }
          .b-green  { background:#dcfce7; color:#16a34a; }
          .b-yellow { background:#fef3c7; color:#d97706; }
          .b-red    { background:#fee2e2; color:#dc2626; }
          .b-pink   { background:#fae8ff; color:#a21caf; }
          .b-blue   { background:#dbeafe; color:#2563eb; }
          .b-gray   { background:#f3f4f6; color:#6b7280; }

          /* ── Footer ── */
          .footer {
            margin-top:48px; padding:24px;
            background:#f9fafb; border-top:1px solid #e5e7eb;
          }
          .sig-grid {
            display:grid; grid-template-columns:1fr 1fr;
            gap:60px; margin-top:16px;
          }
          .sig-line  {
            border-bottom:2px solid #6b77c0;
            margin:40px 0 10px; width:80%;
          }
          .sig-label {
            font-weight:700; font-size:11px;
            text-transform:uppercase; color:#6b77c0; letter-spacing:0.05em;
          }
          .sig-info  { font-size:11px; color:#6b7280; margin-top:6px; }
          .copyright {
            text-align:center; font-size:10px; color:#9ca3af;
            margin-top:24px; padding-top:16px; border-top:1px solid #e5e7eb;
          }

          @media print { body { padding:0; } }
        </style>
      </head>
      <body>
        <div class="container">

          <!-- ── Header ── -->
          <div class="header">
            <div class="header-inner">
              <div class="brand">
                <div class="logo-box">
                  <img
                    src="${window.location.origin}/logo.png"
                    alt="LabLink Logo"
                    onerror="this.style.display='none'"
                  />
                </div>
                <div class="brand-text">
                  <h1>LabLink</h1>
                  <p>Web-Based Laboratory Results Management System</p>
                  <p>TechQuest Ltd · Kigali, Rwanda</p>
                </div>
              </div>
              <div class="report-meta">
                <div class="report-type-badge">${currentType?.label}</div>
                <h2>${currentType?.label}</h2>
                <p>Generated: ${fmtDate(now)}</p>
                <p>By: ${user?.first_name} ${user?.last_name}</p>
                <p>Period: ${dateRange.startDate || 'All time'} – ${dateRange.endDate || 'Present'}</p>
              </div>
            </div>
          </div>

          <!-- ── Content ── -->
          <div style="padding:0;">
            ${buildSections()}
          </div>

          <!-- ── Footer ── -->
          <div class="footer">
            <div class="sig-grid">
              <div>
                <div class="sig-line"></div>
                <div class="sig-label">Report Generated By</div>
                <div class="sig-info">
                  ${user?.first_name} ${user?.last_name}<br>
                  ${user?.role?.toUpperCase()}<br>
                  ${fmtDate(now)}
                </div>
              </div>
              <div>
                <div class="sig-line"></div>
                <div class="sig-label">Approved By</div>
                <div class="sig-info">
                  System Administrator<br>
                  TechQuest Ltd<br>
                  Date: _________________
                </div>
              </div>
            </div>
            <div class="copyright">
              <p>This report is confidential and intended for internal use only.</p>
              <p>© ${now.getFullYear()} LabLink — TechQuest Ltd, Kigali, Rwanda. All rights reserved.</p>
            </div>
          </div>

        </div>
      </body></html>
    `;

    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); setGenerating(false); }, 600);
  };

  // ── Shared styles ──
  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const statBox = (value, label, color) => (
    <div key={label} style={{ ...card, textAlign: 'center', padding: '16px' }}>
      <p style={{ fontSize: '28px', fontWeight: 800, color, margin: 0, lineHeight: 1 }}>
        {loading ? '—' : value}
      </p>
      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, marginTop: '4px' }}>
        {label}
      </p>
    </div>
  );

  const renderTable = (headers, rows) => (
    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} style={{
                  padding: '12px 14px', fontSize: '11px', fontWeight: 600,
                  color: '#9ca3af', textAlign: 'left', backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} style={{
                  padding: '32px', textAlign: 'center',
                  color: '#9ca3af', fontSize: '13px',
                }}>
                  No data available
                </td>
              </tr>
            ) : rows.map((cells, i) => (
              <tr
                key={i}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{ transition: 'background-color 0.15s' }}
              >
                {cells.map((cell, j) => (
                  <td key={j} style={{
                    padding: '12px 14px', fontSize: '13px', color: '#374151',
                    borderBottom: '1px solid #f9fafb', verticalAlign: 'middle',
                  }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Inline preview per type ──
  const renderPreview = () => {
    switch (selectedType) {

      case 'users':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Staff',   value: stats.totalUsers,    color: '#6b77c0' },
                { label: 'Doctors',       value: stats.doctors,       color: '#0891b2' },
                { label: 'Nurses',        value: stats.nurses,        color: '#16a34a' },
                { label: 'Lab Staff',     value: stats.labStaff,      color: '#7c3aed' },
                { label: 'Receptionists', value: stats.receptionists, color: '#d97706' },
                { label: 'Admins',        value: stats.admins,        color: '#dc2626' },
              ].map(({ label, value, color }) => statBox(value, label, color))}
            </div>
            {renderTable(
              ['#', 'Full Name', 'Email', 'Role', 'Joined'],
              data.users.slice(0, 8).map((u, i) => [
                i + 1,
                <strong>{u.first_name} {u.last_name}</strong>,
                u.email,
                <RoleBadge role={u.role} />,
                fmtShort(u.created_at || u.date_joined),
              ])
            )}
          </>
        );

      case 'patients':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Patients', value: stats.totalPatients, color: '#6b77c0' },
                { label: 'Male',           value: stats.male,          color: '#2563eb' },
                { label: 'Female',         value: stats.female,        color: '#db2777' },
              ].map(({ label, value, color }) => statBox(value, label, color))}
            </div>
            {renderTable(
              ['#', 'Full Name', 'Gender', 'Blood Group', 'Phone', 'Registered'],
              data.patients.slice(0, 8).map((p, i) => [
                i + 1,
                <strong>{p.full_name}</strong>,
                <span style={{ textTransform: 'capitalize' }}>{p.gender || '—'}</span>,
                <strong>{p.blood_group || '—'}</strong>,
                p.phone || '—',
                fmtShort(p.created_at),
              ])
            )}
          </>
        );

      case 'results':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total',      value: stats.totalResults, color: '#6b77c0' },
                { label: 'Pending',    value: stats.pending,      color: '#ea580c' },
                { label: 'Processing', value: stats.processing,   color: '#d97706' },
                { label: 'Available',  value: stats.available,    color: '#16a34a' },
                { label: 'Reviewed',   value: stats.reviewed,     color: '#7c3aed' },
              ].map(({ label, value, color }) => statBox(value, label, color))}
            </div>
            {renderTable(
              ['#', 'Patient', 'Test Name', 'Type', 'Date', 'Status'],
              data.results.slice(0, 8).map((r, i) => [
                i + 1,
                <strong>{r.patient?.full_name || '—'}</strong>,
                r.test_name,
                r.test_type_display || r.test_type || '—',
                fmtShort(r.test_date),
                <StatusPill status={r.status} />,
              ])
            )}
          </>
        );

      case 'triage':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total',    value: stats.totalTriage, color: '#6b77c0' },
                { label: 'Critical', value: stats.critical,    color: '#a21caf' },
                { label: 'High',     value: stats.high,        color: '#dc2626' },
                { label: 'Medium',   value: stats.medium,      color: '#d97706' },
                { label: 'Low',      value: stats.low,         color: '#16a34a' },
              ].map(({ label, value, color }) => statBox(value, label, color))}
            </div>
            {renderTable(
              ['#', 'Patient', 'Nurse', 'Chief Complaint', 'Urgency', 'Date'],
              data.triage.slice(0, 8).map((t, i) => [
                i + 1,
                <strong>{t.patient_name || '—'}</strong>,
                t.nurse_name || '—',
                (t.chief_complaint || '—').slice(0, 40) +
                  ((t.chief_complaint || '').length > 40 ? '...' : ''),
                <UrgencyPill level={t.urgency_level} />,
                fmtShort(t.created_at),
              ])
            )}
          </>
        );

      case 'consultations':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total',       value: stats.totalConsultations, color: '#6b77c0' },
                { label: 'Provisional', value: stats.provisional,        color: '#d97706' },
                { label: 'Confirmed',   value: stats.confirmed,          color: '#16a34a' },
                { label: 'Referred',    value: stats.referred,           color: '#2563eb' },
                { label: 'Follow-up',   value: stats.followUp,           color: '#a21caf' },
              ].map(({ label, value, color }) => statBox(value, label, color))}
            </div>
            {renderTable(
              ['#', 'Patient', 'Doctor', 'Diagnosis', 'Type', 'Date'],
              data.consultations.slice(0, 8).map((c, i) => [
                i + 1,
                <strong>{c.patient_name || '—'}</strong>,
                c.doctor_name || '—',
                (c.diagnosis || '—').slice(0, 35) +
                  ((c.diagnosis || '').length > 35 ? '...' : ''),
                <DiagnosisPill type={c.diagnosis_type} />,
                fmtShort(c.created_at),
              ])
            )}
          </>
        );

      default: // general
        return (
          <>
            {/* Executive summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Staff Users',   value: stats.totalUsers,         color: '#6b77c0', icon: Users        },
                { label: 'Patients',      value: stats.totalPatients,      color: '#16a34a', icon: Activity     },
                { label: 'Lab Results',   value: stats.totalResults,       color: '#7c3aed', icon: FlaskConical },
                { label: 'Triage',        value: stats.totalTriage,        color: '#ea580c', icon: Clock        },
                { label: 'Consultations', value: stats.totalConsultations, color: '#d97706', icon: Stethoscope  },
                { label: 'Notifications', value: stats.totalNotifications, color: '#0891b2', icon: Bell         },
                { label: 'Audit Logs',    value: stats.totalAuditLogs,     color: '#6b7280', icon: Shield       },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ ...card, padding: '16px', textAlign: 'center' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: '#eeeffa', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px',
                  }}>
                    <Icon style={{ width: '18px', height: '18px', color: '#6b77c0' }} />
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 800, color, margin: 0, lineHeight: 1 }}>
                    {loading ? '—' : value}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, marginTop: '4px' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Staff breakdown */}
            <div style={{ ...card, marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0, marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #eeeffa' }}>
                Staff by Role
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '10px' }}>
                {[
                  { label: 'Doctors',       value: stats.doctors,       color: '#0891b2' },
                  { label: 'Nurses',        value: stats.nurses,        color: '#16a34a' },
                  { label: 'Lab Staff',     value: stats.labStaff,      color: '#7c3aed' },
                  { label: 'Receptionists', value: stats.receptionists, color: '#d97706' },
                  { label: 'Admins',        value: stats.admins,        color: '#dc2626' },
                ].map(({ label, value, color }) => statBox(value, label, color))}
              </div>
            </div>

            {/* Results breakdown */}
            <div style={{ ...card, marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0, marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #eeeffa' }}>
                Lab Results by Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '10px' }}>
                {[
                  { label: 'Pending',    value: stats.pending,    color: '#ea580c' },
                  { label: 'Processing', value: stats.processing, color: '#d97706' },
                  { label: 'Available',  value: stats.available,  color: '#16a34a' },
                  { label: 'Reviewed',   value: stats.reviewed,   color: '#7c3aed' },
                ].map(({ label, value, color }) => statBox(value, label, color))}
              </div>
            </div>

            {/* Triage breakdown */}
            <div style={{ ...card, marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0, marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #eeeffa' }}>
                Triage by Urgency Level
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '10px' }}>
                {[
                  { label: 'Critical', value: stats.critical, color: '#a21caf' },
                  { label: 'High',     value: stats.high,     color: '#dc2626' },
                  { label: 'Medium',   value: stats.medium,   color: '#d97706' },
                  { label: 'Low',      value: stats.low,      color: '#16a34a' },
                ].map(({ label, value, color }) => statBox(value, label, color))}
              </div>
            </div>

            {/* Consultations breakdown */}
            <div style={{ ...card, marginBottom: '0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0, marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #eeeffa' }}>
                Consultations by Diagnosis Type
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '10px' }}>
                {[
                  { label: 'Provisional', value: stats.provisional, color: '#d97706' },
                  { label: 'Confirmed',   value: stats.confirmed,   color: '#16a34a' },
                  { label: 'Referred',    value: stats.referred,    color: '#2563eb' },
                  { label: 'Follow-up',   value: stats.followUp,    color: '#a21caf' },
                ].map(({ label, value, color }) => statBox(value, label, color))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#c5c9e8',
      fontFamily: 'Inter, sans-serif', padding: '24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
          borderRadius: '16px', padding: '24px 28px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap',
          gap: '16px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '8px', padding: '8px 12px',
                color: 'white', cursor: 'pointer', fontSize: '13px',
              }}
            >
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              Back
            </button>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0 }}>
                {currentType?.label}
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0, marginTop: '2px' }}>
                {currentType?.description}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="date" value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer' }}
            />
            <input
              type="date" value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer' }}
            />
            <button
              onClick={fetchAll}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white', fontWeight: 600, fontSize: '13px',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Refresh
            </button>
            <button
              onClick={generatePDF}
              disabled={generating || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', backgroundColor: 'white', color: '#6b77c0',
                fontWeight: 700, fontSize: '13px', borderRadius: '10px', border: 'none',
                cursor: generating || loading ? 'not-allowed' : 'pointer',
                opacity: generating || loading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <Download style={{ width: '14px', height: '14px' }} />
              {generating ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={exportCsv}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white', fontWeight: 700, fontSize: '13px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <FileText style={{ width: '14px', height: '14px' }} />
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Report type selector ── */}
        <div style={{ ...card, marginBottom: '24px', padding: '20px' }}>
          <p style={{
            fontSize: '12px', fontWeight: 600, color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            margin: 0, marginBottom: '14px',
          }}>
            Select Report Type
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '10px',
          }}>
            {REPORT_TYPES.map((type) => {
              const Icon     = type.icon;
              const isActive = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                    border: isActive ? `2px solid ${type.color}` : '2px solid #f3f4f6',
                    backgroundColor: isActive ? type.bg : '#f9fafb',
                    transition: 'all 0.15s ease', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = type.color;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = '#f3f4f6';
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    backgroundColor: isActive ? type.color : '#e5e7eb',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}>
                    <Icon style={{
                      width: '16px', height: '16px',
                      color: isActive ? 'white' : '#6b7280',
                    }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px', fontWeight: 600,
                      color: isActive ? type.color : '#374151',
                      margin: 0,
                    }}>
                      {type.label}
                    </p>
                    <p style={{
                      fontSize: '10px', color: '#9ca3af',
                      margin: 0, marginTop: '1px', lineHeight: 1.3,
                    }}>
                      {type.description}
                    </p>
                  </div>
                  {isActive && (
                    <CheckCircle style={{
                      width: '14px', height: '14px',
                      color: type.color, marginLeft: 'auto', flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Preview content ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: '120px', backgroundColor: '#ffffff',
                borderRadius: '16px', opacity: 0.6,
              }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {renderPreview()}
          </div>
        )}

        {/* ── Footer note ── */}
        <div style={{ ...card, padding: '14px 20px', textAlign: 'center', marginTop: '16px' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
            Showing preview data. Click{' '}
            <strong style={{ color: '#6b77c0' }}>Download PDF</strong>{' '}
            to generate a complete printable report with full data tables and signature fields.
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, marginTop: '4px' }}>
            {fmtDate(new Date())} · {user?.first_name} {user?.last_name} ({user?.role})
          </p>
        </div>

      </div>
    </div>
  );
};

// ── Small badge components ──
const RoleBadge = ({ role }) => {
  const s = {
    doctor:       { bg: '#dbeafe', color: '#1e40af' },
    nurse:        { bg: '#dcfce7', color: '#16a34a' },
    lab_staff:    { bg: '#ede9fe', color: '#7c3aed' },
    receptionist: { bg: '#fef3c7', color: '#d97706' },
    admin:          { bg: '#fee2e2', color: '#dc2626' },
    hospital_admin: { bg: '#fee2e2', color: '#dc2626' },
    patient:        { bg: '#eeeffa', color: '#6b77c0' },
  }[role] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {role?.replace('_', ' ')}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const s = {
    pending:    { bg: '#fff7ed', color: '#ea580c' },
    processing: { bg: '#fef3c7', color: '#d97706' },
    available:  { bg: '#dcfce7', color: '#16a34a' },
    reviewed:   { bg: '#eeeffa', color: '#6b77c0' },
  }[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const UrgencyPill = ({ level }) => {
  const s = {
    critical: { bg: '#fae8ff', color: '#a21caf' },
    high:     { bg: '#fee2e2', color: '#dc2626' },
    medium:   { bg: '#fef3c7', color: '#d97706' },
    low:      { bg: '#dcfce7', color: '#16a34a' },
  }[level] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {level}
    </span>
  );
};

const DiagnosisPill = ({ type }) => {
  const s = {
    provisional: { bg: '#fef3c7', color: '#d97706' },
    confirmed:   { bg: '#dcfce7', color: '#16a34a' },
    referred:    { bg: '#dbeafe', color: '#2563eb' },
    follow_up:   { bg: '#fae8ff', color: '#a21caf' },
  }[type] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {type?.replace('_', ' ')}
    </span>
  );
};

export default GeneralReport;